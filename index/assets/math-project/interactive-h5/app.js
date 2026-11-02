export function evaluatePair(circle, triangle){
 const validDigits=Number.isInteger(circle)&&Number.isInteger(triangle)&&circle>=0&&circle<=9&&triangle>=0&&triangle<=9;
 const tenths=validDigits?11*(circle+triangle):null;
 return {circle,triangle,validDigits,tenths,total:tenths===null?null:tenths/10,sum:circle+triangle,different:circle!==triangle,ordered:circle>triangle,solved:validDigits&&circle>triangle&&tenths===187};
}
export function formatTenths(tenths){return Number.isInteger(tenths)?Math.floor(tenths/10)+'.'+tenths%10:'—';}
export const learningSteps=['情景化点题','交互学习','方法提炼'];
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
function init(){
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let current=0,turnAnimation=null;
 const next=$('[data-next]');
 function showStep(index,{focus=false}={}){
  current=Math.max(0,Math.min(2,index));
  $$('[data-step]').forEach((button,i)=>{button.setAttribute('aria-selected',String(i===current));button.tabIndex=i===current?0:-1;});
  $$('[data-panel]').forEach((panel,i)=>panel.hidden=i!==current);
  next.innerHTML=(current===0?'去交互学习':current===1?'去提炼方法':'再试一次')+'<svg class="icon"><use href="#arrow"/></svg>';
  $('[data-direct-method]').hidden=current===2;
  turnAnimation?.cancel();
  if(!reduced.matches)turnAnimation=$('[data-panel="'+current+'"]').animate([{opacity:.6,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}],{duration:280,easing:'cubic-bezier(.23,1,.32,1)'});
  if(focus)$('[data-step="'+current+'"]').focus();
 }
 function updateExperiment(){
  const circle=Number($('[data-circle]').value),triangle=Number($('[data-triangle]').value),result=evaluatePair(circle,triangle);
  $('[data-circle-value]').textContent=circle;$('[data-triangle-value]').textContent=triangle;
  $('[data-circle]').setAttribute('aria-valuetext',circle+'，圆的值');$('[data-triangle]').setAttribute('aria-valuetext',triangle+'，三角的值');
  $('[data-first-number]').textContent=circle+'.'+triangle;$('[data-second-number]').textContent=triangle+'.'+circle;$('[data-live-sum]').textContent=formatTenths(result.tenths);
  $('[data-units]').textContent=circle+' ＋ '+triangle+' ＝ '+result.sum;
  $('[data-tenths]').textContent=triangle+' ＋ '+circle+' ＝ '+result.sum;
  $('[data-relationship]').textContent='两处都出现了同一个和：'+result.sum+'。合起来就是 '+result.sum+' ＋ '+formatTenths(result.sum)+'。';
  $('[data-check-feedback]').textContent='这组数字得到 '+formatTenths(result.tenths)+'。验证一下它是否符合全部条件。';
  $('[data-check-feedback]').dataset.success='false';
  return result;
 }
 function reset(){
  $('[data-circle]').value=6;$('[data-triangle]').value=3;updateExperiment();
  $$('[data-predict]').forEach(b=>b.setAttribute('aria-pressed','false'));
  $('[data-prediction-feedback]').textContent='不用先算出答案。试着比较两个小数的位置。';
  $('[data-relation-clue]').hidden=true;$('[data-clue]').setAttribute('aria-expanded','false');$('[data-copy-status]').textContent='';showStep(0);
 }
 $$('[data-step]').forEach(button=>button.addEventListener('click',()=>showStep(Number(button.dataset.step))));
 $('.lesson-tabs').addEventListener('keydown',event=>{if(!['ArrowRight','ArrowLeft','Home','End'].includes(event.key))return;event.preventDefault();showStep(event.key==='Home'?0:event.key==='End'?2:(current+(event.key==='ArrowRight'?1:2))%3,{focus:true});});
 next.addEventListener('click',()=>{if(current===2)reset();else showStep(current+1);});
 $('[data-direct-method]').addEventListener('click',()=>showStep(2));$('[data-restart]').addEventListener('click',reset);
 $$('[data-predict]').forEach(button=>button.addEventListener('click',()=>{const answer=button.dataset.predict;$$('[data-predict]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));$('[data-prediction-feedback]').textContent=answer==='swap'?'你发现了位置变化：○、△ 的值没变，个位与十分位互换了。下一步，试着调一调数字。':'再观察一次：同一个符号仍代表同一个数字。比较它在两个小数中的位置，会发现什么？';}));
 $$('[data-circle],[data-triangle]').forEach(input=>input.addEventListener('input',updateExperiment));
 $('[data-check]').addEventListener('click',()=>{const result=updateExperiment();const feedback=$('[data-check-feedback]');if(!result.different)feedback.textContent='两个符号要代表不同数字。先换一个，再试试。';else if(!result.ordered)feedback.textContent='总和可以继续观察，不过题目还要求 ○ 大于 △。调整一下它们的位置。';else if(result.solved){feedback.textContent='这组数字满足全部条件：9.8 ＋ 8.9 ＝ 18.7。接下来，把发现变成方法。';feedback.dataset.success='true';}else feedback.textContent='现在的结果是 '+formatTenths(result.tenths)+'，比 18.7 '+(result.tenths<187?'小':'大')+'。试着改变两个数字的和，看看会发生什么。';});
 $('[data-clue]').addEventListener('click',()=>{const clue=$('[data-relation-clue]');clue.hidden=!clue.hidden;$('[data-clue]').setAttribute('aria-expanded',String(!clue.hidden));});
 $('[data-copy-method]').addEventListener('click',async()=>{const text='找重复关系 → 先化简 → 用条件排除。\n问自己：哪里重复了？能先合并成什么关系？剩下哪些条件能帮我排除？';try{await navigator.clipboard.writeText(text);$('[data-copy-status]').textContent='已复制，带到下一道题试试看。';}catch{$('[data-copy-status]').textContent='可以直接选中上方的思路文字复制。';}});
 updateExperiment();
 initVideo(reduced);
}
function initVideo(reduced){
 const video=$('[data-video]'),player=$('[data-film-player]'),status=$('[data-video-status]'),seek=$('[data-seek]');
 let seen=false,request=0,activeVersion='hd',sound=true;
 const versions={hd:{file:'cryptogram_full_tts_60fps.mp4',label:'高清配音版 / 1440P · 60fps'},tts:{file:'cryptogram_full_tts.mp4',label:'原配音版'},silent:{file:'cryptogram_full_silent.mp4',label:'无声母版 / 检查画面与构造顺序'}};
 const clock=s=>{const n=Math.max(0,Math.floor(s||0));return Math.floor(n/60)+':'+String(n%60).padStart(2,'0');};
 function sync(){
  const playing=!video.paused&&!video.ended;
  const centerPlay=$('[data-center-play]'),controlPlay=$('[data-video-play]');
  const centerHadFocus=document.activeElement===centerPlay;
  centerPlay.hidden=playing;
  player.classList.toggle('is-playing',playing);
  $('[data-play-icon]').setAttribute('href',playing?'#pause':'#play');
  controlPlay.setAttribute('aria-label',playing?'暂停样片':sound?'有声播放样片':'播放样片');
  if(playing&&centerHadFocus)controlPlay.focus({preventScroll:true});
 }
 function syncSound(){video.muted=!sound;$('[data-video-sound]').setAttribute('aria-pressed',String(sound));$('[data-video-sound]').setAttribute('aria-label',sound?'关闭声音':'开启声音');$('[data-sound-icon]').setAttribute('href',sound?'#sound':'#muted');}
 function pause(){request++;const wasPlaying=!video.paused;video.pause();if(wasPlaying)status.textContent='已暂停 · 随时继续';sync();}
 async function play(){const id=++request;syncSound();try{await video.play();if(id===request)status.textContent=activeVersion==='silent'?'正在播放无声母版':'正在播放 · '+versions[activeVersion].label;}catch(error){if(id!==request||error.name==='AbortError')return;status.textContent=error.name==='NotAllowedError'?'点击播放，开启有声讲解。':'未能开始播放，请再次点击播放。';sync();}}
 const toggle=()=>video.paused?play():pause();
 $('[data-video-play]').addEventListener('click',toggle);$('[data-center-play]').addEventListener('click',toggle);video.addEventListener('click',toggle);
 $('[data-video-sound]').addEventListener('click',()=>{sound=!sound;syncSound();status.textContent=activeVersion==='silent'?'当前是无声母版，可切换至配音版听讲解。':sound?'声音已开启':'声音已关闭';});
 video.defaultMuted=false;video.volume=.85;syncSound();sync();
 video.addEventListener('play',sync);video.addEventListener('pause',sync);video.addEventListener('ended',()=>{sync();status.textContent='样片播放完毕。回到互动中，再试试刚才的方法。';});
 const updateTime=()=>{const duration=Number.isFinite(video.duration)?video.duration:155;$('[data-video-time]').textContent=clock(video.currentTime)+' / '+clock(duration);seek.value=duration?Math.round(video.currentTime/duration*1000):0;seek.setAttribute('aria-valuetext',clock(video.currentTime)+'，共'+clock(duration));};
 video.addEventListener('timeupdate',updateTime);video.addEventListener('loadedmetadata',updateTime);
 seek.addEventListener('input',()=>{if(Number.isFinite(video.duration))video.currentTime=Number(seek.value)/1000*video.duration;});
 video.addEventListener('waiting',()=>{if(!video.paused)status.textContent='正在准备样片…';});
 video.addEventListener('playing',()=>{status.textContent=activeVersion==='silent'?'正在播放无声母版':'正在播放 · '+versions[activeVersion].label;});
 video.addEventListener('error',()=>{status.textContent='样片暂未载入，请重新选择版本或点击播放。';sync();});
 $('[data-expand]').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await player.requestFullscreen();}catch{status.textContent='可继续在页面内观看完整画面。';}});
 $$('[data-version]').forEach(button=>button.addEventListener('click',()=>{pause();activeVersion=button.dataset.version;$$('[data-version]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));video.src='assets/videos/'+versions[activeVersion].file;video.load();$('[data-video-label]').textContent=versions[activeVersion].label;video.setAttribute('aria-label','密码破译局完整思维题讲解样片，'+versions[activeVersion].label);seek.value=0;status.textContent=activeVersion==='silent'?'已选无声母版，点击播放检查画面。':'已选'+versions[activeVersion].label+'，点击有声播放。';}));
 new IntersectionObserver(([entry])=>{const visible=entry.isIntersecting&&entry.intersectionRatio>=.3;if(!visible){pause();return;}if(!seen){seen=true;if(!reduced.matches)play();}},{threshold:[0,.3,.6]}).observe(player);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});
}
if(typeof document!=='undefined')init();
