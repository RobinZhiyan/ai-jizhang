// AnalysisScreen.js — 数据分析（收支双折线趋势 + 本月分类占比）1:1 移植 analysis.jsx
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions } from 'react-native';
import Svg, { Polyline, Circle, Line as SvgLine } from 'react-native-svg';
import { Card, Segmented } from '../components/ui';
import { T } from '../theme';
import { TREND, MONTH_EXP_CATS, catMeta, yuan } from '../data';

const CW = Dimensions.get('window').width - 16 * 2 - 36;
const CH = 170;

function DualLine({ data }) {
  const all = [...data.exp, ...data.inc];
  const max = Math.max(...all) * 1.1;
  const n = data.xs.length;
  const x = (i) => (CW / (n - 1)) * i;
  const y = (v) => CH - (v / max) * CH;
  const pts = (arr) => arr.map((v, i) => `${x(i)},${y(v)}`).join(' ');
  return (
    <View>
      <Svg width={CW} height={CH + 26}>
        {[0.25, 0.5, 0.75, 1].map((g, i) => (
          <SvgLine key={i} x1={0} y1={CH * g} x2={CW} y2={CH * g} stroke={T.hair} strokeWidth={1} />
        ))}
        <Polyline points={pts(data.inc)} fill="none" stroke={T.ok} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        <Polyline points={pts(data.exp)} fill="none" stroke={T.warn} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        {data.inc.map((v, i) => <Circle key={'i' + i} cx={x(i)} cy={y(v)} r={3} fill={T.ok} />)}
        {data.exp.map((v, i) => <Circle key={'e' + i} cx={x(i)} cy={y(v)} r={3} fill={T.warn} />)}
      </Svg>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 }}>
        {data.xs.map((s, i) => <Text key={i} style={{ fontSize: 10, color: T.faint }}>{s}</Text>)}
      </View>
    </View>
  );
}

function Legend({ color, label }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <View style={{ width: 14, height: 3, borderRadius: 2, backgroundColor: color }} />
      <Text style={{ fontSize: 12.5, color: T.muted }}>{label}</Text>
    </View>
  );
}

export default function AnalysisScreen() {
  const [range, setRange] = useState('week');
  const data = TREND[range];
  const max = Math.max(...MONTH_EXP_CATS.map((c) => c.amt));
  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 30 }} showsVerticalScrollIndicator={false}>
        <Text style={an.title}>数据分析</Text>

        <Card style={{ marginTop: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <Text style={an.cardTitle}>收支趋势</Text>
            <View style={{ width: 150 }}>
              <Segmented value={range} onChange={setRange} options={[{ value: 'week', label: '本周' }, { value: 'month', label: '本月' }]} />
            </View>
          </View>
          <DualLine data={data} />
          <View style={{ flexDirection: 'row', gap: 18, marginTop: 14 }}>
            <Legend color={T.ok} label="收入" />
            <Legend color={T.warn} label="支出" />
          </View>
        </Card>

        <Text style={[an.cardTitle, { marginTop: 24, marginBottom: 12, marginLeft: 2 }]}>本月分类占比</Text>
        <Card>
          {MONTH_EXP_CATS.slice(0, 8).map((c, i) => (
            <View key={c.cat} style={{ marginTop: i ? 13 : 0 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: catMeta(c.cat).color }} />
                <Text style={{ flex: 1, fontSize: 14, color: T.ink, marginLeft: 8 }}>{c.name}</Text>
                <Text style={{ fontSize: 13, fontWeight: '700', color: T.ink }}>{yuan(c.amt)}</Text>
              </View>
              <View style={{ height: 6, borderRadius: 3, backgroundColor: T.track, overflow: 'hidden' }}>
                <View style={{ width: `${(c.amt / max) * 100}%`, height: '100%', borderRadius: 3, backgroundColor: catMeta(c.cat).color }} />
              </View>
            </View>
          ))}
        </Card>
      </ScrollView>
    </View>
  );
}

const an = StyleSheet.create({
  title: { fontSize: 26, fontWeight: '800', color: T.ink },
  cardTitle: { fontSize: 18, fontWeight: '700', color: T.ink },
});
