import {ModernVoice,type SpeechJob} from './modern-voice';
export function setupVoiceControls(gain:(value:number)=>void,busy:(value:boolean)=>void,notify:(text:string)=>void){
  const select=document.querySelector<HTMLSelectElement>('#voice')!;
  const preview=document.querySelector<HTMLButtonElement>('#preview-voice')!;
  const note=document.querySelector<HTMLElement>('#voice-note')!;
  const synthesis=window.speechSynthesis;
  let voices:SpeechSynthesisVoice[]=[];
  const player=new ModernVoice({
    create:text=>new SpeechSynthesisUtterance(text) as unknown as SpeechJob,
    speak:job=>synthesis.speak(job as unknown as SpeechSynthesisUtterance),
    cancel:()=>synthesis?.cancel()
  },gain,busy,()=>{
    note.textContent='Cette voix n’a pas répondu. Le son d’origine reste coupé.';
    notify('Réessaie avec Écouter ou choisis une autre voix.');
  });
  function choose(){
    const voice=voices.find(v=>v.voiceURI===select.value)||null;
    player.setVoice(voice);preview.disabled=!voice;
    note.textContent=voice?'Voix moderne seule : les sons d’origine sont coupés. Une annonce non reconnue reste silencieuse.'+(voice.localService?'':' Cette voix du navigateur nécessite Internet.'):'La voix d’origine du jouet.';
  }
  function refresh(){
    const selected=select.value;
    voices=(synthesis?.getVoices()||[]).filter(v=>/^fr(?:[-_]|$)/i.test(v.lang)).sort((a,b)=>Number(/^fr[-_]FR$/i.test(b.lang))-Number(/^fr[-_]FR$/i.test(a.lang))||Number(b.localService)-Number(a.localService)||a.name.localeCompare(b.name,'fr'));
    select.replaceChildren(new Option('Voix d’origine · 1981','original'));
    if(voices.length){
      const group=document.createElement('optgroup');group.label='Voix françaises du navigateur';
      for(const voice of voices)group.append(new Option(voice.name+(voice.localService?' · sur cet appareil':' · en ligne'),voice.voiceURI));
      select.append(group);
      if(voices.some(v=>v.voiceURI===selected)){select.value=selected;if(selected!=='original'&&preview.disabled)choose();}
      else if(selected!=='original'){
        const unavailable=new Option('Voix sélectionnée indisponible',selected);unavailable.disabled=true;select.append(unavailable);select.value=selected;player.suspend();preview.disabled=true;note.textContent='Cette voix n’est plus disponible. Choisis une autre voix.';
      }
      if(select.value==='original')note.textContent='La voix d’origine du jouet.';
    }else{
      if(selected!=='original'){const unavailable=new Option('Voix sélectionnée indisponible',selected);unavailable.disabled=true;select.append(unavailable);select.value=selected;player.suspend();}
      preview.disabled=true;
      note.textContent='Aucune voix française disponible dans ce navigateur. Les voix proposées varient selon le navigateur et l’appareil.';
    }
  }
  refresh();synthesis?.addEventListener('voiceschanged',refresh);
  select.addEventListener('change',choose);
  preview.addEventListener('click',()=>player.preview());
  window.addEventListener('beforeunload',()=>player.cancel());
  return player;
}
