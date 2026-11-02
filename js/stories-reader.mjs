import { episodeCatalog } from './stories.mjs';
import { createComicViewer } from './comic-viewer.mjs';
import { initComicPaper } from './comic-paper.mjs';

const $ = selector => document.querySelector(selector);
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const requestedChapter = new URL(location.href).searchParams.get('chapter');
let chapter = Math.max(0, episodeCatalog.findIndex(episode => episode.id === requestedChapter));
const short = ['比个价', '第三个视频', '不太健康', '灵魂伴侣', '兜底提示词', '开卷考试'];
const firstLabels = ['接到需求', '对齐判断依据', '让方案可共同评审'];
const workValues = {
  price: '把标准和反馈统一，让方案可共同判断。对应的是需求澄清、评审组织和工具化思维。',
  binding: '把操作约束说清楚，让问题在进入后续制作前被发现。对应的是交互原型、规则校验与验收边界。',
  healthy: '把需求、成本和返修放进同一张排期，提前看见会影响交付的依赖。对应的是周期与风险管理。',
  soulmate: '把预期变成协作方能够执行、品质能够验收的标准，减少各说各话。对应的是需求对齐与跨团队协作。',
  fallback: '把生成约束沉淀为可复用的方法，让人工精力聚焦判断与例外修正。对应的是自动化设计与质量边界。',
  review: '把现场提出的问题整理为待确认事项、责任与交付件，让评审推动决策。对应的是节点管理与交付推进。',
};
const nav = $('[data-chapters]');
const strip = $('[data-story-strip]');
const viewer = createComicViewer({ reduced });
let turnAnimations = [];
let turnSnapshot = null;
let turnGeneration = 0;

// Each chapter keeps the three original portrait panels in the same reading order.
function labelFor(episode, index) {
  return episode.id === episodeCatalog[0].id
    ? firstLabels[index]
    : episode.notes?.[index] || episode.captions[index];
}

function openPanel(episode, index, opener) {
  const buttons = [...strip.children]
    .filter(element => element.matches('.story-panel'))
    .map(figure => figure.querySelector('[data-open-panel]'));
  viewer.open({
    items: buttons.map((source, panelIndex) => ({
      source,
      caption: episode.captions[panelIndex],
      label: labelFor(episode, panelIndex),
      render() {
        const frame = document.createElement('div');
        frame.className = 'story-image-wrap';
        frame.append(...[...source.children].map(child => child.cloneNode(true)));
        frame.querySelectorAll('[data-story-image]').forEach(image => image.removeAttribute('data-story-image'));
        return frame;
      },
    })),
    index,
    title: episode.title,
    opener,
  });
}

episodeCatalog.forEach((episode, index) => {
  const link = document.createElement('a');
  link.href = '?chapter=' + episode.id;
  const number = document.createElement('span');
  number.textContent = String(index + 1).padStart(2, '0');
  const title = document.createElement('span');
  title.textContent = short[index];
  link.append(number, title);
  link.addEventListener('click', event => {
    event.preventDefault();
    selectChapter(index);
  });
  nav.append(link);
});

function makePanel(episode, index) {
  const figure = document.createElement('figure');
  figure.className = 'story-panel';
  const wrap = document.createElement('button');
  wrap.className = 'story-image-wrap';
  wrap.type = 'button';
  wrap.dataset.openPanel = String(index);
  wrap.setAttribute('aria-label', `查看第 ${index + 1} 格细节：${episode.captions[index]}`);
  wrap.addEventListener('click', () => openPanel(episode, index, wrap));

  const img = document.createElement('img');
  img.src = episode.panels[index];
  img.alt = episode.captions[index];
  img.width = 530;
  img.height = 932;
  img.decoding = 'async';
  img.dataset.storyImage = '';
  const lines = episode.id === episodeCatalog[0].id
    ? [['帮忙比个价。', '行，拉个表。'], ['我服了。'], ['网站做好了。']][index]
    : [episode.notes?.[index] || ''];
  const dialogue = document.createElement('div');
  dialogue.className = 'story-dialogue';
  for (const line of lines) {
    if (!line) continue;
    const paragraph = document.createElement('p');
    paragraph.textContent = line;
    if (episode.id !== episodeCatalog[0].id) paragraph.className = 'story-note';
    dialogue.append(paragraph);
  }
  wrap.append(img, dialogue);

  const status = document.createElement('p');
  status.className = 'image-status';
  status.setAttribute('role', 'status');
  status.hidden = true;
  const retry = document.createElement('button');
  retry.type = 'button';
  retry.className = 'panel-retry';
  retry.textContent = '重新加载这一格';
  retry.hidden = true;
  retry.addEventListener('click', () => {
    status.textContent = '正在重新加载…';
    img.src = episode.panels[index] + '?retry=' + Date.now();
  });
  img.addEventListener('error', () => {
    status.hidden = false;
    status.textContent = '画面加载失败，文字说明仍可阅读。';
    retry.hidden = false;
  });
  img.addEventListener('load', () => { status.hidden = true; retry.hidden = true; });
  const caption = document.createElement('figcaption');
  caption.textContent = String(index + 1).padStart(2, '0') + ' ' + labelFor(episode, index);
  figure.append(wrap, caption, status, retry);
  return figure;
}

function clearTurn() {
  turnGeneration++;
  turnAnimations.forEach(animation => animation.cancel());
  turnAnimations = [];
  turnSnapshot?.remove();
  turnSnapshot = null;
  [...strip.children].filter(element => element.matches('.story-panel')).forEach(page => page.style.removeProperty('z-index'));
  delete strip.dataset.chapterMotion;
}

function snapshotPages() {
  const originals = [...strip.children].filter(element => element.matches('.story-panel'));
  if (!originals.length) return null;
  const layout = getComputedStyle(strip);
  const snapshot = document.createElement('div');
  snapshot.className = 'story-turn-snapshot';
  snapshot.setAttribute('aria-hidden', 'true');
  snapshot.inert = true;
  Object.assign(snapshot.style, {
    position: 'absolute', inset: '0', display: 'grid',
    gridTemplateColumns: layout.gridTemplateColumns, gap: layout.gap,
    alignItems: 'start', pointerEvents: 'none', zIndex: '0',
  });
  for (const original of originals) {
    const current = getComputedStyle(original);
    const clone = original.cloneNode(true);
    clone.querySelectorAll('[id]').forEach(element => element.removeAttribute('id'));
    clone.querySelectorAll('[data-open-panel], [data-story-image]').forEach(element => {
      element.removeAttribute('data-open-panel');
      element.removeAttribute('data-story-image');
    });
    clone.querySelectorAll('button,a,input,select,textarea').forEach(element => {
      element.tabIndex = -1;
      if ('disabled' in element) element.disabled = true;
    });
    Object.assign(clone.style, {
      transform: current.transform, opacity: current.opacity,
      transformOrigin: '50% 80%', pointerEvents: 'none', margin: '0',
    });
    snapshot.append(clone);
  }
  return snapshot;
}

function turnPages(snapshot, direction) {
  if (!snapshot) return;
  const sign = Math.sign(direction);
  turnSnapshot = snapshot;
  strip.append(snapshot);
  strip.dataset.chapterMotion = 'turning';
  const ticket = turnGeneration;
  const previous = [...snapshot.children];
  const incoming = [...strip.children].filter(element => element.matches('.story-panel'));
  const ease = 'cubic-bezier(.16,1,.3,1)';

  previous.forEach((page, index) => {
    const animation = page.animate([
      { transform: page.style.transform, opacity: page.style.opacity },
      { transform: `perspective(1100px) translateX(${-sign * 22}px) rotateY(${-sign * 7}deg) rotate(${-sign * .6}deg) scale(.992)`, opacity: 0 },
    ], { duration: 240, delay: index * 18, easing: 'cubic-bezier(.4,0,.6,1)', fill: 'forwards' });
    turnAnimations.push(animation);
  });
  incoming.forEach((page, index) => {
    page.style.zIndex = '1';
    const order = sign > 0 ? index : incoming.length - 1 - index;
    const animation = page.animate([
      { transform: `perspective(1100px) translateX(${sign * 26}px) rotateY(${sign * 9}deg) rotate(${sign * .55}deg) scale(.985)`, opacity: .28 },
      { transform: `perspective(1100px) translateX(${-sign * 1.4}px) rotateY(${-sign * .5}deg) rotate(0deg) scale(1)`, opacity: 1, offset: .8 },
      { transform: 'none', opacity: 1 },
    ], { duration: 360, delay: order * 28, easing: ease, fill: 'backwards' });
    turnAnimations.push(animation);
  });
  Promise.all(turnAnimations.map(animation => animation.finished.catch(() => {}))).then(() => {
    if (ticket === turnGeneration) clearTurn();
  });
}

function paint(direction = 0) {
  const canTurn = direction && !reduced.matches && !document.hidden && typeof strip.animate === 'function';
  // Snapshot the current incoming sheets before cancelling an interrupted turn.
  const snapshot = canTurn ? snapshotPages() : null;
  clearTurn();
  const episode = episodeCatalog[chapter];
  $('[data-story-number]').textContent = '第 ' + String(chapter + 1).padStart(2, '0') + ' 话';
  $('#story-heading').textContent = episode.title;
  $('[data-story-subtitle]').textContent = episode.subtitle;
  $('[data-story-value]').textContent = workValues[episode.id];
  $('[data-read-progress]').textContent = '点任意单格，放大阅读';
  strip.replaceChildren(...episode.panels.map((_, index) => makePanel(episode, index)));
  $('[data-prev-text]').disabled = chapter === 0;
  $('[data-next-text]').textContent = chapter === episodeCatalog.length - 1 ? '读完了，回现场' : '下一话';
  [...nav.children].forEach((link, index) => {
    if (index === chapter) link.setAttribute('aria-current', 'true');
    else link.removeAttribute('aria-current');
  });
  const url = new URL(location.href);
  url.searchParams.set('chapter', episode.id);
  history.replaceState({}, '', url);
  turnPages(snapshot, direction);
}

function reveal() {
  $('#reader').scrollIntoView({ block: 'start', behavior: reduced.matches ? 'instant' : 'smooth' });
}

function selectChapter(index) {
  const next = Math.max(0, Math.min(episodeCatalog.length - 1, index));
  if (next === chapter) return;
  const direction = next - chapter;
  chapter = next;
  paint(direction);
  reveal();
}

function move(direction) {
  if (direction > 0 && chapter === episodeCatalog.length - 1) {
    location.href = './#notes';
    return;
  }
  selectChapter(chapter + direction);
}

$('[data-prev-text]').addEventListener('click', () => move(-1));
$('[data-next-text]').addEventListener('click', () => move(1));
document.addEventListener('keydown', event => {
  if (document.querySelector('.comic-viewer[open]') || event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.target.closest('input,textarea,select,[contenteditable]')) return;
  if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
  event.preventDefault();
  const fromChapters = nav.contains(event.target);
  move(event.key === 'ArrowLeft' ? -1 : 1);
  if (fromChapters) nav.children[chapter]?.focus({ preventScroll: true });
});
reduced.addEventListener('change', () => { if (reduced.matches) clearTurn(); });
document.addEventListener('visibilitychange', () => { if (document.hidden) clearTurn(); });
window.addEventListener('pagehide', clearTurn);
if (getComputedStyle(strip).position === 'static') strip.style.position = 'relative';
paint();
initComicPaper(strip, { reduced });
