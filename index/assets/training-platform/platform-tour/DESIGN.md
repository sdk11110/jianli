---
name: 内容培训平台 · 交互式项目展厅
description: 以蓝色纸本流程插画与可操作工作台讲清工具、需求、学习和发布。
colors:
  primary: "#183c59"
  primary-deep: "#102e46"
  paper: "#f5f1e8"
  surface: "#fcfaf5"
  text: "#193851"
  text-muted: "#516778"
  divider: "#ccd2ce"
  accent: "#b54c2c"
typography:
  display:
    fontFamily: '"Noto Serif SC", "Source Han Serif SC", SimSun, serif'
    fontSize: "clamp(30px, 3.3vw, 48px)"
    fontWeight: 500
    lineHeight: 1.42
    letterSpacing: "-0.025em"
  body:
    fontFamily: 'Workshop, "Segoe UI", "Microsoft YaHei", sans-serif'
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.75
    letterSpacing: "normal"
rounded:
  control: "3px"
  workspace: "6px"
spacing:
  sm: "12px"
  md: "24px"
  lg: "56px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    rounded: "{rounded.control}"
    padding: "15px 24px"
  workspace:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.workspace}"
    padding: "32px"
---

# Design System: 内容培训平台 · 交互式项目展厅

## Overview

**Creative North Star: “装帧里的工作台”**

纸张、档案与流程图的材料感进入一个可操作的内部平台。首屏由真实蓝色纸本插画承载主题，功能区转为深蓝展墙中的浅色工作台；阅读者先被图像吸引，再通过操作理解六个业务模块和两条发布链路。

**Key Characteristics:**

- 蓝色纸本插画是真正的页面背景，不作为孤立海报。
- 深蓝大色域承载展厅，浅色表面承载任务操作。
- 橙色只用于当前状态、关键文字和引导。
- 示例信息明确标注为本地演示，完整说明保留为可展开参考。

## Colors

采用“纸张中性色 + 深蓝主色域 + 单一橙色提示”的克制策略。

### Primary

- **工作台蓝**：按钮、选中状态和重点界面标题。
- **展墙深蓝**：六模块体验区的大面积背景。

### Secondary

- **朱砂提示**：只标记当前步骤、选中状态和关键转折。

### Neutral

- **米白纸面**：页面和首屏基础表面。
- **象牙工作面**：功能面板与可阅读内容表面。
- **蓝灰正文**：正文和次级说明。
- **冷灰分隔**：表格、列表和功能层级细线。

**The Large-Field Rule.** 主色以整段展厅或完整工作面出现，不把多个小蓝色卡片散落在中性背景上。

## Typography

**Display Font:** Noto Serif SC / Source Han Serif SC，回退到 SimSun  
**Body Font:** 本地 Workshop（主站 Exhibition Sans 字体）/ Segoe UI / Microsoft YaHei  
**Label Font:** 与正文相同，用较小字号和正常字距区分

**Character:** 标题借东方印刷品的衬线骨架，正文保持工作界面的清晰度。技术感来自信息结构，不依赖等宽字体装饰。

### Hierarchy

- **Display**（500，30–48px，1.42）：章节命题。
- **Hero**（500，42–68px，1.38）：仅用于首屏。
- **Title**（600–650，18–29px）：模块名、步骤名和工具条目。
- **Body**（400，14–16px，1.75）：说明文字，最长约 72 个字符。
- **Label**（500，10–12px）：状态、辅助口径和本地示例提示。

**The Two-Voice Rule.** 衬线只负责叙事标题；操作、状态和正文都用无衬线体。

## Layout

桌面以可变边距（22px–88px）形成大画幅。首屏铺满视口高度；平台体验采用 260px 导航加弹性工作台，交付流程采用 1:1.5 双栏，制作说明采用 1:1.25 双栏。区域上下间距以 56px 和 100px 为主要节奏。

760px 以下，页面边距改为 24px。功能导航变为三列两行；工作台和流程改为单列；五个发布步骤横向等分，标题和说明在其下方更新。不得出现横向滚动。

## Elevation & Depth

绝大多数层级依靠深浅色域和细线。唯一明显的浮起是浅色工作台在深蓝展墙上的柔和纵向阴影，用于强调“可操作的展品”。

**The One-Lift Rule.** 同一视区只允许工作台作为主要浮起表面，其他容器保持平面。

## Shapes

工作台使用 6px 圆角，操作控件使用 3px 小圆角。列表、步骤和说明主要通过水平细线分组，不堆叠大圆角卡片。首屏背景图保持完整画幅，通过文字区的透明叠色维护可读性。

## Components

### Buttons

- **Primary:** 工作台蓝底、象牙字，3px 圆角，最小高度 44px。
- **Hover / Focus:** hover 转为稍亮蓝；键盘焦点使用 3px 橙色外圈并留 5px 间距。
- **Text action:** 无容器，使用文字下划线和足够触控高度。

### Chips

- **Style:** 分类筛选为无描边文字控件；当前项使用工作台蓝底和白字。
- **State:** aria-pressed 负责筛选状态，选中与未选中同时有颜色和底面差异。

### Cards / Containers

- **Workspace:** 象牙面、6px 圆角、一个柔和阴影。
- **Rows:** 工具、需求、课程均用分隔线形成连续列表，不嵌套同尺寸卡片。
- **Internal Padding:** 桌面 32px，手机 18–24px。

### Navigation

顶部导航是中性纸面上的短文字链接。六模块导航在桌面纵排，手机三列排列；选中状态使用下划线与亮色文字。方向键、Home 与 End 可切换模块。

### Publishing Stepper

两种发布类型使用同一组五步结构，但数据与状态独立。当前步骤以朱砂色标记；上一/下一按钮在边界禁用。步骤说明区保持固定最小高度，避免切换时页面跳动。

## Do's and Don'ts

### Do:

- **Do** 用项目插画作背景或场景材料，并为文字保留清晰色域。
- **Do** 明确标注本地演示、估算口径和未核验线上功能。
- **Do** 保留键盘导航、焦点状态、禁用状态和无 JavaScript 阅读入口。
- **Do** 让工具 H5 与培训 H5 的发布链路保持视觉与语义分离。

### Don't:

- **Don't** 把大图重新做成独立海报插在正文中。
- **Don't** 用虚构的使用人数、提效数字或账号数据填充界面。
- **Don't** 把真实平台操作接入本地示例。
- **Don't** 用多层阴影、玻璃拟态、渐变文字或大圆角卡片稀释纸本工作台的身份。


2026-10-30：价值先行，加入作者/同事贡献边界；成果与示例工具一致。移动模块不再保留590px空高度，评分详情打开后将焦点与阅读位置移到详情。模块切换220ms轻入场，减少动态时即时切换。标题40–64px、正文14–16px、标签11–13px。
