import {AudioHealth, type AudioClock} from './audio-recovery';

interface AudioBridge {
  active(): boolean;
  context(): AudioClock | undefined;
  resume(restart: boolean): Promise<void>;
  restoreSpeech(): void;
  previewSpeech(): void;
  activate(): Promise<void>;
  diagnostics(): object;
}

export function setupAudioRecovery(bridge: AudioBridge) {
  const audio = document.querySelector<HTMLButtonElement>('#audio')!;
  const health = new AudioHealth();
  const note = document.createElement('p'); note.className='small-note';note.hidden=true;note.setAttribute('role','status');note.id='audio-status';
  document.querySelector('.audio-controls')!.after(note);
  const help=document.createElement('details');help.className='guide audio-help';
  help.innerHTML='<summary>Son muet ?</summary><p>Essaie Réactiver le son, puis Répète. Si cet onglet Safari reste muet, ouvre le jeu dans un nouvel onglet.</p><button type="button" class="text-button" id="copy-audio-diagnostic">Copier le diagnostic audio</button><textarea id="audio-diagnostic" aria-label="Diagnostic audio à copier" readonly hidden rows="8"></textarea><p class="small-note">Ce diagnostic reste sur cet appareil. Il ne contient ni ROM ni liste personnelle.</p>';
  document.querySelector('.voice-controls')!.after(help);
  const show=(text:string)=>{note.textContent=text;note.hidden=false;};
  let pending=false,timer:ReturnType<typeof setInterval>|undefined;
  const state=()=>health.inspect(bridge.context(),!document.hidden,performance.now());
  const narrating=()=>document.querySelector<HTMLSelectElement>('#voice')!.value!=='original'&&window.speechSynthesis?.speaking&&!window.speechSynthesis.paused;
  function check(){if(!bridge.active())return;if(narrating()){note.hidden=true;return;}const value=state();if(value==='interrupted'||value==='stalled')show('Le navigateur a interrompu le son. Touche Réactiver le son.');else if(value==='ready'&&!pending)note.hidden=true;}
  async function recover(explicit=true){
    if(!bridge.active()){if(explicit)await bridge.activate();return;}
    if(pending)return;
    pending=true;if(explicit)audio.disabled=true;
    try{
      bridge.restoreSpeech();
      // Invoke inside the tap/keydown, before the first await.
      const operation=bridge.resume(explicit&&document.querySelector<HTMLSelectElement>('#voice')!.value==='original');
      if(explicit)bridge.previewSpeech();
      await operation;show('Son relancé. Utilise Répète pour réentendre le mot.');
    }catch(error){show((error as Error).message);}
    finally{pending=false;audio.disabled=false;}
  }
  audio.addEventListener('click',()=>void recover());
  const copy=help.querySelector<HTMLButtonElement>('#copy-audio-diagnostic')!,text=help.querySelector<HTMLTextAreaElement>('#audio-diagnostic')!;
  copy.addEventListener('click',()=>void(async()=>{
    text.value=JSON.stringify({browser:navigator.userAgent,visible:!document.hidden,voice:document.querySelector<HTMLSelectElement>('#voice')!.selectedOptions[0]?.text,health:state(),...bridge.diagnostics()},null,2);
    try{await navigator.clipboard.writeText(text.value);copy.textContent='Diagnostic copié';}
    catch{text.hidden=false;text.focus();text.select();copy.textContent='Sélectionne et copie le diagnostic';}
  })());
  function start(){audio.hidden=false;audio.disabled=false;audio.textContent='Réactiver le son';if(!timer)timer=setInterval(check,1000);}
  function gesture(){if(bridge.active()&&!pending&&!narrating()&&state()!=='ready')void recover(false);}
  const visible=()=>{if(!document.hidden)check();};document.addEventListener('visibilitychange',visible);window.addEventListener('pageshow',visible);
  return{start,gesture,dispose(){if(timer)clearInterval(timer);document.removeEventListener('visibilitychange',visible);window.removeEventListener('pageshow',visible);}};
}
