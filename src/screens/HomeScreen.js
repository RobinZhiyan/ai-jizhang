// HomeScreen.js — 首页（1:1 移植 home.jsx 的 M1 核心：账本头 / 收支大卡(区间) / 小目标 / 分类方格 / 明细）
import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, TextInput } from 'react-native';
import Icon from '../components/Icon';
import { Card, CatIcon, Avatar, Money, Bar, RangeTabs, Sheet, useCountUp } from '../components/ui';
import { GoalCard } from '../components/GoalCard';
import { usePersistedState } from '../usePersisted';
import { CatTreemap, CatRose, CatSankey } from '../components/CatViz';
import { T, shadow } from '../theme';
import {
  MEMBERS, GRID_CATS, RANGE_SPEND, RANGE_TOTAL, RANGE_LABEL, MONTH_TOTAL, MONTHS, CUR_MONTH,
  TODAY_INCOME, TODAY_EXP_LIST, TODAY_INC_LIST, WEEK_EXP_LIST, MONTH_EXP_CATS, LASTMONTH_EXP_CATS,
  catMeta, catOrders, yuan,
} from '../data';

export default function HomeScreen({ ledger, expenseLog = [], incomeLog = [], onOpenAgent, goal, onOpenGoal, fixedDailyIncome = 0, perms = {}, viewRole, onOpenRoleSwitch, onExitHelper }) {
  const [range, setRange] = useState('today');
  const [heroPeriod, setHeroPeriod] = useState('today');
  const [periodOpen, setPeriodOpen] = useState(false);
  const [showFeed, setShowFeed] = useState(false);
  const [detail, setDetail] = useState(null);
  const [tileStyle, setTileStyle] = usePersistedState('vb_tilestyle', 'grid');
  const [customCats, setCustomCats] = usePersistedState('vb_customcats', []);
  const [showAdd, setShowAdd] = useState(false);
  const [draft, setDraft] = useState({ name: '', color: '#0A84FF', glyph: 'spark' });
  const addCustom = () => { const name = draft.name.trim(); if (!name) return; setCustomCats((a) => [...a, { id: 'custom-' + Date.now(), zh: name, color: draft.color, glyph: draft.glyph, amt: 0 }]); setDraft({ name: '', color: '#0A84FF', glyph: 'spark' }); setShowAdd(false); };
  const removeCustom = (id) => setCustomCats((a) => a.filter((c) => c.id !== id));

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
  const gainSum = incomeLog.filter((it) => it.amt >= 0).reduce((s, it) => s + it.amt, 0);
  const lossSum = Math.abs(incomeLog.filter((it) => it.amt < 0).reduce((s, it) => s + it.amt, 0));
  const todayIncome = TODAY_INCOME + fixedDailyIncome + gainSum;
  const monthBalance = MONTHS[CUR_MONTH].income - (MONTH_TOTAL + sumBumps + lossSum) + gainSum;
  const dispExp = useCountUp(curP.val);
  const dispInc = useCountUp(todayIncome);

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

  const catList = [
    ...order.map((id) => ({ id, amount: tileAmt(id), meta: catMeta(id) })),
    { id: '__other', amount: otherAmt, meta: catMeta('__other') },
    ...customCats.map((c) => ({ id: c.id, amount: c.amt || 0, meta: c })),
  ];

  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 30 }} showsVerticalScrollIndicator={false}>
        {/* header */}
        <View style={hs.header}>
          <Pressable style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <Text style={hs.title}>{ledger.name}</Text>
            <Icon name="chevron" size={16} sw={2.4} color={T.faint} style={{ transform: [{ rotate: '90deg' }] }} />
          </Pressable>
          <Pressable onPress={viewRole === 'helper' ? onExitHelper : onOpenRoleSwitch} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
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
              <Text style={hs.heroNum}><Text style={{ fontSize: 19, opacity: 0.8 }}>¥</Text>{dispExp.toLocaleString('zh-CN')}</Text>
            </View>
            {perms.seeIncome !== false && (
              <>
                <View style={{ width: StyleSheet.hairlineWidth, backgroundColor: 'rgba(255,255,255,0.18)', marginHorizontal: 2 }} />
                <View style={{ flex: 1, paddingLeft: 16 }}>
                  <Text style={hs.heroLabel}>今日收入</Text>
                  <Text style={[hs.heroNum, { color: T.ok }]}><Text style={{ fontSize: 19, opacity: 0.85 }}>¥</Text>{dispInc.toLocaleString('zh-CN')}</Text>
                </View>
              </>
            )}
          </View>
          {perms.seeBalance !== false && (
            <View style={hs.heroDivider}>
              <Text style={[hs.heroLabel, { opacity: 0.66 }]}>本月结余</Text>
              <Text style={hs.heroBal}>{yuan(monthBalance)}</Text>
            </View>
          )}

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
        {perms.seeGoal !== false && (
          <View style={{ marginTop: 11 }}>
            <GoalCard goal={goal} onOpenGoal={onOpenGoal} />
          </View>
        )}

        {/* 分类支出 */}
        <View style={hs.secHead}>
          <Text style={hs.secTitle}>分类支出</Text>
          <View style={{ flex: 1, maxWidth: 224, marginLeft: 10 }}><RangeTabs value={range} onChange={setRange} /></View>
        </View>
        {/* 呈现形式切换：方格 / 树图 / 玫瑰 / 桑基 */}
        <View style={{ flexDirection: 'row', gap: 6, marginBottom: 11 }}>
          {[{ k: 'grid', i: 'box' }, { k: 'treemap', i: 'pie' }, { k: 'rose', i: 'spark' }, { k: 'sankey', i: 'trend' }].map((o) => {
            const on = tileStyle === o.k;
            return (
              <Pressable key={o.k} onPress={() => setTileStyle(o.k)} style={{ width: 40, height: 30, borderRadius: 9, backgroundColor: on ? T.ink : T.surface2, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={o.i} size={17} sw={2} color={on ? '#fff' : T.muted} />
              </Pressable>
            );
          })}
        </View>
        {tileStyle === 'grid' ? (
          <View style={hs.grid}>
            {order.map((id) => <Tile key={id} id={id} amount={tileAmt(id)} badge={bumps[id]} onPress={() => openCat(id)} />)}
            <Tile id="__other" amount={otherAmt} onPress={() => openCat('__other')} />
            {customCats.map((c) => <Tile key={c.id} id={c.id} amount={c.amt || 0} meta={c} onPress={() => setDetail({ title: c.zh, items: [] })} />)}
            <Pressable onPress={() => setShowAdd(true)} style={[hs.tile, hs.addTile]}>
              <View style={[hs.tileIcon, { backgroundColor: T.surface }]}><Icon name="plus" size={18} sw={2.6} color={T.blue} /></View>
              <Text style={hs.tileName}>自定义</Text>
              <Text style={{ fontSize: 11, color: T.faint, marginTop: 4 }}>新增分类</Text>
            </Pressable>
          </View>
        ) : (
          <View>
            {tileStyle === 'treemap' && <CatTreemap cats={catList} onOpen={(id) => openCat(id)} />}
            {tileStyle === 'rose' && <CatRose cats={catList} onOpen={(id) => openCat(id)} />}
            {tileStyle === 'sankey' && <CatSankey cats={catList} onOpen={(id) => openCat(id)} />}
            <Pressable onPress={() => setShowAdd(true)} style={{ marginTop: 10, borderWidth: 1.5, borderStyle: 'dashed', borderColor: T.hair, borderRadius: T.radiusSm, paddingVertical: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
              <Icon name="plus" size={17} sw={2.4} color={T.blue} /><Text style={{ color: T.blue, fontSize: 14, fontWeight: '600' }}>自定义分类</Text>
            </Pressable>
          </View>
        )}

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

      {/* 新建自定义分类 */}
      <Sheet open={showAdd} onClose={() => setShowAdd(false)} title="新建分类">
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: T.surface, borderRadius: T.radius, padding: 16, ...shadow, marginBottom: 14 }}>
          <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: draft.color, alignItems: 'center', justifyContent: 'center' }}><Icon name={draft.glyph} size={26} sw={2} color="#fff" /></View>
          <View style={{ minWidth: 0 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: draft.name.trim() ? T.ink : T.faint }}>{draft.name.trim() || '分类名称'}</Text>
            <Text style={{ fontSize: 12.5, color: T.muted, marginTop: 2 }}>预览 · 显示在分类支出里</Text>
          </View>
        </View>
        <View style={{ backgroundColor: T.surface, borderRadius: T.radius, padding: 16, ...shadow }}>
          <TextInput value={draft.name} onChangeText={(t) => setDraft((s) => ({ ...s, name: t }))} placeholder="分类名称，如「健身」「宠物」「咖啡」" placeholderTextColor={T.faint}
            style={{ backgroundColor: T.surface2, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, fontSize: 15, color: T.ink }} />
          <Text style={hs.formLabel}>选择图标</Text>
          <View style={{ flexDirection: 'row', gap: 9, flexWrap: 'wrap' }}>
            {CUSTOM_GLYPHS.map((g) => (
              <Pressable key={g} onPress={() => setDraft((s) => ({ ...s, glyph: g }))} style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: draft.glyph === g ? draft.color : T.surface2, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={g} size={20} sw={2} color={draft.glyph === g ? '#fff' : T.muted} />
              </Pressable>
            ))}
          </View>
          <Text style={hs.formLabel}>选择颜色</Text>
          <View style={{ flexDirection: 'row', gap: 12, flexWrap: 'wrap' }}>
            {CUSTOM_SWATCHES.map((col) => (
              <Pressable key={col} onPress={() => setDraft((s) => ({ ...s, color: col }))} style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: col, borderWidth: draft.color === col ? 2 : 0, borderColor: T.surface }} />
            ))}
          </View>
          <Pressable onPress={addCustom} disabled={!draft.name.trim()} style={{ marginTop: 20, height: 50, borderRadius: 14, backgroundColor: draft.name.trim() ? T.accent : T.surface2, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6 }}>
            <Icon name="plus" size={18} sw={2.4} color={draft.name.trim() ? T.accentInk : T.faint} /><Text style={{ fontSize: 15.5, fontWeight: '600', color: draft.name.trim() ? T.accentInk : T.faint }}>添加分类</Text>
          </Pressable>
        </View>
        {customCats.length > 0 && (
          <View style={{ backgroundColor: T.surface, borderRadius: T.radius, paddingHorizontal: 16, ...shadow, marginTop: 14 }}>
            {customCats.map((c, i) => (
              <View key={c.id} style={[{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 }, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: T.hair }]}>
                <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: c.color, alignItems: 'center', justifyContent: 'center' }}><Icon name={c.glyph} size={19} sw={2} color="#fff" /></View>
                <Text style={{ flex: 1, fontSize: 15, fontWeight: '500', color: T.ink }}>{c.zh}</Text>
                <Pressable onPress={() => removeCustom(c.id)} style={{ backgroundColor: T.surface2, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 }}><Text style={{ fontSize: 13, color: T.muted }}>删除</Text></Pressable>
              </View>
            ))}
          </View>
        )}
      </Sheet>
    </View>
  );
}

const CUSTOM_GLYPHS = ['spark', 'dumbbell', 'paw', 'book', 'play', 'cross', 'bag', 'leaf', 'bottle', 'plug', 'chat', 'car'];
const CUSTOM_SWATCHES = ['#0A84FF', '#34C759', '#FF9500', '#FF2D55', '#5E5CE6', '#FF3B30', '#64D2FF', '#8E8E93'];

function Tile({ id, amount, badge, onPress, meta }) {
  const c = meta || catMeta(id);
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
  addTile: { borderWidth: 1.5, borderStyle: 'dashed', borderColor: 'rgba(120,120,128,0.4)', backgroundColor: 'transparent', shadowOpacity: 0, elevation: 0 },
  formLabel: { fontSize: 12.5, fontWeight: '600', color: T.muted, marginTop: 17, marginBottom: 10 },

  feedBtn: { marginTop: 14, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: T.surface, borderRadius: T.radiusSm, paddingVertical: 13, paddingHorizontal: 16, ...shadow },
  agent: { marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: T.blue, borderRadius: T.radius, paddingVertical: 15, paddingHorizontal: 16, ...shadow },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 11 },
});
