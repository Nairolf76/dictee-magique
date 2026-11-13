export interface Entry { text:string; context?:string }
export interface ListContent { title:string; entries:Entry[] }
export interface WordList extends ListContent { id:string; updatedAt:string }
export interface LibraryFile { version:1; lists:ListContent[] }
export interface ImportPreview { lists:ListContent[]; warnings:string[] }
export const normalizeAnswer=(value:string)=>value.normalize('NFC').toLocaleLowerCase('fr').replace(/[’‘ʼ]/g,"'").replace(/\s+/gu,' ').trim();
const clean=(value:string)=>value.normalize('NFC').replace(/\s+/gu,' ').trim();
export function validateLists(value:unknown):ImportPreview {
  const file=value as Partial<LibraryFile>;
  if(!file||file.version!==1)throw new Error('Format JSON non reconnu : version 1 attendue.');
  if(!Array.isArray(file.lists)||!file.lists.length||file.lists.length>100)throw new Error('Le fichier doit contenir entre 1 et 100 listes.');
  const warnings:string[]=[];
  const lists=file.lists.map((raw,i)=>{
    if(!raw||typeof raw.title!=='string'||!clean(raw.title)||raw.title.length>120)throw new Error(`Liste ${i+1} : titre requis (120 caractères maximum).`);
    if(!Array.isArray(raw.entries)||!raw.entries.length||raw.entries.length>500)throw new Error(`Liste « ${raw.title} » : entre 1 et 500 entrées attendues.`);
    const seen=new Set<string>();
    const entries=raw.entries.map((entry,j)=>{
      if(!entry||typeof entry.text!=='string'||!clean(entry.text)||entry.text.length>240)throw new Error(`Liste ${i+1}, entrée ${j+1} : expression requise (240 caractères maximum).`);
      if(entry.context!==undefined&&(typeof entry.context!=='string'||entry.context.length>500))throw new Error(`Liste ${i+1}, entrée ${j+1} : contexte invalide (500 caractères maximum).`);
      const text=clean(entry.text),context=entry.context?clean(entry.context):undefined,key=normalizeAnswer(text);
      if(seen.has(key))warnings.push(`Doublon conservé : « ${text} » dans « ${raw.title} ».`);
      seen.add(key);return context?{text,context}:{text};
    });
    return{title:clean(raw.title),entries};
  });
  return{lists,warnings};
}
/** RFC4180 quoting, including quoted newlines. French semicolon and comma supported. */
export function parseCsv(text:string):string[][] {
  text=text.replace(/^\uFEFF/,'');
  const header=text.split(/\r?\n/,1)[0],separator=header.includes(';')?';':',';
  const rows:string[][]=[];let row:string[]=[],cell='',quoted=false,closed=false;
  for(let i=0;i<text.length;i++){
    const c=text[i];
    if(quoted){if(c==='"'){if(text[i+1]==='"'){cell+='"';i++;}else{quoted=false;closed=true;}}else cell+=c;continue;}
    if(c==='"'){if(cell||closed)throw new Error(`CSV : guillemet inattendu, ligne ${rows.length+1}.`);quoted=true;continue;}
    if(c===separator){row.push(cell);cell='';closed=false;continue;}
    if(c==='\r'||c==='\n'){if(c==='\r'&&text[i+1]==='\n')i++;row.push(cell);if(row.some(v=>v.trim()))rows.push(row);row=[];cell='';closed=false;continue;}
    if(closed&&!/\s/.test(c))throw new Error(`CSV : séparateur attendu après les guillemets, ligne ${rows.length+1}.`);
    if(!closed)cell+=c;
  }
  if(quoted)throw new Error('CSV : guillemets non fermés.');
  row.push(cell);if(row.some(v=>v.trim()))rows.push(row);return rows;
}
export function importLists(text:string,format:'csv'|'json'):ImportPreview {
  if(new TextEncoder().encode(text).length>2*1024*1024)throw new Error('Fichier trop volumineux : maximum 2 Mo.');
  if(format==='json'){
    let data:unknown;try{data=JSON.parse(text.replace(/^\uFEFF/,''));}catch{throw new Error('JSON invalide : vérifie les virgules et les guillemets.');}
    return validateLists(data);
  }
  const rows=parseCsv(text),header=rows.shift()?.map(v=>v.trim().toLowerCase());
  if(!header||!['liste','texte'].every(k=>header.includes(k))||new Set(header).size!==header.length||header.some(k=>!['liste','texte','contexte'].includes(k)))throw new Error('CSV : colonnes attendues liste;texte;contexte (contexte facultatif).');
  const groups=new Map<string,Entry[]>();
  rows.forEach((row,i)=>{
    if(row.length!==header.length)throw new Error(`CSV, ligne ${i+2} : ${header.length} colonnes attendues.`);
    const title=row[header.indexOf('liste')].trim(),text=row[header.indexOf('texte')],context=header.includes('contexte')?row[header.indexOf('contexte')]:undefined;
    if(!title)throw new Error(`CSV, ligne ${i+2} : nom de liste manquant.`);
    if(!groups.has(title))groups.set(title,[]);groups.get(title)!.push({text,context});
  });
  return validateLists({version:1,lists:[...groups].map(([title,entries])=>({title,entries}))});
}
export function exportLists(lists:ListContent[]):string {
  return JSON.stringify({version:1,lists:lists.map(({title,entries})=>({title,entries:entries.map(({text,context})=>context?{text,context}:{text})}))},null,2)+'\n';
}
export function materialize(lists:ListContent[]):WordList[]{return lists.map(list=>({...list,id:crypto.randomUUID(),updatedAt:new Date().toISOString()}));}
