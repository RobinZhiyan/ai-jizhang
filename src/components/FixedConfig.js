// FixedConfig.js — 固定收支配置（月薪自动入账 + 房贷/车贷还款）1:1 移植 fixed.jsx
import React, { useState } from 'react';
import { View, Text, Pressable, Modal, TextInput, ScrollView, StyleSheet } from 'react-native';
import Icon from './Icon';
import { Avatar, Segmented } from './ui';
import { T, shadow } from '../theme';
import { MEMBERS, fixedMonthlySalary, fixedDailyIncome, fixedMonthlyLoan, fixedDailyAmort } from '../data';

const DPM = 30;

function AmountInput({ value, onChange, suffix = '/月', w }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2, backgroundColor: T.surface2, borderRadius: 10, paddingHorizontal: 11, paddingVertical: 7, width: w }}>
      <Text style={{ fontSize: 14, color: T.faint }}>¥</Text>
      <TextInput value={value === 0 ? '' : String(value)} placeholder="0" placeholderTextColor={T.faint} keyboardType="number-pad"
        onChangeText={(t) => { const n = parseInt(t.replace(/[^0-9]/g, ''), 10); onChange(Number.isFinite(n) ? n : 0); }}
        style={{ flex: 1, fontWeight: T.numWeight, fontSize: 16, color: T.ink, textAlign: 'right', padding: 0 }} />
      {suffix ? <Text style={{ fontSize: 12, color: T.faint }}>{suffix}</Text> : null}
    </View>
  );
}

function DayStepper({ value, onChange }) {
  const set = (v) => onChange(Math.max(1, Math.min(28, v)));
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <Pressable onPress={() => set(value - 1)} style={fc.stepBtn}><Icon name="close" size={15} sw={2.4} color={T.ink} /></Pressable>
      <Text style={{ fontWeight: '700', fontSize: 17, color: T.ink, minWidth: 38, textAlign: 'center' }}>{value}<Text style={{ fontSize: 12, fontWeight: '500', color: T.muted }}> 号</Text></Text>
      <Pressable onPress={() => set(value + 1)} style={fc.stepBtn}><Icon name="plus" size={15} sw={2.4} color={T.ink} /></Pressable>
    </View>
  );
}

function SalaryRow({ row, onChange, last }) {
  const m = MEMBERS[row.who] || { name: '成员', initial: '人', color: '#8E8E93' };
  const per = Math.round((Number(row.amount) || 0) / DPM);
  return (
    <View style={{ paddingVertical: 13, borderBottomWidth: last ? 0 : StyleSheet.hairlineWidth, borderBottomColor: T.hair }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Avatar m={m} size={38} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={{ fontSize: 15.5, fontWeight: '600', color: T.ink }}>{m.name}</Text>
          <Text style={{ fontSize: 12.5, color: T.ok, marginTop: 2 }}>每天入账 ≈ +¥{per.toLocaleString('zh-CN')}</Text>
        </View>
        <AmountInput value={row.amount} onChange={(v) => onChange({ ...row, amount: v })} w={124} />
      </View>
    </View>
  );
}

function LoanRow({ row, onChange, onRemove }) {
  const per = Math.round((Number(row.amount) || 0) / DPM);
  return (
    <View style={{ backgroundColor: T.surface, borderRadius: T.radius, padding: 16, ...shadow, marginBottom: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <View style={{ width: 38, height: 38, borderRadius: 11, backgroundColor: row.color, alignItems: 'center', justifyContent: 'center' }}><Icon name={row.glyph} size={20} sw={2} color="#fff" /></View>
        <TextInput value={row.name} onChangeText={(t) => onChange({ ...row, name: t })} style={{ flex: 1, fontSize: 16, fontWeight: '600', color: T.ink, padding: 0 }} />
        <AmountInput value={row.amount} onChange={(v) => onChange({ ...row, amount: v })} w={120} />
        <Pressable onPress={onRemove} style={fc.stepBtn}><Icon name="close" size={15} sw={2.2} color={T.muted} /></Pressable>
      </View>
      <Segmented small value={row.mode} onChange={(v) => onChange({ ...row, mode: v })}
        options={[{ value: 'full', label: '还款日全额扣' }, { value: 'spread', label: '平摊到每天' }]} />
      <View style={{ marginTop: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        {row.mode === 'full' ? (
          <>
            <Text style={{ fontSize: 13, color: T.muted }}>每月还款日</Text>
            <DayStepper value={row.day} onChange={(d) => onChange({ ...row, day: d })} />
          </>
        ) : (
          <>
            <Text style={{ fontSize: 13, color: T.muted }}>每天自动扣减</Text>
            <Text style={{ fontWeight: '700', fontSize: 17, color: T.over }}>−¥{per.toLocaleString('zh-CN')}<Text style={{ fontSize: 12, fontWeight: '500', color: T.muted }}> /天</Text></Text>
          </>
        )}
      </View>
      <Text style={{ marginTop: 10, fontSize: 12, color: T.faint, lineHeight: 18 }}>
        {row.mode === 'full' ? `每月 ${row.day} 号当天一次性从结余中扣除 ¥${(Number(row.amount) || 0).toLocaleString('zh-CN')}` : `¥${(Number(row.amount) || 0).toLocaleString('zh-CN')} ÷ 30 天，每天均摊计入支出`}
      </Text>
    </View>
  );
}

const LOAN_GLYPHS = ['bank', 'car', 'house', 'cross', 'book', 'plug', 'phone', 'spark'];
const SWATCHES = ['#5E5CE6', '#1C7ED6', '#0A84FF', '#34C759', '#FF9500', '#FF3B30'];

function AddLoanForm({ onAdd }) {
  const [open, setOpen] = useState(false);
  const [d, setD] = useState({ name: '', amount: 0, day: 15, mode: 'full', glyph: 'bank', color: '#5E5CE6' });
  if (!open) {
    return (
      <Pressable onPress={() => setOpen(true)} style={{ borderWidth: 1.5, borderStyle: 'dashed', borderColor: T.hair, borderRadius: T.radius, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
        <Icon name="plus" size={18} sw={2.2} color={T.blue} /><Text style={{ color: T.blue, fontSize: 14.5, fontWeight: '600' }}>添加固定支出（房贷 · 车贷 · 月供）</Text>
      </Pressable>
    );
  }
  const ok = d.name.trim() && d.amount > 0;
  return (
    <View style={{ backgroundColor: T.surface, borderRadius: T.radius, padding: 16, ...shadow }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <View style={{ width: 38, height: 38, borderRadius: 11, backgroundColor: d.color, alignItems: 'center', justifyContent: 'center' }}><Icon name={d.glyph} size={20} sw={2} color="#fff" /></View>
        <TextInput value={d.name} onChangeText={(t) => setD((s) => ({ ...s, name: t }))} placeholder="名称，如「房贷」「车贷」「花呗」" placeholderTextColor={T.faint}
          style={{ flex: 1, backgroundColor: T.surface2, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, color: T.ink }} />
      </View>
      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
        {LOAN_GLYPHS.map((g) => (
          <Pressable key={g} onPress={() => setD((s) => ({ ...s, glyph: g }))} style={{ width: 38, height: 38, borderRadius: 11, backgroundColor: d.glyph === g ? d.color : T.surface2, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name={g} size={18} sw={2} color={d.glyph === g ? '#fff' : T.muted} />
          </Pressable>
        ))}
      </View>
      <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
        {SWATCHES.map((c) => (
          <Pressable key={c} onPress={() => setD((s) => ({ ...s, color: c }))} style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: c, borderWidth: d.color === c ? 2 : 0, borderColor: T.surface }} />
        ))}
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <Text style={{ fontSize: 13.5, color: T.muted }}>月供金额</Text>
        <AmountInput value={d.amount} onChange={(v) => setD((s) => ({ ...s, amount: v }))} w={140} />
      </View>
      <Pressable disabled={!ok} onPress={() => { onAdd({ ...d, id: 'l-' + Date.now(), name: d.name.trim() }); setOpen(false); setD({ name: '', amount: 0, day: 15, mode: 'full', glyph: 'bank', color: '#5E5CE6' }); }}
        style={{ height: 48, borderRadius: 14, backgroundColor: ok ? T.accent : T.surface2, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 15, fontWeight: '600', color: ok ? T.accentInk : T.faint }}>添加</Text>
      </Pressable>
    </View>
  );
}

export function FixedConfigSheet({ open, onClose, config, setConfig }) {
  const c = config;
  const upSalary = (id, next) => setConfig((p) => ({ ...p, salaries: p.salaries.map((s) => (s.id === id ? next : s)) }));
  const upLoan = (id, next) => setConfig((p) => ({ ...p, loans: p.loans.map((l) => (l.id === id ? next : l)) }));
  const rmLoan = (id) => setConfig((p) => ({ ...p, loans: p.loans.filter((l) => l.id !== id) }));
  const addLoan = (l) => setConfig((p) => ({ ...p, loans: [...p.loans, l] }));
  const usedWho = c.salaries.map((s) => s.who);
  const freeMembers = Object.values(MEMBERS).filter((m) => !usedWho.includes(m.id));
  const addSalary = (who) => setConfig((p) => ({ ...p, salaries: [...p.salaries, { id: 's-' + Date.now(), who, amount: 15000 }] }));

  const dIncome = fixedDailyIncome(c);
  const dAmort = fixedDailyAmort(c);
  const dNet = dIncome - dAmort;

  return (
    <Modal visible={open} animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: T.bg }}>
        <View style={fc.nav}>
          <Pressable onPress={onClose} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8 }} hitSlop={8}>
            <Icon name="chevron" size={21} sw={2.4} color={T.blue} style={{ transform: [{ rotate: '180deg' }] }} />
            <Text style={{ color: T.blue, fontSize: 16, fontWeight: '500' }}>我的</Text>
          </Pressable>
          <Text style={fc.navTitle}>工资与还款</Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          {/* 每日自动结算 */}
          <View style={fc.result}>
            <Text style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.62)' }}>每日自动结算</Text>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4, marginTop: 6 }}>
              <Text style={{ fontWeight: '700', fontSize: 36, letterSpacing: -1, color: dNet >= 0 ? T.ok : T.over }}>{dNet >= 0 ? '+' : '−'}¥{Math.abs(dNet).toLocaleString('zh-CN')}</Text>
              <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>/天</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 18, marginTop: 14, paddingTop: 14, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: 'rgba(255,255,255,0.16)' }}>
              <View>
                <Text style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.6)' }}>工资入账</Text>
                <Text style={{ fontWeight: '600', fontSize: 17, marginTop: 3, color: T.ok }}>+¥{dIncome.toLocaleString('zh-CN')}/天</Text>
              </View>
              <View style={{ width: StyleSheet.hairlineWidth, backgroundColor: 'rgba(255,255,255,0.18)' }} />
              <View>
                <Text style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.6)' }}>每日摊还</Text>
                <Text style={{ fontWeight: '600', fontSize: 17, marginTop: 3, color: dAmort ? T.over : 'rgba(255,255,255,0.5)' }}>−¥{dAmort.toLocaleString('zh-CN')}/天</Text>
              </View>
            </View>
          </View>

          {/* 月薪 */}
          <View style={fc.secHead}>
            <Text style={fc.secTitle}>月薪收入</Text>
            <Text style={{ fontSize: 12.5, color: T.muted }}>月入 ¥{fixedMonthlySalary(c).toLocaleString('zh-CN')} · 按 30 天均摊</Text>
          </View>
          <View style={{ backgroundColor: T.surface, borderRadius: T.radius, paddingHorizontal: 16, ...shadow, marginBottom: 12 }}>
            {c.salaries.map((s, i, a) => <SalaryRow key={s.id} row={s} onChange={(n) => upSalary(s.id, n)} last={i === a.length - 1} />)}
          </View>
          {freeMembers.length > 0 && (
            <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
              {freeMembers.map((m) => (
                <Pressable key={m.id} onPress={() => addSalary(m.id)} style={{ borderWidth: 1.5, borderStyle: 'dashed', borderColor: T.hair, borderRadius: 999, paddingVertical: 7, paddingLeft: 7, paddingRight: 13, flexDirection: 'row', alignItems: 'center', gap: 7 }}>
                  <Avatar m={m} size={24} /><Text style={{ fontSize: 13.5, fontWeight: '600', color: T.ink }}>加入 {m.name} 的工资</Text>
                </Pressable>
              ))}
            </View>
          )}

          {/* 还款 */}
          <View style={fc.secHead}>
            <Text style={fc.secTitle}>房贷 · 车贷 · 月供</Text>
            <Text style={{ fontSize: 12.5, color: T.muted }}>月供 ¥{fixedMonthlyLoan(c).toLocaleString('zh-CN')}</Text>
          </View>
          {c.loans.map((l) => <LoanRow key={l.id} row={l} onChange={(n) => upLoan(l.id, n)} onRemove={() => rmLoan(l.id)} />)}
          <AddLoanForm onAdd={addLoan} />

          <View style={{ marginTop: 18, padding: 16, backgroundColor: T.surface2, borderRadius: 14 }}>
            <Text style={{ fontWeight: '600', color: T.ink, marginBottom: 4 }}>自动记账规则</Text>
            <Text style={{ fontSize: 12.5, color: T.muted, lineHeight: 21 }}>· 工资：月薪 ÷ 30，每天自动计入「今日收入」{'\n'}· 还款日全额：到约定日期一次性从结余扣除{'\n'}· 平摊到每天：月供 ÷ 30，每天计一笔</Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const fc = StyleSheet.create({
  stepBtn: { width: 30, height: 30, borderRadius: 9, backgroundColor: T.surface2, alignItems: 'center', justifyContent: 'center' },
  nav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 8, paddingTop: 54, paddingBottom: 8, backgroundColor: T.surface, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: T.hair },
  navTitle: { fontSize: 17, fontWeight: '600', color: T.ink },
  result: { backgroundColor: T.accent, borderRadius: T.radius, padding: 18, marginBottom: 16, ...shadow },
  secHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 2, paddingBottom: 9 },
  secTitle: { fontSize: 17, fontWeight: T.titleWeight, color: T.ink },
});
