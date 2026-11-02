const arrow = direction => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${direction < 0 ? 'M19 12H5m6-6-6 6 6 6' : 'M5 12h14m-6-6 6 6-6 6'}"/></svg>`;
const ease = 'cubic-bezier(.16,1,.3,1)';
let sharedViewer;

/** A comic sheet travels from its real place on the page, then becomes a reader. */
export function createComicViewer({reduced = matchMedia('(prefers-reduced-motion: reduce)')} = {}) {
  if (sharedViewer) return sharedViewer;
  const dialog = document.createElement('dialog');
  dialog.id = 'comic-viewer';
  dialog.className = 'comic-viewer';
  dialog.dataset.state = 'closed';
  dialog.setAttribute('aria-labelledby', 'cv-title');
  dialog.innerHTML = `<header class="cv-toolbar"><h2 id="cv-title"></h2><span class="cv-count" aria-label="当前漫画格"></span><button class="cv-close" type="button" aria-label="收起漫画"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg></button></header>
    <div class="cv-desk"><button class="cv-arrow cv-side cv-prev" type="button" aria-label="上一格">${arrow(-1)}</button><div class="cv-stack"></div><button class="cv-arrow cv-side cv-next" type="button" aria-label="下一格">${arrow(1)}</button></div>
    <footer class="cv-footer"><p class="cv-caption" aria-live="polite"></p><div class="cv-nav-line"><button class="cv-arrow cv-bottom cv-prev" type="button" aria-label="上一格">${arrow(-1)}</button><nav class="cv-indexes" aria-label="选择漫画格"></nav><button class="cv-arrow cv-bottom cv-next" type="button" aria-label="下一格">${arrow(1)}</button></div><p class="cv-hint"><span class="cv-desktop-hint">方向键翻格 · Esc 收起</span><span class="cv-mobile-hint">左右滑动翻格 · 下拉收起</span></p></footer>`;
  document.body.append(dialog);
  const $ = selector => dialog.querySelector(selector);
  const $$ = selector => [...dialog.querySelectorAll(selector)];
  const stack = $('.cv-stack'), desk = $('.cv-desk');
  const chrome = [$('.cv-toolbar'), $('.cv-footer'), ...$$('.cv-side')];
  const cleanups = [];
  const animations = new Set(), ghosts = new Set(), sources = new Map();
  let items = [], index = 0, paper = null, opener = null, phase = 'closed';
  let generation = 0, frame = 0, gesture = null, layoutKey = '', suppressClickUntil = 0;
  let locked = false, previousOverflow = '', previousPadding = '';
  let lockedScroll = {x: 0, y: 0}, lockRevision = 0, scrollRestoreFrame = 0;
  const movable = () => !reduced.matches && !document.hidden && typeof Element.prototype.animate === 'function';
  const sourceOf = item => typeof item?.source === 'function' ? item.source() : item?.source;
  const rectOf = item => {
    const source = sourceOf(item);
    if (!source?.isConnected) return null;
    const rect = source.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0 ? rect : null;
  };
  const inView = rect => rect && rect.bottom > 0 && rect.top < innerHeight && rect.right > 0 && rect.left < innerWidth;
  const snapshot = element => {
    const style = getComputedStyle(element);
    return {transform: style.transform, opacity: style.opacity};
  };
  function listen(target, name, handler, options) {
    target.addEventListener(name, handler, options);
    cleanups.push(() => target.removeEventListener(name, handler, options));
  }
  function setPhase(value) { phase = value; dialog.dataset.state = value; }
  function restoreSources() {
    for (const [source, visibility] of sources) source.style.visibility = visibility;
    sources.clear();
  }
  function hideSource(item) {
    restoreSources();
    const source = sourceOf(item);
    if (!source?.isConnected) return;
    sources.set(source, source.style.visibility);
    source.style.visibility = 'hidden';
  }
  function lock() {
    if (locked) return;
    if (scrollRestoreFrame) cancelAnimationFrame(scrollRestoreFrame);
    scrollRestoreFrame = 0;
    lockedScroll = {x: scrollX, y: scrollY};
    lockRevision++;
    locked = true;
    previousOverflow = document.body.style.overflow;
    previousPadding = document.body.style.paddingRight;
    const gutter = innerWidth - document.documentElement.clientWidth;
    if (gutter > 0) document.body.style.paddingRight = `${parseFloat(getComputedStyle(document.body).paddingRight) + gutter}px`;
    document.body.style.overflow = 'hidden';
  }
  function restoreScroll(defer = false) {
    // Native dialog focus restoration may scroll before its queued close event.
    // The instant correction also bypasses the page's smooth-scroll preference.
    window.scrollTo({left: lockedScroll.x, top: lockedScroll.y, behavior: 'instant'});
    if (!defer) return;
    if (scrollRestoreFrame) cancelAnimationFrame(scrollRestoreFrame);
    const revision = lockRevision;
    scrollRestoreFrame = requestAnimationFrame(() => {
      scrollRestoreFrame = 0;
      if (!locked && !dialog.open && revision === lockRevision) {
        window.scrollTo({left: lockedScroll.x, top: lockedScroll.y, behavior: 'instant'});
      }
    });
  }
  function unlock() {
    if (!locked) return;
    locked = false;
    document.body.style.overflow = previousOverflow;
    document.body.style.paddingRight = previousPadding;
    restoreScroll();
  }
  function releaseGesture(preserveChrome = false) {
    if (gesture?.captured && desk.hasPointerCapture?.(gesture.id)) desk.releasePointerCapture(gesture.id);
    gesture = null;
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    if (!preserveChrome) {
      dialog.style.removeProperty('--cv-ground-opacity');
      chrome.forEach(element => element.style.removeProperty('opacity'));
    }
    dialog.classList.remove('cv-is-dragging');
  }
  function stop() {
    generation++;
    for (const animation of animations) animation.cancel();
    animations.clear();
    for (const ghost of ghosts) ghost.remove();
    ghosts.clear();
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
  }
  function animate(element, frames, duration, easing = ease, options = {}) {
    if (!movable()) return Promise.resolve();
    const animation = element.animate(frames, {duration, easing, fill: 'both', ...options});
    animations.add(animation);
    return animation.finished.catch(() => {}).finally(() => animations.delete(animation));
  }
  function makePaper(item) {
    const page = document.createElement('div');
    page.className = 'cv-paper';
    let frame = item.render?.();
    if (!(frame instanceof HTMLElement)) frame = document.createElement('div');
    if (frame.matches('button,a')) {
      const replacement = document.createElement('div');
      replacement.append(...frame.childNodes);
      frame = replacement;
    }
    frame.className = 'cv-frame';
    frame.removeAttribute('id');
    frame.removeAttribute('tabindex');
    frame.removeAttribute('role');
    for (const element of frame.querySelectorAll('[id]')) element.removeAttribute('id');
    for (const image of frame.querySelectorAll('img')) { image.loading = 'eager'; image.decoding = 'async'; image.draggable = false; }
    page.append(frame);
    return page;
  }
  function paintChrome() {
    $('.cv-count').textContent = `${String(index + 1).padStart(2, '0')} / ${String(items.length).padStart(2, '0')}`;
    $('.cv-caption').textContent = items[index]?.caption || `第 ${index + 1} 格`;
    $$('.cv-prev').forEach(button => button.disabled = index === 0);
    $$('.cv-next').forEach(button => button.disabled = index === items.length - 1);
    [...$('.cv-indexes').children].forEach((button, position) => {
      if (position === index) button.setAttribute('aria-current', 'true');
      else button.removeAttribute('aria-current');
    });
  }
  function paintIndexes() {
    $('.cv-indexes').replaceChildren(...items.map((item, position) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.setAttribute('aria-label', `查看第 ${position + 1} 格：${item.caption || ''}`);
      const number = document.createElement('span');
      number.className = 'cv-index-number';
      number.textContent = String(position + 1).padStart(2, '0');
      const label = document.createElement('span');
      label.className = 'cv-index-label';
      label.textContent = item.label || `第 ${position + 1} 格`;
      button.append(number, label);
      button.addEventListener('click', () => select(position));
      return button;
    }));
    paintChrome();
  }
  function layout() {
    if (!dialog.open) return false;
    const style = getComputedStyle(desk);
    const width = desk.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
    const height = desk.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);
    const key = `${width},${height}`;
    if (key === layoutKey) return false;
    layoutKey = key;
    desk.style.setProperty('--cv-width', `${Math.max(80, Math.min(480, width, height * 530 / 932))}px`);
    return true;
  }
  function settleOpen() {
    stop();
    releaseGesture();
    if (!dialog.open) return;
    paper?.style.removeProperty('transform');
    paper?.style.removeProperty('opacity');
    paper?.style.removeProperty('will-change');
    chrome.forEach(element => { element.style.removeProperty('opacity'); element.style.removeProperty('transform'); });
    setPhase('open');
  }
  function finishClose() {
    stop();
    releaseGesture();
    restoreSources();
    setPhase('closed');
    if (dialog.open) dialog.close();
    restoreScroll(true);
  }
  function flipTransform(from, to) {
    return `translate3d(${from.left - to.left}px,${from.top - to.top}px,0) scale(${from.width / to.width},${from.height / to.height})`;
  }
  function open(options = {}) {
    const nextItems = (options.items || []).filter(item => item && typeof item.render === 'function');
    if (!nextItems.length) return;
    const interrupted = dialog.open && phase === 'closing' && paper ? snapshot(paper) : null;
    stop();
    releaseGesture();
    restoreSources();
    items = nextItems;
    index = Math.max(0, Math.min(items.length - 1, options.index || 0));
    opener = options.opener || sourceOf(items[index]);
    const origin = rectOf(items[index]);
    $('.cv-toolbar h2').textContent = options.title || '羊在现场';
    paper = makePaper(items[index]);
    stack.replaceChildren(paper);
    paintIndexes();
    lock();
    if (!dialog.open) dialog.showModal();
    hideSource(items[index]);
    layoutKey = '';
    layout();
    $('.cv-close').focus({preventScroll: true});
    restoreScroll();
    setPhase('opening');
    if (!movable()) { settleOpen(); return; }
    const ticket = generation;
    const final = paper.getBoundingClientRect();
    const first = interrupted || {transform: inView(origin) ? flipTransform(origin, final) : 'translate3d(0,18px,0) scale(.97)', opacity: inView(origin) ? 1 : 0};
    paper.style.willChange = 'transform';
    const tasks = [animate(paper, [first, {transform: 'translate3d(0,0,0) scale(1)', opacity: 1}], 520)];
    chrome.forEach(element => tasks.push(animate(element, [{opacity: 0, transform: 'translateY(5px)'}, {opacity: 1, transform: 'none'}], 320)));
    Promise.all(tasks).then(() => { if (ticket === generation && dialog.open) settleOpen(); });
  }
  function close() {
    if (!dialog.open || phase === 'closing') return;
    const first = paper ? snapshot(paper) : null;
    const chromeOpacity = chrome.map(element => getComputedStyle(element).opacity);
    const groundOpacity = getComputedStyle(dialog, '::backdrop').opacity;
    stop();
    releaseGesture(true);
    restoreScroll();
    setPhase('closing');
    if (!movable() || !paper) { finishClose(); return; }
    const ticket = generation;
    const destination = rectOf(items[index]);
    // Read the untransformed sheet box so an interrupted drag returns precisely.
    const base = stack.getBoundingClientRect();
    const last = inView(destination)
      ? {transform: flipTransform(destination, base), opacity: 1}
      : {transform: 'translate3d(0,18px,0) scale(.97)', opacity: 0};
    const tasks = [animate(paper, [first, last], inView(destination) ? 340 : 200, 'cubic-bezier(.3,0,.3,1)')];
    chrome.forEach((element, position) => tasks.push(animate(element, [{opacity: chromeOpacity[position]}, {opacity: 0}], 160)));
    if (typeof KeyframeEffect !== 'undefined' && 'pseudoElement' in KeyframeEffect.prototype) {
      tasks.push(animate(dialog, [{opacity: groundOpacity}, {opacity: 0}], 340, 'ease-in', {pseudoElement: '::backdrop'}));
    }
    Promise.all(tasks).then(() => { if (ticket === generation) finishClose(); });
  }
  function select(nextIndex) {
    if (!dialog.open || !paper || phase === 'closing') return;
    const next = Math.max(0, Math.min(items.length - 1, nextIndex));
    if (next === index) return;
    const direction = next > index ? 1 : -1;
    const outgoing = paper, first = snapshot(outgoing);
    stop();
    releaseGesture();
    index = next;
    paper = makePaper(items[index]);
    stack.append(paper);
    ghosts.add(outgoing);
    hideSource(items[index]);
    paintChrome();
    layout();
    setPhase('switching');
    if (!movable()) { outgoing.remove(); ghosts.delete(outgoing); settleOpen(); return; }
    const ticket = generation;
    const travel = Math.min(190, stack.clientWidth * .55);
    paper.style.willChange = outgoing.style.willChange = 'transform, opacity';
    const tasks = [
      animate(outgoing, [first, {transform: `translate3d(${-direction * travel}px,7px,0) rotateY(${-direction * 9}deg) rotate(${-direction * 1.2}deg) scale(.97)`, opacity: 0}], 300, 'cubic-bezier(.4,0,.3,1)'),
      animate(paper, [{transform: `translate3d(${direction * travel}px,7px,0) rotateY(${direction * 9}deg) rotate(${direction * .8}deg) scale(.98)`, opacity: 0}, {transform: 'translate3d(0,0,0) rotateY(0) rotate(0) scale(1)', opacity: 1}], 390),
    ];
    Promise.all(tasks).then(() => { if (ticket === generation) settleOpen(); });
  }
  function move(direction) { select(index + Math.sign(direction)); }
  function paintDrag() {
    frame = 0;
    if (!gesture?.axis || !paper) return;
    const {dx, dy, axis} = gesture;
    if (axis === 'x') {
      const blocked = (index === 0 && dx > 0) || (index === items.length - 1 && dx < 0);
      const x = blocked ? dx * .28 : dx;
      paper.style.transform = `translate3d(${x}px,${Math.abs(x) * .018}px,0) rotate(${Math.max(-5, Math.min(5, x * .012))}deg) scale(${Math.max(.96, 1 - Math.abs(x) / 7000)})`;
    } else {
      const y = dy < 0 ? dy * .2 : dy;
      paper.style.transform = `translate3d(${dx * .15}px,${y}px,0) rotate(${Math.max(-3, Math.min(3, dx * .012))}deg) scale(${Math.max(.9, 1 - Math.max(0, y) / 2800)})`;
      dialog.style.setProperty('--cv-ground-opacity', String(Math.max(.5, 1 - Math.max(0, y) / 500)));
      chrome.forEach(element => element.style.opacity = String(Math.max(.25, 1 - Math.max(0, y) / 300)));
    }
  }
  function returnSheet() {
    if (!paper) return;
    const first = snapshot(paper);
    const dx = gesture?.dx || 0;
    const chromeOpacity = chrome.map(element => getComputedStyle(element).opacity);
    const groundOpacity = getComputedStyle(dialog, '::backdrop').opacity;
    stop();
    releaseGesture(true);
    if (!movable()) { settleOpen(); return; }
    const ticket = generation;
    setPhase('settling');
    const tasks = [animate(paper, [first, {transform: `translate3d(${-Math.sign(dx) * 2}px,0,0) rotate(0) scale(1.001)`, opacity: 1, offset: .75}, {transform: 'none', opacity: 1}], 410)];
    chrome.forEach((element, position) => tasks.push(animate(element, [{opacity: chromeOpacity[position]}, {opacity: 1}], 300)));
    if (typeof KeyframeEffect !== 'undefined' && 'pseudoElement' in KeyframeEffect.prototype) {
      tasks.push(animate(dialog, [{opacity: groundOpacity}, {opacity: 1}], 300, ease, {pseudoElement: '::backdrop'}));
    }
    Promise.all(tasks).then(() => { if (ticket === generation) settleOpen(); });
  }
  function down(event) {
    if (gesture && event.pointerId !== gesture.id) { returnSheet(); return; }
    if (phase !== 'open' || event.button !== 0 || !event.isPrimary || !event.target.closest('.cv-paper')) return;
    gesture = {id: event.pointerId, x: event.clientX, y: event.clientY, dx: 0, dy: 0, axis: null, captured: false, samples: [{x: event.clientX, y: event.clientY, time: performance.now()}]};
  }
  function drag(event) {
    if (!gesture || event.pointerId !== gesture.id) return;
    gesture.dx = event.clientX - gesture.x;
    gesture.dy = event.clientY - gesture.y;
    if (!gesture.axis) {
      if (Math.hypot(gesture.dx, gesture.dy) < 8) return;
      gesture.axis = Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.1 ? 'x' : 'y';
      desk.setPointerCapture(event.pointerId);
      gesture.captured = true;
      dialog.classList.add('cv-is-dragging');
    }
    event.preventDefault();
    const now = performance.now();
    gesture.samples.push({x: event.clientX, y: event.clientY, time: now});
    gesture.samples = gesture.samples.filter(sample => now - sample.time < 110);
    if (!reduced.matches && !frame) frame = requestAnimationFrame(paintDrag);
  }
  function up(event) {
    if (!gesture || event.pointerId !== gesture.id) return;
    if (!gesture.axis) { releaseGesture(); return; }
    suppressClickUntil = performance.now() + 350;
    const now = performance.now(), sample = gesture.samples[0];
    const elapsed = Math.max(1, now - sample.time);
    const vx = (event.clientX - sample.x) / elapsed, vy = (event.clientY - sample.y) / elapsed;
    if (frame) cancelAnimationFrame(frame);
    if (!reduced.matches) paintDrag();
    const {dx, dy, axis} = gesture;
    if (axis === 'y' && (dy > 90 || (dy > 24 && vy > .6))) { close(); return; }
    const next = index + (dx < 0 ? 1 : -1);
    if (axis === 'x' && next >= 0 && next < items.length && (Math.abs(dx) > Math.min(80, stack.clientWidth * .2) || (Math.abs(dx) > 18 && Math.abs(vx) > .45))) { select(next); return; }
    returnSheet();
  }
  listen($('.cv-close'), 'click', close);
  $$('.cv-prev').forEach(button => listen(button, 'click', () => move(-1)));
  $$('.cv-next').forEach(button => listen(button, 'click', () => move(1)));
  listen(dialog, 'cancel', event => { event.preventDefault(); close(); });
  listen(dialog, 'close', () => {
    if (dialog.open) return;
    stop(); releaseGesture(); restoreSources(); unlock(); setPhase('closed');
    stack.replaceChildren(); paper = null;
    if (opener?.isConnected) opener.focus({preventScroll: true});
    restoreScroll(true);
  });
  listen(dialog, 'click', event => {
    if (performance.now() < suppressClickUntil) return;
    if (event.target.closest('button,.cv-paper,.cv-toolbar,.cv-footer')) return;
    if (gesture) return;
    close();
  });
  listen(dialog, 'keydown', event => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.target.closest('input,textarea,select,[contenteditable]')) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); event.stopPropagation(); move(event.key === 'ArrowLeft' ? -1 : 1); }
    else if (event.key === 'Home' || event.key === 'End') { event.preventDefault(); event.stopPropagation(); select(event.key === 'Home' ? 0 : items.length - 1); }
  });
  listen(desk, 'pointerdown', down);
  listen(desk, 'pointermove', drag, {passive: false});
  listen(desk, 'pointerup', up);
  listen(desk, 'pointercancel', () => { if (gesture) returnSheet(); });
  listen(reduced, 'change', () => { if (reduced.matches) { if (phase === 'closing') finishClose(); else if (dialog.open) settleOpen(); } });
  listen(document, 'visibilitychange', () => { if (document.hidden) { if (phase === 'closing') finishClose(); else if (dialog.open) settleOpen(); } });
  const resize = new ResizeObserver(() => {
    if (!dialog.open || !layout()) return;
    if (phase === 'closing') finishClose();
    else if (phase !== 'closed') settleOpen();
  });
  resize.observe(desk);
  sharedViewer = {
    open, close, move,
    get element() { return dialog; },
    destroy() {
      const wasActive = locked || dialog.open;
      stop(); releaseGesture(); restoreSources(); unlock();
      resize.disconnect(); cleanups.forEach(cleanup => cleanup());
      if (dialog.open) dialog.close();
      if (wasActive) restoreScroll(true);
      else if (scrollRestoreFrame) { cancelAnimationFrame(scrollRestoreFrame); scrollRestoreFrame = 0; }
      dialog.remove(); sharedViewer = null;
    },
  };
  return sharedViewer;
}
