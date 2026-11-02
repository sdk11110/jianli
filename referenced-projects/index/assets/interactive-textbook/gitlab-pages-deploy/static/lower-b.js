(() => {
 'use strict';
 const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const stage=$('[data-b-canvas]'),native=$('[data-b-native]');
 let data=null,geometry=null,currentPage='p014.jpg',selectedShot=1,state={phase:'select',reviewPhase:null,running:false,done:false,selected:[],completed:[]},defaultChosen=false,visible=true;
 const phases=['vision','prompt','seedance','upscale','ffmpeg','audio','done'];
 const labels=['教材识读','设计分镜','生成画面','提升画质','拼接画面','配音配乐','成片'];
 const mediaKeys=new Map(),surfaceKeys=new Map(),motion=new Set();let viewer=null,viewerOrigin=null;
 const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const ranges={vision:[0,15],prompt:[15,30],seedance:[30,50],upscale:[50,68],ffmpeg:[68,82],audio:[82,98],finalize:[98,100],done:[100,100]};
 ['large','right'].forEach(key=>{const s=document.createElement('div');s.className='b-phase-surface';s.dataset.bSurface=key;s.hidden=true;$(`[data-b-plane="${key}"]`).append(s);});
 function stopMotion(){motion.forEach(a=>a.cancel());motion.clear();}
 function animate(el,frames,duration=420){if(reduced.matches||document.hidden||!visible)return;const a=el.animate(frames,{duration,easing:'cubic-bezier(.16,1,.3,1)'});motion.add(a);a.finished.catch(()=>{}).finally(()=>motion.delete(a));return a;}
 function setQuad(el,q,w,h){
  el.style.width=w+'px';el.style.height=h+'px';const source=[[0,0],[w,0],[w,h],[0,h]],rows=[];
  source.forEach(([x,y],i)=>{const [u,v]=q[i];rows.push([x,y,1,0,0,0,-u*x,-u*y,u],[0,0,0,x,y,1,-v*x,-v*y,v]);});
  for(let c=0;c<8;c++){let p=c;for(let r=c+1;r<8;r++)if(Math.abs(rows[r][c])>Math.abs(rows[p][c]))p=r;[rows[c],rows[p]]=[rows[p],rows[c]];const k=rows[c][c];for(let n=c;n<9;n++)rows[c][n]/=k;for(let r=0;r<8;r++){if(r===c)continue;const f=rows[r][c];for(let n=c;n<9;n++)rows[r][n]-=f*rows[c][n];}}
  const [a,b,c,d,e,f,g,hp]=rows.map(r=>r[8]);el.style.transform=`matrix3d(${a},${d},0,${g},${b},${e},0,${hp},0,0,1,0,${c},${f},0,1)`;
 }
 function fit(){native.style.transform=`scale(${stage.clientWidth/1774})`;}
 new ResizeObserver(fit).observe(stage);fit();
 function mapPlanes(){if(!geometry)return;const p=geometry.placements;setQuad($('[data-b-plane="book"]'),p.book_inner_page.quad_pixels,438,529);setQuad($('[data-b-plane="large"]'),p.large_frame_inner_image.quad_pixels,605,338);setQuad($('[data-b-plane="right"]'),p.right_frame_inner_image.quad_pixels,355,303);fit();}
 function pauseDeck(){$$('[data-b-video]').forEach(v=>v.pause());}
 function message(key,text){$(`[data-b-message="${key}"]`).textContent=text;}
 function syncVideo(key){const v=$(`[data-b-video="${key}"]`),playing=!v.paused&&!v.ended,plane=$(`[data-b-plane="${key}"]`),b=$(`[data-b-play="${key}"]`);plane.classList.toggle('is-playing',playing);b.setAttribute('aria-label',playing?'暂停当前片段':'播放当前片段');}
 async function toggleVideo(key){const v=$(`[data-b-video="${key}"]`);if(!v.paused){v.pause();return;}try{await v.play();message(key,'');}catch(e){if(e.name!=='AbortError')message(key,'暂未开始播放，请再次点击。');}}
 ['large','right'].forEach(key=>{
  const v=$(`[data-b-video="${key}"]`);$(`[data-b-play="${key}"]`).addEventListener('click',()=>toggleVideo(key));v.addEventListener('click',()=>toggleVideo(key));
  ['play','pause','ended'].forEach(event=>v.addEventListener(event,()=>{syncVideo(key);syncPlayback();}));
  v.addEventListener('timeupdate',syncPlayback);v.addEventListener('loadedmetadata',syncPlayback);
  v.addEventListener('play',()=>document.querySelectorAll('video').forEach(other=>{if(other!==v)other.pause();}));
  v.addEventListener('waiting',()=>{if(!v.paused)message(key,'正在准备片段…');});v.addEventListener('playing',()=>message(key,''));v.addEventListener('error',()=>{message(key,'这段视频暂未载入，可切换一幕再试。');syncVideo(key);});
 });
 function present(key,shot,mode,autoplay=false){
  const image=$(`[data-b-image="${key}"]`),video=$(`[data-b-video="${key}"]`),button=$(`[data-b-play="${key}"]`),plane=$(`[data-b-plane="${key}"]`);
  const full=key==='large'&&['silent','final'].includes(mode),clip=['raw','hd'].includes(mode),hasVideo=full||clip;
  const src=full?'assets/video/final.mp4':clip?`assets/segments/${mode==='hd'?'hd':'raw'}/${encodeURIComponent(mode==='hd'?shot.hd_video:shot.raw_video)}`:`assets/images/${shot.ref_image}`;
  const cache=mode+':'+src;
  if(mediaKeys.get(key)!==cache){mediaKeys.set(key,cache);video.pause();plane.classList.remove('is-playing');message(key,'');
   image.src=`assets/images/${shot.ref_image}`;image.alt=shot.scene_title||shot.name;image.hidden=hasVideo;video.hidden=!hasVideo;button.hidden=!hasVideo;
   if(hasVideo){video.src=src;video.poster=image.src;video.muted=mode!=='final';video.volume=.85;video.setAttribute('aria-label',full?'五幕教学成片':shot.name+'已有视频片段');video.load();
    if(autoplay&&visible&&!document.hidden){video.play().catch(e=>{if(e.name!=='AbortError'&&mediaKeys.get(key)===cache)message(key,mode==='final'?'点击播放，有声核对成片':'点击播放本步片段');});}
   }
   animate(plane,[{opacity:.55,filter:'brightness(.92)'},{opacity:1,filter:'brightness(1)'}],380);
  }
  const lines=shot.subtitles||[];let caption=lines[0]?.en||shot.name;
  if(shot.ref_image==='p015_1.png')caption=lines.find(x=>/long neck/i.test(x.en))?.en||'It has a long neck.';
  if(full)caption=mode==='final'?'五幕教学成片 · 有声':'五幕拼接画面 · 无音频';
  $(`[data-b-caption="${key}"]`).textContent=caption;
  $(`[data-b-subcaption="${key}"]`).textContent=full?(mode==='final'?'真实成片 · 配音与背景音乐':'同一成片的静音画面预览'):`${clip?(mode==='hd'?'高清片段':'原始生成片段'):'已有参考图'} · ${shot.name}`;
 }
 function syncPlayback(){
  const v=$('[data-b-video="large"]');if(!v)return;
  const ratio=Number.isFinite(v.duration)&&v.duration?Math.min(1,v.currentTime/v.duration):0;
  $$('[data-b-playback]').forEach(el=>el.style.setProperty('--playback',ratio));
  $$('[data-b-live-time]').forEach(el=>el.textContent=`${Math.floor(v.currentTime||0)}s / ${Number.isFinite(v.duration)?Math.round(v.duration):'—'}s`);
  $$('[data-b-live-sound]').forEach(el=>el.textContent=v.paused?'点击左侧画面播放':v.muted?'静音画面预览':'正在播放真实成片');
  $$('[data-b-resolution]').forEach(el=>el.textContent=v.videoWidth?`${v.videoWidth} × ${v.videoHeight}`:'高清片段');
 }
 function localProgress(p){if(!state.running)return 1;const [a,b]=ranges[p]||[0,100];return Math.max(0,Math.min(1,((state.progress||0)-a)/(b-a||1)));}
 function shotThumb(shot,i){return `<figure class="b-board-cell" data-b-reveal="${i}"><img src="assets/images/${esc(shot.ref_image)}" alt="${esc(shot.scene_title)}"><figcaption><b>${String(i+1).padStart(2,'0')}</b> ${esc(shot.camera)}</figcaption></figure>`;}
 function phaseContent(key,p,shot){
  const scenes=data.lesson_preview.scenes||[],shots=data.shots,scene=scenes.find(s=>s.scene_id===shot.scene_id)||scenes[0];
  if(p==='vision'){
   if(key==='large')return `<div class="b-analysis"><header><h3>读懂教材里的故事。</h3><span>教材解析</span></header><div class="b-analysis-topic"><img src="assets/images/${esc(shot.ref_image)}" alt="熊馆场景原图"><div><strong>${esc(data.lesson_preview.title)}</strong><p>从动物园情景，提取教学对话与画面。</p></div></div><ol>${scenes.slice(0,3).map((sc,i)=>`<li data-b-reveal="${i}"><span>P${sc.page}</span><strong>${esc(sc.topic)}</strong><small>${sc.dialogues.length} 句对话</small></li>`).join('')}</ol><footer>本单元固定解析样例 · ${scenes.length} 个场景 / ${scenes.reduce((n,s)=>n+s.dialogues.length,0)} 句对话</footer></div>`;
   return `<div class="b-dialogue-sheet ${scene.dialogues.length>2?'is-dense':''}"><h3>保留原句，再设计画面。</h3>${scene.dialogues.map((d,i)=>`<blockquote data-b-reveal="${i}"><strong>${esc(d.en)}</strong><small>${esc(d.zh)}</small></blockquote>`).join('')}<footer>教材原句 · 可与左侧原页核对</footer></div>`;
  }
  if(p==='prompt'){
   if(key==='large')return `<div class="b-storyboards"><header><h3>一页教材，展开成五幕。</h3><span>分镜脚本</span></header><div class="b-board-grid">${shots.map(shotThumb).join('')}<div class="b-board-end">起 → 承 → 转 → 合<br><small>用镜头连接故事</small></div></div></div>`;
   return `<div class="b-shot-sheet"><div class="b-shot-photo"><img src="assets/images/${esc(shot.ref_image)}" alt="${esc(shot.scene_title)}"><span>${esc(shot.name)} · ${esc(shot.camera)}</span></div><div class="b-shot-script"><strong>${esc(shot.subtitles?.[0]?.en||shot.name)}</strong><p>${esc(shot.dialogue_timeline?.[0]?.line||shot.scene_title)}</p><small>下方切换镜头，查看对应分镜</small></div></div>`;
  }
  if(p==='seedance'){
   if(key==='large')return `<span class="b-video-tag">原始生成片段 · ${esc(shot.name)}</span><span class="b-video-bottom">真实本地片段 <span data-b-live-time></span></span>`;
   return `<div class="b-generation-sheet"><h3>五幕，逐一就位。</h3><p>已有生成片段 · 按脚本顺序展示</p><ol>${shots.map((s,i)=>`<li data-b-reveal="${i}"><img src="assets/images/${esc(s.ref_image)}" alt=""><span>${esc(s.name)}<small>${esc(s.camera)}</small></span><i aria-hidden="true"></i></li>`).join('')}</ol></div>`;
  }
  if(p==='upscale'){
   if(key==='large')return `<span class="b-video-tag">高清片段 · ${esc(shot.name)}</span><span class="b-video-bottom"><span data-b-resolution>高清片段</span><span data-b-live-time></span></span>`;
   return `<span class="b-video-tag">对照 · 原始生成片段</span><span class="b-video-bottom">点画面播放原片，与左侧高清片段对照</span>`;
  }
  if(p==='ffmpeg'){
   if(key==='large')return `<span class="b-video-tag">五幕拼接 · 静音预览</span><div class="b-film-rail" data-b-playback>${shots.map((s,i)=>`<div data-b-reveal="${i}"><img src="assets/images/${esc(s.ref_image)}" alt="${esc(s.name)}"><span>${i+1}</span></div>`).join('')}<i></i></div>`;
   return `<div class="b-assembly-sheet"><h3>从五段，到一支片。</h3><div class="b-splice-list">${shots.map((s,i)=>`<div data-b-reveal="${i}"><span>${String(i+1).padStart(2,'0')}</span><img src="assets/images/${esc(s.ref_image)}" alt=""><strong>${esc(s.name)}</strong></div>`).join('')}</div><footer>左侧：真实完整成片的静音预览</footer></div>`;
  }
  if(p==='audio'){
   if(key==='large')return `<span class="b-video-tag">音画核对 · 有声成片</span><div class="b-audio-strip" data-b-playback><span>配音 + 背景音乐</span><span data-b-live-time></span><i></i></div>`;
   return `<div class="b-audio-sheet"><h3>让教材原句，被听见。</h3><div class="b-sound-tracks"><div><span>抽检台词 · ${esc(shot.name)}</span><strong>${esc(shot.subtitles?.[0]?.en||shot.name)}</strong></div><div><span>背景音乐</span><strong>统一混入完整成片</strong></div></div><p data-b-live-sound>点击左侧画面播放</p><footer>核对台词、发音和音画一致性<br>固定样例 · 不调用配音服务</footer></div>`;
  }
  if(p==='finalize'||p==='done'){
   if(key==='large')return `<span class="b-video-tag b-final-tag">${state.done?'已完成人工品检':'最终品检 · 等待人工放行'}</span><span class="b-video-bottom">五幕真实教学成片 <span data-b-live-time></span></span>`;
   return `<div class="b-quality-sheet"><h3>${state.done?'本次体验，验收完成。':'最后一步，由人判断。'}</h3><ol>${['教材识读','分镜与提示词','生成画面','音画与配音','最终成片品检'].map((label,i)=>`<li class="${i===4&&!state.done?'is-pending':''}"><span>${esc(label)}</span><strong>${i===4&&!state.done?'待确认':'已确认'}</strong></li>`).join('')}</ol><footer>${state.done?'已走完本地模拟 · 真实项目结果见下文':'请观看成片，再点击下方确认或返回修改。'}</footer></div>`;
  }
  return '';
 }
 function showPhase(p,shot){
  const opaqueLarge=['vision','prompt'].includes(p),opaqueRight=['vision','prompt','seedance','ffmpeg','audio','finalize','done'].includes(p);
  ['large','right'].forEach(key=>{
   const s=$(`[data-b-surface="${key}"]`),plane=$(`[data-b-plane="${key}"]`),opaque=key==='large'?opaqueLarge:opaqueRight,contentKey=`${p}:${selectedShot}:${state.done}`;
   s.hidden=p==='select';plane.classList.toggle('has-phase-sheet',opaque);s.classList.toggle('is-sheet',opaque);plane.dataset.artifact=p;
   $(`[data-b-play="${key}"]`).hidden=opaque||$(`[data-b-video="${key}"]`).hidden;
   if(surfaceKeys.get(key)!==contentKey){surfaceKeys.set(key,contentKey);s.innerHTML=phaseContent(key,p,shot);if(!s.hidden)animate(s,[{opacity:.45,clipPath:'inset(0 0 10% 0)'},{opacity:1,clipPath:'inset(0 0 0 0)'}],360);}
   const rows=[...s.querySelectorAll('[data-b-reveal]')],fraction=localProgress(p),count=Math.max(1,Math.ceil(fraction*rows.length));
   rows.forEach((el,i)=>el.classList.toggle('is-unrevealed',i>=count));
   // In a full data sheet the expand control opens the detailed, selectable DOM below.
   const expand=$(`[data-b-expand="${key}"]`);expand.setAttribute('aria-label',opaque?'查看本步完整产物':'放大当前视频或分镜');
  });
  const captions={vision:['教材解析 · 场景与台词','本单元原句'],prompt:['五幕分镜 · 故事展开',shot.name+' · '+shot.camera],seedance:[shot.subtitles?.[0]?.en||shot.name,'五幕生成片段'],upscale:['高清片段 · '+shot.name,'原始片段对照'],ffmpeg:['五幕，接成一支片。','五幕拼接顺序'],audio:['真实成片 · 有声核对','配音与背景音乐'],finalize:['最终成片 · 人工品检','五道审核，逐项放行'],done:['本次模拟，验收完成。','五道审核已确认']};
  if(captions[p]){
   $('[data-b-caption="large"]').textContent=captions[p][0];$('[data-b-caption="right"]').textContent=captions[p][1];
   if(opaqueLarge)$('[data-b-subcaption="large"]').textContent=state.running?'本地样例正在逐项展开':'本步产物已展开 · 下方查看完整内容';
   if(opaqueRight)$('[data-b-subcaption="right"]').textContent=p==='prompt'?'选中一幕，查看镜头与台词':'本单元固定样例 · 保留人工审核';
  }
  syncPlayback();
 }
 function artifactPhase(){if(state.done)return 'done';if(state.reviewPhase)return state.reviewPhase;if(state.running)return state.phase;return state.completed.at(-1)||'select';}
 function render(){
  stage.dataset.phase=state.reviewPhase||state.phase;stage.dataset.running=String(state.running);
  if(state.selected.length&&!state.selected.includes(currentPage))currentPage=state.selected[0];
  const book=$('[data-b-book]'),src='assets/original/'+currentPage;
  if(book.getAttribute('src')!==src){book.src=src;book.alt='译林版英语教材原页 P'+(currentPage.includes('15')?'15':'14');}
  $$('[data-b-page]').forEach(b=>{b.setAttribute('aria-pressed',String(state.selected.includes(b.dataset.bPage)));b.disabled=state.running||state.done;});
  $('[data-b-source-note]').textContent=state.selected.length?`已选教材 ${state.selected.map(x=>'P'+(x.includes('15')?'15':'14')).join('、')} · 点击页码可调整`:'当前为教材预览 · 点击 P14 或 P15 选用';
  const approve={vision:'确认教材，继续',prompt:'确认分镜，继续',seedance:'确认画面，继续',audio:'确认音画，继续',finalize:'确认品检，完成'};
  $('#reviewApprove').textContent=(approve[state.reviewPhase]||'确认通过，继续')+' →';
  $('#reviewApprove').setAttribute('aria-describedby','reviewGateCopy');
  if(state.reviewPhase){$('#reviewGateTitle').textContent='待人工确认';$('#reviewApprove').title=$('#reviewGateCopy').textContent;}
  if(state.phase==='select'&&state.selected.length)$('#phaseActionHint').textContent='已选用教材，点击开始识读并逐步确认。';
  $('#progressLabel').textContent=state.reviewPhase?'等待人工确认':state.running?'正在演示本步骤':state.done?'模拟验收完成':state.phase==='select'?'等待开始':'可继续下一步';
  $('#reviewRework').setAttribute('aria-label',state.reviewPhase?'需要修改，返回当前步骤':'需要修改');
  $$('.b-step-track .step-item').forEach((el,i)=>{const phase=state.reviewPhase||state.phase,index=phase==='finalize'||phase==='done'?6:Math.max(0,phases.indexOf(phase));if(i===index)el.setAttribute('aria-current','step');else el.removeAttribute('aria-current');});
  if(!data)return;
  const first=data.shots[selectedShot]||data.shots[0],second=data.shots[(selectedShot+1)%data.shots.length];
  const p=artifactPhase(),mode=p==='seedance'?'raw':p==='upscale'?'hd':p==='ffmpeg'?'silent':['audio','finalize','done'].includes(p)?'final':'image';
  present('large',first,mode,true);present('right',p==='upscale'?first:second,p==='upscale'?'raw':'image');showPhase(p,first);
  $$('[data-b-shot]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.bShot)===selectedShot)));
  $('[data-b-artifact-note]').textContent=state.phase==='select'&&!state.completed.length?'现有参考图预览 · 点击开始识读，逐步运行模拟':state.reviewPhase?'本步产物待人工确认，确认后才会继续':state.running?'本地演示中 · 展示已有素材与片段':'可点选一幕查看已有产物，执行进度以步骤记录为准';
 }
 addEventListener('textbook:state',event=>{
  state=event.detail;
  if(!defaultChosen&&state.phase==='select'&&!state.selected.length){const b=$('#textbookPicker [data-page="p014.jpg"]');if(b){defaultChosen=true;b.click();return;}}
  render();
 });
 $$('[data-b-page]').forEach(b=>b.addEventListener('click',()=>{if(state.running||state.done)return;currentPage=b.dataset.bPage;const original=$(`#textbookPicker [data-page="${currentPage}"]`);original?.click();render();}));
 $$('[data-b-shot]').forEach(b=>b.addEventListener('click',()=>{selectedShot=Number(b.dataset.bShot);stopMotion();render();}));
 $('#demoReset').addEventListener('click',()=>{pauseDeck();selectedShot=1;currentPage='p014.jpg';render();requestAnimationFrame(()=>$('[data-b-page]')?.focus({preventScroll:true}));});
 $('[data-b-return]').addEventListener('click',()=>{$('#demo').scrollIntoView({behavior:reduced.matches?'auto':'smooth',block:'start'});});
 function closeViewer(){if(!viewer)return;viewer.querySelectorAll('video').forEach(v=>v.pause());viewer.remove();viewer=null;document.body.classList.remove('b-media-open');viewerOrigin?.focus({preventScroll:true});}
 function openViewer({src,poster,video=false,muted=false,label},origin){
  closeViewer();pauseDeck();document.querySelectorAll('video').forEach(v=>v.pause());viewerOrigin=origin||document.activeElement;
  viewer=document.createElement('div');viewer.className='b-lightbox';viewer.setAttribute('role','dialog');viewer.setAttribute('aria-modal','true');viewer.setAttribute('aria-label',label||'分镜与视频放大');
  const close=document.createElement('button');close.type='button';close.innerHTML='返回工作台 <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>';close.addEventListener('click',closeViewer);viewer.append(close);
  const media=document.createElement(video?'video':'img');media.src=src;if(video){media.playsInline=true;media.preload='metadata';media.muted=muted;media.volume=.85;if(poster)media.poster=poster;}else media.alt=label;
  viewer.append(media);const text=document.createElement('p');text.textContent=label||'';viewer.append(text);
  if(video){const controls=document.createElement('div');controls.className='b-view-controls';controls.innerHTML='<button type="button" data-view-play aria-label="播放放大视频">播放</button><input type="range" data-view-seek min="0" max="1000" value="0" aria-label="放大视频进度"><span data-view-time>0:00</span><button type="button" data-view-sound>声音开</button>';
   const play=controls.querySelector('[data-view-play]'),sound=controls.querySelector('[data-view-sound]'),seek=controls.querySelector('[data-view-seek]');sound.textContent=muted?'无音频预览':'声音开';sound.disabled=muted;
   const clock=n=>`${Math.floor((n||0)/60)}:${String(Math.floor((n||0)%60)).padStart(2,'0')}`;
   const sync=()=>{play.textContent=media.paused?'播放':'暂停';play.setAttribute('aria-label',media.paused?'播放放大视频':'暂停放大视频');};
   play.addEventListener('click',async()=>{if(!media.paused)media.pause();else try{await media.play();}catch{text.textContent='暂未开始播放，请再次点击。';}});
   ['play','pause','ended'].forEach(e=>media.addEventListener(e,sync));media.addEventListener('timeupdate',()=>{controls.querySelector('[data-view-time]').textContent=clock(media.currentTime)+' / '+clock(media.duration);seek.value=Number.isFinite(media.duration)?Math.round(media.currentTime/media.duration*1000):0;});seek.addEventListener('input',()=>{if(Number.isFinite(media.duration))media.currentTime=Number(seek.value)/1000*media.duration;});sound.addEventListener('click',()=>{media.muted=!media.muted;sound.textContent=media.muted?'声音关':'声音开';});viewer.append(controls);
  }
  document.body.append(viewer);document.body.classList.add('b-media-open');close.focus({preventScroll:true});
 }
 $$('[data-b-expand]').forEach(b=>b.addEventListener('click',()=>{const key=b.dataset.bExpand;if($(`[data-b-plane="${key}"]`).classList.contains('has-phase-sheet')){const inspector=$('#bInspector');inspector.open=true;inspector.scrollIntoView({behavior:reduced.matches?'auto':'smooth',block:'start'});return;}const v=$(`[data-b-video="${key}"]`),im=$(`[data-b-image="${key}"]`);openViewer({src:v.hidden?im.src:v.currentSrc||v.src,poster:im.src,video:!v.hidden,muted:v.muted,label:$(`[data-b-caption="${key}"]`).textContent},b);}));
 document.addEventListener('click',e=>{const fs=e.target.closest('.studio-video-fs');if(!fs||!fs.closest('#bInspector'))return;e.preventDefault();e.stopImmediatePropagation();const v=fs.closest('.studio-video-player')?.querySelector('video');if(v)openViewer({src:v.currentSrc||v.querySelector('source')?.src,poster:v.poster,video:true,muted:v.muted,label:'本步视频产物'},fs);},true);
 document.addEventListener('keydown',e=>{if(!viewer)return;if(e.key==='Escape'){e.preventDefault();closeViewer();return;}if(e.key==='Tab'){const focus=[...viewer.querySelectorAll('button,input')].filter(x=>!x.disabled),i=focus.indexOf(document.activeElement);if(e.shiftKey&&i<=0){e.preventDefault();focus.at(-1).focus();}else if(!e.shiftKey&&i===focus.length-1){e.preventDefault();focus[0].focus();}}});
 new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(!visible){pauseDeck();stopMotion();}},{threshold:.12}).observe(stage);
 document.addEventListener('visibilitychange',()=>{if(document.hidden){pauseDeck();stopMotion();viewer?.querySelectorAll('video').forEach(v=>v.pause());}});
 reduced.addEventListener('change',stopMotion);
 Promise.all([fetch('api/demo.json').then(r=>{if(!r.ok)throw Error('data');return r.json();}),fetch('assets/lower-b/geometry.json').then(r=>{if(!r.ok)throw Error('geometry');return r.json();})]).then(([d,g])=>{data=d;geometry=g;mapPlanes();render();}).catch(()=>{$('[data-b-artifact-note]').textContent='工作台资料暂未载入，请刷新重试；下方仍可阅读项目说明。';});
})();
