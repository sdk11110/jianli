// A single, finite typesetting sequence. Default HTML stays readable without JS.
export function initHeroType(title, reduced) {
 if (!title || !Element.prototype.animate) return {play(){}};
 const pieces=[...title.querySelectorAll('[data-type]')];
 const trigger=title.querySelector('.type-trigger');
 const stroke=title.querySelector('.type-stroke');
 const cue=title.querySelector('.type-cue');
 const ease='cubic-bezier(.16,1,.3,1)';
 let active=[],generation=0,visible=true;
 title.dataset.typeState='idle';
 function settle(){
  generation++;
  active.forEach(animation=>animation.cancel());active=[];
  title.dataset.typeState='idle';
 }
 function animate(element,frames,duration,delay=0){
  const animation=element.animate(frames,{duration,delay,easing:ease,fill:'backwards'});
  active.push(animation);return animation;
 }
 function play(){
  settle();
  if(reduced.matches||document.hidden||!visible)return;
  const current=generation;
  title.dataset.typeState='playing';
  let lead=0,build=0,stamp=0;
  pieces.forEach(piece=>{
   const kind=piece.dataset.type;
   if(kind==='lead'){
    const index=lead++;
    animate(piece,[{transform:`perspective(500px) translate3d(${index?-10:0}px,18px,0) rotateX(65deg) rotate(${-5+index*3}deg)`,opacity:.25},{transform:'none',opacity:1}],470,index*68);
   }else if(kind==='ai'){
    animate(piece,[{transform:'perspective(500px) rotateY(-80deg) translateZ(24px)',color:'#1649f2',textShadow:'5px 5px 0 #1649f224'},{transform:'perspective(500px) rotateY(7deg) translateZ(0)',color:'#1649f2',offset:.7},{transform:'none',color:'#1649f2',textShadow:'0 0 0 transparent'}],620,45);
   }else if(kind==='build'){
    const index=build++;
    animate(piece,[{transform:'translate3d(0,70%,0) rotate(5deg)',clipPath:'inset(0 0 100% 0)'},{transform:'none',clipPath:'inset(0 0 0 0)'}],480,250+index*58);
   }else if(kind==='stamp'){
    const index=stamp++;
    animate(piece,[{transform:'translate3d(0,-20px,0) scale(1.13)',opacity:.2,textShadow:'3px 8px 0 #1649f22b'},{transform:'translate3d(0,2px,0) scale(1.025,.95)',opacity:1,textShadow:'0 0 0 transparent',offset:.62},{transform:'none',opacity:1,textShadow:'0 0 0 transparent'}],420,465+index*60);
   }else{
    animate(piece,[{transform:'translate3d(-10px,-12px,0) scale(.7)',color:'#df5814',opacity:.2},{transform:'translate3d(1px,0,0) scale(1.08)',color:'#df5814',opacity:1,offset:.65},{transform:'none',color:'#171713',opacity:1}],350,650);
   }
  });
  animate(stroke,[{transform:'rotate(-1.6deg) scaleX(0)'},{transform:'rotate(-1.6deg) scaleX(1)'}],390,530);
  animate(cue,[{transform:'rotate(-90deg) scale(.3)',opacity:.2},{transform:'rotate(0) scale(1)',opacity:1}],400,530);
  Promise.all(active.map(animation=>animation.finished.catch(()=>{}))).then(()=>{
   if(current===generation)settle();
  });
 }
 trigger.addEventListener('click',play);
 // A hover nudges only the AI block; it never restarts the whole heading.
 trigger.addEventListener('pointerenter',event=>{
  if(event.pointerType!=='mouse'||reduced.matches||title.dataset.typeState==='playing')return;
  settle();const current=generation;
  const animation=animate(trigger.querySelector('[data-type]'),[{transform:'none'},{transform:'perspective(500px) rotateY(-12deg) translateY(-2px)',offset:.5},{transform:'none'}],340);
  animation.finished.then(()=>{if(current===generation)settle();}).catch(()=>{});
 });
 reduced.addEventListener('change',settle);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)settle();});
 new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(!visible)settle();},{threshold:.1}).observe(title);
 return {play};
}
