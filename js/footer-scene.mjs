// Fixed grip + elastic line. This evaluator runs only for a finite reaction.
export function footerPose(progress){
 if(!Number.isFinite(progress)||progress<=0||progress>=1)return {pull:0,angle:0};
 const keys=[[0,0],[.16,-.65],[.48,8],[.72,-1.5],[1,0]];
 const i=keys.findIndex((key,index)=>index<keys.length-1&&progress>=key[0]&&progress<keys[index+1][0]);
 const [a,x]=keys[i], [b,y]=keys[i+1];const t=(progress-a)/(b-a),smooth=t*t*(3-2*t);
 const pull=x+(y-x)*smooth;return {pull,angle:pull*.07};
}
export function initFooterScene(root,reduced){
 if(!root)return;
 const button=root.querySelector('[data-footer-actor]'),art=root.querySelector('[data-footer-art]'),path=root.querySelector('[data-footer-line-path]');
 let frame=0,start=0,duration=1000,visible=false,entered=false,pull=0,angle=0,from={pull:0,angle:0},strength=1;
 let line={a:'0.00',controlA:'55.00',controlB:'70.00',grip:'90.00',controlC:'250.00',end:'480.00'};
 root.dataset.motionState='idle';
 function measure(){
  const b=button.getBoundingClientRect(),svg=path.ownerSVGElement.getBoundingClientRect();
  if(!svg.width)return;
  const x=(b.left+b.width*.14-svg.left)/svg.width*1000;
  const grip=Math.max(90,Math.min(850,x));
  line={a:(grip-90).toFixed(2),controlA:(grip-35).toFixed(2),controlB:(grip-20).toFixed(2),grip:grip.toFixed(2),controlC:(grip+160).toFixed(2),end:Math.min(970,grip+390).toFixed(2)};
 }
 function draw(value){
  const y=(32+value).toFixed(2);
  path.setAttribute('d',`M0 32 H${line.a} C${line.controlA} 32 ${line.controlB} ${y} ${line.grip} ${y} S${line.controlC} ${(32+value*.55).toFixed(2)} ${line.end} 32 H1000`);
 }
 function settle(){if(frame)cancelAnimationFrame(frame);frame=0;pull=0;angle=0;art.style.transform='';draw(0);root.dataset.motionState='idle';}
 function tick(now){
  if(reduced.matches||document.hidden||!visible){settle();return;}
  const t=Math.min(1,(now-start)/duration),pose=footerPose(t),blend=1-t*t*(3-2*t);
  pull=pose.pull*strength+from.pull*blend;angle=pose.angle*strength+from.angle*blend;
  art.style.transform=`rotate(${angle.toFixed(3)}deg)`;draw(pull);
  if(t<1)frame=requestAnimationFrame(tick);else settle();
 }
 function react(kind='press'){
  if(reduced.matches||document.hidden||!visible)return;
  measure();
  if(frame)cancelAnimationFrame(frame);from={pull,angle};strength=kind==='enter'?.55:kind==='hover'?.65:1;duration=kind==='press'?1050:820;
  start=performance.now();root.dataset.motionState='playing';frame=requestAnimationFrame(tick);
 }
 button.addEventListener('click',()=>react());
 button.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse'&&root.dataset.motionState==='idle')react('hover');});
 new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(!visible)settle();else if(!entered){entered=true;react('enter');}},{threshold:.2}).observe(button);
 const resize=new ResizeObserver(()=>{measure();if(frame)settle();else draw(pull);});resize.observe(root);
 reduced.addEventListener('change',settle);document.addEventListener('visibilitychange',()=>{if(document.hidden)settle();});
 measure();draw(0);
}
