// store.js — 真实记账数据层：自动归类 + 文本解析 + 统计（替代 Demo 固定数据）
import { CATS } from './data';

// 各分类的关键词（智能归类用）
const KEYWORDS = {
  eating:   ['餐', '饭', '午餐', '晚餐', '早餐', '吃', '馆', '烧烤', '火锅', '咖啡', '奶茶', '面', '烤', '鱼', '肉', '小吃', '夜宵', '食堂', '快餐'],
  takeout:  ['外卖', '美团', '饿了么', '点餐'],
  shopping: ['购物', '网购', '淘宝', '京东', '拼多多', '数码', '电器', '家居', '母婴', '玩具'],
  veg:      ['菜', '蔬菜', '生鲜', '菜市场', '青菜'],
  fruit:    ['水果', '苹果', '香蕉', '橙', '果切', '西瓜', '葡萄'],
  transit:  ['打车', '地铁', '公交', '车费', '滴滴', '出租', '交通', '停车', '高铁', '机票', '火车', '动车', '飞机'],
  fuel:     ['加油', '汽油', '柴油', '充电'],
  phone:    ['话费', '流量', '手机费', '宽带', '网费'],
  fun:      ['电影', '游戏', '娱乐', 'ktv', '唱歌', '演唱会', '门票', '景区', '乐园', '会员', '充值'],
  social:   ['聚餐', '请客', '礼物', '红包', '人情', '份子', '送礼'],
  sport:    ['运动', '健身', '球', '游泳', '瑜伽', '跑步', '球拍', '装备'],
  clothes:  ['衣服', '裤', '鞋', '服装', '外套', '裙', '帽', '袜'],
  express:  ['快递', '邮费', '运费'],
  tobacco:  ['烟', '酒', '香烟', '白酒', '啤酒', '红酒'],
  medical:  ['药', '医院', '看病', '门诊', '体检', '医疗', '挂号', '诊所'],
  daily:    ['日用', '纸巾', '洗', '清洁', '牙膏', '洗衣液', '杂物', '卫生纸'],
  pet:      ['宠物', '猫', '狗', '猫粮', '狗粮', '兽医'],
  edu:      ['书', '学费', '培训', '绘本', '教育', '辅导', '文具', '网课'],
  mortgage: ['房贷', '车贷', '月供', '还款'],
};

// 自动归类：按项目名称关键词匹配分类，匹配不到归「其他」
export function autoCategorize(name) {
  const s = (name || '').toLowerCase();
  for (const id of Object.keys(KEYWORDS)) {
    if (KEYWORDS[id].some((k) => s.includes(k.toLowerCase()))) return id;
  }
  return '__other';
}

// 解析输入："打车 30" / "打车30元" / "30 打车" → { name, amt }
export function parseEntry(text) {
  const t = (text || '').trim();
  const m = t.match(/(\d+(?:\.\d+)?)/);
  const amt = m ? Math.round(parseFloat(m[1])) : 0;
  const name = t.replace(/[\d.]+\s*(元|块钱|块|rmb|¥)?/gi, '').trim() || '一笔';
  return { name, amt };
}

// ── 统计 ──
const startOfToday = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d.getTime(); };
const startOfWeek = () => { const d = new Date(); d.setHours(0, 0, 0, 0); const wd = (d.getDay() + 6) % 7; d.setDate(d.getDate() - wd); return d.getTime(); };
const startOfMonth = () => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(1); return d.getTime(); };

export function inRange(txs, range) {
  const from = range === 'today' ? startOfToday() : range === 'week' ? startOfWeek() : startOfMonth();
  return txs.filter((t) => (t.ts || 0) >= from);
}
// 某区间各分类汇总：{ catId: amount }
export function catTotals(txs, range) {
  const out = {};
  inRange(txs, range).forEach((t) => { out[t.cat] = (out[t.cat] || 0) + (t.amt || 0); });
  return out;
}
export function rangeTotal(txs, range) {
  return inRange(txs, range).reduce((s, t) => s + (t.amt || 0), 0);
}
export const catLabel = (id) => (id === '__other' ? '其他' : (CATS[id] ? CATS[id].zh : id));
