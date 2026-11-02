(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.PlatformTour = api;
})(typeof window === 'undefined' ? globalThis : window, function () {
  const tools = [
    { id: 'directory', category: 'data', categoryName: '数据处理', name: '验收表拆分', scene: '按供应商拆表并汇总工作量', input: '总 Excel 表', output: '各供应商工作量表', type: '同事贡献工具', mark: '拆表' },
    { id: 'textbook', category: 'content', categoryName: '内容生产', name: '教材内容核对', scene: '辅助检查新旧教材内容差异', input: '教材图片文件夹', output: '内容对比报告', type: '同事贡献工具', mark: '核对' },
    { id: 'report', category: 'design', categoryName: '图片处理', name: '单词图片转三套规格', scene: '一次任务输出三套图片尺寸', input: '原始图片路径', output: '大图、标准图与小图', type: '同事贡献工具', mark: '图片' }
  ];
  const needs = [
    { id: 'n1', title: '减少重复录入', status: 'pending', theme: '数据处理', pain: '相同信息需要在不同表格中反复填写。', plan: '先梳理输入输出字段，再评估批处理方案。' },
    { id: 'n2', title: '让操作方法可复用', status: 'pending', theme: '培训赋能', pain: '工具可用，但新同事缺少上手步骤。', plan: '把操作路径和典型问题整理为完整培训 H5。' },
    { id: 'n3', title: '按供应商拆分验收表', status: 'done', theme: '内容生产', pain: '拆表和工作量换算依赖手工处理。', plan: '在这个本地示例中，已关联“验收表拆分”工具。' }
  ];
  const pipelines = {
    tool: [
      ['提交站点', '选择完整文件夹、HTML 或 ZIP。已有在线地址可以直接登记，不重复部署。', '输入', '完整站点与资源'],
      ['识别与存档', '识别静态站点入口，将文件留存在工具目录；普通脚本不会变成静态网站。', '本地', '工具目录存档'],
      ['自动发布', '把完整站点发布到可访问地址，并保留可追踪的路径映射。', '发布', '可访问链接'],
      ['等待上线', '页面部署需要时间。提交完成不等于站点已可访问。', '状态', '部署中 / 已发布 / 失败'],
      ['回写结果', '把地址与状态写回详情页。上传者可检查与重发，避免重复创建工具。', '结果', '地址 + 状态']
    ],
    training: [
      ['上传课程包', '管理员填写课程标题、简介、分类与状态，提交完整课程包。', '输入', '课程信息 + 完整包'],
      ['校验资源', '检查入口文件、危险路径与体积，保证课程包可安全打开。', '校验', '入口 / 安全 / 体积'],
      ['存入课程库', '资源保存在可配置的课程目录，不随代码发布一并清空。', '存储', '课程持久化目录'],
      ['发布至培训中心', '草稿经发布后出现在培训中心；管理员可替换、调整排序或下架。', '状态', '草稿 → 已发布 → 已下架'],
      ['受保护预览', '课程在登录保护下预览，记录进度与有效学习；下架后普通用户不可继续访问。', '结果', '可学习的课程']
    ]
  };
  return {
    tools, needs, pipelines,
    filterTools: category => tools.filter(item => category === 'all' || item.category === category),
    filterNeeds: status => needs.filter(item => status === 'all' || item.status === status),
    score(values) {
      if (!Array.isArray(values) || values.length !== 4 || values.some(v => !Number.isInteger(v) || v < 1 || v > 5)) return null;
      return Math.round(values.reduce((total, value, i) => total + value * [0.3, 0.25, 0.25, 0.2][i], 0) * 10) / 10;
    },
    step(type, index) {
      type = Object.hasOwn(pipelines, type) ? type : 'tool';
      const steps = pipelines[type];
      index = Number.isFinite(index) ? Math.max(0, Math.min(steps.length - 1, Math.floor(index))) : 0;
      const [title, description, label, value] = steps[index];
      return { type, index, title, description, label, value, count: steps.length };
    },
    nextCourseStatus: status => status === 'published' ? 'archived' : 'published'
  };
});
