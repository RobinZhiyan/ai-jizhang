// ProfileScreen.js — 我的：成员权限 + 设置入口
import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '../components/Icon';
import { Card, Avatar, Pill } from '../components/ui';
import { T } from '../theme';
import { MEMBERS, ROLE_LABEL } from '../data';

const SETTINGS = [
  { icon: 'wallet', label: '固定收支', sub: '工资 · 房贷 · 车贷' },
  { icon: 'calendar', label: '月度 AI 报表', sub: '省钱建议 · 目标提速' },
  { icon: 'sliders', label: '分类管理', sub: '自定义类目' },
  { icon: 'users', label: '成员与权限', sub: '家人 · 保姆阿姨' },
];

export default function ProfileScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: T.bg }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <Text style={ps.title}>我的</Text>

        <Card style={{ marginTop: 14 }} pad={0}>
          {Object.values(MEMBERS).map((m, i) => (
            <View key={m.id} style={[ps.member, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: T.hair }]}>
              <Avatar member={m} size={42} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={ps.memberName}>{m.name}</Text>
                <Text style={ps.memberSub}>{m.id === 'dad' ? '我' : m.id === 'mom' ? '家人' : '孩子'}</Text>
              </View>
              <Pill label={ROLE_LABEL[m.role]} color={m.role === 'admin' ? T.ok : T.muted} bg={m.role === 'admin' ? T.ok + '22' : T.surface2} />
            </View>
          ))}
        </Card>

        <Card style={{ marginTop: 16 }} pad={0}>
          {SETTINGS.map((it, i) => (
            <Pressable key={it.label} style={[ps.setting, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: T.hair }]}>
              <View style={ps.settingIcon}><Icon name={it.icon} size={20} color={T.ink} sw={1.9} /></View>
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
    </SafeAreaView>
  );
}

const ps = StyleSheet.create({
  title: { fontSize: 26, fontWeight: '800', color: T.ink },
  member: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  memberName: { fontSize: 16, fontWeight: '600', color: T.ink },
  memberSub: { fontSize: 12.5, color: T.muted, marginTop: 2 },
  setting: { flexDirection: 'row', alignItems: 'center', padding: 15 },
  settingIcon: { width: 38, height: 38, borderRadius: 11, backgroundColor: T.surface2, alignItems: 'center', justifyContent: 'center' },
  settingLabel: { fontSize: 15.5, fontWeight: '500', color: T.ink },
  settingSub: { fontSize: 12, color: T.faint, marginTop: 1 },
  foot: { textAlign: 'center', fontSize: 12, color: T.faint, marginTop: 26 },
});
