import { siteLinks } from './routes.mjs';
import { reactionAt, panelState, chapterState, chapterTransition, firstEpisode, episodeCatalog } from './stories.mjs';
import { projectVideoReels } from './project-videos.mjs';
import { initHeroMotion } from './hero-motion.mjs';

const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const destinations = siteLinks(location.href);
document.querySelectorAll('[data-local-link]').forEach(link => {
  const destination = destinations[link.dataset.localLink];
  if (destination) link.href = destination;
});

const menu = document.querySelector('.menu-toggle');
const nav = document.querySelector('#main-nav.main-nav');
const compactNav = matchMedia('(max-width: 700px)');

if (menu && nav) {
  function setMenu(open, restoreFocus = false) {
    const expanded = compactNav.matches && open;
    menu.setAttribute('aria-expanded', String(expanded));
    menu.setAttribute('aria-label', expanded ? '关闭导航' : '打开导航');
    nav.classList.toggle('is-open', expanded);
    nav.inert = compactNav.matches && !expanded;
    if (restoreFocus) menu.focus({ preventScroll: true });
  }

  setMenu(false);
  menu.addEventListener('click', () => setMenu(menu.getAttribute('aria-expanded') !== 'true'));
  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
      setMenu(false, true);
    }
  });
  compactNav.addEventListener('change', () => setMenu(false));
}

function waitFor(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function initSceneLoader({ loader, hero, reducedMotion }) {
  if (!loader || !hero) return Promise.resolve({ timedOut: false });
  loader.hidden = false;
  loader.setAttribute('aria-hidden', 'false');
  document.body.classList.add('is-booting');
  const status = loader.querySelector('[data-loader-status]');
  const images = [...hero.querySelectorAll('.hero-lettering img, .hero-art img')];
  const assetsReady = Promise.all([
    ...images.map(image => typeof image.decode === 'function' ? image.decode().catch(() => {}) : Promise.resolve()),
    document.fonts?.ready || Promise.resolve(),
  ]);
  const minimum = waitFor(reducedMotion.matches ? 90 : 420);
  const timeout = waitFor(1800).then(() => 'timeout');
  return Promise.race([
    Promise.all([assetsReady, minimum]).then(() => 'ready'),
    timeout,
  ]).then(reason => {
    const timedOut = reason === 'timeout';
    if (status) status.textContent = timedOut ? '先进入现场' : '可以出发';
    loader.dataset.timedOut = String(timedOut);
    loader.classList.add('is-dismissing');
    loader.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('is-booting');
    document.documentElement.classList.add('scene-ready');
    setTimeout(() => { loader.hidden = true; }, 390);
    return { timedOut };
  });
}

const hero = document.querySelector('.hero');
const loader = document.querySelector('[data-scene-loader]');
initSceneLoader({ loader, hero, reducedMotion: reduced }).then(() => initHeroMotion(hero, reduced));

function initProjectFilmstrips() {
  const strips = [...document.querySelectorAll('[data-project-filmstrip]')];
  if (!strips.length) return;
  const setStatus = (strip, text, state = 'idle') => {
    const status = strip.querySelector('[data-film-status]');
    if (!status) return;
    status.dataset.state = state;
    status.textContent = text;
  };
  const videos = [...document.querySelectorAll('[data-film-video]')];
  const videoReader = document.querySelector('#video-reader');
  const videoReaderMedia = document.querySelector('#video-reader-media');
  const videoReaderTitle = document.querySelector('#video-reader-title');
  const videoReaderProject = document.querySelector('#video-reader-project');
  const videoReaderLabel = document.querySelector('#video-reader-label');
  const videoReaderNote = document.querySelector('#video-reader-note');
  let lastTrigger = null;
  let lastStrip = null;

  const sourceFor = video => video.currentSrc || video.querySelector('source')?.src || video.getAttribute('src') || '';
  const stripFor = video => video.closest('[data-project-filmstrip]');
  const clipFor = video => {
    const strip = stripFor(video);
    const clips = projectVideoReels[strip?.dataset.projectFilmstrip] || [];
    return clips.find(clip => clip.id === video.dataset.projectVideo) || clips[videos.indexOf(video) % 3] || {};
  };
  const markStopped = video => {
    video.closest('.film-item')?.classList.remove('is-playing', 'is-loading');
  };
  const pauseOthers = current => videos.forEach(video => {
    if (video !== current) {
      video.pause();
      markStopped(video);
    }
  });
  const playSingle = video => {
    const strip = stripFor(video);
    if (!strip) return;
    pauseOthers(video);
    const item = video.closest('.film-item');
    item?.classList.add('is-loading');
    item?.classList.remove('is-error', 'has-media-error');
    video.play().catch(error => {
      if (error?.name === 'AbortError') return;
      item?.classList.remove('is-loading');
      item?.classList.add('is-error', 'has-media-error');
      setStatus(strip, '片段播放受阻 · 请使用视频控制条', 'error');
    });
  };
  const closeVideoReader = () => {
    if (!videoReader || !videoReaderMedia) return;
    videoReaderMedia.pause();
    videoReaderMedia.removeAttribute('src');
    videoReaderMedia.load();
    if (videoReader.open) videoReader.close();
    if (lastStrip) setStatus(lastStrip, '逐条观看 · 同一时间只播一段');
    lastTrigger?.focus();
    lastTrigger = null;
    lastStrip = null;
  };
  const openVideoReader = (video, trigger) => {
    if (!video || !videoReader || !videoReaderMedia) return;
    const clip = clipFor(video);
    const strip = stripFor(video);
    pauseOthers(video);
    video.pause();
    lastTrigger = trigger;
    videoReaderTitle.textContent = clip.label || video.dataset.videoLabel || '片段观看';
    videoReaderProject.textContent = strip?.dataset.projectFilmstrip === 'training' ? '内容培训平台 · PROJECT REEL 02' : '手表互联 · PROJECT REEL 01';
    videoReaderLabel.textContent = clip.label || '项目影像';
    videoReaderNote.textContent = clip.note || '从项目现场截取的一段工作证据。';
    videoReaderMedia.src = sourceFor(video);
    videoReaderMedia.poster = video.poster;
    videoReaderMedia.muted = true;
    videoReaderMedia.loop = true;
    lastStrip = strip;
    videoReader.showModal();
    setStatus(strip, `大画面播放中 · ${clip.label || '当前片段'}`, 'playing');
    videoReaderMedia.play().catch(() => {});
  };

  strips.forEach(strip => {
    const project = strip.dataset.projectFilmstrip;
    const metadata = projectVideoReels[project] || [];
    const stripVideos = [...strip.querySelectorAll('[data-film-video]')];
    setStatus(strip, `逐条观看 · 同一时间只播一段`);
    stripVideos.forEach((video, index) => {
      const clip = metadata[index];
      if (clip) {
        video.dataset.projectVideo = clip.id;
        video.dataset.videoLabel = clip.label;
      }
      const item = video.closest('.film-item');
      video.addEventListener('loadedmetadata', () => item?.classList.add('is-ready'));
      video.addEventListener('waiting', () => {
        item?.classList.add('is-loading');
        setStatus(strip, '正在缓冲 · 很快继续', 'loading');
      });
      video.addEventListener('play', () => playSingle(video));
      video.addEventListener('playing', () => {
        item?.classList.remove('is-loading');
        item?.classList.add('is-playing');
        setStatus(strip, `播放中 · ${clip?.label || '当前片段'}`, 'playing');
      });
      video.addEventListener('pause', () => {
        markStopped(video);
        if (!stripVideos.some(candidate => !candidate.paused)) setStatus(strip, '逐条观看 · 同一时间只播一段');
      });
      video.addEventListener('error', () => {
        item?.classList.add('is-error', 'has-media-error');
        setStatus(strip, '片段加载失败 · 可打开项目入口', 'error');
      });
    });
    strip.querySelectorAll('[data-film-open]').forEach(trigger => {
      const video = trigger.closest('.film-item')?.querySelector('[data-film-video]');
      const clip = video ? clipFor(video) : null;
      if (clip?.label) trigger.setAttribute('aria-label', `展开观看：${clip.label}`);
      trigger.addEventListener('click', () => openVideoReader(video, trigger));
    });
  });

  document.querySelector('[data-close-video-reader]')?.addEventListener('click', closeVideoReader);
  videoReader?.addEventListener('close', closeVideoReader);
  videoReader?.addEventListener('click', event => {
    if (event.target === videoReader) closeVideoReader();
  });
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) return;
    videos.forEach(video => video.pause());
    videoReaderMedia?.pause();
  });
}

initProjectFilmstrips();

let reactionIndex = 0;
const reactionText = document.querySelector('#reaction-text');
document.querySelectorAll('[data-reaction]').forEach(button => {
  button.setAttribute('aria-label', '和小羊说句话');
  button.addEventListener('click', () => {
    if (!reactionText) return;
    const reaction = reactionAt(reactionIndex++);
    const aside = document.createElement('strong');
    aside.textContent = reaction.aside;
    reactionText.replaceChildren(document.createTextNode(reaction.text), aside);
    const hero = button.closest('.hero');
    hero?.classList.remove('is-reacting');
    requestAnimationFrame(() => hero?.classList.add('is-reacting'));
    hero?.dispatchEvent(new CustomEvent('hero-reaction'));
    setTimeout(() => hero?.classList.remove('is-reacting'), 460);
  });
});

const reader = document.querySelector('#comic-reader');
const readerFrame = document.querySelector('#reader-frame');
const readerCaption = document.querySelector('#reader-caption');
const readerProgress = document.querySelector('#reader-progress');
const readerTitle = document.querySelector('#reader-title');
const readerKicker = document.querySelector('.reader-top p');
const readerChapterTemplate = document.querySelector('#reader-chapter-nav-template');
const previous = document.querySelector('[data-prev-panel]');
const next = document.querySelector('[data-next-panel]');
const closeReader = document.querySelector('[data-close-reader]');
const episodeStrips = new Map([...document.querySelectorAll('[data-episode-strip]')]
  .map(strip => [strip.dataset.episodeStrip, [...strip.querySelectorAll('.comic-panel')]]));
const episodeViewport = document.querySelector('[data-episode-viewport]');
const episodeTrack = document.querySelector('[data-episode-track]');
const episodeCards = new Map([...document.querySelectorAll('[data-episode-card]')]
  .map(card => [card.dataset.episodeCard, card]));

function addPanelNotes() {
  episodeCatalog.forEach(episode => {
    const notes = Array.isArray(episode.notes) ? episode.notes : [];
    if (!notes.length) return;
    const panels = episodeStrips.get(episode.id) || [];
    panels.forEach((panel, index) => {
      const note = notes[index];
      if (!note || panel.querySelector('.panel-note')) return;
      const noteElement = document.createElement('p');
      noteElement.className = 'panel-note';
      noteElement.textContent = note;
      noteElement.setAttribute('aria-label', `旁注：${note}`);
      panel.append(noteElement);
    });
  });
}

addPanelNotes();

if (reader && readerFrame && readerCaption && readerProgress && previous && next && closeReader) {
  let panelIndex = 0;
  let activeEpisode = firstEpisode;
  let panels = episodeStrips.get(firstEpisode.id) || [];
  let readerTrigger;
  let bodyOverflow = '';
  let paintTicket = 0;

  if (readerChapterTemplate) {
    readerChapterTemplate.hidden = false;
    reader.insertBefore(readerChapterTemplate, readerFrame);
  }
  const previousChapter = reader.querySelector('[data-prev-chapter]');
  const nextChapter = reader.querySelector('[data-next-chapter]');
  const chapterProgress = reader.querySelector('#reader-chapter-progress');
  const chapterTriggers = [...document.querySelectorAll('.chapter-rail-list [data-story]')];
  const stageReaderTrigger = document.querySelector('[data-stage-reader]');
  let stageEpisode = episodeCatalog.find(episode => episode.id === document.querySelector('[data-episode-card].is-active')?.dataset.episodeCard) || firstEpisode;
  let stageCard = episodeCards.get(stageEpisode.id) || null;
  let stageToken = 0;
  let touchStart = null;

  function syncStageState(episode) {
    const currentIndex = episodeCatalog.indexOf(episode);
    chapterTriggers.forEach(trigger => trigger.toggleAttribute('aria-current', trigger.dataset.story === episode.id));
    episodeCards.forEach(card => {
      card.classList.toggle('is-current', card.dataset.episodeCard === episode.id);
      card.toggleAttribute('aria-hidden', card.dataset.episodeCard !== episode.id);
    });
    const position = document.querySelector('.episode-position');
    if (position?.firstChild) position.firstChild.nodeValue = `${String(currentIndex + 1).padStart(2, '0')} `;
    if (stageReaderTrigger) {
      stageReaderTrigger.dataset.story = episode.id;
      stageReaderTrigger.setAttribute('aria-label', `一格一格看第 ${String(currentIndex + 1).padStart(2, '0')} 话`);
    }
  }

  function finishStageTransition(token, outgoing, incoming) {
    if (token !== stageToken || !episodeTrack) return;
    outgoing?.classList.remove('is-active', 'is-transitioning', 'is-exiting', 'is-departed', 'is-current');
    incoming.classList.remove('is-transitioning', 'is-entering', 'is-arrived');
    incoming.classList.add('is-active', 'is-current');
    episodeTrack.classList.remove('is-switching');
    episodeTrack.style.height = '';
    episodeTrack.removeAttribute('data-direction');
  }

  function activateStage(id, direction = 'none') {
    const incomingEpisode = episodeCatalog.find(episode => episode.id === id) || firstEpisode;
    const incoming = episodeCards.get(incomingEpisode.id);
    if (!incoming || !episodeTrack) return;
    const outgoing = stageCard;
    const from = episodeCatalog.indexOf(stageEpisode);
    const to = episodeCatalog.indexOf(incomingEpisode);
    const transition = chapterTransition(from, to, episodeCatalog.length);
    const resolvedDirection = direction === 'none' ? transition.direction : direction;
    stageEpisode = incomingEpisode;
    syncStageState(incomingEpisode);
    if (!outgoing || outgoing === incoming || !transition.changed || reduced.matches) {
      outgoing?.classList.remove('is-active', 'is-transitioning', 'is-exiting', 'is-departed');
      incoming.classList.add('is-active', 'is-current');
      stageCard = incoming;
      episodeTrack.classList.remove('is-switching');
      episodeTrack.style.height = '';
      episodeTrack.removeAttribute('data-direction');
      return;
    }
    const token = ++stageToken;
    episodeTrack.dataset.direction = resolvedDirection;
    episodeTrack.classList.add('is-switching');
    incoming.classList.add('is-active', 'is-transitioning', 'is-entering', 'is-current');
    outgoing.classList.add('is-transitioning', 'is-exiting');
    episodeTrack.style.height = `${Math.max(outgoing.offsetHeight, incoming.offsetHeight)}px`;
    stageCard = incoming;
    const settle = () => finishStageTransition(token, outgoing, incoming);
    incoming.addEventListener('transitionend', settle, { once: true });
    requestAnimationFrame(() => {
      if (token !== stageToken) return;
      incoming.classList.add('is-arrived');
      outgoing.classList.add('is-departed');
    });
    window.setTimeout(settle, 620);
  }

  function selectEpisode(id) {
    activeEpisode = episodeCatalog.find(episode => episode.id === id) || firstEpisode;
    panels = episodeStrips.get(activeEpisode.id) || [];
    panelIndex = 0;
    const chapter = chapterState(episodeCatalog.indexOf(activeEpisode), episodeCatalog.length);
    if (readerTitle) readerTitle.textContent = activeEpisode.title;
    if (readerKicker) readerKicker.textContent = `羊在现场 · 第 ${chapter.index + 1} 话`;
    if (chapterProgress) chapterProgress.textContent = `${String(chapter.index + 1).padStart(2, '0')} / ${String(episodeCatalog.length).padStart(2, '0')}`;
    if (previousChapter) previousChapter.disabled = chapter.previousDisabled;
    if (nextChapter) nextChapter.disabled = chapter.nextDisabled;
    activateStage(activeEpisode.id);
  }

  function moveChapter(delta) {
    const chapter = chapterState(episodeCatalog.indexOf(activeEpisode) + delta, episodeCatalog.length);
    selectEpisode(episodeCatalog[chapter.index].id);
    paintPanel();
  }

  function paintPanel() {
    const state = panelState(panelIndex, panels.length);
    panelIndex = state.index;
    const source = panels[state.index];
    if (!source) return;
    const panel = source.cloneNode(true);
    const ticket = ++paintTicket;
    panel.removeAttribute('id');
    panel.removeAttribute('aria-hidden');
    panel.querySelectorAll('[id]').forEach(element => element.removeAttribute('id'));
    panel.querySelectorAll('.panel-note').forEach(element => element.remove());
    panel.querySelectorAll('img').forEach(img => { img.loading = 'eager'; });
    const note = activeEpisode.notes?.[state.index];
    if (note) {
      const noteElement = document.createElement('p');
      noteElement.className = 'reader-note';
      noteElement.textContent = note;
      noteElement.setAttribute('aria-label', `旁注：${note}`);
      panel.append(noteElement);
    }
    const loadingStatus = document.createElement('p');
    loadingStatus.className = 'reader-image-status';
    loadingStatus.setAttribute('role', 'status');
    loadingStatus.textContent = '这一格马上就来…';
    readerFrame.setAttribute('aria-busy', 'true');
    readerFrame.classList.add('is-loading');
    readerFrame.replaceChildren(panel, loadingStatus);
    Promise.all([...panel.querySelectorAll('img')].map(img => img.decode())).then(() => {
      if (ticket !== paintTicket) return;
      loadingStatus.remove();
      readerFrame.classList.remove('is-loading');
      readerFrame.setAttribute('aria-busy', 'false');
    }).catch(() => {
      if (ticket !== paintTicket) return;
      loadingStatus.textContent = '图片没有加载出来，请关闭后重新打开。';
      readerFrame.setAttribute('aria-busy', 'false');
    });
    readerCaption.textContent = activeEpisode.captions[state.index] || '';
    readerProgress.textContent = state.progress;
    previous.disabled = state.previousDisabled;
    const chapter = chapterState(episodeCatalog.indexOf(activeEpisode), episodeCatalog.length);
    next.textContent = state.isLast ? (chapter.nextDisabled ? '读完了，回现场' : '下一章') : '下一格';
  }

  chapterTriggers.forEach(button => {
    button.addEventListener('click', () => {
      const from = episodeCatalog.indexOf(stageEpisode);
      const to = episodeCatalog.findIndex(episode => episode.id === button.dataset.story);
      activateStage(button.dataset.story, chapterTransition(from, to, episodeCatalog.length).direction);
    });
  });

  const readerTriggers = [...document.querySelectorAll('[data-story]')]
    .filter(button => !button.closest('.chapter-rail-list'));
  readerTriggers.forEach(button => {
    button.addEventListener('click', () => {
      if (!panels.length || reader.open || typeof reader.showModal !== 'function') return;
      readerTrigger = button;
      selectEpisode(button.dataset.story);
      paintPanel();
      reader.showModal();
      bodyOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      document.body.classList.add('reader-open');
    });
  });

  episodeViewport?.addEventListener('touchstart', event => {
    if (event.touches.length !== 1) return;
    const touch = event.touches[0];
    touchStart = { x: touch.clientX, y: touch.clientY };
  }, { passive: true });
  episodeViewport?.addEventListener('touchend', event => {
    if (!touchStart) return;
    const touch = event.changedTouches[0];
    const dx = touch.clientX - touchStart.x;
    const dy = touch.clientY - touchStart.y;
    touchStart = null;
    if (Math.abs(dx) < 48 || Math.abs(dx) <= Math.abs(dy)) return;
    const current = chapterState(episodeCatalog.indexOf(stageEpisode), episodeCatalog.length);
    const nextIndex = current.index + (dx < 0 ? 1 : -1);
    const target = chapterState(nextIndex, episodeCatalog.length);
    if (target.index === current.index) return;
    activateStage(episodeCatalog[target.index].id, dx < 0 ? 'forward' : 'backward');
  }, { passive: true });

  document.addEventListener('keydown', event => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || reader.open ||
        event.target.closest('input, textarea, select, [contenteditable="true"]')) return;
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    if (!document.querySelector('#comics')?.contains(document.activeElement)) return;
    event.preventDefault();
    const delta = event.key === 'ArrowLeft' ? -1 : 1;
    const current = chapterState(episodeCatalog.indexOf(stageEpisode), episodeCatalog.length);
    const target = chapterState(current.index + delta, episodeCatalog.length);
    if (target.index !== current.index) activateStage(episodeCatalog[target.index].id, delta > 0 ? 'forward' : 'backward');
  });

  syncStageState(stageEpisode);

  previous.addEventListener('click', () => {
    panelIndex = panelState(panelIndex - 1, panels.length).index;
    paintPanel();
  });
  next.addEventListener('click', () => {
    if (panelState(panelIndex, panels.length).isLast) {
      const current = chapterState(episodeCatalog.indexOf(activeEpisode), episodeCatalog.length);
      if (!current.nextDisabled) moveChapter(1);
      else reader.close();
    }
    else { panelIndex++; paintPanel(); }
  });
  previousChapter?.addEventListener('click', () => moveChapter(-1));
  nextChapter?.addEventListener('click', () => moveChapter(1));
  closeReader.addEventListener('click', () => reader.close());
  reader.addEventListener('close', () => {
    paintTicket++;
    document.body.classList.remove('reader-open');
    document.body.style.overflow = bodyOverflow;
    readerTrigger?.focus({ preventScroll: true });
  });
  reader.addEventListener('click', event => {
    if (event.target !== reader) return;
    const bounds = reader.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right ||
        event.clientY < bounds.top || event.clientY > bounds.bottom) reader.close();
  });
  reader.addEventListener('keydown', event => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey ||
        event.target.closest('input, textarea, select, [contenteditable="true"]')) return;
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const direction = event.key === 'ArrowLeft' ? -1 : 1;
    const state = panelState(panelIndex, panels.length);
    if (direction > 0 && state.isLast) {
      const chapter = chapterState(episodeCatalog.indexOf(activeEpisode), episodeCatalog.length);
      if (!chapter.nextDisabled) moveChapter(1);
      else paintPanel();
      return;
    }
    if (direction < 0 && state.previousDisabled) {
      const chapter = chapterState(episodeCatalog.indexOf(activeEpisode), episodeCatalog.length);
      if (!chapter.previousDisabled) { moveChapter(-1); panelIndex = panels.length - 1; paintPanel(); }
      else paintPanel();
      return;
    }
    panelIndex = panelState(panelIndex + direction, panels.length).index;
    paintPanel();
  });
}

const copyButton = document.querySelector('[data-copy-email]');
const copyStatus = document.querySelector('#copy-status');
if (copyButton && copyStatus) {
  let copyAttempt = 0;
  copyButton.addEventListener('click', async () => {
    const attempt = ++copyAttempt;
    copyStatus.textContent = '正在复制邮箱…';
    try {
      await navigator.clipboard.writeText('2679799093@qq.com');
      if (attempt !== copyAttempt) return;
      copyStatus.textContent = '邮箱已复制，随时来信。';
      copyButton.textContent = '已复制';
    } catch {
      if (attempt !== copyAttempt) return;
      copyButton.textContent = '再试一次';
      copyStatus.textContent = '复制未成功。请选中或长按上方邮箱 2679799093@qq.com 复制，也可以点击邮箱直接写信。';
    }
  });
}

const header = document.querySelector('.site-header');
const progress = document.querySelector('.reading-progress');
const sectionIds = ['projects', 'comics', 'about', 'contact'];
const sectionLinks = [...document.querySelectorAll('.site-header a[href]')]
  .filter(link => sectionIds.includes(link.hash.slice(1)));
const sections = sectionIds.map(id => document.getElementById(id)).filter(Boolean);
let sectionOffsets = [];
let scrollRange = 0;
let frame = 0;
let needsMeasurement = true;

function paintScroll() {
  frame = 0;
  const y = scrollY;
  if (needsMeasurement) {
    sectionOffsets = sections.map(section => ({ id: section.id, top: section.getBoundingClientRect().top + y }));
    scrollRange = Math.max(0, document.documentElement.scrollHeight - innerHeight);
    needsMeasurement = false;
  }
  header?.classList.toggle('is-scrolled', y > 60);
  if (progress) progress.style.transform = `scaleX(${scrollRange ? Math.min(1, Math.max(0, y / scrollRange)) : 0})`;
  const marker = y + Math.min(180, innerHeight * 0.3);
  let active;
  sectionOffsets.forEach(section => { if (section.top <= marker) active = section.id; });
  if (scrollRange > 0 && y >= scrollRange - 2) active = sectionOffsets.at(-1)?.id;
  sectionLinks.forEach(link => {
    if (link.hash === `#${active}`) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
}

function scheduleScroll() {
  if (!frame) frame = requestAnimationFrame(paintScroll);
}
function scheduleMeasurement() {
  needsMeasurement = true;
  scheduleScroll();
}
addEventListener('scroll', scheduleScroll, { passive: true });
addEventListener('resize', scheduleMeasurement, { passive: true });
addEventListener('load', scheduleMeasurement, { once: true });
if ('ResizeObserver' in window) {
  const content = document.querySelector('main');
  if (content) new ResizeObserver(scheduleMeasurement).observe(content);
}
document.fonts?.ready.then(scheduleMeasurement);
scheduleScroll();
