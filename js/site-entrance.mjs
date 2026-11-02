/** A small stage-setting scene, tied to the first view's actual assets. */
export function initSiteEntrance({reduced=matchMedia('(prefers-reduced-motion: reduce)')}={}) {
  const root=document.querySelector('[data-site-entrance]');
  if(!root)return {ready:Promise.resolve()};
  clearTimeout(window.__entranceFailSafe);
  const content=[...document.querySelectorAll('.site-header,main,.skip-link')];
  content.forEach(element=>{element.dataset.bootInert='';element.inert=true;});
  const steps=[...root.querySelectorAll('[data-entrance-step]')];
  const message=root.querySelector('[data-entrance-message]');
  const start=performance.now();
  let finished=false,closing=false,deadline,resolveReady;
  const ready=new Promise(resolve=>resolveReady=resolve);
  const wait=ms=>new Promise(resolve=>setTimeout(resolve,Math.max(0,ms)));
  const decode=image=>image?.decode?image.decode().catch(()=>{}):Promise.resolve();
  const poster=new Image();poster.src=document.querySelector('#hero-video')?.poster||'';
  const resources=[document.fonts.ready,decode(document.querySelector('.stage-host')),Promise.all([decode(document.querySelector('.stage-structure')),decode(poster)])];
  const labels=['先铺好画纸。','请小羊就位。','把展台点亮。'];
  const duration=reduced.matches?550:1700;

  function release(){
    if(finished)return;finished=true;clearTimeout(deadline);
    document.documentElement.classList.remove('is-booting');
    root.hidden=true;root.setAttribute('aria-hidden','true');
    content.forEach(element=>{element.inert=false;delete element.dataset.bootInert;});
    if(root.contains(document.activeElement))document.querySelector('.type-trigger')?.focus({preventScroll:true});
    document.dispatchEvent(new CustomEvent('site:ready'));
    resolveReady();
  }
  function finish(){
    if(closing||finished)return;closing=true;
    root.dataset.state='leaving';
    if(reduced.matches||document.hidden){release();return;}
    const animation=root.animate([{opacity:1,transform:'translateY(0)'},{opacity:0,transform:'translateY(-12px)'}],{duration:380,easing:'cubic-bezier(.16,1,.3,1)',fill:'forwards'});
    animation.finished.then(release,release);
  }
  root.querySelector('[data-skip-entrance]').addEventListener('click',finish);
  deadline=setTimeout(finish,5500);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)finish();},{once:true});
  reduced.addEventListener('change',()=>{if(reduced.matches)finish();},{once:true});
  (async()=>{
    for(let index=0;index<resources.length;index++){
      if(closing||finished)return;
      root.dataset.phase=String(index);message.textContent=labels[index];steps[index].dataset.state='active';
      await Promise.all([resources[index],wait(duration*(index+1)/3-(performance.now()-start))]);
      if(closing||finished)return;steps[index].dataset.state='done';
    }
    message.textContent='准备好了，好奇心上场。';root.dataset.phase='ready';
    await wait(reduced.matches?0:180);finish();
  })().catch(finish);
  return {ready,finish};
}
