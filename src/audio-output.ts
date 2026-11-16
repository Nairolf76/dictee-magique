type AudioConstructor = new (options?: AudioContextOptions) => AudioContext;
export interface AudioContextHost {
  AudioContext?: AudioConstructor;
  webkitAudioContext?: AudioConstructor;
}
export interface AudioOutputDiagnostics {
  sanitizedSamples: number;
  protectedNodes: number;
  unprotectedNodes: number;
  constructorHookActive: boolean;
}
export interface AudioOutputProtection {
  /** Restore constructor properties only; protection stays on the captured context. */
  restore(): void;
  getContext(): AudioContext | undefined;
  diagnostics(): AudioOutputDiagnostics;
}

/**
 * Install immediately before loading MAME and restore on startup failure/readiness.
 * Its legacy PCM shim can fill an empty output block with NaN. Capture only the
 * first context constructed in this startup window, then immediately restore the
 * global constructors. Only this context's ScriptProcessor callbacks are guarded,
 * including nodes recreated by MAME's watchdog. Finite PCM is never rewritten.
 * This guards output integrity; it does not diagnose or fix every iOS interruption.
 */
export function installAudioOutputProtection(host: AudioContextHost = window): AudioOutputProtection {
  let context: AudioContext | undefined;
  let active = true, sanitizedSamples = 0, protectedNodes = 0, unprotectedNodes = 0;
  const originals: {key: keyof AudioContextHost; descriptor?: PropertyDescriptor; wrapped: AudioConstructor}[] = [];
  const seen = new WeakSet<ScriptProcessorNode>();

  function restore() {
    active = false;
    for (const {key, descriptor, wrapped} of originals) {
      // Do not overwrite an unrelated replacement installed after this helper.
      if (host[key] !== wrapped) continue;
      if (descriptor) Object.defineProperty(host, key, descriptor);
      else Reflect.deleteProperty(host, key);
    }
  }

  function protectNode(node: ScriptProcessorNode) {
    if (seen.has(node)) return node;
    seen.add(node);
    let prototype: object | null = node;
    let descriptor: PropertyDescriptor | undefined;
    while (prototype && !descriptor) {
      descriptor = Object.getOwnPropertyDescriptor(prototype, 'onaudioprocess');
      prototype = Object.getPrototypeOf(prototype);
    }
    // Native WebIDL event handlers have an accessor setter. Leave unsupported
    // objects alone rather than replacing native event dispatch with a JS field.
    const setNativeHandler = descriptor?.set;
    if (!setNativeHandler) {unprotectedNodes++; return node;}
    let handler = node.onaudioprocess;
    const assign = (value: typeof handler) => {
      handler = value;
      setNativeHandler.call(node, typeof value === 'function' ? function(this: ScriptProcessorNode, event: AudioProcessingEvent) {
        try {return value.call(this, event);}
        finally {
          const output = event.outputBuffer;
          for (let channel = 0; channel < output.numberOfChannels; channel++) {
            const samples = output.getChannelData(channel);
            for (let frame = 0; frame < samples.length; frame++) {
              if (!Number.isFinite(samples[frame])) {samples[frame] = 0; sanitizedSamples++;}
            }
          }
        }
      } : null);
    };
    try {
      Object.defineProperty(node, 'onaudioprocess', {configurable: true, enumerable: true, get: () => handler, set: assign});
      assign(handler);
      protectedNodes++;
    } catch {unprotectedNodes++;}
    return node;
  }

  function protectContext(target: AudioContext) {
    const factories = target as unknown as Record<string, unknown>;
    for (const name of ['createScriptProcessor', 'createJavaScriptNode']) {
      const original = factories[name];
      if (typeof original !== 'function') continue;
      try {
        Object.defineProperty(target, name, {configurable: true, writable: true, value: function(this: AudioContext, ...args: number[]) {
          const node = Reflect.apply(original, this, args) as ScriptProcessorNode;
          return this === target ? protectNode(node) : node;
        }});
      } catch {unprotectedNodes++;}
    }
  }

  const wrappers = new Map<AudioConstructor, AudioConstructor>();
  for (const key of ['AudioContext', 'webkitAudioContext'] as const) {
    const original = host[key];
    if (typeof original !== 'function') continue;
    const descriptor = Object.getOwnPropertyDescriptor(host, key);
    let wrapped = wrappers.get(original);
    if (!wrapped) {
      wrapped = new Proxy(original, {construct(ctor, args, newTarget) {
        const created = Reflect.construct(ctor, args, newTarget) as AudioContext;
        if (active && !context) {
          context = created;
          restore();
          protectContext(created);
        }
        return created;
      }});
      wrappers.set(original, wrapped);
    }
    try {
      Object.defineProperty(host, key, descriptor && !descriptor.configurable
        ? {...descriptor, value: wrapped}
        : {configurable: true, enumerable: descriptor?.enumerable ?? true, writable: true, value: wrapped});
      originals.push({key, descriptor, wrapped});
    } catch { /* A non-writable constructor is left untouched. */ }
  }
  if (!originals.length) active = false;
  return {
    restore,
    getContext: () => context,
    diagnostics: () => ({sanitizedSamples, protectedNodes, unprotectedNodes, constructorHookActive: active}),
  };
}
