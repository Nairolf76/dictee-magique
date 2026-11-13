interface Module {
  FS: { mkdirTree(path: string): void; writeFile(path: string, bytes: Uint8Array): void };
  callMain(args: string[]): void;
  cwrap(name: string, returns: string | null, args: string[]): (...args: number[]) => number;
  dmResumeAudio(): Promise<void> | undefined;
  dmVolume(value: number): void;
  [key: string]: unknown;
}
declare global { interface Window { Module: Module } }

export class DicteeEngine {
  private key?: (...args: number[]) => number;
  private resetMachine?: () => number;
  private started = false;
  private ready = false;
  public readonly log: string[] = [];
  constructor(private canvas: HTMLCanvasElement, private digit: (index: number, mask: number) => void, private speech: (address:number)=>void = ()=>{}) {}
  start(zip: Uint8Array, cartridge?: Uint8Array): Promise<void> {
    if (this.started) return Promise.reject(new Error('Rechargez la page pour charger une autre ROM.'));
    this.started = true;
    return new Promise((resolve, reject) => {
      const timer = window.setTimeout(() => reject(new Error('Le moteur ne répond pas. Rechargez la page pour réessayer.')), 45000);
      const fail = (reason: unknown) => { clearTimeout(timer); reject(new Error(String(reason))); };
      const print = (text: string) => { this.log.push(text); if(this.log.length>100)this.log.shift(); };
      window.Module = {
        noInitialRun: true, canvas: this.canvas, locateFile: (name: string) => new URL('engine/'+name,document.baseURI).href,
        print, printErr: print, onAbort: fail,
        onSpeech: (address:number) => this.speech(address),
        onDigit: (index: number, mask: number) => this.digit(index, mask),
        onMachineReady: () => {
          // Defer until machine startup has yielded to the browser.
          setTimeout(() => { clearTimeout(timer); this.ready = true; resolve(); }, 0);
        },
        onRuntimeInitialized: () => {
          try {
            const m = window.Module;
            m.FS.mkdirTree('/roms'); m.FS.writeFile('/roms/snspellfr.zip', zip);
            if(cartridge)m.FS.writeFile('/roms/module.bin',cartridge);
            this.key = m.cwrap('dm_key', 'number', ['number', 'number', 'number']);
            this.resetMachine = m.cwrap('dm_reset', null, []);
            m.callMain(['snspellfr', '-rompath', '/roms', '-skip_gameinfo', '-noreadconfig', '-nowriteconfig', '-window', '-video', 'soft', '-sound', 'js', ...(cartridge?['-cart','/roms/module.bin']:[])]);
          } catch(e) { fail(e); }
        }
      } as unknown as Module;
      const script = document.createElement('script'); script.src = new URL('engine/dictee.js',document.baseURI).href;
      script.onerror = () => fail('Moteur introuvable. Consulter la procédure de compilation du README.');
      document.head.append(script);
    });
  }
  setKey(row: number, mask: number, down: number) { if (this.ready) this.key?.(row, mask, down); }
  setSpeechBusy(value:boolean) { if(window.Module)window.Module.dmSpeechBusy=value; }
  reset() { if (this.ready) this.resetMachine?.(); }
  async enableAudio() {
    if (!this.ready) throw new Error('Allumez d’abord la machine.');
    const operation = window.Module.dmResumeAudio();
    if (!operation) throw new Error('Le son se prépare. Réessayez dans un instant.');
    await operation;
  }
  volume(value: number) { if (this.ready) window.Module.dmVolume(value); }
}
