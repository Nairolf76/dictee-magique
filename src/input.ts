export class InputController {
  private held = new Map<string, readonly [number, number]>();
  constructor(private send: (row: number, mask: number, pressed: number) => void) {}
  press(id: string, row: number, mask: number) {
    if (this.held.has(id)) return;
    const alreadyDown = [...this.held.values()].some(([r,m]) => row === r && mask === m);
    this.held.set(id, [row, mask]);
    if (!alreadyDown) this.send(row, mask, 1);
  }
  release(id: string) {
    const entry = this.held.get(id);
    if (!entry) return;
    this.held.delete(id);
    if (![...this.held.values()].some(([r,m]) => entry[0] === r && entry[1] === m)) this.send(...entry, 0);
  }
  releaseAll() { for (const id of this.held.keys()) this.release(id); }
}
