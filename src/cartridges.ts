import {validateRom} from './rom.js';
export const CARTRIDGES=[
  {id:'motsbase',title:'Nº 1 · Les Mots de Base',name:'cd2353',size:16384,sha1:'3bebf4370be3e6e5fff86d2ee27ff56f17368ba6'},
  {id:'motsdiff',title:'Nº 2 · Les Mots Difficiles',name:'cd62177a',size:16384,sha1:'1d611f4a15d05f55f0da1773bddbfd64f2d63a49'},
  {id:'magasrue',title:'Nº 4 · Les Magasins de la Rue',name:'cd62048',size:16384,sha1:'479eaecaadb31bdd99e9bb0f424191ec554202bd'}
] as const;
export interface StoredCartridge {id:string;bytes:Uint8Array}
export async function validateCartridge(input:Uint8Array){
  if(input.length>4194304)throw new Error('Cartouche trop volumineuse : maximum 4 Mo.');
  if(input[0]===0x50&&input[1]===0x4b){
    for(const spec of CARTRIDGES){try{const result=await validateRom(input,[spec]);return{id:spec.id,bytes:result.files[spec.name]};}catch(e){if(!(e as Error).message.startsWith('Version française incomplète'))throw e;}}
  }else{
    const digest=await crypto.subtle.digest('SHA-1',new Uint8Array(input));
    const hash=[...new Uint8Array(digest)].map(v=>v.toString(16).padStart(2,'0')).join('');
    const spec=CARTRIDGES.find(s=>s.size===input.length&&s.sha1===hash);if(spec)return{id:spec.id,bytes:input};
  }
  throw new Error('Cartouche française non reconnue. Modules attendus : cd2353, cd62177a ou cd62048.');
}
