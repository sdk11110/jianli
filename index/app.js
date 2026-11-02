const WENCHUANG_PROJECTS = [
  {
    id: 'watch-link',
    number: '01',
    title: '手表互联',
    subtitle: 'WATCH LINK / ONE CLICK TO MASS PRODUCTION',
    year: '2026',
    image: 'assets/previews/watch-work.jpg',
    images: ['assets/previews/watch-work.jpg', 'assets/visuals/watch/workflow-detail.png'],
    href: '#watch-link',
    description: '原方案预估两周；AI 工作流制作两天，含品检与返修一周完成交付，支撑单周期 2000+ 条上线。',
    tags: ['2000+ 条上线', '完整交付 1 周', '人工只修例外'],
    meta: [['YEAR', '2026.07'], ['STATUS', '已量产上线']],
    intro: '原方案由两家供应商承接，参考以往项目预估两周。改用内部 AI 工作流后，制作两天，含品检与返修一周完成交付，支撑单周期 2000+ 条单词视频上线。',
    impact: [
      ['业务问题', '原方案需由两家供应商承接任务，参考以往项目预估两周。2000+ 条单词视频还需要统一满足手表小屏的视觉、字幕与裁剪规范。'],
      ['我的贡献', '承接内容与视觉要求，设计并搭建工作流，将生成、视频处理、质检与导出串联起来，明确设备画幅、字幕安全区和交付要求。'],
      ['AI 如何介入', 'AI 完成 2D 转 3D 生图与图生视频，自动化流程衔接字幕、裁剪和批量导出；成品由人工审核，不通过项再返修。'],
      ['落地改善', '1 名制作员发起量产，制作环节两天完成，连同品检与返修一周交付。完整交付周期较原方案预估缩短约 50%；重复加工交给工作流，人工聚焦成品审核与异常修正。']
    ],
    features: ['2D→3D 生图与图生视频', '字幕、裁剪与真机预览', '成品必审，人工只修例外'],
    statsNote: '两天制作、一周完整交付为本次实际结果；原方案两周为参考以往项目的预估。约 50% 是实际交付周期相对预估基线的差异，不代表同批任务的实测对照。',
    stats: [['2000+', '条视频单周期上线'], ['2 天', '实际制作耗时'], ['1 周', '含品检与返修的完整交付']],
    actions: [
      { label: '打开手表工作台演示', href: 'assets/watch-link/index.html' },
      { label: '查看流程配图', href: 'assets/visuals/watch/workflow-detail.png' }
    ],
    visual: 'watch'
  },
  {
    id: 'interactive-textbook',
    number: '02',
    title: '教材 AI 自动化产线',
    subtitle: 'AUTOMATED PRODUCTION / LOWER COST, HIGHER EFFICIENCY',
    year: '2026',
    image: 'assets/previews/textbook-work.png',
    images: ['assets/previews/textbook-work.png', 'assets/visuals/textbook/detail.png'],
    href: 'assets/interactive-textbook/gitlab-pages-deploy/index.html',
    direct: true,
    description: '将教材视频制作重构为 AI 自动化产线，成本降低 60% 以上、效率提升 70%，让团队以更低投入持续生产。',
    tags: ['降本 60% 以上', '效率提升 70%', 'AI 自动化'],
    meta: [['YEAR', '2026'], ['STATUS', '成片可播放']],
    intro: '我的核心贡献是设计 AI 自动化生产方案，把分散的教材视频制作环节连成可持续执行的产线。项目成本降低 60% 以上、效率提升 70%；真实五幕成片呈现最终产出。',
    impact: [
      ['业务问题', '教材页转为教学视频，需要连续完成内容理解、脚本拆解、画面生成与后期处理，单次成片的方法也需要能在后续任务中复用。'],
      ['我的价值', '把自动化设计落到业务生产中：打通教材理解、动态分镜、生成与后期，将重复操作交给流程，并通过审核和返修机制守住交付质量，让团队能够低成本、高效率持续生产。'],
      ['AI 如何介入', 'AI 辅助解析教材、生成分镜与画面，工作流衔接超分、拼接和配音；人工判断教材理解、分镜表达与成片质量。'],
      ['业务结果', 'AI 自动化使项目成本降低 60% 以上、效率提升 70%。网页保留真实五幕教学案例和可操作流程演示，便于具体查看这套生产能力怎样运转。']
    ],
    features: ['按教材动态分镜', '脚本与提示词封装为 Skill', '四道制作审核 + 成品品检'],
    stats: [['60%+', '项目成本降低'], ['70%', '项目效率提升'], ['5 幕', '真实教学成片']],
    statsNote: '降本与提效为作者确认的项目整体结果。网页操作为流程演示，五幕成片为实际产出；单环节生成耗时不作为端到端交付时间。',
    actions: [{ label: '打开教材成片案例', href: 'assets/interactive-textbook/gitlab-pages-deploy/index.html' }],
    visual: 'textbook-video'
  },
  {
    id: 'training-platform',
    number: '03',
    title: '内容培训平台',
    subtitle: 'CONTENT PLATFORM / FROM PERSONAL TOOL TO TEAM CAPABILITY',
    year: '2026',
    image: 'assets/previews/training-work.jpg',
    images: ['assets/previews/training-work.jpg', 'assets/visuals/training/detail.png'],
    href: '#training-platform',
    description: '推动同事用 AI 制作验收表拆分、教材核对、图片批处理工具；平台沉淀方法与成果，让培训进入真实工作。',
    tags: ['AI 应用培训', '团队工具共建', '自动发布'],
    meta: [['YEAR', '2026'], ['STATUS', '团队日常在用']],
    intro: '我负责 AI 培训与平台建设，推动同事将工作中的重复操作做成工具。平台已沉淀不同同事贡献的验收表拆分、教材核对与图片批处理工具，把学习进一步转成业务中的实际应用。',
    impact: [
      ['业务问题', '让 AI 在团队中发挥作用，需要同事愿意主动尝试、能把工作问题变成工具需求，也需要把分散的工具与方法留下来供其他人学习。'],
      ['我的贡献', '组织 AI 方法与实操培训，独立完成平台产品定义和搭建，连接工具库、培训中心与需求池，把学习、动手制作和成果分享衔接起来。'],
      ['AI 如何介入', '培训围绕用 AI 做工具与解决工作问题展开；平台承接方法、工具和反馈。自动化流程处理存档、发布与状态回写，让工具制作者更容易分享成果。'],
      ['落地改善', '不同同事已贡献真实工作工具：验收表按供应商与物料自动拆分汇总；教材图片核对后生成对比报告；100 张单词图片一次转出三套规格。平台登记了对应任务的前后耗时，团队成果可以继续被查找、学习和复用。']
    ],
    features: ['工具库与四维评分', '培训中心与需求池', '上传后自动存档、发布、回写'],
    stats: [['30 秒', '验收表拆分 · 原 1 小时'], ['15 分钟', '教材核对 · 原 2 小时'], ['2.5 分钟', '100 张图片转三套规格 · 原 10 分钟']],
    statsNote: '2026-10-11 核对正式平台工具库及详情。耗时为平台登记的单次任务对比，未独立复测，不外推为团队总收益；工具由同事贡献，我负责培训与平台建设。',
    actions: [
      { label: '打开平台展厅', href: 'assets/training-platform/platform-tour/index.html' },
      { label: '体验培训 H5', href: 'assets/training-platform/ai-h5/index.html' }
    ],
    visual: 'platform'
  },
  {
    id: 'math-project',
    number: '04',
    title: '数学思维项目 · 策划与孵化',
    subtitle: 'CONTEXT → INTERACTION → THINKING METHODS',
    year: '2025',
    image: 'assets/previews/math-work.png',
    images: ['assets/previews/math-work.png', 'assets/visuals/math/detail.png'],
    href: '#math-project',
    description: '我策划并孵化互动式思维题讲解：情景化点题、交互学习、方法提炼，让学习者参与推理，并带走可迁移的方法。',
    tags: ['项目策划与孵化', '学习体验设计'],
    meta: [['YEAR', '2025'], ['STATUS', '可互动 · 可播放']],
    intro: '这个项目由我从策划到设计、亲手孵化。核心是“情景化点题 → 交互学习 → 方法提炼”的思维提升方式：让学习者进入问题、参与推理，再从解题过程中带走方法；H5 和视频是它的载体。',
    impact: [
      ['设计目标', '让讲解从展示答案走向主动推理：学习者需要有进入问题的动机、能够试错与观察反馈，并在解题后提炼思考方法。'],
      ['我的价值', '策划并孵化项目，设计题目、情景、操作与反馈之间的关系，把一次思维题讲解组织成有参与、有推理、能提炼方法的学习体验。'],
      ['AI 如何介入', '借助 Codex 辅助结构、代码与调试，结合程序动画和 TTS 制作讲解内容；数学逻辑、交互设计与最终验收由我判断。'],
      ['可验证成果', '互动样例和情景讲解成片让这套学习方式可以被亲自体验与讨论。重点验证设计是否连贯；无声、配音、高清属于同一成片的制作版本。']
    ],
    features: ['情景化点题', '参与推理与即时反馈', '提炼可迁移方法'],
    stats: [['策划', '从想法到样例孵化'], ['3 步', '情景、交互与方法']],
    statsNote: '思维提升是项目设计目标，当前展示策划与体验样例，不声称已通过学习效果数据验证。',
    actions: [
      { label: '体验三步思维讲解', href: 'assets/math-project/interactive-h5/index.html' },
      { label: '播放情景视频', href: 'assets/math-project/scenario-video/average-misread-geometric.mp4', download: true }
    ],
    visual: 'math'
  }
];

window.WENCHUANG_PROJECTS = WENCHUANG_PROJECTS;

const HERO_PLATE = 'assets/visuals/wenchuang/hero-main.png';
const PROJECT_IMAGE_FALLBACK = 'assets/portfolio-mist-background.png';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const clamp = (value, min, max) => (value < min ? min : value > max ? max : value);
const lerp = (from, to, amount) => from + (to - from) * amount;
/** Frame-rate independent smoothing factor; higher rate = snappier. */
const damp = (rate, dt) => 1 - Math.exp(-rate * dt);

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
const liquidEnabled = hasFinePointer && !prefersReducedMotion;

const water = {
  field: null,
  renderer: null,
  hero: null,
  heroRect: { top: 0, height: 0 },
  ready: false,
  time: 0,
  pointer: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
  pointerTarget: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
  pointerVelocity: { x: 0, y: 0 },
  scrollY: 0,
  scrollVelocity: 0,
  nextAmbient: 0
};

const preview = {
  record: null,
  detailRecord: null,
  alpha: 0,
  targetAlpha: 0,
  x: 0,
  y: 0,
  targetX: 0,
  targetY: 0,
  width: 0,
  height: 0,
  zoom: 1.08
};

/** Whole-plate inertia: parallax target + spring-damper + velocity impulse. */
const plateMotion = {
  x: 0,
  y: 0,
  vx: 0,
  vy: 0,
  zoom: 1.04,
  zoomV: 0
};

let warpTargets = [];
let liquidSprites = [];
let activeProjectRow = null;
let lenisInstance = null;
let recaptureTimer = 0;
let pointerMix = 0;
let pointerMixTarget = 0;
let detailTrigger = null;
let scrollScenes = null;

// Every scene is a reversible function of scroll position. No timed queues or wheel interception.
function setupScrollScenes() {
  if (prefersReducedMotion) return;
  const hero = $('.hero');
  const stage = $('.hero-stage');
  if (!hero || !stage) return;
  document.body.classList.add('has-scroll-scenes');
  scrollScenes = { hero, stage, progress: 0, targets: [] };
  const measure = () => {
    const nodes = [$('.intro'), $('.section-heading'), ...$$('.project-row'), $('.closing')].filter(Boolean);
    scrollScenes.targets = nodes.map(element => {
      let top = 0, node = element;
      while (node) { top += node.offsetTop; node = node.offsetParent; }
      return { element, top, height: element.offsetHeight };
    });
    updateScrollScenes(window.scrollY);
  };
  window.addEventListener('resize', measure, { passive: true });
  document.addEventListener('toggle', measure, true);
  window.addEventListener('load', measure, { once: true });
  document.fonts?.ready.then(measure);
  measure();
}

function updateScrollScenes(scrollY) {
  if (!scrollScenes) return;
  const vh = window.innerHeight;
  const range = Math.max(1, scrollScenes.stage.offsetHeight - scrollScenes.hero.offsetHeight);
  const raw = clamp(scrollY / range, 0, 1);
  const progress = raw * raw * (3 - 2 * raw);
  scrollScenes.progress = progress;
  scrollScenes.hero.style.setProperty('--hero-exit', progress.toFixed(4));
  // Read geometry before writes. Target positions are stable, untransformed layout coordinates.
  const states = scrollScenes.targets.map(target => {
    const p = clamp((vh * .94 - (target.top - scrollY)) / (vh * .62), 0, 1);
    return { ...target, p: 1 - Math.pow(1 - p, 3) };
  });
  for (const { element, p } of states) element.style.setProperty('--scene-enter', p.toFixed(4));
}


/* ------------------------------------------------------------------ markup */

function splitTextIntoLetters(text) {
  return Array.from(text).map((letter, index) => {
    const visibleLetter = letter === ' ' ? '&nbsp;' : letter;
    return `<span class="project-title-letter" aria-hidden="true" style="--letter-index:${index}">${visibleLetter}</span>`;
  }).join('');
}

function getProjectImages(project) {
  const images = Array.isArray(project.images) ? project.images.filter(Boolean) : [];
  return [images[0] || project.image || PROJECT_IMAGE_FALLBACK, images[1] || images[0] || project.image || PROJECT_IMAGE_FALLBACK];
}

function setAtmosphereImage(element, path) {
  if (!element) return;
  element.dataset.imagePath = path;
  element.style.backgroundImage = `url("${path}")`;
  if (path === PROJECT_IMAGE_FALLBACK) return;
  const probe = new Image();
  probe.onerror = () => {
    if (element.dataset.imagePath === path) element.style.backgroundImage = `url("${PROJECT_IMAGE_FALLBACK}")`;
  };
  probe.src = path;
}

function renderProjects(projects) {
  const list = $('[data-project-list]');
  if (!list) return;

  list.innerHTML = projects.map((project) => `
    <a class="project-row reveal" data-project-id="${project.id}" data-scene-image="${getProjectImages(project)[0]}" href="${project.href}" aria-label="查看${project.title}项目">
      <span class="project-ghost" aria-hidden="true">${project.number}</span>
      <span class="project-index">${project.number}</span>
      <img class="project-thumbnail" src="${getProjectImages(project)[0]}" alt="" loading="lazy" width="240" height="160" />
      <span class="project-main">
        <span class="project-title" data-warp-text="${project.title}" aria-label="${project.title}">${project.title.includes(" · ") ? `${splitTextIntoLetters(project.title.split(" · ")[0])}<span class="project-title-suffix">${splitTextIntoLetters(" · " + project.title.split(" · ")[1])}</span>` : splitTextIntoLetters(project.title)}</span>
        <span class="project-title-english" aria-hidden="true">${project.subtitle.split(' / ')[0]}</span>
        <span class="project-subtitle">${project.subtitle}</span>
        ${project.tags ? `<span class="project-tags" aria-hidden="true">${project.tags.map((tag) => `<i>${tag}</i>`).join('')}</span>` : ''}
      </span>
      <span class="project-description">${project.description}</span>
      <span class="project-year">${project.year}</span>
      <span class="project-arrow" aria-hidden="true">↗</span>
    </a>
  `).join('');
}

/** Wraps display headings so each glyph can ride the field independently. */
function splitHeadings() {
  $$('[data-liquid-text]').forEach((heading) => {
    if (heading.dataset.liquidReady) return;
    const walk = (node) => {
      [...node.childNodes].forEach((child) => {
        if (child.nodeType === Node.TEXT_NODE) {
          const text = child.textContent;
          if (!text.trim()) return;
          const fragment = document.createDocumentFragment();
          Array.from(text).forEach((letter) => {
            if (letter === ' ') {
              fragment.appendChild(document.createTextNode(' '));
              return;
            }
            const span = document.createElement('span');
            span.className = 'liquid-letter';
            span.textContent = letter;
            fragment.appendChild(span);
          });
          child.replaceWith(fragment);
        } else if (child.nodeType === Node.ELEMENT_NODE && child.tagName !== 'BR') {
          walk(child);
        }
      });
    };
    walk(heading);
    heading.dataset.liquidReady = 'true';
  });
}

/* ------------------------------------------------------- page load + scroll */

function finishLoading() {
  document.body.classList.add('is-loaded');
  const screen = $('[data-loading-screen]');
  if (screen) window.setTimeout(() => screen.remove(), prefersReducedMotion ? 80 : 680);
  window.setTimeout(() => {
    cacheWarpTargets();
    captureLiquidSprites();
  }, prefersReducedMotion ? 40 : 720);
}

function runLoadingCounter() {
  const count = $('[data-loading-count]');
  if (!count || prefersReducedMotion) {
    if (count) count.textContent = '100';
    finishLoading();
    return;
  }

  const startedAt = performance.now();
  let finished = false;
  const finish = () => {
    if (finished) return;
    finished = true;
    count.textContent = '100';
    finishLoading();
  };
  const tick = (now) => {
    if (finished) return;
    const progress = Math.min(100, Math.round(((now - startedAt) / 1080) * 100));
    count.textContent = String(progress);
    if (progress < 100) requestAnimationFrame(tick);
    else finish();
  };
  requestAnimationFrame(tick);
  // rAF is throttled to zero in hidden/background tabs — never leave the curtain up.
  window.setTimeout(finish, 2400);
}

function updatePageProgress(scrollY) {
  const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  const progress = clamp(scrollY / maxScroll, 0, 1);
  document.documentElement.style.setProperty('--page-progress', progress.toFixed(4));
  const meter = $('[data-page-progress]');
  if (meter) meter.style.transform = `scaleX(${progress})`;
}

function onScrollChanged(scrollY) {
  const delta = scrollY - water.scrollY;
  water.scrollY = scrollY;
  water.scrollVelocity = lerp(water.scrollVelocity, delta, 0.35);
  updatePageProgress(scrollY);
  updateScrollScenes(scrollY);

  // Scrolling stirs the same water the pointer does, so the page never
  // switches between two different motion languages.
  const stir = clamp(delta / window.innerHeight, -0.08, 0.08);
  if (Math.abs(delta) > 0.4) {
    if (water.renderer?.mode === 'fluid' && water.renderer.fluid) {
      water.renderer.fluid.current(
        water.pointer.x / window.innerWidth,
        water.pointer.y / window.innerHeight,
        stir
      );
    } else if (water.field) {
      water.field.current(stir * 9, 1);
    }
  }
}

function setupSmoothScroll() {
  if (prefersReducedMotion || !hasFinePointer || typeof window.Lenis === 'undefined') {
    document.documentElement.classList.add('is-reduced-scroll');
    window.addEventListener('scroll', () => onScrollChanged(window.scrollY), { passive: true });
    onScrollChanged(window.scrollY);
    return;
  }

  document.documentElement.classList.add('lenis', 'lenis-smooth');
  lenisInstance = new window.Lenis({
    lerp: 0.075,
    easing: (t) => 1 - Math.pow(1 - t, 4),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    syncTouch: false,
    syncTouchLerp: 0.085,
    wheelMultiplier: 0.82,
    touchMultiplier: 1.3
  });
  lenisInstance.on('scroll', ({ scroll }) => onScrollChanged(scroll));
  onScrollChanged(window.scrollY);
}

function setupAnchorScroll() {
  $$('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const id = link.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      event.preventDefault();
      if (lenisInstance) lenisInstance.scrollTo(target, { offset: -8, duration: 1.7 });
      else target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  });
}

function setupReveals() {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add('is-visible');
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

  $$('.reveal').forEach((element) => revealObserver.observe(element));
}

/* --------------------------------------------------------- geometry caching */

/**
 * Document-space centre from the offset chain rather than getBoundingClientRect,
 * so reveal transforms never poison the cached rest position and the read costs
 * no layout flush during the animation loop.
 */
function documentCentre(element) {
  let x = 0;
  let y = 0;
  let node = element;
  while (node) {
    x += node.offsetLeft;
    y += node.offsetTop;
    node = node.offsetParent;
  }
  return { x: x + element.offsetWidth / 2, y: y + element.offsetHeight / 2 };
}

function cacheWarpTargets() {
  const groups = [
    { selector: '.hero h1 .liquid-letter', gain: 0.34, lift: 0.5 },
    { selector: '.intro h2 .liquid-letter', gain: 0.3, lift: 0.45 },
    { selector: '.experience h2 .liquid-letter, .capability h2 .liquid-letter', gain: 0.28, lift: 0.42 },
    { selector: '.closing h2 .liquid-letter', gain: 0.3, lift: 0.45 },
    { selector: '.section-heading h2 .liquid-letter', gain: 0.26, lift: 0.4 },
    { selector: '.project-title-letter', gain: 0.62, lift: 1, row: true }
  ];

  warpTargets = groups.flatMap(({ selector, gain, lift, row }) => $$(selector).map((element) => {
    const centre = documentCentre(element);
    return {
      element,
      docX: centre.x,
      docY: centre.y,
      gain,
      lift,
      row: row ? element.closest('.project-row') : null,
      boost: 0,
      x: 0,
      y: 0,
      rotate: 0,
      scale: 0
    };
  }));

  const hero = $('.hero');
  if (hero) {
    water.heroRect = { top: hero.offsetTop, height: hero.offsetHeight };
  }
}

function documentOrigin(element) {
  const rect = element.getBoundingClientRect();
  return {
    x: rect.left + window.scrollX,
    y: rect.top + water.scrollY
  };
}

/**
 * Rasterize a heading or title so the GPU post-pass can warp glyphs the same
 * way it warps photographs. Colour is taken from tokens, not computed style,
 * because the live DOM may already be transparent once the overlay is active.
 */
function rasterizeElement(element) {
  const width = element.offsetWidth;
  const height = element.offsetHeight;
  if (width < 2 || height < 2) return null;

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const pad = 28;
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.ceil((width + pad * 2) * dpr));
  canvas.height = Math.max(1, Math.ceil((height + pad * 2) * dpr));
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.translate(pad, pad);

  const ink = '#fff6ea';
  const letters = element.querySelectorAll('.liquid-letter, .project-title-letter');
  const nodes = letters.length ? [...letters] : [element];
  const hostRect = element.getBoundingClientRect();

  nodes.forEach((node) => {
    const text = node.textContent;
    if (!text || !text.trim()) return;
    const rect = node.getBoundingClientRect();
    const cs = getComputedStyle(node);
    ctx.save();
    ctx.font = cs.font;
    ctx.fillStyle = ink;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    ctx.fillText(text, rect.left - hostRect.left, rect.top - hostRect.top + rect.height / 2);
    ctx.restore();
  });

  return { canvas, width: width + pad * 2, height: height + pad * 2, pad };
}

function captureLiquidSprites() {
  // Scroll scenes keep live DOM type: GPU snapshots cannot inherit parent masks/scale.
  if (scrollScenes || window.innerWidth <= 760) {
    liquidSprites = [];
    document.body.classList.remove('is-liquid-text');
    return;
  }
  if (!water.renderer || water.renderer.mode !== 'fluid') return;

  liquidSprites = $$('[data-liquid-text], .project-title').filter(element => !element.closest('.projects')).map((element, index) => {
    const captured = rasterizeElement(element);
    if (!captured) return null;
    const origin = documentOrigin(element);
    const record = water.renderer.uploadCanvas(`liquid:${element.id || element.className}:${index}`, captured.canvas);
    return {
      element,
      record,
      docX: origin.x - captured.pad,
      docY: origin.y - captured.pad,
      width: captured.width,
      height: captured.height,
      pad: captured.pad
    };
  }).filter(Boolean);

  document.body.classList.toggle('is-liquid-text', liquidSprites.length > 0);
}

function scheduleLiquidCapture() {
  window.clearTimeout(recaptureTimer);
  recaptureTimer = window.setTimeout(captureLiquidSprites, 120);
}

/* ------------------------------------------------------------ liquid motion */

function seedAmbientRipple() {
  if (water.renderer?.mode === 'fluid') return;
  const nx = 0.12 + Math.random() * 0.76;
  const ny = 0.12 + Math.random() * 0.76;
  const angle = Math.random() * Math.PI * 2;
  if (water.renderer?.mode === 'fluid' && water.renderer.fluid) {
    water.renderer.fluid.splat(
      nx, ny,
      Math.cos(angle) * 0.08,
      Math.sin(angle) * 0.08,
      0.1 + Math.random() * 0.05,
      0.045
    );
    return;
  }
  if (!water.field) return;
  water.field.splat(nx, ny, Math.cos(angle) * 0.0012, Math.sin(angle) * 0.0012, 0.13 + Math.random() * 0.1, 0.11);
}

function updatePlateMotion(dt) {
  const vw = Math.max(1, window.innerWidth);
  const vh = Math.max(1, window.innerHeight);
  const nx = water.pointer.x / vw - 0.5;
  const ny = water.pointer.y / vh - 0.5;
  const safeDt = Math.min(0.033, Math.max(dt, 1 / 240));

  // Rest pose: subtle lean opposite the cursor (keep refraction as the main cue).
  const targetX = -nx * vw * 0.022;
  const targetY = -ny * vh * 0.016;

  // pointerVelocity is px/frame → true velocity in px/s.
  const pointerVelX = water.pointerVelocity.x / safeDt;
  const pointerVelY = water.pointerVelocity.y / safeDt;
  const pointerSpeed = Math.hypot(pointerVelX, pointerVelY);

  // Light viscous drag — directional lag without the plate chasing the pointer.
  const coupling = 0.08 + Math.min(0.06, pointerSpeed / 7000);
  const drag = 2.6;
  plateMotion.vx += (pointerVelX * coupling - plateMotion.vx) * Math.min(1, drag * safeDt);
  plateMotion.vy += (pointerVelY * coupling - plateMotion.vy) * Math.min(1, drag * safeDt);

  // Soft spring back to parallax target (underdamped ≈ physical settle).
  const stiffness = 18;
  const damping = 6.4;
  plateMotion.vx += (stiffness * (targetX - plateMotion.x) - damping * plateMotion.vx) * safeDt;
  plateMotion.vy += (stiffness * (targetY - plateMotion.y) - damping * plateMotion.vy) * safeDt;
  plateMotion.x += plateMotion.vx * safeDt;
  plateMotion.y += plateMotion.vy * safeDt;

  const energy = Math.hypot(plateMotion.vx, plateMotion.vy);
  const targetZoom = 1.04 + Math.min(0.018, pointerSpeed / 28000) + Math.min(0.01, energy / 1800);
  const zoomStiffness = 16;
  const zoomDamping = 6.2;
  plateMotion.zoomV += (zoomStiffness * (targetZoom - plateMotion.zoom) - zoomDamping * plateMotion.zoomV) * safeDt;
  plateMotion.zoom += plateMotion.zoomV * safeDt;

  plateMotion.x = clamp(plateMotion.x, -vw * 0.035, vw * 0.035);
  plateMotion.y = clamp(plateMotion.y, -vh * 0.028, vh * 0.028);
  plateMotion.vx = clamp(plateMotion.vx, -220, 220);
  plateMotion.vy = clamp(plateMotion.vy, -160, 160);
  plateMotion.zoom = clamp(plateMotion.zoom, 1.02, 1.07);
}

function updateHeroPlate() {
  if (!water.hero || !water.hero.ready) return;
  const viewportHeight = window.innerHeight;
  const top = scrollScenes ? scrollScenes.hero.getBoundingClientRect().top : water.heroRect.top - water.scrollY;
  const height = water.heroRect.height || viewportHeight;
  const exit = clamp((top + height) / Math.max(1, height), 0, 1);
  if (exit <= 0.001) return;

  const bleed = height * 0.08;
  water.renderer.draw(water.hero, {
    x: -window.innerWidth * 0.04 + plateMotion.x + Math.sin(water.time * 0.16) * 9,
    y: top - bleed * 0.5 + plateMotion.y + Math.cos(water.time * 0.12) * 7,
    width: window.innerWidth * 1.08,
    height: height + bleed,
    alpha: Math.pow(exit, 0.7) * (1 - (scrollScenes?.progress || 0) * 0.52),
    strength: water.renderer.mode === 'fluid' ? 0 : 0.12,
    blob: 0,
    feather: water.renderer.mode === 'fluid' ? 0.12 : 0.16,
    desaturate: 1,
    brightness: 1.08,
    highlight: 0.35,
    tint: [1, 1, 1],
    time: water.time,
    zoom: plateMotion.zoom + (1 - exit) * 0.05 + (scrollScenes?.progress || 0) * 0.16
  });
}

function updateLiquidSprites() {
  if (!liquidSprites.length || !water.renderer) return;
  const viewportHeight = window.innerHeight;
  liquidSprites.forEach((sprite) => {
    const rect = sprite.element.getBoundingClientRect();
    const y = rect.top - sprite.pad;
    const reveal = sprite.element.closest(".reveal");
    const opacity = reveal ? Number(getComputedStyle(reveal).opacity) : 1;
    if (y + sprite.height < -80 || y > viewportHeight + 80) return;
    water.renderer.draw(sprite.record, {
      x: rect.left - sprite.pad,
      y,
      width: sprite.width,
      height: sprite.height,
      alpha: opacity,
      blob: 0,
      feather: 0.002,
      desaturate: 0,
      brightness: 1,
      highlight: 0,
      tint: [1, 1, 1],
      time: water.time,
      zoom: 1
    });
  });
}

function updatePreviewPlate(dt) {
  preview.alpha = lerp(preview.alpha, preview.targetAlpha, damp(6.5, dt));
  preview.x = lerp(preview.x, preview.targetX, damp(4.2, dt));
  preview.y = lerp(preview.y, preview.targetY, damp(4.2, dt));
  preview.zoom = lerp(preview.zoom, preview.targetAlpha > 0.5 ? 1 : 1.12, damp(3.4, dt));
}

/** Draw hover cover/detail into the fluid scene so the photo warps with the water. */
function updateAtmospherePlates() {
  if (!water.renderer || water.renderer.mode !== 'fluid') return;
  if (preview.alpha < 0.02 || !preview.record?.ready) return;

  const width = Math.max(1, preview.width * preview.zoom);
  const height = Math.max(1, preview.height * preview.zoom);
  const driftScale = 0.35;
  const x = preview.x - width * 0.5 + plateMotion.x * driftScale;
  const y = preview.y - height * 0.5 + plateMotion.y * driftScale;
  const plateAlpha = preview.alpha * 0.62;

  water.renderer.draw(preview.record, {
    x,
    y,
    width,
    height,
    alpha: plateAlpha,
    blob: 0,
    feather: 0.14,
    desaturate: 0.06,
    brightness: 0.94,
    highlight: 1.05,
    tint: [1, 1, 0.98],
    time: water.time,
    zoom: 1 + (plateMotion.zoom - 1.04) * 0.25
  });

  if (preview.detailRecord?.ready && pointerMix > 0.02) {
    water.renderer.draw(preview.detailRecord, {
      x,
      y,
      width,
      height,
      alpha: plateAlpha * pointerMix,
      blob: 0,
      feather: 0.14,
      desaturate: 0.04,
      brightness: 0.96,
      highlight: 1.06,
      tint: [1, 1, 0.98],
      time: water.time,
      zoom: 1 + (plateMotion.zoom - 1.04) * 0.25
    });
  }
}

/** Warps cached glyphs by sampling the shared field at each glyph centre. */
function updateLetterWarp(dt) {
  if (!water.field || !warpTargets.length) return;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const glide = damp(13, dt);
  const settle = damp(3.2, dt);
  const sample = { x: 0, y: 0, height: 0, strength: 0 };

  for (let i = 0; i < warpTargets.length; i += 1) {
    const target = warpTargets[i];
    const screenY = target.docY - water.scrollY;
    const visible = screenY > -160 && screenY < viewportHeight + 160;
    const wanted = target.row ? (target.row === activeProjectRow ? 1 : 0.14) : 1;
    target.boost = lerp(target.boost, visible ? wanted : 0, settle);

    if (target.boost < 0.01 && Math.abs(target.x) < 0.05 && Math.abs(target.y) < 0.05) {
      if (target.scale !== 0) {
        target.element.style.transform = '';
        target.scale = 0;
      }
      continue;
    }

    water.field.sample(target.docX / viewportWidth, screenY / viewportHeight, sample);
    const amplitude = target.gain * target.boost;
    const x = sample.x * viewportWidth * amplitude;
    const y = sample.y * viewportHeight * amplitude;
    const rise = -sample.height * 9 * target.lift * target.boost;
    const rotate = clamp(sample.x * viewportWidth * amplitude * 0.35, -14, 14);
    const swell = clamp(sample.height * 0.16 * target.boost, -0.14, 0.14);

    target.x = lerp(target.x, clamp(x, -46, 46), glide);
    target.y = lerp(target.y, clamp(y + rise, -46, 46), glide);
    target.rotate = lerp(target.rotate, rotate, glide * 0.85);
    target.scale = lerp(target.scale, swell, glide * 0.85);

    target.element.style.transform =
      `translate3d(${target.x.toFixed(2)}px, ${target.y.toFixed(2)}px, 0) ` +
      `rotate(${target.rotate.toFixed(2)}deg) ` +
      `scale(${(1 + target.scale).toFixed(3)}, ${(1 - target.scale * 0.55).toFixed(3)})`;
  }
}

function updateCursor() {
  const cursor = $('[data-water-cursor]');
  if (!cursor) return;
  const { x, y } = water.pointer;
  const vx = water.pointerVelocity.x;
  const vy = water.pointerVelocity.y;
  const speed = Math.min(1, Math.hypot(vx, vy) / 34);
  const angle = (Math.atan2(vy, vx) * 180) / Math.PI;
  cursor.style.transform =
    `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) rotate(${angle.toFixed(1)}deg) ` +
    `scale(${(1 + speed * 0.85).toFixed(3)}, ${(1 - speed * 0.42).toFixed(3)})`;
  cursor.style.setProperty('--cursor-speed', speed.toFixed(3));
}

function frame(now) {
  if (document.hidden) { frame.last = now; requestAnimationFrame(frame); return; }
  const dt = Math.min(0.05, Math.max(0.001, (now - (frame.last || now)) / 1000));
  frame.last = now;
  water.time += dt;

  if (lenisInstance) lenisInstance.raf(now);

  const follow = damp(8.5, dt);
  water.pointerVelocity.x = (water.pointerTarget.x - water.pointer.x) * follow;
  water.pointerVelocity.y = (water.pointerTarget.y - water.pointer.y) * follow;
  water.pointer.x += water.pointerVelocity.x;
  water.pointer.y += water.pointerVelocity.y;

  updatePlateMotion(dt);

  const atmosphere = $('[data-project-atmosphere]');
  pointerMix = lerp(pointerMix, pointerMixTarget, damp(7.5, dt));
  if (atmosphere) setProjectImageMix(atmosphere, pointerMix);

  const root = document.documentElement;
  root.style.setProperty('--cursor-x', `${water.pointer.x.toFixed(1)}px`);
  root.style.setProperty('--cursor-y', `${water.pointer.y.toFixed(1)}px`);
  root.style.setProperty('--hero-drift-x', `${plateMotion.x.toFixed(2)}px`);
  root.style.setProperty('--hero-drift-y', `${plateMotion.y.toFixed(2)}px`);
  root.style.setProperty('--hero-drift-zoom', plateMotion.zoom.toFixed(4));

  const fluidMode = water.renderer?.mode === 'fluid';
  if (activeProjectRow && preview.targetAlpha > 0.01) {
    const rowRect = activeProjectRow.getBoundingClientRect();
    preview.targetX = rowRect.left + rowRect.width * 0.48;
    preview.targetY = rowRect.top + rowRect.height * 0.5;
  }
  if (water.field && !fluidMode) water.field.step(dt);
  water.scrollVelocity *= 0.9;

  if (water.time > water.nextAmbient) {
    water.nextAmbient = water.time + 1.6 + Math.random() * 1.8;
    seedAmbientRipple();
  }

  if (water.renderer) {
    water.renderer.beginFrame(dt);
    updateHeroPlate();
    if (fluidMode) {
      updatePreviewPlate(dt);
      updateAtmospherePlates();
      updateLiquidSprites();
      water.renderer.endFrame({
        active: preview.targetAlpha > 0.5 || preview.alpha > 0.2
      });
    } else {
      updatePreviewPlate(dt);
    }
  }

  if (!fluidMode) updateLetterWarp(dt);
  updateCursor();

  requestAnimationFrame(frame);
}

function resizeCanvas() {
  if (!water.renderer) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  water.renderer.resize(window.innerWidth, window.innerHeight, dpr);
  water.field.setAspect(window.innerWidth / Math.max(1, window.innerHeight));
}

function initWater() {
  water.field = new window.WaterField();
  water.field.setAspect(window.innerWidth / Math.max(1, window.innerHeight));

  const canvas = $('[data-water-canvas]');
  // file:// blocks image-to-WebGL uploads in Chromium; keep the CSS + DOM pipeline there
  // so the folder can be double-clicked on any machine and still look intact.
  const canUseRenderer = window.location.protocol !== 'file:';
  if (canvas && canUseRenderer && typeof window.WaterRenderer === 'function') {
    try {
      water.renderer = new window.WaterRenderer(canvas, water.field);
      resizeCanvas();
      document.body.classList.add('is-water-ready');
      if (water.renderer.mode === 'fluid') document.body.classList.add('is-fluid-water');
      water.hero = water.renderer.load(HERO_PLATE);
      water.hero.promise.then((record) => {
        if (record.ready) {
          water.ready = true;
          return;
        }
        // Hero texture refused (odd origin, moved assets): hand the page back to the CSS hero.
        water.renderer = null;
        liquidSprites = [];
        document.body.classList.remove('is-water-ready', 'is-liquid-text', 'is-fluid-water');
      });
      scheduleLiquidCapture();
    } catch (error) {
      water.renderer = null;
    }
  }

  window.addEventListener('resize', () => {
    resizeCanvas();
    cacheWarpTargets();
    scheduleLiquidCapture();
  });

  window.addEventListener('pointermove', (event) => {
    water.pointerTarget.x = event.clientX;
    water.pointerTarget.y = event.clientY;
    const nx = event.clientX / window.innerWidth;
    const ny = event.clientY / window.innerHeight;
    if (water.renderer?.mode === 'fluid' && water.renderer.fluid) {
      water.renderer.fluid.movePointer(nx, ny);
    } else {
      water.field.movePointer(nx, ny);
    }
    if (activeProjectRow) {
      preview.targetX = event.clientX + preview.width * 0.2;
      preview.targetY = event.clientY;
    }
  }, { passive: true });

  window.addEventListener('pointerdown', (event) => {
    const nx = event.clientX / window.innerWidth;
    const ny = event.clientY / window.innerHeight;
    if (water.renderer?.mode === 'fluid' && water.renderer.fluid) {
      water.renderer.fluid.splat(nx, ny, 0, 0, 0.024, 0.08);
    } else {
      water.field.splat(nx, ny, 0, 0, 0.09, 1.5);
    }
  }, { passive: true });

  window.addEventListener('pointerleave', () => {
    if (water.renderer?.fluid) water.renderer.fluid.releasePointer();
    water.field.releasePointer();
  });
  document.addEventListener('visibilitychange', () => {
    const hidden = document.hidden;
    if (water.field) water.field.paused = hidden;
    if (water.renderer?.fluid) water.renderer.fluid.paused = hidden;
  });
}

/* ---------------------------------------------------------- project preview */

function setProjectImageMix(atmosphere, mix) {
  atmosphere.style.setProperty('--image-mix', clamp(mix, 0, 1).toFixed(3));
}

function openProjectAtmosphere(row, event) {
  const project = WENCHUANG_PROJECTS.find((item) => item.id === row.dataset.projectId);
  const atmosphere = $('[data-project-atmosphere]');
  const projects = $('.projects');
  if (!project || !atmosphere || !projects) return;

  const cover = $('[data-project-atmosphere-cover]', atmosphere);
  const detail = $('[data-project-atmosphere-detail]', atmosphere);
  const [coverPath, detailPath] = getProjectImages(project);
  const rowRect = row.getBoundingClientRect();
  const sectionRect = projects.getBoundingClientRect();
  const x = clamp(rowRect.left - sectionRect.left + rowRect.width * 0.48, 180, Math.max(200, sectionRect.width - 180));
  const y = rowRect.top - sectionRect.top + rowRect.height * 0.5;
  setAtmosphereImage(cover, coverPath);
  setAtmosphereImage(detail, detailPath);
  atmosphere.style.setProperty('--atmo-x', `${x}px`);
  atmosphere.style.setProperty('--atmo-y', `${y}px`);
  atmosphere.style.setProperty('--wake-x', `${water.pointer.x - sectionRect.left}px`);
  atmosphere.style.setProperty('--wake-y', `${water.pointer.y - sectionRect.top}px`);
  const enteringX = Number.isFinite(event?.clientX) ? event.clientX : water.pointerTarget.x;
  const enteringY = Number.isFinite(event?.clientY) ? event.clientY : water.pointerTarget.y;
  pointerMixTarget = clamp((enteringX - rowRect.left) / Math.max(1, rowRect.width), 0, 1);
  if (!atmosphere.classList.contains('is-visible')) pointerMix = pointerMixTarget;
  setProjectImageMix(atmosphere, pointerMix);

  row.classList.add('is-hovered');
  activeProjectRow = row;
  document.body.classList.add('is-atmosphere-visible');
  atmosphere.classList.add('is-visible');
  atmosphere.setAttribute('aria-hidden', 'false');

  if (!water.renderer) return;

  preview.width = Math.min(window.innerWidth * 0.46, 640);
  preview.height = preview.width * (2 / 3);
  preview.targetX = rowRect.left + rowRect.width * 0.5;
  preview.targetY = rowRect.top + rowRect.height * 0.5;
  if (preview.alpha < 0.01) {
    preview.x = preview.targetX;
    preview.y = preview.targetY;
  }
  preview.targetAlpha = 1;

  preview.record = null;
  preview.detailRecord = null;
  const record = water.renderer.load(coverPath);
  const detailRecord = water.renderer.load(detailPath);
  record.promise.then((loaded) => {
    if (activeProjectRow !== row) return;
    if (record.failed || !loaded.ready) {
      const fallbackRecord = water.renderer.load(PROJECT_IMAGE_FALLBACK);
      fallbackRecord.promise.then((fallbackLoaded) => {
        if (activeProjectRow === row && fallbackLoaded.ready) preview.record = fallbackLoaded;
      });
      if (fallbackRecord.ready) preview.record = fallbackRecord;
      return;
    }
    preview.record = loaded;
  });
  detailRecord.promise.then((loaded) => {
    if (activeProjectRow === row && loaded.ready) preview.detailRecord = loaded;
  });
  if (record.ready) preview.record = record;
  if (detailRecord.ready) preview.detailRecord = detailRecord;

  const pointerX = clamp(enteringX, rowRect.left, rowRect.right);
  const pointerY = clamp(enteringY, rowRect.top, rowRect.bottom);
  const nx = pointerX / window.innerWidth;
  const ny = pointerY / window.innerHeight;
  water.field.splat(nx, ny, 0, 0, 0.21, 0.9);
  if (water.renderer?.mode === 'fluid' && water.renderer.fluid) {
    water.renderer.fluid.movePointer(nx, ny);
    water.renderer.fluid.splat(nx, ny, 0.05, 0, 0.09, 0.28);
  }
}

function updateProjectAtmosphere(event) {
  if (!activeProjectRow) return;
  const atmosphere = $('[data-project-atmosphere]');
  const projects = $('.projects');
  if (!atmosphere || !projects) return;
  const sectionRect = projects.getBoundingClientRect();
  const rowRect = activeProjectRow.getBoundingClientRect();
  atmosphere.style.setProperty('--wake-x', `${event.clientX - sectionRect.left}px`);
  atmosphere.style.setProperty('--wake-y', `${event.clientY - sectionRect.top}px`);
  pointerMixTarget = clamp((event.clientX - rowRect.left) / Math.max(1, rowRect.width), 0, 1);
}

function closeProjectAtmosphere(row) {
  if (row) row.classList.remove('is-hovered');
  if (!row || row === activeProjectRow) activeProjectRow = null;
  const atmosphere = $('[data-project-atmosphere]');
  if (atmosphere) {
    atmosphere.classList.remove('is-visible');
    atmosphere.setAttribute('aria-hidden', 'true');
  }
  document.body.classList.remove('is-atmosphere-visible');
  preview.targetAlpha = 0;
  preview.detailRecord = null;
  pointerMixTarget = 0;
}

function setupProjectAtmosphere() {
  const rows = $$('.project-row');
  if (!rows.length) return;

  if (liquidEnabled) {
    window.addEventListener('pointermove', updateProjectAtmosphere, { passive: true });
  }

  rows.forEach((row) => {
    const enter = (event) => { if (liquidEnabled) openProjectAtmosphere(row, event); };
    const leave = () => { if (liquidEnabled) closeProjectAtmosphere(row); };
    row.addEventListener('pointerenter', enter);
    row.addEventListener('pointerleave', leave);
    row.addEventListener('focusin', () => openProjectAtmosphere(row));
    row.addEventListener('focusout', (event) => {
      if (!row.contains(event.relatedTarget)) closeProjectAtmosphere(row);
    });
  });
}

/** Links drift toward the pointer, borrowing the same lag as the water. */
function setupMagneticLinks() {
  if (!liquidEnabled) return;
  $$('[data-magnetic]').forEach((element) => {
    let frameId = null;
    const reset = () => {
      element.style.setProperty('--magnet-x', '0px');
      element.style.setProperty('--magnet-y', '0px');
    };
    element.addEventListener('pointermove', (event) => {
      if (frameId) return;
      frameId = requestAnimationFrame(() => {
        frameId = null;
        const rect = element.getBoundingClientRect();
        const dx = event.clientX - (rect.left + rect.width / 2);
        const dy = event.clientY - (rect.top + rect.height / 2);
        element.style.setProperty('--magnet-x', `${clamp(dx * 0.28, -16, 16).toFixed(1)}px`);
        element.style.setProperty('--magnet-y', `${clamp(dy * 0.34, -10, 10).toFixed(1)}px`);
      });
    });
    element.addEventListener('pointerleave', reset);
    element.addEventListener('blur', reset);
  });
}

function setupCursorStates() {
  if (!liquidEnabled) return;
  document.body.classList.add('has-water-cursor');
  const setState = (state) => document.body.setAttribute('data-cursor-state', state);
  // Delegated so late-rendered drawer links share the same cursor language.
  document.addEventListener('pointerover', (event) => {
    setState(event.target.closest('a, button, [data-cursor-hover]') ? 'hover' : 'idle');
  }, { passive: true });
}

/** A small live clock in the chrome, the way studio sites announce presence. */
function setupLocalClock() {
  const clock = $('[data-local-clock]');
  if (!clock) return;
  const pad = (value) => String(value).padStart(2, '0');
  const render = () => {
    const now = new Date();
    clock.textContent = `${pad(now.getHours())}:${pad(now.getMinutes())} LOCAL`;
  };
  render();
  window.setInterval(render, 30000);
}

/* ------------------------------------------------------------ detail drawer */

function renderDetailVisual(project) {
  if (project.visual === 'math') {
    return `<div class="detail-media detail-media-video"><video controls preload="metadata" poster="${project.image}" src="assets/math-project/scenario-video/average-misread-geometric.mp4" aria-label="平均数错中求解情景视频"></video><span class="media-stamp">情景讲解成片</span></div>`;
  }
  if (project.visual === 'platform') {
    const ratingRows = [['实用性', 30], ['易用性', 25], ['稳定性', 25], ['说明完整', 20]]
      .map(([label, weight]) => `<div class="platform-rating-row"><span>${label}</span><i style="--weight:${weight}%"></i><b>${weight}%</b></div>`).join('');
    const nav = [['tools', '工具', true], ['training', '培训中心'], ['requirements', '需求池'], ['cockpit', '看板'], ['admin', '管理']]
      .map(([id, label, selected]) => `<button type="button" role="tab" data-platform-screen="${id}" aria-selected="${selected ? 'true' : 'false'}">${label}</button>`).join('');
    const cards = [
      ['内容制作', '批量点读校验', '综合 4.6 · 可试用', '已发布', true],
      ['培训中心', 'AI 工作台实战课', '有效学习记录', '课程已上架', false],
      ['办公自动化', '周报自动汇总', '综合 4.2 · 可下载', '已发布', true]
    ].map(([tag, title, meta, status, live]) => `<button type="button" class="platform-tool${live ? ' is-live' : ''}"><span>${tag}</span><strong>${title}</strong><small>${meta}</small><em${live ? ' class="is-live"' : ''}>${status}</em></button>`).join('');
    return `<div class="detail-media platform-map" data-platform-demo><div class="platform-window"><div class="platform-topline"><span>内容培训平台</span><span>团队日常在用</span></div><div class="platform-nav" role="tablist" aria-label="平台模块">${nav}</div><p class="platform-hint" data-platform-hint>按业务场景找到工具，看清输入输出后再试用。</p><div class="platform-board" data-platform-board>${cards}</div><div class="platform-rating" data-platform-rating><span class="platform-rating-title">四维加权评分</span>${ratingRows}</div><div class="platform-status" data-platform-flow><span data-flow-step class="is-current">上传</span><span aria-hidden="true">→</span><span data-flow-step>校验</span><span aria-hidden="true">→</span><span data-flow-step>发布</span><span aria-hidden="true">→</span><span data-flow-step>可访问</span></div></div><p class="platform-guide">点模块切换示意，右侧功能会跟着走。</p></div>`;
  }
  if (project.visual === 'watch') {
    return `<figure class="detail-media watch-workflow-visual"><img src="${project.image}" width="1536" height="1024" alt="手表内容制作流程：2D 素材输入、转 3D 画面、3D 图生视频、品检与成片交付" /><figcaption>2D 素材 → 3D 画面 → 视频 → 品检 → 交付 · 流程示意</figcaption></figure>`;
  }
  if (project.visual === 'textbook-video') {
    return `<div class="detail-media detail-media-video textbook-video-stage"><video controls preload="metadata" poster="assets/interactive-textbook/gitlab-pages-deploy/assets/images/p015_1.png" src="assets/interactive-textbook/gitlab-pages-deploy/assets/video/final.mp4" aria-label="译林二上 U3 Animals at the Zoo 教学成片"></video><div class="textbook-report-strip"><span>P014 / P015 教材原图</span><span>五幕教学成片</span></div><span class="media-stamp">教材 → 成片案例</span></div>`;
  }
  return `<div class="detail-media textbook-stage"><div class="textbook-sheet"><span>CASE STUDY</span><strong>教材 → 分镜 → 视频</strong><small>打开案例，查看完整制作链路。</small><div class="textbook-blocks"><i>读页</i><i>分镜</i><i>生成</i><i>配音</i><i>成片</i></div></div><div class="textbook-cursor">OPEN ↗</div></div>`;
}

function setDetailBackgroundInert(inert) {
  const background = [$('.site-header'), ...$$('main > :not([data-project-detail])')].filter(Boolean);
  background.forEach((element) => { element.inert = inert; });
}

function renderProjectDetail(project, trigger) {
  const detail = $('[data-project-detail]');
  if (!detail || !project) return;
  detailTrigger = trigger || document.activeElement;
  const actions = project.actions.map((action, index) => `<a class="detail-action${index === 0 ? ' is-primary' : ''}" data-detail-action href="${action.href}"${action.download ? ' download' : ''}>${action.label}<span>↗</span></a>`).join('');
  const featureJumps = project.visual === 'platform' ? ['tools', 'training', 'status'] : [];
  const features = project.features.map((feature, index) => {
    const jump = featureJumps[index];
    const body = `<span>0${index + 1}</span>${feature}`;
    return jump
      ? `<li><button type="button" class="detail-feature" data-platform-jump="${jump}">${body}</button></li>`
      : `<li>${body}</li>`;
  }).join('');
  const stats = project.stats.map(([value, label]) => `<div><strong>${value}</strong><span>${label}</span></div>`).join('');
  const impact = project.impact ? `<section class="detail-impact" aria-label="项目价值与个人贡献"><h3>从业务问题到落地成果</h3><dl>${project.impact.map(([label, body]) => `<div><dt>${label}</dt><dd>${body}</dd></div>`).join('')}</dl></section>` : '';
  const meta = project.meta
    ? `<dl class="detail-meta">${project.meta.map(([key, value]) => `<div><dt>${key}</dt><dd>${value}</dd></div>`).join('')}</dl>`
    : '';
  const plate = `<figure class="detail-plate"><div class="detail-plate-image" style="background-image:url('${getProjectImages(project)[1]}')"></div><figcaption><span>PLATE ${project.number}-B / WORK</span><span>${project.subtitle}</span></figcaption></figure>`;
  const projectIndex = WENCHUANG_PROJECTS.indexOf(project);
  const prevProject = WENCHUANG_PROJECTS[(projectIndex - 1 + WENCHUANG_PROJECTS.length) % WENCHUANG_PROJECTS.length];
  const nextProject = WENCHUANG_PROJECTS[(projectIndex + 1) % WENCHUANG_PROJECTS.length];
  const nav = `<nav class="detail-nav" aria-label="在项目之间切换"><button type="button" class="detail-nav-link" data-detail-nav="${prevProject.id}"><span>← PREV / 上一个</span><strong><em>${prevProject.number}</em>${prevProject.title}</strong></button><button type="button" class="detail-nav-link is-next" data-detail-nav="${nextProject.id}"><span>NEXT / 下一个 →</span><strong><em>${nextProject.number}</em>${nextProject.title}</strong></button></nav>`;
  detail.innerHTML = `<div class="detail-shell" data-case="${project.id}" style="--case-cover:url(\'${getProjectImages(project)[0]}\')" data-lenis-prevent tabindex="-1"><button class="detail-close" type="button" data-detail-close aria-label="关闭项目详情">关闭 <span>×</span></button><div class="detail-header"><span class="detail-ghost" aria-hidden="true">${project.number}</span><h2 id="project-detail-title" data-detail-title>${project.title}</h2><p class="detail-intro" data-detail-body>${project.intro}</p>${meta}<div class="detail-actions">${actions}</div></div>${impact}<div class="detail-overview"><div>${renderDetailVisual(project)}</div><div class="detail-side"><span class="detail-label">交付能力与结果依据</span><ul class="detail-features">${features}</ul><div class="detail-stats">${stats}</div>${project.statsNote ? `<p class="detail-stats-note">${project.statsNote}</p>` : ''}</div></div>${plate}${nav}</div>`;
  detail.classList.add('is-open');
  detail.setAttribute('aria-hidden', 'false');
  detail.scrollTop = 0;
  document.body.classList.add('is-detail-open');
  setDetailBackgroundInert(true);
  lenisInstance?.stop();
  const closeButton = $('[data-detail-close]', detail);
  closeButton?.addEventListener('click', closeProjectDetail);
  $$('[data-detail-nav]', detail).forEach((button) => button.addEventListener('click', () => {
    const target = WENCHUANG_PROJECTS.find((item) => item.id === button.dataset.detailNav);
    if (target) renderProjectDetail(target, detailTrigger);
  }));
  bindPlatformDemo(detail);
  const shell = $('[data-case]', detail);
  window.setTimeout(() => shell?.focus({ preventScroll: true }), 0);
}

function closeProjectDetail() {
  const detail = $('[data-project-detail]');
  if (!detail || !detail.classList.contains('is-open')) return;
  detail.classList.remove('is-open');
  detail.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('is-detail-open');
  setDetailBackgroundInert(false);
  lenisInstance?.start();
  const trigger = detailTrigger;
  detailTrigger = null;
  trigger?.focus({ preventScroll: true });
}

function bindPlatformDemo(root) {
  const demo = $('[data-platform-demo]', root);
  if (!demo) return;
  const screens = {
    tools: {
      hint: '按业务场景找到工具，看清输入输出后再试用。',
      cards: [
        ['内容制作', '批量点读校验', '综合 4.6 · 可试用', '已发布', true],
        ['数据处理', '单元目录构建', '可试用 · 已发布', '已发布', true],
        ['办公自动化', '周报自动汇总', '综合 4.2 · 可下载', '已发布', true]
      ]
    },
    training: {
      hint: '学习路径与实操课分开，完成动作才记有效时长。',
      cards: [
        ['培训中心', 'AI 工作台实战课', '有效学习记录', '课程已上架', false],
        ['基础课', 'Prompt 基础', '章节练习', '已上架', false],
        ['实操', '生 H5 培训', '本地可打开', '可体验', true]
      ]
    },
    requirements: {
      hint: '把角色、痛点和方案留在同一处，按紧急度判断下一步。',
      cards: [
        ['待处理', '减少重复录入', '教材目录整理', '待处理', false],
        ['待处理', '让操作方法可复用', '培训沉淀', '待处理', false],
        ['已处理', '整理教材目录', '已关联工具', '已处理', true]
      ]
    },
    cockpit: {
      hint: '建设、使用、反馈分开看，不把上传数当成收益。',
      cards: [
        ['建设', '新增工具', '近 30 天示意', '示意', false],
        ['使用', '有效进入', '有操作才计数', '示意', false],
        ['反馈', '评分与讨论', '少量评分不代表全体', '示意', false]
      ]
    },
    admin: {
      hint: '账号、课程上下架与发布状态，保证平台能继续运转。',
      cards: [
        ['课程', '培训 H5 管理', '独立发布链路', '维护中', false],
        ['权限', '角色与账号', '展厅不改真实数据', '只读', false],
        ['发布', '状态回写', '失败可重发', '可检查', true]
      ]
    }
  };

  const hint = $('[data-platform-hint]', demo);
  const board = $('[data-platform-board]', demo);
  const flow = $('[data-platform-flow]', demo);
  const rating = $('[data-platform-rating]', demo);

  const paint = (id) => {
    const screen = screens[id];
    if (!screen) return;
    $$('[data-platform-screen]', demo).forEach((tab) => {
      tab.setAttribute('aria-selected', String(tab.dataset.platformScreen === id));
    });
    hint.textContent = screen.hint;
    board.innerHTML = screen.cards.map(([tag, title, meta, status, live]) => (
      `<button type="button" class="platform-tool${live ? ' is-live' : ''}"><span>${tag}</span><strong>${title}</strong><small>${meta}</small><em${live ? ' class="is-live"' : ''}>${status}</em></button>`
    )).join('');
    demo.dataset.activeScreen = id;
    flow.classList.toggle('is-emphasis', id === 'status');
    rating.classList.toggle('is-emphasis', id === 'tools');
    $$('[data-platform-jump]', root).forEach((button) => {
      button.classList.toggle('is-current', button.dataset.platformJump === id || (id === 'tools' && button.dataset.platformJump === 'tools'));
    });
  };

  demo.addEventListener('click', (event) => {
    const tab = event.target.closest('[data-platform-screen]');
    if (tab) paint(tab.dataset.platformScreen);
  });
  root.addEventListener('click', (event) => {
    const jump = event.target.closest('[data-platform-jump]');
    if (!jump) return;
    const id = jump.dataset.platformJump;
    if (id === 'status') {
      paint('tools');
      flow.classList.add('is-emphasis');
      rating.classList.remove('is-emphasis');
      $$('[data-platform-jump]', root).forEach((button) => button.classList.toggle('is-current', button === jump));
      return;
    }
    paint(id);
  });
}

function setupProjectDetails() {
  $$('.project-row').forEach((row) => row.addEventListener('click', (event) => {
    const project = WENCHUANG_PROJECTS.find((item) => item.id === row.dataset.projectId);
    if (project.direct) return;
    event.preventDefault();
    closeProjectAtmosphere(row);
    renderProjectDetail(project, row);
  }));
  document.addEventListener('click', (event) => {
    if (event.target.closest('[data-detail-close]') || event.target.matches('[data-project-detail]')) closeProjectDetail();
  });
  document.addEventListener('keydown', (event) => {
    const detail = $('[data-project-detail]');
    const open = detail?.classList.contains('is-open');
    if (event.key === 'Escape') closeProjectDetail();
    if (!open) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      if (event.target.closest('video, a, input, textarea')) return;
      event.preventDefault();
      const button = $(event.key === 'ArrowLeft' ? '[data-detail-nav]:not(.is-next)' : '[data-detail-nav].is-next', detail);
      button?.click();
      return;
    }
    if (event.key !== 'Tab') return;
    const focusable = $$('a[href], button:not([disabled]), video[controls], [tabindex]:not([tabindex="-1"])', detail).filter((element) => !element.hidden);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
}

/* -------------------------------------------------------------------- start */

renderProjects(WENCHUANG_PROJECTS);
splitHeadings();
setupScrollScenes();
setupSmoothScroll();
setupAnchorScroll();
setupReveals();
setupProjectAtmosphere();
setupProjectDetails();
setupMagneticLinks();
setupCursorStates();
setupLocalClock();
cacheWarpTargets();

if (liquidEnabled) {
  initWater();
  requestAnimationFrame(frame);
} else {
  document.documentElement.classList.add('is-static-motion');
  updatePageProgress(window.scrollY);
}

window.addEventListener('load', () => {
  cacheWarpTargets();
  scheduleLiquidCapture();
});
if (document.fonts?.ready) {
  document.fonts.ready.then(() => {
    cacheWarpTargets();
    scheduleLiquidCapture();
  });
}
runLoadingCounter();
