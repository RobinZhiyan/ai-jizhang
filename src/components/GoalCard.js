// GoalCard.js — 小目标卡 + 配置二级页（1:1 移植 goal.jsx）
import React from 'react';
import { View, Text, Pressable, Modal, TextInput, ScrollView, StyleSheet } from 'react-native';
import Icon from './Icon';
import { Card, Bar } from './ui';
import { T, shadow } from '../theme';
import { goalRemaining, goalProgress, goalMonths, fmtMonths, wan, yuanFull } from '../data';

function goalETA(g) {
  const n = goalMonths(g);
  if (n === 0 || !isFinite(n)) return null;
  const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() + n);
  return `${d.getFullYear()}年${d.getMonth() + 1}月`;
}

// ── 首页进度卡（一行精简，默认版）──
export function GoalCard({ goal, onOpenGoal }) {
  if (!goal || !goal.enabled || !(Number(goal.target) > 0)) return null;
  const p = goalProgress(goal);
  const rem = goalRemaining(goal);
  const months = goalMonths(goal);
  const col = goal.color || T.blue;
  const done = rem <= 0;
  return (
    <Card onPress={onOpenGoal} style={{ marginBottom: 10 }} pad={12}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <View style={[gc.iconBox, { backgroundColor: col }]}><Icon name={goal.glyph || 'car'} size={17} sw={2} color="#fff" /></View>
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
          <Text style={{ fontSize: 10.5, fontWeight: '700', color: col, letterSpacing: 0.3 }}>小目标</Text>
          <Text numberOfLines={1} style={{ fontSize: 14.5, fontWeight: T.titleWeight, color: T.ink, flexShrink: 1 }}>{goal.name || '我的目标'}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: col, letterSpacing: -0.5 }}>{(p * 100).toFixed(1)}</Text>
          <Text style={{ fontSize: 11, fontWeight: '600', color: col }}>%</Text>
        </View>
        <Icon name="chevron" size={15} color={T.faint} />
      </View>
      <View style={{ marginTop: 8 }}><Bar p={p} color={col} h={7} /></View>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
        <Text style={{ fontSize: 12, color: T.muted }}>{done ? '已攒够 🎉' : <Text>还差 <Text style={{ fontWeight: '700', color: T.ink }}>{yuanFull(rem)}</Text></Text>}</Text>
        {!done && <Text style={{ fontSize: 12, color: T.muted }}><Text style={{ fontWeight: '700', color: col }}>{fmtMonths(months)}</Text>攒够</Text>}
      </View>
    </Card>
  );
}

// ── 配置页小部件 ──
function Switch({ on, onChange }) {
  return (
    <Pressable onPress={() => onChange(!on)} style={{ width: 50, height: 30, borderRadius: 15, backgroundColor: on ? T.ok : T.track, justifyContent: 'center' }}>
      <View style={{ position: 'absolute', top: 3, left: on ? 23 : 3, width: 24, height: 24, borderRadius: 12, backgroundColor: '#fff', ...shadow, shadowOpacity: 0.3, shadowRadius: 3 }} />
    </Pressable>
  );
}

function MoneyField({ label, value, onChange, hint, last }) {
  return (
    <View style={{ paddingVertical: 13, borderBottomWidth: last ? 0 : StyleSheet.hairlineWidth, borderBottomColor: T.hair }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Text style={{ flex: 1, fontSize: 15.5, color: T.ink, fontWeight: '500' }}>{label}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: T.surface2, borderRadius: 11, paddingHorizontal: 13, paddingVertical: 9, width: 168 }}>
          <Text style={{ fontSize: 15, color: T.faint }}>¥</Text>
          <TextInput
            value={value === 0 ? '' : String(value)} placeholder="0" placeholderTextColor={T.faint} keyboardType="number-pad"
            onChangeText={(txt) => { const n = parseInt(txt.replace(/[^0-9]/g, ''), 10); onChange(Number.isFinite(n) ? n : 0); }}
            style={{ flex: 1, fontWeight: T.numWeight, fontSize: 17, color: T.ink, textAlign: 'right', padding: 0 }} />
        </View>
      </View>
      {(hint || value > 0) ? (
        <Text style={{ fontSize: 12, color: T.faint, marginTop: 6, textAlign: 'right' }}>{value > 0 ? `= ${wan(value)}` : ''}{hint ? (value > 0 ? ' · ' : '') + hint : ''}</Text>
      ) : null}
    </View>
  );
}

const GOAL_GLYPHS = ['car', 'house', 'bag', 'sofa', 'spark', 'play'];
const GOAL_COLORS = ['#0A84FF', '#5E5CE6', '#34C759', '#FF9500', '#FF2D55', '#1C1C1E'];

// ── 配置二级页（Modal 全屏）──
export function GoalConfigPage({ open, onClose, goal, setGoal }) {
  const g = goal;
  const up = (patch) => setGoal((prev) => ({ ...prev, ...patch }));
  const rem = goalRemaining(g);
  const months = goalMonths(g);
  const eta = goalETA(g);
  const done = rem <= 0;
  const noRate = !(Number(g.monthly) > 0);

  return (
    <Modal visible={open} animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: T.bg }}>
        {/* nav */}
        <View style={gc.nav}>
          <Pressable onPress={onClose} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8 }} hitSlop={8}>
            <Icon name="chevron" size={21} sw={2.4} color={T.blue} style={{ transform: [{ rotate: '180deg' }] }} />
            <Text style={{ color: T.blue, fontSize: 16, fontWeight: '500' }}>我的</Text>
          </Pressable>
          <Text style={gc.navTitle}>小目标</Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          {/* 折算结果 */}
          <View style={gc.result}>
            <Text style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.62)' }}>{done ? '目标已达成' : noRate ? '请填写「每月可存」以折算' : '按现在的进度，预计攒够还需'}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 10, marginTop: 7, flexWrap: 'wrap' }}>
              <Text style={{ fontWeight: '700', fontSize: 34, letterSpacing: -1, color: done ? T.ok : '#fff' }}>{done ? '🎉 已攒够' : fmtMonths(months)}</Text>
              {eta && !done ? <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>{eta}</Text> : null}
            </View>
            {!done && (
              <View style={{ flexDirection: 'row', gap: 18, marginTop: 15, paddingTop: 14, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: 'rgba(255,255,255,0.16)' }}>
                <View>
                  <Text style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.6)' }}>还差</Text>
                  <Text style={{ fontWeight: '600', fontSize: 18, color: '#fff', marginTop: 3 }}>{yuanFull(rem)}</Text>
                </View>
                <View style={{ width: StyleSheet.hairlineWidth, backgroundColor: 'rgba(255,255,255,0.18)' }} />
                <View>
                  <Text style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.6)' }}>当前进度</Text>
                  <Text style={{ fontWeight: '600', fontSize: 18, color: '#fff', marginTop: 3 }}>{Math.round(goalProgress(g) * 100)}%</Text>
                </View>
              </View>
            )}
          </View>

          {/* 目标设定 */}
          <Text style={gc.section}>目标设定</Text>
          <Card pad={0} style={{ paddingHorizontal: 16, paddingBottom: 16, marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: T.hair }}>
              <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: g.color, alignItems: 'center', justifyContent: 'center' }}><Icon name={g.glyph} size={22} sw={2} color="#fff" /></View>
              <TextInput value={g.name} onChangeText={(t) => up({ name: t })} placeholder="目标名称，如「蔚来 ES9」" placeholderTextColor={T.faint}
                style={{ flex: 1, fontSize: 16.5, fontWeight: '600', color: T.ink, padding: 0 }} />
            </View>
            <View style={{ flexDirection: 'row', gap: 9, flexWrap: 'wrap', paddingTop: 13 }}>
              {GOAL_GLYPHS.map((gl) => (
                <Pressable key={gl} onPress={() => up({ glyph: gl })} style={{ width: 38, height: 38, borderRadius: 11, backgroundColor: g.glyph === gl ? g.color : T.surface2, alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name={gl} size={19} sw={2} color={g.glyph === gl ? '#fff' : T.muted} />
                </Pressable>
              ))}
            </View>
            <View style={{ flexDirection: 'row', gap: 11, paddingTop: 12 }}>
              {GOAL_COLORS.map((c) => (
                <Pressable key={c} onPress={() => up({ color: c })} style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: c, borderWidth: g.color === c ? 2 : 0, borderColor: T.surface, ...(g.color === c ? { ...shadow, shadowColor: c, shadowOpacity: 0.6 } : null) }} />
              ))}
            </View>
          </Card>

          {/* 金额 */}
          <Card pad={0} style={{ paddingHorizontal: 16, marginBottom: 12 }}>
            <MoneyField label="目标总价" value={g.target} onChange={(v) => up({ target: v })} />
            <MoneyField label="当前储备" value={g.saved} onChange={(v) => up({ saved: v })} />
            <MoneyField label="每月可存" value={g.monthly} onChange={(v) => up({ monthly: v })} hint="默认按本月结余折算" last />
          </Card>

          {/* 开关 */}
          <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }} pad={16}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15.5, fontWeight: '500', color: T.ink }}>在首页显示进度条</Text>
              <Text style={{ fontSize: 12.5, color: T.muted, marginTop: 2 }}>关闭后首页不再显示「小目标」卡片</Text>
            </View>
            <Switch on={g.enabled} onChange={(v) => up({ enabled: v })} />
          </Card>

          <View style={{ marginTop: 16, padding: 16, backgroundColor: T.surface2, borderRadius: 14 }}>
            <Text style={{ fontWeight: '600', color: T.ink, marginBottom: 4 }}>折算方式</Text>
            <Text style={{ fontSize: 12.5, color: T.muted, lineHeight: 21 }}>还差金额 = 目标总价 − 当前储备{'\n'}预计时长 = 还差金额 ÷ 每月可存（向上取整）</Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const gc = StyleSheet.create({
  iconBox: { width: 30, height: 30, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  nav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 8, paddingTop: 54, paddingBottom: 8, backgroundColor: T.surface, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: T.hair },
  navTitle: { fontSize: 17, fontWeight: '600', color: T.ink },
  result: { backgroundColor: T.accent, borderRadius: T.radius, padding: 18, marginBottom: 16, ...shadow },
  section: { paddingHorizontal: 2, paddingBottom: 9, fontSize: 17, fontWeight: T.titleWeight, color: T.ink },
});
