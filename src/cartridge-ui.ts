import {CARTRIDGES,validateCartridge,type StoredCartridge} from './cartridges';
import {appStore} from './storage';
export async function selectedCartridge():Promise<StoredCartridge|undefined>{
  const id=await appStore.get<string>('prefs','cartridge');if(!id)return;
  const record=await appStore.get<StoredCartridge>('cartridges',id);
  if(!record)throw new Error('Cartouche sélectionnée absente. Choisis la ROM interne ou réimporte la cartouche.');
  const verified=await validateCartridge(record.bytes);if(verified.id!==id)throw new Error('Cartouche mémorisée incorrecte. Réimporte-la.');return verified;
}
export function setupCartridges(){
  const panel=document.createElement('details');panel.className='guide cartridge-panel';
  panel.innerHTML=`<summary>Cartouches françaises <span aria-hidden="true">＋</span></summary><p>Ajoute un module original depuis un ZIP ou une ROM brute. La ROM principale française reste nécessaire.</p><label class="secondary file-pick">Importer une cartouche<input id="cartridge-import" type="file" accept=".zip,.bin,.vsm"></label><div id="cartridge-catalogue"></div><label for="cartridge-select">Au prochain démarrage</label><select id="cartridge-select"><option value="">ROM interne · sans cartouche</option></select><button id="apply-cartridge" class="secondary">Charger et redémarrer</button><p id="cartridge-notice" role="status"></p><p>Avec une cartouche chargée : Marche, puis <b>Module</b>, choisis un niveau et appuie sur Départ. Changer de module redémarre le jouet.</p>`;
  document.querySelector('#start')!.before(panel);
  const notice=panel.querySelector<HTMLElement>('#cartridge-notice')!,select=panel.querySelector<HTMLSelectElement>('#cartridge-select')!;
  const say=(text:string)=>{notice.textContent=text;};
  async function render(){
    const records=await appStore.all<StoredCartridge>('cartridges'),active=await appStore.get<string>('prefs','cartridge')||'';
    const catalogue=panel.querySelector('#cartridge-catalogue')!;catalogue.replaceChildren();select.replaceChildren(new Option('ROM interne · sans cartouche',''));
    for(const spec of CARTRIDGES){
      const exists=records.some(c=>c.id===spec.id),row=document.createElement('p');row.className='cartridge-row';
      const label=document.createElement('span');label.textContent=spec.title+(exists?' · importée':' · à importer');row.append(label);
      const option=new Option(spec.title,spec.id);option.disabled=!exists;select.append(option);
      if(exists){const remove=document.createElement('button');remove.type='button';remove.className='text-button';remove.textContent='Effacer';remove.setAttribute('aria-label','Effacer '+spec.title);remove.addEventListener('click',()=>void(async()=>{if(!confirm('Effacer uniquement cette cartouche mémorisée ?'))return;try{await appStore.removeSessionOrStored('cartridges',spec.id);if(active===spec.id){await appStore.put('prefs','cartridge','');if(appStore.durable)location.reload();else say('La cartouche a été retirée pour cette session.');}else await render();}catch{say('La suppression n’a pas pu être enregistrée.');}})());row.append(remove);}catalogue.append(row);
    }
    select.value=active;
  }
  panel.querySelector('#cartridge-import')!.addEventListener('change',()=>void(async()=>{
    const input=panel.querySelector<HTMLInputElement>('#cartridge-import')!,file=input.files?.[0];if(!file)return;
    try{if(file.size>4194304)throw new Error('Archive trop volumineuse : maximum 4 Mo.');const result=await validateCartridge(new Uint8Array(await file.arrayBuffer()));await appStore.put('cartridges',result.id,result);await render();select.value=result.id;say(appStore.durable?'Cartouche reconnue. Charger et redémarrer pour l’utiliser.':'Cartouche reconnue, mais le stockage est indisponible : le redémarrage ne peut pas la conserver.');}catch(error){say((error as Error).message);}finally{input.value='';}
  })());
  panel.querySelector('#apply-cartridge')!.addEventListener('click',()=>void(async()=>{await appStore.put('prefs','cartridge',select.value);if(!appStore.durable){say('Le navigateur refuse le stockage. Le changement ne sera pas conservé au redémarrage.');return;}location.reload();})());
  void render();
}
