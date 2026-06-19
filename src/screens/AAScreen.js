// AAScreen.js — 记账板块（真实记账：输入任何项目 → 自动归类 → 存储 → 实时统计 + 明细）
import React, { useState } from 'react';
import { View, Text, Pressable, TextInput, ScrollView, Modal, StyleSheet } from 'react-native';
import Icon from '../components/Icon';
import { CatIcon, Money } from '../components/ui';
import { T, shadow } from '../theme';
import { CAT_ORDER, catMeta, yuan } from '../data';
import { autoCategorize, parseEntry, inRange, catTotals, rangeTotal } from '../store';

export default function AAScreen({ open, transactions = [], onAdd, onDelete, onClose }) {
  const [text, setText] = useState('');
  const [override, setOverride] = useState(null); // 手动改的分类
  const [pickCat, setPickCat] = useState(false);

  const { name, amt } = parseEntry(text);
  const cat = override || autoCategorize(name);
  const meta = catMeta(cat);
  const canAdd = amt > 0 && name.trim();

  function submit() {
    if (!canAdd) return;
    onAdd({ id: 't' + Date.now(), name: name.trim(), amt, cat, who: 'dad', ts: Date.now() });
    setText(''); setOverride(null); setPickCat(false);
  }

  const todayTxs = inRange(transactions, 'today');
  const todaySum = rangeTotal(transactions, 'today');
  const totals = catTotals(transactions, 'today');
  const catRows = Object.keys(totals).map((id) => ({ id, amt: totals[id] })).sort((a, b) => b.amt - a.amt);
  const sorted = [...transactions].sort((a, b) => (b.ts || 0) - (a.ts || 0));

  return (
    <Modal visible={open} animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: T.bg }}>
        <View style={aa.nav}>
          <Pressable onPress={onClose} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8 }} hitSlop={8}>
            <Icon name="chevron" size={21} sw={2.4} color={T.blue} style={{ transform: [{ rotate: '180deg' }] }} />
            <Text style={{ color: T.blue, fontSize: 16, fontWeight: '500' }}>首页</Text>
          </Pressable>
          <Text style={aa.navTitle}>记账</Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {/* 输入卡 */}
          <View style={{ backgroundColor: T.surface, borderRadius: T.radius, padding: 16, ...shadow }}>
            <Text style={{ fontSize: 13, color: T.muted, marginBottom: 10 }}>说出/输入任何一笔，自动识别金额并归类</Text>
            <TextInput
              value={text} onChangeText={(t) => { setText(t); setOverride(null); }}
              placeholder="如：打车 30 · 超市买菜 88 · 奶茶 18" placeholderTextColor={T.faint}
              onSubmitEditing={submit} returnKeyType="done"
              style={{ backgroundColor: T.surface2, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, fontSize: 16, color: T.ink }}
            />
            {/* 实时解析预览 */}
            {text.trim().length > 0 && (
              <View style={{ marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Pressable onPress={() => setPickCat((v) => !v)}>
                  <CatIcon cat={cat} size={42} />
                </Pressable>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={{ fontSize: 15.5, fontWeight: '600', color: T.ink }}>{name.trim() || '（待输入名称）'}</Text>
                  <Pressable onPress={() => setPickCat((v) => !v)} style={{ flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 }}>
                    <Text style={{ fontSize: 12.5, color: meta.color, fontWeight: '600' }}>{meta.zh}</Text>
                    <Text style={{ fontSize: 11.5, color: T.faint }}>· 点击可改分类</Text>
                  </Pressable>
                </View>
                <Text style={{ fontSize: 22, fontWeight: '800', color: amt > 0 ? T.ink : T.faint }}>{amt > 0 ? `¥${amt}` : '¥?'}</Text>
              </View>
            )}
            {/* 分类选择器 */}
            {pickCat && (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                {CAT_ORDER.concat('__other').map((id) => {
                  const m = catMeta(id); const on = id === cat;
                  return (
                    <Pressable key={id} onPress={() => { setOverride(id); setPickCat(false); }} style={{ alignItems: 'center', width: 52 }}>
                      <View style={{ width: 38, height: 38, borderRadius: 11, backgroundColor: on ? m.color : m.color + '22', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon name={m.glyph} size={19} sw={2} color={on ? '#fff' : m.color} />
                      </View>
                      <Text style={{ fontSize: 10.5, color: on ? T.ink : T.muted, marginTop: 3 }} numberOfLines={1}>{m.zh}</Text>
                    </Pressable>
                  );
                })}
              </View>
            )}
            <Pressable onPress={submit} disabled={!canAdd} style={{ marginTop: 14, height: 50, borderRadius: 14, backgroundColor: canAdd ? T.accent : T.surface2, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6 }}>
              <Icon name="check" size={18} sw={2.6} color={canAdd ? T.accentInk : T.faint} />
              <Text style={{ fontSize: 15.5, fontWeight: '600', color: canAdd ? T.accentInk : T.faint }}>记一笔</Text>
            </Pressable>
          </View>

          {/* 今日汇总 */}
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 20, marginBottom: 10, paddingHorizontal: 2 }}>
            <Text style={aa.section}>今日已记</Text>
            <Text style={{ fontSize: 13, color: T.muted }}>{todayTxs.length} 笔 · 合计 <Text style={{ fontWeight: '700', color: T.ink }}>{yuan(todaySum)}</Text></Text>
          </View>
          {catRows.length > 0 && (
            <View style={{ backgroundColor: T.surface, borderRadius: T.radius, padding: 14, ...shadow, marginBottom: 16 }}>
              {catRows.map((c, i) => {
                const m = catMeta(c.id); const pctW = todaySum > 0 ? (c.amt / todaySum) * 100 : 0;
                return (
                  <View key={c.id} style={{ marginTop: i ? 12 : 0 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 6 }}>
                      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: m.color }} />
                      <Text style={{ flex: 1, fontSize: 14, color: T.ink }}>{m.zh}</Text>
                      <Text style={{ fontSize: 13.5, fontWeight: '700', color: T.ink }}>{yuan(c.amt)}</Text>
                    </View>
                    <View style={{ height: 6, borderRadius: 3, backgroundColor: T.track, overflow: 'hidden' }}>
                      <View style={{ height: '100%', width: `${pctW}%`, borderRadius: 3, backgroundColor: m.color }} />
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          {/* 全部明细 */}
          <Text style={[aa.section, { marginBottom: 10, paddingHorizontal: 2 }]}>全部明细</Text>
          <View style={{ backgroundColor: T.surface, borderRadius: T.radius, paddingHorizontal: 16, ...shadow }}>
            {sorted.length === 0 && <Text style={{ textAlign: 'center', color: T.faint, paddingVertical: 34 }}>还没有记录，上面记一笔试试</Text>}
            {sorted.map((t, i) => (
              <View key={t.id} style={[{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 }, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: T.hair }]}>
                <CatIcon cat={t.cat} size={38} />
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={{ fontSize: 15, fontWeight: '500', color: T.ink }}>{t.name}</Text>
                  <Text style={{ fontSize: 12, color: T.faint, marginTop: 2 }}>{catMeta(t.cat).zh} · {fmtTime(t.ts)}</Text>
                </View>
                <Money value={-t.amt} size={16} />
                <Pressable onPress={() => onDelete(t.id)} hitSlop={8} style={{ padding: 4 }}><Icon name="close" size={15} sw={2.2} color={T.faint} /></Pressable>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

function fmtTime(ts) {
  if (!ts) return '';
  const d = new Date(ts), now = new Date();
  const hm = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  const sameDay = d.toDateString() === now.toDateString();
  return sameDay ? `今天 ${hm}` : `${d.getMonth() + 1}月${d.getDate()}日 ${hm}`;
}

const aa = StyleSheet.create({
  nav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 8, paddingTop: 54, paddingBottom: 8, backgroundColor: T.surface, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: T.hair },
  navTitle: { fontSize: 17, fontWeight: '600', color: T.ink },
  section: { fontSize: 18, fontWeight: '700', color: T.ink },
});
