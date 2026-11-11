import type {SpeechCue} from './speech-rom.js';
export interface SpeechJob {
  text:string; voice?:SpeechSynthesisVoice; lang?:string; volume?:number; rate?:number;
  onend:(()=>void)|null; onerror:(()=>void)|null;
}
export interface SpeechBackend { create(text:string):SpeechJob; speak(job:SpeechJob):void; cancel():void }
export class ModernVoice {
  private dictionary=new Map<number,SpeechCue>();
  private voice:SpeechSynthesisVoice|null=null;
  private enabled=false;
  private unavailable=false;
  private volume=.7;
  private generation=0;
  private timer:ReturnType<typeof setTimeout>|undefined;
  private job:SpeechJob|undefined;
  constructor(private backend:SpeechBackend,private gain:(value:number)=>void,private busy:(value:boolean)=>void,private failed:()=>void=()=>{}){}
  setDictionary(cues:Map<number,SpeechCue>){this.dictionary=cues;}
  setVoice(voice:SpeechSynthesisVoice|null){this.cancel();this.voice=voice;this.unavailable=false;this.applyGain();}
  setEnabled(value:boolean){this.enabled=value;if(!value)this.cancel();this.applyGain();}
  setVolume(value:number){this.volume=Math.max(0,Math.min(1,value));this.applyGain();}
  private applyGain(){this.gain(this.enabled&&!this.voice?this.volume:0);}
  cancel(){this.generation++;clearTimeout(this.timer);this.timer=undefined;this.job=undefined;this.backend.cancel();this.busy(false);}
  suspend(){this.cancel();this.unavailable=true;this.applyGain();}
  onSpeech(address:number){
    if(!this.enabled)return;
    if(!this.voice){this.gain(this.volume);return;}
    // The original channel never opens while a modern voice is selected,
    // including unknown cues, volume changes, timeouts and synthesis errors.
    this.gain(0);
    if(this.unavailable)return;
    const cue=this.dictionary.get(address);
    if(cue?.text.trim())this.say(cue.text);
  }
  preview(){if(this.voice){this.unavailable=false;this.say('Bonjour ! Écris les mots que je vais te dicter.');}}
  private say(text:string){
    this.cancel();const generation=this.generation;
    this.gain(0);this.busy(true);
    const job=this.backend.create(text);this.job=job;
    job.voice=this.voice!;job.lang=this.voice!.lang;job.volume=this.volume;job.rate=1;
    const finish=(error:boolean)=>{
      if(generation!==this.generation)return;
      clearTimeout(this.timer);this.timer=undefined;this.job=undefined;this.busy(false);
      if(error){this.generation++;this.backend.cancel();this.unavailable=true;this.applyGain();this.failed();}
    };
    job.onend=()=>finish(false);job.onerror=()=>finish(true);
    this.timer=setTimeout(()=>finish(true),20000);
    try{this.backend.speak(job);}catch{finish(true);}
  }
}
