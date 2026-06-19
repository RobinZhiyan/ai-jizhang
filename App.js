// App.js — 根：5-Tab 导航（总览/分析/记账长按语音/预算/我的）+ 多账本 + 语音状态机
// 1:1 移植自原型 app.jsx（去掉 iOS 设备外壳，RN 直接全屏）
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Pressable, TextInput, ScrollView, StyleSheet, Animated, Easing, Vibration, LogBox } from 'react-native';

// 抑制 @react-native-voice/voice 在 Android 的 NativeEventEmitter 非致命警告
LogBox.ignoreLogs(['new NativeEventEmitter', 'EventEmitter.removeListener']);
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
import AAScreen from './src/screens/AAScreen';
import { Voice, hasVoice, parseSpeech, detectMode } from './src/voice';

// 触觉反馈：优先 expo-haptics(真机重编译后细腻)，否则降级 RN 内置 Vibration
let Haptics = null;
try { Haptics = require('expo-haptics'); } catch (e) {}
function buzz(kind) {
  try {
    if (Haptics && Haptics.impactAsync) {
      if (kind === 'success') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      else Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      return;
    }
  } catch (e) {}
  try { Vibration.vibrate(8); } catch (x) {}
}

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

// 「家庭日常」板块：三个功能入口（AA 记账 / 家庭日常 / 敬请期待）
function LedgerSheet({ open, onClose, onOpenAA }) {
  const PANELS = [
    { id: 'aa', name: 'AA 记账', desc: '说一笔 / 输入一笔 · 自动识别金额并归类', icon: 'plus', tint: T.accent, iconInk: T.accentInk, pill: '记一笔', pc: T.blue, pb: 'rgba(10,132,255,0.12)', go: () => { onClose(); onOpenAA && onOpenAA(); } },
    { id: 'home', name: '家庭日常', desc: '家庭共享账本 · 当前使用中', icon: 'house', tint: T.blue, iconInk: '#fff', pill: '当前', pc: T.ok, pb: 'rgba(48,209,88,0.14)', go: onClose },
    { id: 'soon', name: '敬请期待', desc: '更多场景账本 · 装修 / 开店 / 活动', icon: 'spark', tint: T.faint, iconInk: '#fff', pill: '即将开放', pc: T.muted, pb: 'rgba(120,120,128,0.16)', soon: true },
  ];
  return (
    <Sheet open={open} onClose={onClose} title="家庭日常">
      <View style={{ gap: 10 }}>
        {PANELS.map((p) => (
          <Pressable key={p.id} onPress={p.soon ? undefined : p.go} disabled={!!p.soon}
            style={{ opacity: p.soon ? 0.6 : 1, backgroundColor: T.surface, borderRadius: T.radius, padding: 15, flexDirection: 'row', alignItems: 'center', gap: 12, ...shadow }}>
            <View style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: p.tint, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name={p.icon} size={21} sw={2} color={p.iconInk} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: T.ink }}>{p.name}</Text>
                <Pill color={p.pc} bg={p.pb}>{p.pill}</Pill>
              </View>
              <Text style={{ fontSize: 12.5, color: T.muted, marginTop: 3 }}>{p.desc}</Text>
            </View>
            {!p.soon && <Icon name="chevron" size={20} sw={2.2} color={T.faint} />}
          </Pressable>
        ))}
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
  const [transactions, setTransactions] = usePersistedState('vb_transactions', []);
  const [showAA, setShowAA] = useState(false);
  const [homeFly, setHomeFly] = useState(null); // 家庭账本语音飞入队列（落定逐笔入账）
  const [showMock, setShowMock] = useState(false);
  const [mockText, setMockText] = useState('');
  const addTx = (tx) => setTransactions((l) => [tx, ...l]);
  const delTx = (id) => setTransactions((l) => l.filter((t) => t.id !== id));
  const [incomeLog, setIncomeLog] = useState([]);
  const [incomeReceipt, setIncomeReceipt] = useState(null);
  const [coinFly, setCoinFly] = useState(null);
  const [activeScript, setActiveScript] = useState(VOICE_SCRIPT);
  const timers = useRef([]);
  const modeRef = useRef('expense');
  const scriptRef = useRef(VOICE_SCRIPT);
  const scenarioRef = useRef(0);
  const [liveText, setLiveText] = useState('');
  const liveTextRef = useRef('');
  const pendingRef = useRef(false);        // 松开后是否在等最终识别结果
  const commitRef = useRef(() => false);   // 指向最新 commitText，避免回调里 stale
  useEffect(() => {
    if (!hasVoice) return;
    const flush = () => { if (!pendingRef.current) return; pendingRef.current = false; const ok = commitRef.current(liveTextRef.current); liveTextRef.current = ''; setLiveText(''); if (!ok) setShowMock(true); };
    Voice.onSpeechPartialResults = (e) => { const t = e && e.value && e.value[0]; if (t != null) { liveTextRef.current = t; setLiveText(t); } };
    Voice.onSpeechResults = (e) => { const t = e && e.value && e.value[0]; console.log('[Voice] results:', t); if (t != null) { liveTextRef.current = t; setLiveText(t); } flush(); };
    Voice.onSpeechEnd = flush;
    Voice.onSpeechError = (e) => { console.log('[Voice] error:', JSON.stringify(e && (e.error || e))); flush(); };
    return () => { try { Voice.destroy().then(() => Voice.removeAllListeners && Voice.removeAllListeners()); } catch (e) {} };
  }, []);
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
    clearTimers(); setHeard([]); setReveal(0); setLiveText(''); setListening(true);
    if (hasVoice) {
      // 真实语音识别：按用户实际说的内容
      liveTextRef.current = '';
      Voice.start('zh-CN').catch(() => {});
      return;
    }
    // 降级（无原生语音模块时，用演示脚本）
    const pick = pickScenario();
    modeRef.current = pick.mode; scriptRef.current = pick.sc; setActiveScript(pick.sc);
    const DUR = 2600, steps = 40;
    for (let i = 1; i <= steps; i++) timers.current.push(setTimeout(() => setReveal(i / steps), (DUR / steps) * i));
    pick.sc.chunks.forEach((ch) => timers.current.push(setTimeout(() => setHeard((h) => [...h, ch]), DUR * ch.at)));
  }
  function processVoiceItems(items, mode) {
    if (mode === 'expense') {
      if (isProject) setFlyItems({ key: Date.now(), items });
      else setHomeFly({ key: Date.now(), items }); // 家庭账本：卡片飞向类目方格，落定瞬间逐笔真实入账
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
  }
  // 把一段文字（真实语音识别结果 or 模拟语音输入）按真实流程记账：解析→归类→飞入/收支
  function commitText(text) {
    const parsed = parseSpeech(text);
    if (!parsed.length) return false;
    const mode = isProject ? 'expense' : detectMode(text);
    const items = parsed.map((it) => ({ name: it.name, cat: it.cat, amt: mode === 'loss' ? -Math.abs(it.amt) : it.amt, who: 'dad' }));
    processVoiceItems(items, mode);
    return true;
  }
  commitRef.current = commitText; // 每次渲染指向最新闭包，供语音回调调用
  function onHoldEnd() {
    clearTimers(); setListening(false); buzz();
    if (hasVoice) {
      // 松开后等最终识别结果回调(onSpeechResults/End)再记账；1.6s 兜底用已收到的文本
      pendingRef.current = true;
      Voice.stop().catch(() => {});
      setTimeout(() => { if (!pendingRef.current) return; pendingRef.current = false; const ok = commitText(liveTextRef.current); liveTextRef.current = ''; setLiveText(''); if (!ok) setShowMock(true); }, 1600);
    } else {
      const sc = scriptRef.current, mode = modeRef.current;
      const items = sc.chunks.map((c) => ({ name: c.name, cat: c.cat, amt: c.amt, who: c.who || 'dad' }));
      processVoiceItems(items, mode);
    }
    setReveal(0); setHeard([]); setLiveText('');
  }
  function switchLedger(id) { setLedgerId(id); setTab('home'); setShowLedger(false); }
  const perms = permsFor(viewRole, helperPerms);
  function switchView(role) { setViewRole(role); setShowRoleSwitch(false); if (role === 'helper' && (tab === 'analysis' || tab === 'budget' || tab === 'profile')) setTab('home'); }

  const transcript = hasVoice ? liveText : activeScript.full.slice(0, Math.round(reveal * activeScript.full.length));
  const homeProps = { ledger, onOpenLedger: () => setShowLedger(true), onOpenAgent: () => setShowMock(true), onOpenBudget: () => setTab('budget'), goal, onOpenGoal: () => setShowGoal(true), fixedDailyIncome: fixedDailyIncome(fixed), perms, viewRole, onOpenRoleSwitch: () => setShowRoleSwitch(true), onExitHelper: () => switchView('admin'), incomeLog };

  let screen;
  if (tab === 'home') screen = isProject ? <ProjectHomeScreen {...homeProps} /> : <HomeScreen {...homeProps} transactions={transactions} flyItems={homeFly} onTxLand={addTx} onFlyDone={() => setHomeFly(null)} />;
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
          <HoldOverlay open={listening} transcript={transcript} heard={hasVoice ? parseSpeech(liveText) : heard} />
          {flyItems && <FlyLayer key={flyItems.key} items={flyItems.items} onDone={() => setFlyItems(null)} />}
          {coinFly && <CoinFly key={coinFly.key} kind={coinFly.kind} onLand={() => { buzz('success'); setIncomeReceipt(coinFly.data); }} onDone={() => setCoinFly(null)} />}
        </View>
        <TabBar tab={tab} setTab={setTab} listening={listening} onHoldStart={onHoldStart} onHoldEnd={onHoldEnd} perms={perms} />
        <LedgerSheet open={showLedger} onClose={() => setShowLedger(false)} onOpenAA={() => setShowAA(true)} />
        <GoalConfigPage open={showGoal} onClose={() => setShowGoal(false)} goal={goal} setGoal={setGoal} />
        <FixedConfigSheet open={showFixed} onClose={() => setShowFixed(false)} config={fixed} setConfig={setFixed} />
        <RoleSwitchSheet open={showRoleSwitch} onClose={() => setShowRoleSwitch(false)} viewRole={viewRole} onPick={switchView} />
        <PermConfigSheet open={showPerms} onClose={() => setShowPerms(false)} perms={helperPerms} setPerms={setHelperPerms} />
        {incomeReceipt && <IncomeReceipt data={incomeReceipt} onClose={() => setIncomeReceipt(null)} />}
        <AAScreen open={showAA} onClose={() => setShowAA(false)} />
        <Sheet open={showMock} onClose={() => setShowMock(false)} title="模拟语音 · 测试记账">
          <Text style={{ fontSize: 13, color: T.muted, marginBottom: 12, lineHeight: 19 }}>
            模拟器没有真麦克风，这里输入你要「说」的话，走与真实语音完全相同的流程：识别金额 → 自动归类 → 飞入入账（多笔用空格分隔）。
          </Text>
          <View style={{ backgroundColor: T.surface, borderRadius: T.radius, padding: 14, ...shadow }}>
            <TextInput value={mockText} onChangeText={setMockText} placeholder="如：打车30 外卖20 奶茶15" placeholderTextColor={T.faint}
              onSubmitEditing={() => { if (commitText(mockText)) { setMockText(''); setShowMock(false); } }} returnKeyType="done"
              style={{ backgroundColor: T.surface2, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, color: T.ink }} />
            <Pressable onPress={() => { if (commitText(mockText)) { setMockText(''); setShowMock(false); } }}
              style={{ marginTop: 12, height: 48, borderRadius: 14, backgroundColor: T.accent, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6 }}>
              <Icon name="mic" size={18} sw={2} color={T.accentInk} />
              <Text style={{ color: T.accentInk, fontSize: 15.5, fontWeight: '600' }}>识别 · 记一笔</Text>
            </Pressable>
          </View>
          <Text style={{ fontSize: 12.5, fontWeight: '600', color: T.muted, marginTop: 18, marginBottom: 10 }}>快捷测试样本（点一下即记账）</Text>
          <View style={{ gap: 8 }}>
            {['打车30 外卖20 奶茶15', '超市买菜88 水果46', '工资到账5000', '股票亏损1500'].map((s) => (
              <Pressable key={s} onPress={() => { commitText(s); setShowMock(false); }}
                style={{ backgroundColor: T.surface, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, flexDirection: 'row', alignItems: 'center', gap: 10, ...shadow }}>
                <Icon name="mic" size={17} sw={2} color={T.blue} />
                <Text style={{ flex: 1, fontSize: 14.5, color: T.ink }}>{s}</Text>
                <Icon name="chevron" size={16} color={T.faint} />
              </Pressable>
            ))}
          </View>
        </Sheet>
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
