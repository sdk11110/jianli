(() => {
  'use strict';
  const C = window.TravelContent;
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const art = name => `<span class="art art-${name}" aria-hidden="true"></span>`;
  const photoSlot = (p, extra = '') =>
    `<span class="travel-photo ${p.painted ? 'is-painted' : 'is-film'} ${extra}"><img src="${esc(p.src)}" alt="${esc(p.caption)}" loading="${extra.includes('dialog') ? 'eager' : 'lazy'}" decoding="async" /><span class="photo-error" role="status">照片暂时未能载入</span></span>`;
  document.addEventListener('error', event => {
    if (event.target.matches?.('.travel-photo img')) event.target.closest('.travel-photo').classList.add('is-unavailable');
  }, true);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  $('#narrative-root').innerHTML = `
  <a class="skip-link" href="#about">跳到旅途正文</a>
  <header class="site-header">
    <a class="brand" href="#hero" aria-label="云南手帐，回到首页"><span class="brand-mark">✿</span><span>云南手帐</span></a>
    <a class="text-link home-back" href="../#yunnan" style="margin-right:12px;font-size:.85rem;white-space:nowrap">← 总站</a>
    <button class="menu-toggle" aria-expanded="false" aria-controls="site-nav">目录 ☰</button>
    <nav id="site-nav" aria-label="旅行章节"><a href="#about">启程</a><a href="#banna">三城故事</a><a href="#desk">口袋里的回忆</a><a href="#gallery">照片展厅</a><a href="#faq">创作手记</a></nav>
    <button class="sound-switch" aria-pressed="false" aria-label="开启合成环境音"><span class="sound-bars"><i></i><i></i><i></i></span><span class="sound-label">声音关</span></button>
    <div class="reading-line" aria-hidden="true"></div>
  </header>
  <main>
    <section id="hero" class="hero" aria-labelledby="hero-title">
      <div class="hero-landscape" aria-hidden="true"></div>
      <div class="hero-mist" aria-hidden="true"></div>
      <div class="hero-copy">
        <h1 id="hero-title">云南手帐</h1>
        <p class="hero-route">西双版纳 · 普洱 · 大理</p>
        <p class="hero-line">三座城依次点亮，故事按站展开。</p>
        <a class="primary-button" href="#about">把故事翻开 <span>→</span></a>
        <p class="hero-note">把日子交给山和风。<br>剩下的，慢慢遇见。</p>
      </div>
      <div class="map-stage city-route" aria-label="行程站点：西双版纳、普洱、大理">
        <ol class="city-stops">
          ${C.chapters.map((c, i) => `
            <li class="city-stop-wrap" style="--i:${i}">
              <a class="city-stop" href="#${c.id}" data-city="${c.id}" style="--accent:${esc(c.accent)};--wash:${esc(c.wash)}">
                <span class="city-stop__glow" aria-hidden="true"></span>
                <span class="city-stop__art">${art(c.sticker)}</span>
                <span class="city-stop__meta">
                  <span class="city-stop__order">0${i + 1}</span>
                  <span class="city-stop__label">${esc(c.name)}</span>
                  <span class="city-stop__mood">${esc(c.mood)}</span>
                </span>
              </a>
            </li>`).join('')}
        </ol>
      </div>
      <span class="spark spark-one" aria-hidden="true">✦</span><span class="spark spark-two" aria-hidden="true">✦</span><span class="spark spark-three" aria-hidden="true">✦</span>
      <a class="scroll-cue" href="#about" aria-label="向下翻开故事">↓</a>
    </section>
    <section id="about" class="about wood-scene" aria-labelledby="about-title">
      <div class="section-wrap about-layout"><div class="record-scene" data-reveal="left"><button class="record-art" aria-label="播放或暂停合成环境音">${art('record')}</button><span class="hand-note">给旅途一点声音 ↗</span><span class="tiny-note">合成环境音 · 非实地录音</span></div><div class="about-copy" data-reveal="right"><p class="eyebrow">SIDE A / 故事的开头</p><h2 id="about-title">先把行李放下，<br>我们慢慢说。</h2>${C.about.letter.map(p=>`<p>${esc(p)}</p>`).join('')}<a class="text-link" href="#banna">沿着虚线，一起往南走 <span>→</span></a></div></div>
      <div class="belong section-wrap" data-reveal><p class="eyebrow">NO RUSH. JUST WANDER.</p><h2>不必赶路，<br>你已经在风景里。</h2><p>热风、茶汤、洱海边的晚风。<br>把这些小小的片刻，收进同一张唱片。</p></div>
      <div class="record-row" aria-label="旅途唱片章节">${C.chapters.map((c,i)=>`<a href="#${c.id}" class="vinyl-disc disc-${i}" aria-label="翻到${esc(c.name)}"><span>${esc(c.name)}<small>SIDE ${['A','B','C'][i]}</small></span></a>`).join('')}${C.chapters.map((c,i)=>`<span class="vinyl-disc vinyl-disc-copy disc-${i}" aria-hidden="true"><span>${esc(c.name)}<small>SIDE ${['A','B','C'][i]}</small></span></span>`).join('')}</div>
    </section>
    <section id="journey" class="journey" aria-label="三城故事">
      <div class="journey-sticky"><div class="section-wrap"><div class="chapter-top"><h2>三座城，三种生活。</h2><span id="chapter-count">01 / 03</span></div><div class="chapter-layout"><div class="postcards" id="postcards">${C.chapters.map((c,i)=>`<article class="postcard ${i===0?'active':''}" data-city="${c.id}" aria-hidden="${i!==0}"><div class="postcard-address"><p>POSTCARD<br>FROM YUNNAN</p><i></i><i></i><i></i><span class="stamp">${['热带来信','山间来信','湖边来信'][i]}<b>✦</b>YUNNAN</span></div><div class="postcard-copy"><p class="eyebrow">0${i+1} / ${esc(c.mood)}</p><h3>${esc(c.name)}</h3>${c.body.map(p=>`<p>${esc(p)}</p>`).join('')}<span class="postcard-sign">寄给：正在路上的你</span></div></article>`).join('')}</div><div class="chapter-camera"><div class="camera-eject-stage"><div class="camera-slot-mask"><div class="chapter-photo" id="chapter-photo"></div></div><div class="camera-body" aria-hidden="true">${art('camera')}</div></div><div class="camera-meta"><span class="hand-note">往下滑，照片会自己滑出来。</span><a class="camera-deep-link" href="#desk">去物件台，再取一张 ↗</a></div></div></div><div class="chapter-controls" aria-label="选择城市">${C.chapters.map((c,i)=>`<a href="#${c.id}">0${i+1} ${esc(c.name)}</a>`).join('<span>········</span>')}</div></div></div>
      <div class="chapter-triggers" aria-hidden="true"><div id="banna"></div><div id="puer"></div><div id="dali"></div></div>
    </section>
    <section id="tide-curtain" class="tide-curtain" aria-hidden="true">
      <div class="tide-curtain__pin">
        <div class="tide-curtain__blend tide-curtain__blend--top"></div>
        <svg class="tide-curtain__svg" viewBox="0 0 1440 900" preserveAspectRatio="none" id="tide-main-svg"></svg>
        <div class="tide-curtain__blend tide-curtain__blend--bottom"></div>
      </div>
    </section>
    <section id="desk" class="desk water-scene" aria-labelledby="desk-title">
      <div class="section-wrap" data-reveal><p class="eyebrow">SOME MOMENTS DESERVE TO STAY</p><h2 id="desk-title">把一瞬间，<br>变成能拿在手里的回忆。</h2><p>按下快门，等风景慢慢显影。翻过来，还有一句当时的心情。</p>
        <div class="camera-desk" data-state="idle">
          <div class="desk-camera-unit"><div class="desk-slot-mask"><div id="polaroid-stage" aria-busy="false"><div class="empty-photo"><span aria-hidden="true">✧</span><p>给回忆一点时间</p><small>一张风景，正在等你</small></div></div></div><button type="button" id="camera-eject" class="camera-eject" aria-label="按下快门，取出一张照片" aria-describedby="camera-status">${art('camera')}<span class="shutter-dot" aria-hidden="true"></span></button></div>
          <div class="camera-controls"><p class="camera-kicker">大理来信 / NEW MEMORIES</p><h3>有风，有山，<br>还有没舍得忘的光。</h3><div class="camera-contact-sheet" aria-hidden="true">${C.photos.filter(p=>p.city==='dali'&&p.painted).slice(0,3).map(p=>`<span><img src="${esc(p.src)}" alt="" loading="lazy" /></span>`).join('')}</div><p class="camera-film-label">先从大理的三帧风景，开始这一卷。</p><p id="film-count" class="film-counter"></p><button type="button" class="primary-button" id="eject-button" aria-describedby="camera-status">按下快门 <span aria-hidden="true">◎</span></button><p id="camera-status" role="status" aria-live="polite" aria-atomic="true"></p><div class="camera-secondary"><button type="button" class="text-link" id="camera-inspect" disabled>放大看看 ↗</button><button type="button" class="text-link" id="camera-clear" disabled>收起照片 ↺</button></div></div>
        </div>
      </div><div class="bubble bubble-a" aria-hidden="true"></div><div class="bubble bubble-b" aria-hidden="true"></div><div class="bubble bubble-c" aria-hidden="true"></div>
    </section>
    <section id="gallery" class="gallery water-scene" aria-labelledby="gallery-title"><div class="gallery-tide-overlay" aria-hidden="true"><svg id="tide-gallery-svg" viewBox="0 0 1440 520" preserveAspectRatio="none" width="100%" height="100%"></svg></div><div class="section-wrap" data-reveal><p class="eyebrow">THE MUSEUM OF LITTLE MOMENTS</p><h2 id="gallery-title">欢迎来到，<br>我们的旅途博物馆。</h2><p>没有宏大的展品。只有一些舍不得忘记的日常。</p><div class="gallery-filters" aria-label="筛选照片"><button data-filter="all" aria-pressed="true">全部底片</button><button data-filter="banna" aria-pressed="false">西双版纳</button><button data-filter="puer" aria-pressed="false">普洱</button><button data-filter="dali" aria-pressed="false">大理</button></div><div class="gallery-wall" id="gallery-wall"></div><p class="gallery-footnote">点击照片，走近一点。 <span id="gallery-count" aria-live="polite"></span></p></div></section>
    <section id="faq" class="faq wood-scene" aria-labelledby="faq-title"><div class="section-wrap" data-reveal><p class="eyebrow">NOTES FROM THIS JOURNAL / 创作手记</p><h2 id="faq-title">把旅途，<br>写成可以翻的记忆。</h2><div class="faq-list">${C.faq.map((f,i)=>`<details ${i===0?'open':''}><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('')}</div></div></section>
    <section id="outro" class="outro wood-scene" aria-labelledby="outro-title"><div class="letter-paper"><span class="postmark" aria-hidden="true">YUNNAN<br>一路有风</span><p class="eyebrow">TO THE NEXT WANDERER</p><h2 id="outro-title">写到这儿，风还在。</h2>${C.outro.letter.map(p=>`<p>${esc(p)}</p>`).join('')}<p class="letter-sign">${esc(C.outro.signOff)}</p><button class="text-link" id="keep-note">收下一句旅途暗号 <span>✦</span></button><p id="secret-note" aria-live="polite"></p></div><footer><a class="brand" href="#hero"><span class="brand-mark">✿</span>云南手帐</a><p>把虚线画成你自己的形状。</p><a href="#hero">再走一遍 ↑</a></footer></section>
  </main>
  <dialog id="photo-dialog" aria-label="旅途照片详情"><button class="dialog-close" aria-label="关闭照片">×</button><div id="dialog-content"></div><div class="dialog-controls"><button id="photo-prev" aria-label="上一张照片">←</button><span id="dialog-counter"></span><button id="photo-next" aria-label="下一张照片">→</button></div></dialog>`;

  let activeChapter = -1, previousStatic = null;
  const staticJourney=()=>reduced.matches || innerWidth<=700;
  function setChapter(index) {
    const isStatic=staticJourney();
    if (index === activeChapter && previousStatic===isStatic) {
      syncCityPins(index);
      return;
    }
    previousStatic=isStatic;
    activeChapter = index;
    $$('.postcard').forEach((card,i) => { card.classList.toggle('active',i===index); card.setAttribute('aria-hidden',String(!isStatic&&i!==index)); });
    $$('.chapter-controls a').forEach((a,i)=>{a.classList.toggle('active',i===index); if(i===index)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});
    $('#chapter-count').textContent=`0${index+1} / 03`;
    const c=C.chapters[index], p=C.photos.find(p=>p.id===c.photoIds[0]);
    $('#chapter-photo').innerHTML=`${photoSlot(p)}<span>${esc(p.caption)}</span>`;
    syncCityPins(index);
    document.body.dataset.chapter = c.id;
  }

  function syncCityPins(index) {
    const id = C.chapters[index]?.id;
    $$('.city-stop').forEach((stop, i) => {
      stop.classList.toggle('is-current', stop.dataset.city === id);
      stop.classList.toggle('is-lit', i <= index);
    });
  }
  const journey=$('#journey'), sticky=$('.journey-sticky');
  const curtain=$('#tide-curtain');
  const smoothstep=(a,b,x)=>{const t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t);};

  /* ——— HTN-style tide: cream foam rim (not pure white stroke) ——— */
  const n01 = (s) => {
    const x = Math.sin(s * 127.1 + 311.7) * 43758.5453;
    return x - Math.floor(x);
  };
  function crestLine(baseY, amp, seed, count = 36, width = 1440) {
    const pts = [];
    for (let i = 0; i <= count; i++) {
      const t = i / count;
      const x = t * width;
      const roll =
        Math.sin(t * Math.PI * 2.15 + seed) * amp +
        Math.sin(t * Math.PI * 4.6 + seed * 1.7) * amp * 0.38 +
        Math.sin(t * Math.PI * 9.2 + seed * 0.6) * amp * 0.12;
      /* torn-paper jags — irregular foam silhouette */
      const r = n01(seed * 17 + i * 2.3);
      const jag = r > 0.78 ? (r - 0.78) * amp * 2.8 : r < 0.12 ? -amp * 0.45 : 0;
      const crunch = (n01(seed + i * 5.1) - 0.5) * amp * 0.22;
      pts.push([x, baseY + roll + jag + crunch]);
    }
    return pts;
  }
  function curveThrough(pts) {
    if (!pts.length) return '';
    let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const [x0, y0] = pts[i];
      const [x1, y1] = pts[i + 1];
      const cx = ((x0 + x1) / 2).toFixed(1);
      d += ` C${cx},${y0.toFixed(1)} ${cx},${y1.toFixed(1)} ${x1.toFixed(1)},${y1.toFixed(1)}`;
    }
    return d;
  }
  function insetCrest(pts, dy, seed) {
    return pts.map(([x, y], i) => {
      const wobble = (n01(seed + i * 1.9) - 0.5) * dy * 0.35;
      return [x, y + dy + wobble];
    });
  }
  function closedWave(pts, bottomY, width = 1440) {
    return `${curveThrough(pts)} L${width},${bottomY} L0,${bottomY} Z`;
  }
  function foamRibbon(outerPts, innerPts) {
    const rev = innerPts.slice().reverse();
    let d = curveThrough(outerPts);
    rev.forEach(([x, y], i) => {
      if (i === 0) {
        d += ` L${x.toFixed(1)},${y.toFixed(1)}`;
        return;
      }
      const [x0, y0] = rev[i - 1];
      const cx = ((x0 + x) / 2).toFixed(1);
      d += ` C${cx},${y0.toFixed(1)} ${cx},${y.toFixed(1)} ${x.toFixed(1)},${y.toFixed(1)}`;
    });
    return `${d} Z`;
  }
  function buildTideLayers(svg, opts) {
    if (!svg) return null;
    const {
      width = 1440,
      height = 900,
      layers,
      phase = 0,
    } = opts;
    const uid = svg.id || `tide-${Math.random().toString(36).slice(2, 7)}`;
    const g = (name) => `${uid}-${name}`;
    const defs = `
      <defs>
        <linearGradient id="${g('wa')}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#a8e8e4" stop-opacity="0.4"/>
          <stop offset="55%" stop-color="#6fcfd2" stop-opacity="0.55"/>
          <stop offset="100%" stop-color="#4fb8bf" stop-opacity="0.68"/>
        </linearGradient>
        <linearGradient id="${g('wb')}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#bcefeb" stop-opacity="0.36"/>
          <stop offset="100%" stop-color="#7ad7d6" stop-opacity="0.58"/>
        </linearGradient>
        <linearGradient id="${g('wc')}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#cdf3ef" stop-opacity="0.32"/>
          <stop offset="100%" stop-color="#8ee0dc" stop-opacity="0.52"/>
        </linearGradient>
        <linearGradient id="${g('foam')}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#f4ebdc" stop-opacity="0.9"/>
          <stop offset="40%" stop-color="#ebe0cd" stop-opacity="0.72"/>
          <stop offset="100%" stop-color="#d5e8e1" stop-opacity="0.18"/>
        </linearGradient>
        <linearGradient id="${g('mist')}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#efe4d4" stop-opacity="0.48"/>
          <stop offset="100%" stop-color="#cfe8e2" stop-opacity="0"/>
        </linearGradient>
        <filter id="${g('ff')}" x="-3%" y="-10%" width="106%" height="125%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="1.25"/>
        </filter>
        <filter id="${g('wf')}" x="-2%" y="-5%" width="104%" height="112%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="0.65"/>
        </filter>
      </defs>`;
    const waterFills = [`url(#${g('wa')})`, `url(#${g('wb')})`, `url(#${g('wc')})`];
    let body = '';
    layers.forEach((layer, idx) => {
      const crest = crestLine(
        layer.y + Math.sin(phase + idx) * 6,
        layer.amp,
        layer.seed + phase * 0.15,
        layer.count || 34,
        width
      );
      const foamInner = insetCrest(crest, layer.foam, layer.seed + 9);
      const waterCrest = insetCrest(crest, layer.foam * 0.72, layer.seed + 3);
      const mistInner = insetCrest(crest, layer.foam * 2.05, layer.seed + 11);
      body += `<path class="tide-foam-soft" data-layer="${idx}" filter="url(#${g('ff')})" fill="url(#${g('mist')})" d="${foamRibbon(crest, mistInner)}"/>`;
      body += `<path class="tide-foam-band" data-layer="${idx}" fill="url(#${g('foam')})" d="${foamRibbon(crest, foamInner)}"/>`;
      body += `<path class="tide-water" data-layer="${idx}" filter="url(#${g('wf')})" fill="${waterFills[idx % 3]}" d="${closedWave(waterCrest, height, width)}"/>`;
    });
    svg.innerHTML = defs + body;
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    return true;
  }

  const mainTideSpec = {
    width: 1440,
    height: 900,
    layers: [
      { y: 210, amp: 48, foam: 22, seed: 2.1, count: 40 },
      { y: 330, amp: 56, foam: 26, seed: 5.4, count: 38 },
      { y: 455, amp: 42, foam: 20, seed: 8.8, count: 42 },
    ],
  };
  const galleryTideSpec = {
    width: 1440,
    height: 520,
    layers: [
      { y: 70, amp: 36, foam: 18, seed: 3.2, count: 36 },
      { y: 175, amp: 40, foam: 20, seed: 6.6, count: 34 },
    ],
  };
  buildTideLayers($('#tide-main-svg'), { ...mainTideSpec, phase: 0 });
  buildTideLayers($('#tide-gallery-svg'), { ...galleryTideSpec, phase: 1.2 });

  /* Soft decorative seams disabled — CSS feathers handle handoffs */
  const tideSpecs = [];
  const tideNodes = [];
  let tidePaintAt = -1;
  function paintOrganicTides(scrollYVal, force = false) {
    const bucket = Math.floor(scrollYVal / 48);
    if (!force && bucket === tidePaintAt) return;
    tidePaintAt = bucket;
    const phase = scrollYVal * 0.0035;
    if (!reduced.matches) {
      buildTideLayers($('#tide-main-svg'), { ...mainTideSpec, phase });
      buildTideLayers($('#tide-gallery-svg'), { ...galleryTideSpec, phase: phase + 1.1 });
    }
  }

  let scheduled=false;
  const rootStyle = document.documentElement.style;
  const cue = $('.scroll-cue');
  const camHint = $('.chapter-camera');
  const recordRow = $('.record-row');
  const sectionNav = [
    { id: 'about', hash: '#about' },
    { id: 'journey', hash: '#banna' },
    { id: 'desk', hash: '#desk' },
    { id: 'gallery', hash: '#gallery' },
    { id: 'faq', hash: '#faq' },
  ];

  function updateNavCurrent(y) {
    let current = '#about';
    for (const s of sectionNav) {
      const el = document.getElementById(s.id);
      if (!el) continue;
      if (el.getBoundingClientRect().top <= innerHeight * 0.35) current = s.hash;
    }
    $$('#site-nav a').forEach((a) => {
      if (a.getAttribute('href') === current) a.setAttribute('aria-current', 'location');
      else a.removeAttribute('aria-current');
    });
  }

  function updateScroll() {
    scheduled=false;
    const rect=journey.getBoundingClientRect();
    const distance=Math.max(1,journey.offsetHeight-sticky.offsetHeight);
    const progress=Math.min(1,Math.max(0,-rect.top/distance));
    const chapterIndex=window.JourneyState.chapterAt(progress);
    setChapter(chapterIndex);

    const local=Math.min(1,Math.max(0,progress*3-chapterIndex));
    const eject=(reduced.matches || staticJourney()) ? 1 : smoothstep(0.04, 0.7, local);
    rootStyle.setProperty('--camera-eject', eject.toFixed(4));
    rootStyle.setProperty('--chapter-local', local.toFixed(4));
    if (camHint) camHint.dataset.ejectHint = eject > 0.55 ? 'out' : 'in';

    if (curtain) {
      const cRect=curtain.getBoundingClientRect();
      const cDist=Math.max(1,curtain.offsetHeight-innerHeight);
      const tideP=Math.min(1,Math.max(0,-cRect.top/cDist));
      rootStyle.setProperty('--tide-progress', tideP.toFixed(4));
    }

    $('.site-header').classList.toggle('scrolled',scrollY>60);
    const y=scrollY;
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    const pageP = Math.min(1, y / maxScroll);
    rootStyle.setProperty('--page-progress', pageP.toFixed(4));

    const heroOut = Math.min(1, Math.max(0, y / (innerHeight * 0.72)));
    rootStyle.setProperty('--hero-out', heroOut.toFixed(4));
    if (cue) cue.classList.toggle('is-gone', heroOut > 0.55);

    if (!reduced.matches && y<innerHeight*1.4) {
      const landscape=$('.hero-landscape');
      const mist=$('.hero-mist');
      const stage=$('.map-stage');
      if(landscape) landscape.style.transform=`translate3d(0,${y*.12}px,0) scale(1.04)`;
      if(mist) mist.style.transform=`translate3d(0,${y*.2}px,0)`;
      if(stage) stage.style.transform=`translate3d(0,${y*-0.045}px,0)`;
    }

    if (recordRow && !reduced.matches) {
      recordRow.style.setProperty('--row-shift', `${((pageP - 0.15) * -80).toFixed(1)}px`);
    }

    rootStyle.setProperty('--scroll-y', String(y));
    updateNavCurrent(y);
    paintOrganicTides(y);

    /* Catch reveals skipped by jump/fast scroll */
    $$('[data-reveal]:not(.is-in)').forEach((el) => {
      if (el.getBoundingClientRect().top < innerHeight * 0.88) el.classList.add('is-in');
    });
    const wall = $('#gallery-wall');
    if (wall && !wall.classList.contains('is-in') && wall.getBoundingClientRect().top < innerHeight * 0.9) {
      wall.classList.add('is-in');
    }
  }
  addEventListener('scroll',()=>{if(!scheduled){scheduled=true;requestAnimationFrame(updateScroll);}}, {passive:true});
  addEventListener('resize',updateScroll);
  updateScroll();

  /* Section / gallery enter reveals — also catch elements already past viewport */
  function markRevealIn(el) {
    if (!el || el.classList.contains('is-in')) return;
    el.classList.add('is-in');
  }
  function alreadySeen(el) {
    const top = el.getBoundingClientRect().top;
    return top < innerHeight * 0.88;
  }

  if (!reduced.matches && 'IntersectionObserver' in window) {
    const revealObs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          markRevealIn(entry.target);
          revealObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

    $$('[data-reveal]').forEach((el, i) => {
      el.style.setProperty('--reveal-delay', `${Math.min(i * 60, 240)}ms`);
      if (alreadySeen(el)) markRevealIn(el);
      else revealObs.observe(el);
    });

    const galleryWall = $('#gallery-wall');
    if (galleryWall) {
      const wallObs = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            markRevealIn(entry.target);
            wallObs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });
      if (alreadySeen(galleryWall)) markRevealIn(galleryWall);
      else wallObs.observe(galleryWall);
    }
  } else {
    $$('[data-reveal]').forEach((el) => markRevealIn(el));
    markRevealIn($('#gallery-wall'));
  }

  let scrollAnim = 0;
  function silkScrollTo(top, behavior = 'smooth') {
    const dest = Math.max(0, top);
    if (reduced.matches || behavior === 'instant') {
      scrollTo(0, dest);
      return;
    }
    cancelAnimationFrame(scrollAnim);
    const start = scrollY;
    const dist = dest - start;
    if (Math.abs(dist) < 2) return;
    const duration = Math.min(1250, Math.max(520, Math.abs(dist) * 0.48));
    const t0 = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - t0) / duration);
      /* easeOutQuint — slower settle, silkier land */
      const e = 1 - Math.pow(1 - t, 5);
      scrollTo(0, start + dist * e);
      if (t < 1) scrollAnim = requestAnimationFrame(tick);
    };
    scrollAnim = requestAnimationFrame(tick);
  }
  function goToHash(hash, behavior='smooth') {
    const target=$(hash);if(!target)return;
    const i=C.chapters.findIndex(c=>`#${c.id}`===hash);
    const top=i>=0 ? (staticJourney() ? $$('.postcard')[i].getBoundingClientRect().top+scrollY-90 : journey.getBoundingClientRect().top+scrollY+(journey.offsetHeight-sticky.offsetHeight)*((i+.08)/3)) : target.getBoundingClientRect().top+scrollY-64;
    silkScrollTo(top, reduced.matches ? 'instant' : behavior);
  }
  $$('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{
    const hash=a.getAttribute('href');if(!$(hash))return;e.preventDefault();
    history.pushState(null,'',hash);goToHash(hash);$('.menu-toggle').setAttribute('aria-expanded','false');$('#site-nav').classList.remove('open');
  }));
  addEventListener('popstate',()=>goToHash(location.hash||'#hero','instant'));
  $('.menu-toggle').addEventListener('click',()=>{const open=$('.menu-toggle').getAttribute('aria-expanded')!=='true';$('.menu-toggle').setAttribute('aria-expanded',String(open));$('#site-nav').classList.toggle('open',open);});
  addEventListener('keydown',e=>{if(e.key==='Escape'){$('#site-nav').classList.remove('open');$('.menu-toggle').setAttribute('aria-expanded','false');}});
  if(location.hash && $(location.hash)) requestAnimationFrame(()=>goToHash(location.hash,'instant'));

  let filtered=C.photos, dialogPhotos=C.photos, dialogIndex=0;
  const dialog=$('#photo-dialog');
  const HALL = {
    banna: { label: '热风厅 · 西双版纳', theme: 'banna' },
    puer: { label: '茶山厅 · 普洱', theme: 'puer' },
    dali: { label: '洱海厅 · 大理', theme: 'dali' },
    gallery: { label: '拼贴厅 · 旅途碎片', theme: 'gallery' },
  };
  let exhibitAbort = null;

  function inkDevelop(surface, signal, duration = 1320) {
    if (!surface) return Promise.resolve();
    surface.classList.add('is-ink-plate', 'is-ink-live');
    surface.classList.remove('is-ink-done');
    surface.style.setProperty('--ink', '0');
    if (reduced.matches) {
      surface.style.setProperty('--ink', '1');
      surface.classList.add('is-ink-done');
      return Promise.resolve();
    }
    const start = performance.now();
    return new Promise((resolve, reject) => {
      let frame = 0;
      const cancel = () => {
        cancelAnimationFrame(frame);
        reject(new DOMException('Aborted', 'AbortError'));
      };
      if (signal) signal.addEventListener('abort', cancel, { once: true });
      const tick = (now) => {
        if (signal?.aborted) return;
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        surface.style.setProperty('--ink', String(eased));
        if (t < 1) frame = requestAnimationFrame(tick);
        else {
          if (signal) signal.removeEventListener('abort', cancel);
          surface.classList.add('is-ink-done');
          resolve();
        }
      };
      frame = requestAnimationFrame(tick);
    }).catch((err) => {
      if (err?.name !== 'AbortError') throw err;
    });
  }

  function developWallInk(wall) {
    if (!wall || wall.dataset.inkDone === '1') return;
    wall.dataset.inkDone = '1';
    const plates = $$('.travel-photo', wall);
    plates.forEach((plate, i) => {
      plate.classList.add('is-ink-plate');
      plate.style.setProperty('--ink', '0');
      const delay = Math.min(i * 70, 520);
      setTimeout(() => {
        if (!wall.classList.contains('is-in')) return;
        inkDevelop(plate, null, 1100 + (i % 3) * 120);
      }, delay);
    });
  }

  function openExhibit(index) {
    dialogIndex = (index + dialogPhotos.length) % dialogPhotos.length;
    const p = dialogPhotos[dialogIndex];
    const hall = HALL[p.city] || HALL.gallery;
    exhibitAbort?.abort();
    exhibitAbort = new AbortController();
    dialog.classList.add('exhibit-open');
    dialog.dataset.theme = hall.theme;
    $('#dialog-content').innerHTML = `<div class="exhibit-shell"><div class="exhibit-frame">${photoSlot(p, 'photo-slot--dialog is-ink-plate')}</div><div class="exhibit-copy"><p class="exhibit-hall">${esc(hall.label)}</p><h3>${esc(p.caption)}</h3><p>${esc(p.note)}</p><a class="photo-download text-link" href="${esc(p.original || p.src)}" download>保存这张风景 ↓</a></div></div>`;
    $('#dialog-counter').textContent = `${dialogIndex + 1} / ${dialogPhotos.length}`;
    const plate = $('#dialog-content .travel-photo');
    requestAnimationFrame(() => inkDevelop(plate, exhibitAbort.signal, 1480));
  }

  function showPhoto(index) {
    openExhibit(index);
  }

  function renderGallery(city = 'all') {
    filtered = window.JourneyState.filterPhotos(C.photos, city);
    const wall = $('#gallery-wall');
    wall.dataset.inkDone = '0';
    wall.innerHTML = filtered.map((p, i) => {
      const tilt = ((i % 5) - 2) * 1.05;
      return `<button class="gallery-photo" data-index="${i}" data-city="${esc(p.city || 'gallery')}" style="--i:${i};--tilt:${tilt}deg" aria-label="查看照片：${esc(p.caption)}"><span class="photo-tape" aria-hidden="true"></span>${photoSlot(p, 'is-ink-plate')}<span>${esc(p.caption)}</span><small>YUNNAN / ${String(C.photos.indexOf(p) + 1).padStart(2, '0')}</small></button>`;
    }).join('');
    $$('.gallery-photo .travel-photo', wall).forEach((plate) => {
      plate.style.setProperty('--ink', '0');
    });
    wall.classList.remove('is-in');
    const galleryRoot = $('#gallery');
    if (galleryRoot) {
      galleryRoot.style.setProperty(
        '--exhibit-accent',
        city === 'banna' ? '#c45c28' : city === 'puer' ? '#5c6b2a' : city === 'dali' ? '#2a6f7a' : '#5c3a28'
      );
    }
    if (reduced.matches) {
      wall.classList.add('is-in');
      $$('.travel-photo', wall).forEach((plate) => {
        plate.style.setProperty('--ink', '1');
        plate.classList.add('is-ink-done');
      });
      wall.dataset.inkDone = '1';
    } else {
      requestAnimationFrame(() => {
        const r = wall.getBoundingClientRect();
        if (r.top < innerHeight * 0.9) {
          wall.classList.add('is-in');
          developWallInk(wall);
        }
      });
    }
    $('#gallery-count').textContent = `${filtered.length} 张底片`;
  }

  /* When wall first enters, run ink wash */
  const wallInkObs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in');
      developWallInk(entry.target);
    });
  }, { threshold: 0.18 });
  wallInkObs.observe($('#gallery-wall'));

  renderGallery();
  $('.gallery-filters').addEventListener('click', (e) => {
    const b = e.target.closest('[data-filter]');
    if (!b) return;
    $$('[data-filter]').forEach((el) => el.setAttribute('aria-pressed', String(el === b)));
    renderGallery(b.dataset.filter);
  });
  $('#gallery-wall').addEventListener('click', (e) => {
    const b = e.target.closest('[data-index]');
    if (!b) return;
    dialogPhotos = filtered;
    showPhoto(Number(b.dataset.index));
    dialog.showModal();
    document.body.classList.add('dialog-open');
  });
  $('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) {
      const r = dialog.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.close();
    }
  });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('dialog-open');
    dialog.classList.remove('exhibit-open');
    exhibitAbort?.abort();
    exhibitAbort = null;
  });
  $('#photo-prev').addEventListener('click', () => showPhoto(dialogIndex - 1));
  $('#photo-next').addEventListener('click', () => showPhoto(dialogIndex + 1));
  dialog.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); showPhoto(dialogIndex - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); showPhoto(dialogIndex + 1); }
  });
  window.TravelCamera = window.initInstantCamera({ photos: C.photos, photoMarkup: photoSlot, escapeHtml: esc, openPhoto(id) {
    dialogPhotos = C.photos;
    showPhoto(dialogPhotos.findIndex((p) => p.id === id));
    dialog.showModal();
    document.body.classList.add('dialog-open');
  }});
  const secrets=['路上总有风，记得慢一点。','下一站，不必提前知道。','把虚线画成你自己的形状。'];let secret=0;
  $('#keep-note').addEventListener('click',()=>{$('#secret-note').textContent=secrets[secret++%secrets.length];});

  /* Irregular sea-wave lips instead of hard rectangular fades */
  const wavePath =
    'M0,58 C55,22 110,86 175,40 C235,6 285,90 350,48 C410,14 460,84 525,42 C590,8 640,88 705,46 C770,12 825,82 890,44 C955,10 1010,86 1075,48 C1140,16 1200,78 1265,42 C1325,18 1380,68 1440,36 L1440,100 L0,100 Z';
  function attachWave(sectionSel, fill) {
    const section = $(sectionSel);
    if (!section || section.querySelector(':scope > .wave-edge')) return;
    const edge = document.createElement('div');
    edge.className = 'wave-edge wave-edge--top';
    edge.setAttribute('aria-hidden', 'true');
    edge.innerHTML = `<svg viewBox="0 0 1440 100" preserveAspectRatio="none"><path fill="${fill}" d="${wavePath}"/></svg>`;
    section.prepend(edge);
  }
  attachWave('#about', '#d7a164');
  attachWave('#journey', '#8fa527');
  attachWave('#tide-curtain', '#a1eddf');
  attachWave('#desk', '#a1eddf');
  attachWave('#gallery', '#e5d6a8');
  attachWave('#faq', '#d6bc8b');

  /* City stops: light up sticker nodes in journey order */
  function lightCityPins() {
    const stops = $$('.city-stop');
    if (!stops.length) return;
    if (reduced.matches) {
      stops.forEach((stop) => stop.classList.add('is-lit'));
      return;
    }
    stops.forEach((stop, i) => {
      window.setTimeout(() => stop.classList.add('is-lit'), 320 + i * 560);
    });
  }
  requestAnimationFrame(lightCityPins);

  // Deliberately labelled synthetic ambience; never pretend a missing track is playing.
  let audioContext=null, playing=false;
  async function toggleSound(){
    try{
      if(!audioContext){
        const AudioCtx=window.AudioContext||window.webkitAudioContext;if(!AudioCtx)throw new Error('unsupported');
        audioContext=new AudioCtx();
        const buffer=audioContext.createBuffer(1,audioContext.sampleRate*4,audioContext.sampleRate), data=buffer.getChannelData(0);let last=0;
        for(let i=0;i<data.length;i++){last=(last+Math.random()*.04-.02)/1.02;data[i]=last*3;}
        const noise=audioContext.createBufferSource();noise.buffer=buffer;noise.loop=true;
        const filter=audioContext.createBiquadFilter();filter.type='lowpass';filter.frequency.value=520;
        const gain=audioContext.createGain();gain.gain.value=.18;noise.connect(filter).connect(gain).connect(audioContext.destination);noise.start();
        [174.61,220,261.63].forEach(f=>{const osc=audioContext.createOscillator(),g=audioContext.createGain();osc.frequency.value=f;osc.type='sine';g.gain.value=.009;osc.connect(g).connect(audioContext.destination);osc.start();});
      }
      if(playing){await audioContext.suspend();playing=false;}else{await audioContext.resume();playing=true;}
      $('.sound-switch').setAttribute('aria-pressed',String(playing));$('.sound-switch').setAttribute('aria-label',playing?'关闭合成环境音':'开启合成环境音');$('.sound-label').textContent=playing?'声音开':'声音关';document.body.classList.toggle('sound-on',playing);
    }catch{$('.sound-label').textContent='声音不可用';}
  }
  $('.sound-switch').addEventListener('click',toggleSound);$('.record-art')?.addEventListener('click',toggleSound);
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&playing)toggleSound();});
})();
