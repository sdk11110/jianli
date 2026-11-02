const root='assets/media/project-reels/';
export const clips={
 'watch-volume':{project:'手表内容量产',label:'批量生成',src:root+'watch/watch-volume-4k.mp4',mobileSrc:root+'watch/watch-volume-hd.mp4',poster:root+'watch/watch-volume-hq.webp',note:'项目解说片段 · 用影像介绍批量生产的工作思路。'},
 'watch-review':{project:'手表内容量产',label:'品检与返修',src:root+'watch/watch-review.mp4',poster:root+'watch/watch-review.jpg',note:'项目解说片段 · 说明质检与返修如何进入交付流程。'},
 'watch-delivery':{project:'手表内容量产',label:'规模交付',src:root+'watch/watch-delivery.mp4',poster:root+'watch/watch-delivery.jpg',note:'项目解说片段 · 交付数字以本页案例说明为准。'}
};
export const methodSteps=[
 {title:'先问清楚，作品用在哪里。',description:'把受众、设备、画幅和交付要求讲清楚，再开始生成。先确定验收标准，才能判断一张好看的图是否真的可用。',checks:['谁会看，在什么场景看？','画面必须传递哪一个信息？','最终按什么规格验收？'],label:'先确定使用场景'},
 {title:'给创作空间，也给清楚的边界。',description:'把角色特征、构图和镜头要求转成可检查的约束。先用少量样片确认方向，再把稳定的方法放进批量流程。',checks:['角色和风格保持一致','主体位置与景别服务信息','先验证样片，再进入量产'],label:'角色、构图与镜头约束'},
 {title:'好看之外，还要能用。',description:'先对齐使用场景，再判断画面质量。',checks:['主体与构图是否清楚','小屏裁切是否安全','规格与交付是否一致'],label:'对照主体、安全区与裁切'},
 {title:'交付的，是可继续使用的成果。',description:'对齐格式、命名、画幅和配套物料，把生成、品检、返修与导出接成闭环。保留异常记录，让下一次交付有据可循。',checks:['规格、命名与物料完整','问题能追溯，异常有记录','人工聚焦审核与例外修正'],label:'规格对齐，问题可回溯'}
];

