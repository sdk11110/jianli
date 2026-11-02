/* One cancellable exposure at a time; ink-wash develop; failed load never consumes film. */
window.initInstantCamera = ({ photos, photoMarkup, escapeHtml: esc, openPhoto, onDeveloped }) => {
  const $ = selector => document.querySelector(selector);
  const desk = $('.camera-desk'), stage = $('#polaroid-stage');
  const shutter = $('#camera-eject'), trigger = $('#eject-button');
  const clearButton = $('#camera-clear'), inspectButton = $('#camera-inspect');
  const status = $('#camera-status'), count = $('#film-count');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const cameraIcon = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/></svg>';
  const retryIcon = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 8a8 8 0 1 1-1 7M4 3v6h6"/></svg>';
  const loadingIcon = '<svg class="exposure-spinner" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20 12a8 8 0 1 1-8-8"/></svg>';
  const emptyMarkup = stage.innerHTML;
  const cache = new Map();
  let cursor = 0, current = null, exposure = null;
  const developedIds = new Set();

  function state(name, message) {
    desk.dataset.state = name;
    const busy = ['loading', 'ejecting', 'developing'].includes(name);
    trigger.setAttribute('aria-disabled', String(busy || !photos.length));
    shutter.setAttribute('aria-disabled', String(busy || !photos.length));
    stage.setAttribute('aria-busy', String(busy));
    status.textContent = message;
    trigger.innerHTML = busy ? `${{ loading: '装入风景', ejecting: '正在出片', developing: '水墨显影' }[name]} ${loadingIcon}`
      : name === 'error' ? `重新试一次 ${retryIcon}`
      : cursor === photos.length ? `重新翻阅 ${retryIcon}`
      : cursor ? `再拍一张 ${cameraIcon}` : `按下快门 ${cameraIcon}`;
  }

  function loadPhoto(src) {
    if (cache.has(src)) return cache.get(src);
    const pending = new Promise((resolve, reject) => {
      const img = new Image();
      const timer = setTimeout(() => finish(new Error('image timeout')), 12000);
      function finish(error) {
        clearTimeout(timer); img.onload = img.onerror = null;
        error ? reject(error) : resolve();
      }
      img.onload = () => img.decode().then(() => finish(), finish);
      img.onerror = () => finish(new Error('image unavailable'));
      img.src = src;
    }).catch(error => { cache.delete(src); throw error; });
    cache.set(src, pending);
    return pending;
  }

  async function animate(element, frames, options, signal) {
    if (motion.matches) return;
    const animation = element.animate(frames, options);
    const cancel = () => animation.cancel();
    signal.addEventListener('abort', cancel, { once: true });
    try { await animation.finished; }
    finally { signal.removeEventListener('abort', cancel); animation.cancel(); }
  }

  function syncCount() {
    count.textContent = `${String(cursor).padStart(2, '0')} / ${String(photos.length).padStart(2, '0')} 张底片`;
    clearButton.disabled = !cursor && !exposure;
  }

  async function inkDevelop(surface, signal) {
    surface.classList.add('is-ink-plate', 'is-ink-live');
    surface.style.setProperty('--ink', '0');
    if (motion.matches) {
      surface.style.setProperty('--ink', '1');
      surface.classList.add('is-ink-done');
      return;
    }
    const start = performance.now();
    await new Promise((resolve, reject) => {
      let frame = 0;
      const cancel = () => {
        cancelAnimationFrame(frame);
        reject(new DOMException('Aborted', 'AbortError'));
      };
      signal.addEventListener('abort', cancel, { once: true });
      const tick = now => {
        if (signal.aborted) return;
        const t = Math.min(1, (now - start) / 1480);
        const eased = 1 - Math.pow(1 - t, 3);
        surface.style.setProperty('--ink', String(eased));
        if (t < 1) frame = requestAnimationFrame(tick);
        else {
          signal.removeEventListener('abort', cancel);
          surface.classList.add('is-ink-done');
          resolve();
        }
      };
      frame = requestAnimationFrame(tick);
    });
  }

  function createCard(photo, number) {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'instant-photo';
    card.disabled = true;
    card.dataset.photoId = photo.id;
    card.setAttribute('aria-pressed', 'false');
    card.setAttribute('aria-label', `${photo.caption}，翻看背面`);
    card.innerHTML = `<span class="photo-inner"><span class="photo-front">${photoMarkup(photo, 'is-ink-plate')}<span class="instant-caption">${esc(photo.caption)}</span><small>YUNNAN · ${String(number).padStart(2, '0')} <span>翻面读故事</span></small></span><span class="photo-back" aria-hidden="true"><small>POSTCARD / 大小日常</small><span>${esc(photo.note)}</span><small>云南 · 一路有风 <span>轻点，回到风景</span></small></span></span>`;
    card.addEventListener('click', () => {
      if (card.disabled) return;
      const flipped = card.classList.toggle('flipped');
      card.setAttribute('aria-pressed', String(flipped));
      card.setAttribute('aria-label', `${photo.caption}，${flipped ? photo.note + '，翻回正面' : '翻看背面'}`);
      card.querySelector('.photo-front').setAttribute('aria-hidden', String(flipped));
      card.querySelector('.photo-back').setAttribute('aria-hidden', String(!flipped));
    });
    return card;
  }

  async function eject() {
    if (exposure || !photos.length) return;
    const controller = new AbortController();
    exposure = controller;
    const index = cursor % photos.length, photo = photos[index];
    let card;
    state('loading', '正在装入这一张风景…');
    const previousCard = stage.querySelector('.instant-photo');
    if (previousCard) previousCard.disabled = true;
    inspectButton.disabled = true;
    clearButton.disabled = false;
    shutter.classList.add('is-shutter');
    try {
      await loadPhoto(photo.src);
      if (controller.signal.aborted) return;
      shutter.classList.remove('is-shutter');
      card = createCard(photo, index + 1);
      card.classList.add('is-ejecting');
      stage.replaceChildren(card);
      state('ejecting', '相纸正在滑出，留住这一瞬间…');
      await animate(card, [
        { transform: 'translate3d(-50%, -108%, 0) rotate(-2deg)', opacity: 0.85 },
        { transform: 'translate3d(-50%, -18%, 0) rotate(0.5deg)', offset: 0.62 },
        { transform: 'translate3d(-50%, 2%, 0) rotate(2.5deg)', offset: 0.88 },
        { transform: 'translate3d(-50%, 0, 0) rotate(2deg)', opacity: 1 }
      ], { duration: 920, easing: 'cubic-bezier(.18,1,.22,1)' }, controller.signal);
      if (controller.signal.aborted) return;
      card.classList.remove('is-ejecting');
      card.classList.add('is-out');
      state('developing', '水墨正在洇开，风景慢慢浮现…');
      const surface = card.querySelector('.travel-photo');
      await inkDevelop(surface, controller.signal);
      if (controller.signal.aborted) return;
      cursor = index + 1;
      current = photo;
      developedIds.add(photo.id);
      card.disabled = false;
      state('ready', cursor === photos.length
        ? '一卷都显影完了。轻点翻面，或去底片墙看看。'
        : '显影好了。轻点翻面读故事，或再拍一张。');
      inspectButton.disabled = false;
      onDeveloped?.(photo, [...developedIds]);
      loadPhoto(photos[cursor % photos.length].src).catch(() => {});
    } catch (error) {
      if (!controller.signal.aborted) {
        state('error', '这张照片暂时没装好，再试一次就好。');
        if (card) { stage.innerHTML = emptyMarkup; current = null; }
        else if (previousCard) previousCard.disabled = false;
        inspectButton.disabled = !current;
      }
    } finally {
      if (exposure === controller) {
        exposure = null;
        shutter.classList.remove('is-shutter');
        syncCount();
      }
    }
  }

  function clear() {
    exposure?.abort();
    exposure = null;
    current = null;
    cursor = 0;
    shutter.classList.remove('is-shutter');
    stage.innerHTML = emptyMarkup;
    inspectButton.disabled = true;
    state('idle', '按下快门。明信片会从这里滑出来，再用水墨显影。');
    syncCount();
  }

  trigger.addEventListener('click', eject);
  shutter.addEventListener('click', eject);
  clearButton.addEventListener('click', clear);
  inspectButton.addEventListener('click', () => { if (current) openPhoto(current.id); });
  clear();
  if (photos.length) loadPhoto(photos[0].src).catch(() => {});
  return {
    eject,
    clear,
    getDevelopedIds: () => [...developedIds],
    seedDeveloped(ids = []) { ids.forEach(id => developedIds.add(id)); }
  };
};
