// AAScreen.js — AA 算账工具：长按语音记账 + 自动算人均 + 明细 + 生成账单分享
import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '../components/Icon';
import { Card } from '../components/ui';
import { T, shadow } from '../theme';
import { AA_SAMPLES, catMeta, yuan, MEMBERS } from '../data';

export default function AAScreen({ navigation }) {
  const [title] = useState('周末出游 AA');
  const [people, setPeople] = useState(6);
  const [rows, setRows] = useState(() => AA_SAMPLES.slice(0, 2).map((s, i) => ({ ...s, id: 'aa' + i, photo: i === 0 })));
  const [voice, setVoice] = useState(null); // { phase:'type'|'fly', item, typed }
  const [share, setShare] = useState(false);
  const next = useRef(2);
  const held = useRef(null);
  const timers = useRef([]);

  const total = rows.reduce((s, r) => s + r.amt, 0);
  const per = people > 0 ? Math.round(total / people) : 0;

  function startHold() {
    if (voice) return;
    const s = AA_SAMPLES[next.current % AA_SAMPLES.length]; next.current++;
    const item = { ...s, id: 'aa' + Date.now(), photo: false };
    held.current = item;
    const full = `${s.name}  ${yuan(s.amt)}`;
    timers.current.forEach(clearTimeout); timers.current = [];
    setVoice({ phase: 'type', item, typed: '' });
    for (let k = 1; k <= full.length; k++) timers.current.push(setTimeout(() => setVoice((v) => (v && v.phase === 'type' ? { ...v, typed: full.slice(0, k) } : v)), 55 * k));
  }
  function endHold() {
    if (!held.current) return;
    const item = held.current; held.current = null;
    timers.current.forEach(clearTimeout); timers.current = [];
    setVoice((v) => (v ? { ...v, phase: 'fly' } : v));
    timers.current.push(setTimeout(() => { setRows((r) => [...r, item]); setVoice(null); }, 420));
  }
  const togglePhoto = (id) => setRows((r) => r.map((x) => (x.id === id ? { ...x, photo: !x.photo } : x)));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: T.bg }} edges={['top']}>
      {/* 顶栏 */}
      <View style={aa.nav}>
        <Pressable onPress={() => navigation.goBack()} style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Icon name="chevron" size={22} color={T.blue} sw={2.2} style={{ transform: [{ rotate: '180deg' }] }} />
          <Text style={{ color: T.blue, fontSize: 16 }}>返回</Text>
        </Pressable>
        <Text style={aa.navTitle}>AA 算账工具</Text>
        <Pressable onPress={() => setShare(true)}><Text style={{ color: T.blue, fontSize: 15, fontWeight: '600' }}>账单</Text></Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
        {/* 标题 + 人数 */}
        <Card pad={16} style={{ marginBottom: 14 }}>
          <Text style={aa.title}>{title}</Text>
          <View style={aa.pplRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Icon name="users" size={19} color={T.muted} sw={1.9} /><Text style={{ fontSize: 14.5, color: T.ink }}>参与人数</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Pressable onPress={() => setPeople((p) => Math.max(1, p - 1))} style={aa.step}><Icon name="close" size={13} color={T.ink} sw={2.6} /></Pressable>
              <Text style={aa.pplNum}>{people}<Text style={{ fontSize: 12, color: T.muted, fontWeight: '500' }}> 人</Text></Text>
              <Pressable onPress={() => setPeople((p) => Math.min(20, p + 1))} style={aa.step}><Icon name="plus" size={15} color={T.ink} sw={2.4} /></Pressable>
            </View>
          </View>
        </Card>

        {/* 人均结算 */}
        <View style={aa.settle}>
          <Text style={aa.settleLabel}>我已垫付合计</Text>
          <Text style={aa.settleTotal}>{yuan(total)}</Text>
          <View style={aa.settleRow}>
            <View style={{ flex: 1 }}>
              <Text style={aa.settleSub}>每人应付</Text>
              <Text style={[aa.settleBig, { color: '#5DE588' }]}>{yuan(per)}</Text>
            </View>
            <View style={aa.settleDivider} />
            <View style={{ flex: 1, paddingLeft: 16 }}>
              <Text style={aa.settleSub}>分摊方式</Text>
              <Text style={aa.settleBig}>÷ {people}</Text>
            </View>
          </View>
        </View>

        {/* 明细 */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 20, marginBottom: 11 }}>
          <Text style={aa.secTitle}>支出明细</Text>
          <Text style={{ fontSize: 12.5, color: T.faint }}>{rows.length} 笔 · 全员可见</Text>
        </View>
        <Card pad={0}>
          {rows.map((r, i) => {
            const m = catMeta(r.cat);
            return (
              <View key={r.id} style={[aa.row, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: T.hair }]}>
                <View style={[aa.rowIcon, { backgroundColor: m.color + '1A' }]}><Icon name={m.glyph} size={19} color={m.color} sw={2} /></View>
                <View style={{ flex: 1 }}>
                  <Text style={aa.rowName}>{r.name}</Text>
                  <Text style={aa.rowSub}>{m.zh} · 我垫付</Text>
                </View>
                <Pressable onPress={() => togglePhoto(r.id)} style={{ padding: 4, marginRight: 4 }}>
                  <Icon name="camera" size={18} color={r.photo ? T.ok : T.faint} sw={1.7} />
                </Pressable>
                <Text style={aa.rowAmt}>{yuan(r.amt)}</Text>
              </View>
            );
          })}
        </Card>

        {/* 生成账单 */}
        <Pressable onPress={() => setShare(true)} style={[aa.shareBtn, { marginTop: 14 }]}>
          <Icon name="wechat" size={20} color="#fff" sw={1.9} /><Text style={aa.shareTxt}>生成账单 · 微信分享</Text>
        </Pressable>
      </ScrollView>

      {/* 悬浮语音字幕 + 按住按钮 */}
      <View style={aa.voiceWrap} pointerEvents="box-none">
        {voice && (
          <View style={aa.caption}>
            {voice.phase === 'type'
              ? <Text style={aa.captionTxt}>{voice.typed}<Text style={{ color: T.ok }}>|</Text></Text>
              : <Text style={aa.captionTxt}>{voice.item.name}  {yuan(voice.item.amt)} ↑</Text>}
          </View>
        )}
        <Pressable
          onPressIn={startHold}
          onPressOut={endHold}
          style={[aa.voiceBtn, { backgroundColor: voice ? T.ok : T.accent }]}
        >
          <Icon name="mic" size={19} color={voice ? '#fff' : T.accentInk} sw={2} />
          <Text style={[aa.voiceBtnTxt, { color: voice ? '#fff' : T.accentInk }]}>{voice ? '聆听中… 松开即记账' : '按住 · 语音记一笔'}</Text>
        </Pressable>
      </View>

      {/* 账单分享浮层 */}
      <Modal visible={share} transparent animationType="slide" onRequestClose={() => setShare(false)}>
        <Pressable style={aa.sheetBg} onPress={() => setShare(false)}>
          <Pressable style={aa.sheet} onPress={() => {}}>
            <View style={aa.grip} />
            <View style={aa.poster}>
              <View style={aa.posterTop}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>AA 账单 · 6月13日</Text>
                  <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11.5 }}>声记 · AI记账</Text>
                </View>
                <Text style={aa.posterTitle}>{title}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 16 }}>
                  <View>
                    <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>每人应付</Text>
                    <Text style={{ color: '#5DE588', fontSize: 32, fontWeight: '800', letterSpacing: -1 }}>{yuan(per)}</Text>
                  </View>
                  <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, textAlign: 'right' }}>合计 {yuan(total)}{'\n'}{people} 人均摊</Text>
                </View>
              </View>
              <View style={{ paddingHorizontal: 18 }}>
                {rows.map((r, i) => (
                  <View key={r.id} style={[aa.posterRow, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: T.hair }]}>
                    <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: catMeta(r.cat).color }} />
                    <Text style={{ flex: 1, fontSize: 14, color: T.ink, marginLeft: 9 }}>{r.name}</Text>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: T.ink }}>{yuan(r.amt)}</Text>
                  </View>
                ))}
              </View>
              <View style={aa.posterFoot}>
                <Text style={{ fontSize: 13, color: T.muted }}>发起人 <Text style={{ color: T.ink, fontWeight: '700' }}>{MEMBERS.dad.name}</Text> · 微信转我即可</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 20 }}>
              {[{ k: 'wechat', t: '微信好友', c: '#07C160' }, { k: 'wechat', t: '朋友圈', c: '#07C160' }, { k: 'box', t: '复制清单', c: T.ink }].map((x, i) => (
                <Pressable key={i} onPress={() => setShare(false)} style={{ alignItems: 'center', gap: 8 }}>
                  <View style={{ width: 54, height: 54, borderRadius: 27, backgroundColor: x.c === T.ink ? T.surface2 : x.c, alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name={x.k} size={26} color={x.c === T.ink ? T.ink : '#fff'} sw={1.8} />
                  </View>
                  <Text style={{ fontSize: 12, color: T.muted }}>{x.t}</Text>
                </Pressable>
              ))}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const aa = StyleSheet.create({
  nav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 10 },
  navTitle: { fontSize: 17, fontWeight: '700', color: T.ink },
  title: { fontSize: 21, fontWeight: '700', color: T.ink },
  pplRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 14, paddingTop: 13, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: T.hair },
  step: { width: 30, height: 30, borderRadius: 9, backgroundColor: T.surface2, alignItems: 'center', justifyContent: 'center' },
  pplNum: { fontSize: 18, fontWeight: '700', color: T.ink, minWidth: 30, textAlign: 'center' },

  settle: { backgroundColor: T.accent, borderRadius: T.radius, padding: 19, ...shadow },
  settleLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 12.5 },
  settleTotal: { color: '#fff', fontSize: 34, fontWeight: '700', letterSpacing: -1.2, marginTop: 2 },
  settleRow: { flexDirection: 'row', marginTop: 16, paddingTop: 15, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: 'rgba(255,255,255,0.16)' },
  settleSub: { color: 'rgba(255,255,255,0.6)', fontSize: 12 },
  settleBig: { color: '#fff', fontSize: 22, fontWeight: '700', marginTop: 3 },
  settleDivider: { width: StyleSheet.hairlineWidth, backgroundColor: 'rgba(255,255,255,0.16)' },

  secTitle: { fontSize: 18, fontWeight: '800', color: T.ink },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 13 },
  rowIcon: { width: 36, height: 36, borderRadius: 11, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  rowName: { fontSize: 15, fontWeight: '500', color: T.ink },
  rowSub: { fontSize: 11.5, color: T.faint, marginTop: 1 },
  rowAmt: { fontSize: 15.5, fontWeight: '700', color: T.ink },

  shareBtn: { height: 52, borderRadius: 16, backgroundColor: '#07C160', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, ...shadow, shadowColor: '#07C160', shadowOpacity: 0.34 },
  shareTxt: { color: '#fff', fontSize: 15.5, fontWeight: '600' },

  voiceWrap: { position: 'absolute', left: 16, right: 16, bottom: 28, alignItems: 'center' },
  caption: { backgroundColor: T.surface, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 9, marginBottom: 12, ...shadow },
  captionTxt: { fontSize: 15.5, fontWeight: '600', color: T.ink },
  voiceBtn: { width: '100%', height: 54, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, ...shadow },
  voiceBtnTxt: { fontSize: 15.5, fontWeight: '600' },

  sheetBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: T.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 16, paddingBottom: 34 },
  grip: { width: 38, height: 5, borderRadius: 3, backgroundColor: T.track, alignSelf: 'center', marginBottom: 16 },
  poster: { backgroundColor: T.surface, borderRadius: 20, overflow: 'hidden', ...shadow },
  posterTop: { backgroundColor: T.accent, padding: 20 },
  posterTitle: { color: '#fff', fontSize: 22, fontWeight: '700', marginTop: 8 },
  posterRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 11 },
  posterFoot: { backgroundColor: T.surface2, margin: 16, marginTop: 4, borderRadius: 12, padding: 12 },
});
