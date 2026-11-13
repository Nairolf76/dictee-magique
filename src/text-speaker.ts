import type {SpeechBackend,SpeechJob} from './modern-voice.js';
export const browserSpeechBackend=():SpeechBackend=>({create:text=>new SpeechSynthesisUtterance(text) as unknown as SpeechJob,speak:job=>speechSynthesis.speak(job as unknown as SpeechSynthesisUtterance),cancel:()=>window.speechSynthesis?.cancel()});
export class TextSpeaker {
  private generation=0;private timer:ReturnType<typeof setTimeout>|undefined;
  private job:SpeechJob|undefined;
  constructor(private backend:SpeechBackend){}
  cancel(){this.generation++;clearTimeout(this.timer);this.timer=undefined;this.job=undefined;this.backend.cancel();}
  speak(text:string,voice:SpeechSynthesisVoice,volume:number,finished:(error:boolean)=>void){
    this.cancel();const generation=this.generation;
    const job=this.backend.create(text);this.job=job;job.voice=voice;job.lang=voice.lang;job.volume=volume;job.rate=1;
    const finish=(error:boolean)=>{if(generation!==this.generation)return;clearTimeout(this.timer);this.timer=undefined;this.job=undefined;if(error){this.generation++;this.backend.cancel();}finished(error);};
    job.onend=()=>finish(false);job.onerror=()=>finish(true);this.timer=setTimeout(()=>finish(true),20000);
    try{this.backend.speak(job);}catch{finish(true);}
  }
}
