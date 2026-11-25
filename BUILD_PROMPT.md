# 构建任务：喵喵茶馆 (Meow Tea House) — 原创 HTML5 Canvas 时间管理游戏

你是一名游戏开发者。请在当前工作目录（~/workspace/competitions/meow-tea-house/）从零编写一个**原创** HTML5 Canvas 游戏，**不要复用任何已有游戏的代码**（不要复制 ~/workspace/makefun/cooking-game/ 的任何代码，只参考它的文件组织模式：index.html + style.css + src/ 下按职责拆分的单用途小文件）。

## 游戏概念
你经营一家由猫咪打理的珍珠奶茶店。动物顾客（猫、狗、兔子、熊猫、狐狸）来到柜台，头顶出现点单票：一种茶底 + 若干小料。玩家按流程做饮料，在顾客耐心耗尽前送达。

流程（每杯饮品）：
1. **冲茶站**：选茶底开始冲泡，约 3 秒完成（可同时冲 2 杯，两个冲泡槽）。
2. **加料站**：给冲好的杯子加小料（每种小料点一下即加上，可加 1~2 种）。
3. **摇杯站**：把成品杯放进摇杯器摇约 2 秒，完成饮品。
4. **出杯**：点击顾客点单票（或按空格）把饮品送给点单匹配的顾客。玩家一次只能拿 **一杯**（手里有杯时不能再冲新茶，迫使规划路线）。

茶底（数字键 1-4）：1 红茶，2 绿茶，3 奶茶，4 果茶。
小料（字母键 Q/W/E/R）：Q 珍珠，W 布丁，E 红豆，R 椰果。
摇杯：S 键或点击摇杯站。空格出杯，P 暂停，M 静音，Shift+R 重开。鼠标点击也要全程可用（点茶底按钮、点小料按钮、点摇杯器、点顾客票出杯）。

## 规则
- 一局 3 分钟（180 秒）。每杯基础分 100 + 按剩余耐心给小费（剩余耐心比例 × 50，取整）；金币 = 得分 / 10 取整累计。连续成功出杯有连击：每次成功 +0.1 倍率，上限 ×2.0；出杯失败/订单过期则连击清零。
- 3 颗星：一个订单过期扣 1 颗星；星星扣光立即结束本局。时间到也结束本局。
- 难度只随速度提升：顾客到达间隔逐渐缩短，耐心逐渐变短，同时最大订单数 3 → 4，后期订单要求 2 种小料。
- 顾客动物 5 种：猫、狗、兔子、熊猫、狐狸，用 Canvas 矢量图形画（圆形、耳朵、斑纹等，区分颜色与特征），不要用任何图片或外部资源。
- 标题画面：游戏名“喵喵茶馆”、副标题、按钮、玩法说明（流程 + 按键表）。结算画面：得分、金币、出杯数、最高连击、星星，并有按钮。暂停画面有继续/重开提示。

## 技术约束（必须全部满足）
- 单页静态游戏，画布 1280×720，可直接用 file:// 打开（GitHub Pages 静态托管）。**零网络请求、零外部资源**：不许 fetch / XMLHttpRequest / http(s) URL / 图片 / 字体 CDN。所有美术 = Canvas 矢量手绘；所有音效 = WebAudio 合成（倒水声、摇杯声、叮声、金币声、错误声），且必须能静音。
- 界面文字全部中文。
- ES Modules，无构建步骤，运行时无 npm 依赖。
- 每个 JS 文件单一职责、命名清晰。文件布局（仿照 cooking-game 的组织模式，但内容全部原创）：
- game/index.html（canvas 1280×720 + 隐藏的无障碍按键说明文字 + `<script type="module" src="src/main.js">`）
- game/style.css（居中画布、16:9 自适应、深色暖调背景）
- game/src/main.js（启动、requestAnimationFrame 主循环、update + render 调度；支持 `?scene=NAME` 加载摆拍场景；把 state 暴露为 `window.__meow` 供测试）
- game/src/state.js（createState：phase title/playing/paused/results，score/coins/combo/bestCombo/served/stars/clock/orders/hand/brewSlots/shaker 等）
- game/src/drinks.js（茶底与小料定义：id、中文名、颜色、按键；订单生成规则：难度随时间提升，2 小料订单只在后期出现）
- game/src/orders.js（顾客生成/到达间隔/耐心衰减/过期扣星/出杯判定与计分：基础分+小费+连击倍率）
- game/src/stations.js（冲泡槽 ×2 进度、摇杯器进度、加料逻辑、手持一杯的约束）
- game/src/timer.js（SHIFT_SECONDS=180，难度曲线函数：按 elapsed 返回 spawnInterval / patience / maxOrders）
- game/src/layout.js（画布各区域坐标：顾客区、点单票、冲茶站、加料站、摇杯站、手持杯、HUD、按键提示栏；导出命中检测用的矩形）
- game/src/render.js（全部绘制：背景茶馆、5 种动物顾客、点单票与耐心条、茶底/小料按钮、冲泡槽与摇杯器进度、漂浮得分、连击、星星、HUD、标题/暂停/结算画面）
- game/src/scenes.js（buildScene(name)：cover=标题画面；midplay=进行中，2~3 个顾客有订单、手里一杯冲泡中；serve=一杯已摇好可出杯、对应顾客高亮；rush=4 个顾客、多人耐心很低）
- game/src/audio.js（WebAudio 合成音效：pour/shake/ding/coin/error/click，muted 开关；AudioContext 懒初始化，需用户手势后恢复）
- game/src/input.js（鼠标点击命中 + 键盘：1-4 茶底、Q/W/E/R 小料、S 摇杯、Space 出杯、P 暂停、M 静音、Shift+R 重开；标题画面 Enter/Space 开始，结算画面 Enter/Space 重开）
- 状态字段约定（测试脚本会读取，请严格遵守）：`state.phase`，`state.score`，`state.coins`，`state.served`，`state.stars`，`state.combo`，`state.bestCombo`，`state.clock`，`state.orders`（每单 `{id, animal, base, toppings:[小料id数组], patience, maxPatience}`，patience 为剩余秒数），`state.hand`（null 或 `{base, toppings:[], shaken:boolean, brewed:boolean}`），`state.brewSlots`（数组，每槽 `{cup:null|{base,toppings:[],shaken}, progress:0..1, done:boolean}`），`state.shaker`（`{cup, progress:0..1, done:boolean}` 或 null 槽位对象，任选其一但必须存在且字段名如此）。
- 关键流程的函数语义（input.js 内部实现，不必导出，但行为必须如此）：
- 按茶底键（或点茶底按钮）：若手里无杯且有空闲冲泡槽，开始冲该茶底（3 秒）；若手里已有杯或无空槽，播放 error 音并显示提示“手里已有饮品”/“冲泡槽已满”。
- 冲泡完成：按小料键（或点小料按钮）把小料加进“刚冲好、未取走”的那杯（优先最新完成的槽）；每杯小料数不超过 2 种且不重复。加料后按 S（或点摇杯器）把杯子送入摇杯器摇 2 秒；摇好后自动回到玩家手里（hand），此时 hand.shaken=true。
- 更简单的等价实现也允许：冲泡完成后自动把杯子放到“待加料区”，加料与摇杯都在该杯上操作，摇好后进 hand。只要键盘能走完“茶底→小料→摇杯→出杯”全流程即可。
- 出杯（Space 或点顾客票）：找 patience 最高且订单与 hand 完全匹配（base 相同、toppings 集合相同）的顾客；匹配则计分、served+1、combo+1、播放 coin/ding 音；不匹配则 error 音、combo 清零、手里的杯保留（不许因点错而丢杯）。
- 订单过期：patience<=0 时移除订单、stars-1、combo 清零、播放 error 音；stars<=0 立即进入 results。
- 渲染要求：画面要好看、信息清晰。顾客按到达顺序排在柜台后方，每人头顶一张点单票（茶底名 + 小料名 + 耐心条由绿变红）；下方是三个工作站（冲茶/加料/摇杯），各有按钮与进度条；右上角 HUD 显示时间、分数、金币、连击、星星；底部显示按键提示。标题画面画一只招财猫 + 茶馆招牌。
- 代码健壮性：主循环用 try/catch 包住 update，出错只记 console.error 不卡死；所有文件 `node --check` 能通过；不要留下 console.log 调试输出（错误日志除外）。

## 还要写的文件（放在仓库根目录）
- README.md：中文，游戏简介、玩法、按键、本地运行方法（直接用浏览器打开 game/index.html 或 `python3 -m http.server`）、文件结构。
- DESCRIPTION.md：中文 2-3 句话的游戏简介（用于比赛报名表）。

## 工作方式
- 直接在工作目录写文件，不要问问题，不要联网搜索，直接开工。
- 写完后自己快速自查：每个 JS 文件语法正确、ES module 导入路径正确、没有 fetch/http 引用、state 字段名与上面约定一致、四个 scene 名称（cover/midplay/serve/rush）都能加载。
- 最后用一句话汇总：写了哪些文件、总行数、以及你发现的任何未解决的问题。
