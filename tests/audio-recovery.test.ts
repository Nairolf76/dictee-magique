import {test} from 'node:test';
import assert from 'node:assert/strict';
import {AudioHealth, resumeAudio} from '../src/audio-recovery.js';

test('resumes an interrupted context synchronously from the user gesture', async () => {
  const context = {state:'interrupted',currentTime:3}; let called=false;
  const pending=resumeAudio(context,()=>{called=true;context.state='running';return Promise.resolve();});
  assert.equal(called,true); await pending;
});

test('explicit recovery restarts a running but silent Safari audio circuit', async () => {
  const calls:string[]=[];const context={state:'running',currentTime:4,suspend:async()=>{calls.push('suspend');context.state='suspended';}};
  await resumeAudio(context,async()=>{calls.push('resume');context.state='running';},true);
  assert.deepEqual(calls,['suspend','resume']);
});

test('does not report success when Safari leaves the context interrupted', async () => {
  await assert.rejects(resumeAudio({state:'interrupted',currentTime:4},()=>Promise.resolve()),/interrompu/);
});

test('a resume promise that never settles times out and allows a later attempt', async t => {
  t.mock.timers.enable({apis:['setTimeout']});
  const context={state:'suspended',currentTime:0};
  const pending=resumeAudio(context,()=>new Promise(()=>{}));
  const rejected=assert.rejects(pending,/nouvel onglet/);t.mock.timers.tick(3001);await rejected;
  await resumeAudio(context,async()=>{context.state='running';});
});

test('health distinguishes stalled clocks from intentional silence and hidden tabs', () => {
  const health=new AudioHealth(),context={state:'running',currentTime:10};
  assert.equal(health.inspect(context,true,0),'ready');
  assert.equal(health.inspect(context,true,3000),'stalled');
  context.currentTime=10.1;assert.equal(health.inspect(context,true,3100),'ready');
  assert.equal(health.inspect(context,false,10000),'ready');
  assert.equal(health.inspect(context,true,15000),'ready');
  context.state='suspended';assert.equal(health.inspect(context,true,15001),'interrupted');
});
