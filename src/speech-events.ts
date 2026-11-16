type VoiceEvents = Partial<Pick<SpeechSynthesis, 'addEventListener' | 'removeEventListener' | 'onvoiceschanged'>>;
type LegacyHook = { callbacks: Set<() => void>; previous: SpeechSynthesis['onvoiceschanged']; dispatch: (event: Event) => void };
const legacyHooks = new WeakMap<VoiceEvents, LegacyHook>();

/** iOS 15 exposes speechSynthesis without the EventTarget methods. */
export function onVoicesChanged(synthesis: VoiceEvents | undefined, refresh: () => void): () => void {
  if (!synthesis) return () => {};
  if (typeof synthesis.addEventListener === 'function') {
    synthesis.addEventListener('voiceschanged', refresh);
    return () => synthesis.removeEventListener?.('voiceschanged', refresh);
  }
  let hook = legacyHooks.get(synthesis);
  if (!hook) {
    const callbacks = new Set<() => void>();
    const previous = synthesis.onvoiceschanged ?? null;
    const dispatch = (event: Event) => {
      previous?.call(synthesis as SpeechSynthesis, event);
      for (const callback of callbacks) callback();
    };
    hook = { callbacks, previous, dispatch };
    legacyHooks.set(synthesis, hook);
    synthesis.onvoiceschanged = dispatch;
  }
  const current = hook;
  current.callbacks.add(refresh);
  return () => {
    current.callbacks.delete(refresh);
    if (!current.callbacks.size) {
      if (synthesis.onvoiceschanged === current.dispatch) synthesis.onvoiceschanged = current.previous;
      legacyHooks.delete(synthesis);
    }
  };
}
