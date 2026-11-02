---
name: 教材 AI 自动化 · Production Canvas
description: 蓝色透明材料连接真实教材、分镜与成片，人工审核掌握流程放行。
colors:
  sky: "#3aa5f2"
  ink: "#121b48"
  body: "#344265"
  muted: "#596780"
  paper: "#f7f9fd"
  white: "#fff"
  action: "#142551"
  line: "#ccd6e6"
  line-light: "#dce3ed"
  node-backing: "#18345edb"
  node-current: "#1345c8"
  bench-blue: "#1748bc"
  bench-body: "#536889"
  bench-line: "#c6d7ee"
  selection-line: "#b8cce8"
  editorial-paper: "#fffdf9"
typography:
  display:
    fontFamily: "WeavyText, 'Microsoft YaHei', sans-serif"
    fontSize: "clamp(40px, 3.55vw, 62px)"
    fontWeight: 790
    lineHeight: 1.14
    letterSpacing: "-0.035em"
  bench-headline:
    fontFamily: "WeavyText, sans-serif"
    fontSize: "clamp(33px, 3.85vw, 70px)"
    fontWeight: 750
    lineHeight: 1.25
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "WeavyText, 'Microsoft YaHei', sans-serif"
    fontSize: "clamp(32px, 3.2vw, 52px)"
    fontWeight: 600
    lineHeight: 1.4
  frame-caption:
    fontFamily: "WeavyText, 'Microsoft YaHei', sans-serif"
    fontSize: "24px"
    fontWeight: 550
    lineHeight: 1.35
  body:
    fontFamily: "WeavyText, 'Microsoft YaHei', sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.9
  label:
    fontFamily: "WeavyText, 'Microsoft YaHei', sans-serif"
    fontSize: "12px"
    fontWeight: 550
  action:
    fontFamily: "WeavyText, 'Microsoft YaHei', sans-serif"
    fontSize: "clamp(12px, 1.12vw, 19px)"
    fontWeight: 550
    lineHeight: 1.4
  node:
    fontFamily: "WeavyText, 'Microsoft YaHei', sans-serif"
    fontSize: "clamp(12px, 1.05vw, 17px)"
    fontWeight: 550
    lineHeight: 1.2
rounded:
  square: "0"
  detail: "3px"
  panel: "4px"
  overlay: "5px"
  capsule: "30px"
spacing:
  compact: "8px"
  small: "12px"
  inset: "16px"
  content: "24px"
  section: "90px"
components:
  button-primary:
    backgroundColor: "{colors.action}"
    textColor: "{colors.white}"
    typography: "{typography.action}"
    rounded: "35px"
    padding: "12px 19px"
    height: "48px"
  button-primary-hover:
    backgroundColor: "#234990"
  button-primary-disabled:
    backgroundColor: "#cdd9ee"
    textColor: "#536c91"
  button-reset:
    textColor: "#23457a"
    rounded: "27px"
    padding: "10px 12px"
    height: "43px"
  flow-node:
    backgroundColor: "{colors.node-backing}"
    textColor: "{colors.white}"
    typography: "{typography.node}"
    rounded: "{rounded.capsule}"
    padding: "7px 19px"
  flow-node-current:
    backgroundColor: "{colors.node-current}"
  source-page:
    backgroundColor: "{colors.white}"
    textColor: "#173d7c"
    rounded: "{rounded.detail}"
    padding: "10px"
  output-row:
    rounded: "{rounded.square}"
    padding: "10px 0"
  navigation:
    textColor: "{colors.ink}"
    padding: "10px 0"
---

# Design System: 教材 AI 自动化 · Production Canvas

## Overview

**Creative North Star: "The Tangible Production Canvas"**

这是教材案例（05）的局部系统。原有蓝天、珊瑚实体地面、纸本教材、透明蓝色分镜带与亚克力成片平面继续约束首屏；用户批准的 B 工作台把相同材料延展为大幅教材页与两个不等大的产物平面。平面随阶段呈现教材解析、分镜、实际影片或品检资料，实体几何保持不变。物理光影留在场景资产中，实际教材、图像、影片、标题和控件保留为语义 DOM。

层级由作品尺度与操作状态共同建立：首屏展示用户确认的整体结果和真实成片，工作台提供固定本地模拟，后续浅色阅读区说明人工审核、作者贡献与制作细节。首屏结果口径仍为成本降低 60% 以上、效率提高 70%；它们不是模拟运行的测量值。本记录合并原已批准的首屏系统与 B 下方实现，不扩展到其他案例或整站。

来源为继承的 `static/styles.css`、`static/case.css`、`static/weavy.css`、`static/weavy.js`，以及本包 `index.html`、`static/app.js`、`static/lower-b.css`、`static/lower-b.js` 最后覆盖规则。批准构图记于 `surface-brief.json`；物理资产与映射分别见 `lower-b-asset-manifest.json`、`assets/lower-b/geometry.json`。`qa/full-workflow.json` 记录原七阶段、五道审核、返修、媒体与焦点验证；`qa/05-b-composition-after.png`、`qa/confirmation.json` 保留原 B 几何与两档桌面控制布局的确认。本次 `qa/feedback-confirmation.json` 记录七种可区分的阶段产物、审核、返修与媒体状态；其中 `sheets.content` 是映射后的投影高度，不是局部滚动溢出指标。反馈截图未作为本次最终构图证据，带 `before` 的截图和 `REVIEW.md` 仍仅记录先前发现。文档写入不代表已安装或发布。

**Key Characteristics:**

- 蓝天、暖橙实体底座与透明蓝色材料连接真实作品。
- 单一自托管中文可变字体，以尺度、字重和留白区分角色。
- 大幅教材与不等大的两个产物平面，共享几何并随阶段更换实际内容。
- 开放动作承台与紧凑工具行承接操作，完整资料按需展开。
- 人工确认决定继续或返修，动效和影片随状态与可见性停止。

## Colors

场景材料负责饱和蓝与暖橙，操作层由深蓝、白与蓝灰组织。前置 YAML 记录实际复用的颜色；sidecar 的八阶 OKLCH 色带只是面板预览外推，不是新增的实装色阶。

### Primary

- **Sky** 连接首屏场景与浏览器主题色；B 的天空与折射保留在独立场景资产中。
- **Ink / Action** 分别承担阅读锚点与主要动作。原首屏节点保留其状态值；B 承台使用局部悬停与禁用值，不强行合并近似蓝。
- **Node Backing / Node Current** 用于首屏可操作流程胶囊；**Bench Blue** 用于分镜选择和完整产物选中反馈。

### Neutral

- **Paper / White / Editorial Paper** 用于工作台承接、原页选择和脚本阅读区。
- **Body / Muted / Bench Body** 保留原首屏与新阅读区各自的文字层级。
- **Line / Line Light / Bench Line / Selection Line** 区分普通分隔、轻分隔与选择边框，不把每个局部近似色扩展为色阶。

琥珀色在审核停点、返修动作与返回弧线中建立人工介入的语义，具体值随这些局部元素而定。最终审核条带使用冷近白背景（`#f7faff`），不将修正前的暖色衬垫收录为默认容器。

**The Material / Control Rule.** 透明蓝与暖橙负责实体连续性；深蓝、白和蓝灰负责阅读与操作，琥珀提示人工审核。

## Typography

**Display Font / Body Font:** WeavyText，自托管 `static/weavy-sans.woff2`，可变字重（100–900）；主要回退为 Microsoft YaHei 与 sans-serif。中文、英文与数字共享字体，数值采用表格数字；没有独立衬线展示体或等宽日志体。

标题紧凑而有分量，正文以宽松行距承接中文阅读。原首屏 display 保留；B 工作台使用更大的 bench-headline。headline 记录当前贡献标题，脚本标题在最终 CSS 中也采用（600）字重、以自己的 clamp 尺度排版，不把所有标题统一成同一个字号或比例阶梯。

- **Display / Bench Headline** 分别承担首屏与工作台标题；后者在桌面 CSS 宽度（1536px）下约为（59.1px）。
- **Frame Caption** 是原生（1774px）场景内的主分镜对白；次分镜使用（22px）。它们随整个场景等比缩放，不直接等同于屏幕上的最终像素字号。
- **Phase Sheet** 是同一映射平面内的资料排版：通用标题为（27px / 650 / 1.35），原句栏为（24px），生成清单、拼接、配音与品检栏为（22px）；正文与清单采用各自的（14–23px）原生场景字号，以实际平面尺寸适配，不套用屏幕正文的像素尺度。
- **Body** 用于流程说明；贡献正文使用（15px / 1.95），完整分镜对白使用（16px）英文与（12px）中文说明。
- **Label / Action / Node** 服务于操作与状态，不添加装饰性全大写小标题。当前阶段和阶段计数分别使用独立的 clamp 尺度。

**The One Font Rule.** 延续自托管可变中文字体，以字重与信息角色建立层级，不另加系统默认展示字体。

## Layout

保留原生连续滚动和叠在首屏上的绝对定位导航。原内容容器为视窗减去（8.4vw），上限（1600px）。原首屏沿用（1844 / 853）比例与（590px）最小高度，影片按首屏亚克力四角映射；B 是独立的（2:1）场景，不把两个场景混用同一裁切参数。

B 原生坐标为（1774 × 887），整幅场景与三个真实 DOM 平面一起按 `clientWidth / 1774` 缩放。教材平面为（438 × 529），主分镜为（605 × 338），次分镜为（355 × 303）；各自使用 geometry 文件的四角计算 projective matrix3d。图片、视频、可点击区域与字幕共用该映射。桌面流程记录中，CSS 视窗为（1536 × 1024），document client width 为（1521），实测画布高约（760.57px）；不得将截图宽度或原生场景坐标直接写成 CSS 视窗值。

阶段资料层直接填入原有两块平面，冷近白底承接分析、原句、分镜脚本与审核清单；视频阶段保留透明叠加的状态条、五幕轨道或播放进度。资料高度按原生主平面（338px）和次平面（303px）适配，较多原句使用紧凑行距版本；完整内容由下方原生 DOM inspector 承接，而不是将投影高度与局部内容高度混算。

工作台标题与当前状态在上方，七阶段状态胶囊位于画布高度（20%）；教材在左，主分镜居中偏右，次分镜延续阅读方向。动作承台占右下方开放横带。其下闭合状态的工具行最小高（62px），同时保留五幕选择、进度/日志与完整产物入口；展开后允许内容自然增加高度。完整资料采用（27% / minmax(0, 1fr)）两列，而不是旧三栏小型 dock。

审核阅读条带为（35% / 1fr）两列与（5%）间距，小幅真实分镜让出可见的琥珀返回弧线与人工图标。流程机制折叠在其下，避免再次展开一套同等显著的七步导航。贡献与脚本区使用（90px）段落留白，正文、缩略图与控件主要沿用 compact、small、inset 和 content 节奏。

B CSS 有（1100px）紧凑规则，原代码还保留（760px）、（1800px）等回退。最终确认另覆盖（1280 × 800）CSS 视窗，其 client width 为（1265），画布高约（632.57px）；两档桌面均无横向溢出，闭合工具行均为（62px）。本轮按用户要求仅验证桌面，未将窄屏规则认定为已验证手机构图。

## Elevation & Depth

纸边、玻璃折射、橙色夹具、连接材料与接触阴影来自一幅协调的实体场景。真实媒体嵌入留白平面，界面不会为每段文字重复添加玻璃容器。B 动作承台带柔和接触阴影；审核缩略图在最终样式中去掉暖色衬垫、卡边与阴影。流程说明、开放产物行和贡献条目主要用底色、细线与间距组织。

节点解释层、toast 和首屏沉浸播放层保留各自的柔和环境阴影；精确值在 sidecar。实体材料和承台原有的深度不可转写成对一切阴影或透明材料的全局禁令。

**The Depth Lives in the Work Rule.** 让实体场景和必要承台承担深度，阅读条目保持开放，临时覆盖层使用柔和环境阴影。

## Shapes

整体轮廓由直线内容行、小圆角详情和胶囊动作共同组成。B 媒体平面使用（7px）原生场景圆角、教材为（2px），与实体内边缘匹配；原首屏影片仍为四个尖角的亚克力映射面。B 动作承台使用（15px）圆角，按钮比承台更圆，不将这个局部承台外形套给所有内容。

首屏白色 SVG 曲线、白描边胶囊与 Skill / 审核返回支线保留。B 七阶段采用白色连线与深蓝胶囊，完成标记由 CSS 边框绘制；审核条带的人形标记为内联 SVG，不以文本符号代替图标。

## Components

### Buttons

B 主动作是深蓝胶囊；执行与审核通过共用 button-primary。悬停变色并轻移（1px），按下回位，禁用移除位移。重置为细边胶囊，返修为琥珀文字与轻边框；它们不沿用旧 dock 的底边文字动作。审核时显示短标签“待人工确认”，审核详情通过 `aria-describedby` 关联保留。

按钮、链接、range 和 summary 保留可见焦点（2px / 外偏移 5px），场景内媒体按钮使用白色焦点。首次加载预选 P14；开始、执行、等待确认与完成使用各自文案，等待人工审核不显示为正在执行。

### Status and selection

B 七阶段是状态轨道而非七个可跳步的按钮；当前阶段用深色蓝填充与白字，完成阶段用浅蓝填充、深字和 CSS 勾。首屏七节点仍可点击查看说明。P14/P15 保留 `aria-pressed`；五幕按钮独立控制查看哪一幕，不改变执行进度。颜色始终配合阶段、待确认或完成文字。

### Cards / Containers

教材输入的实体大页与完整资料中的选择卡共用真实原页。资料选择卡为轻边框、小圆角，选中改蓝边与浅蓝底；输出列表保持开放行，使用（25px 序号 / 100px 缩略图 / 弹性正文），每行底部细分隔。场景内的阶段资料层使用统一冷近白底（`#f8fcff`），以开放行、五图分镜网格或审核清单区别内容；它不是给每条信息另套的玻璃卡。流程机制与完整资料使用原生 details / summary，承接完整说明与可选择的 DOM 内容。

### Inputs / Fields

输入是教材原页选择与视频进度 range，没有新的通用文本输入体系。播放器保留原生键盘调节与可读时间。页内放大视频提供播放、range、时间、声音控制；静音阶段禁用声音按钮并显示“无音频预览”。

### Navigation

首屏保留三个轻量锚点、当前细线与滚动状态同步。B 的工具行使用五幕按钮、日志 summary 和完整资料 summary，折叠不会移除功能。阶段资料平面的展开按钮打开并滚至完整 DOM inspector；媒体平面的展开按钮继续进入自定义 viewer。审核条带的返回动作滚回同一工作台，减少动态时使用即时滚动。

### Production state and manual gates

七阶段依次为教材识读、设计分镜、生成画面、提升画质、拼接画面、配音配乐、成片。四道制作审核加最终品检分别检查教材、分镜与提示词、生成画面、音画与配音、最终成片；返修回到本步并清除相关后续完成状态。app 状态事件同步首屏、B 当前阶段、轨道、动作与产物。本地演示读取固定教材与现有素材，不调用真实生成服务。

每阶段更换可核对的产物，而不是只更换标题或同一张参考图：

- **教材识读**：主平面呈现实际单元解析、场景和对话数量，右侧保留所选场景的教材原句及中文，供与左侧原页核对。
- **设计分镜**：主平面展开五张真实分镜参考图，右侧显示当前选中镜头的图像、机位与脚本；五幕选择同步这份脚本。
- **生成画面**：立即播放当前镜头的实际 raw 片段，右侧按顺序列出五幕已有生成片段；阶段审核控制是否继续。
- **提升画质**：主平面立即播放实际 HD 片段，右侧保留同一镜头的原始片段，可点击作对照；切换播放仍暂停其他媒体。
- **拼接画面**：播放完整 `final.mp4` 的静音画面，叠加五幕轨道与实际播放进度，右侧列出拼接顺序。该阶段使用同一真实成片作静音预览，不声称生成了另一份中间文件。
- **配音配乐**：播放同一实际成片并开启声音，右侧给出当前镜头的抽检台词、背景音乐说明与播放状态。
- **成片**：最终人工 gate 显示独立的五项审核清单；前四项已确认，最终品检在人工放行后才从待确认变为已确认。

固定本地资料按每阶段约（1.4s）的短节奏逐项揭示，这是阅读节奏，不是生成服务延迟或效率测量。阶段资料层以透明度与裁切过渡（360ms）切换，逐项内容使用（240ms）透明度与（350ms）位移过渡；底层媒体源更换另保留（380ms）的亮度/透明度过渡，整体切换与位移采用（cubic-bezier(.16,1,.3,1)）缓动。切换分镜取消已登记的旧动画。减少动态时保留相同资料和阶段结果，取消这些空间与过渡运动。

B 物理连接线是场景材料，不宣称其另有未实现的路径运行。首屏阶段令牌仍按状态变化沿 SVG 路径运行（460ms），原产物区保留继承的可中断切换。场景离屏或文档隐藏时停止相应运动与播放；B 没有空闲循环位移。

### Film planes and viewers

真实教材与分镜图像、raw / HD 片段以及 `final.mp4` 均为 DOM 媒体。视频在映射平面中使用 contain，保留完整教学画面与源字幕，不随框裁去内容。原始与高清片段保持静音，拼接预览明确标注无音频；配音阶段与最终成片有声，完整五幕成片实测时长约（29.768s）。当前阶段有视频时即尝试播放，浏览器拒绝后保留明确的点击播放提示；最终品检不因影片播完而自动放行。播放一段媒体会暂停其他媒体，B 离屏和文档隐藏会暂停其播放。

原首屏 viewer 移动已有播放器并在退出后恢复映射。B 的放大 viewer 使用单独媒体元素，先暂停来源与其他视频；具备 dialog 语义、焦点循环、滚动锁定、关闭按钮与 Escape，关闭后恢复触发按钮焦点。两条路径均保留原生滚动和可逆返回，不把复制的放大预览描述成新的后台产物。

## Do's and Don'ts

### Do:

- **Do** 保留蓝天、暖橙实体材料与透明蓝连接，并让实际教材、分镜、影片和控件保持语义 DOM。
- **Do** 让场景、真实媒体与交互区域共享各自场景的几何映射。
- **Do** 将阶段、人工确认、返修和完成状态同步到文字、动作与进度。
- **Do** 让阶段更换可核对的实际产物，资料展开进入完整 DOM，媒体展开进入播放器。
- **Do** 保留开放动作承台、紧凑工具行和按需展开的完整资料。
- **Do** 保留可见焦点、Escape 返回、原生滚动、离屏暂停与减少动态路径。
- **Do** 将整体项目结果、真实素材和固定本地模拟分别标明来源。

### Don't:

- **Don't** 用整页 mock 替代真实布局，或把操作文字、影片与控件烧进场景图。
- **Don't** 将旧三栏 dock、修正前暖色审核衬垫或未实现的连接线运动写成 B 的系统规则。
- **Don't** 将固定演示当作现场调用生成服务，或把 60% 以上 / 70% 改写为分阶段测量与学习效果。
- **Don't** 为每条事实和对白重复添加玻璃卡、硬偏移阴影或装饰性标题。
- **Don't** 将桌面流程记录、修正前截图或继承的窄屏规则表述为完整移动端验证。

刻意不收录为规范：资料与工具行中保留的 10–11px 小字不作为未来正文或操作可读性基准；遗留 output eyebrow、圈数字和文本勾徽记属于实现遗留，不能扩展成装饰标题或图标规则。Sidecar 若忠实预览现有小字，仅表示当前实现。
