// theme.js — 设计系统 tokens（从 HTML 版 themeVars 移植 · 浅色默认）
export const T = {
  // 品牌 / 语义色
  ok: '#34C759',
  warn: '#FF9500',
  over: '#FF3B30',
  blue: '#0A84FF',

  // 表面
  bg: '#E4E5EA',
  surface: '#FFFFFF',
  surface2: '#F2F2F7',

  // 文字
  ink: '#1C1C1E',
  muted: 'rgba(60,60,67,0.6)',
  faint: 'rgba(60,60,67,0.34)',
  hair: 'rgba(60,60,67,0.12)',

  // 强调（深色卡）
  accent: '#1C1C1E',
  accentInk: '#FFFFFF',
  track: 'rgba(120,120,128,0.16)',

  // 圆角
  radius: 20,
  radiusSm: 13,
};

// 通用阴影（iOS / Android 兼容）
export const shadow = {
  shadowColor: '#000',
  shadowOpacity: 0.06,
  shadowRadius: 16,
  shadowOffset: { width: 0, height: 6 },
  elevation: 3,
};

export const fontNum = 'System'; // RN 默认系统字（iOS=SF, Android=Roboto）
