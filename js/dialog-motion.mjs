/** Native dialog focus behavior, with short interruptible entrance and exit motion. */
export function createDialogMotion(dialog, { reduced = matchMedia('(prefers-reduced-motion: reduce)'), onClose } = {}) {
  let animation = null;
  let generation = 0;
  let phase = dialog.open ? 'open' : 'closed';
  let returnValue = '';
  const canAnimate = () => !reduced.matches && !document.hidden && typeof dialog.animate === 'function';

  function cancelAnimation() {
    generation++;
    animation?.cancel();
    animation = null;
  }

  function settle() {
    cancelAnimation();
    phase = dialog.open ? 'open' : 'closed';
    dialog.dataset.state = phase;
  }

  function completeClose() {
    cancelAnimation();
    phase = 'closed';
    dialog.dataset.state = phase;
    if (dialog.open) dialog.close(returnValue);
  }

  function run(keyframes, duration, easing, complete) {
    const token = generation;
    animation = dialog.animate(keyframes, { duration, easing, fill: 'both' });
    animation.finished.then(() => {
      if (token !== generation) return;
      complete();
    }).catch(() => {});
  }

  function open() {
    if (dialog.open && phase !== 'closing') return;
    const interrupted = dialog.open;
    const current = interrupted ? getComputedStyle(dialog) : null;
    const start = current ? { opacity: current.opacity, transform: current.transform } : null;
    cancelAnimation();
    if (!dialog.open) dialog.showModal();
    phase = 'opening';
    dialog.dataset.state = phase;
    if (!canAnimate()) { settle(); return; }
    run([
      start || { opacity: .6, transform: 'translateY(14px) scale(.985)' },
      { opacity: 1, transform: 'translateY(0) scale(1)' },
    ], 280, 'cubic-bezier(.16,1,.3,1)', settle);
  }

  function close(value = '') {
    if (!dialog.open || phase === 'closing') return;
    returnValue = value;
    const current = getComputedStyle(dialog);
    const start = { opacity: current.opacity, transform: current.transform };
    cancelAnimation();
    phase = 'closing';
    dialog.dataset.state = phase;
    // Playback stops as soon as the user dismisses the player.
    dialog.querySelectorAll('video,audio').forEach(media => media.pause());
    if (!canAnimate()) { completeClose(); return; }
    run([start, { opacity: 0, transform: 'translateY(8px) scale(.992)' }], 140, 'cubic-bezier(.4,0,1,1)', completeClose);
  }

  function onCancel(event) {
    event.preventDefault();
    close();
  }

  function onNativeClose() {
    // A synchronous close/reopen can leave an older native close event queued.
    if (dialog.open) return;
    settle();
    onClose?.();
  }

  function finish() {
    if (phase === 'closing') completeClose();
    else settle();
  }

  function onVisibility() { if (document.hidden) finish(); }
  function onPreference() { if (reduced.matches) finish(); }
  dialog.dataset.state = phase;
  dialog.addEventListener('cancel', onCancel);
  dialog.addEventListener('close', onNativeClose);
  document.addEventListener('visibilitychange', onVisibility);
  reduced.addEventListener('change', onPreference);

  return {
    open,
    close,
    finish,
    destroy() {
      finish();
      dialog.removeEventListener('cancel', onCancel);
      dialog.removeEventListener('close', onNativeClose);
      document.removeEventListener('visibilitychange', onVisibility);
      reduced.removeEventListener('change', onPreference);
    },
  };
}
