import { heroTimeline } from './stories.mjs';
import { clampProgress, phaseAtProgress, sceneAtProgress } from './hero-scene.mjs';

const phaseNames = Object.freeze({ brief: '接需求', scramble: '救火', deliver: '交付' });

// One owned clock controls the authored loop; scrubbing writes the same scene model directly.
export function initHeroMotion(hero, reduced) {
  if (!hero || !Element.prototype.animate) return;
  const pauseButton = hero.querySelector('[data-hero-pause]');
  const replayButton = hero.querySelector('[data-hero-replay]');
  const status = hero.querySelector('[data-hero-status]');
  const scrubber = hero.querySelector('[data-hero-scrubber]');
  const phaseLabel = hero.querySelector('[data-phase-label]');
  const phaseMarkers = [...hero.querySelectorAll('[data-phase-marker]')];
  const projectButtons = [...hero.querySelectorAll('[data-hero-project]')];
  hero.querySelector('.hero-motion-controls')?.removeAttribute('hidden');
  const pauses = new Set(document.hidden ? ['hidden'] : []);
  const duration = heroTimeline.durationMs;
  const maxLoops = heroTimeline.maxLoops;
  const ease = 'cubic-bezier(.23,1,.32,1)';
  let animations = [];
  let primaryAnimation = null;
  let generation = 0;
  let loop = 0;
  let ready = false;
  let cameraFrame = 0;
  let clockFrame = 0;
  let measuredHeight = hero.offsetHeight;
  let pointer = { x: 0, y: 0 };
  let scroll = 0;
  let progress = 0;
  let scrubbing = false;
  let idleTimer = 0;
  let scrollIntentUntil = 0;
  const lettering = hero.querySelector('.hero-lettering');
  const character = hero.querySelector('.hero-art');
  const lines = hero.querySelector('.hero-motion-lines');
  const tags = hero.querySelector('.hero-project-tags');
  const comicRail = hero.querySelector('.hero-comic-rail');
  const cue = hero.querySelector('.hero-stage-cue');

  function phaseText(value) {
    return phaseNames[phaseAtProgress(value)];
  }

  function updateProgressUI(value) {
    progress = clampProgress(value);
    const phase = phaseAtProgress(progress);
    if (scrubber) {
      scrubber.value = String(Math.round(progress * 100));
      scrubber.setAttribute('aria-valuetext', phaseText(progress));
    }
    if (phaseLabel) phaseLabel.textContent = phaseText(progress);
    phaseMarkers.forEach(marker => marker.dataset.active = marker.dataset.phaseMarker === phase ? 'true' : 'false');
    hero.dataset.phase = phase;
  }

  function applySceneState(value) {
    const scene = sceneAtProgress(value, { mobile: matchMedia('(max-width:700px)').matches });
    updateProgressUI(scene.progress);
    if (lettering) { lettering.style.opacity = scene.lettering.opacity; lettering.style.transform = scene.lettering.transform; }
    if (character) { character.style.opacity = scene.character.opacity; character.style.transform = scene.character.transform; }
    if (lines) { lines.style.opacity = scene.lines.opacity; lines.style.transform = scene.lines.transform; }
    if (tags) { tags.style.opacity = scene.tags.opacity; tags.style.transform = scene.tags.transform; }
    if (comicRail) { comicRail.style.opacity = scene.comicRail.opacity; comicRail.style.transform = scene.comicRail.transform; }
    if (cue) { cue.style.opacity = scene.cue.opacity; cue.style.transform = scene.cue.transform; }
    hero.classList.toggle('is-phase-brief', scene.phase === 'brief');
    hero.classList.toggle('is-phase-scramble', scene.phase === 'scramble');
    hero.classList.toggle('is-phase-deliver', scene.phase === 'deliver');
    return scene;
  }

  function currentClockProgress() {
    if (!primaryAnimation || primaryAnimation.currentTime == null) return progress;
    return clampProgress(Number(primaryAnimation.currentTime) / duration);
  }

  function syncClock() {
    clockFrame = 0;
    if (!primaryAnimation || scrubbing) return;
    updateProgressUI(currentClockProgress());
    if (primaryAnimation.playState === 'running' && pauses.size === 0) clockFrame = requestAnimationFrame(syncClock);
  }

  function scheduleClock() {
    if (!clockFrame && primaryAnimation && !scrubbing) clockFrame = requestAnimationFrame(syncClock);
  }

  function syncPause() {
    const stopped = pauses.size > 0;
    for (const animation of animations) stopped ? animation.pause() : animation.play();
    hero.classList.toggle('is-stage-paused', stopped && animations.length > 0);
    const manual = pauses.has('manual');
    pauseButton?.setAttribute('aria-pressed', String(manual));
    if (pauseButton) pauseButton.textContent = manual ? '继续播放' : '暂停动画';
    if (manual && status) status.textContent = `已暂停 · ${phaseText(progress)}`;
    if (!stopped) scheduleClock();
  }

  function clear() {
    generation++;
    if (clockFrame) cancelAnimationFrame(clockFrame);
    clockFrame = 0;
    for (const animation of animations) animation.cancel();
    animations = [];
    primaryAnimation = null;
    hero.classList.remove('is-stage-running', 'is-stage-paused');
  }

  function settle() {
    clear();
    scrubbing = false;
    applySceneState(1);
    hero.classList.add('is-stage-settled');
    if (status) status.textContent = reduced.matches ? '静态阅读' : '片段已播完';
    if (pauseButton) pauseButton.hidden = true;
  }

  function track(selector, keyframes) {
    const element = typeof selector === 'string' ? hero.querySelector(selector) : selector;
    if (!element) return;
    const animation = element.animate(keyframes, { duration, fill: 'both', easing: 'linear' });
    animation.pause();
    animation.currentTime = 0;
    animations.push(animation);
    return animation;
  }

  function scene(first, { from = 0, resumed = false } = {}) {
    clear();
    const ticket = generation;
    scrubbing = false;
    hero.classList.remove('is-stage-settled', 'is-stage-scrubbing');
    hero.classList.add('is-stage-running');
    if (pauseButton) pauseButton.hidden = false;
    if (status) status.textContent = `现场片段 ${Math.max(1, loop)} / ${maxLoops}`;
    const mobile = matchMedia('(max-width:700px)').matches;
    const leader = track(lettering, [
      { offset: 0, opacity: first ? .25 : 1, transform: first ? 'translate(-70px,12px) rotate(-2deg) scale(.94)' : 'none', easing: ease },
      { offset: .11, opacity: 1, transform: 'none', easing: ease },
      { offset: .29, transform: 'none', easing: ease },
      { offset: .44, transform: `translate(${mobile ? -3 : -13}px,-4px) rotate(-.6deg) scale(.98)`, easing: ease },
      { offset: .66, transform: `translate(${mobile ? 2 : 8}px,0) rotate(.3deg) scale(1.012)`, easing: ease },
      { offset: .88, transform: 'none' },
      { offset: 1, opacity: 1, transform: 'none' },
    ]);
    primaryAnimation = leader;
    track(character, [
      { offset: 0, opacity: first ? .4 : 1, transform: first ? 'translate(130px,50px) rotate(3deg) scale(.9)' : 'none', easing: ease },
      { offset: .12, opacity: 1, transform: 'none', easing: ease },
      { offset: .28, transform: 'none', easing: ease },
      { offset: .43, transform: `translate(${mobile ? -9 : -28}px,-9px) rotate(-1deg) scale(1.025)`, easing: ease },
      { offset: .65, transform: `translate(${mobile ? 4 : 12}px,3px) rotate(.4deg) scale(1.008)`, easing: ease },
      { offset: .88, transform: 'none' },
      { offset: 1, opacity: 1, transform: 'none' },
    ]);
    track(lines, [
      { offset: 0, opacity: 0, transform: 'scale(.84)', easing: ease },
      { offset: .13, opacity: .65, transform: 'scale(1)' },
      { offset: .3, opacity: .3, transform: 'scale(1)' },
      { offset: .43, opacity: .85, transform: 'scale(1.05)', easing: ease },
      { offset: .65, opacity: .36, transform: 'scale(1)' },
      { offset: 1, opacity: .36, transform: 'scale(1)' },
    ]);
    track(tags, [
      { offset: 0, opacity: 0, transform: 'translate(100px,-24px) rotate(8deg) scale(.85)' },
      { offset: .17, opacity: 0, transform: 'translate(100px,-24px) rotate(8deg) scale(.85)', easing: ease },
      { offset: .27, opacity: 1, transform: 'translate(0,0) rotate(-2deg)' },
      { offset: .4, opacity: 1, transform: 'translate(0,0) rotate(-2deg)', easing: ease },
      { offset: .53, opacity: .7, transform: 'translate(8px,12px) rotate(1deg)' },
      { offset: 1, opacity: .7, transform: 'translate(8px,12px) rotate(1deg)' },
    ]);
    track('#reaction-text', [
      { offset: 0, transform: 'none' },
      { offset: .31, transform: 'none', easing: ease },
      { offset: .37, transform: 'rotate(3deg) scale(1.1)', easing: ease },
      { offset: .46, transform: 'none' },
      { offset: 1, transform: 'none' },
    ]);
    track(comicRail, [
      { offset: 0, opacity: first ? 0 : .9, transform: first ? 'translate(90px,65px) rotate(14deg) scale(.8)' : 'rotate(2deg)' },
      { offset: .44, opacity: 0, transform: 'translate(90px,65px) rotate(14deg) scale(.8)', easing: ease },
      { offset: .59, opacity: 1, transform: 'translate(-4px,-8px) rotate(-1deg) scale(1.04)', easing: ease },
      { offset: .72, opacity: .95, transform: 'rotate(2deg)' },
      { offset: 1, opacity: .9, transform: 'rotate(2deg)' },
    ]);
    track(cue, [
      { offset: 0, opacity: first ? 0 : 1, transform: 'translateX(0)' },
      { offset: .56, opacity: 0, transform: 'translateX(20px)', easing: ease },
      { offset: .69, opacity: 1, transform: 'translateX(0)' },
      { offset: 1, opacity: 1, transform: 'translateX(0)' },
    ]);
    for (const [index, accent] of [...hero.querySelectorAll('.hero-accent')].entries()) {
      track(accent, [
        { offset: 0, opacity: 0, transform: 'scale(.6)' },
        { offset: .1 + index * .03, opacity: 0, transform: 'scale(.6)', easing: ease },
        { offset: .18 + index * .03, opacity: 1, transform: 'scale(1)' },
        { offset: 1, opacity: 1, transform: 'scale(1)' },
      ]);
    }
    const start = document.timeline.currentTime;
    const offset = clampProgress(from) * duration;
    for (const animation of animations) animation.startTime = start - offset;
    updateProgressUI(from);
    syncPause();
    scheduleClock();
    leader?.finished.then(() => {
      if (ticket !== generation) return;
      if (resumed || from > 0) { settle(); return; }
      if (loop < maxLoops) scene(false, { from: 0 });
      else settle();
    }).catch(() => {});
  }

  function restart() {
    clearTimeout(idleTimer);
    pauses.delete('manual');
    pauseButton?.setAttribute('aria-pressed', 'false');
    loop = 0;
    scrubbing = false;
    if (reduced.matches) settle();
    else if (ready) { loop = 1; scene(true, { from: 0 }); }
  }

  function scheduleCamera() {
    if (!cameraFrame) cameraFrame = requestAnimationFrame(paintCamera);
  }

  function paintCamera() {
    cameraFrame = 0;
    if (!reduced.matches && pauses.size > 0) return;
    const neutral = reduced.matches;
    const x = neutral ? 0 : pointer.x;
    const y = neutral ? 0 : pointer.y;
    const travel = neutral ? 0 : scroll;
    if (lettering) lettering.style.translate = `${-x * 7}px ${-y * 4 - travel * 26}px`;
    if (character) character.style.translate = `${x * 11}px ${y * 6 + travel * 38}px`;
  }

  function scheduleResume() {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      if (!scrubbing || pauses.size || reduced.matches) return;
      scene(false, { from: progress, resumed: true });
    }, 1200);
  }

  function takeControl(value, source = 'scrub') {
    if (reduced.matches) return;
    const next = clampProgress(value);
    clearTimeout(idleTimer);
    const current = primaryAnimation ? currentClockProgress() : progress;
    clear();
    progress = current;
    scrubbing = true;
    hero.classList.remove('is-stage-settled');
    hero.classList.add('is-stage-scrubbing');
    applySceneState(next);
    if (status) status.textContent = `${source === 'scroll' ? '滚动控制' : '手动控制'} · ${phaseText(next)}`;
    scheduleResume();
    scheduleCamera();
  }

  function setPause(reason, paused) {
    paused ? pauses.add(reason) : pauses.delete(reason);
    syncPause();
    scheduleCamera();
  }

  pauseButton?.addEventListener('click', () => setPause('manual', !pauses.has('manual')));
  replayButton?.addEventListener('click', restart);
  scrubber?.addEventListener('input', event => takeControl(Number(event.currentTarget.value) / 100));
  scrubber?.addEventListener('change', scheduleResume);
  projectButtons.forEach(button => button.addEventListener('click', () => {
    projectButtons.forEach(item => item.dataset.active = item === button ? 'true' : 'false');
    hero.dataset.activeProject = button.dataset.heroProject;
    takeControl(button.dataset.heroProject === 'watch' ? 0.26 : 0.54, '项目');
  }));
  hero.addEventListener('hero-reaction', () => takeControl(Math.min(1, progress + 0.04), '反应'));
  hero.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse' || pauses.size || reduced.matches) return;
    pointer = { x: event.clientX / innerWidth * 2 - 1, y: event.clientY / measuredHeight * 2 - 1 };
    scheduleCamera();
  }, { passive: true });
  hero.addEventListener('pointerleave', () => { pointer = { x: 0, y: 0 }; scheduleCamera(); });
  const markScrollIntent = () => { scrollIntentUntil = performance.now() + 180; };
  addEventListener('wheel', markScrollIntent, { passive: true });
  addEventListener('touchmove', markScrollIntent, { passive: true });
  addEventListener('keydown', event => {
    if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(event.key)) markScrollIntent();
  }, { passive: true });
  addEventListener('scroll', () => {
    const bounds = hero.getBoundingClientRect();
    scroll = Math.min(1, Math.max(0, -bounds.top / Math.max(1, measuredHeight)));
    if (!reduced.matches && performance.now() < scrollIntentUntil && bounds.top < 0 && bounds.bottom > 0) takeControl(scroll, 'scroll');
    if (!pauses.has('offscreen')) scheduleCamera();
  }, { passive: true });
  if ('ResizeObserver' in window) new ResizeObserver(() => { measuredHeight = hero.offsetHeight; }).observe(hero);
  if ('IntersectionObserver' in window) new IntersectionObserver(([entry]) => setPause('offscreen', !entry.isIntersecting), { threshold: .08 }).observe(hero);
  document.addEventListener('visibilitychange', () => setPause('hidden', document.hidden));
  addEventListener('pagehide', () => setPause('pagehide', true));
  addEventListener('pageshow', () => setPause('pagehide', false));
  reduced.addEventListener('change', () => { restart(); scheduleCamera(); });
  if (pauseButton) pauseButton.hidden = true;
  if (replayButton) replayButton.disabled = true;
  if (status) status.textContent = '插画准备中';
  if (reduced.matches) settle();
  Promise.all([...hero.querySelectorAll('.hero-lettering img,.hero-art img')]
    .map(img => img.decode().catch(() => {})))
    .then(() => document.fonts?.ready)
    .then(() => {
      ready = true;
      if (replayButton) replayButton.disabled = false;
      restart();
    });
}
