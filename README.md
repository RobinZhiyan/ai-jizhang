# AI记账 · React Native (Expo)

声记 · AI 语音家庭记账 App 的 React Native 源码版本，从 HTML 原型移植而来，可直接在真机 / 模拟器上运行与继续开发。

## 运行

需要 Node 18+。

```bash
cd rn-app
npm install          # 或 yarn
npx expo start       # 启动开发服务器
```

然后：
- 手机装 **Expo Go**，扫描终端二维码即可预览；
- 或按 `i` 打开 iOS 模拟器、`a` 打开 Android 模拟器；
- 按 `w` 在浏览器里跑（react-native-web）。

## 目录结构

```
rn-app/
├── App.js                  入口 + 底部 Tab 导航（首页 / 分析 / 我的）
├── app.json                Expo 配置
├── package.json            依赖
├── babel.config.js
└── src/
    ├── theme.js            设计 tokens（颜色 / 圆角 / 字号 / 阴影）
    ├── data.js             分类、成员、小目标、AA 示例、mock 数据、helpers
    ├── components/
    │   ├── Icon.js         单线 SVG 图标（react-native-svg）
    │   └── ui.js           Card / ProgressBar / Avatar / Segmented / Pill
    └── screens/
        ├── HomeScreen.js   首页：今日收支卡 + 双小目标 + 分类支出方格 + 语音键
        ├── AAScreen.js     AA 算账工具：长按语音记账 + 自动算人均 + 生成账单分享
        ├── AnalysisScreen.js  分析：收支双折线 + 分类占比
        └── ProfileScreen.js   我的：成员权限 / 设置入口
```

## 已移植

- 设计系统 tokens（与原 HTML 版一致）
- 首页：今日支出 / 今日收入 / 本月结余卡、双小目标进度条（蔚来 ES9 + 攒够 100 万）、12 个分类支出方格、悬浮语音按钮
- AA 算账工具：长按说话记一笔、自动按人数算人均、明细列表、生成账单分享
- 分析：收支双折线趋势 + 分类占比
- 底部 Tab 导航

## 待你继续开发的钩子

- 接入真实**语音识别**（科大讯飞 / 微信同声传译 / 系统 STT）替换 `AAScreen` 里的示例脚本
- 接入**拍照凭证**（expo-image-picker / expo-camera）
- 接入**微信分享**（react-native-wechat-lib）替换账单分享占位
- 用 **AsyncStorage / SQLite / 云端** 替换内存 mock 数据做持久化
- 月度 AI 报表、固定收支、保姆权限视角等可按相同模式从 HTML 版继续移植

> 数据当前为内存中的 mock（`src/data.js`），刷新即重置；接持久化层后即可正式记账。
