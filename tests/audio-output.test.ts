import {test} from 'node:test';
import assert from 'node:assert/strict';
import {installAudioOutputProtection, type AudioContextHost} from '../src/audio-output.js';

type Handler = ((this: ScriptProcessorNode, event: AudioProcessingEvent) => unknown) | null;
class Processor {
  private nativeHandler: Handler = null;
  get onaudioprocess() {return this.nativeHandler;}
  set onaudioprocess(handler: Handler) {this.nativeHandler = handler;}
  connect() {}
  disconnect() {}
  render(channels: Float32Array[]) {
    const event = {outputBuffer: {numberOfChannels: channels.length, getChannelData: (index: number) => channels[index]}};
    return this.nativeHandler?.call(this as unknown as ScriptProcessorNode, event as unknown as AudioProcessingEvent);
  }
}
class Context {
  readonly nodes: Processor[] = [];
  readonly options: unknown;
  constructor(options?: unknown) {this.options = options;}
  createScriptProcessor(..._args: number[]) {const node = new Processor(); this.nodes.push(node); return node;}
}
const asHost = (host: object) => host as AudioContextHost;

test('empty legacy output becomes finite silence; native handler identity/this are preserved', () => {
  const host = {AudioContext: Context};
  const protection = installAudioOutputProtection(asHost(host));
  const context = new host.AudioContext({sampleRate: 44100});
  assert.equal(host.AudioContext, Context);
  assert.equal(protection.getContext(), context);
  assert.deepEqual(context.options, {sampleRate: 44100});
  const processor = context.createScriptProcessor(4096, 0, 2);
  const left = new Float32Array(4096), right = new Float32Array(4096);
  const legacyEmptyRing: Handler = function(event) {
    assert.equal(this, processor);
    // Exact legacy underrun operation: idx=44100-1 exceeds a 4096-frame channel.
    for (let frame = 0; frame < 4096; frame++) {
      event.outputBuffer.getChannelData(0)[frame] = left[44099];
      event.outputBuffer.getChannelData(1)[frame] = right[44099];
    }
  };
  processor.onaudioprocess = legacyEmptyRing;
  assert.equal(processor.onaudioprocess, legacyEmptyRing);
  processor.render([left, right]);
  assert.ok(left.every(value => Object.is(value, 0)));
  assert.ok(right.every(value => Object.is(value, 0)));
  assert.deepEqual(protection.diagnostics(), {sanitizedSamples: 8192, protectedNodes: 1, unprotectedNodes: 0, constructorHookActive: false});
  processor.onaudioprocess = null;
  left.fill(.5); processor.render([left, right]);
  assert.ok(left.every(value => value === .5));
});

test('finite PCM remains byte-identical, including signed zero, extremes and subnormals', () => {
  const host = {AudioContext: Context};
  const protection = installAudioOutputProtection(asHost(host));
  const context = new host.AudioContext(), processor = context.createScriptProcessor(4096, 0, 2);
  const source = new Float32Array([0, -0, 1, -1, .125, -.75, 3.4028234663852886e38, -3.4028234663852886e38, 1.401298464324817e-45, -1.401298464324817e-45]);
  const channels = [new Float32Array(4096), new Float32Array(4096)];
  processor.onaudioprocess = function(event) {
    for (let channel = 0; channel < 2; channel++) {
      const samples = event.outputBuffer.getChannelData(channel);
      for (let frame = 0; frame < samples.length; frame++) samples[frame] = source[(frame + channel) % source.length];
    }
  };
  const expected = channels.map((_, channel) => Float32Array.from({length: 4096}, (_, frame) => source[(frame + channel) % source.length]));
  processor.render(channels);
  for (let channel = 0; channel < 2; channel++) assert.deepEqual(Buffer.from(channels[channel].buffer), Buffer.from(expected[channel].buffer));
  assert.equal(protection.diagnostics().sanitizedSamples, 0);
});

test('mixed bad samples are zeroed individually without clipping or silencing finite neighbours', () => {
  const host = {AudioContext: Context};
  const protection = installAudioOutputProtection(asHost(host));
  const context = new host.AudioContext(), processor = context.createScriptProcessor();
  processor.onaudioprocess = event => {
    event.outputBuffer.getChannelData(0).set([.25, NaN, -.5, Infinity, -Infinity, -0, 2]);
    return false;
  };
  const output = new Float32Array(7);
  assert.equal(processor.render([output]), false);
  assert.deepEqual(Array.from(output), [.25, 0, -.5, 0, 0, -0, 2]);
  assert.equal(protection.diagnostics().sanitizedSamples, 3);
});

test('only captured context is protected; watchdog replacements remain protected', () => {
  const host = {AudioContext: Context, webkitAudioContext: Context};
  const before = Object.getOwnPropertyDescriptors(host);
  const protection = installAudioOutputProtection(asHost(host));
  const captured = new host.webkitAudioContext();
  assert.deepEqual(Object.getOwnPropertyDescriptors(host), before);
  const callback: Handler = event => event.outputBuffer.getChannelData(0).fill(NaN);
  const first = captured.createScriptProcessor(), replacement = captured.createScriptProcessor();
  first.onaudioprocess = callback; first.onaudioprocess = null; first.disconnect();
  replacement.onaudioprocess = callback;
  const repaired = new Float32Array(3); replacement.render([repaired]);
  assert.deepEqual(Array.from(repaired), [0, 0, 0]);
  const unrelated = new host.AudioContext(), other = unrelated.createScriptProcessor();
  other.onaudioprocess = callback;
  const untouched = new Float32Array(3); other.render([untouched]);
  assert.ok(untouched.every(Number.isNaN));
  assert.equal(protection.getContext(), captured);
  assert.equal(protection.diagnostics().protectedNodes, 2);
  protection.restore(); protection.restore();
  assert.deepEqual(Object.getOwnPropertyDescriptors(host), before);
});

test('restoring before initialization leaves later contexts alone and preserves subsequent replacements', () => {
  const host = {AudioContext: Context};
  const before = Object.getOwnPropertyDescriptor(host, 'AudioContext');
  const protection = installAudioOutputProtection(asHost(host));
  protection.restore();
  assert.deepEqual(Object.getOwnPropertyDescriptor(host, 'AudioContext'), before);
  const context = new host.AudioContext();
  assert.equal(protection.getContext(), undefined);
  assert.equal(Object.hasOwn(context, 'createScriptProcessor'), false);
  const again = installAudioOutputProtection(asHost(host));
  class LaterContext extends Context {}
  host.AudioContext = LaterContext;
  again.restore();
  assert.equal(host.AudioContext, LaterContext);
});

test('legacy prefixed constructor/createJavaScriptNode works without native AudioContext', () => {
  class LegacyContext {
    createJavaScriptNode() {return new Processor();}
  }
  const host = {webkitAudioContext: LegacyContext};
  const protection = installAudioOutputProtection(asHost(host));
  const context = new host.webkitAudioContext();
  assert.equal(host.webkitAudioContext, LegacyContext);
  const processor = context.createJavaScriptNode();
  processor.onaudioprocess = event => event.outputBuffer.getChannelData(0).fill(NaN);
  const output = new Float32Array(2); processor.render([output]);
  assert.deepEqual(Array.from(output), [0, 0]);
  assert.equal(protection.diagnostics().sanitizedSamples, 2);
});
