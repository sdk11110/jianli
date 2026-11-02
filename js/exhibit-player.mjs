const icons = {
  play: '<path d="m9 5 11 7-11 7Z" class="ep-solid"/>',
  pause: '<path d="M8 5v14M16 5v14" stroke-width="3.5"/>',
  sound: '<path d="M11 5 6 9H3v6h3l5 4V5Z"/><path d="M15 8c2 2 2 6 0 8m3-11c4 4 4 10 0 14"/>',
  muted: '<path d="M11 5 6 9H3v6h3l5 4V5Z"/><path d="m16 9 6 6m0-6-6 6"/>',
  expand: '<path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/>',
  replay: '<path d="M4 9a8 8 0 1 1 0 6M4 3v6h6"/>',
};
const icon = name => `<svg viewBox="0 0 24 24" aria-hidden="true">${icons[name]}</svg>`;
const sheep = '<svg class="ep-loading-sheep" viewBox="0 0 40 40" aria-hidden="true"><path d="M10 11C7 2 20 0 22 8 30 1 39 10 32 17c11 5 3 17-4 13-4 11-17 9-18 1C0 33-3 19 7 17c-3-1-3-5 3-6Z"/><path d="M14 21h1m10 0h1m-9 6c2 2 4 2 6-1"/></svg>';

function timeLabel(value) {
  const seconds = Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

/** Small, sound-on players for the exhibit. No native chrome or silent fallback. */
export function initExhibitPlayers({
  reduced = matchMedia('(prefers-reduced-motion: reduce)'),
  canAutoplay = true,
} = {}) {
  const players = new Map();
  const cleanups = [];
  let bootReady = false;
  let destroyed = false;

  function listen(target, event, fn, options) {
    target.addEventListener(event, fn, options);
    cleanups.push(() => target.removeEventListener(event, fn, options));
  }

  function pauseAll(except = null) {
    for (const [video, player] of players) if (video !== except) player.pause(false);
  }

  function makePlayer(video) {
    if (video.parentElement?.classList.contains('exhibit-player')) return null;
    const hero = video.id === 'hero-video';
    const modal = video.id === 'dialog-video';
    const root = document.createElement('div');
    root.className = 'exhibit-player';
    if (hero) root.classList.add('exhibit-player-hero');
    if (modal) root.classList.add('exhibit-player-modal');
    root.dataset.state = 'ready';
    root.setAttribute('role', 'group');
    root.setAttribute('aria-label', video.getAttribute('aria-label') || '项目影像播放器');
    root.tabIndex = 0;
    video.before(root);
    root.append(video);
    video.controls = false;
    video.removeAttribute('controls');
    video.removeAttribute('muted');
    video.muted = false;
    video.defaultMuted = false;
    video.volume = .85;
    video.playsInline = true;
    video.setAttribute('playsinline', '');
    video.disablePictureInPicture = true;
    const responsiveSource=video.querySelector('source[data-mobile-src]');
    const light=matchMedia('(max-width:700px)').matches||navigator.connection?.saveData||/^(slow-)?2g$|^3g$/.test(navigator.connection?.effectiveType||'');
    if(responsiveSource&&light){responsiveSource.src=responsiveSource.dataset.mobileSrc;video.load();}
    if (hero) video.preload = 'metadata';

    const ui = document.createElement('div');
    ui.className = 'ep-ui';
    ui.innerHTML = `
      <button class="ep-prompt" type="button" aria-label="有声播放项目影像">
        <span class="ep-prompt-disc">${icon('play')}</span>
        <span class="ep-prompt-label">点击，有声播放</span>
      </button>
      <div class="ep-loading" role="status" aria-live="polite" hidden>
        ${sheep}<span>小羊放映中<span class="ep-dots" aria-hidden="true"><i></i><i></i><i></i></span></span>
      </div>
      <div class="ep-controls" aria-label="播放控制">
        <button class="ep-control ep-toggle" type="button" aria-label="播放">${icon('play')}</button>
        <div class="ep-timeline">
          <input class="ep-seek" type="range" min="0" max="100" step="0.05" value="0" disabled aria-label="播放进度" aria-valuetext="尚未开始">
        </div>
        <span class="ep-time" aria-hidden="true"><span class="ep-current">0:00</span><span class="ep-time-slash"> / </span><span class="ep-duration">0:00</span></span>
        <button class="ep-control ep-sound" type="button" aria-label="关闭声音" aria-pressed="false">${icon('sound')}</button>
        <button class="ep-control ep-expand" type="button" aria-label="放大观看">${icon('expand')}</button>
      </div>
      <p class="ep-announcement" role="status" aria-live="polite"></p>`;
    root.append(ui);
    const $ = selector => ui.querySelector(selector);
    const toggle = $('.ep-toggle');
    const prompt = $('.ep-prompt');
    const promptLabel = $('.ep-prompt-label');
    const promptDisc = $('.ep-prompt-disc');
    const loading = $('.ep-loading');
    const seek = $('.ep-seek');
    const sound = $('.ep-sound');
    const announcement = $('.ep-announcement');
    let wanted = false;
    let userPaused = false;
    let visible = false;
    let autoplayAttempted = false;
    let pendingPlay = 0;
    let seeking = false;
    let duration = 0;
    let idleTimer = 0;
    let playState = 'ready';

    function state(next) {
      playState = next;
      root.dataset.state = next;
      const playing = next === 'playing';
      const waiting = next === 'buffering';
      const error = next === 'error';
      const ended = next === 'ended';
      loading.hidden = !waiting;
      const hidePrompt = playing || waiting;
      const movePromptFocus = hidePrompt && !prompt.hidden && document.activeElement === prompt;
      prompt.hidden = hidePrompt;
      toggle.innerHTML = icon(playing || waiting ? 'pause' : ended ? 'replay' : 'play');
      toggle.setAttribute('aria-label', playing || waiting ? '暂停' : ended ? '重新播放' : error ? '重新加载并播放' : '播放');
      promptDisc.innerHTML = icon(ended || error ? 'replay' : 'play');
      promptLabel.textContent = error ? '再试一次，小羊等你' : ended ? '再看一遍' : '点击，有声播放';
      prompt.setAttribute('aria-label', error ? '重新加载并有声播放项目影像' : ended ? '有声重新播放项目影像' : '有声播放项目影像');
      root.classList.toggle('ep-has-started', video.currentTime > 0);
      if (movePromptFocus) toggle.focus({ preventScroll: true });
    }

    function updateTime() {
      duration = Number.isFinite(video.duration) ? video.duration : 0;
      $('.ep-current').textContent = timeLabel(video.currentTime);
      $('.ep-duration').textContent = timeLabel(duration);
      seek.disabled = duration <= 0;
      if (!seeking) seek.value = String(duration ? video.currentTime / duration * 100 : 0);
      seek.style.setProperty('--ep-progress', `${seek.value}%`);
      seek.setAttribute('aria-valuetext', `${timeLabel(video.currentTime)}，共 ${timeLabel(duration)}`);
    }

    function updateSound() {
      const muted = video.muted || video.volume === 0;
      sound.innerHTML = icon(muted ? 'muted' : 'sound');
      sound.setAttribute('aria-label', muted ? '开启声音' : '关闭声音');
      sound.setAttribute('aria-pressed', String(muted));
      root.dataset.sound = muted ? 'off' : 'on';
    }

    function showControls() {
      clearTimeout(idleTimer);
      root.classList.add('ep-awake');
      if (!video.paused) idleTimer = setTimeout(() => {
        if (!root.contains(document.activeElement)) root.classList.remove('ep-awake');
      }, 2200);
    }

    function pause(manual = true) {
      pendingPlay++;
      wanted = false;
      if (manual) userPaused = true;
      clearTimeout(idleTimer);
      video.pause();
      if (playState !== 'error' && playState !== 'ended') state(video.currentTime > 0 ? 'paused' : 'ready');
    }

    function play({ userIntent = true } = {}) {
      const token = ++pendingPlay;
      if (userIntent) userPaused = false;
      wanted = true;
      announcement.textContent = '';
      pauseAll(video);
      if (playState === 'error') video.load();
      if (video.ended && duration > 0) video.currentTime = 0;
      if (!video.readyState) state('buffering');
      showControls();
      // Called before awaiting anything so a direct click retains browser activation.
      let request;
      try { request = video.play(); }
      catch (error) { refused(error, token); return; }
      Promise.resolve(request).catch(error => refused(error, token));
    }

    function refused(error, token) {
      if (token !== pendingPlay || destroyed) return;
      wanted = false;
      if (error?.name === 'AbortError') { state('paused'); return; }
      if (error?.name === 'NotAllowedError') {
        state('paused');
        announcement.textContent = '点一下播放，声音已为你打开。';
      } else {
        state('error');
        announcement.textContent = '这一段还没准备好，可以点击重新加载。';
      }
    }

    function maybeAutoplay() {
      if (!hero || !bootReady || !visible || document.hidden || autoplayAttempted || userPaused) return;
      autoplayAttempted = true;
      play({ userIntent: false });
    }

    function togglePlayback() {
      if (!video.paused || wanted) pause(true);
      else play();
    }

    function seekToInput() {
      if (!duration) return;
      const value = Math.min(100, Math.max(0, Number(seek.value)));
      video.currentTime = duration * value / 100;
      seek.style.setProperty('--ep-progress', `${value}%`);
      $('.ep-current').textContent = timeLabel(video.currentTime);
      seek.setAttribute('aria-valuetext', `${timeLabel(video.currentTime)}，共 ${timeLabel(duration)}`);
    }

    function expand() {
      if (hero || video.id === 'watch-video') {
        root.dispatchEvent(new CustomEvent('player:expand', { bubbles: true, detail: { video } }));
        return;
      }
      if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
      else if (root.requestFullscreen) root.requestFullscreen().catch(() => {});
      else video.webkitEnterFullscreen?.();
    }

    listen(toggle, 'click', togglePlayback);
    listen(prompt, 'click', () => play());
    listen(video, 'click', togglePlayback);
    listen($('.ep-expand'), 'click', expand);
    listen(sound, 'click', () => {
      video.muted = !(video.muted || video.volume === 0);
      if (!video.muted && video.volume === 0) video.volume = .85;
      updateSound();
      showControls();
    });
    listen(seek, 'pointerdown', () => { seeking = true; showControls(); });
    listen(seek, 'input', seekToInput);
    listen(seek, 'change', () => { seekToInput(); seeking = false; updateTime(); });
    listen(seek, 'pointerup', () => { seeking = false; updateTime(); });
    listen(seek, 'pointercancel', () => { seeking = false; updateTime(); });
    listen(seek, 'blur', () => { seeking = false; updateTime(); });
    listen(root, 'pointermove', showControls, { passive: true });
    listen(root, 'pointerenter', showControls, { passive: true });
    listen(root, 'focusin', showControls);
    listen(root, 'keydown', event => {
      if (event.target.matches('input,button')) return;
      if (event.key === ' ' || event.key === 'Enter') { event.preventDefault(); togglePlayback(); }
      else if (event.key.toLowerCase() === 'm') { event.preventDefault(); sound.click(); }
      else if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        if (duration) video.currentTime = Math.max(0, Math.min(duration, video.currentTime + (event.key === 'ArrowRight' ? 5 : -5)));
        showControls();
      }
    });
    listen(video, 'play', () => { wanted = true; pauseAll(video); state(video.readyState < 3 ? 'buffering' : 'playing'); showControls(); });
    listen(video, 'playing', () => { wanted = true; state('playing'); showControls(); });
    listen(video, 'pause', () => { wanted = false; if (playState !== 'error' && playState !== 'ended') state(video.currentTime > 0 ? 'paused' : 'ready'); });
    listen(video, 'waiting', () => { if (wanted && !video.paused) state('buffering'); });
    listen(video, 'stalled', () => { if (wanted && !video.paused && video.readyState < 3) state('buffering'); });
    listen(video, 'canplay', () => { if (wanted && !video.paused) state('playing'); else if (playState === 'buffering') state('ready'); });
    listen(video, 'ended', () => { wanted = false; state('ended'); updateTime(); });
    listen(video, 'loadedmetadata', updateTime);
    listen(video, 'durationchange', updateTime);
    listen(video, 'timeupdate', updateTime);
    listen(video, 'volumechange', updateSound);
    listen(video, 'loadstart', () => { updateTime(); state(wanted ? 'buffering' : 'ready'); });
    listen(video, 'emptied', () => { updateTime(); state(wanted ? 'buffering' : 'ready'); });
    listen(video, 'error', () => {
      if (!video.currentSrc && !video.getAttribute('src') && !video.querySelector('source')) return;
      wanted = false;
      state('error');
      announcement.textContent = '影像暂时没有加载成功，点击重试。';
    });
    updateTime();
    updateSound();
    const player = {
      video, root, play, pause, maybeAutoplay,
      setVisible(value) { visible = value; if (!value) pause(false); else maybeAutoplay(); },
      destroy() { clearTimeout(idleTimer); pause(false); },
    };
    return player;
  }

  for (const video of document.querySelectorAll('video')) {
    const player = makePlayer(video);
    if (player) players.set(video, player);
  }

  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      const player = players.get(entry.target);
      player?.setVisible(entry.isIntersecting && entry.intersectionRatio >= .3);
    }
  }, { threshold: [0, .3, .55] });
  for (const video of players.keys()) observer.observe(video);
  listen(document, 'visibilitychange', () => {
    if (document.hidden) pauseAll();
    else for (const player of players.values()) player.maybeAutoplay();
  });
  Promise.resolve(canAutoplay).then(allowed => {
    if (destroyed || allowed === false) return;
    bootReady = true;
    for (const player of players.values()) player.maybeAutoplay();
  }).catch(() => {});

  return {
    get(video) { return players.get(typeof video === 'string' ? document.querySelector(video) : video); },
    activate(video, { autoplay = true } = {}) {
      const player = players.get(typeof video === 'string' ? document.querySelector(video) : video);
      if (autoplay) player?.play();
      return player;
    },
    pauseAll,
    destroy() {
      destroyed = true;
      observer.disconnect();
      for (const player of players.values()) player.destroy();
      cleanups.forEach(remove => remove());
      players.clear();
    },
  };
}
