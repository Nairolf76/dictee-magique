import {test} from 'node:test';
import assert from 'node:assert/strict';
import {decodeSpeechDictionary} from '../src/speech-rom.js';
function fixture(word='FLEUR'){
  const data=new Uint8Array(16384);const view=new DataView(data.buffer);
  data[0]=1;view.setUint16(4,0x86,true);view.setUint16(0x86,0x100,true);
  [...word].forEach((c,i)=>data[0x100+i]=(c.charCodeAt(0)-65)|(i===0?128:0)|(i===word.length-1?64:0));
  view.setUint16(0x100+word.length,0x300,true);
  view.setUint16(0x10,0x400,true);view.setUint16(0x400,0x404,true);view.setUint16(0x402,1,true);
  view.setUint16(0x12,0x450,true);
  view.setUint16(0x70,0x500,true);
  return data;
}
test('decodes the hidden word from its speech address without a bundled vocabulary',()=>{
  const result=decodeSpeechDictionary(fixture());assert.equal(result.wordCount,1);assert.equal(result.cues.get(0x300)?.text,'fleur');
});
test('maps a letter and its read-and-branch wrapper to the same modern cue',()=>{
  const result=decodeSpeechDictionary(fixture());assert.equal(result.cues.get(0x400)?.text,'A');assert.equal(result.cues.get(0x404)?.text,'A');
});
test('maps French numbers',()=>{assert.equal(decodeSpeechDictionary(fixture()).cues.get(0x500)?.text,'zéro');});
test('uses the French letter table, where B is at header offset 0x12',()=>{assert.equal(decodeSpeechDictionary(fixture()).cues.get(0x450)?.text,'B');});
test('rejects an invalid ROM length',()=>{assert.throws(()=>decodeSpeechDictionary(new Uint8Array(20)));});
test('rejects a word table outside ROM',()=>{const rom=fixture();new DataView(rom.buffer).setUint16(4,65535,true);assert.throws(()=>decodeSpeechDictionary(rom));});
test('rejects a spelling without an end marker',()=>{const rom=fixture();rom.fill(0,0x100,0x112);rom[0x100]=128;assert.throws(()=>decodeSpeechDictionary(rom));});

test('maps the French question and correction announcements',()=>{const rom=fixture();const v=new DataView(rom.buffer);v.setUint16(0x48,0x600,true);v.setUint16(0x600,0x620,true);v.setUint16(0x5c,0x650,true);v.setUint16(0x64,0x680,true);v.setUint16(0x46,0x700,true);v.setUint16(0x700,0x720,true);v.setUint16(0x704,0x740,true);const cues=decodeSpeechDictionary(rom).cues;assert.equal(cues.get(0x620)?.text,'Écris le mot suivant.');assert.equal(cues.get(0x650)?.text,'Bravo !');assert.match(cues.get(0x680)!.text,/Essaie encore/);assert.equal(cues.get(0x720)?.text,'Le bon mot est :');assert.equal(cues.get(0x740)?.text,'Cela s’écrit :');assert.equal(cues.get(0x620)?.kind,'announcement');});

test('sends the actual letter N to French voices instead of the ambiguous spelling enne',()=>{const rom=fixture();new DataView(rom.buffer).setUint16(0x10+13*2,0x800,true);const cue=decodeSpeechDictionary(rom).cues.get(0x800);assert.equal(cue?.kind,'letter');assert.equal(cue?.text,'N');});

test('sends all 26 actual letters to the French voice, including F and J',()=>{const rom=fixture();const view=new DataView(rom.buffer);const letters=[...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'];letters.forEach((letter,i)=>view.setUint16(0x10+i*2,0x800+i*32,true));const cues=decodeSpeechDictionary(rom).cues;for(const [i,letter] of letters.entries()){assert.equal(cues.get(0x800+i*32)?.kind,'letter');assert.equal(cues.get(0x800+i*32)?.text,letter);}});

test('maps all four French success variants instead of muting later correct answers',()=>{
  const rom=fixture(),view=new DataView(rom.buffer);
  const addresses=[0x800,0x872,0x8c6,0x955];
  addresses.forEach((address,i)=>view.setUint16(0x5c+i*2,address,true));
  const cues=decodeSpeechDictionary(rom).cues;
  const phrases=['Bravo !','Bien joué !','C’est le bon mot !','Très bien !'];
  addresses.forEach((address,i)=>assert.deepEqual(cues.get(address),{text:phrases[i],kind:'announcement'}));
});
