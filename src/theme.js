// theme.js — 设计系统 tokens（从 HTML 版 themeVars 1:1 移植）
// RN 不支持 CSS 变量，这里用 JS 对象 T 承载所有 var(--x)；组件统一引用 T.xxx。

// 浅色 · 原生 Clean（原型默认）
export const T = {
  // 语义色
  ok: '#34C759', warn: '#FF9500', over: '#FF3B30', blue: '#0A84FF',

  // 表面
  bg: '#E4E5EA', surface: '#FFFFFF', surface2: '#F2F2F7',

  // 文字
  ink: '#1C1C1E', muted: 'rgba(60,60,67,0.6)', faint: 'rgba(60,60,67,0.34)', hair: 'rgba(60,60,67,0.12)',

  // 强调（深色卡 / 按钮）
  accent: '#1C1C1E', accentInk: '#FFFFFF', track: 'rgba(120,120,128,0.16)',

  // 顶部大卡（hero，默认=accent；可被账本/配色覆盖）
  hero: '#1C1C1E', heroInk: '#FFFFFF', heroMuted: 'rgba(235,235,245,0.62)', heroFaint: 'rgba(235,235,245,0.34)', heroOverlay: '255,255,255',

  // 方块（tile，默认=surface）
  tile: '#FFFFFF', tileInk: '#1C1C1E', tileMuted: 'rgba(60,60,67,0.6)', tileFaint: 'rgba(60,60,67,0.36)',

  // 记账落入高亮 / 呼吸灯
  flash: '#FF2D55', flashRgb: '255,45,85',

  // 圆角 / 字重
  radius: 20, radiusSm: 13,
  numWeight: '700', titleWeight: '700', titleSpacing: 0.3,
};

// 通用阴影（iOS / Android 兼容）
export const shadow = {
  shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 3,
};
// 更轻的阴影（方块 / 小卡）
export const shadowSm = {
  shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 1,
};

// 根据底色亮度派生协调文字色（深底→浅字，浅底→深字）—— 移植自 app.jsx inkSet
function hexRgb(h) {
  h = (h || '').replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}
function lum(hex) {
  const [r, g, b] = hexRgb(hex).map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
export function inkSet(hex) {
  const onDark = lum(hex) < 0.5;
  return onDark
    ? { ink: '#FFFFFF', muted: 'rgba(235,235,245,0.62)', faint: 'rgba(235,235,245,0.34)', overlay: '255,255,255' }
    : { ink: '#1C1C1E', muted: 'rgba(60,60,67,0.6)', faint: 'rgba(60,60,67,0.36)', overlay: '28,28,30' };
}
export const rgbOf = (hex) => hexRgb(hex).join(',');

export const fontNum = 'System';
