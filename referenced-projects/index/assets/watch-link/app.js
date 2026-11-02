const WORDS = [
  { word:'woof', zh:'吠叫', phonetic:'/wʊf/', trimEnd:1 },
  { word:'sound', zh:'声音', phonetic:'/saʊnd/' },
  { word:'dolphin', zh:'海豚', phonetic:'/ˈdɒlfɪn/' },
  { word:'year', zh:'年', phonetic:'/jɪə(r)/' },
  { word:'pain', zh:'疼痛', phonetic:'/peɪn/' },
  { word:'zebra', zh:'斑马', phonetic:'/ˈzebrə/' },
  { word:'wolf', zh:'狼', phonetic:'/wʊlf/' }
];
const STAGES = [
  {title:'素材输入',description:'把单词、图片、发音和制作参数对应起来。先建立清楚的任务映射，让后续生成与返修都能找到原始素材。',ownership:'我的设计：统一输入结构、命名与任务关系。',input:'单词 · 图片 · 发音',output:'对应到单词的制作任务',check:'检查点：素材与词义一致，输入完整，文件能追溯。'},
  {title:'图生视频',description:'将图生视频接入整批任务，按制作要求组织生成与结果回收，让每次制作沿用同一条路径。',ownership:'我的设计：组织可重复执行的生成链路。',input:'素材与制作要求',output:'待检查的生成片段',check:'检查点：画面主体、动作与词义匹配；生成后仍需审核。'},
  {title:'语音字幕',description:'将发音、英文词和中文释义绑定到画面，按统一的时间与安全区规则进行编排。',ownership:'我的设计：明确音画对应与字幕呈现要求。',input:'视频 · 发音 · 释义',output:'带语音与字幕的成片',check:'检查点：音画同步、文字可读、内容对应，避免挤出小屏。'},
  {title:'预览质检',description:'把内容放回目标设备比例逐条查看，定位主体裁切、黑边、文字、音频及首尾帧等问题，再推动返修。',ownership:'我的设计：定义检查标准，衔接问题与返修。',input:'待审成片',output:'问题记录与返修要求',check:'检查点：生成完成只是制作节点，审核与返修继续保留。'},
  {title:'视频裁剪',description:'按设备画幅与播放要求调整入点、出点和画面焦点，将生成素材收束成适合电话手表观看的版本。',ownership:'我的设计：明确裁剪与主体安全区要求。',input:'通过检查的内容',output:'适配小屏的设备版本',check:'检查点：目标画幅、时长、主体焦点与字幕安全区。'},
  {title:'规格交付',description:'统一编码、尺寸、命名与目录，把制作结果组织成下游可以继续使用的最终文件。',ownership:'我的设计：设定统一交付出口并推进完整交付。',input:'设备版本与交付要求',output:'规格统一的最终文件',check:'检查点：格式、文件名、目录和数量完整，交付有据可查。'}
];
const $ = (s,r=document)=>r.querySelector(s);
const $$ = (s,r=document)=>[...r.querySelectorAll(s)];
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const state = {word:0,stage:0,sound:true,manualPause:false,visible:false,playRequest:0,queuedPlay:false};
const video = $('[data-screen-video]');
const watchScreen = $('[data-watch-screen]');
const status = $('[data-media-state]');
const stageRegion = $('[data-device-stage]');
let observed = false;

function syncPlayback(){
  const playing = !video.paused && !video.ended;
  watchScreen.classList.toggle('is-paused',!playing);
  $('[data-screen-control]').setAttribute('href',playing?'#pause':'#play');
  $('[data-play-control]').setAttribute('href',playing?'#pause':'#play');
  $('[data-play-label]').textContent=playing?'暂停':state.sound?'有声播放':'播放';
  watchScreen.setAttribute('aria-label',playing?'暂停成片':state.sound?'播放有声成片':'播放成片');
}
async function play(){
  const request=++state.playRequest;
  state.manualPause=false;
  video.muted=!state.sound;
  try{await video.play(); if(request===state.playRequest)status.textContent='正在播放 · '+WORDS[state.word].word;}
  catch(error){if(request!==state.playRequest||error.name==='AbortError')return;status.textContent=error.name==='NotAllowedError'?'点击播放，听听看。':'播放未能开始，请再次点击播放。';syncPlayback();}
}
function pause(manual=false){const wasPlaying=!video.paused;state.playRequest++;if(manual){state.manualPause=true;state.queuedPlay=false;}video.pause();syncPlayback();if(wasPlaying)status.textContent='已暂停 · 随时继续';}
function togglePlayback(){if(video.paused)play();else{pause(true);status.textContent='已暂停 · 随时继续';}}

function selectWord(index,{playNow=false}={}){
  const wasPlaying=!video.paused;
  pause();state.word=(index+WORDS.length)%WORDS.length;
  const word=WORDS[state.word];
  $$('[data-word-index]').forEach((button,i)=>button.setAttribute('aria-pressed',String(i===state.word)));
  $('[data-stage-word]').textContent=word.word;
  $('[data-screen-word]').textContent=word.word;
  $('[data-screen-phonetic]').textContent=word.phonetic;
  $('[data-screen-zh]').textContent=word.zh;
  $('[data-caption-word]').textContent=word.word;
  $('[data-caption-zh]').textContent=word.zh;
  $('[data-screen-counter]').textContent=String(state.word+1).padStart(2,'0')+' / 07';
  video.poster='media/stills/'+word.word+'.jpg';
  video.src='media/'+word.word+'.mp4';video.muted=!state.sound;video.loop=true;video.load();
  watchScreen.classList.remove('is-switching');
  if(!reduced.matches){void watchScreen.offsetWidth;watchScreen.classList.add('is-switching');}
  status.textContent='已选择 '+word.word+' · '+word.zh;
  syncPlayback();
  if(playNow||wasPlaying){if(state.visible)play();else{state.queuedPlay=true;stageRegion.scrollIntoView({behavior:reduced.matches?'auto':'smooth',block:'center'});}}
}
function renderWords(){
  $('[data-word-list]').innerHTML=WORDS.map((word,i)=>`<button type="button" data-word-index="${i}" aria-pressed="${i===0}" aria-label="播放 ${word.word}，${word.zh}"><div class="word-image"><img src="media/stills/${word.word}.jpg" alt="" width="240" height="160" loading="lazy"></div><div class="word-copy"><strong>${word.word}</strong><small>${word.zh}</small></div></button>`).join('');
}
let stageAnimation;
function selectStage(index,{focus=false,animate=true}={}){
  state.stage=Math.max(0,Math.min(STAGES.length-1,index));
  const item=STAGES[state.stage];
  $$('[data-stage-index]').forEach((button,i)=>{button.setAttribute('aria-selected',String(i===state.stage));button.tabIndex=i===state.stage?0:-1;});
  $('[data-stage-code]').textContent=String(state.stage+1).padStart(2,'0')+' / 06';
  $('[data-stage-title]').textContent=item.title;
  $('[data-stage-description]').textContent=item.description;
  $('[data-stage-ownership]').textContent=item.ownership;
  $('[data-stage-input]').textContent=item.input;
  $('[data-stage-output]').textContent=item.output;
  $('[data-stage-check]').textContent=item.check;
  const panel=$('[data-stage-detail]');panel.setAttribute('aria-labelledby','workflow-tab-'+state.stage);
  stageAnimation?.cancel();
  if(animate&&!reduced.matches)stageAnimation=panel.animate([{opacity:.55,transform:'translateY(7px)'},{opacity:1,transform:'translateY(0)'}],{duration:280,easing:'cubic-bezier(.23,1,.32,1)'});
  if(focus)$('[data-stage-index="'+state.stage+'"]').focus();
}
function renderStages(){
  $('[data-stage-list]').innerHTML=STAGES.map((item,i)=>`<button id="workflow-tab-${i}" type="button" role="tab" data-stage-index="${i}" aria-controls="stage-detail" aria-selected="${i===0}" tabindex="${i===0?0:-1}"><span>${String(i+1).padStart(2,'0')}</span><strong>${item.title}</strong></button>`).join('');
}
function setScale(mode){
  document.documentElement.dataset.scaleMode=mode;
  $$('[data-scale-toggle]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.scaleToggle===mode)));
  $('[data-scale-note]').textContent=mode==='physical'?'约 1:1 展示 · 实际尺寸受屏幕 DPI 影响':'表盘中的真实成片 · 展厅交互演示';
}
function toggleSound(){
  state.sound=!state.sound;video.muted=!state.sound;
  $('[data-sound-toggle]').setAttribute('aria-pressed',String(state.sound));
  $('[data-sound-toggle]').setAttribute('aria-label',state.sound?'关闭声音':'开启声音');
  $('[data-sound-control]').setAttribute('href',state.sound?'#sound':'#muted');
  if(state.sound&&video.paused)play();
  syncPlayback();
}

// A finite, damped response. No animation frame is kept alive once settled.
function initDeviceMotion(){
  const device=$('[data-watch-device]');
  const fine=matchMedia('(hover:hover) and (pointer:fine)');
  let frame=0,x=0,y=0,vx=0,vy=0,tx=0,ty=0,last=0;
  const reset=()=>{cancelAnimationFrame(frame);frame=0;x=y=vx=vy=tx=ty=0;device.style.transform='';};
  const tick=(time)=>{const dt=Math.min((time-last)/16.67||1,2);last=time;vx=(vx+(tx-x)*.12*dt)*Math.pow(.72,dt);vy=(vy+(ty-y)*.12*dt)*Math.pow(.72,dt);x+=vx*dt;y+=vy*dt;device.style.transform=`rotate(${-5+x*.4}deg) rotateY(${x}deg) rotateX(${-y}deg)`;if(Math.abs(x-tx)+Math.abs(y-ty)+Math.abs(vx)+Math.abs(vy)>.025)frame=requestAnimationFrame(tick);else frame=0;};
  const start=()=>{if(!frame){last=performance.now();frame=requestAnimationFrame(tick);}};
  stageRegion.addEventListener('pointermove',event=>{if(reduced.matches||!fine.matches)return;const box=stageRegion.getBoundingClientRect();tx=((event.clientX-box.left)/box.width-.5)*2;ty=((event.clientY-box.top)/box.height-.5)*2;start();});
  stageRegion.addEventListener('pointerleave',()=>{tx=ty=0;if(x||y)start();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)reset();});
  reduced.addEventListener('change',reset);
  new IntersectionObserver(([entry])=>{if(!entry.isIntersecting)reset();}).observe(stageRegion);
}
renderWords();renderStages();selectStage(0,{animate:false});selectWord(0);setScale('presentation');
$('[data-word-list]').addEventListener('click',event=>{const button=event.target.closest('[data-word-index]');if(!button)return;selectWord(Number(button.dataset.wordIndex),{playNow:true});});
$('[data-prev-word]').addEventListener('click',()=>selectWord(state.word-1,{playNow:true}));
$('[data-next-word]').addEventListener('click',()=>selectWord(state.word+1,{playNow:true}));
$('[data-play-toggle]').addEventListener('click',togglePlayback);watchScreen.addEventListener('click',togglePlayback);$('[data-sound-toggle]').addEventListener('click',toggleSound);
$$('[data-scale-toggle]').forEach(button=>button.addEventListener('click',()=>setScale(button.dataset.scaleToggle)));
$('[data-stage-list]').addEventListener('click',event=>{const button=event.target.closest('[data-stage-index]');if(button)selectStage(Number(button.dataset.stageIndex));});
$('[data-stage-list]').addEventListener('keydown',event=>{const keys=['ArrowRight','ArrowLeft','ArrowDown','ArrowUp','Home','End'];if(!keys.includes(event.key))return;event.preventDefault();const i=event.key==='Home'?0:event.key==='End'?5:(state.stage+(event.key==='ArrowRight'||event.key==='ArrowDown'?1:5))%6;selectStage(i,{focus:true});});
video.addEventListener('play',syncPlayback);video.addEventListener('pause',syncPlayback);video.addEventListener('ended',syncPlayback);
video.addEventListener('waiting',()=>{if(!video.paused)status.textContent='正在准备成片…';});
video.addEventListener('playing',()=>{status.textContent='正在播放 · '+WORDS[state.word].word;});
video.addEventListener('error',()=>{status.textContent='这条成片暂时未能载入，请重新选择或播放。';syncPlayback();});
video.addEventListener('timeupdate',()=>{const cut=WORDS[state.word].trimEnd;if(cut&&Number.isFinite(video.duration)&&video.currentTime>=Math.max(0,video.duration-cut)){video.currentTime=0;}});
document.addEventListener('visibilitychange',()=>{if(document.hidden){state.queuedPlay=false;pause();}});
new IntersectionObserver(([entry])=>{state.visible=entry.isIntersecting&&entry.intersectionRatio>=.25;if(!state.visible){pause();return;}if(state.queuedPlay){state.queuedPlay=false;observed=true;play();return;}if(!observed){observed=true;if(!reduced.matches)play();}},{threshold:[0,.25,.5]}).observe(stageRegion);
initDeviceMotion();
