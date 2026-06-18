// data.js — 设计数据层（从 HTML 版 data.jsx 1:1 移植）
import { T } from './theme';

// ── 支出分类（AI 自动归类的丰富类目）────────────────────────
export const CATS = {
  eating:   { id: 'eating',   zh: '餐饮', en: 'Dining',   color: '#FF9500', glyph: 'fork'     },
  takeout:  { id: 'takeout',  zh: '外卖', en: 'Takeout',  color: '#FF6A2B', glyph: 'bowl'     },
  shopping: { id: 'shopping', zh: '购物', en: 'Shopping', color: '#FF2D55', glyph: 'bag'      },
  daily:    { id: 'daily',    zh: '日用', en: 'Daily',    color: '#34C759', glyph: 'box'      },
  veg:      { id: 'veg',      zh: '蔬菜', en: 'Veggies',  color: '#30B14F', glyph: 'leaf'     },
  fruit:    { id: 'fruit',    zh: '水果', en: 'Fruit',    color: '#FF375F', glyph: 'apple'    },
  transit:  { id: 'transit',  zh: '交通', en: 'Transit',  color: '#0A84FF', glyph: 'car'      },
  fuel:     { id: 'fuel',     zh: '加油', en: 'Fuel',     color: '#5AC8FA', glyph: 'fuel'     },
  phone:    { id: 'phone',    zh: '话费', en: 'Phone',    color: '#64D2FF', glyph: 'phone'    },
  fun:      { id: 'fun',      zh: '娱乐', en: 'Leisure',  color: '#BF5AF2', glyph: 'play'     },
  social:   { id: 'social',   zh: '社交', en: 'Social',   color: '#5E5CE6', glyph: 'chat'     },
  sport:    { id: 'sport',    zh: '运动', en: 'Sport',    color: '#FF9F0A', glyph: 'dumbbell' },
  clothes:  { id: 'clothes',  zh: '服装', en: 'Apparel',  color: '#FF6482', glyph: 'shirt'    },
  express:  { id: 'express',  zh: '快递', en: 'Parcel',   color: '#AC8E68', glyph: 'package'  },
  tobacco:  { id: 'tobacco',  zh: '烟酒', en: 'Tobacco',  color: '#8E8E93', glyph: 'bottle'   },
  medical:  { id: 'medical',  zh: '医疗', en: 'Medical',  color: '#FF453A', glyph: 'cross'    },
  pet:      { id: 'pet',      zh: '宠物', en: 'Pets',     color: '#D4A017', glyph: 'paw'      },
  edu:      { id: 'edu',      zh: '教育', en: 'Kids',     color: '#7D7AFF', glyph: 'book'     },
  mortgage: { id: 'mortgage', zh: '房贷', en: 'Mortgage', color: '#1C7ED6', glyph: 'bank'     },
};
export const CAT_ORDER = ['eating','takeout','shopping','daily','veg','fruit','transit','fuel','phone','fun','social','sport','clothes','express','tobacco','medical','pet','edu','mortgage'];

export const INCOME_CATS = {
  salary: { id: 'salary', zh: '工资', en: 'Salary',     color: '#34C759', glyph: 'wallet' },
  side:   { id: 'side',   zh: '兼职', en: 'Side gig',   color: '#30D158', glyph: 'spark'  },
  invest: { id: 'invest', zh: '投资', en: 'Investment', color: '#64D2FF', glyph: 'chart'  },
};

// ── 成员 ────────────────────────────────────────────────────
export const MEMBERS = {
  dad:  { id: 'dad',  name: '陈宇',   en: 'Dad', initial: '宇', color: '#0A84FF', role: 'admin'  },
  mom:  { id: 'mom',  name: '林悦',   en: 'Mom', initial: '悦', color: '#FF2D55', role: 'editor' },
  baby: { id: 'baby', name: '陈朵朵', en: 'Kid', initial: '朵', color: '#FF9500', role: 'viewer' },
};
export const ROLE_LABEL = { admin: '管理员', editor: '可编辑', viewer: '仅查看' };

// ── 账本（多场景）───────────────────────────────────────────
export const LEDGERS = {
  home: { id: 'home', name: '家庭日常', en: 'Household',  icon: 'house',  tint: '#0A84FF', kind: 'family',  period: '月',   budget: 8000,   spent: 5420,   hasBudget: true },
  reno: { id: 'reno', name: '新房装修', en: 'Renovation', icon: 'hammer', tint: '#FF9500', kind: 'project', period: '项目', budget: 150000, spent: 96400,  hasBudget: true },
  cafe: { id: 'cafe', name: '咖啡馆筹备', en: 'Café launch', icon: 'play', tint: '#5E5CE6', kind: 'project', period: '项目', budget: 300000, spent: 132800, hasBudget: true },
};

// ── 装修项目：施工阶段类目 ───────────────────────────────────
export const PHASES = {
  design:    { id: 'design',    zh: '设计', en: 'Design',     color: '#5E5CE6', glyph: 'edit'    },
  demo:      { id: 'demo',      zh: '拆改', en: 'Demolition', color: '#FF9500', glyph: 'hammer'  },
  wiring:    { id: 'wiring',    zh: '水电', en: 'Wiring',     color: '#0A84FF', glyph: 'wrench'  },
  tiling:    { id: 'tiling',    zh: '泥瓦', en: 'Masonry',    color: '#AC8E68', glyph: 'brick'   },
  carpentry: { id: 'carpentry', zh: '木工', en: 'Carpentry',  color: '#FF6A2B', glyph: 'box'     },
  paint:     { id: 'paint',     zh: '油漆', en: 'Paint',      color: '#34C759', glyph: 'roller'  },
  material:  { id: 'material',  zh: '主材', en: 'Materials',  color: '#FF2D55', glyph: 'package' },
  kitchen:   { id: 'kitchen',   zh: '厨卫', en: 'Kitchen',    color: '#64D2FF', glyph: 'drop'    },
  appliance: { id: 'appliance', zh: '家电', en: 'Appliance',  color: '#30B14F', glyph: 'plug'    },
  furniture: { id: 'furniture', zh: '家具', en: 'Furniture',  color: '#BF5AF2', glyph: 'sofa'    },
  soft:      { id: 'soft',      zh: '软装', en: 'Decor',      color: '#FF375F', glyph: 'spark'   },
  misc:      { id: 'misc',      zh: '其他', en: 'Misc',       color: '#8E8E93', glyph: 'sliders' },
};
export const PHASE_ORDER = ['design','demo','wiring','tiling','carpentry','paint','material','kitchen','appliance','furniture','soft','misc'];

export const RENO = {
  budget: 150000, spent: 96400, start: '3月8日', day: 84, statusText: '施工中 · 第 84 天',
  phases: {
    design: { b: 12000, s: 12000 }, demo: { b: 8000, s: 7600 }, wiring: { b: 18000, s: 18400 },
    tiling: { b: 20000, s: 19600 }, carpentry: { b: 14000, s: 9400 }, paint: { b: 8000, s: 3200 },
    material: { b: 24000, s: 17400 }, kitchen: { b: 16000, s: 7200 }, appliance: { b: 10000, s: 0 },
    furniture: { b: 12000, s: 0 }, soft: { b: 6000, s: 0 }, misc: { b: 2000, s: 1600 },
  },
  feed: [
    { id: 'r1', cat: 'material',  name: '客厅瓷砖 80㎡',   amt: 6400, who: 'dad', time: '今天 10:20', via: 'voice'  },
    { id: 'r2', cat: 'kitchen',   name: '智能马桶',        amt: 2680, who: 'mom', time: '昨天 16:05', via: 'voice'  },
    { id: 'r3', cat: 'wiring',    name: '电线辅料补单',    amt: 1200, who: 'dad', time: '昨天 09:30', via: 'manual' },
    { id: 'r4', cat: 'carpentry', name: '定制衣柜定金',    amt: 5000, who: 'mom', time: '周四 14:00', via: 'voice'  },
    { id: 'r5', cat: 'paint',     name: '乳胶漆 立邦',     amt: 1860, who: 'dad', time: '周三 11:20', via: 'voice'  },
    { id: 'r6', cat: 'tiling',    name: '瓦工人工 第二期', amt: 8000, who: 'dad', time: '周二 18:00', via: 'manual' },
  ],
};
export const PROJECT_VOICE_SCRIPT = {
  full: '我今天又买了两个锤子、四个胶带',
  chunks: [
    { at: 0.55, name: '锤子 ×2', amt: 76, cat: 'demo',     conf: 0.95 },
    { at: 1.0,  name: '胶带 ×4', amt: 32, cat: 'material', conf: 0.92 },
  ],
};

// 统一类目元信息（家庭分类 / 收入 / 装修阶段）
export function catMeta(id) {
  if (id === '__other') return { zh: '其他', en: 'Other', color: '#8E8E93', glyph: 'sliders' };
  return CATS[id] || INCOME_CATS[id] || PHASES[id] || { zh: id, en: '', color: '#8E8E93', glyph: 'plus' };
}

// ── 可切换月份（含支出 + 收入）──────────────────────────────
export const MONTHS = [
  { key: 'mar', label: '3月', full: '2025年3月', expense: 6180, income: 30000, budget: 8000 },
  { key: 'apr', label: '4月', full: '2025年4月', expense: 7320, income: 31500, budget: 8000 },
  { key: 'may', label: '5月', full: '2025年5月', expense: 5420, income: 31500, budget: 8000 },
];
export const CUR_MONTH = MONTHS.length - 1;
export const MONTH_TOTAL = MONTHS[CUR_MONTH].expense;

// 本月（5月）各分类支出
export const MAY_SPEND = {
  eating: 1180, takeout: 600, shopping: 720, daily: 240, veg: 320, fruit: 180,
  transit: 380, fuel: 200, phone: 99, fun: 280, social: 220, sport: 120,
  clothes: 280, express: 86, tobacco: 215, medical: 160, pet: 140,
};
export const CAT_BUDGET = {
  eating: 1500, takeout: 700, shopping: 700, transit: 400, fun: 400, tobacco: 300,
};

export const STATS = { today: 480, week: 1860 };
export const TODAY_INCOME = 580;
export const TODAY_EXP_LIST = [
  { name: '午餐 · 公司楼下', cat: 'eating',  amt: 65,  who: 'dad' },
  { name: '奶茶',          cat: 'eating',  amt: 20,  who: 'mom' },
  { name: '外卖',          cat: 'takeout', amt: 35,  who: 'mom' },
  { name: '地铁',          cat: 'transit', amt: 25,  who: 'dad' },
  { name: '打车',          cat: 'transit', amt: 35,  who: 'dad' },
  { name: '超市生鲜',      cat: 'veg',     amt: 110, who: 'mom' },
  { name: '羽毛球拍',      cat: 'sport',   amt: 190, who: 'dad' },
];
export const TODAY_INC_LIST = [
  { name: '兼职 · 设计外包', cat: 'side',   amt: 200, who: 'mom' },
  { name: '股票收入',        cat: 'invest', amt: 380, who: 'dad' },
];

// 本周支出明细（逐笔，按天）— 合计 1860
export const WEEK_EXP_LIST = [
  { name: '超市生鲜',     cat: 'veg',      amt: 320, who: 'mom', time: '周一' },
  { name: '午餐 · 公司',  cat: 'eating',   amt: 65,  who: 'dad', time: '周一' },
  { name: '加油',         cat: 'fuel',     amt: 200, who: 'dad', time: '周二' },
  { name: '网购 · 童装',  cat: 'shopping', amt: 300, who: 'mom', time: '周二' },
  { name: '外卖',         cat: 'takeout',  amt: 45,  who: 'dad', time: '周三' },
  { name: '电影票 ×2',    cat: 'fun',      amt: 120, who: 'mom', time: '周三' },
  { name: '打车',         cat: 'transit',  amt: 60,  who: 'dad', time: '周四' },
  { name: '水果',         cat: 'fruit',    amt: 80,  who: 'mom', time: '周四' },
  { name: '奶茶',         cat: 'eating',   amt: 35,  who: 'baby', time: '周五' },
  { name: '羽毛球拍',     cat: 'sport',    amt: 190, who: 'dad', time: '周五' },
  { name: '朋友聚餐',     cat: 'social',   amt: 245, who: 'dad', time: '周六' },
  { name: '日用品',       cat: 'daily',    amt: 120, who: 'mom', time: '周日' },
  { name: '地铁',         cat: 'transit',  amt: 80,  who: 'dad', time: '周日' },
];

// 上月（4月）各分类支出 — 合计 7320
export const APR_SPEND = {
  eating: 1620, shopping: 1080, takeout: 720, transit: 540, veg: 380, clothes: 520,
  fun: 360, fuel: 320, social: 300, daily: 260, medical: 240, fruit: 200, sport: 180,
  tobacco: 215, pet: 160, express: 126, phone: 99,
};

export function spendToCatItems(map) {
  const total = Object.values(map).reduce((s, v) => s + v, 0) || 1;
  return Object.keys(map)
    .map((id) => ({ name: catMeta(id).zh, cat: id, amt: map[id], share: map[id] / total }))
    .sort((a, b) => b.amt - a.amt);
}
export const MONTH_EXP_CATS = spendToCatItems(MAY_SPEND);
export const LASTMONTH_EXP_CATS = spendToCatItems(APR_SPEND);

// ── 时间区间：每个类目支出（方格 + 今天/本周/本月切换）──────
export const GRID_CATS = ['eating','takeout','shopping','transit','veg','fruit','daily','fun','sport','social','medical','fuel'];
export const RANGE_SPEND = {
  today: { eating: 85, takeout: 35, transit: 60, veg: 110, sport: 190 },
  week:  { eating: 520, takeout: 240, shopping: 300, transit: 160, veg: 140, fruit: 80, daily: 120, fun: 120, social: 80, fuel: 60 },
  month: MAY_SPEND,
};
export const RANGE_TOTAL = { today: 480, week: 1860, month: MONTH_TOTAL };
export const RANGE_LABEL = { today: '今日', week: '本周', month: '本月' };

// 某分类点开后的消费清单
const CAT_SAMPLE_NAMES = {
  eating:   ['午餐', '晚餐', '咖啡', '早餐'],
  takeout:  ['外卖 · 午餐', '外卖 · 晚餐', '下午茶'],
  shopping: ['网购 · 日用', '服饰', '数码配件', '母婴用品'],
  transit:  ['打车', '地铁', '公交', '停车费'],
  veg:      ['菜市场', '超市蔬菜', '社区团购'],
  fruit:    ['水果店', '超市水果', '果切'],
  daily:    ['纸巾清洁', '洗护用品', '厨房杂物'],
  fun:      ['电影票', '视频会员', '游戏充值'],
  sport:    ['健身房', '羽毛球', '运动装备'],
  social:   ['朋友聚餐', '礼物', '请客'],
  medical:  ['药店', '门诊', '体检'],
  fuel:     ['加油', '洗车', '停车'],
};
function splitAmt(total, n) {
  const w = [0.46, 0.3, 0.16, 0.08].slice(0, n);
  const ws = w.reduce((a, b) => a + b, 0);
  const parts = w.map((x) => Math.max(1, Math.round(total * x / ws)));
  parts[0] += total - parts.reduce((a, b) => a + b, 0);
  return parts;
}
export function catOrders(cat, range) {
  const src = range === 'today' ? TODAY_EXP_LIST : range === 'week' ? WEEK_EXP_LIST : null;
  if (src) { const hits = src.filter((it) => it.cat === cat); if (hits.length) return hits.map((it) => ({ ...it })); }
  const amt = (RANGE_SPEND[range] && RANGE_SPEND[range][cat]) || 0;
  if (!amt) return [];
  const names = CAT_SAMPLE_NAMES[cat] || [catMeta(cat).zh];
  const n = amt >= 400 ? Math.min(4, names.length) : amt >= 90 ? Math.min(3, names.length) : Math.min(2, names.length);
  const whos = ['dad', 'mom', 'baby'];
  return splitAmt(amt, n).map((p, i) => ({ name: names[i % names.length], cat, amt: p, who: whos[i % whos.length] }));
}

export const INCOME = { month: 31500, items: [
  { cat: 'salary', who: 'dad', amt: 18000, label: '5月工资' },
  { cat: 'salary', who: 'mom', amt: 12000, label: '5月工资' },
  { cat: 'side',   who: 'mom', amt: 1500,  label: '设计外快' },
]};
export const WEEK_INC_LIST = [
  { name: '工资 · 本周入账', cat: 'salary', amt: 7350, who: 'dad', time: '本周' },
  { name: '设计外包',       cat: 'side',   amt: 800,  who: 'mom', time: '周三' },
  { name: '股票分红',       cat: 'invest', amt: 380,  who: 'dad', time: '周五' },
];
export const MONTH_INC_LIST = INCOME.items.map((it) => ({ name: it.label, cat: it.cat, amt: it.amt, who: it.who }));

// 收支双折线趋势（本周 / 本月 / 本年）
export const TREND = {
  week:  { label: '本周', xs: ['一', '二', '三', '四', '五', '六', '日'],
           exp: [260, 180, 420, 150, 380, 245, 225],
           inc: [1050, 1050, 1250, 1480, 1430, 1050, 1220] },
  month: { label: '5月', xs: ['1日', '6日', '11日', '16日', '21日', '26日', '31日'],
           exp: [820, 760, 910, 680, 840, 720, 690],
           inc: [3000, 3000, 12000, 3000, 4500, 3000, 3000] },
  year:  { label: '本年', xs: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
           exp: [6800, 6200, 6180, 7320, 5420, 5900, 6400, 6100, 5800, 6300, 6000, 6500],
           inc: [30000, 30000, 30000, 31500, 31500, 31500, 31500, 31500, 32000, 32000, 32000, 33000] },
};

// 本月每日支出（31天）
export const DAILY = [120,0,210,95,340,60,180, 0,260,140,90,420,75,150, 200,0,310,130,80,260,110, 95,180,0,240,160,300,90, 130,210,240];

// 最近流水
export const FEED = [
  { id: 'f1', cat: 'takeout',  name: '点外卖',      amt: 30,  who: 'dad', time: '今天 12:40', via: 'voice' },
  { id: 'f2', cat: 'eating',   name: '买鱼',        amt: 20,  who: 'dad', time: '今天 12:40', via: 'voice' },
  { id: 'f3', cat: 'sport',    name: '羽毛球拍',    amt: 190, who: 'dad', time: '今天 12:40', via: 'voice' },
  { id: 'f4', cat: 'transit',  name: '打车去医院',  amt: 38,  who: 'mom', time: '昨天 19:12', via: 'voice' },
  { id: 'f5', cat: 'edu',      name: '绘本一套',    amt: 168, who: 'mom', time: '昨天 15:30', via: 'manual' },
  { id: 'f6', cat: 'veg',      name: '超市生鲜',    amt: 142, who: 'mom', time: '昨天 10:05', via: 'voice' },
  { id: 'f7', cat: 'tobacco',  name: '香烟两包',    amt: 52,  who: 'dad', time: '周三 21:40', via: 'voice' },
  { id: 'f8', cat: 'daily',    name: '洗衣液纸巾',  amt: 64,  who: 'mom', time: '周三 18:22', via: 'manual' },
];

// ── 语音示例脚本（实时拆条，演示 AI 跨类目自动归类）─────────
export const VOICE_SCRIPT = {
  full: '今天买鱼花了 20 块，点外卖 30 块，又买了个羽毛球拍 190 块',
  chunks: [
    { at: 0.42, name: '买鱼',     amt: 20,  cat: 'eating',  conf: 0.97 },
    { at: 0.68, name: '点外卖',   amt: 30,  cat: 'takeout', conf: 0.95 },
    { at: 1.0,  name: '羽毛球拍', amt: 190, cat: 'sport',   conf: 0.92 },
  ],
};
export const INCOME_VOICE_SCRIPT = {
  full: '今天股票收入 2 万块',
  chunks: [{ at: 1.0, name: '股票收入', amt: 20000, cat: 'invest', who: 'dad', kind: 'income', conf: 0.96 }],
};
export const LOSS_VOICE_SCRIPT = {
  full: '今天理财亏损 1500 块',
  chunks: [{ at: 1.0, name: '理财亏损', amt: -1500, cat: 'invest', who: 'dad', kind: 'loss', conf: 0.95 }],
};

// ── helpers ─────────────────────────────────────────────────
export function yuan(n, opts = {}) {
  const s = Math.abs(n).toLocaleString('zh-CN', { minimumFractionDigits: opts.dec ? 2 : 0, maximumFractionDigits: opts.dec ? 2 : 0 });
  return (n < 0 ? '-' : '') + '¥' + s;
}
export function pct(spent, budget) { return budget > 0 ? spent / budget : 0; }
export function budgetState(p) { if (p > 1) return 'over'; if (p >= 0.85) return 'warn'; return 'ok'; }
export function stateColor(s) { return s === 'over' ? T.over : s === 'warn' ? T.warn : T.ok; }

export function catSpendSorted() {
  return Object.keys(MAY_SPEND).map((id) => ({ id, value: MAY_SPEND[id], color: CATS[id].color }))
    .sort((a, b) => b.value - a.value);
}
export function donutData(n = 7) {
  const all = catSpendSorted();
  const top = all.slice(0, n);
  const restSum = all.slice(n).reduce((s, d) => s + d.value, 0);
  const data = top.slice();
  if (restSum > 0) data.push({ id: '__other', value: restSum, color: '#C7C7CC', other: true });
  return data;
}

// ── 小目标（储蓄目标 + 攒钱时长折算）移植 goal.jsx ────────────
export const GOAL_DEFAULT = {
  enabled: true, name: '蔚来 ES9', glyph: 'car', color: '#0A84FF',
  target: 800000, saved: 500000, monthly: 26080, // ≈ 本月结余
};
export function goalRemaining(g) { return Math.max((Number(g.target) || 0) - (Number(g.saved) || 0), 0); }
export function goalProgress(g) { const t = Number(g.target) || 0; return t > 0 ? Math.min((Number(g.saved) || 0) / t, 1) : 0; }
export function goalMonths(g) {
  const r = goalRemaining(g), m = Number(g.monthly) || 0;
  if (r <= 0) return 0;
  if (m <= 0) return Infinity;
  return Math.ceil(r / m);
}
export function fmtMonths(n) {
  if (n === 0) return '已达成';
  if (!isFinite(n)) return '—';
  if (n < 12) return `约 ${n} 个月`;
  const y = Math.floor(n / 12), mo = n % 12;
  return mo ? `约 ${y} 年 ${mo} 个月` : `约 ${y} 年`;
}
export function wan(n) {
  const v = (Number(n) || 0) / 10000;
  const str = Number.isInteger(v) ? v : v.toFixed(1);
  return '¥' + str + '万';
}
export const yuanFull = (n) => '¥' + Math.round(Number(n) || 0).toLocaleString('zh-CN');

// ── 固定收支（月薪自动入账 + 房贷/车贷还款）移植 fixed.jsx ────
export const FIXED_DEFAULTS = {
  salaries: [
    { id: 's-dad', who: 'dad', amount: 20000 },
    { id: 's-mom', who: 'mom', amount: 20000 },
  ],
  loans: [
    { id: 'l-house', name: '房贷', glyph: 'bank', color: '#1C7ED6', amount: 8600, day: 15, mode: 'full' },
    { id: 'l-car', name: '车贷', glyph: 'car', color: '#0A84FF', amount: 3200, day: 8, mode: 'spread' },
  ],
};
const DPM = 30;
const sumF = (arr, f) => arr.reduce((s, x) => s + (Number(f(x)) || 0), 0);
export function fixedMonthlySalary(c) { return sumF(c.salaries, (x) => x.amount); }
export function fixedDailyIncome(c) { return Math.round(fixedMonthlySalary(c) / DPM); }
export function fixedMonthlyLoan(c) { return sumF(c.loans, (l) => l.amount); }
export function fixedDailyAmort(c) { return Math.round(sumF(c.loans.filter((l) => l.mode === 'spread'), (l) => l.amount) / DPM); }
export function fixedDailyNet(c) { return fixedDailyIncome(c) - fixedDailyAmort(c); }
