(() => {
  const { chapterAt, qualityRoute } = window.DeliveryModel;
  const chapters = [...document.querySelectorAll('.chapter')];
  const nav = [...document.querySelectorAll('.chapter-nav a')];
  const nodes = [...document.querySelectorAll('.map-node')];
  const captions = [
    ['需求不是起点的一句话。', '把预期效果、成本和技术条件放到一起，形成能讨论、能执行的可行路径。'],
    ['让平台接住重复的制作动作。', '从自动触发到不合格回流，按真实生产过程定义能力，再通过验收检查衔接。'],
    ['用同一套规则，连接生成与验收。', '规定什么要打回、如何修正、谁来兜底，让制作和品检使用同一种判断依据。'],
    ['我的位置，在各领域的连接处。', '跟进 TRD、图片、TTS 与供应商准备，把每一条支线的依赖接到交付计划。'],
    ['把“待定”，变成明确的前置条件。', '量产前摊开成本与平台交付风险，组织相关角色共同判断是否具备启动条件。'],
    ['状态跟到批次，进度跟到环境。', '区分计划排期、制作完成与实际已上线，持续跟踪会影响最终交付的链路。']
  ];
  const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
  const motionButton = document.querySelector('#motion-toggle');
  const canvas = document.querySelector('#thread-canvas');
  const ctx = canvas.getContext('2d');
  let heroVisible = true;
  let paused = false, frameId = 0, lastPaint = 0, lastTime = 0, time = 0;
  let width = 0, height = 0, dpr = 1, active = -1, progress = 0, dirty = true;
  let pointerX = 0, pointerY = 0;

  function updateScene() {
    const anchor = innerHeight * .4;
    let index = 0;
    for (let i = 0; i < chapters.length; i++) if (chapters[i].getBoundingClientRect().top <= anchor) index = i;
    const rect = chapters[index].getBoundingClientRect();
    progress = Math.max(0, Math.min(6, index + (anchor - rect.top) / rect.height));
    index = chapterAt(progress);
    document.querySelector('#chapter-progress').style.setProperty('--progress', progress / 6);
    document.querySelector('#map-active').style.strokeDashoffset = String(100 - Math.min(100, progress / 5.5 * 100));
    const hero = document.querySelector('.hero').getBoundingClientRect();
    heroVisible = hero.bottom > 0 && hero.top < height;
    document.body.style.setProperty('--art-opacity', hero.bottom > height * .2 ? '.95' : '.24');
    if (index === active) return;
    active = index;
    nav.forEach((link, i) => i === index ? link.setAttribute('aria-current', 'step') : link.removeAttribute('aria-current'));
    nodes.forEach((node, i) => { node.classList.toggle('is-active', i === index); node.classList.toggle('is-past', i < index); });
    document.querySelector('#scene-counter').textContent = `0${index + 1} / 06`;
    document.querySelector('#scene-label').textContent = captions[index][0];
    document.querySelector('#scene-copy').textContent = captions[index][1];
    const caption = document.querySelector('.scene-caption');
    caption.classList.remove('is-changing');
    if (!motionPreference.matches && !paused) requestAnimationFrame(() => caption.classList.add('is-changing'));
  }

  function resize() {
    width = innerWidth; height = innerHeight; dpr = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    dirty = true; queue();
  }

  // One ribbon surface; strands inherit its shape and lag, rather than moving independently.
  function point(angle, fiber, phase) {
    const mobile = width < 761;
    const size = Math.min(width * (mobile ? .82 : .35), height * .59);
    const tilt = -.32 + Math.sin(phase * .13) * .12 + Math.min(scrollY / Math.max(height, 1), 4) * .12;
    const twist = angle * 1.5 + phase * .16;
    const spread = fiber * size * .24;
    const radius = size * .69 + Math.cos(twist) * spread;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius * 1.21;
    const z = Math.sin(twist) * spread + Math.sin(angle) * size * .23;
    const rotatedX = x * Math.cos(tilt) - y * Math.sin(tilt);
    const rotatedY = x * Math.sin(tilt) + y * Math.cos(tilt);
    const perspective = 1 + z / (size * 4);
    return { x: width * (mobile ? .68 : .74) + rotatedX * perspective + pointerX * 10,
      y: height * (mobile ? .23 : .47) + rotatedY * perspective + pointerY * 7,
      depth: (z / size + 1) * .5 };
  }

  function draw() {
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    const fiberCount = width < 761 ? 40 : 68;
    const segments = width < 761 ? 100 : 140;
    for (let f = 0; f < fiberCount; f++) {
      const fiber = (f / (fiberCount - 1) - .5) * 2;
      ctx.beginPath();
      for (let s = 0; s <= segments; s++) {
        const angle = s / segments * Math.PI * 2;
        const p = point(angle, fiber, time);
        if (s === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
      }
      const shine = .15 + Math.pow(Math.sin(f / fiberCount * Math.PI), 5) * .3;
      ctx.strokeStyle = f % 5 === 0 ? `rgba(224,192,145,${shine + .12})` : `rgba(164,211,211,${shine})`;
      ctx.lineWidth = f % 5 === 0 ? 1.05 : .65; ctx.stroke();
    }
    for (let i = 0; i < 6; i++) {
      const angle = i / 6 * Math.PI * 2 + time * .06;
      const p = point(angle, Math.sin(i * 2) * .6, time);
      ctx.beginPath(); ctx.arc(p.x, p.y, i === active ? 3.2 : 1.8, 0, Math.PI * 2);
      ctx.fillStyle = i === active ? '#edd3aa' : '#b1d5d3'; ctx.fill();
    }
  }

  function frame(now) {
    frameId = 0;
    if (document.hidden) { lastTime = 0; return; }
    if (dirty) { updateScene(); dirty = false; }
    const animated = heroVisible && !paused && !motionPreference.matches;
    if (animated && lastTime) time += Math.min((now - lastTime) / 1000, .06);
    lastTime = animated ? now : 0;
    if (!animated || now - lastPaint >= 32) { draw(); lastPaint = now; }
    if (animated) queue();
  }
  function queue() { if (!frameId && !document.hidden) frameId = requestAnimationFrame(frame); }
  function markDirty() { dirty = true; queue(); }
  function syncMotionButton() {
    const stopped = paused || motionPreference.matches;
    motionButton.setAttribute('aria-pressed', String(stopped));
    motionButton.textContent = motionPreference.matches ? '静态动效模式' : paused ? '继续动效' : '暂停动效';
    motionButton.disabled = motionPreference.matches;
    if (frameId) cancelAnimationFrame(frameId);
    frameId = 0; lastTime = 0; markDirty();
  }
  motionButton.addEventListener('click', () => { paused = !paused; syncMotionButton(); });
  motionPreference.addEventListener('change', syncMotionButton);
  addEventListener('scroll', markDirty, { passive: true });
  addEventListener('resize', resize, { passive: true });
  addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse' || paused || motionPreference.matches) return;
    pointerX = event.clientX / width - .5; pointerY = event.clientY / height - .5;
  }, { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && frameId) { cancelAnimationFrame(frameId); frameId = 0; lastTime = 0; }
    else markDirty();
  });

  const qualityButtons = [...document.querySelectorAll('[data-quality]')];
  const repeatFailure = document.querySelector('#repeat-failure');
  let qualityKind = 'context';
  function renderQuality() {
    repeatFailure.disabled = qualityKind !== 'context';
    repeatFailure.closest('label').classList.toggle('is-disabled', repeatFailure.disabled);
    const rule = qualityRoute(qualityKind, repeatFailure.checked ? 2 : 1);
    document.querySelector('#quality-destination').textContent = rule.destination;
    document.querySelector('#quality-description').textContent = rule.detail;
    qualityButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.quality === qualityKind)));
  }
  qualityButtons.forEach(button => button.addEventListener('click', () => { qualityKind = button.dataset.quality; renderQuality(); }));
  repeatFailure.addEventListener('change', renderQuality);
  resize(); syncMotionButton(); renderQuality();
})();
