(() => {
  'use strict';
  const $=s=>document.querySelector(s), reduced=matchMedia('(prefers-reduced-motion:reduce)');
  const hero=$('.weavy-hero'),art=$('[data-scene-art]'),plane=$('#heroVideoPlayer');
  const phases=['vision','prompt','seedance','upscale','ffmpeg','audio','done'];
  const labels=['教材识读','设计分镜','生成画面','提升画质','拼接画面','配音配乐','成片'];
  const explanations=[
    '输入教材原页，整理角色、情景、教学语句与页面顺序。确认教材理解后，再组织分镜。',
    '把教材约束转成可执行的动态分镜，将对白、镜头和提示词一起封装为 Skill；人工确认后再生成。',
    '按已确认的分镜查看对应生成片段。检查语境、角色和运动；问题退回本步修正。',
    '对照原片与超分结果检查清晰度和运动细节，再进入后期拼接。',
    '将各幕镜头衔接成连续画面，检查顺序、时长与首尾关系。',
    '将教材发音、台词时间与背景音乐对应起来。人工确认音画和发音后，再输出成片。',
    '检查最终画面、声音和教学内容，完成模拟验收；真实五幕成片保留在画面右侧。'
  ];
  const sourceQuad=[[1228,427.238],[1746.896,349.685],[1760.195,708.547],[1228,704.683]];
  function solve(matrix){
    for(let i=0;i<8;i++){
      let pivot=i;for(let j=i+1;j<8;j++)if(Math.abs(matrix[j][i])>Math.abs(matrix[pivot][i]))pivot=j;
      [matrix[i],matrix[pivot]]=[matrix[pivot],matrix[i]];const d=matrix[i][i];if(Math.abs(d)<1e-9)return null;
      for(let k=i;k<=8;k++)matrix[i][k]/=d;
      for(let j=0;j<8;j++){if(j===i)continue;const f=matrix[j][i];for(let k=i;k<=8;k++)matrix[j][k]-=f*matrix[i][k];}
    }return matrix.map(r=>r[8]);
  }
  function mapVideo(){
    if(document.fullscreenElement===plane||plane.closest(".film-focus"))return;
    const w=hero.clientWidth,h=hero.clientHeight,scale=Math.max(w/1844,h/853),ox=(w-1844*scale)/2,oy=(h-853*scale)/2;
    const dest=sourceQuad.map(([x,y])=>[x*scale+ox,y*scale+oy]);
    const src=[[0,0],[640,0],[640,360],[0,360]],m=[];
    src.forEach(([x,y],i)=>{const [u,v]=dest[i];m.push([x,y,1,0,0,0,-u*x,-u*y,u],[0,0,0,x,y,1,-v*x,-v*y,v]);});
    const q=solve(m);if(!q)return;const [a,b,c,d,e,f,g,hv]=q;
    plane.style.transform=`matrix3d(${[a,d,0,g,b,e,0,hv,0,0,1,0,c,f,0,1].join(',')})`;
    hero.dataset.sceneReady='true';
  }
  new ResizeObserver(mapVideo).observe(hero);document.addEventListener('fullscreenchange',mapVideo);mapVideo();

  let focusLayer=null,returnParent=null,returnSibling=null,previousOverflow='';
  function closeFocus(){
    if(!focusLayer)return;
    if(returnSibling?.parentNode===returnParent)returnParent.insertBefore(plane,returnSibling);else returnParent.append(plane);
    focusLayer.remove();focusLayer=null;document.body.style.overflow=previousOverflow;mapVideo();$('#heroExpand').focus({preventScroll:true});
  }
  function openFocus(){
    returnParent=plane.parentNode;returnSibling=plane.nextSibling;previousOverflow=document.body.style.overflow;
    focusLayer=document.createElement('section');focusLayer.className='film-focus';focusLayer.setAttribute('role','dialog');focusLayer.setAttribute('aria-modal','true');focusLayer.setAttribute('aria-label','放大观看真实教学成片');
    focusLayer.innerHTML='<p class="film-focus-title">真实教学成片 · 本地样片</p><button type="button" class="film-focus-close">收起画面 ×</button>';
    document.body.append(focusLayer);focusLayer.append(plane);document.body.style.overflow='hidden';
    focusLayer.querySelector('button').addEventListener('click',closeFocus);focusLayer.querySelector('button').focus();
  }
  $('#heroExpand').addEventListener('click',async event=>{
    event.preventDefault();event.stopImmediatePropagation();
    if(focusLayer){closeFocus();return;}
    if(document.fullscreenElement){await document.exitFullscreen();return;}
    // Open the in-page viewer synchronously; embedded browsers may never settle native fullscreen.
    openFocus();
  },true);
  document.addEventListener('keydown',event=>{
    if(!focusLayer)return;
    if(event.key==='Escape'){event.preventDefault();closeFocus();return;}
    if(event.key==='Tab'){
      const controls=[...focusLayer.querySelectorAll('button,input,a[href]')].filter(e=>!e.disabled&&e.getBoundingClientRect().width>0);
      const index=controls.indexOf(document.activeElement);if(event.shiftKey&&index===0){event.preventDefault();controls.at(-1).focus();}else if(!event.shiftKey&&index===controls.length-1){event.preventDefault();controls[0].focus();}
    }
  });

  const info=$('#nodeInfo');let lastNode=null;
  function closeInfo(){info.hidden=true;lastNode?.setAttribute('aria-expanded','false');}
  document.querySelectorAll('[data-node]').forEach(button=>{
    button.setAttribute('aria-controls','nodeInfo');button.setAttribute('aria-expanded','false');
    button.addEventListener('click',()=>{
      const index=phases.indexOf(button.dataset.node);const same=lastNode===button&&!info.hidden;closeInfo();if(same)return;
      lastNode=button;button.setAttribute('aria-expanded','true');info.querySelector('h2').textContent=labels[index];info.querySelector('p').textContent=explanations[index];info.hidden=false;
    });
  });
  $('.node-info-close').addEventListener('click',()=>{closeInfo();lastNode?.focus({preventScroll:true});});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!info.hidden){closeInfo();lastNode?.focus({preventScroll:true});}});
  $('[data-open-review]').addEventListener('click',()=>{
    closeInfo();const target=$('#reviewGate').hidden?$('#tech'):$('#reviewGate');
    if(target.tagName==='DETAILS')target.open=true;
    target.scrollIntoView({behavior:reduced.matches?'auto':'smooth',block:'center'});
  });
  const path=$('.flow-base'),token=$('.flow-traveler');let tokenFrame=0,lastIndex=0,outputAnimation;
  function stopToken(){cancelAnimationFrame(tokenFrame);tokenFrame=0;token.classList.remove('is-moving');}
  function travel(index){
    stopToken();if(reduced.matches||document.hidden||!heroVisible){lastIndex=index;return;}
    const from=lastIndex/6,to=index/6,length=path.getTotalLength();lastIndex=index;let start;
    token.classList.add('is-moving');
    function tick(now){start??=now;const t=Math.min(1,(now-start)/460),ease=1-Math.pow(1-t,4),p=path.getPointAtLength((from+(to-from)*ease)*length);token.setAttribute('cx',p.x);token.setAttribute('cy',p.y);if(t<1)tokenFrame=requestAnimationFrame(tick);else stopToken();}
    tokenFrame=requestAnimationFrame(tick);
  }
  let heroVisible=true;
  function renderState(state){
    const phase=state.reviewPhase||state.phase,index=phase==='select'?0:phase==='finalize'?6:Math.max(0,phases.indexOf(phase));
    document.querySelectorAll('[data-node]').forEach((button,i)=>{
      const done=state.completed.includes(phases[i])||(i===6&&state.done);
      button.classList.toggle('is-current',i===index);button.classList.toggle('is-complete',done);
      if(i===index)button.setAttribute('aria-current','step');else button.removeAttribute('aria-current');
    });
    $('[data-dock-current]').textContent=(state.reviewPhase?'待审核：':state.running?'正在演示：':'当前：')+(phase==='select'?'选择教材':labels[index]);
    $('[data-dock-count]').textContent=String(index+1).padStart(2,'0')+' / 07';
    $('[data-open-review]').classList.toggle('is-pending',!!state.reviewPhase);
    hero.dataset.phase=phase;hero.dataset.running=String(state.running);
    if(index!==lastIndex)travel(index);
    document.body.dataset.workbenchReady='true';
  }
  addEventListener('textbook:state',event=>renderState(event.detail));
  const output=$('#outputBody');
  new MutationObserver(()=>{
    outputAnimation?.cancel();if(document.hidden||!output.getBoundingClientRect().height)return;
    outputAnimation=output.animate(reduced.matches?[{opacity:.75},{opacity:1}]:[{opacity:.7,clipPath:'inset(0 4% 0 0)',transform:'translateX(6px)'},{opacity:1,clipPath:'inset(0)',transform:'none'}],{duration:reduced.matches?100:250,easing:'cubic-bezier(.16,1,.3,1)'});
  }).observe(output,{childList:true});
  // Pointer movement shifts the printed scene and its real video together. The spring sleeps at rest.
  let pointerFrame=0,x=0,y=0,vx=0,vy=0,tx=0,ty=0,last=0;
  function resetPose(){cancelAnimationFrame(pointerFrame);pointerFrame=0;x=y=vx=vy=tx=ty=0;art.style.transform='';}
  function spring(now){
    const dt=Math.min(2,(now-(last||now))/16.667);last=now;
    vx+=(tx-x)*.09*dt;vy+=(ty-y)*.09*dt;vx*=Math.pow(.70,dt);vy*=Math.pow(.70,dt);x+=vx*dt;y+=vy*dt;
    art.style.transform=`translate3d(${x.toFixed(3)}px,${y.toFixed(3)}px,0)`;
    if(Math.abs(tx-x)+Math.abs(ty-y)+Math.abs(vx)+Math.abs(vy)>.015)pointerFrame=requestAnimationFrame(spring);else{pointerFrame=0;last=0;}
  }
  function startSpring(){if(!pointerFrame){last=0;pointerFrame=requestAnimationFrame(spring);}}
  hero.addEventListener('pointermove',event=>{if(reduced.matches||!heroVisible||document.hidden||!matchMedia('(hover:hover) and (pointer:fine)').matches)return;const rect=hero.getBoundingClientRect();tx=(event.clientX/rect.width-.5)*5;ty=((event.clientY-rect.top)/rect.height-.5)*3;startSpring();},{passive:true});
  hero.addEventListener('pointerleave',()=>{tx=ty=0;if(x||y)startSpring();});
  new IntersectionObserver(([entry])=>{heroVisible=entry.isIntersecting;if(!heroVisible){resetPose();stopToken();closeInfo();}},{threshold:0}).observe(hero);
  function stop(){resetPose();stopToken();outputAnimation?.cancel();}
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});reduced.addEventListener('change',()=>{stop();mapVideo();});
})();
