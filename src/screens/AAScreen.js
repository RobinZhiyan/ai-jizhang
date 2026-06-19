// AAScreen.js — AA 算账工具（1:1 移植家庭日常版 screen-aa.jsx）
// 多人 AA 算账：标题+参与人数 / 人均结算 / 语音记一笔(飞入) / 拍照凭证 / 生成账单微信分享
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Pressable, TextInput, ScrollView, Modal, Animated, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Icon from '../components/Icon';
import { Avatar } from '../components/ui';
import { T, shadow } from '../theme';
import { catMeta, yuan, MEMBERS } from '../data';

// 局部小图标（相机 / 微信 / 朋友圈 / 复制）
const MINI_PATHS = {
  camera: 'M3 8a2 2 0 0 1 2-2h2l1.2-1.6h5.6L17 6h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8zM12 11.5a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
  wechat: 'M9 5.5C5.4 5.5 2.5 7.9 2.5 10.9c0 1.7.9 3.2 2.4 4.2L4 17.5l2.6-1.3c.8.2 1.6.3 2.4.3M14.5 9.5c-3.3 0-6 2.2-6 5s2.7 5 6 5c.7 0 1.4-.1 2-.3l2.3 1.1-.7-2c1.3-.9 2.1-2.2 2.1-3.8 0-2.8-2.7-5-5.7-5z',
  moments: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 8v8M8 12h8',
  copy: 'M9 9h9v11H9zM6 15H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v1',
};
function MiniIcon({ k, size = 20, sw = 1.9, color = T.ink }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      {(MINI_PATHS[k] || '').split('M').filter(Boolean).map((s, i) => <Path key={i} d={'M' + s} />)}
    </Svg>
  );
}

const AA_SAMPLES = [
  { name: '景区门票 ×6', cat: 'fun', amt: 720 },
  { name: '农家乐午餐', cat: 'eating', amt: 486 },
  { name: '包车往返', cat: 'transit', amt: 360 },
  { name: '零食饮料水', cat: 'shopping', amt: 128 },
  { name: '儿童乐园', cat: 'fun', amt: 240 },
  { name: '烧烤食材', cat: 'eating', amt: 312 },
];

export default function AAScreen({ open, onClose }) {
  const [title, setTitle] = useState('周末出游 AA');
  const [people, setPeople] = useState(6);
  const [rows, setRows] = useState(() => AA_SAMPLES.slice(0, 2).map((s, i) => ({ ...s, id: 'aa' + i, photo: i === 0 })));
  const [voice, setVoice] = useState(null); // { phase:'type'|'fly', item, typed }
  const [justId, setJustId] = useState(null);
  const [share, setShare] = useState(false);
  const nextRef = useRef(2);
  const vt = useRef([]);
  const holdRef = useRef(null);
  useEffect(() => () => vt.current.forEach(clearTimeout), []);

  const total = rows.reduce((s, r) => s + r.amt, 0);
  const per = people > 0 ? total / people : 0;
  const setPpl = (d) => setPeople((p) => Math.max(1, Math.min(20, p + d)));
  const togglePhoto = (id) => setRows((r) => r.map((x) => (x.id === id ? { ...x, photo: !x.photo } : x)));

  function startHold() {
    if (voice) return;
    const s = AA_SAMPLES[nextRef.current % AA_SAMPLES.length]; nextRef.current++;
    const item = { ...s, id: 'aa' + Date.now(), photo: false };
    holdRef.current = item;
    const full = `${s.name} ¥${s.amt}`;
    vt.current.forEach(clearTimeout); vt.current = [];
    setVoice({ phase: 'type', item, typed: '' });
    for (let k = 1; k <= full.length; k++) vt.current.push(setTimeout(() => setVoice((v) => (v && v.phase === 'type') ? { ...v, typed: full.slice(0, k) } : v), 58 * k));
  }
  function endHold() {
    if (!holdRef.current) return;
    const item = holdRef.current; holdRef.current = null;
    vt.current.forEach(clearTimeout); vt.current = [];
    setVoice((v) => (v ? { ...v, phase: 'fly' } : v));
    vt.current.push(setTimeout(() => { setRows((r) => [...r, item]); setJustId(item.id); setVoice(null); }, 600));
  }

  return (
    <Modal visible={open} animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: T.bg }}>
        <View style={aa.nav}>
          <Pressable onPress={onClose} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8 }} hitSlop={8}>
            <Icon name="chevron" size={21} sw={2.4} color={T.blue} style={{ transform: [{ rotate: '180deg' }] }} />
            <Text style={{ color: T.blue, fontSize: 16, fontWeight: '500' }}>账本</Text>
          </Pressable>
          <Text style={aa.navTitle}>AA 算账工具</Text>
          <Pressable onPress={() => setShare(true)} hitSlop={8}><Text style={{ color: T.blue, fontSize: 15, fontWeight: '600' }}>账单</Text></Pressable>
        </View>

        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 130 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {/* 标题 + 参与人数 */}
          <View style={{ backgroundColor: T.surface, borderRadius: T.radius, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 6, ...shadow, marginBottom: 14 }}>
            <TextInput value={title} onChangeText={setTitle} placeholder="活动名称" placeholderTextColor={T.faint}
              style={{ fontSize: 21, fontWeight: '700', color: T.ink, padding: 0 }} />
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 13, marginTop: 6, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: T.hair }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Icon name="users" size={19} sw={1.9} color={T.muted} />
                <Text style={{ fontSize: 14.5, color: T.ink }}>参与人数</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Pressable onPress={() => setPpl(-1)} style={aa.stepBtn}><Icon name="close" size={13} sw={2.6} color={T.ink} /></Pressable>
                <Text style={{ fontWeight: '700', fontSize: 18, color: T.ink, minWidth: 30, textAlign: 'center' }}>{people}<Text style={{ fontSize: 12, fontWeight: '500', color: T.muted }}> 人</Text></Text>
                <Pressable onPress={() => setPpl(1)} style={aa.stepBtn}><Icon name="plus" size={15} sw={2.4} color={T.ink} /></Pressable>
              </View>
            </View>
          </View>

          {/* 人均结算卡 */}
          <View style={{ borderRadius: T.radius, padding: 19, ...shadow, marginBottom: 16, backgroundColor: '#26262B' }}>
            <Text style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.6)' }}>我已垫付合计</Text>
            <Text style={{ fontWeight: '700', fontSize: 34, color: '#fff', letterSpacing: -1.2, marginTop: 2 }}>{yuan(total)}</Text>
            <View style={{ flexDirection: 'row', marginTop: 16, paddingTop: 15, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: 'rgba(255,255,255,0.16)' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>每人应付</Text>
                <Text style={{ fontSize: 22, fontWeight: '700', marginTop: 3, color: '#5DE588' }}>{yuan(Math.round(per))}</Text>
              </View>
              <View style={{ width: StyleSheet.hairlineWidth, backgroundColor: 'rgba(255,255,255,0.16)' }} />
              <View style={{ flex: 1, paddingLeft: 16 }}>
                <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>分摊方式</Text>
                <Text style={{ fontSize: 22, fontWeight: '700', marginTop: 3, color: '#fff' }}>{total ? `÷ ${people}` : '—'}</Text>
              </View>
            </View>
          </View>

          {/* 支出明细 */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 2, marginBottom: 11 }}>
            <Text style={aa.section}>支出明细</Text>
            <Text style={{ fontSize: 12.5, color: T.faint }}>{rows.length} 笔 · 全员可见</Text>
          </View>
          <View style={{ backgroundColor: T.surface, borderRadius: T.radius, ...shadow, marginBottom: 14, overflow: 'hidden' }}>
            {rows.length === 0 && <Text style={{ paddingVertical: 24, textAlign: 'center', fontSize: 13.5, color: T.faint }}>按住下方「语音记一笔」开始</Text>}
            {rows.map((r, i) => <AARow key={r.id} r={r} first={i === 0} just={r.id === justId} onPhoto={() => togglePhoto(r.id)} />)}
          </View>

          {/* 生成账单 · 微信分享 */}
          <Pressable onPress={() => setShare(true)} style={{ height: 52, borderRadius: 16, backgroundColor: '#07C160', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <MiniIcon k="wechat" size={20} sw={1.9} color="#fff" />
            <Text style={{ color: '#fff', fontSize: 15.5, fontWeight: '600' }}>生成账单 · 微信分享</Text>
          </Pressable>
        </ScrollView>

        {/* 语音记一笔（底部悬浮）*/}
        <View style={aa.voiceBar}>
          {voice && (
            <View style={aa.bubbleWrap} pointerEvents="none">
              {voice.phase === 'type' ? (
                <View style={aa.typeBubble}>
                  <Text style={{ fontSize: 15.5, fontWeight: '600', color: T.ink }}>{voice.typed}</Text>
                  <View style={aa.caret} />
                </View>
              ) : (
                <FlyBubble item={voice.item} />
              )}
            </View>
          )}
          <Pressable onPressIn={startHold} onPressOut={endHold}
            style={{ height: 54, borderRadius: 16, backgroundColor: voice ? T.ok : T.accent, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, ...shadow }}>
            <Icon name="mic" size={19} sw={2} color={voice ? '#fff' : T.accentInk} />
            <Text style={{ fontSize: 15.5, fontWeight: '600', color: voice ? '#fff' : T.accentInk }}>{voice ? '聆听中… 松开即记账' : '按住 · 语音记一笔'}</Text>
          </Pressable>
        </View>

        {share && <AAShare title={title} rows={rows} total={total} people={people} per={per} onClose={() => setShare(false)} />}
      </View>
    </Modal>
  );
}

// 明细行（飞入落定 swell 动画）
function AARow({ r, first, just, onPhoto }) {
  const m = catMeta(r.cat);
  const sc = useRef(new Animated.Value(just ? 0.6 : 1)).current;
  useEffect(() => {
    if (just) Animated.spring(sc, { toValue: 1, friction: 5, tension: 90, useNativeDriver: true }).start();
  }, []);
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 15, paddingVertical: 13 }, !first && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: T.hair }]}>
      <Animated.View style={{ width: 36, height: 36, borderRadius: 11, backgroundColor: m.color + '1A', alignItems: 'center', justifyContent: 'center', transform: [{ scale: sc }] }}>
        <Icon name={m.glyph} size={19} sw={2} color={m.color} />
      </Animated.View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text numberOfLines={1} style={{ fontSize: 15, fontWeight: '500', color: T.ink }}>{r.name}</Text>
        <Text style={{ fontSize: 11.5, color: T.faint, marginTop: 1 }}>{m.zh} · 我垫付</Text>
      </View>
      <Pressable onPress={onPhoto} hitSlop={6} style={{ padding: 4 }}><MiniIcon k="camera" size={18} sw={1.7} color={r.photo ? T.ok : T.faint} /></Pressable>
      <Text style={{ fontSize: 15.5, fontWeight: '700', color: T.ink }}>{yuan(r.amt)}</Text>
    </View>
  );
}

// 飞入气泡（松开后向上飞淡出）
function FlyBubble({ item }) {
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => { Animated.timing(a, { toValue: 1, duration: 600, useNativeDriver: true }).start(); }, []);
  const translateY = a.interpolate({ inputRange: [0, 1], outputRange: [0, -54] });
  const scale = a.interpolate({ inputRange: [0, 1], outputRange: [1, 0.6] });
  const opacity = a.interpolate({ inputRange: [0, 0.6, 1], outputRange: [1, 1, 0] });
  return (
    <Animated.View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: '#fff', borderRadius: 11, paddingHorizontal: 12, paddingVertical: 7, ...shadow, shadowOpacity: 0.3, transform: [{ translateY }, { scale }], opacity }}>
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: catMeta(item.cat).color }} />
      <Text style={{ fontSize: 13, fontWeight: '600', color: '#111' }}>{item.name}</Text>
      <Text style={{ fontSize: 13, fontWeight: '700', color: '#111' }}>{yuan(item.amt)}</Text>
    </Animated.View>
  );
}

// 账单分享（海报 + 渠道）
function AAShare({ title, rows, total, people, per, onClose }) {
  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <Pressable onPress={onClose} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
        <Pressable onPress={() => {}} style={{ backgroundColor: T.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 16, paddingTop: 10, paddingBottom: 30, maxHeight: '92%' }}>
          <View style={{ width: 38, height: 5, borderRadius: 3, backgroundColor: T.track, alignSelf: 'center', marginVertical: 8 }} />
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={{ backgroundColor: T.surface, borderRadius: 20, overflow: 'hidden', ...shadow }}>
              <View style={{ backgroundColor: '#26262B', padding: 20 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>AA 账单 · 6月13日</Text>
                  <Text style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.6)' }}>声记 · AI记账</Text>
                </View>
                <Text style={{ fontSize: 22, fontWeight: '700', color: '#fff', marginTop: 8 }}>{title}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 16 }}>
                  <View>
                    <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>每人应付</Text>
                    <Text style={{ fontSize: 32, fontWeight: '800', color: '#5DE588', letterSpacing: -1 }}>{yuan(Math.round(per))}</Text>
                  </View>
                  <Text style={{ textAlign: 'right', fontSize: 12, color: 'rgba(255,255,255,0.7)', lineHeight: 20 }}>合计 {yuan(total)}{'\n'}{people} 人均摊</Text>
                </View>
              </View>
              <View style={{ paddingHorizontal: 18, paddingVertical: 6 }}>
                {rows.map((r, i) => (
                  <View key={r.id} style={[{ flexDirection: 'row', alignItems: 'center', gap: 9, paddingVertical: 11 }, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: T.hair }]}>
                    <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: catMeta(r.cat).color }} />
                    <Text style={{ flex: 1, fontSize: 14, color: T.ink }}>{r.name}</Text>
                    {r.photo && <MiniIcon k="camera" size={14} sw={1.7} color={T.faint} />}
                    <Text style={{ fontSize: 14, fontWeight: '700', color: T.ink }}>{yuan(r.amt)}</Text>
                  </View>
                ))}
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: T.surface2, margin: 16, marginTop: 4, borderRadius: 12, padding: 11 }}>
                <Avatar m={MEMBERS.dad} size={28} />
                <Text style={{ flex: 1, fontSize: 13, color: T.muted }}>发起人 <Text style={{ color: T.ink, fontWeight: '700' }}>{MEMBERS.dad.name}</Text> · 微信转我即可</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 20, marginBottom: 6 }}>
              {[{ k: 'wechat', t: '微信好友', c: '#07C160' }, { k: 'moments', t: '朋友圈', c: '#07C160' }, { k: 'copy', t: '复制清单', c: T.ink }].map((s) => (
                <Pressable key={s.k} onPress={onClose} style={{ alignItems: 'center', gap: 8 }}>
                  <View style={{ width: 54, height: 54, borderRadius: 27, backgroundColor: s.c === T.ink ? T.surface2 : s.c, alignItems: 'center', justifyContent: 'center' }}>
                    <MiniIcon k={s.k} size={26} sw={1.8} color={s.c === T.ink ? T.ink : '#fff'} />
                  </View>
                  <Text style={{ fontSize: 12, color: T.muted }}>{s.t}</Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const aa = StyleSheet.create({
  nav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingTop: 54, paddingBottom: 8, backgroundColor: T.surface, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: T.hair },
  navTitle: { fontSize: 17, fontWeight: '600', color: T.ink },
  section: { fontSize: 18, fontWeight: '700', color: T.ink },
  stepBtn: { width: 30, height: 30, borderRadius: 9, backgroundColor: T.surface2, alignItems: 'center', justifyContent: 'center' },
  voiceBar: { position: 'absolute', left: 16, right: 16, bottom: 24 },
  bubbleWrap: { position: 'absolute', left: 0, right: 0, bottom: '100%', alignItems: 'center', marginBottom: 12 },
  typeBubble: { flexDirection: 'row', alignItems: 'center', backgroundColor: T.surface, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 9, ...shadow },
  caret: { width: 2, height: 14, marginLeft: 3, backgroundColor: T.ok },
});
