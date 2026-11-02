import {siteLinks} from './routes.mjs?v=20261101-home-cases';
import {clips,methodSteps} from './content.mjs';
import {initHeroType} from './hero-type.mjs';
import {initFooterScene} from './footer-scene.mjs';
import {initSurfaceMotion,transitionContent} from './surface-motion.mjs';
import {createDialogMotion} from './dialog-motion.mjs';
import {initSiteEntrance} from './site-entrance.mjs';
import {initExhibitPlayers} from './exhibit-player.mjs';
import {initTrainingWorkbench} from './training-workbench.mjs';
import {createComicViewer} from './comic-viewer.mjs';
import {initComicPaper} from './comic-paper.mjs';
import {initJourneyNavigation} from './journey-nav.mjs';
import {initMethodLab} from './method-lab.mjs';
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
initJourneyNavigation();
const methodLab=initMethodLab(document.querySelector('[data-method-lab]'),{reduced});
const entrance=initSiteEntrance({reduced});
const players=initExhibitPlayers({reduced,canAutoplay:entrance.ready});
initTrainingWorkbench(undefined,{reduced});
initSurfaceMotion({reduced});
const heroType=initHeroType($('#hero-title'),reduced);
entrance.ready.then(()=>document.fonts.ready).then(()=>heroType.play());
const links=siteLinks(location.href);
const useLightVideo=matchMedia('(max-width:700px)').matches||navigator.connection?.saveData||/^(slow-)?2g$|^3g$/.test(navigator.connection?.effectiveType||'');
const clipSource=clip=>useLightVideo&&clip.mobileSrc?clip.mobileSrc:clip.src;
$$('[data-local-link]').forEach(a=>{if(links[a.dataset.localLink])a.href=links[a.dataset.localLink];});
const menu=$('.menu-toggle'),nav=$('#main-nav'),desktopNav=matchMedia('(min-width:701px)');
function setMenu(open){
 menu?.setAttribute('aria-expanded',String(open));menu?.setAttribute('aria-label',open?'关闭导航':'打开导航');
 nav?.classList.toggle('is-open',open);nav.inert=!desktopNav.matches&&!open;
}
function closeMenu(){setMenu(false);}
menu?.addEventListener('click',()=>setMenu(menu.getAttribute('aria-expanded')!=='true'));
$$('a',nav).forEach(a=>a.addEventListener('click',closeMenu));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu?.getAttribute('aria-expanded')==='true'){closeMenu();menu.focus();}});
desktopNav.addEventListener('change',closeMenu);closeMenu();
document.addEventListener('click',event=>{if(!desktopNav.matches&&!event.target.closest('.site-header'))closeMenu();});
nav.addEventListener('focusout',()=>queueMicrotask(()=>{if(!desktopNav.matches&&!$('.site-header').contains(document.activeElement))closeMenu();}));

function bindTabs(tabs,onSelect){
 let selected=-1;
 function select(index,focus=false){const i=(index+tabs.length)%tabs.length;if(i===selected){if(focus)tabs[i].focus();return;}selected=i;tabs.forEach((tab,n)=>{tab.setAttribute('aria-selected',String(n===i));tab.tabIndex=n===i?0:-1;});onSelect(tabs[i],i);if(focus)tabs[i].focus();}
 tabs.forEach((tab,i)=>{tab.addEventListener('click',()=>select(i));tab.addEventListener('keydown',event=>{let next;if(event.key==='ArrowRight'||event.key==='ArrowDown')next=i+1;else if(event.key==='ArrowLeft'||event.key==='ArrowUp')next=i-1;else if(event.key==='Home')next=0;else if(event.key==='End')next=tabs.length-1;else return;event.preventDefault();select(next,true);});});
 return select;
}
const watchVideo=$('#watch-video');
let caseReady=false;
const pickCase=bindTabs($$('[data-case-tab]'),tab=>{
 const film=tab.dataset.caseTab==='film',surface=$(film?'#watch-film':'#watch-interface');
 const update=()=>{$('#watch-film').hidden=!film;$('#watch-interface').hidden=film;$('.clip-picker').hidden=!film;$('[data-clip-note="watch"]').hidden=!film;if(!film)watchVideo.pause();};
 if(caseReady)transitionContent(surface,update,{direction:film?-1:1});else update();caseReady=true;
});
pickCase(1);
let activeClip='watch-volume';
$$('[data-select-clip]').forEach(button=>button.addEventListener('click',()=>{
 const key=button.dataset.selectClip,clip=clips[key];if(!clip||key===activeClip)return;
 watchVideo.pause();activeClip=key;watchVideo.poster=clip.poster;watchVideo.src=clipSource(clip);watchVideo.setAttribute('aria-label',clip.project+'：'+clip.label+'项目解说');watchVideo.load();
 $$('[data-select-clip]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
 $('[data-clip-note="watch"]').textContent=clip.note;pickCase(0);
}));
let methodIndex=-1;
const pickMethod=bindTabs($$('[data-method]'),(_,index)=>{
 const step=methodSteps[index],panel=$('#method-panel');
 const update=()=>{
 methodLab?.select(index);
 panel.setAttribute('aria-labelledby','method-tab-'+index);
 $('[data-quality-step]').dataset.qualityStep=String(index);$('[data-quality-label]').textContent=step.label;
 $('[data-method-count]').textContent=String(index+1).padStart(2,'0')+' / 04';
 $('[data-method-title]').textContent=step.title;$('[data-method-description]').textContent=step.description;
 const list=$('[data-method-list]');list.replaceChildren(...step.checks.map(text=>{const li=document.createElement('li');li.textContent=text;return li;}));
 $('[data-method-position]').textContent=String(index+1).padStart(2,'0')+' / 04';
 $('[data-method-prev]').disabled=index===0;$('[data-method-next]').disabled=index===methodSteps.length-1;
 };
 if(methodIndex<0)update();else transitionContent($('.method-copy'),update,{direction:index>methodIndex?1:-1});
 methodIndex=index;
});
pickMethod(2);
function moveMethod(direction,button){
 pickMethod(Math.max(0,Math.min(methodSteps.length-1,methodIndex+direction)));
 if(button.disabled)$(direction>0?'[data-method-prev]':'[data-method-next]').focus({preventScroll:true});
}
$('[data-method-prev]').addEventListener('click',event=>moveMethod(-1,event.currentTarget));
$('[data-method-next]').addEventListener('click',event=>moveMethod(1,event.currentTarget));
// Reserve the tallest of the four real texts, so the inspection canvas never jumps.
let methodCopyWidth=0;
function reserveMethodSpace(force=false){
 const copy=$('.method-copy'),width=Math.round(copy.getBoundingClientRect().width);
 if(!width||(!force&&width===methodCopyWidth))return;methodCopyWidth=width;
 const measure=copy.cloneNode(true);measure.inert=true;measure.setAttribute('aria-hidden','true');
 Object.assign(measure.style,{position:'absolute',visibility:'hidden',pointerEvents:'none',width:width+'px',minHeight:'0',left:'0',top:'0'});
 copy.parentElement.append(measure);let height=0;
 for(const step of methodSteps){
  $('[data-method-title]',measure).textContent=step.title;$('[data-method-description]',measure).textContent=step.description;
  $('[data-method-list]',measure).replaceChildren(...step.checks.map(text=>{const li=document.createElement('li');li.textContent=text;return li;}));
  height=Math.max(height,measure.getBoundingClientRect().height);
 }
 measure.remove();copy.style.minHeight=Math.ceil(height)+'px';
}
document.fonts.ready.then(()=>reserveMethodSpace(true));
new ResizeObserver(()=>reserveMethodSpace()).observe($('#method-panel'));
initFooterScene($('[data-footer-scene]'),reduced);
const dialog=$('#video-dialog'),dialogVideo=$('#dialog-video');
const videoMotion=createDialogMotion(dialog,{reduced});
let lastTrigger=null,bodyOverflow='';
function openVideo(key,trigger){
 const clip=clips[key];if(!clip)return;
 lastTrigger=trigger;players.pauseAll(dialogVideo);$('#video-dialog-title').textContent=clip.project+' · '+clip.label;
 $('[data-dialog-note]').textContent=clip.note+' 运行演示请从对应案例入口打开。';
 dialogVideo.src=clipSource(clip);dialogVideo.poster=clip.poster;dialogVideo.load();
 if(!dialog.open)bodyOverflow=document.body.style.overflow;document.body.style.overflow='hidden';videoMotion.open();$('[data-close-video]').focus();
 players.activate(dialogVideo);
}
function closeVideo(){dialogVideo.pause();videoMotion.close();}
$$('[data-open-video]').forEach(b=>b.addEventListener('click',()=>openVideo(b.dataset.openVideo,b)));
$$('[data-open-current]').forEach(b=>b.addEventListener('click',()=>openVideo(activeClip,b)));
$('[data-close-video]').addEventListener('click',closeVideo);
dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const b=dialog.getBoundingClientRect();if(event.clientX<b.left||event.clientX>b.right||event.clientY<b.top||event.clientY>b.bottom)closeVideo();});
dialog.addEventListener('close',()=>{if(dialog.open)return;dialogVideo.pause();dialogVideo.removeAttribute('src');dialogVideo.load();document.body.style.overflow=bodyOverflow;lastTrigger?.focus({preventScroll:true});});
document.addEventListener('player:expand',event=>{
 const video=event.detail?.video;
 if(video?.id==='hero-video')openVideo('watch-volume',players.get(video).root.querySelector('.ep-expand'));
 else if(video?.id==='watch-video')openVideo(activeClip,players.get(video).root.querySelector('.ep-expand'));
});
let copyTimer;
$('[data-copy-email]').addEventListener('click',async event=>{
 const status=$('[data-copy-status]'),button=event.currentTarget;try{await navigator.clipboard.writeText('2679799093@qq.com');status.textContent='邮箱已复制，期待聊聊你的想法。';button.textContent='已复制邮箱';button.dataset.copied='true';clearTimeout(copyTimer);copyTimer=setTimeout(()=>{button.textContent='复制邮箱';delete button.dataset.copied;},2600);}catch{status.textContent='请直接选取上方邮箱复制，或点击“联系我”写信。';}
});
const exhibit=$('[data-exhibit]'),plane=$('.exhibit-plane');
let frame=0,pointer={x:0,y:0},current={x:0,y:0},visible=true,bounds,lastTime=0;
const fine=matchMedia('(hover:hover) and (pointer:fine) and (min-width:1101px)');
function resetPlane(){if(frame)cancelAnimationFrame(frame);frame=0;lastTime=0;pointer={x:0,y:0};current={x:0,y:0};plane.style.removeProperty('--rx');plane.style.removeProperty('--ry');plane.style.removeProperty('will-change');}
function paint(now){
 frame=0;if(reduced.matches||!fine.matches||!visible||document.hidden){resetPlane();return;}
 const dt=lastTime?Math.min(40,now-lastTime):16.67,alpha=1-Math.exp(-dt/95);lastTime=now;
 current.x+=(pointer.x-current.x)*alpha;current.y+=(pointer.y-current.y)*alpha;
 const moving=Math.abs(pointer.x-current.x)+Math.abs(pointer.y-current.y)>.001;
 if(!moving)current={...pointer};
 plane.style.setProperty('--rx',(-current.y*.7).toFixed(3)+'deg');plane.style.setProperty('--ry',(current.x*1.1).toFixed(3)+'deg');
 if(moving)frame=requestAnimationFrame(paint);else{lastTime=0;plane.style.removeProperty('will-change');}
}
function schedule(){if(!frame){plane.style.willChange='transform';frame=requestAnimationFrame(paint);}}
exhibit.addEventListener('pointerenter',()=>{bounds=exhibit.getBoundingClientRect();},{passive:true});
exhibit.addEventListener('pointermove',event=>{if(!fine.matches||reduced.matches||document.hidden)return;const b=bounds||exhibit.getBoundingClientRect();pointer={x:Math.max(-1,Math.min(1,(event.clientX-b.left)/b.width*2-1)),y:Math.max(-1,Math.min(1,(event.clientY-b.top)/b.height*2-1))};schedule();},{passive:true});
exhibit.addEventListener('pointerleave',()=>{pointer={x:0,y:0};schedule();});
new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(!visible)resetPlane();},{threshold:.05}).observe(exhibit);
new ResizeObserver(()=>{bounds=null;resetPlane();}).observe(exhibit);
addEventListener('scroll',()=>{bounds=null;},{passive:true});
reduced.addEventListener('change',resetPlane);fine.addEventListener('change',resetPlane);
document.addEventListener('visibilitychange',()=>{if(document.hidden)resetPlane();});
entrance.ready.then(()=>{if(!reduced.matches)document.body.classList.add('intro-ready');});

// A paper leaf opens from its place in the strip and returns to that place.
const comicViewer=createComicViewer({reduced});
const comicButtons=$$('[data-open-comic]');
initComicPaper($('.comic-excerpt'),{reduced});
const comicItems=comicButtons.map(button=>({
 source:()=>button,
 caption:$('figcaption',button.closest('figure')).textContent.trim().replace(/^\d+\s*/,''),
 render(){const frame=document.createElement('div');frame.append(...[...button.children].map(child=>child.cloneNode(true)));$('img',frame).loading='eager';return frame;}
}));
comicButtons.forEach((button,index)=>button.addEventListener('click',()=>comicViewer.open({items:comicItems,index,title:'本来只是比个价',opener:button})));

