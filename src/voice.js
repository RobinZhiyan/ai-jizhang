// voice.js — 真实语音识别（@react-native-voice/voice）+ 把识别文本解析为多笔交易
import { autoCategorize, parseEntry } from './store';

let Voice = null;
try { Voice = require('@react-native-voice/voice').default; } catch (e) { Voice = null; }
export { Voice };
export const hasVoice = !!Voice;

// 把一段识别文本解析成多笔：依次匹配「名称+金额」，自动归类
// 例：「外卖30 打车20」→ [{外卖,30,takeout},{打车,20,transit}]
export function parseSpeech(text) {
  if (!text) return [];
  const items = [];
  const re = /([^\d、，,;；。\s]+(?:\s[^\d、，,;；。]+?)?)\s*(\d+(?:\.\d+)?)\s*(?:元|块钱|块|毛|角|圆)?/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    let name = m[1].replace(/[、，,;；。]/g, '').replace(/^(今天|昨天|刚才|刚刚|刚|我|帮我|给我|顺便|然后)/, '').replace(/(买了|买|花了|花|用了|用|充了|充|付了|付|又|还|和)/g, '').trim();
    if (!name) name = m[1].replace(/[、，,;；。\s]/g, '').trim();
    const amt = Math.round(parseFloat(m[2]));
    if (amt > 0 && name) items.push({ name, amt, cat: autoCategorize(name) });
  }
  if (items.length === 0) {
    const { name, amt } = parseEntry(text);
    if (amt > 0) items.push({ name: name || '一笔', amt, cat: autoCategorize(name) });
  }
  return items;
}

// 判断记账方向：收入 / 亏损 / 支出（按关键词）
export function detectMode(text) {
  const s = text || '';
  if (/亏|赔|亏损|损失|扣减|跌/.test(s)) return 'loss';
  if (/工资|收入|红包|奖金|进账|赚|报销|收款|转入|分红|利息/.test(s)) return 'income';
  return 'expense';
}
