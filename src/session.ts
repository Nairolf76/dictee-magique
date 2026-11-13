import {normalizeAnswer,type Entry,type WordList} from './library.js';
export interface PracticeItem extends Entry { listId:string; listTitle:string; key:string }
export type Outcome='first'|'retry'|'review'|'pending';
export interface PracticeResult { item:PracticeItem; answer:string; attempts:number; outcome:Outcome; helped:boolean }
export interface SessionOptions { mode:'training'|'exam'; medium:'keyboard'|'paper'; shuffle:boolean }
export interface ListSummary { id:string; date:string; first:number; retry:number; review:number; total:number; paper:boolean }
export function itemsFromLists(lists:WordList[]):PracticeItem[]{return lists.flatMap(list=>list.entries.map((entry,i)=>({...entry,listId:list.id,listTitle:list.title,key:list.id+':'+i})));}
export class PracticeSession {
  readonly items:PracticeItem[]; readonly results:PracticeResult[]=[];
  index=0;attempts=0;phase:'question'|'correction'|'paper-mark'|'finished'='question';
  constructor(items:PracticeItem[],public options:SessionOptions,random= Math.random){
    if(!items.length)throw new Error('Choisis au moins une liste non vide.');
    this.items=items.map(item=>({...item}));
    if(options.shuffle)for(let i=this.items.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[this.items[i],this.items[j]]=[this.items[j],this.items[i]];}
  }
  get current(){return this.items[this.index];}
  get finished(){return this.phase==='finished';}
  submit(answer:string):'retry'|'corrected'|'next'|'paper-mark' {
    if(this.phase!=='question')throw new Error('Cette réponse a déjà été validée.');
    if(this.options.medium==='paper'){
      if(this.options.mode==='training'){this.phase='paper-mark';return'paper-mark';}
      this.record('',0,'pending',false);this.advance();return'next';
    }
    this.attempts++;
    const correct=normalizeAnswer(answer)===normalizeAnswer(this.current.text);
    if(!correct&&this.options.mode==='training'&&this.attempts<2)return'retry';
    this.record(answer,this.attempts,correct?(this.attempts===1?'first':'retry'):'review',false);
    if(this.options.mode==='exam'){this.advance();return'next';}
    this.phase='correction';return'corrected';
  }
  help(){
    if(this.phase!=='question'||this.options.mode!=='training')return;
    this.record('',this.attempts,'review',true);this.phase='correction';
  }
  markPaper(correct:boolean,index?:number){
    if(this.options.medium!=='paper')return;
    if(this.phase==='paper-mark'){this.record('',1,correct?'first':'review',false);this.phase='correction';}
    else if(this.finished&&index!==undefined&&this.results[index])this.results[index].outcome=correct?'first':'review';
  }
  next(){if(this.phase==='correction')this.advance();}
  private record(answer:string,attempts:number,outcome:Outcome,helped:boolean){this.results.push({item:this.current,answer,attempts,outcome,helped});}
  private advance(){this.index++;this.attempts=0;this.phase=this.index===this.items.length?'finished':'question';}
  get reviewItems(){return this.results.filter(r=>r.outcome==='review').map(r=>r.item);}
  get pending(){return this.results.some(r=>r.outcome==='pending');}
  summaries():ListSummary[]{
    if(!this.finished||this.pending)return[];
    const grouped=new Map<string,PracticeResult[]>();
    for(const result of this.results){const id=result.item.listId;if(!grouped.has(id))grouped.set(id,[]);grouped.get(id)!.push(result);}
    return [...grouped].map(([id,results])=>({id,date:new Date().toISOString(),first:results.filter(r=>r.outcome==='first').length,retry:results.filter(r=>r.outcome==='retry').length,review:results.filter(r=>r.outcome==='review').length,total:results.length,paper:this.options.medium==='paper'}));
  }
}
