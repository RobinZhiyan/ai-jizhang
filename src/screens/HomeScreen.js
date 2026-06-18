// HomeScreen.js — 首页：今日收支卡 + 双小目标 + 分类支出方格 + 悬浮语音键
import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '../components/Icon';
import { Card, ProgressBar, Avatar, Segmented } from '../components/ui';
import { T, shadow } from '../theme';
import { MEMBERS, GOALS, goalPct, goalRemain, GRID_CATS, RANGE_SPEND, RANGE_TOTAL, catMeta, yuan, TODAY } from '../data';

const COLW = (Dimensions.get('window').width - 16 * 2 - 11 * 3) / 4;

function BalanceCard() {
  return (
    <View style={hs.balance}>
      <View style={{ flexDirection: 'row' }}>
        <View style={{ flex: 1 }}>
          <Text style={hs.bLabel}>今日支出</Text>
          <Text style={hs.bExp}><Text style={hs.bSign}>¥</Text>{TODAY.exp}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={hs.bLabel}>今日收入</Text>
          <Text style={[hs.bExp, { color: T.ok }]}><Text style={[hs.bSign, { color: T.ok }]}>¥</Text>{TODAY.inc.toLocaleString('zh-CN')}</Text>
        </View>
      </View>
      <View style={hs.bDivider}>
        <Text style={hs.bMonthLabel}>本月结余</Text>
        <Text style={hs.bMonth}>¥{TODAY.balance.toLocaleString('zh-CN')}</Text>
      </View>
    </View>
  );
}

function GoalRow({ g, divider }) {
  const p = goalPct(g);
  return (
    <View style={[divider && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: T.hair, paddingTop: 12, marginTop: 12 }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}>
        <View style={[hs.goalIcon, { backgroundColor: g.color }]}><Icon name={g.glyph} size={15} color="#fff" sw={2} /></View>
        <Text style={[hs.goalTag, { color: g.color }]}>{g.tag}</Text>
        <Text style={hs.goalName}>{g.name}</Text>
        <View style={{ flex: 1 }} />
        <Text style={[hs.goalPct, { color: g.color }]}>{(p * 100).toFixed(1)}%</Text>
        <Icon name="chevron" size={14} color={T.faint} />
      </View>
      <View style={{ marginTop: 8 }}><ProgressBar p={p} color={g.color} /></View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
        <Text style={hs.goalMeta}>还差 <Text style={hs.goalMetaB}>{yuan(goalRemain(g))}</Text></Text>
        <Text style={hs.goalMeta}>{g.etaText}</Text>
      </View>
    </View>
  );
}

function Tile({ id }) {
  const m = catMeta(id);
  const amt = RANGE_SPEND.month[id] || RANGE_SPEND.week[id] || RANGE_SPEND.today[id] || 0;
  return (
    <View style={[hs.tile, { width: COLW }]}>
      <View style={[hs.tileIcon, { backgroundColor: m.color + '1A' }]}><Icon name={m.glyph} size={18} color={m.color} sw={2} /></View>
      <Text style={hs.tileName}>{m.zh}</Text>
      <Text style={hs.tileAmt}>{amt ? yuan(amt) : '—'}</Text>
    </View>
  );
}

export default function HomeScreen({ navigation }) {
  const [range, setRange] = useState('month');
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: T.bg }} edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        {/* 头部 */}
        <View style={hs.header}>
          <Pressable onPress={() => navigation.navigate('AA')} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <Text style={hs.title}>家庭日常</Text>
            <Text style={{ color: T.muted, fontSize: 14 }}>⌄</Text>
          </Pressable>
          <View style={{ flexDirection: 'row' }}>
            {Object.values(MEMBERS).map((m, i) => (
              <View key={m.id} style={{ marginLeft: i ? -9 : 0, borderWidth: 2, borderColor: '#fff', borderRadius: 18 }}>
                <Avatar member={m} size={32} />
              </View>
            ))}
          </View>
        </View>

        <View style={{ paddingHorizontal: 16 }}>
          <BalanceCard />

          {/* 双小目标合并卡 */}
          <Card style={{ marginTop: 12 }} pad={14}>
            {GOALS.map((g, i) => <GoalRow key={g.id} g={g} divider={i > 0} />)}
          </Card>

          {/* 分类支出 */}
          <View style={hs.secHead}>
            <Text style={hs.secTitle}>分类支出</Text>
            <Segmented
              value={range}
              onChange={setRange}
              options={[{ key: 'today', label: '今天' }, { key: 'week', label: '本周' }, { key: 'month', label: '本月' }]}
            />
          </View>
          <View style={hs.grid}>
            {GRID_CATS.map((id) => <Tile key={id} id={id} />)}
          </View>
        </View>
      </ScrollView>

      {/* 悬浮语音键 */}
      <Pressable onPress={() => navigation.navigate('AA')} style={hs.voice}>
        <Icon name="mic" size={26} color="#fff" sw={2} />
      </Pressable>
    </SafeAreaView>
  );
}

const hs = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 6, paddingBottom: 14 },
  title: { fontSize: 27, fontWeight: '800', color: T.ink, letterSpacing: -0.5 },

  balance: { backgroundColor: T.accent, borderRadius: T.radius, padding: 20, ...shadow, shadowOpacity: 0.18 },
  bLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 13, marginBottom: 4 },
  bExp: { color: '#fff', fontSize: 34, fontWeight: '800', letterSpacing: -1 },
  bSign: { fontSize: 19, opacity: 0.7 },
  bDivider: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 18, paddingTop: 16, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: 'rgba(255,255,255,0.14)' },
  bMonthLabel: { color: 'rgba(255,255,255,0.55)', fontSize: 14 },
  bMonth: { color: '#fff', fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },

  goalIcon: { width: 26, height: 26, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  goalTag: { fontSize: 10, fontWeight: '700' },
  goalName: { fontSize: 14, fontWeight: '700', color: T.ink },
  goalPct: { fontSize: 15, fontWeight: '700' },
  goalMeta: { fontSize: 11.5, color: T.muted },
  goalMetaB: { fontWeight: '700', color: T.ink },

  secHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 22, marginBottom: 12 },
  secTitle: { fontSize: 19, fontWeight: '800', color: T.ink },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 11 },
  tile: { aspectRatio: 1, borderRadius: 16, backgroundColor: T.surface, alignItems: 'center', justifyContent: 'center', gap: 6, ...shadow, shadowOpacity: 0.04, shadowRadius: 8, elevation: 1 },
  tileIcon: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  tileName: { fontSize: 12, fontWeight: '600', color: T.ink },
  tileAmt: { fontSize: 11, color: T.muted },

  voice: { position: 'absolute', bottom: 24, alignSelf: 'center', width: 66, height: 66, borderRadius: 33, backgroundColor: T.accent, alignItems: 'center', justifyContent: 'center', ...shadow, shadowOpacity: 0.3, shadowRadius: 18, elevation: 8 },
});
