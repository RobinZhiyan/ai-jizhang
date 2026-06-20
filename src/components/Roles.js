// Roles.js — 家庭成员角色权限（管理员 / 保姆视角）1:1 移植 roles.jsx
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Icon from './Icon';
import { Avatar, Sheet } from './ui';
import { T, shadow } from '../theme';
import { MEMBERS } from '../data';

export const HELPER = { id: 'helper', name: '阿姨', en: 'Helper', initial: '阿', color: '#8E8E93' };
export const ADMIN_PERMS = { seeIncome: true, seeBalance: true, seeGoal: true, seeAnalysis: true, seeBudget: true, recordIncome: true, admin: true };
export const PERM_DEFAULT = { seeIncome: false, seeBalance: false, seeGoal: false, seeAnalysis: false, seeBudget: false };
export const PERM_FIELDS = [
  { key: 'seeIncome', label: '今日收入', sub: '家庭收入金额与明细', glyph: 'income' },
  { key: 'seeBalance', label: '本月结余', sub: '家庭整体结余', glyph: 'wallet' },
  { key: 'seeGoal', label: '攒钱小目标', sub: '目标进度与金额', glyph: 'target' },
  { key: 'seeAnalysis', label: '数据分析', sub: '收支趋势报表', glyph: 'chart' },
  { key: 'seeBudget', label: '预算管理', sub: '分类预算', glyph: 'pie' },
];
export const permsFor = (viewRole, hp) => (viewRole === 'helper' ? { ...PERM_DEFAULT, ...hp, recordIncome: false, admin: false } : ADMIN_PERMS);

function RToggle({ on, onChange }) {
  return (
    <Pressable onPress={() => onChange(!on)} style={{ width: 48, height: 29, borderRadius: 15, backgroundColor: on ? T.ok : T.track, justifyContent: 'center' }}>
      <View style={{ position: 'absolute', top: 3, left: on ? 22 : 3, width: 23, height: 23, borderRadius: 12, backgroundColor: '#fff', ...shadow, shadowOpacity: 0.3, shadowRadius: 3 }} />
    </Pressable>
  );
}

// 顶部「视角」切换浮层
export function RoleSwitchSheet({ open, onClose, viewRole, onPick }) {
  const rows = [
    { id: 'admin', m: MEMBERS.dad, name: '管理员（我）', sub: '可见并管理全部数据' },
    { id: 'helper', m: HELPER, name: '保姆 · 阿姨', sub: '仅记账与查看今日支出' },
  ];
  return (
    <Sheet open={open} onClose={onClose} title="切换使用账号">
      <View style={{ gap: 10 }}>
        {rows.map((r) => {
          const on = r.id === viewRole;
          return (
            <Pressable key={r.id} onPress={() => onPick(r.id)} style={{ flexDirection: 'row', alignItems: 'center', gap: 13, borderWidth: 1.5, borderColor: on ? T.ink : 'transparent', backgroundColor: T.surface, borderRadius: T.radius, paddingVertical: 14, paddingHorizontal: 16, ...shadow }}>
              <Avatar m={r.m} size={42} />
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: T.ink }}>{r.name}</Text>
                <Text style={{ fontSize: 12.5, color: T.muted, marginTop: 2 }}>{r.sub}</Text>
              </View>
              {on ? <Text style={{ fontSize: 12.5, fontWeight: '600', color: T.ok }}>当前</Text> : <Text style={{ fontSize: 12.5, fontWeight: '600', color: T.blue }}>进入</Text>}
            </Pressable>
          );
        })}
      </View>
      <View style={{ marginTop: 14, paddingVertical: 12, paddingHorizontal: 14, backgroundColor: T.surface2, borderRadius: 14 }}>
        <Text style={{ fontSize: 12.5, color: T.muted, lineHeight: 20 }}>切换到阿姨账号后，界面只保留她可用的部分：记一笔支出、查看今日支出。家庭收入、结余、小目标等核心数据按你在「我的 → 成员权限」的设置隐藏，保存后即时生效。</Text>
      </View>
    </Sheet>
  );
}

// 保姆视角横幅
export function HelperBanner({ onExit }) {
  return (
    <Pressable onPress={onExit} style={hb.banner}>
      <Avatar m={HELPER} size={24} />
      <View style={{ flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'baseline' }}>
        <Text style={{ fontSize: 13.5, fontWeight: '700', color: '#fff' }}>当前 · 保姆 阿姨</Text>
        <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.9)', marginLeft: 8 }}>仅可记一笔支出</Text>
      </View>
      <Text style={{ fontSize: 12.5, fontWeight: '700', color: '#fff' }}>切回管理员 ›</Text>
    </Pressable>
  );
}

// 成员权限配置（管理员）
export function PermConfigSheet({ open, onClose, perms, setPerms }) {
  const set = (k, v) => setPerms((p) => ({ ...p, [k]: v }));
  const openCount = PERM_FIELDS.filter((f) => perms[f.key]).length;
  return (
    <Sheet open={open} onClose={onClose} title="成员权限 · 保姆 阿姨">
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 13, backgroundColor: T.surface, borderRadius: T.radius, paddingVertical: 14, paddingHorizontal: 16, ...shadow, marginBottom: 14 }}>
        <Avatar m={HELPER} size={44} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: T.ink }}>阿姨</Text>
          <Text style={{ fontSize: 12.5, color: T.muted, marginTop: 2 }}>保姆 · 仅记账成员</Text>
        </View>
        <Text style={{ fontSize: 12, color: T.muted }}>开放 {openCount}/{PERM_FIELDS.length}</Text>
      </View>

      <Text style={hb.group}>始终允许</Text>
      <View style={{ backgroundColor: T.surface, borderRadius: T.radius, paddingHorizontal: 16, ...shadow, marginBottom: 16 }}>
        {[{ l: '语音记一笔支出', g: 'mic' }, { l: '查看今日支出', g: 'income' }].map((r, i) => (
          <View key={r.l} style={[{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13 }, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: T.hair }]}>
            <View style={{ width: 32, height: 32, borderRadius: 9, backgroundColor: T.surface2, alignItems: 'center', justifyContent: 'center' }}><Icon name={r.g} size={18} sw={2} color={T.ink} /></View>
            <Text style={{ flex: 1, fontSize: 15, color: T.ink }}>{r.l}</Text>
            <Text style={{ fontSize: 12.5, color: T.ok, fontWeight: '600' }}>已开放</Text>
          </View>
        ))}
      </View>

      <Text style={hb.group}>核心数据（默认隐藏）</Text>
      <View style={{ backgroundColor: T.surface, borderRadius: T.radius, paddingHorizontal: 16, ...shadow }}>
        {PERM_FIELDS.map((f, i) => (
          <View key={f.key} style={[{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13 }, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: T.hair }]}>
            <View style={{ width: 32, height: 32, borderRadius: 9, backgroundColor: perms[f.key] ? T.ok : T.surface2, alignItems: 'center', justifyContent: 'center' }}><Icon name={f.glyph} size={18} sw={2} color={perms[f.key] ? '#fff' : T.faint} /></View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={{ fontSize: 15, color: T.ink }}>{f.label}</Text>
              <Text style={{ fontSize: 12, color: T.faint, marginTop: 1 }}>{f.sub}</Text>
            </View>
            <RToggle on={!!perms[f.key]} onChange={(v) => set(f.key, v)} />
          </View>
        ))}
      </View>
      <Text style={{ marginTop: 14, fontSize: 12, color: T.faint, lineHeight: 19, paddingHorizontal: 2 }}>关闭的项目，阿姨在她账号里完全看不到；打开后她也能查看对应数据。保存后阿姨端立即生效，可点右上角头像切到阿姨账号确认。</Text>
    </Sheet>
  );
}

const hb = StyleSheet.create({
  banner: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 120, backgroundColor: '#E8920A', flexDirection: 'row', alignItems: 'center', gap: 9, paddingHorizontal: 16, paddingTop: 10, paddingBottom: 9 },
  group: { paddingHorizontal: 2, paddingBottom: 8, fontSize: 13, fontWeight: '600', color: T.muted },
});
