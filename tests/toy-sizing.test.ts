import {test} from 'node:test';
import assert from 'node:assert/strict';
import {setupToySizing} from '../src/toy-sizing.js';

test('legacy sizing follows content width, coalesces updates and cleans up', t => {
  const originals = new Map<string, PropertyDescriptor | undefined>();
  const replace = (name: string, value: unknown) => {
    originals.set(name, Object.getOwnPropertyDescriptor(globalThis, name));
    Object.defineProperty(globalThis, name, {configurable: true, writable: true, value});
  };
  t.after(() => {for (const [name, descriptor] of originals) {if (descriptor) Object.defineProperty(globalThis,name,descriptor); else Reflect.deleteProperty(globalThis,name);}});
  const events = new EventTarget();
  const frames = new Map<number, FrameRequestCallback>();
  let nextFrame = 0, resized = () => {}, disconnected = false, writes = 0;
  const values = new Map([['--toy-unit','3px']]);
  const toy = {clientWidth: 500, style: {
    getPropertyValue: (name: string) => values.get(name) || '',
    getPropertyPriority: () => '',
    setProperty: (name: string, value: string) => {writes++; values.set(name,value);},
    removeProperty: (name: string) => values.delete(name),
  }};
  replace('CSS',{supports: () => false});
  replace('window',events); replace('document',events);
  replace('getComputedStyle',() => ({paddingLeft:'20px',paddingRight:'30px'}));
  replace('requestAnimationFrame',(callback: FrameRequestCallback) => {frames.set(++nextFrame,callback); return nextFrame;});
  replace('cancelAnimationFrame',(id: number) => frames.delete(id));
  replace('ResizeObserver',class {constructor(callback: () => void) {resized=callback;} observe() {} disconnect() {disconnected=true;}});
  const flush = () => {for(const [id, callback] of [...frames]) {frames.delete(id); callback(0);}};
  const cleanup = setupToySizing(toy as unknown as HTMLElement);
  assert.equal(values.get('--toy-unit'),'4.5px');
  resized(); events.dispatchEvent(new Event('resize')); events.dispatchEvent(new Event('fullscreenchange'));
  assert.equal(frames.size,1); flush(); assert.equal(writes,1);
  toy.clientWidth=350; resized(); flush();
  assert.equal(values.get('--toy-unit'),'3px'); assert.equal(writes,2);
  toy.clientWidth=0; resized(); flush(); assert.equal(writes,2);
  resized(); cleanup();
  assert.equal(frames.size,0); assert.equal(disconnected,true);
  assert.equal(values.get('--toy-unit'),'3px');
  events.dispatchEvent(new Event('resize')); assert.equal(frames.size,0);
});

test('modern browsers are left untouched', () => {
  const descriptor=Object.getOwnPropertyDescriptor(globalThis,'CSS');
  Object.defineProperty(globalThis,'CSS',{configurable:true,value:{supports: () => true}});
  try {assert.doesNotThrow(() => setupToySizing({} as HTMLElement)());}
  finally {if(descriptor)Object.defineProperty(globalThis,'CSS',descriptor);else Reflect.deleteProperty(globalThis,'CSS');}
});
