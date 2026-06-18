// data.js — 分类 / 成员 / 小目标 / AA 示例 / mock 数据 / helpers（从 HTML 版移植）

// ── 支出分类（AI 自动归类）──────────────────────────────────
export const CATS = {
  eating:   { id: 'eating',   zh: '餐饮', color: '#FF9500', glyph: 'fork'    },
  takeout:  { id: 'takeout',  zh: '外卖', color: '#FF6A2B', glyph: 'bowl'    },
  shopping: { id: 'shopping', zh: '购物', color: '#FF2D55', glyph: 'bag'     },
  daily:    { id: 'daily',    zh: '日用', color: '#34C759', glyph: 'box'     },
  veg:      { id: 'veg',      zh: '蔬菜', color: '#30B14F', glyph: 'leaf'    },
  fruit:    { id: 'fruit',    zh: '水果', color: '#FF375F', glyph: 'apple'   },
  transit:  { id: 'transit',  zh: '交通', color: '#0A84FF', glyph: 'car'     },
  fuel:     { id: 'fuel',     zh: '加油', color: '#5AC8FA', glyph: 'fuel'    },
  phone:    { id: 'phone',    zh: '话费', color: '#64D2FF', glyph: 'phone'   },
  fun:      { id: 'fun',      zh: '娱乐', color: '#BF5AF2', glyph: 'play'    },
  social:   { id: 'social',   zh: '社交', color: '#5E5CE6', glyph: 'chat'    },
  sport:    { id: 'sport',    zh: '运动', color: '#FF9F0A', glyph: 'dumbbell'},
  medical:  { id: 'medical',  zh: '医疗', color: '#FF453A', glyph: 'cross'   },
};

export const INCOME_CATS = {
  salary: { id: 'salary', zh: '工资', color: '#34C759', glyph: 'wallet' },
  side:   { id: 'side',   zh: '兼职', color: '#30D158', glyph: 'spark'  },
  invest: { id: 'invest', zh: '投资', color: '#64D2FF', glyph: 'chart'  },
};

export function catMeta(id) {
  if (id === '__other') return { zh: '其他', color: '#8E8E93', glyph: 'sliders' };
  return CATS[id] || INCOME_CATS[id] || { zh: id, color: '#8E8E93', glyph: 'plus' };
}

// ── 成员 ────────────────────────────────────────────────────
export const MEMBERS = {
  dad:  { id: 'dad',  name: '陈宇',   initial: '宇', color: '#0A84FF', role: 'admin'  },
  mom:  { id: 'mom',  name: '林悦',   initial: '悦', color: '#FF2D55', role: 'editor' },
  baby: { id: 'baby', name: '陈朵朵', initial: '朵', color: '#FF9500', role: 'viewer' },
};
export const ROLE_LABEL = { admin: '管理员', editor: '可编辑', viewer: '仅查看' };

// ── 首页数字 ────────────────────────────────────────────────
export const TODAY = { exp: 480, inc: 1913, balance: 26080 };

// ── 小目标（首页并发 2 个）──────────────────────────────────
export const GOALS = [
  { id: 'g_es9',     name: '蔚来 ES9',  glyph: 'car',    color: '#0A84FF', tag: '小目标', target: 800000,  saved: 500000, etaText: '约 1 年攒够' },
  { id: 'g_save100', name: '攒够 100 万', glyph: 'wallet', color: '#34C759', tag: '攒钱',   target: 1000000, saved: 320000, etaText: '约 2 年攒够' },
];
export const goalPct = (g) => Math.min(g.saved / g.target, 1);
export const goalRemain = (g) => Math.max(g.target - g.saved, 0);

// ── 分类支出方格（今天 / 本周 / 本月）──────────────────────
export const GRID_CATS = ['eating','takeout','shopping','transit','veg','fruit','daily','fun','sport','social','medical','fuel'];
export const RANGE_SPEND = {
  today: { eating: 85, takeout: 35, transit: 60, veg: 110, sport: 190 },
  week:  { eating: 520, takeout: 240, shopping: 300, transit: 160, veg: 140, fruit: 80, daily: 120, fun: 120, social: 80, fuel: 60 },
  month: { eating: 1180, takeout: 600, shopping: 720, daily: 240, veg: 320, fruit: 180, transit: 380, fuel: 200, phone: 99, fun: 280, social: 220, sport: 120, medical: 160 },
};
export const RANGE_TOTAL = { today: 480, week: 1860, month: 5420 };

// ── 收支双折线趋势（分析页）─────────────────────────────────
export const TREND = {
  week:  { label: '本周', xs: ['一','二','三','四','五','六','日'],
           exp: [260,180,420,150,380,245,225], inc: [1050,1050,1250,1480,1430,1050,1220] },
  month: { label: '5月', xs: ['1日','6日','11日','16日','21日','26日','31日'],
           exp: [820,760,910,680,840,720,690], inc: [3000,3000,12000,3000,4500,3000,3000] },
};

// 分类占比（分析页环形 / 列表）
export const MONTH_CATS = Object.keys(RANGE_SPEND.month)
  .map((id) => ({ id, value: RANGE_SPEND.month[id], color: catMeta(id).color, zh: catMeta(id).zh }))
  .sort((a, b) => b.value - a.value);

// ── AA 算账工具示例 ─────────────────────────────────────────
export const AA_SAMPLES = [
  { name: '景区门票 ×6', cat: 'fun',      amt: 720 },
  { name: '农家乐午餐',   cat: 'eating',   amt: 486 },
  { name: '包车往返',     cat: 'transit',  amt: 360 },
  { name: '零食饮料水',   cat: 'shopping', amt: 128 },
  { name: '儿童乐园',     cat: 'fun',      amt: 240 },
  { name: '烧烤食材',     cat: 'eating',   amt: 312 },
];

// ── helpers ─────────────────────────────────────────────────
export function yuan(n) {
  const s = Math.abs(n).toLocaleString('zh-CN');
  return (n < 0 ? '-' : '') + '¥' + s;
}
