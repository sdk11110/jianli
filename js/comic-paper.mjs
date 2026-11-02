const frameSelector='button.excerpt-frame,button.story-image-wrap';
const fields=['x','y','lift','rx','ry','rz','scale'];
const rests=[-.28,.22,-.2];

/** The panels are paper objects; the original artwork is never split or cropped. */
export function initComicPaper(root,{reduced=matchMedia('(prefers-reduced-motion: reduce)')}={}) {
  if(!root)return {refresh(){},destroy(){}};
  const existing=root.__comicPaper;
  if(existing)return existing;
  const fine=matchMedia('(hover:hover) and (pointer:fine)');
  const states=new Map(),active=new Set(),pressedPointers=new Map(),listeners=[];
  let frame=0,previousTime=0,destroyed=false;
  const on=(target,type,handler,options)=>{target.addEventListener(type,handler,options);listeners.push(()=>target.removeEventListener(type,handler,options));};
  const neutral=state=>({x:0,y:0,lift:0,rx:0,ry:0,rz:state.rest,scale:1});
  const mayMove=()=>!reduced.matches&&!document.hidden&&!destroyed;

  function paint(state){
    const value=state.value,style=state.element.style;
    style.setProperty('--paper-x',value.x.toFixed(3)+'px');
    style.setProperty('--paper-y',(value.y-value.lift).toFixed(3)+'px');
    style.setProperty('--paper-rx',value.rx.toFixed(3)+'deg');
    style.setProperty('--paper-ry',value.ry.toFixed(3)+'deg');
    style.setProperty('--paper-rz',value.rz.toFixed(3)+'deg');
    style.setProperty('--paper-scale',value.scale.toFixed(5));
  }
  function cancelDialogue(state){
    state.bubbles.forEach(animation=>animation.cancel());state.bubbles=[];
  }
  function mark(state){
    const engaged=state.hovered||state.focused;
    state.element.classList.toggle('is-paper-engaged',engaged);
    state.element.classList.toggle('is-paper-pressed',state.pressed);
    state.figure?.classList.toggle('is-paper-engaged',engaged);
  }
  function reset(state){
    state.hovered=false;state.focused=false;state.pressed=false;state.bounds=null;
    state.point={x:0,y:0};state.value=neutral(state);state.target=neutral(state);
    state.velocity=Object.fromEntries(fields.map(key=>[key,0]));
    cancelDialogue(state);active.delete(state);mark(state);
    state.element.classList.remove('is-paper-moving');paint(state);
    for(const [id,pressed] of pressedPointers)if(pressed===state)pressedPointers.delete(id);
  }
  function resetAll(){
    if(frame)cancelAnimationFrame(frame);frame=0;previousTime=0;
    states.forEach(reset);pressedPointers.clear();
  }
  function schedule(state){
    if(!mayMove()||!state.visible){reset(state);return;}
    active.add(state);state.element.classList.add('is-paper-moving');
    if(!frame)frame=requestAnimationFrame(tick);
  }
  function target(state){
    const value=neutral(state),hover=state.hovered&&fine.matches;
    if(mayMove()&&state.visible){
      if(hover){
        value.x=state.point.x*2;value.y=state.point.y*1.4;
        value.rx=-state.point.y*1.3;value.ry=state.point.x*1.3;
        value.rz+=state.point.x*.12;value.lift=7;
      }else if(state.focused)value.lift=3.5;
      if(state.pressed){value.scale=.99;value.lift=Math.min(value.lift,2.5);value.rx*=.35;value.ry*=.35;}
    }
    state.target=value;mark(state);
    if(!mayMove()){state.value=value;paint(state);return;}
    schedule(state);
  }
  function tick(time){
    frame=0;if(!mayMove()){resetAll();return;}
    const dt=previousTime?Math.min(.032,Math.max(.004,(time-previousTime)/1000)):1/60;
    previousTime=time;
    for(const state of active){
      // The viewer owns visibility while a sheet travels to its reading position.
      if(!state.element.isConnected||!state.visible||state.element.classList.contains('comic-source-hidden')||state.element.style.visibility==='hidden'){
        reset(state);continue;
      }
      let settled=true;
      for(const key of fields){
        const delta=state.target[key]-state.value[key];
        const stiffness=key==='scale'?300:190,damping=key==='scale'?30:23;
        state.velocity[key]+=(delta*stiffness-state.velocity[key]*damping)*dt;
        state.value[key]+=state.velocity[key]*dt;
        const tolerance=key==='scale'?.00004:.004;
        if(Math.abs(delta)>tolerance||Math.abs(state.velocity[key])>tolerance*8)settled=false;
      }
      if(settled){state.value={...state.target};active.delete(state);state.element.classList.remove('is-paper-moving');}
      paint(state);
    }
    if(active.size)frame=requestAnimationFrame(tick);else previousTime=0;
  }
  function greet(state){
    cancelDialogue(state);
    if(!mayMove()||!state.visible)return;
    const bubbles=[...state.element.querySelectorAll('.excerpt-bubble,.excerpt-reply,.story-dialogue p')];
    state.bubbles=bubbles.map((bubble,index)=>{
      const animation=bubble.animate([
        {translate:'0 2px',scale:'.995'},
        {translate:'0 -1px',scale:'1.018',offset:.66},
        {translate:'0 0',scale:'1'},
      ],{duration:350,delay:Math.min(index,1)*75,easing:'cubic-bezier(.16,1,.3,1)'});
      animation.finished.catch(()=>{});return animation;
    });
  }
  function stateFor(node){
    if(!(node instanceof Element))return null;
    const element=node.closest(frameSelector);
    return element&&root.contains(element)?states.get(element):null;
  }
  function point(state,event){
    const bounds=state.bounds||=state.element.getBoundingClientRect();
    if(!bounds.width||!bounds.height)return;
    state.point={x:Math.max(-1,Math.min(1,(event.clientX-bounds.left)/bounds.width*2-1)),y:Math.max(-1,Math.min(1,(event.clientY-bounds.top)/bounds.height*2-1))};
  }
  const visibility=new IntersectionObserver(entries=>{
    for(const entry of entries){const state=states.get(entry.target);if(!state)continue;state.visible=entry.isIntersecting;if(!state.visible)reset(state);}
  },{threshold:.02});
  function refresh(){
    if(destroyed)return;
    for(const [element,state] of states){
      if(!root.contains(element)){reset(state);visibility.unobserve(element);state.figure?.classList.remove('comic-paper-figure','is-paper-engaged');states.delete(element);}
    }
    [...root.querySelectorAll(frameSelector)].forEach((element,index)=>{
      const inert=element.closest('[inert]');
      if(element.closest('.story-turn-snapshot')||(inert&&root.contains(inert))||states.has(element))return;
      const state={element,figure:element.closest('figure'),rest:rests[index%rests.length],visible:true,hovered:false,focused:false,pressed:false,bounds:null,point:{x:0,y:0},bubbles:[]};
      states.set(element,state);element.classList.add('comic-paper');state.figure?.classList.add('comic-paper-figure');reset(state);visibility.observe(element);
    });
  }
  on(root,'pointerover',event=>{
    if(event.pointerType==='touch'||!fine.matches)return;
    const state=stateFor(event.target);if(!state||state===stateFor(event.relatedTarget))return;
    state.bounds=null;point(state,event);state.hovered=true;target(state);greet(state);
  },{passive:true});
  on(root,'pointermove',event=>{
    if(event.pointerType==='touch'||!fine.matches)return;
    const state=stateFor(event.target);if(!state)return;
    point(state,event);state.hovered=true;target(state);
  },{passive:true});
  on(root,'pointerout',event=>{
    const state=stateFor(event.target);if(!state||state===stateFor(event.relatedTarget))return;
    state.hovered=false;state.bounds=null;cancelDialogue(state);target(state);
  },{passive:true});
  on(root,'pointerdown',event=>{
    if(event.isPrimary===false)return;
    const state=stateFor(event.target);if(!state)return;
    state.pressed=true;pressedPointers.set(event.pointerId,state);target(state);
  },{passive:true});
  function release(event){
    const state=pressedPointers.get(event.pointerId);if(!state)return;
    pressedPointers.delete(event.pointerId);state.pressed=false;target(state);
  }
  on(window,'pointerup',release,{passive:true});on(window,'pointercancel',release,{passive:true});
  on(root,'focusin',event=>{const state=stateFor(event.target);if(!state)return;state.focused=true;target(state);if(!state.hovered)greet(state);});
  on(root,'focusout',event=>{const state=stateFor(event.target);if(!state)return;state.focused=false;state.pressed=false;cancelDialogue(state);target(state);});
  on(root,'keydown',event=>{if(event.key!==' '&&event.key!=='Enter')return;const state=stateFor(event.target);if(state){state.pressed=true;target(state);}});
  on(root,'keyup',event=>{if(event.key!==' '&&event.key!=='Enter')return;const state=stateFor(event.target);if(state){state.pressed=false;target(state);}});
  on(window,'scroll',()=>{if(active.size||[...states.values()].some(state=>state.hovered))resetAll();},{passive:true});
  on(window,'resize',resetAll,{passive:true});on(document,'visibilitychange',()=>{if(document.hidden)resetAll();});
  on(window,'pagehide',resetAll);on(reduced,'change',resetAll);on(fine,'change',resetAll);
  const mutation=new MutationObserver(refresh);mutation.observe(root,{childList:true,subtree:true});
  const resize=new ResizeObserver(()=>{states.forEach(state=>state.bounds=null);});resize.observe(root);
  const api={
    refresh,
    destroy(){
      if(destroyed)return;resetAll();destroyed=true;mutation.disconnect();resize.disconnect();visibility.disconnect();listeners.forEach(remove=>remove());
      for(const state of states.values()){
        state.element.classList.remove('comic-paper','is-paper-moving','is-paper-engaged','is-paper-pressed');state.figure?.classList.remove('comic-paper-figure','is-paper-engaged');
        for(const name of ['x','y','rx','ry','rz','scale'])state.element.style.removeProperty('--paper-'+name);
      }
      states.clear();delete root.__comicPaper;
    },
  };
  root.__comicPaper=api;refresh();return api;
}
