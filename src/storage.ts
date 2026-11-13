export const STORES=['rom','lists','prefs','results','cartridges'] as const;
export type StoreName=typeof STORES[number];
/** Version 2 preserves the original v1 rom/fr entry. Every write has a session fallback. */
export class AppStore {
  durable=true;
  private memory=new Map<StoreName,Map<string,unknown>>(STORES.map(name=>[name,new Map()]));
  private connection?:Promise<IDBDatabase>;
  constructor(private name='dictee-magique:'+(typeof location==='undefined'?'/':new URL('.',location.href).pathname)){}
  private open(){
    return this.connection??=new Promise<IDBDatabase>((resolve,reject)=>{
      const request=indexedDB.open(this.name,2);let expired=false;
      const timer=setTimeout(()=>{expired=true;reject(new Error('Stockage indisponible.'));},3000);
      request.onupgradeneeded=()=>{for(const name of STORES)if(!request.result.objectStoreNames.contains(name))request.result.createObjectStore(name);};
      request.onsuccess=()=>{clearTimeout(timer);if(expired){request.result.close();return;}request.result.onversionchange=()=>{request.result.close();this.durable=false;};resolve(request.result);};
      request.onerror=()=>{clearTimeout(timer);reject(request.error);};
    });
  }
  private async run<T>(store:StoreName,mode:IDBTransactionMode,action:(s:IDBObjectStore,done:(v:T)=>void)=>void):Promise<T>{
    if(!this.durable)throw new Error('Stockage de session.');
    try{
      const db=await this.open();
      return await new Promise<T>((resolve,reject)=>{
        const tx=db.transaction(store,mode);let value:T;
        const timer=setTimeout(()=>{try{tx.abort();}catch{}reject(new Error('Stockage indisponible.'));},3000);
        tx.oncomplete=()=>{clearTimeout(timer);resolve(value);};
        tx.onabort=()=>{clearTimeout(timer);reject(tx.error??new Error('Stockage indisponible.'));};
        action(tx.objectStore(store),v=>{value=v;});
      });
    }catch(e){this.durable=false;throw e;}
  }
  async get<T>(store:StoreName,key:string):Promise<T|undefined>{
    try{const value=await this.run<T|undefined>(store,'readonly',(s,done)=>{const r=s.get(key);r.onsuccess=()=>done(r.result);});if(value!==undefined)this.memory.get(store)!.set(key,value);return value;}
    catch{return this.memory.get(store)!.get(key) as T|undefined;}
  }
  async all<T>(store:StoreName):Promise<T[]>{
    try{return await this.run<T[]>(store,'readonly',(s,done)=>{const result:T[]=[];const r=s.openCursor();r.onsuccess=()=>{const c=r.result;if(c){this.memory.get(store)!.set(String(c.key),c.value);result.push(c.value);c.continue();}else done(result);};});}
    catch{return [...this.memory.get(store)!.values()] as T[];}
  }
  async put<T>(store:StoreName,key:string,value:T){await this.putMany(store,[[key,value]]);}
  async putMany<T>(store:StoreName,values:[string,T][]){
    try{await this.run<void>(store,'readwrite',(s,done)=>{for(const [key,value] of values)s.put(value,key);done();});}catch{}
    for(const [key,value] of values)this.memory.get(store)!.set(key,structuredClone(value));
  }
  async delete(store:StoreName,key:string){
    // Deletion must report a persistent failure rather than falsely claim data was erased.
    await this.run<void>(store,'readwrite',(s,done)=>{s.delete(key);done();});this.memory.get(store)!.delete(key);
  }
  async removeSessionOrStored(store:StoreName,key:string){if(this.durable)await this.delete(store,key);else this.memory.get(store)!.delete(key);}
}
export const appStore=new AppStore();
