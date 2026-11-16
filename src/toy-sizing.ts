/** Match .toy's content-box cqw on browsers without container query units. */
export function setupToySizing(toy: HTMLElement): () => void {
  if (typeof CSS !== 'undefined' && CSS.supports('width', '1cqw') && CSS.supports('container-type', 'inline-size')) return () => {};
  const oldValue = toy.style.getPropertyValue('--toy-unit');
  const oldPriority = toy.style.getPropertyPriority('--toy-unit');
  let width = -1;
  let frame = 0;
  let disposed = false;
  const measure = () => {
    frame = 0;
    if (disposed) return;
    const style = getComputedStyle(toy);
    const next = toy.clientWidth - (parseFloat(style.paddingLeft) || 0) - (parseFloat(style.paddingRight) || 0);
    // Hidden/detached toys retain their last size until ResizeObserver sees them.
    if (next <= 0 || Math.abs(next - width) < .01) return;
    width = next;
    toy.style.setProperty('--toy-unit', `${next / 100}px`);
  };
  const schedule = () => {
    if (!disposed && !frame) frame = requestAnimationFrame(measure);
  };
  const observer = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(schedule);
  observer?.observe(toy);
  window.addEventListener('resize', schedule);
  document.addEventListener('fullscreenchange', schedule);
  document.addEventListener('webkitfullscreenchange', schedule);
  measure();
  return () => {
    disposed = true;
    observer?.disconnect();
    if (frame) cancelAnimationFrame(frame);
    window.removeEventListener('resize', schedule);
    document.removeEventListener('fullscreenchange', schedule);
    document.removeEventListener('webkitfullscreenchange', schedule);
    if (oldValue) toy.style.setProperty('--toy-unit', oldValue, oldPriority);
    else toy.style.removeProperty('--toy-unit');
  };
}
