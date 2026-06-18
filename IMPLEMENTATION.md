# AI记账 · RN 1:1 移植进度

## 目标
把原型 `~/Downloads/AI记账 (打包版).html`（标题「声记·语音家庭记账」）1:1 还原成 React Native App（保留全部功能 / 页面 / 配色 / 交互）。
原型是 bundler 打包的单文件 React app；真实 JSX 源码已解码 → **`.proto-ref/`**（gitignored，移植依据）。

## 原型 → RN 文件映射
| 原型 (.proto-ref) | 内容 | RN 目标 | 状态 |
|---|---|---|---|
| 05_data.jsx | 数据 / tokens / helpers | src/data.js · src/theme.js | ✅ |
| 06_ui.jsx | 共享组件 + 飞入引擎 + 音效 | src/components/ui.js · Icon.js | Icon ✅ / ui ⏳ |
| 18_app.jsx | 5tab 导航 + 语音状态机 + 账本/角色 | App.js | ⏳ |
| 07_home.jsx | 首页（hero 区间 / 方格 / 飞入 / 明细） | src/screens/HomeScreen.js | ⏳ |
| 12_analysis.jsx | 数据分析（双折线 + 占比） | AnalysisScreen.js | ⏳ |
| 13_budget.jsx | 预算可视化 | BudgetScreen.js | ⏳ |
| 15_profile.jsx | 我的 | ProfileScreen.js | ⏳ |
| 14_project.jsx | 装修项目首页 | ProjectHomeScreen.js | ⏳ |
| 08_income.jsx | 金币入袋 / 亏损扣减 | Home 动画层 | M2 |
| 10_flashcard.jsx | 收入闪卡 | IncomeFlashCard | M2 |
| 09_roles.jsx | 角色权限切换 | RoleSwitch / PermConfig | M3 |
| 16_fixed.jsx | 固定收支（月薪/房贷） | FixedConfig | M3 |
| 17_goal.jsx | 小目标 + 攒钱折算 | GoalCard / GoalConfig | M3 |
| 11_cats.jsx | 热力树图 / 消费玫瑰 / 资金流向 | CatViz | M3 |

## RN 转换约定
- CSS `var(--x)` → `T.x`（src/theme.js）。RN 无 CSS 变量。
- CSS 动画 / transition → `Animated`；复杂轨迹动画归入 M2。
- `localStorage` → 先用内存 state，持久化（AsyncStorage）归入 M2。
- `ReactDOM.createPortal` → `<Modal>`。
- Web Audio 合成音效 → expo-av（M2，先静音）。
- `getBoundingClientRect` + FLIP → `measure()` + Animated（M2）。
- 原型外层是「iOS 设备外壳」预览；RN 直接全屏，去掉 IOSDevice 外壳与 TweaksPanel。

## 进度
- [x] theme.js — 主题 tokens + inkSet / rgbOf
- [x] data.js — 全量数据层（19类/收入/装修12阶段/多账本/月份/流水/语音脚本/helpers）
- [x] Icon.js — 全部单线 glyph
- [ ] ui.js — Card/Money/Avatar/CatIcon/Pill/Segmented/RangeTabs/Bar/SectionTitle/Sheet/BudgetMeter/Donut/LineChart/useCountUp/CatTile
- [ ] App.js — 5tab + 中间长按语音 + 账本/角色 sheet + 屏切换
- [ ] HomeScreen — hero(区间下拉) / 方格(排序) / 小目标 / 明细 modal / 自定义分类
- [ ] AnalysisScreen / BudgetScreen / ProfileScreen / ProjectHomeScreen
- [ ] M2 动画：飞入轨迹 / FLIP 重排 / 金币入袋 / 闪卡 / 音效 / 持久化
- [ ] M3 次要：角色权限 / 固定收支 / 小目标配置 / 分类可视化

## 里程碑
- **M1（当前冲刺）**：视觉 + 导航 1:1 可跑，核心 4-5 屏，语音用简化交互。
- M2：高级动画与音效、持久化。
- M3：全部次要屏 + 三种分类可视化。
