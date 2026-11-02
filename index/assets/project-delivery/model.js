(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.DeliveryModel = api;
})(typeof window === 'undefined' ? globalThis : window, function () {
  function chapterAt(progress) {
    return Math.max(0, Math.min(5, Math.floor(Number.isFinite(progress) ? progress : 0)));
  }
  function qualityRoute(kind, attempts = 1) {
    const rules = {
      context: { destination: attempts >= 2 ? '制作兜底' : '重新生图', detail: attempts >= 2 ? '连续两次自审不合格，数据回流给制作处理；通过品检后再进入交付。' : '先检查复用图片是否符合当前语境；不合格则打回重生，再进入审核。' },
      voice: { destination: '二次处理', detail: '视频出现人声由品检打回；对奇怪声音进行二次处理，再复检。' },
      motion: { destination: '打标跟进', detail: '运动类问题由品检打标签，保留问题类型，便于后续定位和修正。' },
      keyword: { destination: '重新生图', detail: '关键词表达不明确，重新生成图片，回到内容与语境检查。' }
    };
    return rules[kind] || null;
  }
  return { chapterAt, qualityRoute };
});
