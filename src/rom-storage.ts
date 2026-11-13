import {appStore,AppStore} from './storage';
export class RomStorage {
  private store:AppStore;
  constructor(name?:string){this.store=name?new AppStore(name):appStore;}
  async load():Promise<Uint8Array|undefined>{const value=await this.store.get<Uint8Array>('rom','fr');if(value!==undefined&&(!(value instanceof Uint8Array)||value.length>4194304))throw new Error('ROM mémorisée invalide.');return value;}
  async save(zip:Uint8Array){await this.store.put('rom','fr',zip);if(!this.store.durable)throw new Error('Stockage indisponible.');}
  async clear(){await this.store.delete('rom','fr');}
}
