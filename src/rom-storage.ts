// A single verified archive, scoped to this installation (including Pages subpaths).
export class RomStorage {
  constructor(private name='dictee-magique:'+new URL('.',location.href).pathname) {}
  private open():Promise<IDBDatabase> {
    return new Promise((resolve,reject)=>{
      const request=indexedDB.open(this.name,1);
      let expired=false;
      const timer=setTimeout(()=>{expired=true;reject(new Error('Stockage local indisponible.'));},3000);
      request.onupgradeneeded=()=>{request.result.createObjectStore('rom');};
      request.onsuccess=()=>{clearTimeout(timer);if(expired)request.result.close();else resolve(request.result);};
      request.onerror=()=>{clearTimeout(timer);reject(request.error);};
    });
  }
  private async transaction(mode:IDBTransactionMode,operation:(store:IDBObjectStore)=>IDBRequest):Promise<unknown> {
    const db=await this.open();
    try {
      return await new Promise((resolve,reject)=>{
        const tx=db.transaction('rom',mode),request=operation(tx.objectStore('rom'));
        const timer=setTimeout(()=>{tx.abort();reject(new Error('Stockage local indisponible.'));},3000);
        tx.oncomplete=()=>{clearTimeout(timer);resolve(request.result);};
        tx.onabort=()=>{clearTimeout(timer);reject(tx.error??new Error('Stockage local indisponible.'));};
      });
    } finally {db.close();}
  }
  async load():Promise<Uint8Array|undefined> {
    const value=await this.transaction('readonly',store=>store.get('fr'));
    if(value===undefined)return;
    if(!(value instanceof Uint8Array)||value.length>4194304)throw new Error('ROM mémorisée invalide.');
    return value;
  }
  async save(zip:Uint8Array){await this.transaction('readwrite',store=>store.put(zip,'fr'));}
  async clear(){await this.transaction('readwrite',store=>store.delete('fr'));}
}
