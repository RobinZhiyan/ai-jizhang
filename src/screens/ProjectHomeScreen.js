// ProjectHomeScreen.js — 装修预算管理（项目制首页）1:1 移植 project.jsx
import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import Icon from '../components/Icon';
import { Card, CatIcon, CatTile, Avatar, Money, Bar, Pill, Sheet } from '../components/ui';
import { T, shadow } from '../theme';
import { PHASES, PHASE_ORDER, RENO, MEMBERS, catMeta, yuan, pct, budgetState, stateColor } from '../data';

export default function ProjectHomeScreen({ ledger, onOpenLedger, onOpenAgent, onOpenBudget }) {
  const [showFeed, setShowFeed] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [shared, setShared] = useState(false);

  const spent = RENO.spent;
  const budget = RENO.budget;
  const remain = budget - spent;
  const p = pct(spent, budget);
  const st = budgetState(p);
  const col = stateColor(st);

  const phaseAmt = (id) => RENO.phases[id].s;
  const overList = PHASE_ORDER.filter((id) => phaseAmt(id) > RENO.phases[id].b);
  const doneCnt = PHASE_ORDER.filter((id) => phaseAmt(id) >= RENO.phases[id].b && RENO.phases[id].b > 0).length;
  const activeCnt = PHASE_ORDER.filter((id) => { const a = phaseAmt(id); return a > 0 && a < RENO.phases[id].b; }).length;

  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 30 }} showsVerticalScrollIndicator={false}>
        {/* header */}
        <View style={pr.header}>
          <Pressable onPress={onOpenLedger}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <Text style={pr.title}>{ledger.name}</Text>
              <Icon name="chevron" size={16} sw={2.4} color={T.faint} style={{ transform: [{ rotate: '90deg' }] }} />
            </View>
            <Text style={{ fontSize: 12.5, color: T.muted, marginTop: 2 }}>项目 · {RENO.statusText}</Text>
          </Pressable>
          <View style={{ flexDirection: 'row' }}>
            {['dad', 'mom'].map((id, i) => (<View key={id} style={{ marginLeft: i ? -10 : 0 }}><Avatar m={MEMBERS[id]} size={30} ring /></View>))}
          </View>
        </View>

        {/* hero: 项目预算进度 */}
        <View style={pr.hero}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View>
              <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.62)' }}>已支出 · 总预算 {yuan(budget)}</Text>
              <Text style={{ marginTop: 7, fontWeight: T.numWeight, fontSize: 40, letterSpacing: -1.5, color: '#fff' }}>
                <Text style={{ fontSize: 22, opacity: 0.8 }}>¥</Text>{spent.toLocaleString('zh-CN')}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ color: col, fontWeight: '700' }}><Text style={{ fontSize: 30, letterSpacing: -1 }}>{Math.round(p * 100)}</Text><Text style={{ fontSize: 15 }}>%</Text></Text>
              <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>已用</Text>
            </View>
          </View>
          <View style={{ marginTop: 14 }}><Bar p={p} color={col} track="rgba(255,255,255,0.18)" h={9} /></View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
            <Text style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.82)' }}>剩余可用 <Text style={{ fontWeight: '700' }}>{yuan(remain)}</Text></Text>
            <Text style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.82)' }}>{doneCnt} 阶段完成 · {activeCnt} 进行中</Text>
          </View>
        </View>

        {/* 智能预警 */}
        <View style={[pr.alert, { backgroundColor: overList.length ? 'rgba(255,149,0,0.12)' : 'rgba(52,199,89,0.10)' }]}>
          <Icon name="sparkles" size={18} fill color={overList.length ? T.warn : T.ok} />
          <Text style={{ flex: 1, fontSize: 13, color: T.ink, lineHeight: 19 }}>
            {overList.length
              ? <Text><Text style={{ fontWeight: '700' }}>{overList.map((id) => PHASES[id].zh).join('、')}</Text> 已超阶段预算，合计超 {yuan(overList.reduce((s, id) => s + (phaseAmt(id) - RENO.phases[id].b), 0))}。建议从未开工阶段调剂，<Text style={{ color: T.warn, fontWeight: '700' }}>注意总预算。</Text></Text>
              : <Text>各阶段均在预算内，剩余 {yuan(remain)} 可覆盖未开工阶段。<Text style={{ color: T.ok, fontWeight: '700' }}>预计不会超支。</Text></Text>}
          </Text>
        </View>

        {/* 阶段方格 */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <Text style={pr.secTitle}>施工阶段</Text>
          <Pressable onPress={onOpenBudget}><Text style={{ color: T.blue, fontSize: 14, fontWeight: '500' }}>调整预算</Text></Pressable>
        </View>
        <View style={pr.grid}>
          {PHASE_ORDER.map((id) => (
            <View key={id} style={{ width: '31.5%' }}>
              <CatTile id={id} amount={phaseAmt(id)} budget={RENO.phases[id].b} compact />
            </View>
          ))}
        </View>

        {/* 入口 */}
        <Pressable onPress={() => setShowFeed(true)} style={pr.entry}>
          <Icon name="calendar" size={18} sw={1.9} color={T.muted} />
          <Text style={{ flex: 1, fontSize: 14.5, fontWeight: '500', color: T.ink }}>采购明细</Text>
          <Text style={{ fontSize: 13, color: T.faint }}>累计 {RENO.feed.length} 笔</Text>
          <Icon name="chevron" size={17} color={T.faint} />
        </Pressable>
        <Pressable onPress={() => setShowReport(true)} style={[pr.entry, { marginTop: 10 }]}>
          <Icon name="chart" size={18} sw={1.9} color={T.muted} />
          <Text style={{ flex: 1, fontSize: 14.5, fontWeight: '500', color: T.ink }}>预算表单</Text>
          <Pill color={T.ok} bg="rgba(52,199,89,0.13)">可分享</Pill>
          <Icon name="chevron" size={17} color={T.faint} />
        </Pressable>

        {/* agent */}
        <Pressable onPress={onOpenAgent} style={pr.agent}>
          <View style={{ width: 36, height: 36, borderRadius: 11, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="mic" size={20} sw={1.9} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14.5, fontWeight: '600', color: '#fff' }}>按住麦克风说采购，自动归类</Text>
            <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.78)', marginTop: 1 }}>“两个锤子、四个胶带” → 飞入拆改/主材</Text>
          </View>
          <Icon name="chevron" size={18} color="rgba(255,255,255,0.8)" />
        </Pressable>
      </ScrollView>

      {/* 采购明细 */}
      <Sheet open={showFeed} onClose={() => setShowFeed(false)} title="采购明细">
        <View style={{ backgroundColor: T.surface, borderRadius: T.radius, paddingHorizontal: 16, paddingVertical: 4, ...shadow }}>
          {RENO.feed.map((it, i) => {
            const mm = MEMBERS[it.who];
            return (
              <View key={it.id} style={[{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 }, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: T.hair }]}>
                <CatIcon cat={it.cat} size={38} />
                <View style={{ flex: 1, minWidth: 0 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={{ fontSize: 15, fontWeight: '500', color: T.ink }}>{it.name}</Text>
                    {it.via === 'voice' && <Icon name="wave" size={12} sw={2.2} color={T.blue} />}
                  </View>
                  <Text style={{ fontSize: 12, color: T.faint, marginTop: 2 }}>{PHASES[it.cat].zh} · {mm.name} · {it.time}</Text>
                </View>
                <Money value={-it.amt} size={16} />
              </View>
            );
          })}
        </View>
      </Sheet>

      {/* 预算表单（可分享报表） */}
      <Sheet open={showReport} onClose={() => { setShowReport(false); setShared(false); }} title="预算表单">
        <View style={{ backgroundColor: T.surface, borderRadius: T.radius, padding: 18, ...shadow }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 11, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: T.hair }}>
            <View style={{ width: 38, height: 38, borderRadius: 11, backgroundColor: ledger.tint, alignItems: 'center', justifyContent: 'center' }}><Icon name={ledger.icon} size={20} sw={2} color="#fff" /></View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: T.ink }}>新房装修 · 预算表</Text>
              <Text style={{ fontSize: 11.5, color: T.muted, marginTop: 1 }}>{RENO.statusText} · 金额单位 元</Text>
            </View>
          </View>
          {/* 表头 */}
          <View style={{ flexDirection: 'row', paddingTop: 12, paddingBottom: 8 }}>
            <Text style={[pr.th, { flex: 1, textAlign: 'left' }]}>阶段</Text>
            <Text style={[pr.th, { width: 62 }]}>预算</Text>
            <Text style={[pr.th, { width: 62 }]}>实际</Text>
            <Text style={[pr.th, { width: 60 }]}>结余</Text>
          </View>
          {PHASE_ORDER.map((id) => {
            const b = RENO.phases[id].b, sp = phaseAmt(id), diff = b - sp;
            return (
              <View key={id} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 9, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: T.hair }}>
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 7 }}>
                  <View style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: PHASES[id].color }} />
                  <Text style={{ fontSize: 12.5, color: T.ink }}>{PHASES[id].zh}</Text>
                </View>
                <Text style={[pr.td, { width: 62, color: T.muted }]}>{b.toLocaleString('zh-CN')}</Text>
                <Text style={[pr.td, { width: 62, color: T.ink, fontWeight: '600' }]}>{sp.toLocaleString('zh-CN')}</Text>
                <Text style={[pr.td, { width: 60, color: diff < 0 ? T.over : T.faint }]}>{diff < 0 ? '−' : ''}{Math.abs(diff).toLocaleString('zh-CN')}</Text>
              </View>
            );
          })}
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 11, borderTopWidth: 1.5, borderTopColor: T.ink }}>
            <Text style={{ flex: 1, fontSize: 13, fontWeight: '700', color: T.ink }}>合计</Text>
            <Text style={[pr.td, { width: 62, color: T.ink, fontWeight: '700' }]}>{budget.toLocaleString('zh-CN')}</Text>
            <Text style={[pr.td, { width: 62, color: T.ink, fontWeight: '700' }]}>{spent.toLocaleString('zh-CN')}</Text>
            <Text style={[pr.td, { width: 60, fontWeight: '700', color: remain < 0 ? T.over : T.ok }]}>{remain < 0 ? '−' : ''}{Math.abs(remain).toLocaleString('zh-CN')}</Text>
          </View>
          <Text style={{ fontSize: 11, color: T.faint, marginTop: 14, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: T.hair }}>生成于 2026年6月1日 · 陈宇的家 · 声记</Text>
        </View>

        {shared && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12, backgroundColor: 'rgba(52,199,89,0.12)', borderRadius: T.radiusSm, padding: 13 }}>
            <Icon name="check" size={18} sw={2.4} color={T.ok} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, color: T.ink, fontWeight: '600' }}>已生成只读分享链接</Text>
              <Text style={{ fontSize: 12, color: T.muted, marginTop: 1 }}>shengji.app/r/zx8k2 · 已复制到剪贴板</Text>
            </View>
          </View>
        )}
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 14 }}>
          <Pressable style={{ flex: 1, height: 52, borderRadius: 15, backgroundColor: T.surface, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 7, ...shadow }}>
            <Icon name="income" size={18} sw={2} color={T.ink} /><Text style={{ fontSize: 15, fontWeight: '600', color: T.ink }}>导出 PDF</Text>
          </Pressable>
          <Pressable onPress={() => setShared(true)} style={{ flex: 1.3, height: 52, borderRadius: 15, backgroundColor: T.accent, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 }}>
            <Icon name="users" size={18} sw={2} color="#fff" /><Text style={{ fontSize: 15, fontWeight: '700', color: '#fff' }}>分享给家人</Text>
          </Pressable>
        </View>
      </Sheet>
    </View>
  );
}

const pr = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  title: { fontSize: 24, fontWeight: T.titleWeight, color: T.ink, letterSpacing: T.titleSpacing },
  hero: { backgroundColor: T.accent, borderRadius: T.radius, padding: 20, ...shadow, shadowOpacity: 0.18, marginBottom: 14 },
  alert: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, borderRadius: T.radiusSm, paddingVertical: 13, paddingHorizontal: 14, marginBottom: 18 },
  secTitle: { fontSize: 19, fontWeight: T.titleWeight, color: T.ink },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  entry: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: T.surface, borderRadius: T.radiusSm, paddingVertical: 13, paddingHorizontal: 16, ...shadow },
  agent: { marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: T.blue, borderRadius: T.radius, paddingVertical: 15, paddingHorizontal: 16, ...shadow },
  th: { fontSize: 11, color: T.faint, fontWeight: '600', textAlign: 'right' },
  td: { fontSize: 12.5, textAlign: 'right' },
});
