import {test} from 'node:test';import assert from 'node:assert/strict';
import {validateCartridge,CARTRIDGES} from '../src/cartridges.js';
import {decodeCartridgeDictionary} from '../src/speech-rom.js';
function cart(absolute:boolean){const r=new Uint8Array(16384),v=new DataView(r.buffer),base=absolute?0x8000:0;r[0]=1;v.setUint16(4,base+0x20,true);v.setUint16(0x20,base+0x100,true);r[0x100]=128+5;r[0x101]=64+4;v.setUint16(0x102,base+0x300,true);return r;}
test('French cartridge manifest is pinned and distinct',()=>{assert.equal(CARTRIDGES.length,3);assert.equal(new Set(CARTRIDGES.map(c=>c.sha1)).size,3);assert.ok(CARTRIDGES.every(c=>c.size===16384));});
test('module word addresses are banked without replacing base letters or announcements',()=>{for(const abs of [false,true]){const {cues,wordCount}=decodeCartridgeDictionary(cart(abs));assert.equal(wordCount,1);assert.equal(cues.get(0x8300)?.text,'fe');assert.equal(cues.get(0x8300)?.kind,'word');assert.ok([...cues.keys()].every(a=>a>=0x8000));}});
test('modules 2 and 4 accept first letters without the optional high marker',()=>{const r=cart(true);r[0x100]=5;assert.equal(decodeCartridgeDictionary(r).cues.get(0x8300)?.text,'fe');});
test('corrupt cartridge pointers and invalid size fail precisely',()=>{const r=cart(true);new DataView(r.buffer).setUint16(4,0xffff,true);assert.throws(()=>decodeCartridgeDictionary(r),/hors ROM/);assert.throws(()=>decodeCartridgeDictionary(new Uint8Array(100)),/incorrecte/);});
test('wrong model and oversized cartridge are rejected',async()=>{await assert.rejects(validateCartridge(new Uint8Array(16384)),/non reconnue/);await assert.rejects(validateCartridge(new Uint8Array(4194305)),/4 Mo/);});
