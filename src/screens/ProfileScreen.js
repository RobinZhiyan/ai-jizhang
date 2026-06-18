// ProfileScreen.js — 我的（协同成员 + 设置入口）M1 移植 profile.jsx
import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import Icon from '../components/Icon';
import { Card, Avatar, Pill } from '../components/ui';
import { T } from '../theme';
import { MEMBERS, ROLE_LABEL } from '../data';

const SETTINGS = [
  { icon: 'target', label: '我的小目标', sub: '储蓄目标 · 攒钱进度', goal: true },
  { icon: 'wallet', label: '固定收支', sub: '工资 · 房贷 · 车贷', fixed: true },
  { icon: 'calendar', label: '月度 AI 报表', sub: '省钱建议 · 目标提速' },
  { icon: 'sliders', label: '分类管理', sub: '自定义类目' },
  { icon: 'users', label: '成员与权限', sub: '家人 · 保姆阿姨' },
];

export default function ProfileScreen({ onOpenGoal, onOpenFixed }) {
  return (
    <View style={{ flex: 1, backgroundColor: T.bg }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 30 }} showsVerticalScrollIndicator={false}>
        <Text style={ps.title}>我的</Text>

        <Card style={{ marginTop: 14 }} pad={0}>
          {Object.values(MEMBERS).map((m, i) => (
            <View key={m.id} style={[ps.member, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: T.hair }]}>
              <Avatar m={m} size={42} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={ps.name}>{m.name}</Text>
                <Text style={ps.sub}>{m.id === 'dad' ? '我' : m.id === 'mom' ? '家人' : '孩子'}</Text>
              </View>
              <Pill color={m.role === 'admin' ? T.ok : T.muted} bg={m.role === 'admin' ? T.ok + '22' : T.surface2}>{ROLE_LABEL[m.role]}</Pill>
            </View>
          ))}
        </Card>

        <Card style={{ marginTop: 16 }} pad={0}>
          {SETTINGS.map((it, i) => (
            <Pressable key={it.label} onPress={it.goal ? onOpenGoal : it.fixed ? onOpenFixed : undefined} style={[ps.setting, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: T.hair }]}>
              <View style={ps.settingIcon}><Icon name={it.icon} size={20} sw={1.9} color={T.ink} /></View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={ps.settingLabel}>{it.label}</Text>
                <Text style={ps.settingSub}>{it.sub}</Text>
              </View>
              <Icon name="chevron" size={18} color={T.faint} />
            </Pressable>
          ))}
        </Card>

        <Text style={ps.foot}>声记 · AI记账 · v1.0</Text>
      </ScrollView>
    </View>
  );
}

const ps = StyleSheet.create({
  title: { fontSize: 26, fontWeight: '800', color: T.ink },
  member: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  name: { fontSize: 16, fontWeight: '600', color: T.ink },
  sub: { fontSize: 12.5, color: T.muted, marginTop: 2 },
  setting: { flexDirection: 'row', alignItems: 'center', padding: 15 },
  settingIcon: { width: 38, height: 38, borderRadius: 11, backgroundColor: T.surface2, alignItems: 'center', justifyContent: 'center' },
  settingLabel: { fontSize: 15.5, fontWeight: '500', color: T.ink },
  settingSub: { fontSize: 12, color: T.faint, marginTop: 1 },
  foot: { textAlign: 'center', fontSize: 12, color: T.faint, marginTop: 26 },
});
