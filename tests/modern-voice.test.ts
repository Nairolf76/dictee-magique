import {test} from 'node:test';
import assert from 'node:assert/strict';
import {ModernVoice, type SpeechJob} from '../src/modern-voice.js';
function fixture(){
  const gain:number[]=[],busy:boolean[]=[],jobs:SpeechJob[]=[];let cancellations=0;
  const player=new ModernVoice({create:text=>({text,onend:null,onerror:null}),speak:job=>jobs.push(job),cancel:()=>{cancellations++;}},value=>gain.push(value),value=>busy.push(value));
  player.setDictionary(new Map([[42,{text:'fleur',kind:'word'}]]));
  return{player,gain,busy,jobs,cancellations:()=>cancellations};
}
test('original mode keeps the ROM voice and never invokes synthesis',()=>{const f=fixture();f.player.setEnabled(true);f.player.onSpeech(42);assert.equal(f.jobs.length,0);assert.equal(f.gain.at(-1),.7);f.player.cancel();});
test('a known ROM address uses modern speech and holds talk status until it ends',()=>{
  const f=fixture();f.player.setVoice({voiceURI:'fr',lang:'fr-FR'} as SpeechSynthesisVoice);f.player.setEnabled(true);f.player.onSpeech(42);
  assert.equal(f.jobs[0].text,'fleur');assert.equal(f.gain.at(-1),0);assert.equal(f.busy.at(-1),true);f.jobs[0].onend?.();assert.equal(f.busy.at(-1),false);f.player.cancel();
});
test('unmapped announcements stay muted in modern mode',()=>{const f=fixture();f.player.setVoice({voiceURI:'fr',lang:'fr-FR'} as SpeechSynthesisVoice);f.player.setEnabled(true);f.player.onSpeech(99);assert.equal(f.jobs.length,0);assert.equal(f.gain.at(-1),0);f.player.cancel();});
test('volume changes cannot reactivate original audio in modern mode',()=>{const f=fixture();f.player.setVoice({voiceURI:'fr',lang:'fr-FR'} as SpeechSynthesisVoice);f.player.setEnabled(true);f.player.onSpeech(99);f.player.setVolume(.25);assert.equal(f.gain.at(-1),0);f.player.cancel();});
test('speech stays silent before explicit activation',()=>{const f=fixture();f.player.setVoice({voiceURI:'fr',lang:'fr-FR'} as SpeechSynthesisVoice);f.player.onSpeech(42);assert.equal(f.jobs.length,0);f.player.cancel();});
test('reset cancels narration and stale completion cannot unlock a later utterance',()=>{
  const f=fixture();f.player.setVoice({voiceURI:'fr',lang:'fr-FR'} as SpeechSynthesisVoice);f.player.setEnabled(true);f.player.onSpeech(42);const old=f.jobs[0];f.player.cancel();f.player.onSpeech(42);old.onend?.();assert.equal(f.busy.at(-1),true);f.jobs[1].onend?.();assert.equal(f.busy.at(-1),false);f.player.cancel();
});
test('a synthesis error keeps original audio muted and releases talk status',()=>{
  const f=fixture();f.player.setVoice({voiceURI:'fr',lang:'fr-FR'} as SpeechSynthesisVoice);f.player.setEnabled(true);f.player.onSpeech(42);f.jobs[0].onerror?.();assert.equal(f.busy.at(-1),false);assert.equal(f.gain.at(-1),0);f.player.cancel();
});
