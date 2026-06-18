// ui.js — 通用组件：Card / ProgressBar / Avatar / Segmented / Pill
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { T, shadow } from '../theme';

export function Card({ children, style, pad = 16 }) {
  return <View style={[s.card, { padding: pad }, style]}>{children}</View>;
}

export function ProgressBar({ p, color = T.blue, height = 6 }) {
  return (
    <View style={[s.track, { height, borderRadius: height / 2 }]}>
      <View style={{ width: `${Math.min(p, 1) * 100}%`, height: '100%', borderRadius: height / 2, backgroundColor: color }} />
    </View>
  );
}

export function Avatar({ member, size = 34 }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: member.color, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: '#fff', fontWeight: '700', fontSize: size * 0.42 }}>{member.initial}</Text>
    </View>
  );
}

export function Segmented({ options, value, onChange }) {
  return (
    <View style={s.seg}>
      {options.map((o) => {
        const active = o.key === value;
        return (
          <Pressable key={o.key} onPress={() => onChange(o.key)} style={[s.segItem, active && s.segItemActive]}>
            <Text style={[s.segText, active && s.segTextActive]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Pill({ label, color = T.ok, bg }) {
  return (
    <View style={{ backgroundColor: bg || color + '22', borderRadius: 999, paddingHorizontal: 9, paddingVertical: 3 }}>
      <Text style={{ color, fontSize: 11.5, fontWeight: '700' }}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  card: { backgroundColor: T.surface, borderRadius: T.radius, ...shadow },
  track: { backgroundColor: T.track, overflow: 'hidden', width: '100%' },
  seg: { flexDirection: 'row', backgroundColor: '#E4E4EA', borderRadius: 9, padding: 3 },
  segItem: { paddingHorizontal: 13, paddingVertical: 5, borderRadius: 7 },
  segItemActive: { backgroundColor: '#fff', ...shadow, shadowOpacity: 0.12, shadowRadius: 3, elevation: 1 },
  segText: { fontSize: 13.5, fontWeight: '600', color: T.muted },
  segTextActive: { color: T.ink },
});
