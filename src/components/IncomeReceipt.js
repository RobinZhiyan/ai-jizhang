// IncomeReceipt.js — 语音记收入/亏损的入账确认回执（1:1 移植 income.jsx 的 IncomeReceipt）
import React from 'react';
import { View, Text, Pressable, Modal, StyleSheet } from 'react-native';
import Icon from './Icon';
import { T, shadow } from '../theme';
import { catMeta, MEMBERS, yuan, wan } from '../data';

const GOLD = '#FFB020', GOLD_DK = '#E8920A', RED = '#FF3B30', RED_DK = '#D70015';
const palette = (k) => (k === 'loss' ? { c: RED, dk: RED_DK, rgb: '255,59,48' } : { c: GOLD, dk: GOLD_DK, rgb: '255,176,32' });

function BeforeAfter({ label, before, after, color }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <Text style={{ fontSize: 13.5, color: T.muted }}>{label}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Text style={{ fontSize: 14, color: T.faint }}>{before}</Text>
        <Icon name="chevron" size={13} sw={2.6} color={T.faint} />
        <Text style={{ fontSize: 19, fontWeight: '700', color, letterSpacing: -0.5 }}>{after}</Text>
      </View>
    </View>
  );
}

function Delta({ label, before, after, color, align = 'left' }) {
  const justify = align === 'right' ? 'flex-end' : align === 'center' ? 'center' : 'flex-start';
  return (
    <View style={{ minWidth: 0 }}>
      <Text style={{ fontSize: 11, color: T.faint, marginBottom: 3, textAlign: align }}>{label}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4, justifyContent: justify, flexWrap: 'wrap' }}>
        <Text style={{ fontSize: 12, color: T.faint, textDecorationLine: 'line-through' }}>{before}</Text>
        <Text style={{ fontSize: 14, fontWeight: '700', color }}>{after}</Text>
      </View>
    </View>
  );
}

export function IncomeReceipt({ data, onClose }) {
  if (!data) return null;
  const loss = data.kind === 'loss';
  const p = palette(data.kind);
  const { item } = data;
  const m = catMeta(item.cat);
  const amtAbs = Math.abs(item.amt);
  const g = data.goal;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(20,20,24,0.5)', justifyContent: 'flex-end', paddingHorizontal: 14, paddingBottom: 96 }} onPress={onClose}>
        <Pressable onPress={() => {}} style={{ backgroundColor: T.surface, borderRadius: 26, paddingHorizontal: 20, paddingTop: 30, paddingBottom: 18, ...shadow, shadowOpacity: 0.3, shadowRadius: 30 }}>
          {/* 印章 */}
          <View style={{ position: 'absolute', top: -30, alignSelf: 'center', width: 68, height: 68, borderRadius: 34, backgroundColor: p.dk, alignItems: 'center', justifyContent: 'center', ...shadow, shadowColor: p.c, shadowOpacity: 0.55, shadowRadius: 14 }}>
            {loss ? <View style={{ width: 30, height: 5, borderRadius: 3, backgroundColor: '#fff' }} /> : <Icon name="check" size={34} sw={3} color="#fff" />}
          </View>

          <Text style={{ textAlign: 'center', marginTop: 12, fontSize: 21, fontWeight: T.titleWeight, color: T.ink }}>{loss ? '已记录今日亏损' : '已记入今日收入'}</Text>
          <Text style={{ textAlign: 'center', fontSize: 13, color: T.muted, marginTop: 3 }}>{loss ? '语音记账 · 已从今日收入中扣减' : `语音记账 · 自动归类为${m.zh}`}</Text>

          {/* 金额主卡 */}
          <View style={{ marginTop: 18, backgroundColor: `rgba(${p.rgb},0.08)`, borderWidth: 1, borderColor: `rgba(${p.rgb},0.22)`, borderRadius: 18, padding: 15, flexDirection: 'row', alignItems: 'center', gap: 13 }}>
            <View style={{ width: 44, height: 44, borderRadius: 13, backgroundColor: m.color, alignItems: 'center', justifyContent: 'center' }}><Icon name={m.glyph} size={23} sw={2} color="#fff" /></View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={{ fontSize: 15.5, fontWeight: '600', color: T.ink }}>{item.name}</Text>
              <Text style={{ fontSize: 12.5, color: T.muted, marginTop: 1 }}>{(MEMBERS[item.who] || {}).name || '家庭'} · 今天</Text>
            </View>
            <Text style={{ fontWeight: '800', fontSize: 26, color: p.dk, letterSpacing: -0.5 }}>{loss ? '−' : '+'}{amtAbs.toLocaleString('zh-CN')}</Text>
          </View>

          {/* 今日收入 + 本月结余 前→后 */}
          <View style={{ marginTop: 12, gap: 9, paddingHorizontal: 4 }}>
            <BeforeAfter label="今日收入" before={`¥${data.incomeBefore.toLocaleString('zh-CN')}`} after={`¥${data.incomeAfter.toLocaleString('zh-CN')}`} color={loss ? p.dk : T.ok} />
            <BeforeAfter label="本月结余" before={yuan(data.balanceBefore)} after={yuan(data.balanceAfter)} color={T.ink} />
          </View>

          {/* 小目标联动 */}
          {g && g.hasGoal && (
            <View style={{ marginTop: 14, backgroundColor: T.surface2, borderRadius: 18, padding: 14 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 12 }}>
                <View style={{ width: 30, height: 30, borderRadius: 9, backgroundColor: g.color, alignItems: 'center', justifyContent: 'center' }}><Icon name={g.glyph || 'car'} size={17} sw={2} color="#fff" /></View>
                <Text style={{ fontSize: 14.5, fontWeight: '600', color: T.ink, flex: 1 }}>{g.name}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: loss ? `rgba(${p.rgb},0.12)` : g.color + '1A', borderRadius: 999, paddingHorizontal: 9, paddingVertical: 3 }}>
                  <Icon name="trend" size={13} sw={2.4} color={loss ? p.dk : g.color} style={loss ? { transform: [{ scaleY: -1 }] } : undefined} />
                  <Text style={{ fontSize: 12, fontWeight: '600', color: loss ? p.dk : g.color }}>{loss ? '目标储备回撤' : '离目标更近一步'}</Text>
                </View>
              </View>
              <View style={{ height: 10, borderRadius: 5, backgroundColor: T.track, overflow: 'hidden' }}>
                <View style={{ height: '100%', width: `${Math.min(g.pctAfter, 100)}%`, backgroundColor: g.color, borderRadius: 5 }} />
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 11 }}>
                <Delta label="完成度" before={`${g.pctBefore.toFixed(1)}%`} after={`${g.pctAfter.toFixed(1)}%`} color={g.color} />
                <Delta label="还差" before={wan(g.remBefore)} after={wan(g.remAfter)} color={T.ink} align="center" />
                <Delta label="预计达成" before={g.etaBefore} after={g.etaAfter} color={T.ink} align="right" />
              </View>
            </View>
          )}

          <Pressable onPress={onClose} style={{ height: 50, marginTop: 16, borderRadius: 15, backgroundColor: T.accent, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 15.5, fontWeight: '600', color: T.accentInk }}>{loss ? '知道了' : '太好了'}</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
