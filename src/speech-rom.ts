export interface SpeechCue { text: string; kind: 'word' | 'letter' | 'number' | 'announcement' }

/** Decode text in the verified French VSM; no original vocabulary is bundled. */
export function decodeSpeechDictionary(rom: Uint8Array) {
  if(rom.length!==16384)throw new Error('Mémoire vocale française incorrecte.');
  const view=new DataView(rom.buffer,rom.byteOffset,rom.byteLength);
  const read=(address:number)=>{if(address<0||address+2>rom.length)throw new Error('Adresse vocale hors ROM.');return view.getUint16(address,true);};
  const cues=new Map<number,SpeechCue>();
  const add=(address:number,cue:SpeechCue)=>{
    if(!address)return;
    if(address>=rom.length)throw new Error('Pointeur vocal hors ROM.');
    cues.set(address,cue);
    // Some letter/phrase entries use a read-and-branch wrapper.
    if(address+4<rom.length&&read(address)===address+4&&read(address+2)===1)cues.set(address+4,cue);
  };
  // Let the selected French voice pronounce actual letter names. Handwritten
  // approximations (e.g. cé, effe, enne, ku) vary across speech engines.
  const letters=[...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'];
  // CD2352 differs from the US layout: its alphabet starts at 0x10.
  letters.forEach((text,i)=>add(read(0x10+i*2),{text,kind:'letter'}));
  const numbers=['zéro','un','deux','trois','quatre','cinq','six','sept','huit','neuf'];
  numbers.forEach((text,i)=>add(read(0x70+i*2),{text,kind:'number'}));
  // Modern paraphrases for the command addresses confirmed in the French
  // program: question variants, success, first retry and final correction.
  const announcement=(address:number,text:string)=>add(address,{text,kind:'announcement'});
  for(const header of [0x48,0x4a,0x4c,0x4e,0x50]){
    const packet=read(header);
    if(packet)announcement(read(packet),'Écris le mot suivant.');
  }
  announcement(read(0x5c),'Bravo !');
  announcement(read(0x64),'Ce n’est pas le bon mot. Essaie encore.');
  const correction=read(0x46);
  if(correction){
    announcement(read(correction),'Le bon mot est :');
    announcement(read(correction+4),'Cela s’écrit :');
  }

  let wordCount=0;
  for(let level=0;level<4;level++){
    const count=rom[level],table=read(4+2*level);
    if(count&&table+2*count>rom.length)throw new Error('Table des mots hors ROM.');
    for(let i=0;i<count;i++){
      let address=read(table+2*i),word='',ended=false;
      if(!(rom[address]&128))throw new Error('Début de mot incorrect.');
      for(let j=0;j<8;j++){
        if(address>=rom.length)throw new Error('Mot tronqué.');
        const code=rom[address++],letter=code&31;
        if(letter>25)throw new Error('Lettre incorrecte dans le mot.');
        word+=String.fromCharCode(97+letter);
        if(code&64){ended=true;break;}
      }
      if(!ended)throw new Error('Fin de mot absente.');
      add(read(address),{text:word,kind:'word'});wordCount++;
    }
  }
  if(!wordCount||wordCount>256)throw new Error('Nombre de mots incorrect.');
  return {cues,wordCount};
}
