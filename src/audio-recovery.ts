export interface AudioClock { state: string; currentTime: number; suspend?(): Promise<void> }

/** Keep a Safari resume promise from leaving the sound button disabled forever. */
export async function resumeAudio(
  context: AudioClock | undefined,
  resume: () => Promise<void> | undefined,
  restart = false,
  timeoutMs = 3000
) {
  if (context?.state === 'closed') throw new Error('Le circuit audio est fermé. Ouvre le jeu dans un nouvel onglet.');
  const operation = restart && context?.state === 'running' && context.suspend
    ? context.suspend().then(() => resume())
    : resume();
  if (!operation) throw new Error('Le son se prépare. Réessaie dans un instant.');
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    await Promise.race([
      operation,
      new Promise<never>((_, reject) => { timer = setTimeout(() => reject(new Error('Le navigateur ne relance pas le son. Essaie dans un nouvel onglet.')), timeoutMs); })
    ]);
    if (context && context.state !== 'running') throw new Error('Le navigateur garde le son interrompu. Touche Réactiver le son ou ouvre un nouvel onglet.');
  } finally { clearTimeout(timer); }
}

/** Observe the audio clock, not the volume: intentional silence is healthy. */
export class AudioHealth {
  private clock: number | undefined;
  private changedAt = 0;
  inspect(context: AudioClock | undefined, visible: boolean, now: number): 'ready' | 'interrupted' | 'stalled' | 'unavailable' {
    if (!visible) { this.clock = undefined; return 'ready'; }
    if (!context) return 'unavailable';
    if (context.state !== 'running') { this.clock = undefined; return 'interrupted'; }
    if (this.clock === undefined || context.currentTime !== this.clock) {
      this.clock = context.currentTime; this.changedAt = now; return 'ready';
    }
    return now - this.changedAt >= 3000 ? 'stalled' : 'ready';
  }
}
