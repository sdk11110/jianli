---
name: 把交付串起来
description: 面试展示版项目经历，继承作品集的暗色摄影、衬线标题与浅金强调。
colors:
  night: "#0b161c"
  paper: "#eee9df"
  ink: "#f0eee7"
  muted: "#a6b8bd"
  gold: "#dbbe90"
  teal: "#aedbd7"
  line: "#607b8045"
typography:
  display:
    fontFamily: '"Noto Serif SC", "Source Han Serif SC", SimSun, serif'
    fontSize: "clamp(48px,6.5vw,96px)"
    fontWeight: 400
    lineHeight: 1.22
    letterSpacing: "-.035em"
  headline:
    fontFamily: '"Noto Serif SC", "Source Han Serif SC", SimSun, serif'
    fontSize: "clamp(32px,3.6vw,56px)"
    fontWeight: 400
    lineHeight: 1.35
    letterSpacing: "-.03em"
  body:
    fontFamily: '"Segoe UI", "Microsoft YaHei", sans-serif'
    fontSize: "15px"
    lineHeight: 1.95
spacing:
  gutter: "clamp(24px,6vw,100px)"
components:
  quality-option:
    backgroundColor: "transparent"
    textColor: "#bed0d2"
    padding: "10px 12px"
  quality-option-selected:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.night}"
    padding: "10px 12px"
  motion-button:
    backgroundColor: "transparent"
    textColor: "{colors.muted}"
    padding: "10px 0"
  text-link:
    padding: "14px 0"
  record:
    backgroundColor: "{colors.paper}"
    textColor: "#243940"
---

# Design System: 把交付串起来

## Overview

本文记录 `index.html`、`styles.css`、`app.js` 与 `model.js` 的现有实现，范围仅为本目录的独立 H5。视觉主线是「把交付串起来」：用深色摄影承载叙事，用一条金青色纤维带和六阶段路径连接工作环节。

页面延续个人作品集的电影感、象牙白衬线大字与浅金强调。文本承担事实表达，程序图形承担过程示意；面试展示口径使用角色称谓。

**Key Characteristics:**

- 暗色摄影底与大面积留白，细线分隔内容。
- 衬线标题配无衬线正文，强调文字保持正体。
- 六阶段滚动导航、路径与图注联动。
- 奶油色进度记录形成清晰的阅读转场。

## Colors

### Primary

浅金 `gold` 用于标题强调、当前章节、路径节点和选中控件。

### Secondary

浅青 `teal` 参与流程路径渐变；Canvas 纤维使用独立的半透明金青描边，具体透明度随纤维位置变化。

### Neutral

`night` 为底色，`ink` 为主要文字，`muted` 为说明文字，`line` 为轻分隔。`paper` 仅在进度记录形成亮色阅读区域，其中改用深色正文。

## Typography

标题使用系统可用的中文衬线字体栈，正文与标签使用系统无衬线字体栈；页面没有加载网络字体。前置 token 的 body 对应首屏说明，其余正文按内容层级使用 13–16px，行高多为 1.85–1.95。

章节标题保持轻字重和较紧字距。数字章节、日期及计数使用等宽数字特性。小号标签辅助定位，不替代完整说明。移动端首屏标题调整为 `clamp(35px,8.8vw,64px)`，章节标题为 `clamp(31px,8vw,44px)`。

## Layout

公共左右留白由 gutter 控制。首屏至少占一屏，文字偏左，纤维带偏右。开场为 1:2 双栏；正文为约 1.1:1 双栏，间距 8vw，右侧路径在滚动时固定，左侧每章至少一屏。

章节导航贴顶，六个锚点始终可见，底部细进度线随滚动推进。进度记录按日期与内容分栏；收尾价值说明为三栏。

在 1000px 及以下收紧间距；760px 及以下正文改为单栏、隐藏右侧路径、章节取消整屏最小高度，导航保留六项，规则选项改为两列，收尾说明纵向排列。1600px 及以上加大叙事与路径间距。打印版隐藏背景、导航、路径和交互示意，采用白底正文。

## Elevation & Depth

不使用卡片阴影。深度来自固定摄影背景、渐变遮罩、半透明章节底以及前景纤维带。背景引用既有 `../visuals/wenchuang/hero-main.png`；离开首屏后纤维带淡化，避免干扰长文。

## Shapes

主要容器以直线、矩形和细边界组织。圆形仅用于路径节点与记录状态点；没有统一的圆角 token。不要把浏览器默认控件圆角推定为设计尺度。

## Components

- **文本链接：** 下划线式细边界，右侧线性箭头；悬停变浅金，箭头向下移动 4px。键盘焦点统一使用浅金 2px 描边，向外偏移 6px。
- **动效按钮：** 无底无边框，文字随状态切换；用户可暂停或继续 Canvas 动画。系统减少动态效果时显示静态模式并禁用按钮。
- **章节导航与路径：** 当前锚点标记 `aria-current="step"`；路径节点区分当前、经过、未到达。滚动同步计数、进度与图注。移动端保留导航和完整文字，隐藏辅助路径。
- **品检规则示意：** 四个原生按钮以 `aria-pressed` 表达选择，选中态为金底深字。连续失败复选框仅在图片语境选项可用。单次图片语境不符和关键词不清返回重新生图；两次语境自审失败进入制作兜底；视频人声进入二次处理；运动问题打标跟进。结果区使用 polite live region，并明确标注仅为规则示意。
- **进度记录：** 奶油底、日期大字、横线分隔。完成、风险、计划状态使用不同色文字和小圆点，保留可读状态标签。
- **程序纤维带：** 单一带状曲面由多根纤维组成，微幅指针响应及六节点呼应章节；Canvas 不承载可访问的正文信息。桌面 68 根、移动端 40 根，像素比封顶 1.5，绘制约 30fps。

系统减少动态效果会取消 CSS 动画与过渡、禁用平滑滚动并静态绘制 Canvas。用户暂停只冻结 Canvas 的时间推进及指针响应，并抑制新图注入场；滚动仍更新章节状态。页面隐藏时停止动画帧。

## Do's and Don'ts

- **Do** 延续摄影底、衬线标题和浅金强调，让细线与留白组织内容。
- **Do** 保留手机阅读、键盘焦点、跳转正文、动效暂停和减少动态效果支持。
- **Do** 用完整角色称谓、明确状态及事实注释支持面试阅读。
- **Don't** 把路径进度或规则演示解释成生产任务的实时状态。
- **Don't** 将计划、制作完成与实际已上线混为同一状态；事实依据以 PRODUCT.md 为准。
- **Don't** 依赖背景图形或颜色单独传达必要信息。


## 2026-10-31 第二轮收束
延续深色摄影、浅金衬线与纤维带。首屏先说明排期/任务催办/跨团队推进/最终验收职责，并直陈练口语压缩周期提前交付；原重复opening改为独立结果与推进职责两栏，不将新增结果回填旧10月记录。六章保留事实、交付物与质量回流互动，删除重复口号，取消桌面每章强制满屏。首屏离开后冻结纤维时间，滚动与状态变动只提交有限帧；返回首屏恢复，暂停、减少动态、窗口隐藏的行为保留。
