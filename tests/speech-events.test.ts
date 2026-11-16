import { test } from 'node:test';
import assert from 'node:assert/strict';
import { onVoicesChanged } from '../src/speech-events.js';

test('iOS 15 speech object without EventTarget notifies both voice selectors', () => {
  const calls: string[] = [];
  const source = { onvoiceschanged: (() => { calls.push('existing'); }) as ((event: Event) => void) | null };
  const previous = source.onvoiceschanged;
  const stopA = onVoicesChanged(source, () => calls.push('original'));
  const stopB = onVoicesChanged(source, () => calls.push('practice'));
  source.onvoiceschanged!(new Event('voiceschanged'));
  assert.deepEqual(calls, ['existing', 'original', 'practice']);
  calls.length = 0;
  stopA(); source.onvoiceschanged!(new Event('voiceschanged'));
  assert.deepEqual(calls, ['existing', 'practice']);
  stopB(); assert.equal(source.onvoiceschanged, previous);
});

test('native voice event subscription is removed on cleanup', () => {
  const source = new EventTarget(); let calls = 0;
  const stop = onVoicesChanged(source, () => calls++);
  source.dispatchEvent(new Event('voiceschanged')); stop();
  source.dispatchEvent(new Event('voiceschanged'));
  assert.equal(calls, 1);
});

test('an absent speech API does not block application startup', () => {
  assert.doesNotThrow(() => onVoicesChanged(undefined, () => assert.fail())());
});
