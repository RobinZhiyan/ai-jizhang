// HomeScreen.js — 首页（1:1 移植 home.jsx 的 M1 核心：账本头 / 收支大卡(区间) / 小目标 / 分类方格 / 明细）
import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import Icon from '../components/Icon';
import { Card, CatIcon, Avatar, Money, Bar, RangeTabs, Sheet } from '../components/ui';
import { GoalCard } from '../components/GoalCard';
import { T, shadow } from '../theme';
import {
  MEMBERS, GRID_CATS, RANGE_SPEND, RANGE_TOTAL, RANGE_LABEL, MONTH_TOTAL, MONTHS, CUR_MONTH,
  TODAY_INCOME, TODAY_EXP_LIST, TODAY_INC_LIST, WEEK_EXP_LIST, MONTH_EXP_CATS, LASTMONTH_EXP_CATS,
  catMeta, catOrders, yuan,
} from '../data';

export default function HomeScreen({ ledger, expenseLog = [], onOpenAgent, goal, onOpenGoal }) {
  const [range, setRange] = useState('today');
  const [heroPeriod, setHeroPeriod] = useState('today');
  const [periodOpen, setPeriodOpen] = useState(false);
  const [showFeed, setShowFeed] = useState(false);
  const [detail, setDetail] = useState(null);

  // 语音记入的支出按分类累加
  const bumps = {};
  expenseLog.forEach((it) => { bumps[it.cat] = (bumps[it.cat] || 0) + it.amt; });
  const sumBumps = expenseLog.reduce((s, it) => s + it.amt, 0);
  const tileAmt = (id) => (RANGE_SPEND[range][id] || 0) + (bumps[id] || 0);

  // 收支大卡：支出可切区间
  const HERO = [
    { k: 'today', short: '今日', label: '今日支出', val: RANGE_TOTAL.today + sumBumps, items: [...TODAY_EXP_LIST], variant: 'tx' },
    { k: 'week', short: '本周', label: '本周支出', val: RANGE_TOTAL.week + sumBumps, items: WEEK_EXP_LIST, variant: 'tx' },
    { k: 'month', short: '本月', label: '本月支出', val: MONTH_TOTAL + sumBumps, items: MONTH_EXP_CATS, variant: 'cat' },
    { k: 'last', short: '上月', label: '上月支出', val: MONTHS[CUR_MONTH - 1].expense, items: LASTMONTH_EXP_CATS, variant: 'cat' },
  ];
  const curP = HERO.find((p) => p.k === heroPeriod) || HERO[0];
  const todayIncome = TODAY_INCOME;
  const monthBalance = MONTHS[CUR_MONTH].income - (MONTH_TOTAL + sumBumps);

  // 方格按金额降序
  const order = [...GRID_CATS].sort((a, b) => (tileAmt(b) - tileAmt(a)) || GRID_CATS.indexOf(a) - GRID_CATS.indexOf(b));
  const namedSum = GRID_CATS.reduce((s, id) => s + (RANGE_SPEND[range][id] || 0), 0);
  const otherAmt = Math.max(RANGE_TOTAL[range] - namedSum, 0) + (bumps.__other || 0);

  function openCat(id) {
    const items = id === '__other' ? [] : catOrders(id, range);
    const b = bumps[id] || 0;
    const list = b > 0 ? [...items, { name: '语音记账', cat: id, amt: b, who: 'dad' }] : items;
    setDetail({ title: `${catMeta(id).zh} · ${RANGE_LABEL[range]}`, items: list });
  }

  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 30 }} showsVerticalScrollIndicator={false}>
        {/* header */}
        <View style={hs.header}>
          <Pressable style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <Text style={hs.title}>{ledger.name}</Text>
            <Icon name="chevron" size={16} sw={2.4} color={T.faint} style={{ transform: [{ rotate: '90deg' }] }} />
          </Pressable>
          <Pressable style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <View style={{ flexDirection: 'row' }}>
              {Object.values(MEMBERS).map((m, i) => (
                <View key={m.id} style={{ marginLeft: i ? -10 : 0 }}><Avatar m={m} size={30} ring /></View>
              ))}
            </View>
            <Icon name="chevron" size={15} sw={2.4} color={T.faint} style={{ transform: [{ rotate: '90deg' }] }} />
          </Pressable>
        </View>

        {/* hero 收支大卡 */}
        <View style={hs.hero}>
          <View style={{ flexDirection: 'row' }}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Pressable onPress={() => setPeriodOpen((o) => !o)} style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                  <Text style={hs.heroLabel}>{curP.label}</Text>
                  <Icon name="chevron" size={12} sw={2.6} color={T.heroInk} style={{ transform: [{ rotate: periodOpen ? '-90deg' : '90deg' }], opacity: 0.55 }} />
                </Pressable>
                <Pressable onPress={() => setDetail({ title: `${curP.label}明细`, items: curP.items, sign: -1 })} style={hs.heroChip}>
                  <Text style={hs.heroChipTxt}>明细</Text>
                </Pressable>
              </View>
              <Text style={hs.heroNum}><Text style={{ fontSize: 19, opacity: 0.8 }}>¥</Text>{curP.val.toLocaleString('zh-CN')}</Text>
            </View>
            <View style={{ width: StyleSheet.hairlineWidth, backgroundColor: 'rgba(255,255,255,0.18)', marginHorizontal: 2 }} />
            <View style={{ flex: 1, paddingLeft: 16 }}>
              <Text style={hs.heroLabel}>今日收入</Text>
              <Text style={[hs.heroNum, { color: T.ok }]}><Text style={{ fontSize: 19, opacity: 0.85 }}>¥</Text>{todayIncome.toLocaleString('zh-CN')}</Text>
            </View>
          </View>
          <View style={hs.heroDivider}>
            <Text style={[hs.heroLabel, { opacity: 0.66 }]}>本月结余</Text>
            <Text style={hs.heroBal}>{yuan(monthBalance)}</Text>
          </View>

          {periodOpen && (
            <View style={hs.dropdown}>
              {HERO.map((p) => {
                const on = p.k === heroPeriod;
                return (
                  <Pressable key={p.k} onPress={() => { setHeroPeriod(p.k); setPeriodOpen(false); }} style={[hs.ddItem, on && { backgroundColor: T.surface2 }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
                      <View style={{ width: 15 }}>{on && <Icon name="check" size={14} sw={2.6} color={T.ok} />}</View>
                      <Text style={{ fontSize: 14, fontWeight: on ? '700' : '500', color: T.ink }}>{p.short}</Text>
                    </View>
                    <Text style={{ fontSize: 13.5, fontWeight: '600', color: on ? T.ink : T.muted }}>{yuan(p.val)}</Text>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>

        {/* 小目标 */}
        <View style={{ marginTop: 11 }}>
          <GoalCard goal={goal} onOpenGoal={onOpenGoal} />
        </View>

        {/* 分类支出 */}
        <View style={hs.secHead}>
          <Text style={hs.secTitle}>分类支出</Text>
          <View style={{ flex: 1, maxWidth: 296, marginLeft: 10 }}><RangeTabs value={range} onChange={setRange} /></View>
        </View>
        <View style={hs.grid}>
          {order.map((id) => <Tile key={id} id={id} amount={tileAmt(id)} badge={bumps[id]} onPress={() => openCat(id)} />)}
          <Tile id="__other" amount={otherAmt} onPress={() => openCat('__other')} />
        </View>

        {/* 明细入口 */}
        <Pressable onPress={() => setShowFeed(true)} style={hs.feedBtn}>
          <Icon name="calendar" size={18} sw={1.9} color={T.muted} />
          <Text style={{ flex: 1, fontSize: 14.5, fontWeight: '500', color: T.ink }}>全部明细</Text>
          <Text style={{ fontSize: 13, color: T.faint }}>本月 86 笔</Text>
          <Icon name="chevron" size={17} color={T.faint} />
        </Pressable>

        {/* 语音提示 */}
        <Pressable onPress={onOpenAgent} style={hs.agent}>
          <View style={{ width: 36, height: 36, borderRadius: 11, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="mic" size={20} sw={1.9} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14.5, fontWeight: '600', color: '#fff' }}>按住麦克风说话，自动飞入类目</Text>
            <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.78)', marginTop: 1 }}>“外卖30、打车20” → 松开即归位</Text>
          </View>
          <Icon name="chevron" size={18} color="rgba(255,255,255,0.8)" />
        </Pressable>
      </ScrollView>

      {/* 明细弹层 */}
      <Sheet open={!!detail} onClose={() => setDetail(null)} title={detail ? detail.title : ''}>
        <View style={{ backgroundColor: T.surface, borderRadius: T.radius, paddingHorizontal: 16, paddingVertical: 4, ...shadow }}>
          {detail && detail.items.length === 0 && <Text style={{ textAlign: 'center', color: T.muted, paddingVertical: 30 }}>暂无消费记录</Text>}
          {detail && detail.items.map((it, i) => {
            const mm = it.who ? MEMBERS[it.who] : null;
            return (
              <View key={i} style={[hs.row, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: T.hair }]}>
                <CatIcon cat={it.cat} size={38} />
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={{ fontSize: 15, fontWeight: '500', color: T.ink }}>{it.name}</Text>
                  <Text style={{ fontSize: 12, color: T.faint, marginTop: 2 }}>{catMeta(it.cat).zh}{mm ? ` · ${mm.name}` : ''}{it.time ? ` · ${it.time}` : ''}</Text>
                </View>
                <Money value={-it.amt} size={16} />
              </View>
            );
          })}
        </View>
      </Sheet>

      <Sheet open={showFeed} onClose={() => setShowFeed(false)} title="全部明细">
        <View style={{ backgroundColor: T.surface, borderRadius: T.radius, paddingHorizontal: 16, paddingVertical: 4, ...shadow }}>
          {[...expenseLog, ...TODAY_EXP_LIST].slice(0, 12).map((it, i) => {
            const mm = it.who ? MEMBERS[it.who] : null;
            return (
              <View key={i} style={[hs.row, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: T.hair }]}>
                <CatIcon cat={it.cat} size={36} />
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={{ fontSize: 15, fontWeight: '500', color: T.ink }}>{it.name}</Text>
                  <Text style={{ fontSize: 12, color: T.faint, marginTop: 2 }}>{catMeta(it.cat).zh}{mm ? ` · ${mm.name}` : ''}</Text>
                </View>
                <Money value={-it.amt} size={16} />
              </View>
            );
          })}
        </View>
      </Sheet>
    </View>
  );
}

function Tile({ id, amount, badge, onPress }) {
  const c = catMeta(id);
  const zero = amount === 0;
  return (
    <Pressable onPress={onPress} style={hs.tile}>
      <View style={[hs.tileIcon, { backgroundColor: zero ? T.track : c.color + '1F' }]}>
        <Icon name={c.glyph} size={18} sw={2} color={zero ? T.faint : c.color} />
      </View>
      <Text style={hs.tileName}>{c.zh}</Text>
      <Text style={[hs.tileAmt, { color: zero ? T.faint : T.ink }]}><Text style={{ fontSize: 11, opacity: 0.7 }}>¥</Text>{amount.toLocaleString('zh-CN')}</Text>
      {badge != null && <View style={hs.badge}><Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>+¥{badge}</Text></View>}
    </Pressable>
  );
}

const hs = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  title: { fontSize: 24, fontWeight: T.titleWeight, color: T.ink, letterSpacing: T.titleSpacing },

  hero: { position: 'relative', backgroundColor: T.hero, borderRadius: T.radius, padding: 18, ...shadow, shadowOpacity: 0.18 },
  heroLabel: { color: 'rgba(255,255,255,0.62)', fontSize: 13 },
  heroChip: { backgroundColor: 'rgba(255,255,255,0.14)', borderRadius: 7, paddingHorizontal: 8, paddingVertical: 2 },
  heroChipTxt: { color: '#fff', fontSize: 11, fontWeight: '600' },
  heroNum: { color: '#fff', fontSize: 33, fontWeight: T.numWeight, letterSpacing: -1.2, marginTop: 8 },
  heroDivider: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, paddingTop: 14, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: 'rgba(255,255,255,0.16)' },
  heroBal: { color: '#fff', fontSize: 22, fontWeight: '700', letterSpacing: -0.5 },
  dropdown: { position: 'absolute', top: 56, left: 16, width: 188, backgroundColor: T.surface, borderRadius: 14, padding: 5, ...shadow, shadowOpacity: 0.26, zIndex: 20 },
  ddItem: { borderRadius: 10, paddingVertical: 9, paddingHorizontal: 11, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },

  secHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 22, marginBottom: 8 },
  secTitle: { fontSize: 19, fontWeight: T.titleWeight, color: T.ink },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tile: { width: '31.5%', backgroundColor: T.surface, borderRadius: T.radiusSm, alignItems: 'center', paddingVertical: 11, ...shadow, shadowOpacity: 0.04, shadowRadius: 8, elevation: 1 },
  tileIcon: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  tileName: { fontSize: 12.5, color: T.muted, fontWeight: '500' },
  tileAmt: { fontSize: 16, fontWeight: T.numWeight, letterSpacing: -0.5, marginTop: 4 },
  badge: { position: 'absolute', top: 6, right: 6, backgroundColor: T.flash, borderRadius: 7, paddingHorizontal: 6, paddingVertical: 2 },

  feedBtn: { marginTop: 14, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: T.surface, borderRadius: T.radiusSm, paddingVertical: 13, paddingHorizontal: 16, ...shadow },
  agent: { marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: T.blue, borderRadius: T.radius, paddingVertical: 15, paddingHorizontal: 16, ...shadow },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 11 },
});
