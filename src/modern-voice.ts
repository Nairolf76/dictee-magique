import type {SpeechCue} from './speech-rom.js';
import {TextSpeaker} from './text-speaker.js';
export interface SpeechJob {text:string;voice?:SpeechSynthesisVoice;lang?:string;volume?:number;rate?:number;onend:(()=>void)|null;onerror:(()=>void)|null}
export interface SpeechBackend {create(text:string):SpeechJob;speak(job:SpeechJob):void;cancel():void}
export class ModernVoice {
  private dictionary=new Map<number,SpeechCue>();private voice:SpeechSynthesisVoice|null=null;
  private enabled=false;private unavailable=false;private volume=.7;private speaker:TextSpeaker;
  constructor(backend:SpeechBackend,private gain:(value:number)=>void,private busy:(value:boolean)=>void,private failed:()=>void=()=>{}){this.speaker=new TextSpeaker(backend);}
  setDictionary(cues:Map<number,SpeechCue>){this.dictionary=cues;}
  setVoice(voice:SpeechSynthesisVoice|null){this.cancel();this.voice=voice;this.unavailable=false;this.applyGain();}
  setEnabled(value:boolean){this.enabled=value;if(!value)this.cancel();this.applyGain();}
  setVolume(value:number){this.volume=Math.max(0,Math.min(1,value));this.applyGain();}
  private applyGain(){this.gain(this.enabled&&!this.voice?this.volume:0);}
  cancel(){this.speaker.cancel();this.busy(false);}
  suspend(){this.cancel();this.unavailable=true;this.applyGain();}
  onSpeech(address:number){
    if(!this.enabled)return;
    if(!this.voice){this.gain(this.volume);return;}
    this.gain(0);if(this.unavailable)return;
    const cue=this.dictionary.get(address);if(cue?.text.trim())this.say(cue.text);
  }
  preview(){if(this.voice){this.unavailable=false;this.say('Bonjour ! Écris les mots que je vais te dicter.');}}
  private say(text:string){
    this.cancel();this.gain(0);this.busy(true);
    this.speaker.speak(text,this.voice!,this.volume,error=>{this.busy(false);if(error){this.unavailable=true;this.applyGain();this.failed();}});
  }
}
