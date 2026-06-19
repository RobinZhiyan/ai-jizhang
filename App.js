// App.js — 根：5-Tab 导航（总览/分析/记账长按语音/预算/我的）+ 多账本 + 语音状态机
// 1:1 移植自原型 app.jsx（去掉 iOS 设备外壳，RN 直接全屏）
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Icon from './src/components/Icon';
import { Sheet, Pill } from './src/components/ui';
import { GoalConfigPage } from './src/components/GoalCard';
import { FixedConfigSheet } from './src/components/FixedConfig';
import { RoleSwitchSheet, PermConfigSheet, HelperBanner, permsFor, PERM_DEFAULT } from './src/components/Roles';
import { usePersistedState } from './src/usePersisted';
import { IncomeReceipt } from './src/components/IncomeReceipt';
import { CoinFly } from './src/components/CoinFly';
import { T, shadow } from './src/theme';
import { catMeta, LEDGERS, VOICE_SCRIPT, PROJECT_VOICE_SCRIPT, INCOME_VOICE_SCRIPT, LOSS_VOICE_SCRIPT, GOAL_DEFAULT, FIXED_DEFAULTS, fixedDailyIncome, goalProgress, goalRemaining, goalMonths, fmtMonths, TODAY_INCOME, MONTHS, CUR_MONTH, MONTH_TOTAL, yuan, pct, budgetState, stateColor } from './src/data';
import HomeScreen from './src/screens/HomeScreen';
import ProjectHomeScreen from './src/screens/ProjectHomeScreen';
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

function TabBar({ tab, setTab, listening, onHoldStart, onHoldEnd, perms = {} }) {
  return (
    <View style={s.tabbar}>
      {TABS.map((t) => {
        const allowed = t.center || t.id === 'home' || (t.id === 'analysis' ? perms.seeAnalysis !== false : t.id === 'budget' ? perms.seeBudget !== false : t.id === 'profile' ? perms.admin !== false : true);
        if (!allowed) return <View key={t.id} style={{ flex: 1 }} />;
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

function LedgerSheet({ open, onClose, current, onPick }) {
  return (
    <Sheet open={open} onClose={onClose} title="切换账本 / 项目">
      <View style={{ gap: 10 }}>
        {Object.values(LEDGERS).map((lg) => {
          const on = lg.id === current; const p = pct(lg.spent, lg.budget);
          return (
            <Pressable key={lg.id} onPress={() => onPick(lg.id)} style={{ borderWidth: 1.5, borderColor: on ? T.ink : 'transparent', backgroundColor: T.surface, borderRadius: T.radius, padding: 15, flexDirection: 'row', alignItems: 'center', gap: 12, ...shadow }}>
              <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: lg.tint, alignItems: 'center', justifyContent: 'center' }}><Icon name={lg.icon} size={21} sw={2} color="#fff" /></View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: T.ink }}>{lg.name}</Text>
                  <Pill color={lg.kind === 'project' ? T.warn : T.blue} bg={lg.kind === 'project' ? 'rgba(255,149,0,0.14)' : 'rgba(10,132,255,0.12)'}>{lg.kind === 'project' ? '项目' : '日常'}</Pill>
                </View>
                <Text style={{ fontSize: 12.5, color: T.muted, marginTop: 3 }}>{yuan(lg.spent)} / {yuan(lg.budget)} · 已用 {Math.round(p * 100)}%</Text>
              </View>
              {on && <Icon name="check" size={22} sw={2.4} color={T.ok} />}
            </Pressable>
          );
        })}
      </View>
    </Sheet>
  );
}

// 长按聆听浮层（M1：实时字幕 + 已识别条；飞入动画 M2）
function HoldOverlay({ open, transcript, heard }) {
  if (!open) return null;
  return (
    <View style={s.overlay} pointerEvents="none">
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 20 }}>
        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: T.ok }} />
        <Text style={{ fontSize: 13, fontWeight: '600', color: T.muted }}>正在聆听…</Text>
      </View>
      <Text style={s.transcript}>{transcript || ' '}</Text>
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

// 语音飞入：识别到的消费卡从底部飞起、缩小淡出（归位到类目）
function FlyLayer({ items, onDone }) {
  const anims = useRef(items.map(() => new Animated.Value(0))).current;
  useEffect(() => {
    Animated.stagger(120, anims.map((a) => Animated.timing(a, { toValue: 1, duration: 720, easing: Easing.bezier(0.5, 0, 0.25, 1), useNativeDriver: true }))).start(() => onDone && onDone());
  }, []);
  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, bottom: 130, alignItems: 'center', zIndex: 40 }}>
      {items.map((it, i) => {
        const m = catMeta(it.cat);
        const a = anims[i];
        const translateY = a.interpolate({ inputRange: [0, 1], outputRange: [0, -360] });
        const scale = a.interpolate({ inputRange: [0, 1], outputRange: [1, 0.5] });
        const opacity = a.interpolate({ inputRange: [0, 0.75, 1], outputRange: [1, 1, 0] });
        return (
          <Animated.View key={i} style={{ position: 'absolute', transform: [{ translateY }, { scale }], opacity, flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: T.surface, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 7, ...shadow, shadowOpacity: 0.2 }}>
            <View style={{ width: 22, height: 22, borderRadius: 6, backgroundColor: m.color, alignItems: 'center', justifyContent: 'center' }}><Icon name={m.glyph} size={13} sw={2} color="#fff" /></View>
            <Text style={{ fontSize: 12, fontWeight: '600', color: T.ink }}>{it.name}</Text>
            <Text style={{ fontSize: 13, fontWeight: '700', color: T.ink }}>¥{Math.abs(it.amt)}</Text>
          </Animated.View>
        );
      })}
    </View>
  );
}

export default function App() {
  const [tab, setTab] = useState('home');
  const [ledgerId, setLedgerId] = useState('home');
  const [showLedger, setShowLedger] = useState(false);
  const [goal, setGoal] = usePersistedState('vb_goal', GOAL_DEFAULT);
  const [showGoal, setShowGoal] = useState(false);
  const [fixed, setFixed] = usePersistedState('vb_fixed', FIXED_DEFAULTS);
  const [showFixed, setShowFixed] = useState(false);
  const [viewRole, setViewRole] = useState('admin');
  const [helperPerms, setHelperPerms] = usePersistedState('vb_perms', PERM_DEFAULT);
  const [showRoleSwitch, setShowRoleSwitch] = useState(false);
  const [showPerms, setShowPerms] = useState(false);
  const [listening, setListening] = useState(false);
  const [flyItems, setFlyItems] = useState(null);
  const [reveal, setReveal] = useState(0);
  const [heard, setHeard] = useState([]);
  const [expenseLog, setExpenseLog] = useState([]);
  const [incomeLog, setIncomeLog] = useState([]);
  const [incomeReceipt, setIncomeReceipt] = useState(null);
  const [coinFly, setCoinFly] = useState(null);
  const [activeScript, setActiveScript] = useState(VOICE_SCRIPT);
  const timers = useRef([]);
  const modeRef = useRef('expense');
  const scriptRef = useRef(VOICE_SCRIPT);
  const scenarioRef = useRef(0);
  const ledger = LEDGERS[ledgerId];
  const isProject = ledger.kind === 'project';

  function clearTimers() { timers.current.forEach(clearTimeout); timers.current = []; }
  function pickScenario() {
    if (!permsFor(viewRole, helperPerms).recordIncome) return { mode: 'expense', sc: isProject ? PROJECT_VOICE_SCRIPT : VOICE_SCRIPT };
    const s = scenarioRef.current % 3; scenarioRef.current += 1;
    if (s === 1) return { mode: 'income', sc: INCOME_VOICE_SCRIPT };
    if (s === 2) return { mode: 'loss', sc: LOSS_VOICE_SCRIPT };
    return { mode: 'expense', sc: isProject ? PROJECT_VOICE_SCRIPT : VOICE_SCRIPT };
  }
  function onHoldStart() {
    if (tab !== 'home') setTab('home');
    const pick = pickScenario();
    modeRef.current = pick.mode; scriptRef.current = pick.sc; setActiveScript(pick.sc);
    clearTimers(); setHeard([]); setReveal(0); setListening(true);
    const DUR = 2600, steps = 40;
    for (let i = 1; i <= steps; i++) timers.current.push(setTimeout(() => setReveal(i / steps), (DUR / steps) * i));
    pick.sc.chunks.forEach((ch) => timers.current.push(setTimeout(() => setHeard((h) => [...h, ch]), DUR * ch.at)));
  }
  function onHoldEnd() {
    clearTimers(); setListening(false);
    const sc = scriptRef.current, mode = modeRef.current;
    const items = sc.chunks.map((c) => ({ name: c.name, cat: c.cat, amt: c.amt, who: c.who || 'dad' }));
    if (mode === 'expense') {
      if (!isProject) setExpenseLog((l) => [...items, ...l]);
      setFlyItems({ key: Date.now(), items });
    } else {
      const total = items.reduce((s, it) => s + it.amt, 0); // 收入>0 / 亏损<0
      const first = items[0];
      const item = items.length === 1 ? first : { name: `${items.length} 笔`, cat: first.cat, amt: total, who: first.who };
      const gainSum = incomeLog.filter((it) => it.amt >= 0).reduce((s, it) => s + it.amt, 0);
      const lossSum = Math.abs(incomeLog.filter((it) => it.amt < 0).reduce((s, it) => s + it.amt, 0));
      const incomeBefore = TODAY_INCOME + fixedDailyIncome(fixed) + gainSum;
      const balanceBefore = MONTHS[CUR_MONTH].income - (MONTH_TOTAL + lossSum) + gainSum;
      const after = { ...goal, saved: Math.max((Number(goal.saved) || 0) + total, 0) };
      const gd = goal && goal.enabled && Number(goal.target) > 0 ? {
        hasGoal: true, name: goal.name, glyph: goal.glyph, color: goal.color || '#0A84FF',
        pctBefore: goalProgress(goal) * 100, pctAfter: goalProgress(after) * 100,
        remBefore: goalRemaining(goal), remAfter: goalRemaining(after),
        etaBefore: fmtMonths(goalMonths(goal)), etaAfter: fmtMonths(goalMonths(after)),
      } : { hasGoal: false };
      setIncomeLog((l) => [...items, ...l]);
      setGoal((g) => (g && g.enabled ? { ...g, saved: Math.max((Number(g.saved) || 0) + total, 0) } : g));
      const receiptData = { kind: mode === 'loss' ? 'loss' : 'gain', item, incomeBefore, incomeAfter: incomeBefore + total, balanceBefore, balanceAfter: balanceBefore + total, goal: gd };
      setCoinFly({ key: Date.now(), kind: mode === 'loss' ? 'loss' : 'gain', data: receiptData });
    }
    setReveal(0); setHeard([]);
  }
  function switchLedger(id) { setLedgerId(id); setTab('home'); setShowLedger(false); }
  const perms = permsFor(viewRole, helperPerms);
  function switchView(role) { setViewRole(role); setShowRoleSwitch(false); if (role === 'helper' && (tab === 'analysis' || tab === 'budget' || tab === 'profile')) setTab('home'); }

  const transcript = activeScript.full.slice(0, Math.round(reveal * activeScript.full.length));
  const homeProps = { ledger, onOpenLedger: () => setShowLedger(true), onOpenAgent: () => { onHoldStart(); setTimeout(onHoldEnd, 3000); }, onOpenBudget: () => setTab('budget'), goal, onOpenGoal: () => setShowGoal(true), fixedDailyIncome: fixedDailyIncome(fixed), perms, viewRole, onOpenRoleSwitch: () => setShowRoleSwitch(true), onExitHelper: () => switchView('admin'), incomeLog };

  let screen;
  if (tab === 'home') screen = isProject ? <ProjectHomeScreen {...homeProps} /> : <HomeScreen {...homeProps} expenseLog={expenseLog} />;
  else if (tab === 'analysis') screen = <AnalysisScreen />;
  else if (tab === 'budget') screen = <BudgetScreen ledgerId={ledgerId} />;
  else screen = <ProfileScreen onOpenGoal={() => setShowGoal(true)} onOpenFixed={() => setShowFixed(true)} onOpenPerms={() => setShowPerms(true)} />;

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: T.bg }} edges={['top']}>
        <StatusBar style="dark" />
        <View style={{ flex: 1 }}>
          {screen}
          {viewRole === 'helper' && <HelperBanner onExit={() => switchView('admin')} />}
          <HoldOverlay open={listening} transcript={transcript} heard={heard} />
          {flyItems && <FlyLayer key={flyItems.key} items={flyItems.items} onDone={() => setFlyItems(null)} />}
          {coinFly && <CoinFly key={coinFly.key} kind={coinFly.kind} onLand={() => setIncomeReceipt(coinFly.data)} onDone={() => setCoinFly(null)} />}
        </View>
        <TabBar tab={tab} setTab={setTab} listening={listening} onHoldStart={onHoldStart} onHoldEnd={onHoldEnd} perms={perms} />
        <LedgerSheet open={showLedger} onClose={() => setShowLedger(false)} current={ledgerId} onPick={switchLedger} />
        <GoalConfigPage open={showGoal} onClose={() => setShowGoal(false)} goal={goal} setGoal={setGoal} />
        <FixedConfigSheet open={showFixed} onClose={() => setShowFixed(false)} config={fixed} setConfig={setFixed} />
        <RoleSwitchSheet open={showRoleSwitch} onClose={() => setShowRoleSwitch(false)} viewRole={viewRole} onPick={switchView} />
        <PermConfigSheet open={showPerms} onClose={() => setShowPerms(false)} perms={helperPerms} setPerms={setHelperPerms} />
        {incomeReceipt && <IncomeReceipt data={incomeReceipt} onClose={() => setIncomeReceipt(null)} />}
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
