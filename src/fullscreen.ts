/** Native fullscreen with an immersive fallback for unsupported browsers. */
export function setupFullscreen(releaseKeys: () => void) {
  const enter = document.querySelector<HTMLButtonElement>('#fullscreen')!;
  const leave = document.querySelector<HTMLButtonElement>('#leave-fullscreen')!;
  const toy = document.querySelector<HTMLElement>('#toy')!;
  const root = document.documentElement;
  let active = false;
  let ownsFullscreen = false;

  function restore() {
    releaseKeys();
    active = false;
    ownsFullscreen = false;
    document.body.classList.remove('immersive');
    enter.setAttribute('aria-pressed', 'false');
    leave.hidden = true;
    enter.focus({ preventScroll: true });
  }
  async function exit() {
    const native = ownsFullscreen && document.fullscreenElement === root;
    restore();
    if (native) await document.exitFullscreen().catch(() => {});
  }
  enter.addEventListener('click', async () => {
    if (active) return;
    releaseKeys();
    active = true;
    document.body.classList.add('immersive');
    enter.setAttribute('aria-pressed', 'true');
    leave.hidden = false;
    toy.focus({ preventScroll: true });
    if (!document.fullscreenElement && root.requestFullscreen) {
      try {
        await root.requestFullscreen();
        ownsFullscreen = document.fullscreenElement === root;
        if (!active && ownsFullscreen) await document.exitFullscreen();
      } catch { /* The immersive layout remains usable without the native API. */ }
    }
  });
  leave.addEventListener('click', () => { void exit(); });
  document.addEventListener('fullscreenchange', () => {
    if (document.fullscreenElement === root && active) ownsFullscreen = true;
    else if (!document.fullscreenElement && ownsFullscreen) restore();
  });
  window.addEventListener('keydown', event => {
    if (active && event.key === 'Escape') {
      event.stopImmediatePropagation();
      void exit();
    }
  }, true);
}
