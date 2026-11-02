(() => {
  'use strict';
  const C = window.TravelContent;
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const arrow = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6"/></svg>';
  const icon = name => `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">${{
    compare:'<path d="M3 12h18M7 8l-4 4 4 4m10-8 4 4-4 4"/>',
    expand:'<path d="M14 4h6v6M4 14v6h6M20 4l-6 6M4 20l6-6"/>',
    reset:'<path d="M5 8a8 8 0 1 1-1 7M4 3v6h6"/>',
    close:'<path d="m6 6 12 12M6 18 18 6"/>',
    plus:'<path d="M5 12h14M12 5v14"/>',
    download:'<path d="M12 3v12m-5-5 5 5 5-5M5 17v4h14v-4"/>'
  }[name]}</svg>`;
  const mark = '<svg viewBox="0 0 40 40" fill="none" aria-hidden="true"><path d="m5 28 11-17 7 12 5-8 7 13M7 33h27M25 7l1-3m6 7 3-1"/></svg>';
  const art = name => `<span class="art art-${name}" aria-hidden="true"></span>`;
  const photoById = id => C.photos.find(p => p.id === id);
  const photoMarkup = (p, extra = '') => `<span class="travel-photo ${p.painted ? 'is-painted' : 'is-film'} ${extra}"><img src="${esc(p.src)}" alt="${esc(p.caption)}" loading="${extra.includes('dialog') ? 'eager' : 'lazy'}" decoding="async"><span class="photo-error" role="status">照片暂时没装好，请刷新重试。</span></span>`;
  const cities = [
    { id:'banna', name:'西双版纳', word:'先把快乐，吃进肚子里。', note:'热风、金顶、甜得刚刚好的椰子。\n快乐这件事，到了版纳就变得很具体。', aside:'这一站：把心情晒热一点', photo:'photo-07', color:'#d4b450' },
    { id:'puer', name:'普洱', word:'牛先走，饭慢慢吃。', note:'山路把车让给牛，树荫把人留住。\n热乎的一桌菜，让今天不必再赶下一站。', aside:'这一站：把日程撕掉半页', photo:'photo-04', color:'#bbcc80' },
    { id:'dali', name:'大理', word:'等一阵风，也等一场日落。', note:'水杉站在水里，彩虹从云缝里漏下来。\n我们没说什么，只是把这一刻看得久一点。', aside:'这一站：把晚风装进口袋', photo:'dali-sunset', color:'#a4dbdb' }
  ];
  const compareIds = ['dali-rainbow','puer-tree','puer-feast'];
  $('#narrative-root').innerHTML = `
    <a class="skip-link" href="#about">跳到正文</a>
    <header class="site-header"><a class="brand" href="#hero">${mark}<span>云南手帐</span></a><nav id="site-nav" aria-label="手帐目录"><a href="#about">关于这趟</a><a href="#journey">三城来信</a><a href="#memory">记忆工坊</a><a href="#desk">口袋相机</a><a href="#gallery">我的底片</a><a href="#faq">出发前</a></nav><button class="sound-switch" aria-pressed="false" aria-label="开启合成环境音"><span class="sound-bars" aria-hidden="true"><i></i><i></i><i></i></span><span class="sound-label">声音关</span></button><button class="menu-toggle" aria-expanded="false" aria-controls="site-nav" aria-label="展开目录"><span></span><span></span></button><div class="reading-line" aria-hidden="true"></div></header>
    <main>
      <section id="hero" class="hero hero--studio" aria-labelledby="hero-title">
        <div id="desk-studio" class="desk-studio" role="img" aria-label="桌面工坊：显影暗房、手帐印坊、洱海邮局三站流水线"></div>
        <div class="studio-chrome">
          <div class="studio-brand">
            <p class="pill">${esc(C.site.tagline || C.site.subtitle)}</p>
            <h1 id="hero-title">云南，慢慢来。</h1>
            <a class="studio-cta" href="#about">翻开手帐 ${arrow}</a>
          </div>
          <p class="studio-hover" id="studio-hover" aria-hidden="true"></p>
          <aside class="studio-progress" id="studio-progress" aria-live="polite">
            <strong>念头进度</strong>
            <span id="studio-progress-text">工作室正在热机…</span>
            <div class="bar" aria-hidden="true"><i id="studio-progress-bar"></i></div>
          </aside>
          <p class="studio-hint" id="studio-hint">拖拽环视 · 滚轮缩放 · 点「投一个念头」 · 扳药水阀 / 道岔 / 路牌改去向</p>
          <button type="button" class="studio-back" id="studio-back">返回总览</button>
          <div class="studio-work" id="studio-work" role="status">
            <strong>作品履历</strong>
            <p id="studio-work-text"></p>
            <button type="button" id="studio-work-close">收起</button>
          </div>
        </div>
        <div class="studio-modal" id="studio-modal" aria-hidden="true">
          <div class="studio-modal__card" role="dialog" aria-labelledby="studio-modal-title">
            <h2 id="studio-modal-title">投一个念头</h2>
            <p>最多 20 个字。小人会把它送进暗房 → 印坊 → 邮局。</p>
            <input id="studio-thought-input" type="text" maxlength="20" placeholder="例如：一段晚霞" autocomplete="off">
            <div class="studio-presets" id="studio-presets">
              <button type="button" data-preset="一个故事">一个故事</button>
              <button type="button" data-preset="一幅画">一幅画</button>
              <button type="button" data-preset="一个奇怪的问题">一个奇怪的问题</button>
            </div>
            <div class="studio-modal__actions">
              <button type="button" class="ghost" id="studio-modal-cancel">取消</button>
              <button type="button" class="primary" id="studio-modal-ok">投进去</button>
            </div>
          </div>
        </div>
        <p class="studio-toast" id="studio-toast" role="status"></p>
      </section>
      <section id="about" class="about about--water" aria-labelledby="about-title"><div class="section-wrap about-layout"><div class="about-copy"><h2 id="about-title">这本手帐<br>在做什么。</h2>${C.about.letter.map(p=>`<p>${esc(p)}</p>`).join('')}<p class="handwritten about-sign">认真吃饭，放心走神。<br>偶尔，把生活做成作品。</p><a class="text-link" href="#memory">看看，我怎样收藏这些瞬间 ${arrow}</a></div><div class="record-corner"><div class="record-scene"></div><p class="record-caption">有些心情，适合放在唱片里。</p></div></div></section>
      <section id="journey" class="journey" aria-label="三城来信"><div class="journey-sticky"><div class="section-wrap"><div class="journey-heading"><h2>三座城，<br>三种喜欢的日常。</h2><p>往下走，一封一封地读。<br><span>明信片要去口袋相机显影；这里先读信。</span></p></div><div class="city-tabs" role="tablist" aria-label="城市来信">${cities.map((c,i)=>`<button role="tab" id="tab-${c.id}" data-city-tab="${c.id}" aria-selected="${i===0}" aria-controls="city-panel" tabindex="${i===0?0:-1}"><small>0${i+1}</small>${c.name}<span>${arrow}</span></button>`).join('')}</div><div class="city-stage" id="city-panel" role="tabpanel" aria-labelledby="tab-banna"><button type="button" class="city-image is-sealed" id="city-photo-btn" aria-label="去口袋相机显影这站风景"><img id="city-photo" src="${photoById(cities[0].photo).src}" alt="${photoById(cities[0].photo).caption}"><span class="city-image-note" id="city-aside"></span></button><article class="city-letter"><span class="city-postmark" aria-hidden="true">一路<br>有风</span><p class="city-address">寄自 / <span id="city-title">西双版纳</span></p><h3 id="city-word"></h3><p id="city-note"></p><p class="city-letter-end">寄给：正在路上的你</p><div class="city-pagination"><button id="city-prev" aria-label="上一座城市">${arrow}</button><span id="city-count">01 / 03</span><button id="city-next" aria-label="下一座城市">${arrow}</button></div></article></div></div></div><span id="banna" class="city-anchor"></span><span id="puer" class="city-anchor"></span><span id="dali" class="city-anchor"></span></section>
      <section id="memory" class="memory" aria-labelledby="memory-title"><div class="section-wrap memory-layout"><div class="memory-copy"><h2 id="memory-title">眼睛看见的，<br>心里留下的。</h2><p>相机记得光线，<br>我更想记得当时的心情。</p><p>于是，让真实的照片长出笔触。<br>向左右滑动，看看记忆如何变了颜色。</p><div class="memory-choices" aria-label="选择一段记忆">${compareIds.map((id,i)=>`<button data-compare="${id}" aria-pressed="${i===0}" aria-label="对照：${esc(photoById(id).caption)}"><img src="${esc(photoById(id).src)}" alt=""><span>${['水边彩虹','树下走神','好好吃饭'][i]}</span></button>`).join('')}</div><p class="memory-footnote">我的实拍 × AI 手绘<br><span>同一段生活，两种收藏方式。</span></p></div><div class="memory-work"><div class="memory-board" id="memory-board" data-photo="dali-rainbow" style="--reveal:50%"><img id="memory-real" src="assets/photos/source/dali-rainbow.webp" alt="大理彩虹的原始实拍"><img id="memory-painted" class="memory-painted" src="assets/photos/painted/dali-rainbow.webp" alt="同一场景的 AI 手绘"><span class="compare-tag compare-tag--left">我记住的</span><span class="compare-tag compare-tag--right">我拍下的</span><div class="compare-divider" aria-hidden="true"><span>${icon('compare')}</span></div><input type="range" id="memory-range" min="0" max="100" value="50" aria-label="手绘记忆显示比例" aria-valuetext="手绘记忆 50%"><span id="memory-error" role="status"></span></div><div class="memory-bottom"><button class="text-link" data-reveal="0">看实拍</button><span id="memory-caption">彩虹落在水杉之间</span><button class="text-link" data-reveal="100">看手绘</button></div><p class="memory-tip">拖动中间的线，来回看看。</p></div></div></section>
      <section id="desk" class="desk water-scene" aria-labelledby="desk-title"><div class="section-wrap"><h2 id="desk-title">有些瞬间，<br>想拿在手里再看一遍。</h2><p class="section-intro">明信片不提前摆出来。按下快门，等它滑出相机，再看水墨一点一点洇开。</p><div class="camera-desk" data-state="idle"><div class="desk-camera-unit"><div class="desk-slot-mask"><div id="polaroid-stage" aria-busy="false"><div class="empty-photo"><span aria-hidden="true">${mark}</span><p>给回忆一点时间</p><small>按下快门，明信片才会出现</small></div></div></div><button type="button" id="camera-eject" class="camera-eject" aria-label="按下快门，取出一张照片" aria-describedby="camera-status">${art('camera')}</button></div><div class="camera-controls"><h3>今天，<br>会翻到哪一阵风？</h3><div class="camera-contact-sheet" aria-hidden="true"><span class="contact-blank"></span><span class="contact-blank"></span><span class="contact-blank"></span></div><p class="camera-film-label">底片还是空白的。显影后的明信片，会收进下面的底片墙。</p><p id="film-count" class="film-counter"></p><button class="primary-button" id="eject-button" aria-describedby="camera-status">按下快门 ${arrow}</button><p id="camera-status" role="status" aria-live="polite" aria-atomic="true"></p><div class="camera-secondary"><button class="text-link" id="camera-inspect" disabled>放大看看 ${icon('expand')}</button><button class="text-link" id="camera-clear" disabled>收起照片 ${icon('reset')}</button></div></div></div></div></section>
      <section id="gallery" class="gallery" aria-labelledby="gallery-title"><div class="section-wrap"><div class="gallery-heading"><div><h2 id="gallery-title">都是小事。<br>但我都记得。</h2></div><p>这里只收藏你亲手显影过的明信片。<br>还没拍过的，先去口袋相机。</p></div><div class="gallery-filters" aria-label="筛选照片"><button data-filter="all" aria-pressed="true">已显影</button>${cities.map(c=>`<button data-filter="${c.id}" aria-pressed="false">${c.name}</button>`).join('')}<span id="gallery-count" aria-live="polite"></span></div><div class="gallery-wall" id="gallery-wall"></div><p class="gallery-footnote">轻点一张，走近一点。</p></div></section>
      <section id="faq" class="faq" aria-labelledby="faq-title"><div class="section-wrap faq-layout"><div><h2 id="faq-title">如果你也<br>想出发。</h2><p>先弄清这本手帐是什么，<br>再带走一点慢下来的经验。</p></div><div class="faq-list">${C.faq.map((f,i)=>`<details ${i===0?'open':''}><summary>${esc(f.q)}<span aria-hidden="true">${icon('plus')}</span></summary><div><p>${esc(f.a)}</p></div></details>`).join('')}</div></div></section>
      <section id="outro" class="outro" aria-labelledby="outro-title"><div class="section-wrap outro-layout"><div class="outro-portrait"><img src="assets/photos/painted/puer-lunch.webp" alt="普洱的一顿家常饭" loading="lazy"><span>生活不用每一页都精彩，<br>但每一页，都要是自己的。</span></div><div class="letter-paper"><span class="letter-fold" aria-hidden="true"></span><h2 id="outro-title">故事写到这里，<br>日子还很长。</h2><p>云南带回来的，不只是照片。<br>还有“慢一点也没关系”的底气。</p><p>下一次，去哪里都好。<br>记得好好吃饭，抬头看看树，<br>也给自己留一点发呆的时间。</p><p class="handwritten letter-sign">—— 一个把生活做成作品的人</p><button id="stamp-letter" class="text-link">给这段旅途，盖个章 ${arrow}</button><span id="letter-stamp" aria-hidden="true">好好<br>生活<span>一路有风 · YUNNAN</span></span><p id="stamp-status" role="status"></p></div></div><footer class="section-wrap"><a class="brand" href="#hero">${mark}云南手帐</a><p>${esc(C.site.tagline || '真实旅行 · AI 手绘 · 一点点奇思妙想')}</p><a class="text-link" href="#hero">再走一遍 ${arrow}</a></footer></section>
    </main>
    <dialog id="photo-dialog" aria-label="旅途照片详情"><button class="dialog-close" aria-label="关闭照片">${icon('close')}</button><div id="dialog-content"></div><div class="dialog-controls"><button id="photo-prev" aria-label="上一张照片">${arrow}</button><span id="dialog-counter"></span><button id="photo-next" aria-label="下一张照片">${arrow}</button></div></dialog>`;

  document.addEventListener('error', event => { if (event.target.matches?.('.travel-photo img')) event.target.closest('.travel-photo').classList.add('is-unavailable'); }, true);
  function motion(node, frames, options = {}) {
    if (reduced.matches) return;
    node.getAnimations().forEach(a => a.cancel());
    return node.animate(frames, { duration:420, easing:'cubic-bezier(.22,1,.36,1)', ...options });
  }

  // Browser scrolling stays native. Only explicit links use a cancellable journey.
  let scrollFrame = 0;
  function cancelScroll() { cancelAnimationFrame(scrollFrame); scrollFrame = 0; }
  function travelTo(top, instant = false) {
    cancelScroll();
    const end = Math.max(0, Math.min(top, document.documentElement.scrollHeight-innerHeight));
    if (instant || reduced.matches) { scrollTo(0,end); return; }
    const from = scrollY, distance = end-from, start = performance.now();
    const duration = Math.min(900,Math.max(450,Math.abs(distance)*.3));
    const tick = now => { const t=Math.min(1,(now-start)/duration);scrollTo(0,from+distance*(1-Math.pow(1-t,4)));if(t<1)scrollFrame=requestAnimationFrame(tick);else scrollFrame=0; };
    scrollFrame=requestAnimationFrame(tick);
  }
  addEventListener('wheel',cancelScroll,{passive:true});
  addEventListener('touchstart',cancelScroll,{passive:true});
  addEventListener('keydown',e=>{if(['ArrowDown','ArrowUp','PageDown','PageUp','Home','End',' '].includes(e.key))cancelScroll();});

  let activeCity = -1;
  const journey=$('#journey'), sticky=$('.journey-sticky');
  const staticJourney=()=>innerWidth<=700||innerHeight<780||reduced.matches;
  const developedKey = 'yunnan-developed-ids';
  const developed = new Set(JSON.parse(sessionStorage.getItem(developedKey) || '[]'));
  function persistDeveloped() {
    sessionStorage.setItem(developedKey, JSON.stringify([...developed]));
  }
  function syncCityPhotoSeal() {
    const city = cities[activeCity] || cities[0];
    const photo = photoById(city.photo);
    const unlocked = developed.has(photo.id);
    const btn = $('#city-photo-btn');
    btn.classList.toggle('is-sealed', !unlocked);
    btn.setAttribute('aria-label', unlocked ? `放大查看：${photo.caption}` : '风景还在相机里，去口袋相机显影');
  }
  function setCity(index, animate = true) {
    const i=(index+cities.length)%cities.length;
    if(i===activeCity)return;
    activeCity=i;
    const city=cities[i], photo=photoById(city.photo);
    $('#city-title').textContent=city.name;$('#city-word').textContent=city.word;$('#city-note').textContent=city.note;
    $('#city-aside').textContent=city.aside;$('#city-count').textContent=`0${i+1} / 03`;
    $('#city-photo').src=photo.src;$('#city-photo').alt=photo.caption;
    journey.style.setProperty('--city-accent',city.color);
    $('#city-panel').setAttribute('aria-labelledby',`tab-${city.id}`);
    $$('[data-city-tab]').forEach((b,n)=>{b.setAttribute('aria-selected',String(n===i));b.tabIndex=n===i?0:-1;});
    syncCityPhotoSeal();
    if(animate){motion($('.city-image'),[{opacity:.5,transform:'translateX(24px) rotate(1deg)'},{opacity:1,transform:'translateX(0) rotate(-2deg)'}],{duration:480});motion($('.city-letter'),[{opacity:.4,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)'}],{duration:360});}
  }
  function goCity(index, instant = false) {
    const i=(index+cities.length)%cities.length;
    setCity(i);
    if(staticJourney()) travelTo(journey.offsetTop-68,instant);
    else travelTo(journey.offsetTop+(journey.offsetHeight-sticky.offsetHeight)*((i+.18)/3),instant);
  }
  function goHash(hash, instant = false) {
    const cityIndex=cities.findIndex(c=>`#${c.id}`===hash);
    if(cityIndex>=0){goCity(cityIndex,instant);return;}
    const target=document.getElementById(hash.replace(/^#/,''));
    if(target)travelTo(target.getBoundingClientRect().top+scrollY-68,instant);
  }
  $('#about').tabIndex=-1;
  $$('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();const hash=a.getAttribute('href');history.pushState(null,'',hash);closeMenu();goHash(hash);if(a.classList.contains('skip-link'))$('#about').focus({preventScroll:true});}));
  $$('[data-city-tab]').forEach((b,i)=>{b.addEventListener('click',()=>goCity(i));b.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const next=e.key==='Home'?0:e.key==='End'?2:(i+(e.key==='ArrowRight'?1:2))%3;goCity(next);$$('[data-city-tab]')[next].focus({preventScroll:true});}});});
  $('#city-prev').addEventListener('click',()=>goCity(activeCity-1));$('#city-next').addEventListener('click',()=>goCity(activeCity+1));
  setCity(0,false);
  let tickPending=false;
  function onScroll() {
    tickPending=false;
    const rect=journey.getBoundingClientRect();
    if(!scrollFrame&&!staticJourney()&&rect.top<=0&&rect.bottom>=sticky.offsetHeight){const p=Math.max(0,Math.min(.999,-rect.top/(journey.offsetHeight-sticky.offsetHeight)));setCity(Math.floor(p*3));}
    $('.site-header').classList.toggle('scrolled',scrollY>40);
    const progress=scrollY/Math.max(1,document.documentElement.scrollHeight-innerHeight);
    $('.reading-line').style.transform=`scaleX(${Math.min(1,progress)})`;
  }
  addEventListener('scroll',()=>{if(!tickPending){tickPending=true;requestAnimationFrame(onScroll);}},{passive:true});
  addEventListener('resize',onScroll);reduced.addEventListener('change',onScroll);
  addEventListener('popstate',()=>goHash(location.hash||'#hero',true));
  function closeMenu() { $('#site-nav').classList.remove('open');$('.menu-toggle').setAttribute('aria-expanded','false');$('.menu-toggle').setAttribute('aria-label','展开目录'); }
  $('.menu-toggle').addEventListener('click',()=>{const open=$('.menu-toggle').getAttribute('aria-expanded')!=='true';$('#site-nav').classList.toggle('open',open);$('.menu-toggle').setAttribute('aria-expanded',String(open));$('.menu-toggle').setAttribute('aria-label',open?'关闭目录':'展开目录');});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu();});
  const navObserver=new IntersectionObserver(entries=>{const visible=entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];if(visible)$$('#site-nav a').forEach(a=>{const current=a.hash===`#${visible.target.id}`;if(current)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});},{rootMargin:'-20% 0px -45% 0px',threshold:[0,.2,.5]});
  $$('main > section').forEach(s=>navObserver.observe(s));
  if(location.hash)requestAnimationFrame(()=>goHash(location.hash,true));
  onScroll();

  // Real photograph / painted memory: direct pointer response and native keyboard input.
  const board=$('#memory-board'), range=$('#memory-range');let compareToken=0;
  function reveal(value) {const n=Math.max(0,Math.min(100,Number(value)));range.value=String(n);board.style.setProperty('--reveal',`${n}%`);range.setAttribute('aria-valuetext',`手绘记忆 ${n}%`);}
  range.addEventListener('input',()=>reveal(range.value));
  $$('[data-reveal]').forEach(b=>b.addEventListener('click',()=>reveal(b.dataset.reveal)));
  function decodeImage(src) {return new Promise((resolve,reject)=>{const img=new Image();const timer=setTimeout(()=>finish(new Error('timeout')),10000);function finish(e){clearTimeout(timer);img.onload=img.onerror=null;e?reject(e):resolve();}img.onload=()=>img.decode().then(()=>finish(),finish);img.onerror=()=>finish(new Error('image'));img.src=src;});}
  cities.forEach(city=>decodeImage(photoById(city.photo).src).catch(()=>{}));
  async function compare(id) {
    const token=++compareToken,p=photoById(id),source=`assets/photos/source/${id}.webp`;
    board.setAttribute('aria-busy','true');$('#memory-error').textContent='';
    try {
      await Promise.all([decodeImage(p.src),decodeImage(source)]);
      if(token!==compareToken)return;
      $('#memory-real').src=source;$('#memory-real').alt=`${p.caption}，原始实拍`;
      $('#memory-painted').src=p.src;$('#memory-painted').alt=`${p.caption}，AI 手绘`;
      board.dataset.photo=id;$('#memory-caption').textContent=p.caption;reveal(50);
      $$('[data-compare]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.compare===id)));
      motion(board,[{opacity:.4,transform:'translateY(7px)'},{opacity:1,transform:'translateY(0)'}],{duration:240});
    }catch{if(token===compareToken)$('#memory-error').textContent='这张记忆还没装好，再点一次照片试试。';}
    finally{if(token===compareToken)board.setAttribute('aria-busy','false');}
  }
  $$('[data-compare]').forEach(b=>b.addEventListener('click',()=>compare(b.dataset.compare)));

  // Gallery only shows postcards developed via the camera (ink reveal).
  const galleryPhotos = C.photos.filter(p => p.city !== 'about');
  const cameraPhotos = C.photos.filter(p => !['gallery', 'about'].includes(p.city));
  let filtered = [], dialogPhotos = [], dialogIndex = 0;
  let galleryFilter = 'all';
  const dialog = $('#photo-dialog');
  const zoomState = { scale: 1, x: 0, y: 0, min: 1, max: 3 };
  function unlockedPhotos(city = 'all') {
    const pool = galleryPhotos.filter(p => developed.has(p.id));
    return window.JourneyState.filterPhotos(pool, city);
  }
  function resetZoom() {
    zoomState.scale = 1; zoomState.x = 0; zoomState.y = 0;
    const stage = $('.dialog-stage');
    if (!stage) return;
    const photo = stage.querySelector('.travel-photo');
    if (photo) photo.style.transform = 'translate(0px, 0px) scale(1)';
    stage.classList.remove('is-zoomed', 'is-dragging', 'is-pinching');
    const label = $('#dialog-zoom-label');
    if (label) label.textContent = '100%';
    const fit = $('[data-zoom="fit"]');
    if (fit) fit.setAttribute('aria-pressed', 'true');
    $$('[data-zoom="in"],[data-zoom="out"]').forEach(b => b.setAttribute('aria-pressed', 'false'));
  }
  function applyZoom() {
    const stage = $('.dialog-stage');
    const photo = stage?.querySelector('.travel-photo');
    if (!photo) return;
    zoomState.scale = Math.max(zoomState.min, Math.min(zoomState.max, zoomState.scale));
    if (zoomState.scale <= 1.01) { zoomState.scale = 1; zoomState.x = 0; zoomState.y = 0; }
    photo.style.transform = `translate(${zoomState.x}px, ${zoomState.y}px) scale(${zoomState.scale})`;
    stage.classList.toggle('is-zoomed', zoomState.scale > 1);
    const label = $('#dialog-zoom-label');
    if (label) label.textContent = `${Math.round(zoomState.scale * 100)}%`;
  }
  function bindZoom(stage) {
    let dragging = false, lastX = 0, lastY = 0, pointers = new Map(), pinchStart = 0, pinchScale = 1;
    const setScaleAround = (next, clientX, clientY) => {
      const rect = stage.getBoundingClientRect();
      const cx = clientX - rect.left, cy = clientY - rect.top;
      const prev = zoomState.scale;
      const clamped = Math.max(zoomState.min, Math.min(zoomState.max, next));
      if (prev === clamped) return;
      zoomState.x = cx - ((cx - zoomState.x) * (clamped / prev));
      zoomState.y = cy - ((cy - zoomState.y) * (clamped / prev));
      zoomState.scale = clamped;
      applyZoom();
    };
    stage.addEventListener('wheel', e => {
      e.preventDefault();
      setScaleAround(zoomState.scale + (e.deltaY < 0 ? 0.18 : -0.18), e.clientX, e.clientY);
    }, { passive: false });
    stage.addEventListener('dblclick', e => {
      if (zoomState.scale > 1.05) resetZoom();
      else setScaleAround(2.2, e.clientX, e.clientY);
    });
    stage.addEventListener('pointerdown', e => {
      stage.setPointerCapture(e.pointerId);
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.size === 1 && zoomState.scale > 1) {
        dragging = true; lastX = e.clientX; lastY = e.clientY; stage.classList.add('is-dragging');
      }
      if (pointers.size === 2) {
        dragging = false; stage.classList.add('is-pinching');
        const [a, b] = [...pointers.values()];
        pinchStart = Math.hypot(a.x - b.x, a.y - b.y) || 1;
        pinchScale = zoomState.scale;
      }
    });
    stage.addEventListener('pointermove', e => {
      if (!pointers.has(e.pointerId)) return;
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.size === 2) {
        const [a, b] = [...pointers.values()];
        const dist = Math.hypot(a.x - b.x, a.y - b.y) || 1;
        const midX = (a.x + b.x) / 2, midY = (a.y + b.y) / 2;
        setScaleAround(pinchScale * (dist / pinchStart), midX, midY);
        return;
      }
      if (!dragging) return;
      zoomState.x += e.clientX - lastX;
      zoomState.y += e.clientY - lastY;
      lastX = e.clientX; lastY = e.clientY;
      applyZoom();
    });
    const endPointer = e => {
      pointers.delete(e.pointerId);
      if (pointers.size < 2) stage.classList.remove('is-pinching');
      if (pointers.size === 0) { dragging = false; stage.classList.remove('is-dragging'); }
    };
    stage.addEventListener('pointerup', endPointer);
    stage.addEventListener('pointercancel', endPointer);
    $('#dialog-zoom-in')?.addEventListener('click', () => {
      const rect = stage.getBoundingClientRect();
      setScaleAround(zoomState.scale + 0.35, rect.left + rect.width / 2, rect.top + rect.height / 2);
    });
    $('#dialog-zoom-out')?.addEventListener('click', () => {
      const rect = stage.getBoundingClientRect();
      setScaleAround(zoomState.scale - 0.35, rect.left + rect.width / 2, rect.top + rect.height / 2);
    });
    $('[data-zoom="fit"]')?.addEventListener('click', resetZoom);
  }
  function showPhoto(index) {
    dialogIndex = (index + dialogPhotos.length) % dialogPhotos.length;
    const p = dialogPhotos[dialogIndex];
    $('#dialog-content').innerHTML = `
      <div class="dialog-stage" aria-label="可放大查看的旅途照片">${photoMarkup(p, 'photo-slot--dialog')}</div>
      <div class="dialog-zoom-bar" role="group" aria-label="照片缩放">
        <button type="button" id="dialog-zoom-out" data-zoom="out" aria-label="缩小">−</button>
        <span id="dialog-zoom-label">100%</span>
        <button type="button" id="dialog-zoom-in" data-zoom="in" aria-label="放大">+</button>
        <button type="button" data-zoom="fit" aria-pressed="true" aria-label="还原大小">适应</button>
      </div>
      <p class="dialog-hint">滚轮 / 双指捏合放大 · 拖动平移 · 双击切换</p>
      <div class="dialog-copy"><h3>${esc(p.caption)}</h3><p>${esc(p.note)}</p>
      <a class="photo-download text-link" href="${esc(p.original || p.src)}" download>保存这张风景 ${icon('download')}</a></div>`;
    $('#dialog-counter').textContent = `${dialogIndex + 1} / ${dialogPhotos.length}`;
    resetZoom();
    bindZoom($('.dialog-stage'));
    motion($('#dialog-content'), [{ opacity: .5, transform: 'translateX(6px)' }, { opacity: 1, transform: 'translateX(0)' }], { duration: 180 });
  }
  function openViewer(photos, index) {
    if (!photos.length) return;
    dialogPhotos = photos;
    showPhoto(index);
    if (!dialog.open) dialog.showModal();
    document.body.classList.add('dialog-open');
  }
  function renderGallery(city = galleryFilter, animate = false) {
    galleryFilter = city;
    filtered = unlockedPhotos(city);
    if (!filtered.length) {
      $('#gallery-wall').innerHTML = `<div class="gallery-empty"><strong>底片墙还是空的</strong><p>明信片不会提前摆在这里。<br>去口袋相机按下快门，等水墨洇开，才会收进来。</p><a href="#desk">去显影一张 →</a></div>`;
      $('#gallery-count').textContent = '0 张已显影';
      return;
    }
    $('#gallery-wall').innerHTML = filtered.map((p, i) => `<button class="gallery-photo" data-index="${i}" aria-label="查看照片：${esc(p.caption)}"><span class="photo-tape" aria-hidden="true"></span>${photoMarkup(p)}<span class="gallery-caption">${esc(p.caption)}</span><small>${esc(cities.find(c => c.id === p.city)?.name || '沿途拾光')} <span>水墨显影</span></small></button>`).join('');
    $('#gallery-count').textContent = `${filtered.length} 张已显影`;
    if (animate) $$('.gallery-photo').slice(0, 6).forEach((card, i) => motion(card, [{ opacity: .15, translate: '0 14px' }, { opacity: 1, translate: '0 0' }], { duration: 240, delay: i * 22 }));
  }
  renderGallery();
  $('.gallery-filters').addEventListener('click', e => {
    const b = e.target.closest('[data-filter]');
    if (!b) return;
    $$('[data-filter]').forEach(el => el.setAttribute('aria-pressed', String(el === b)));
    renderGallery(b.dataset.filter, true);
  });
  $('#gallery-wall').addEventListener('click', e => {
    const b = e.target.closest('[data-index]');
    if (b) openViewer(filtered, Number(b.dataset.index));
  });
  $('#city-photo-btn').addEventListener('click', () => {
    const id = cities[activeCity]?.photo;
    if (!developed.has(id)) {
      history.pushState(null, '', '#desk');
      goHash('#desk');
      return;
    }
    const list = unlockedPhotos('all');
    const index = Math.max(0, list.findIndex(p => p.id === id));
    openViewer(list, index);
  });
  $('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', e => {
    if (e.target === dialog) {
      const r = dialog.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.close();
    }
  });
  dialog.addEventListener('close', () => { document.body.classList.remove('dialog-open'); resetZoom(); });
  $('#photo-prev').addEventListener('click', () => showPhoto(dialogIndex - 1));
  $('#photo-next').addEventListener('click', () => showPhoto(dialogIndex + 1));
  dialog.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); showPhoto(dialogIndex - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); showPhoto(dialogIndex + 1); }
    if (e.key === '+' || e.key === '=') { e.preventDefault(); zoomState.scale += 0.35; applyZoom(); }
    if (e.key === '-' || e.key === '_') { e.preventDefault(); zoomState.scale -= 0.35; applyZoom(); }
    if (e.key === '0') { e.preventDefault(); resetZoom(); }
  });
  window.TravelCamera = window.initInstantCamera({
    photos: cameraPhotos,
    photoMarkup,
    escapeHtml: esc,
    openPhoto(id) {
      const list = unlockedPhotos('all');
      const idx = list.findIndex(p => p.id === id);
      openViewer(list.length ? list : cameraPhotos.filter(p => p.id === id), Math.max(0, idx));
    },
    onDeveloped(photo, ids) {
      ids.forEach(id => developed.add(id));
      persistDeveloped();
      syncCityPhotoSeal();
      renderGallery(galleryFilter, true);
    }
  });
  window.TravelCamera.seedDeveloped([...developed]);
  syncCityPhotoSeal();

  $('#stamp-letter').addEventListener('click',()=>{const stamp=$('#letter-stamp');stamp.setAttribute('aria-hidden','false');motion(stamp,[{opacity:0,transform:'rotate(-14deg) scale(1.6)'},{opacity:1,transform:'rotate(-14deg) scale(1)'}],{duration:320});$('#stamp-status').textContent='收下这一阵风，继续好好生活。';$('#stamp-letter').innerHTML=`再盖一次 ${arrow}`;});

  // Optional print tilt — only when legacy hero prints exist.
  const heroPhotos=$('.hero-photos');let tiltFrame=0;
  if(heroPhotos){
    heroPhotos.addEventListener('pointermove',e=>{if(reduced.matches||e.pointerType!=='mouse')return;cancelAnimationFrame(tiltFrame);tiltFrame=requestAnimationFrame(()=>{const r=heroPhotos.getBoundingClientRect();heroPhotos.style.setProperty('--tilt-x',`${((e.clientY-r.top)/r.height-.5)*-5}deg`);heroPhotos.style.setProperty('--tilt-y',`${((e.clientX-r.left)/r.width-.5)*6}deg`);});});
    heroPhotos.addEventListener('pointerleave',()=>{cancelAnimationFrame(tiltFrame);heroPhotos.style.setProperty('--tilt-x','0deg');heroPhotos.style.setProperty('--tilt-y','0deg');});
  }

  // Labelled, opt-in synthetic ambience. The turntable controls this same transport.
  let audioContext=null,playing=false,audioBusy=false;
  async function toggleSound(){
    if(audioBusy)return;audioBusy=true;
    try{
      if(!audioContext){const AudioCtx=window.AudioContext||window.webkitAudioContext;if(!AudioCtx)throw Error('unsupported');audioContext=new AudioCtx();const buffer=audioContext.createBuffer(1,audioContext.sampleRate*4,audioContext.sampleRate),data=buffer.getChannelData(0);let last=0;for(let i=0;i<data.length;i++){last=(last+Math.random()*.04-.02)/1.02;data[i]=last*3;}const noise=audioContext.createBufferSource();noise.buffer=buffer;noise.loop=true;const filter=audioContext.createBiquadFilter();filter.type='lowpass';filter.frequency.value=520;const gain=audioContext.createGain();gain.gain.value=.16;noise.connect(filter).connect(gain).connect(audioContext.destination);noise.start();[174.61,220,261.63].forEach(f=>{const osc=audioContext.createOscillator(),g=audioContext.createGain();osc.frequency.value=f;g.gain.value=.009;osc.connect(g).connect(audioContext.destination);osc.start();});}
      if(playing){await audioContext.suspend();playing=false;}else{await audioContext.resume();playing=true;}
      $('.sound-switch').setAttribute('aria-pressed',String(playing));$('.sound-switch').setAttribute('aria-label',playing?'关闭合成环境音':'开启合成环境音');$('.sound-label').textContent=playing?'声音开':'声音关';document.body.classList.toggle('sound-on',playing);
    }catch{$('.sound-label').textContent='声音不可用';}finally{audioBusy=false;}
  }
  $('.sound-switch').addEventListener('click',toggleSound);
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&playing)toggleSound();});
})();
