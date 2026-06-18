// App.js — 根：5-Tab 导航（总览/分析/记账长按语音/预算/我的）+ 语音状态机
// 1:1 移植自原型 app.jsx（去掉 iOS 设备外壳，RN 直接全屏）
import React, { useState, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Animated, Easing } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Icon from './src/components/Icon';
import { T, shadow } from './src/theme';
import { catMeta, LEDGERS, VOICE_SCRIPT, PROJECT_VOICE_SCRIPT } from './src/data';
import HomeScreen from './src/screens/HomeScreen';
import AnalysisScreen from './src/screens/AnalysisScreen';
import BudgetScreen from './src/screens/BudgetScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const TABS = [
  { id: 'home', label: '总览', icon: 'house' },
  { id: 'analysis', label: '分析', icon: 'chart' },
  { id: 'voice', label: '记账', icon: 'mic', center: true },
  { id: 'budget', label: '预算', icon: 'target' },
  { id: 'profile', label: '我的', icon: 'users' },
];

function TabBar({ tab, setTab, listening, onHoldStart, onHoldEnd }) {
  return (
    <View style={s.tabbar}>
      {TABS.map((t) => {
        if (t.center) {
          return (
            <Pressable key={t.id} onPressIn={onHoldStart} onPressOut={onHoldEnd} style={s.centerWrap}>
              <View style={[s.centerBtn, { backgroundColor: listening ? T.ok : T.accent }]}>
                <Icon name="mic" size={26} sw={1.9} color="#fff" />
              </View>
              <Text style={[s.tabLabel, { color: listening ? T.ok : T.muted, marginTop: 4 }]}>{listening ? '聆听中' : t.label}</Text>
            </Pressable>
          );
        }
        const active = tab === t.id;
        return (
          <Pressable key={t.id} onPress={() => setTab(t.id)} style={s.tabItem}>
            <Icon name={t.icon} size={24} sw={active ? 2.1 : 1.8} color={active ? T.ink : T.faint} />
            <Text style={[s.tabLabel, { color: active ? T.ink : T.faint, fontWeight: active ? '600' : '500' }]}>{t.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// 长按聆听浮层（M1 简化：实时字幕 + 已识别条；飞入动画归 M2）
function HoldOverlay({ open, transcript, heard }) {
  if (!open) return null;
  return (
    <View style={s.overlay} pointerEvents="none">
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 20 }}>
        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: T.ok }} />
        <Text style={{ fontSize: 13, fontWeight: '600', color: T.muted }}>正在聆听…</Text>
      </View>
      <Text style={s.transcript}>{transcript || ' '}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 22, maxWidth: 340 }}>
        {heard.map((c, i) => {
          const m = catMeta(c.cat);
          return (
            <View key={i} style={s.heardChip}>
              <View style={{ width: 24, height: 24, borderRadius: 7, backgroundColor: m.color, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={m.glyph} size={14} sw={2} color="#fff" />
              </View>
              <Text style={{ fontSize: 13, fontWeight: '600', color: T.ink }}>{c.name}</Text>
              <Text style={{ fontSize: 13, fontWeight: '700', color: T.ink }}>¥{Math.abs(c.amt)}</Text>
            </View>
          );
        })}
      </View>
      <Text style={{ position: 'absolute', bottom: 96, fontSize: 12.5, color: T.faint }}>松开 · 自动归位到类目</Text>
    </View>
  );
}

export default function App() {
  const [tab, setTab] = useState('home');
  const [ledgerId, setLedgerId] = useState('home');
  const [listening, setListening] = useState(false);
  const [reveal, setReveal] = useState(0);
  const [heard, setHeard] = useState([]);
  const [expenseLog, setExpenseLog] = useState([]); // 语音记入的支出（叠加到方格）
  const timers = useRef([]);
  const ledger = LEDGERS[ledgerId];
  const isProject = ledger.kind === 'project';
  const script = isProject ? PROJECT_VOICE_SCRIPT : VOICE_SCRIPT;

  function clearTimers() { timers.current.forEach(clearTimeout); timers.current = []; }
  function onHoldStart() {
    if (tab !== 'home') setTab('home');
    clearTimers(); setHeard([]); setReveal(0); setListening(true);
    const DUR = 2600, steps = 40;
    for (let i = 1; i <= steps; i++) timers.current.push(setTimeout(() => setReveal(i / steps), (DUR / steps) * i));
    script.chunks.forEach((ch) => timers.current.push(setTimeout(() => setHeard((h) => [...h, ch]), DUR * ch.at)));
  }
  function onHoldEnd() {
    clearTimers(); setListening(false);
    const items = script.chunks.map((c) => ({ name: c.name, cat: c.cat, amt: c.amt, who: 'dad' }));
    setExpenseLog((l) => [...items, ...l]);
    setReveal(0); setHeard([]);
  }

  const transcript = script.full.slice(0, Math.round(reveal * script.full.length));

  let screen;
  if (tab === 'home') screen = <HomeScreen ledger={ledger} expenseLog={expenseLog} onOpenAgent={() => { onHoldStart(); setTimeout(onHoldEnd, 3000); }} />;
  else if (tab === 'analysis') screen = <AnalysisScreen />;
  else if (tab === 'budget') screen = <BudgetScreen ledgerId={ledgerId} />;
  else screen = <ProfileScreen />;

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: T.bg }} edges={['top']}>
        <StatusBar style="dark" />
        <View style={{ flex: 1 }}>
          {screen}
          <HoldOverlay open={listening} transcript={transcript} heard={heard} />
        </View>
        <TabBar tab={tab} setTab={setTab} listening={listening} onHoldStart={onHoldStart} onHoldEnd={onHoldEnd} />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const s = StyleSheet.create({
  tabbar: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-around', paddingTop: 10, paddingBottom: 26, paddingHorizontal: 8, backgroundColor: T.surface, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: T.hair },
  tabItem: { flex: 1, alignItems: 'center', gap: 4 },
  tabLabel: { fontSize: 10.5 },
  centerWrap: { alignItems: 'center', marginTop: -28 },
  centerBtn: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', ...shadow, shadowOpacity: 0.22, shadowRadius: 18 },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(244,244,247,0.86)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 26, paddingBottom: 150, zIndex: 50 },
  transcript: { fontSize: 24, fontWeight: '600', color: T.ink, textAlign: 'center', lineHeight: 36, minHeight: 36, maxWidth: 320 },
  heardChip: { flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: T.surface, borderRadius: 999, paddingVertical: 7, paddingLeft: 7, paddingRight: 13, ...shadow },
});
