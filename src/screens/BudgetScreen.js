// BudgetScreen.js — 预算可视化（总预算大表 + 分类预算进度）M1 移植 budget.jsx
import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Card, BudgetMeter, CatIcon, Bar } from '../components/ui';
import { T } from '../theme';
import { LEDGERS, CAT_BUDGET, MAY_SPEND, catMeta, yuan, pct, budgetState, stateColor } from '../data';

export default function BudgetScreen({ ledgerId = 'home' }) {
  const lg = LEDGERS[ledgerId];
  const cats = Object.keys(CAT_BUDGET).map((id) => ({ id, budget: CAT_BUDGET[id], spent: MAY_SPEND[id] || 0 }))
    .sort((a, b) => pct(b.spent, b.budget) - pct(a.spent, a.budget));
  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 30 }} showsVerticalScrollIndicator={false}>
        <Text style={bs.title}>预算</Text>

        <Card style={{ marginTop: 14 }} pad={20}>
          <BudgetMeter spent={lg.spent} budget={lg.budget} label={`${lg.name} · 本月预算`} period="本月" />
        </Card>

        <Text style={[bs.section]}>分类预算</Text>
        <Card pad={16}>
          {cats.map((c, i) => {
            const p = pct(c.spent, c.budget);
            const col = stateColor(budgetState(p));
            return (
              <View key={c.id} style={[{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 }, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: T.hair }]}>
                <CatIcon cat={c.id} size={40} />
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <Text style={{ fontSize: 14.5, fontWeight: '500', color: T.ink }}>{catMeta(c.id).zh}</Text>
                    <Text style={{ fontSize: 12.5, color: T.muted }}>{yuan(c.spent)} / {yuan(c.budget)}</Text>
                  </View>
                  <Bar p={p} color={col} h={6} />
                </View>
                <Text style={{ fontSize: 14, fontWeight: '700', color: col, width: 42, textAlign: 'right' }}>{Math.round(p * 100)}%</Text>
              </View>
            );
          })}
        </Card>
      </ScrollView>
    </View>
  );
}

const bs = StyleSheet.create({
  title: { fontSize: 26, fontWeight: '800', color: T.ink },
  section: { fontSize: 18, fontWeight: '700', color: T.ink, marginTop: 24, marginBottom: 12, marginLeft: 2 },
});
