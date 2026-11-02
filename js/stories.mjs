export const reactions = [
  { text: '我服了。', aside: '先把这件事做出来。' },
  { text: '又咋了？', aside: '说吧，我在听。' },
  { text: '我就知道。', aside: '那就多准备一个方案。' },
];

export function reactionAt(index) {
  const turn = Number.isFinite(index) ? Math.trunc(index) : 0;
  return reactions[((turn % reactions.length) + reactions.length) % reactions.length];
}

export function panelState(index, total) {
  const count = Number.isFinite(total) ? Math.max(0, Math.trunc(total)) : 0;
  const requested = Number.isFinite(index) ? Math.trunc(index) : 0;
  const current = Math.max(0, Math.min(requested, Math.max(0, count - 1)));
  return {
    index: current,
    previousDisabled: current === 0,
    isLast: count === 0 || current === count - 1,
    progress: count ? `${current + 1} / ${count}` : '0 / 0',
  };
}

export function chapterState(index, total = episodeCatalog.length) {
  const count = Number.isFinite(total) ? Math.max(0, Math.trunc(total)) : 0;
  const requested = Number.isFinite(index) ? Math.trunc(index) : 0;
  const current = Math.max(0, Math.min(requested, Math.max(0, count - 1)));
  return {
    index: current,
    previousDisabled: current === 0,
    nextDisabled: count === 0 || current === count - 1,
    progress: count ? `${current + 1} / ${count}` : '0 / 0',
  };
}

export function chapterTransition(fromIndex, toIndex, total = episodeCatalog.length) {
  const count = Number.isFinite(total) ? Math.max(0, Math.trunc(total)) : 0;
  const clamp = value => {
    const requested = Number.isFinite(value) ? Math.trunc(value) : 0;
    return Math.max(0, Math.min(requested, Math.max(0, count - 1)));
  };
  const from = clamp(fromIndex);
  const to = clamp(toIndex);
  const state = chapterState(to, count);
  return {
    from,
    to,
    direction: to > from ? 'forward' : to < from ? 'backward' : 'none',
    changed: from !== to,
    previousDisabled: state.previousDisabled,
    nextDisabled: state.nextDisabled,
  };
}

export const firstEpisode = {
  id: 'price',
  title: '本来只是比个价',
  subtitle: '一张表，最后变成了一个入口。',
  panels: [
    'assets/production/episode-01-1.webp',
    'assets/production/episode-01-2.webp',
    'assets/production/episode-01-3.webp',
  ],
  captions: [
    '接到一个看起来不大的任务：比较一下方案。',
    '方案各有不同，先对齐评价标准，再把反馈放到同一个入口。',
    '本来只是比个价，最后做出了一个网站。',
  ],
};

export const episodeCatalog = [
  firstEpisode,
  {
    id: 'binding',
    title: '第三个视频去哪了',
    subtitle: '当选择数量和绑定逻辑没有一起长大。',
    panels: [
      'assets/production/episodes/episode-02-1.webp',
      'assets/production/episodes/episode-02-2.webp',
      'assets/production/episodes/episode-02-3.webp',
    ],
    captions: [
      '三个视频被选上了，图片只来了两张。',
      '第三个视频没有绑定内容——它安静地看着我。',
      '补上联动校验，终于不用靠猜。',
    ],
    notes: [
      '三个视频，两个图片槽',
      '第三个：未绑定',
      '补上联动校验',
    ],
  },
  {
    id: 'healthy',
    title: '这个项目不太健康',
    subtitle: '上线很快，不代表每天都要救火。',
    panels: [
      'assets/production/episodes/episode-03-1.webp',
      'assets/production/episodes/episode-03-2.webp',
      'assets/production/episodes/episode-03-3.webp',
    ],
    captions: [
      '项目节奏快到，日历都开始喘气。',
      '成本、返修和临时需求挤在同一条路上。',
      '把交付节奏调回能长期工作的速度。',
    ],
    notes: [
      '日历开始喘气',
      '需求 / 成本 / 返修',
      '先把节奏救回来',
    ],
  },
  {
    id: 'soulmate',
    title: '我可能不是在找供应商，是在找灵魂伴侣',
    subtitle: '需求写得太细，对方开始思考人生。',
    panels: [
      'assets/production/episodes/episode-04-1.webp',
      'assets/production/episodes/episode-04-2.webp',
      'assets/production/episodes/episode-04-3.webp',
    ],
    captions: [
      '先问清楚尺寸、帧率和镜头稳定性。',
      '对方沉默的时间，足够我再写一页需求。',
      '我可能不是在比价，是在找灵魂伴侣。',
    ],
    notes: [
      '尺寸 / 帧率 / 镜头稳定性',
      '等待回复中……',
      '标准先对齐。',
    ],
  },
  {
    id: 'fallback',
    title: '一条兜底提示词',
    subtitle: '当画面终于学会不要自作主张。',
    panels: [
      'assets/production/episodes/episode-05-1.webp',
      'assets/production/episodes/episode-05-2.webp',
      'assets/production/episodes/episode-05-3.webp',
    ],
    captions: [
      '第一版很有想法，想法有点太多。',
      '把构图、人物和镜头一条条锁住。',
      '一条兜底提示词，合格率终于抬头。',
    ],
    notes: [
      '想法太多',
      '保持原图，不新增人物',
      '兜底模板：先稳住画面',
    ],
  },
  {
    id: 'review',
    title: '评审会是场开卷考试',
    subtitle: '文档带了，但总有一题藏在现场。',
    panels: [
      'assets/production/episodes/episode-06-1.webp',
      'assets/production/episodes/episode-06-2.webp',
      'assets/production/episodes/episode-06-3.webp',
    ],
    captions: [
      '评审前：这次应该准备得挺全。',
      '评审中：英语题型未上线的题量是多少？',
      '打开群聊，现场补上最后一页答案。',
    ],
    notes: [
      '评审前：应该准备全了',
      '现场追加问题',
      '打开群聊补答案',
    ],
  },
];

export function chapterAtIndex(index) {
  const state = chapterState(index, episodeCatalog.length);
  return episodeCatalog[state.index] || episodeCatalog[0];
}

export const heroTimeline = {
  durationMs: 7500,
  maxLoops: 2,
  beats: [
    { id: 'reveal', start: 0, end: 700 },
    { id: 'character', start: 700, end: 1400 },
    { id: 'workflow', start: 1400, end: 2600 },
    { id: 'dialogue', start: 2600, end: 4000 },
    { id: 'comic-rail', start: 4000, end: 5800 },
    { id: 'settle', start: 5800, end: 7500 },
  ],
};
