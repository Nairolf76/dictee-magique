import { appendKeyArt } from './key-art';
import {setupPractice} from './practice-ui';
import {setupCartridges,selectedCartridge} from './cartridge-ui';
import './practice.css';
import { RomStorage } from './rom-storage';
import { setupVoiceControls } from './voice-ui';
import { decodeSpeechDictionary,decodeCartridgeDictionary } from './speech-rom';
import type { ModernVoice } from './modern-voice';
import './style.css';
import './branding.css';
import './key-art.css';
import { setupFullscreen } from './fullscreen';
import { validateRom } from './rom';
import { DicteeEngine } from './engine';
import { InputController } from './input';
import { KEYS } from './keys';
import { SegmentDisplay } from './display';

const $ = <T extends HTMLElement>(selector: string) => document.querySelector<T>(selector)!;
const status=$('#status'), start=$<HTMLButtonElement>('#start'), file=$<HTMLInputElement>('#rom');
const audio=$<HTMLButtonElement>('#audio'), reset=$<HTMLButtonElement>('#reset'), volume=$<HTMLInputElement>('#volume');
const display = new SegmentDisplay($('#display'));
let practiceActive=false;
let practice:ReturnType<typeof setupPractice>|undefined;
let modernVoice: ModernVoice | undefined;
const engine = new DicteeEngine($('#canvas'), (i,mask)=>display.update(i,mask), address=>modernVoice?.onSpeech(address));
modernVoice=setupVoiceControls(value=>engine.volume(practiceActive?0:value),value=>engine.setSpeechBusy(value),text=>message(text));
const storage=new RomStorage();
const forget=$<HTMLButtonElement>('#forget-rom');
let ready=false, prepared=false, activating=false, importSequence=0;
const buttons = new Map<string, HTMLButtonElement>();
const input = new InputController((row, mask, down)=>{
  engine.setKey(row,mask,down);
  buttons.get(`${row}:${mask}`)?.classList.toggle('down',!!down);
});
const downAt=new Map<string,number>(), pending=new Map<string,number>();
function press(id:string,row:number,mask:number) {
  if(!ready)return;
  clearTimeout(pending.get(id));pending.delete(id);
  if(!downAt.has(id))downAt.set(id,performance.now());
  input.press(id,row,mask);
}
function release(id:string) {
  if(!downAt.has(id))return;
  const delay=Math.max(0,80-(performance.now()-downAt.get(id)!));
  clearTimeout(pending.get(id));
  pending.set(id,window.setTimeout(()=>{input.release(id);downAt.delete(id);pending.delete(id);},delay));
}
function releaseAll(){for(const timer of pending.values())clearTimeout(timer);pending.clear();downAt.clear();input.releaseAll();}
setupFullscreen(releaseAll);
function message(text:string,error=false){status.textContent=text;status.classList.toggle('error',error);}
for(const spec of KEYS){
  const button=document.createElement('button');button.type='button';button.disabled=true;
  button.className='toy-key'+(spec.function?' function':'')+(spec.vowel?' vowel':'');
  button.setAttribute('aria-label',spec.label);button.title=spec.label+' · '+spec.keyboard;
  button.dataset.row=String(spec.row);button.dataset.mask=String(spec.mask);
  appendKeyArt(button,spec);
  button.addEventListener('pointerdown',e=>{e.preventDefault();if(practiceActive){practice?.toyKey(spec.keyboard);return;}if(!ready&&spec.keyboard==='9'){void activate();return;}button.setPointerCapture(e.pointerId);press('pointer:'+e.pointerId,spec.row,spec.mask);});
  for(const event of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(event,e=>release('pointer:'+(e as PointerEvent).pointerId));
  // Native keyboard/assistive clicks have no mouse click count.
  button.addEventListener('click',e=>{if(e.detail===0){if(practiceActive){practice?.toyKey(spec.keyboard);return;}if(!ready&&spec.keyboard==='9'){void activate();return;}const id='accessible:'+spec.label;press(id,spec.row,spec.mask);release(id);}});
  buttons.set(`${spec.row}:${spec.mask}`,button);$('#keys').append(button);
}
async function prepare(bytes:Uint8Array,restored:boolean,sequence:number) {
  message('Vérification de la version française…');
  const result=await validateRom(bytes);
  if(sequence!==importSequence)return;
  file.disabled=true;
  const cartridge=await selectedCartridge();
  const dictionary=decodeSpeechDictionary(result.files['cd2352']).cues;
  if(cartridge)for(const [address,cue] of decodeCartridgeDictionary(cartridge.bytes).cues)dictionary.set(address,cue);
  modernVoice?.setDictionary(dictionary);
  let saved=restored;
  if(!restored){
    try{await storage.save(result.zip);saved=true;}
    catch{saved=false;}
  }
  forget.hidden=!saved;forget.disabled=true;
  $('#storage-note').textContent=saved?'ROM mémorisée sur cet appareil. Aucun téléversement.':'Stockage indisponible : la ROM reste utilisable pour cette session.';
  message('La Dictée se prépare en silence…');
  start.textContent='Chargement…';
  try{
    await engine.start(result.zip,cartridge?.bytes);prepared=true;
    start.disabled=false;start.textContent='Marche · jouer avec le son';
    buttons.get('8:16')!.disabled=false;
    if(practiceActive)practice?.refreshToyButtons();
    message('Prête ! Appuie sur Marche pour jouer avec le son.');
  }catch(e){message((e as Error).message+' Recharge la page pour réessayer.',true);start.textContent='Démarrage interrompu';}
  finally{forget.disabled=false;}
}
file.addEventListener('change',async()=>{
  const selected=file.files?.[0];if(!selected)return;
  const sequence=++importSequence;start.disabled=true;forget.disabled=true;file.disabled=true;
  $('#file-label').textContent=selected.name;
  try{
    if(selected.size>4194304)throw new Error('Archive trop volumineuse : maximum 4 Mo.');
    await prepare(new Uint8Array(await selected.arrayBuffer()),false,sequence);
  }catch(e){if(sequence===importSequence){file.disabled=false;forget.disabled=false;message((e as Error).message,true);}}
});
async function activate(){
  if(!prepared||activating||ready)return;
  activating=true;start.disabled=true;
  try{
    // Called in the click/tap handler after the silent preparation, preserving user activation.
    const resume=engine.enableAudio();
    modernVoice?.setVolume(Number(volume.value)/100);
    await resume;modernVoice?.setEnabled(!practiceActive);ready=true;
    for(const button of buttons.values())button.disabled=false;
    audio.hidden=true;reset.disabled=false;start.textContent='La Dictée est allumée';
    $('.controls h2').textContent='À toi de jouer.';
    message('Choisis un niveau avec A, B, C ou D, puis appuie sur Départ.');
  }catch(e){
    start.disabled=false;audio.hidden=false;audio.disabled=false;
    message((e as Error).message+' Appuie à nouveau sur Marche pour activer le son.',true);
  }finally{activating=false;}
}
start.addEventListener('click',()=>void activate());
audio.addEventListener('click',()=>void activate());
forget.addEventListener('click',async()=>{
  forget.disabled=true;
  try{await storage.clear();modernVoice?.cancel();engine.volume(0);location.reload();}
  catch{forget.disabled=false;message('Impossible d’effacer la ROM. Réessaie ou efface les données du site dans ton navigateur.',true);}
});
async function restore(){
  const sequence=++importSequence;
  try{
    const bytes=await storage.load();
    if(sequence!==importSequence)return;
    if(!bytes){message('Choisis une ROM française pour commencer.');return;}
    $('#file-label').textContent='ROM française mémorisée';
    forget.hidden=false;
    await prepare(bytes,true,sequence);
  }catch{
    if(sequence!==importSequence)return;
    file.disabled=false;forget.disabled=false;forget.hidden=false;
    message('ROM mémorisée absente, inaccessible ou invalide. Importe une archive française pour commencer.');
  }
}
void restore();
volume.addEventListener('input',()=>modernVoice?.setVolume(Number(volume.value)/100));
reset.addEventListener('click',()=>{releaseAll();modernVoice?.cancel();engine.reset();message('La Dictée recommence. Choisis un niveau.');});
const mappings=new Map(KEYS.map(spec=>[spec.keyboard,spec]));
mappings.set('Delete',mappings.get('Backspace')!);mappings.set('Home',mappings.get('1')!);mappings.set('F1',mappings.get('9')!);
window.addEventListener('keydown',e=>{
  const target=e.target as HTMLElement;
  if(practiceActive){
    if(practice?.handleKeyboard(e))e.preventDefault();
    else {const native=target.closest<HTMLElement>('button,summary,a');if(native&&!target.matches('input,textarea,select')&&['Enter',' '].includes(e.key)){e.preventDefault();if(!e.repeat)native.click();}}
    e.stopImmediatePropagation();return;
  }
  if(target.matches('input,textarea,select')||e.ctrlKey||e.altKey||e.metaKey){e.stopImmediatePropagation();return;}
  const nativeControl=target.closest<HTMLElement>('button,summary,a');
  if(nativeControl&&['Enter',' '].includes(e.key)){
    e.preventDefault();e.stopImmediatePropagation();if(!e.repeat)nativeControl.click();return;
  }
  if(!ready&&['9','F1'].includes(e.key)){e.preventDefault();e.stopImmediatePropagation();if(!e.repeat)void activate();return;}
  const key=mappings.get(e.key.length===1?e.key.toLowerCase():e.key);
  if(key){e.preventDefault();e.stopImmediatePropagation();press('keyboard:'+e.code,key.row,key.mask);}
  else e.stopImmediatePropagation(); // Keep native Tab/controls without opening MAME's hidden menus.
},true);
window.addEventListener('keyup',e=>{release('keyboard:'+e.code);e.stopImmediatePropagation();},true);
window.addEventListener('blur',releaseAll);
document.addEventListener('visibilitychange',()=>{if(document.hidden)releaseAll();});

setupCartridges();
practice=setupPractice({
  modeChanged(active){practiceActive=active;releaseAll();modernVoice?.cancel();modernVoice?.setEnabled(!active&&ready);if(active)engine.volume(0);else for(const button of buttons.values())button.disabled=!ready;},
  getVolume:()=>Number(volume.value)/100,
  setVolume(value){volume.value=String(Math.round(value*100));modernVoice?.setVolume(value);}
});
