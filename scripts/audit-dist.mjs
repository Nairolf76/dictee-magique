import { readdir,readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const forbidden = new Set(['a8bc118c83a84260033734191dcaa71a93dfa52b','2d127d98028ec8ec6ea10c179c25e447b14ba4d0','67b691e7c0b97239410587e50e5182bf46475b43','9a8ac690902731e1e01533279a1c9223011e1537','e16043766c385e152b7005c1c010be4c5fccdd9b']);
async function inspect(dir){
  for(const entry of await readdir(dir,{withFileTypes:true})){
    const path=new URL(entry.name+(entry.isDirectory()?'/':''),dir);
    if(entry.isDirectory())await inspect(path);
    else{
      if(/\.(zip|vsm|pla)$/i.test(entry.name))throw new Error('Fichier ROM/archive interdit dans dist : '+path.pathname);
      const data=await readFile(path);
      if(forbidden.has(createHash('sha1').update(data).digest('hex')))throw new Error('ROM propriétaire détectée dans dist');
    }
  }
}
await inspect(new URL('../dist/',import.meta.url));
console.log('Distribution vérifiée : aucun fichier ROM connu ni archive ROM.');
