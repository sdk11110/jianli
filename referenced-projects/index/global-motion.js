/* A single projected sculpture, composed against the page's scroll timeline.
   All geometry is local and deterministic; no media, audio or external runtime. */
(() => {
  'use strict';
  const canvas = document.querySelector('[data-global-motion]');
  const toggle = document.querySelector('[data-motion-toggle]');
  const ctx = canvas?.getContext('2d', { alpha: true });
  if (!ctx) { if (toggle) toggle.hidden = true; return; }
  const originalMaterial = document.querySelector('[data-original-material]');
  const originalClosing = document.querySelector('[data-original-closing]');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const mix = (a, b, t) => a + (b - a) * t;
  const smooth = (a, b, value) => { const t = clamp((value - a) / (b - a)); return t * t * (3 - 2 * t); };
  let width = 1, height = 1, dpr = 1, time = 0, last = 0, raf = 0;
  let paused = reduce.matches, manualPause = null, dirty = true;
  let pointerX = 0, pointerY = 0, targetX = 0, targetY = 0;
  let scroll = 0, targetScroll = window.scrollY, sections = {};
  const absoluteTop = element => {
    let y = 0;
    for (let node = element; node; node = node.offsetParent) y += node.offsetTop;
    return y;
  };
  function resize() {
    width = innerWidth; height = innerHeight;
    dpr = Math.min(devicePixelRatio || 1, width < 760 ? 1.25 : 1.5);
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    for (const name of ['intro', 'projects', 'closing']) {
      const el = document.querySelector('.' + name);
      sections[name] = el ? absoluteTop(el) : 0;
    }
    dirty = true; wake();
  }
  function project(x, y, z, yaw, pitch, cx, cy, scale) {
    const rx = x * Math.cos(yaw) + z * Math.sin(yaw);
    const rz = z * Math.cos(yaw) - x * Math.sin(yaw);
    const ry = y * Math.cos(pitch) - rz * Math.sin(pitch);
    const depth = y * Math.sin(pitch) + rz * Math.cos(pitch);
    const perspective = 4.8 / (4.8 + depth);
    return [cx + rx * scale * perspective, cy + ry * scale * perspective, depth];
  }
  function render() {
    const mobile = width < 760;
    const departure = smooth(0, height * .9, scroll);
    const archive = smooth(sections.intro, sections.projects, scroll + height * .35);
    const closing = smooth(sections.closing - height, sections.closing, scroll);
    const morph = departure * (1 - closing);
    const cx = width * mix(mobile ? .70 : .78, .58, morph) + pointerX * 22;
    const cy = height * mix(mobile ? .28 : .49, .48, morph) + pointerY * 14;
    const scale = Math.min(width * (mobile ? .5 : .36), height * .53) * (1 + departure * .24);
    const yaw = -.34 + Math.sin(time * .15) * .14 + pointerX * .18 + morph * .65;
    const pitch = .18 + pointerY * .12 + morph * .3;
    const rotation = time * .065 + scroll / Math.max(height, 1) * .18;
    ctx.clearRect(0, 0, width, height);
    if (originalMaterial) originalMaterial.style.opacity = String(departure * (1 - closing) * .7);
    if (originalClosing) originalClosing.style.opacity = String(closing);
    const atmosphere = ctx.createRadialGradient(cx, cy, 0, cx, cy, scale * 2);
    atmosphere.addColorStop(0, 'rgba(34,35,42,.08)'); atmosphere.addColorStop(1, 'rgba(12,13,16,0)');
    ctx.fillStyle = atmosphere; ctx.fillRect(0, 0, width, height);
    const faces = [], count = mobile ? 64 : 92, layers = mobile ? 3 : 5;
    for (let layer = 0; layer < layers; layer++) {
      const depth = (layer - (layers - 1) / 2) * .36;
      for (let i = 0; i < count; i++) {
        const angle = i / count * Math.PI * 2 + rotation + layer * .1;
        const envelope = .5 + .5 * Math.sin(angle * 3 + layer * .8 + time * .35);
        const inner = .66 + layer * .065;
        const outer = inner + .32 + envelope * .46;
        const half = Math.PI / count * .58;
        const vertex = (a, radius, z) => {
          const ringX = Math.cos(a) * radius, ringY = Math.sin(a) * radius;
          const u = (a - rotation - layer * .1) / (Math.PI * 2);
          const waveX = (u - .5) * 4.6;
          const waveY = Math.sin(u * Math.PI * 3 + time * .28 + layer * .25) * .46 + (radius - inner) * 1.15 + layer * .08;
          return project(mix(ringX, waveX, morph), mix(ringY, waveY, morph), z, yaw, pitch, cx, cy, scale);
        };
        const corners = [vertex(angle-half, inner, depth),vertex(angle+half, inner, depth),vertex(angle+half*.6, outer, depth+.16),vertex(angle-half*.6, outer, depth+.16)];
        const light = clamp(.45 + Math.cos(angle - .9) * .3 + envelope * .25);
        faces.push({ corners, depth:corners.reduce((s,p)=>s+p[2],0)/4, light, gold:i%17===0, layer });
      }
    }
    faces.sort((a,b)=>b.depth-a.depth);
    ctx.globalAlpha = mix(.3, .14, archive * (1-closing));
    for (const face of faces) {
      const p = face.corners;
      const v = Math.round(48 + face.light * 148);
      const gradient = ctx.createLinearGradient(p[0][0],p[0][1],p[2][0],p[2][1]);
      gradient.addColorStop(0,face.gold ? '#594c37' : '#282a32');
      gradient.addColorStop(.52,face.gold ? `rgb(${v},${Math.round(v*.86)},${Math.round(v*.64)})` : `rgb(${v},${v},${Math.min(255,v+7)})`);
      gradient.addColorStop(.72,face.gold ? '#ddc69c' : '#d8d9dd');
      gradient.addColorStop(1,'#303139');
      ctx.beginPath();ctx.moveTo(p[0][0],p[0][1]);for(let j=1;j<4;j++)ctx.lineTo(p[j][0],p[j][1]);ctx.closePath();
      ctx.fillStyle=gradient;ctx.fill();
      ctx.beginPath();ctx.moveTo(p[1][0],p[1][1]);ctx.lineTo(p[2][0],p[2][1]);
      ctx.strokeStyle=face.gold?'rgba(228,206,163,.55)':'rgba(235,237,244,.33)';ctx.lineWidth=.65;ctx.stroke();
    }
    ctx.globalAlpha = 1;
    // Reserve calm, high-contrast space for real content rather than tinting text.
    const shade=ctx.createLinearGradient(0,0,width,0);
    shade.addColorStop(0,'rgba(12,13,16,.55)');
    shade.addColorStop(mobile?.2:.32,'rgba(12,13,16,.4)');
    shade.addColorStop(.64,'rgba(12,13,16,.13)');shade.addColorStop(1,'rgba(12,13,16,0)');
    ctx.fillStyle=shade;ctx.fillRect(0,0,width,height);
    if(mobile){const veil=ctx.createLinearGradient(0,height*.25,0,height*.8);veil.addColorStop(0,'rgba(12,13,16,0)');veil.addColorStop(1,'rgba(12,13,16,.94)');ctx.fillStyle=veil;ctx.fillRect(0,0,width,height);}
  }
  function frame(now) {
    raf=0;
    if(document.hidden) {last=0;return;}
    const dt=Math.min(.05,(now-(last||now))/1000); last=now;
    const moving=!paused && !document.body.classList.contains('is-detail-open');
    if(moving){time+=dt;pointerX+=(targetX-pointerX)*Math.min(1,dt*4);pointerY+=(targetY-pointerY)*Math.min(1,dt*4);}
    scroll = reduce.matches ? targetScroll : mix(scroll,targetScroll,Math.min(1,dt*9+.02));
    if(moving || dirty || Math.abs(scroll-targetScroll)>.2) render();
    dirty=false;
    if(moving || Math.abs(scroll-targetScroll)>.2) raf=requestAnimationFrame(frame);
  }
  function wake(){if(!raf&&!document.hidden)raf=requestAnimationFrame(frame);}
  function syncButton(){
    if(!toggle)return;
    toggle.setAttribute('aria-pressed',String(paused));
    toggle.querySelector('span').textContent=paused?'播放背景':'暂停背景';
    toggle.classList.toggle('is-paused',paused);
  }
  toggle?.addEventListener('click',()=>{manualPause=!paused;paused=manualPause;syncButton();dirty=true;wake();});
  reduce.addEventListener('change',()=>{paused=reduce.matches || manualPause===true;syncButton();dirty=true;wake();});
  window.addEventListener('pointermove',event=>{if(event.pointerType==='touch')return;targetX=event.clientX/width-.5;targetY=event.clientY/height-.5;},{passive:true});
  window.addEventListener('scroll',()=>{targetScroll=window.scrollY;dirty=true;wake();},{passive:true});
  window.addEventListener('resize',resize,{passive:true});
  document.addEventListener('toggle',resize,true);
  window.addEventListener('load',resize,{once:true});
  document.fonts?.ready.then(resize);
  document.addEventListener('visibilitychange',()=>{last=0;if(document.hidden){cancelAnimationFrame(raf);raf=0;}else{dirty=true;wake();}});
  new MutationObserver(()=>{dirty=true;wake();}).observe(document.body,{attributes:true,attributeFilter:['class']});
  document.body.classList.add('has-global-motion');
  syncButton();resize();
})();
