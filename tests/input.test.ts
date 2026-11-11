import { test } from 'node:test';
import assert from 'node:assert/strict';
import { InputController } from '../src/input.js';
function fixture() {
  const events: number[][] = [];
  return { events, input: new InputController((...args) => events.push(args)) };
}
test('key repeat does not generate repeated presses', () => {
  const {input,events}=fixture(); input.press('a',0,1); input.press('a',0,1); input.release('a');
  assert.deepEqual(events,[[0,1,1],[0,1,0]]);
});
test('keyboard and touch share a key until both release', () => {
  const {input,events}=fixture(); input.press('keyboard',0,1); input.press('pointer',0,1); input.release('keyboard');
  assert.deepEqual(events,[[0,1,1]]); input.release('pointer'); assert.deepEqual(events,[[0,1,1],[0,1,0]]);
});
test('blur/reset releases all keys once', () => {
  const {input,events}=fixture(); input.press('a',0,1); input.press('b',0,2); input.releaseAll(); input.releaseAll();
  assert.deepEqual(events,[[0,1,1],[0,2,1],[0,1,0],[0,2,0]]);
});
test('pointer cancellation followed by lost capture is idempotent', () => {
  const {input,events}=fixture(); input.press('pointer:7',7,8); input.release('pointer:7'); input.release('pointer:7');
  assert.deepEqual(events,[[7,8,1],[7,8,0]]);
});
