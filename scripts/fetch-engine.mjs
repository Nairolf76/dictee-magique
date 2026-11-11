// Download the published engine and verify against the source-controlled manifest.
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const manifest=JSON.parse(await readFile(new URL('../docs/engine-build.json',import.meta.url),'utf8'));
const target=new URL('../public/engine/',import.meta.url);
await mkdir(target,{recursive:true});
for(const name of ['dictee.js','dictee.wasm']){
  const response=await fetch('https://github.com/Nairolf76/dictee-magique/releases/download/v0.1.0/'+name);
  if(!response.ok)throw new Error('Téléchargement moteur : '+response.status);
  const bytes=new Uint8Array(await response.arrayBuffer());
  if(createHash('sha256').update(bytes).digest('hex')!==manifest.sha256[name])throw new Error('Empreinte incorrecte : '+name);
  await writeFile(new URL(name,target),bytes);
}
await writeFile(new URL('build.json',target),JSON.stringify(manifest,null,2)+'\n');
console.log('Moteur v0.1.0 téléchargé et vérifié.');
