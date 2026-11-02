const arrow = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 11 7-11 7z"/></svg>';
const tools = {
  directory: {
    title: '单元目录构建', description: '把教材映射表按单元归类，整理成可检查的目录。',
    steps: ['读取映射', '按单元归类', '输出目录'],
    progress: ['正在读取示例映射表…', '正在对齐单元与课题…', '目录结构已整理好。'],
    input: '第一单元\t认识图形\n第一单元\t图形的拼组\n第二单元\t认识时间\n第二单元\t时间的应用',
  },
  storyboard: {
    title: '教材图生视频', description: '先把教材意图拆成镜头，再进入生成和人工检查。',
    steps: ['确认知识点', '拆分镜头', '核对交付'],
    progress: ['正在读取示例知识点…', '正在按讲解顺序组织镜头…', '分镜检查单已准备好。'],
    input: [['知识点', '观察长方体的面、棱与顶点'], ['素材', '教材插图 + 讲解要点'], ['要求', '一次只讲清楚一个关系']],
  },
  presentation: {
    title: '项目汇报 H5', description: '把问题、做法与证据组织成一条可阅读的叙事线。',
    steps: ['提取问题', '编排内容', '对齐证据'],
    progress: ['正在读取示例项目提纲…', '正在编排内容与证据…', '页面结构已整理好。'],
    input: [['问题', '工具分散，同事难以找到使用入口'], ['做法', '统一工具说明、输入输出与操作流程'], ['证据', '可交互的页面与清楚的贡献归属']],
  },
};

export function initTrainingWorkbench(root = document.querySelector('[data-training-workbench]'), { reduced = matchMedia('(prefers-reduced-motion: reduce)') } = {}) {
  if (!root || root.dataset.initialized === 'true') return;
  root.dataset.initialized = 'true';
  const $ = selector => root.querySelector(selector);
  const $$ = selector => [...root.querySelectorAll(selector)];
  const library = $('[data-tw-library]');
  const detail = $('[data-tw-detail]');
  const tabs = $$('[data-tw-filter]');
  const rows = $$('[data-tw-tool]');
  const completed = new Map();
  let selectedFilter = 'all';
  let selectedTool = null;
  let opener = null;
  let animation = null;
  let running = null;
  let timers = new Set();
  let generation = 0;

  function animate(element, direction = 1) {
    animation?.cancel();
    if (reduced.matches || document.hidden || !element.animate) return;
    animation = element.animate([
      { opacity: .7, transform: `translateX(${direction * 8}px)` },
      { opacity: 1, transform: 'translateX(0)' },
    ], { duration: 260, easing: 'cubic-bezier(.16,1,.3,1)' });
    animation.finished.catch(() => {});
  }

  function stopRun() {
    generation++;
    for (const timer of timers) clearTimeout(timer);
    timers.clear();
    running = null;
    const button = $('[data-tw-run]');
    button.disabled = false;
    button.innerHTML = '运行示例' + arrow;
    root.removeAttribute('aria-busy');
  }

  function applyFilter(filter, focus = false) {
    if (!tabs.some(tab => tab.dataset.twFilter === filter)) return;
    const previous = tabs.findIndex(tab => tab.dataset.twFilter === selectedFilter);
    const current = tabs.findIndex(tab => tab.dataset.twFilter === filter);
    const changed = selectedFilter !== filter;
    selectedFilter = filter;
    tabs.forEach(tab => {
      const selected = tab.dataset.twFilter === filter;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
      if (selected) {
        $('#tw-tools').setAttribute('aria-labelledby', tab.id);
        if (focus) tab.focus();
      }
    });
    rows.forEach(row => row.hidden = filter !== 'all' && row.dataset.twCategory !== filter);
    $('[data-tw-filter-note]').textContent = filter === 'all'
      ? '三种场景，同一个可复用的入口。'
      : '点开流程，试一份本地示例。';
    if (changed) animate($('[data-tw-tools]'), current > previous ? 1 : -1);
  }

  function putInput(tool) {
    const input = $('[data-tw-input]');
    input.replaceChildren();
    if (typeof tool.input === 'string') {
      const pre = document.createElement('pre');
      pre.textContent = tool.input.replaceAll('\t', '  /  ');
      input.append(pre);
    } else {
      const lines = document.createElement('div');
      lines.className = 'tw-input-lines';
      tool.input.forEach(([label, text]) => {
        const line = document.createElement('p');
        const name = document.createElement('span');
        name.textContent = label;
        line.append(name, document.createTextNode(text));
        lines.append(line);
      });
      input.append(lines);
    }
  }

  function createResult(key) {
    if (key === 'directory') {
      const grouped = new Map();
      for (const row of tools.directory.input.split('\n')) {
        const [unit, lesson] = row.split('\t');
        if (!grouped.has(unit)) grouped.set(unit, []);
        grouped.get(unit).push(lesson);
      }
      const list = document.createElement('ul');
      list.className = 'tw-output-tree';
      const text = [];
      for (const [unit, lessons] of grouped) {
        const item = document.createElement('li');
        const title = document.createElement('strong');
        title.textContent = unit;
        const childList = document.createElement('ul');
        lessons.forEach(lesson => { const li = document.createElement('li'); li.textContent = lesson; childList.append(li); });
        item.append(title, childList);
        list.append(item);
        text.push(unit, ...lessons.map(lesson => '  ' + lesson));
      }
      return { element: list, text: text.join('\n'), note: '已按单元归类，原始课题顺序保持不变。' };
    }
    const scenes = key === 'storyboard'
      ? [['整体观察', '先展示完整形体，明确要观察的对象。'], ['局部聚焦', '依次标出面、棱和顶点，避免同时堆叠信息。'], ['回到问题', '用一个观察任务检查概念是否讲清楚。']]
      : [['问题与场景', '为什么需要统一入口，谁会使用？'], ['方法与体验', '工具怎样找到，输入输出怎样对齐？'], ['证据与复用', '展示可用页面，保留贡献与使用边界。']];
    const list = document.createElement('ol');
    list.className = 'tw-output-scenes';
    scenes.forEach(([title, text], index) => {
      const item = document.createElement('li');
      const count = document.createElement('span');
      count.textContent = String(index + 1).padStart(2, '0');
      const copy = document.createElement('div');
      const heading = document.createElement('strong');
      heading.textContent = title;
      const description = document.createElement('p');
      description.textContent = text;
      copy.append(heading, description);
      item.append(count, copy);
      list.append(item);
    });
    return {
      element: list,
      text: scenes.map(([title, text], index) => `${index + 1}. ${title}\n${text}`).join('\n\n'),
      note: key === 'storyboard' ? '此处演示分镜组织，不在本页生成视频。' : '此处演示内容编排，不在本页发布网站。',
    };
  }

  function showResult(key, reveal = true) {
    const result = createResult(key);
    completed.set(key, result.text);
    const note = document.createElement('p');
    note.className = 'tw-output-note';
    note.textContent = result.note;
    $('[data-tw-result]').replaceChildren(result.element, note);
    $('[data-tw-output]').hidden = false;
    $$('[data-tw-steps] li').forEach(item => item.dataset.complete = 'true');
    $('[data-tw-copy]').firstChild.textContent = '复制结果';
    if (reveal) animate($('[data-tw-output]'));
  }

  function openTool(key, button) {
    const tool = tools[key];
    if (!tool) return;
    stopRun();
    selectedTool = key;
    opener = button;
    $('[data-tw-detail-title]').textContent = tool.title;
    $('[data-tw-description]').textContent = tool.description;
    $('[data-tw-steps]').replaceChildren(...tool.steps.map((text, index) => {
      const li = document.createElement('li');
      const number = document.createElement('span');
      number.textContent = String(index + 1);
      const label = document.createElement('strong');
      label.textContent = text;
      li.append(number, label);
      return li;
    }));
    putInput(tool);
    $('[data-tw-output]').hidden = true;
    $('[data-tw-status]').textContent = '本地示例，不调用生成服务。';
    library.hidden = true;
    detail.hidden = false;
    if (completed.has(key)) {
      showResult(key, false);
      $('[data-tw-status]').textContent = '示例已完成，可以复制或重新运行。';
    }
    animate(detail);
    $('[data-tw-back]').focus({ preventScroll: true });
  }

  function backToLibrary() {
    stopRun();
    detail.hidden = true;
    library.hidden = false;
    animate(library, -1);
    opener?.focus({ preventScroll: true });
  }

  function completeRun(key, token) {
    if (token !== generation || selectedTool !== key) return;
    timers.clear();
    running = null;
    const tool = tools[key];
    root.removeAttribute('aria-busy');
    $('[data-tw-run]').disabled = false;
    $('[data-tw-run]').innerHTML = '再运行一次' + arrow;
    $('[data-tw-status]').textContent = tool.progress[2];
    showResult(key);
  }

  function run() {
    if (!selectedTool || running) return;
    const key = selectedTool, tool = tools[key];
    const token = ++generation;
    running = { key, token };
    root.setAttribute('aria-busy', 'true');
    $('[data-tw-run]').disabled = true;
    $('[data-tw-run]').textContent = '正在整理…';
    $('[data-tw-output]').hidden = true;
    $$('[data-tw-steps] li').forEach((item, index) => item.dataset.complete = String(index === 0));
    $('[data-tw-status]').textContent = tool.progress[0];
    if (reduced.matches || document.hidden) { completeRun(key, token); return; }
    const stage = setTimeout(() => {
      timers.delete(stage);
      if (token !== generation) return;
      $$('[data-tw-steps] li').forEach((item, index) => item.dataset.complete = String(index < 2));
      $('[data-tw-status]').textContent = tool.progress[1];
    }, 280);
    const done = setTimeout(() => { timers.delete(done); completeRun(key, token); }, 680);
    timers.add(stage);timers.add(done);
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => applyFilter(tab.dataset.twFilter));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      else if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = tabs.length - 1;
      else return;
      event.preventDefault();
      applyFilter(tabs[next].dataset.twFilter, true);
    });
  });
  $$('[data-tw-open]').forEach(button => button.addEventListener('click', () => openTool(button.dataset.twOpen, button)));
  $('[data-tw-back]').addEventListener('click', backToLibrary);
  $('[data-tw-run]').addEventListener('click', run);
  $('[data-tw-copy]').addEventListener('click', async () => {
    const text = completed.get(selectedTool);
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      $('[data-tw-status]').textContent = '示例结果已复制。';
      $('[data-tw-copy]').firstChild.textContent = '已复制';
    } catch {
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents($('[data-tw-result]'));
      selection.removeAllRanges();selection.addRange(range);
      $('[data-tw-status]').textContent = '请复制已选中的示例结果。';
    }
  });
  function finishPending() {
    animation?.cancel();
    if (running) {
      const { key, token } = running;
      for (const timer of timers) clearTimeout(timer);
      timers.clear();
      completeRun(key, token);
    }
  }
  document.addEventListener('visibilitychange', () => { if (document.hidden) finishPending(); });
  reduced.addEventListener('change', () => { if (reduced.matches) finishPending(); });
  applyFilter('all');
  return { openTool, backToLibrary, applyFilter, finish: finishPending };
}
