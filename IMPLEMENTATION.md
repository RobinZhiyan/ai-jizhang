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
- [x] theme.js / data.js / Icon.js / ui.js — 基础层 + 组件库
- [x] App.js — 5tab + 长按语音 + 多账本/角色 + 各 Sheet
- [x] HomeScreen — hero(区间下拉) / 方格(排序) / 小目标 / 明细 / 权限控制
- [x] AnalysisScreen / BudgetScreen / ProfileScreen
- [x] ProjectHomeScreen — 装修项目首页(预算/阶段/采购/预算表单)
- [x] 小目标 — GoalCard + GoalConfigPage(攒钱折算)
- [x] 固定收支 — FixedConfig(月薪入账 + 房贷/车贷两种扣款)
- [x] 角色权限 — Roles(视角切换/保姆横幅/权限配置/Tab隐藏/首页隐藏核心数据)
- [ ] M2 动画：语音飞入轨迹 / FLIP 重排 / 金币入袋 / 闪卡 / 音效 / 数值滚动
- [ ] M2 持久化 — AsyncStorage (goal/fixed/perms/customcats)
- [ ] M3 自定义分类(home AddTile) / 分类可视化(treemap/rose/sankey)

## 已提交里程碑
502ce49 scaffold · 2776fa0 M1骨架 · d1aad4f 装修+账本 · ba0e87f 小目标 · a42f069 固定收支 · (角色权限验证中)

## 里程碑
- **M1（当前冲刺）**：视觉 + 导航 1:1 可跑，核心 4-5 屏，语音用简化交互。
- M2：高级动画与音效、持久化。
- M3：全部次要屏 + 三种分类可视化。
