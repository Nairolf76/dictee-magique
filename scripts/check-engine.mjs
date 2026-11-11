import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const root=new URL('../public/engine/',import.meta.url);
try {
  const info=JSON.parse(await readFile(new URL('build.json',root),'utf8'));
  if(info.revision!=='f34f02505e32c1993c6a782b6814232cbfc74e36'||info.emscripten!=='3.1.74')throw new Error('Version moteur inattendue');
  if(!info.features?.includes('speech-events')||!info.features?.includes('modern-talk-status'))throw new Error('Pont des voix modernes absent');
  for(const name of ['dictee.js','dictee.wasm']){
    const data=await readFile(new URL(name,root));
    if(createHash('sha256').update(data).digest('hex')!==info.sha256[name])throw new Error(`Empreinte moteur incorrecte : ${name}`);
    if(name.endsWith('wasm')&&!data.subarray(0,4).equals(Buffer.from([0,97,115,109])))throw new Error('Signature WebAssembly incorrecte');
  }
  console.log('Moteur WebAssembly figé et vérifié.');
} catch(e) { console.error('Build interrompu : '+e.message+'. Suivre README.md pour compiler et exporter le moteur.');process.exitCode=1; }
