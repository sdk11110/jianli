/** Keep the exhibit's chapter and its way home available while reading. */
export function initJourneyNavigation() {
  const header=document.querySelector('.site-header');
  if(!header)return;
  const links=[...header.querySelectorAll('#main-nav a[href^="#"],.header-contact[href^="#"]')];
  const sections=links.map(link=>document.querySelector(link.hash)).filter(Boolean);
  const label=header.querySelector('[data-current-section]');
  const names={work:'精选项目',method:'AI 工作方法',notes:'现场手记',about:'关于我',contact:'联系我'};
  let current='',frame=0;
  function paint(){
    frame=0;
    const edge=header.offsetHeight+20;
    let section;
    // A pixel-based reading edge behaves consistently on narrow and wide screens.
    // IntersectionObserver percentage margins use the viewport width, not height.
    for(const item of sections){if(item.getBoundingClientRect().top<=edge)section=item;}
    if(scrollY>0&&scrollY+innerHeight>=document.documentElement.scrollHeight-2)section=sections.at(-1);
    const id=section?.id||'';
    if(id===current)return;current=id;
    links.forEach(link=>{if(link.hash==='#'+id)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});
    if(label)label.textContent=names[id]||'继续看看';
  }
  function schedule(){if(!frame)frame=requestAnimationFrame(paint);}
  addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule,{passive:true});
  document.fonts.ready.then(schedule);paint();
  const hero=document.querySelector('.hero');
  const heroObserver=hero?new IntersectionObserver(([entry])=>header.classList.toggle('is-reading',!entry.isIntersecting),{threshold:0}):null;
  if(hero)heroObserver.observe(hero);
  return {destroy(){heroObserver?.disconnect();removeEventListener('scroll',schedule);removeEventListener('resize',schedule);if(frame)cancelAnimationFrame(frame);}};
}
