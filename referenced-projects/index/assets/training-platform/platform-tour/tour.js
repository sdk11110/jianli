(() => {
  'use strict';
  const model = window.PlatformTour;
  if (!model) return;
  const $ = selector => document.querySelector(selector);
  const screen = $('#module-screen');
  const tabs = [...document.querySelectorAll('[data-module]')];
  let activeModule = 'library';
  let courseStatus = 'draft';
  let pipelineType = 'tool';
  let pipelineIndex = 0;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const tabLayout = window.matchMedia('(max-width: 760px)');
  function updateTabOrientation(){ document.querySelector('.module-tabs').setAttribute('aria-orientation', tabLayout.matches?'horizontal':'vertical'); }
  tabLayout.addEventListener?.('change',updateTabOrientation);updateTabOrientation();
  function revealDetail(element){element.hidden=false;element.tabIndex=-1;element.focus({preventScroll:true});element.scrollIntoView({behavior:reduced?'auto':'smooth',block:'nearest'});}
  const labels = { library:'工具库', requirements:'需求池', training:'培训中心', space:'我的空间', cockpit:'贡献看板', admin:'管理后台' };
  const moduleCopy = {
    library: ['找到能力，也找到使用方法。', '按业务分类定位工具，读懂场景、输入和输出，再进入详情试用与反馈。'],
    requirements: ['下一件值得做的事，从问题开始。', '把角色、任务、痛点和方案留在同一处。状态筛选与详情帮助团队判断优先级。'],
    training: ['从会用工具，到交付自己的作品。', '学习路径与业务实操分开组织。培训 H5 保留完整步骤，而不只是一个下载入口。'],
    space: ['用过的能力，成为自己的工作资产。', '个人空间连接使用记录与学习沉淀。估算收益和演示条目需要明确区分。'],
    cockpit: ['看清建设、使用与反馈。', '管理员按近 30 天和累计口径查看贡献，不把上传数量直接等同于业务收益。'],
    admin: ['让课程能更新，让平台能维护。', '账号、角色、工具和课程有各自的维护入口。这里仅演示课程状态，不修改真实平台。']
  };
  function toolMarkup(items) {
    if (!items.length) return '<p class="empty">此分类暂无示例，请选择其他分类。</p>';
    return items.map(tool => `<article class="tool-entry"><div class="tool-mark" aria-hidden="true">${tool.mark}</div><div class="tool-info"><span class="tag">${tool.categoryName} / ${tool.type}</span><h4>${tool.name}</h4><p>${tool.scene}</p><dl><dt>输入</dt><dd>${tool.input}</dd><dt>输出</dt><dd>${tool.output}</dd></dl></div><button class="text-button" data-tool="${tool.id}">查看详情 <span aria-hidden="true">↗</span></button></article>`).join('');
  }
  function libraryMarkup() {
    return `<div class="screen-heading"><div><h3>AI 能力库</h3><p>找场景 · 看输入输出 · 立即使用</p></div><span class="screen-count">3 项工具 · 本地示例</span></div><div class="segmented" aria-label="示例工具分类">${[['all','全部'],['data','数据处理'],['content','内容生产'],['design','图片处理']].map(([id,label])=>`<button data-cat="${id}" aria-pressed="${id==='all'}">${label}</button>`).join('')}</div><div id="tool-list" class="tool-list">${toolMarkup(model.tools)}</div><div id="tool-detail" class="tool-detail" hidden></div>`;
  }
  function needsMarkup(status='all') {
    return model.filterNeeds(status).map(need=>`<button class="need-item ${need.status}" data-need="${need.id}"><span class="need-status">${need.status==='done'?'已处理':'待处理'}</span><strong>${need.title}</strong><small>${need.theme}</small><span aria-hidden="true">↗</span></button>`).join('');
  }
  const lessonData = [
    ['AI 入门','认识平台与上手路径'], ['Prompt 基础','提问公式与实战案例'], ['AI 工具应用','生 H5、豆包上手两条分支'], ['自动化工作流','脚本批处理与挖需求']
  ];
  function panelMarkup(id) {
    if (id === 'library') return libraryMarkup();
    if (id === 'requirements') return `<div class="screen-heading"><div><h3>需求池</h3><p>筛选状态，点开问题与方案</p></div><span class="screen-count">示例，非线上需求</span></div><div class="segmented">${[['all','全部'],['pending','待处理'],['done','已处理']].map(([key,label])=>`<button data-need-filter="${key}" aria-pressed="${key==='all'}">${label}</button>`).join('')}</div><div id="need-list" class="need-list">${needsMarkup()}</div><div id="need-detail" class="explain-inline"><h4>需求不止是一个标题</h4><p>点击上方条目，查看痛点和改进方案。原平台另有气泡图，以面积、颜色、虚实区分紧急度、主题与落地状态。</p></div>`;
    if (id === 'training') return `<div class="screen-heading"><div><h3>培训中心</h3><p>学习路径 / 业务实操 / 课程体验</p></div><a class="small-button" href="../ai-h5/index.html">打开培训 H5 ↗</a></div><div class="lesson-list">${lessonData.map(([title,hint],i)=>`<button data-lesson="${i}" aria-pressed="${i===0}"><span class="lesson-number">${i+1}</span><span><strong>${title}</strong><small>${hint}</small></span><span aria-hidden="true">↗</span></button>`).join('')}<div class="lesson-unavailable"><span>AI 专家</span><small>进阶路径预留</small></div></div><div id="lesson-detail" class="explain-inline"><h4>先认识平台，再完成自己的交付</h4><p>点击学习路径查看讲解。课程完成标记与有效学习时长分别记录，不代表自动评测掌握程度。</p></div>`;
    if (id === 'space') return `<div class="screen-heading"><div><h3>我的空间</h3><p>个人资产与口径说明</p></div><span class="screen-count">示例数据 · 非真实账号</span></div><div class="space-ledger"><article><span>使用记录</span><h4>我的工具</h4><p>汇总点赞或下载过的工具，去重后再次访问。</p></article><article><span>估算口径</span><h4>我的收益</h4><p>去重后的工具 × 单次节省时间，不是实测累计工时。</p></article><article><span>示例条目</span><h4>我的工作流</h4><p>当前为固定工作流展示，帮助理解结构，不是可执行编排。</p></article><article><span>示例条目</span><h4>收藏 Prompt</h4><p>当前为示例列表，用于说明空间里还能沉淀什么。</p></article></div>`;
    if (id === 'cockpit') return `<div class="screen-heading"><div><h3>AI 贡献看板</h3><p>建设、使用、反馈分开看</p></div><span class="role-mark">管理员视角</span></div><div class="metric-ledger"><div><span>建设</span><strong>上传记录</strong><p>新增工具 / 累计工具</p></div><div><span>使用</span><strong>有效活动</strong><p>近 30 天 / 累计记录</p></div><div><span>反馈</span><strong>评分记录</strong><p>工具评分 / 讨论反馈</p></div></div><h4>看板之后，回到具体记录</h4><ul class="plain-list"><li>各组贡献榜与工具评分榜</li><li>近 30 天活动趋势与热门工具</li><li>账号数据按关键词、组别、活跃状态筛选</li></ul><p class="screen-note">本展厅不填假业绩数字，也不展示真实账号明细。</p>`;
    return `<div class="screen-heading"><div><h3>培训课程管理</h3><p>在本地体验一次课程状态变化</p></div><span class="role-mark">管理员视角</span></div><article class="course-editor"><div class="course-cover" aria-hidden="true">H5<span>COURSE</span></div><div><span class="tag">本地示例课程</span><h4>内容团队 AI 工作流</h4><p>完整课程包 · 入口页 + 相对资源</p><span id="course-status" class="course-status">草稿</span></div></article><div class="course-actions"><button class="small-button" id="course-toggle">发布示例课程</button><button class="text-button" id="course-reset">重置示例</button></div><p id="course-feedback" class="screen-note" role="status">这是页面内的状态演示，不会上传文件或发布真实课程。</p><details class="role-details"><summary>查看角色边界</summary><p>普通用户可以查看、上传、反馈和学习；管理员维护账号、工具、需求状态及课程。</p></details>`;
  }
  function switchModule(id, focus=false) {
    if (!Object.hasOwn(labels,id)) return;
    activeModule = id;
    if (id === 'admin') courseStatus = 'draft';
    tabs.forEach(tab=>{ const selected=tab.dataset.module===id; tab.setAttribute('aria-selected',selected);tab.tabIndex=selected?0:-1; });
    screen.setAttribute('aria-labelledby',`tab-${id}`);
    $('#module-thesis').textContent=moduleCopy[id][0];
    $('#module-description').textContent=moduleCopy[id][1];
    screen.innerHTML=panelMarkup(id);
    if(!reduced)screen.animate([{opacity:.68,transform:'translateY(5px)'},{opacity:1,transform:'none'}],{duration:220,easing:'cubic-bezier(.23,1,.32,1)'});
    if (focus) tabs.find(tab=>tab.dataset.module===id).focus();
  }
  tabs.forEach((tab,index)=>{
    tab.addEventListener('click',()=>switchModule(tab.dataset.module));
    tab.addEventListener('keydown',event=>{
      let next=index;
      if (event.key==='ArrowRight'||event.key==='ArrowDown') next=(index+1)%tabs.length;
      else if(event.key==='ArrowLeft'||event.key==='ArrowUp') next=(index+tabs.length-1)%tabs.length;
      else if(event.key==='Home') next=0;
      else if(event.key==='End') next=tabs.length-1;
      else return;
      event.preventDefault();switchModule(tabs[next].dataset.module,true);
    });
  });
  screen.addEventListener('click',event=>{
    const button=event.target.closest('button'); if(!button)return;
    if(button.dataset.cat){
      screen.querySelectorAll('[data-cat]').forEach(b=>b.setAttribute('aria-pressed',b===button));
      $('#tool-list').innerHTML=toolMarkup(model.filterTools(button.dataset.cat));$('#tool-detail').hidden=true;
    }
    if(button.dataset.tool){
      const tool=model.tools.find(t=>t.id===button.dataset.tool);
      $('#tool-detail').innerHTML=`<h4>${tool.name}</h4><p class="contribution-note">工具由同事贡献 · 此处演示平台如何组织说明与反馈</p><dl><dt>使用场景</dt><dd>${tool.scene}</dd><dt>准备输入</dt><dd>${tool.input}</dd><dt>获得输出</dt><dd>${tool.output}</dd></dl><p>下方可调整示例评分，观察四维权重如何形成综合分。不会提交到正式平台。</p><div class="rating-form">${[['实用性',30],['易用性',25],['稳定性',25],['说明完整',20]].map(([name,weight],i)=>`<label>${name} <small>${weight}%</small><select data-score="${i}" aria-label="${name}示例评分">${[1,2,3,4,5].map(v=>`<option ${v===4?'selected':''}>${v}</option>`).join('')}</select></label>`).join('')}</div><p class="rating-result">示例综合分 <output id="rating-result">4.0</output> / 5</p>`;
      revealDetail($('#tool-detail'));
    }
    if(button.dataset.needFilter){screen.querySelectorAll('[data-need-filter]').forEach(b=>b.setAttribute('aria-pressed',b===button));$('#need-list').innerHTML=needsMarkup(button.dataset.needFilter);}
    if(button.dataset.need){const need=model.needs.find(n=>n.id===button.dataset.need);$('#need-detail').innerHTML=`<h4>${need.title}</h4><dl><dt>痛点</dt><dd>${need.pain}</dd><dt>方案</dt><dd>${need.plan}</dd></dl>`;}
    if(button.dataset.lesson!==undefined){const i=Number(button.dataset.lesson);screen.querySelectorAll('[data-lesson]').forEach(b=>b.setAttribute('aria-pressed',b===button));$('#lesson-detail').innerHTML=`<h4>${lessonData[i][0]}</h4><p>${lessonData[i][1]}。${i===2?'生 H5 培训已打包在本目录，可直接打开体验。':'完整课程属于原平台，本地导览说明它在学习路径中的作用。'}</p>${i===2?'<a class="text-button" href="../ai-h5/index.html">进入本地生 H5 培训 ↗</a>':''}`;}
    if(button.id==='course-toggle'||button.id==='course-reset'){
      courseStatus=button.id==='course-reset'?'draft':model.nextCourseStatus(courseStatus);
      $('#course-status').textContent={draft:'草稿',published:'已发布（本地演示）',archived:'已下架（本地演示）'}[courseStatus];
      $('#course-toggle').textContent=courseStatus==='published'?'下架演示课程':'发布演示课程';
      $('#course-feedback').textContent=courseStatus==='published'?'演示状态已发布。真实平台发布后，课程出现在培训中心。':courseStatus==='archived'?'演示状态已下架。真实平台会限制普通用户继续访问。':'已重置为草稿，未修改真实平台。';
    }
  });
  screen.addEventListener('change',event=>{
    if(!event.target.matches('[data-score]'))return;
    const score=model.score([...screen.querySelectorAll('[data-score]')].map(s=>Number(s.value)));
    $('#rating-result').textContent=score===null?'—':score.toFixed(1);
  });
  function renderPipeline(){
    const current=model.step(pipelineType,pipelineIndex);pipelineIndex=current.index;
    document.querySelectorAll('[data-pipeline-type]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.pipelineType===pipelineType));
    $('#pipeline-steps').innerHTML=model.pipelines[pipelineType].map((step,i)=>`<button data-step="${i}" ${i===pipelineIndex?'aria-current="step"':''}><span>${String(i+1).padStart(2,'0')}</span>${step[0]}</button>`).join('');
    $('#step-title').textContent=current.title;$('#step-description').textContent=current.description;$('#step-label').textContent=current.label;$('#step-value').textContent=current.value;$('#step-count').textContent=`${pipelineIndex+1} / ${current.count}`;
    $('#step-prev').disabled=pipelineIndex===0;$('#step-next').disabled=pipelineIndex===current.count-1;
  }
  document.querySelectorAll('[data-pipeline-type]').forEach(button=>button.addEventListener('click',()=>{pipelineType=button.dataset.pipelineType;pipelineIndex=0;renderPipeline();}));
  $('#pipeline-steps').addEventListener('click',event=>{const b=event.target.closest('[data-step]');if(!b)return;pipelineIndex=Number(b.dataset.step);renderPipeline();document.querySelector(`[data-step="${pipelineIndex}"]`).focus();});
  $('#step-prev').addEventListener('click',()=>{pipelineIndex--;renderPipeline();if($('#step-prev').disabled)$('#step-next').focus();});
  $('#step-next').addEventListener('click',()=>{pipelineIndex++;renderPipeline();if($('#step-next').disabled)$('#step-prev').focus();});
  document.querySelectorAll('a[href^="#"]').forEach(link=>link.addEventListener('click',()=>{const target=document.getElementById(link.hash.slice(1));const details=target?.closest('details');if(details)details.open=true;}));
  const openHash=()=>{const target=document.getElementById(location.hash.slice(1));const details=target?.closest('details');if(details){details.open=true;requestAnimationFrame(()=>target.scrollIntoView());}};
  window.addEventListener('hashchange',openHash);
  switchModule(activeModule);renderPipeline();openHash();document.documentElement.classList.add('js');
})();
