const labels=['先确定使用场景','角色、构图与镜头约束','对照主体、安全区与裁切','规格对齐，问题可回溯'];
const notes=['设备和画幅改变时，先重新确认构图。','按角色、构图与留白，逐项核对这张样片。','拖动下方滑杆，看看主体会不会被裁掉。'];

/** A sample composition can be inspected; no generated output or production score is invented. */
export function initMethodLab(root=document.querySelector('[data-method-lab]'),{reduced=matchMedia('(prefers-reduced-motion: reduce)')}={}) {
 if(!root)return {select(){},destroy(){}};
 if(root.__methodLab)return root.__methodLab;
 const $=selector=>root.querySelector(selector),$$=selector=>[...root.querySelectorAll(selector)];
 const preview=$('[data-ml-preview]'),canvas=$('[data-ml-canvas]'),delivery=$('[data-ml-delivery]');
 const crop=$('[data-ml-crop]'),safe=$('[data-ml-safe]'),subject=$('[data-ml-subject]');
 const constraints={identity:true,center:true,space:true},overlays={safe:true,subject:true};
 const cleanups=[],animations=new Set(),objectURLs=new Set();
 let selected=-1,scenario='portrait',position=50,geometry={width:0,height:0},lastFeedback='',destroyed=false;
 const on=(target,event,handler,options)=>{target.addEventListener(event,handler,options);cleanups.push(()=>target.removeEventListener(event,handler,options));};
 function stopAnimations(){animations.forEach(animation=>animation.cancel());animations.clear();}
 function arrive(element){
  stopAnimations();
  if(reduced.matches||document.hidden||!element.animate)return;
  const animation=element.animate([{opacity:.65,transform:'translateX(7px)'},{opacity:1,transform:'translateX(0)'}],{duration:260,easing:'cubic-bezier(.16,1,.3,1)'});
  animations.add(animation);animation.finished.then(()=>animations.delete(animation),()=>animations.delete(animation));
 }
 function measure(){
  const rect=preview.getBoundingClientRect();
  if(rect.width&&rect.height)geometry={width:rect.width,height:rect.height};
 }
 function feedback(text){
  if(text===lastFeedback)return;lastFeedback=text;$('[data-ml-crop-feedback]').textContent=text;
 }
 function paintCrop(){
  const value=selected===2?position:selected===0?(scenario==='portrait'?50:50):(constraints.center?50:26);
  preview.style.setProperty('--ml-crop',value+'%');
  root.style.setProperty('--ml-context-left',((1-(9/16)/(4/3))*value).toFixed(3)+'%');
  crop.value=String(position);crop.style.setProperty('--ml-range',position+'%');$('[data-ml-crop-value]').textContent=position+'%';
  const {width,height}=geometry;
  if(width&&height){
   const paintedWidth=Math.max(width,height*4/3),offset=(paintedWidth-width)*value/100;
   const left=paintedWidth*.37-offset,subjectWidth=paintedWidth*.26;
   preview.style.setProperty('--ml-subject-left',left+'px');preview.style.setProperty('--ml-subject-width',subjectWidth+'px');
   if(selected===2){
    let text;
    if(left+subjectWidth<width*.2||left>width*.8)text='主体已偏到画外，拖动滑杆把它找回来。';
    else if(left<0)text='主体左侧被裁切，试着查看更左侧的画面。';
    else if(left+subjectWidth>width)text='主体右侧被裁切，试着查看更右侧的画面。';
    else if(left<width*.08||left+subjectWidth>width*.92)text='主体贴近边缘，再为小屏留一点余量。';
    else text='主体在画面内，继续检查边缘与留白。';
    feedback(text);crop.setAttribute('aria-valuetext',`画面位置 ${position}%，${text}`);
   }
  }
 }
 function paintVisual(){
  const format=selected===0?scenario:selected===1?'wide':'portrait';
  preview.dataset.format=format;
  $('[data-ml-format]').textContent=format==='wide'?'4:3 · 横屏构图':'9:16 · 小屏裁切';
  safe.hidden=selected===2?!overlays.safe:selected===0?false:true;
  subject.hidden=selected===2?!overlays.subject:selected===1?!constraints.center:true;
  $('[data-ml-center]').hidden=selected!==1||!constraints.center;
  $('[data-ml-whitespace]').hidden=selected!==1||!constraints.space;
  $('[data-ml-reference]').hidden=selected!==1||!constraints.identity;
  $('[data-ml-canvas-note]').textContent=notes[Math.min(2,Math.max(0,selected))];
  measure();paintCrop();
 }
 function paintChecks(){
  const checks=$$('[data-ml-check]'),count=checks.filter(input=>input.checked).length;
  $('[data-ml-export]').disabled=count!==checks.length;
  $('[data-ml-check-count]').textContent=`已确认 ${count} / ${checks.length}`;
  $('[data-ml-delivery-feedback]').textContent=count===checks.length?'这份示例检查清单已准备好，可导出继续核对。':'勾选三项后，可导出这份示例检查清单。';
 }
 function select(index){
  const next=Math.max(0,Math.min(3,Number(index)||0));
  if(destroyed||next===selected)return;
  const previous=selected;selected=next;root.dataset.qualityStep=String(next);
  $$('[data-ml-controls]').forEach(element=>element.hidden=Number(element.dataset.mlControls)!==next);
  canvas.hidden=next===3;delivery.hidden=next!==3;
  $('[data-quality-label]').textContent=labels[next];
  paintVisual();paintChecks();
  if(previous>=0)arrive(next===3?delivery:canvas);
 }
 $$('[data-ml-scene]').forEach(button=>on(button,'click',()=>{
  const next=button.dataset.mlScene;if(next===scenario)return;scenario=next;
  $$('[data-ml-scene]').forEach(control=>control.setAttribute('aria-pressed',String(control===button)));
  $('[data-ml-scene-feedback]').textContent=scenario==='portrait'?'手机观看先按 9:16 检查，重要信息留在中间。':'横屏展示先按 4:3 看完整构图，再确认主体与留白。';
  paintVisual();arrive(preview);
 }));
 $$('[data-ml-constraint]').forEach(button=>on(button,'click',()=>{
  const key=button.dataset.mlConstraint;constraints[key]=!constraints[key];button.setAttribute('aria-pressed',String(constraints[key]));
  const count=Object.values(constraints).filter(Boolean).length;
  $('[data-ml-constraint-feedback]').textContent=count===3?'角色参考、主体位置与留白都有了检查依据。':count===0?'约束已收起。逐项打开，观察样片中对应的检查依据。':'逐项打开或收起约束，观察它怎样影响构图检查。';
  paintVisual();
 }));
 $$('[data-ml-overlay]').forEach(button=>on(button,'click',()=>{
  const key=button.dataset.mlOverlay;overlays[key]=!overlays[key];button.setAttribute('aria-pressed',String(overlays[key]));paintVisual();
 }));
 on(crop,'input',()=>{position=Math.max(0,Math.min(100,Number(crop.value)||0));paintCrop();});
 on($('[data-ml-reset]'),'click',()=>{position=50;paintCrop();});
 $$('[data-ml-check]').forEach(input=>on(input,'change',paintChecks));
 on($('[data-ml-export]'),'click',()=>{
  const checks=$$('[data-ml-check]');if(checks.some(input=>!input.checked))return;
  const text=['一点好奇心 · 交付检查清单（方法演示）','此清单为互动样例，不是实际项目质检记录。','','[已确认] 画幅与使用场景一致','[已确认] 文件命名清楚，可回溯','[已确认] 封面与检查清单齐全','','示例文件：video.mp4 / poster.webp / checklist.txt','示例命名：watch-content_001'].join('\r\n');
  const url=URL.createObjectURL(new Blob(['\uFEFF'+text],{type:'text/plain;charset=utf-8'}));objectURLs.add(url);
  const link=document.createElement('a');link.href=url;link.download='sample-delivery-checklist.txt';document.body.append(link);link.click();link.remove();
  $('[data-ml-delivery-feedback]').textContent='示例检查清单已导出，可继续按实际交付要求核对。';
  setTimeout(()=>{URL.revokeObjectURL(url);objectURLs.delete(url);},1000);
 });
 const resize=new ResizeObserver(()=>{measure();paintCrop();});resize.observe(preview);
 on(document,'visibilitychange',()=>{if(document.hidden)stopAnimations();});on(reduced,'change',()=>{if(reduced.matches)stopAnimations();});
 const api={select,destroy(){if(destroyed)return;destroyed=true;stopAnimations();resize.disconnect();cleanups.forEach(cleanup=>cleanup());objectURLs.forEach(url=>URL.revokeObjectURL(url));objectURLs.clear();delete root.__methodLab;}};
 root.__methodLab=api;select(root.dataset.qualityStep===undefined?2:Number(root.dataset.qualityStep));return api;
}
