export function navigateReader(state,direction,chapters) {
 if(!chapters.length)return {chapter:0,panel:0,complete:true};
 const bounded=(n,max)=>Math.min(max,Math.max(0,Number.isFinite(n)?Math.trunc(n):0));
 let chapter=bounded(state.chapter,chapters.length-1);
 let panel=bounded(state.panel,Math.max(0,chapters[chapter]-1)),complete=false;
 if(direction==='next'){if(panel<chapters[chapter]-1)panel++;else if(chapter<chapters.length-1){chapter++;panel=0;}else complete=true;}
 else if(direction==='previous'){if(panel>0)panel--;else if(chapter>0){chapter--;panel=Math.max(0,chapters[chapter]-1);}}
 return {chapter,panel,complete};
}
