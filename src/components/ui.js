// ui.js — 共享 UI 组件（从 HTML 版 ui.jsx 1:1 移植到 RN）
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Modal } from 'react-native';
import Svg, { Circle, Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import Icon from './Icon';
import { T, shadow, shadowSm } from '../theme';
import { catMeta, yuan, pct, budgetState, stateColor } from '../data';

// 分类彩色图标块
export function CatIcon({ cat, size = 38, radius }) {
  const c = catMeta(cat);
  return (
    <View style={{
      width: size, height: size, borderRadius: radius != null ? radius : size * 0.29,
      backgroundColor: c.color, alignItems: 'center', justifyContent: 'center',
      shadowColor: c.color, shadowOpacity: 0.33, shadowRadius: 6, shadowOffset: { width: 0, height: 2 },
    }}>
      <Icon name={c.glyph} size={size * 0.55} sw={2} color="#fff" />
    </View>
  );
}

export function Avatar({ m, size = 32, ring }) {
  return (
    <View style={{
      width: size, height: size, borderRadius: size / 2, backgroundColor: m.color,
      alignItems: 'center', justifyContent: 'center',
      ...(ring ? { borderWidth: 2, borderColor: T.surface } : null),
    }}>
      <Text style={{ color: '#fff', fontWeight: '600', fontSize: size * 0.42 }}>{m.initial}</Text>
    </View>
  );
}

// 金额：整数大字 + ¥小字（支持正负号）
export function Money({ value, size = 34, weight = T.numWeight, color = T.ink, sign = false }) {
  const neg = value < 0;
  const s = Math.abs(value).toLocaleString('zh-CN');
  return (
    <Text style={{ color, fontWeight: weight, letterSpacing: -0.5 }}>
      <Text style={{ fontSize: size * 0.62, opacity: 0.85 }}>{sign && !neg ? '+' : neg ? '−' : ''}¥</Text>
      <Text style={{ fontSize: size, fontWeight: weight }}>{s}</Text>
    </Text>
  );
}

export function Card({ children, style, pad = 18, onPress }) {
  const inner = (
    <View style={[{ backgroundColor: T.surface, borderRadius: T.radius, padding: pad, ...shadow }, style]}>
      {children}
    </View>
  );
  return onPress ? <Pressable onPress={onPress}>{inner}</Pressable> : inner;
}

// 进度条
export function Bar({ p, color = T.blue, track = T.track, h = 8, r }) {
  const w = Math.min(Math.max(p, 0), 1) * 100;
  return (
    <View style={{ height: h, borderRadius: r || h / 2, backgroundColor: track, overflow: 'hidden', width: '100%' }}>
      <View style={{ height: '100%', width: `${w}%`, borderRadius: r || h / 2, backgroundColor: color }} />
    </View>
  );
}

export function Pill({ children, color = T.muted, bg }) {
  return (
    <View style={{ backgroundColor: bg || T.surface2, borderRadius: 7, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start' }}>
      <Text style={{ color, fontSize: 11.5, fontWeight: '600' }}>{children}</Text>
    </View>
  );
}

// iOS 分段控件
export function Segmented({ options, value, onChange, small }) {
  return (
    <View style={{ flexDirection: 'row', backgroundColor: T.track, borderRadius: 11, padding: 2, gap: 2 }}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable key={o.value} onPress={() => onChange(o.value)} style={{
            flex: 1, borderRadius: 9, paddingVertical: small ? 6 : 8, paddingHorizontal: small ? 8 : 10, alignItems: 'center',
            backgroundColor: active ? T.surface : 'transparent', ...(active ? shadowSm : null),
          }}>
            <Text style={{ fontSize: small ? 13 : 14, fontWeight: active ? '600' : '500', color: active ? T.ink : T.muted }}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// 区间切换（今天 / 本周 / 本月）
export function RangeTabs({ value, onChange, options }) {
  const opts = options || [{ v: 'today', t: '今天' }, { v: 'week', t: '本周' }, { v: 'month', t: '本月' }];
  return (
    <View style={{ flexDirection: 'row', gap: 6, backgroundColor: T.surface2, borderRadius: 12, padding: 3 }}>
      {opts.map((o) => {
        const on = o.v === value;
        return (
          <Pressable key={o.v} onPress={() => onChange(o.v)} style={{
            flex: 1, borderRadius: 9, paddingVertical: 5, alignItems: 'center',
            backgroundColor: on ? T.surface : 'transparent', ...(on ? shadowSm : null),
          }}>
            <Text style={{ fontSize: 13.5, fontWeight: on ? '700' : '500', color: on ? T.ink : T.muted }}>{o.t}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function SectionTitle({ children, action, onAction }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 2, paddingBottom: 10 }}>
      <Text style={{ fontSize: 19, fontWeight: T.titleWeight, color: T.ink, letterSpacing: T.titleSpacing }}>{children}</Text>
      {action ? <Pressable onPress={onAction}><Text style={{ color: T.blue, fontSize: 14, fontWeight: '500' }}>{action}</Text></Pressable> : null}
    </View>
  );
}

// 底部弹层（createPortal → Modal）
export function Sheet({ open, onClose, children, title }) {
  return (
    <Modal visible={!!open} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.32)', justifyContent: 'flex-end' }} onPress={onClose}>
        <Pressable style={{ backgroundColor: T.bg, borderTopLeftRadius: 26, borderTopRightRadius: 26, paddingHorizontal: 16, paddingTop: 10, paddingBottom: 34, maxHeight: '82%' }} onPress={() => {}}>
          <View style={{ width: 38, height: 5, borderRadius: 3, backgroundColor: T.track, alignSelf: 'center', marginVertical: 8 }} />
          {title ? <Text style={{ fontSize: 22, fontWeight: T.titleWeight, color: T.ink, paddingHorizontal: 4, paddingBottom: 14, letterSpacing: T.titleSpacing }}>{title}</Text> : null}
          {children}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// 预算核心可视化：大百分比 + 进度条 + 余额
export function BudgetMeter({ spent, budget, label, period = '本月', big = true }) {
  const p = pct(spent, budget);
  const st = budgetState(p);
  const col = stateColor(st);
  const remain = budget - spent;
  const pctNum = Math.round(p * 100);
  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 12 }}>
        <View>
          {label ? <Text style={{ fontSize: 13, color: T.muted, marginBottom: 4 }}>{label}</Text> : null}
          <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
            <Text style={{ fontWeight: T.numWeight, fontSize: big ? 52 : 34, color: col, letterSpacing: -1.5, lineHeight: big ? 54 : 36 }}>{pctNum}</Text>
            <Text style={{ fontSize: big ? 22 : 16, fontWeight: '600', color: col, marginBottom: big ? 6 : 4 }}>%</Text>
          </View>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ fontSize: 12, color: T.faint }}>{st === 'over' ? '已超支' : `${period}剩余`}</Text>
          <View style={{ marginTop: 2 }}>
            <Money value={Math.abs(remain)} size={20} color={st === 'over' ? T.over : T.ink} />
          </View>
        </View>
      </View>
      <Bar p={p} color={col} h={10} />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
        <Text style={{ fontSize: 12.5, color: T.muted }}>已花 {yuan(spent)}</Text>
        <Text style={{ fontSize: 12.5, color: T.muted }}>预算 {yuan(budget)}</Text>
      </View>
    </View>
  );
}

// 环形图（分类占比）
export function Donut({ data, size = 168, stroke = 22, gap = 0.012, children }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  let acc = 0;
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
        <Circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={T.track} strokeWidth={stroke} />
        {data.map((d, i) => {
          const frac = d.value / total;
          const len = Math.max(frac - gap, 0) * c;
          const off = acc * c;
          acc += frac;
          return (
            <Circle key={i} cx={size / 2} cy={size / 2} r={r} fill="none" stroke={d.color} strokeWidth={stroke}
              strokeLinecap="round" strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-off} />
          );
        })}
      </Svg>
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>{children}</View>
    </View>
  );
}

// 折线 / 面积图
export function LineChart({ values, width = 320, height = 96, color = T.ink, accent }) {
  const max = Math.max(...values, 1);
  const n = values.length;
  const pad = 4;
  const X = (i) => pad + (i / (n - 1)) * (width - pad * 2);
  const Y = (v) => height - pad - (v / max) * (height - pad * 2);
  const uid = useRef('lg' + Math.round(Math.abs(Math.sin(values.length) * 1e6))).current;
  const line = values.map((v, i) => `${i === 0 ? 'M' : 'L'}${X(i).toFixed(1)} ${Y(v).toFixed(1)}`).join(' ');
  const area = `${line} L${X(n - 1).toFixed(1)} ${height - pad} L${X(0).toFixed(1)} ${height - pad} Z`;
  const stroke = accent || color;
  return (
    <Svg width={width} height={height}>
      <Defs>
        <LinearGradient id={uid} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor={stroke} stopOpacity="0.18" />
          <Stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </LinearGradient>
      </Defs>
      <Path d={area} fill={`url(#${uid})`} />
      <Path d={line} fill="none" stroke={stroke} strokeWidth={2.4} strokeLinejoin="round" strokeLinecap="round" />
      <Circle cx={X(n - 1)} cy={Y(values[n - 1])} r={4} fill={stroke} />
    </Svg>
  );
}

// 数字滚动缓动（requestAnimationFrame，ease-out cubic）
export function useCountUp(value, dur = 600) {
  const [d, setD] = useState(value);
  const ref = useRef(value);
  useEffect(() => {
    const from = ref.current, to = value;
    if (from === to) return;
    const t0 = Date.now();
    let raf;
    const tick = () => {
      const k = Math.min(1, (Date.now() - t0) / dur);
      const e = 1 - Math.pow(1 - k, 3);
      setD(Math.round(from + (to - from) * e));
      if (k < 1) raf = requestAnimationFrame(tick);
      else ref.current = to;
    };
    raf = requestAnimationFrame(tick);
    return () => { if (raf) cancelAnimationFrame(raf); };
  }, [value]);
  return d;
}

// ── 分类方格（居中 / 左对齐 / 横排 三态）──────────────────────
export function CatTile({ id, amount, budget, badge, meta, onPress, compact, tileStyle = 'centered' }) {
  const c = meta || catMeta(id);
  const zero = amount === 0;
  const bp = budget ? Math.min(amount / budget, 1) : 0;
  const over = budget && amount > budget;
  const numStr = amount.toLocaleString('zh-CN');
  const iconCol = zero ? T.faint : c.color;
  const chipBg = zero ? T.track : c.color + '1F';
  const amtCol = zero ? T.faint : T.ink;

  const Chip = ({ sz, ic }) => (
    <View style={{ width: sz, height: sz, borderRadius: 10, backgroundColor: chipBg, alignItems: 'center', justifyContent: 'center' }}>
      <Icon name={c.glyph} size={ic} sw={2} color={iconCol} />
    </View>
  );
  const base = { position: 'relative', backgroundColor: T.tile, borderRadius: T.radiusSm, width: '100%', overflow: 'hidden', ...shadow };
  const badgeEl = badge != null ? (
    <View style={{ position: 'absolute', top: 8, right: 8, backgroundColor: T.flash, borderRadius: 8, paddingHorizontal: 7, paddingVertical: 3 }}>
      <Text style={{ color: '#fff', fontSize: 11.5, fontWeight: '700' }}>+¥{badge}</Text>
    </View>
  ) : null;

  if (tileStyle === 'row') {
    const amtFont = numStr.length >= 7 ? 14 : numStr.length >= 6 ? 16 : numStr.length >= 5 ? 17 : 19;
    return (
      <Pressable onPress={onPress} style={[base, { paddingVertical: 12, paddingHorizontal: 9, flexDirection: 'row', alignItems: 'center', gap: 9, minHeight: 64 }]}>
        <Chip sz={compact ? 30 : 34} ic={compact ? 17 : 19} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text numberOfLines={1} style={{ fontSize: 12, color: T.tileMuted, fontWeight: '500' }}>{c.zh}</Text>
          <Text numberOfLines={1} style={{ marginTop: 5, fontSize: amtFont, fontWeight: T.numWeight, color: amtCol, letterSpacing: -0.5 }}>
            <Text style={{ fontSize: amtFont * 0.66, opacity: 0.7 }}>¥</Text>{numStr}
          </Text>
          {budget ? <View style={{ marginTop: 7 }}><Bar p={bp} color={over ? T.over : T.ok} h={4} /></View> : null}
        </View>
        {badgeEl}
      </Pressable>
    );
  }
  if (tileStyle === 'left') {
    const amtFont = (numStr.length >= 8 ? 16 : numStr.length >= 7 ? 18 : numStr.length >= 6 ? 20 : numStr.length >= 5 ? 22 : 24) - (compact ? 1 : 0);
    return (
      <Pressable onPress={onPress} style={[base, { padding: compact ? 11 : 13, alignItems: 'flex-start' }]}>
        <Chip sz={compact ? 30 : 34} ic={compact ? 17 : 19} />
        <Text numberOfLines={1} style={{ marginTop: compact ? 9 : 11, fontSize: 12.5, color: T.tileMuted, fontWeight: '500' }}>{c.zh}</Text>
        <Text numberOfLines={1} style={{ marginTop: 4, fontSize: amtFont, fontWeight: T.numWeight, color: amtCol, letterSpacing: -0.8 }}>
          <Text style={{ fontSize: amtFont * 0.6, opacity: 0.7 }}>¥</Text>{numStr}
        </Text>
        {budget ? <View style={{ marginTop: compact ? 8 : 9, width: '100%' }}><Bar p={bp} color={over ? T.over : T.ok} h={4} /></View> : null}
        {badgeEl}
      </Pressable>
    );
  }
  // 居中（默认）
  const amtFont = (numStr.length >= 8 ? 13 : numStr.length >= 7 ? 15 : numStr.length >= 6 ? 17 : numStr.length >= 5 ? 18 : 20) - (compact ? 1 : 0);
  return (
    <Pressable onPress={onPress} style={[base, { paddingVertical: compact ? 9 : 13, paddingHorizontal: 8, alignItems: 'center' }]}>
      <Chip sz={compact ? 30 : 34} ic={compact ? 17 : 19} />
      <Text numberOfLines={1} style={{ marginTop: compact ? 6 : 8, fontSize: 12.5, color: T.tileMuted, fontWeight: '500' }}>{c.zh}</Text>
      <Text numberOfLines={1} style={{ marginTop: compact ? 4 : 5, fontSize: amtFont, fontWeight: T.numWeight, color: amtCol, letterSpacing: -0.5 }}>
        <Text style={{ fontSize: amtFont * 0.66, opacity: 0.7 }}>¥</Text>{numStr}
      </Text>
      {budget ? <View style={{ marginTop: compact ? 6 : 8, width: '74%' }}><Bar p={bp} color={over ? T.over : T.ok} h={4} /></View> : null}
      {badgeEl}
    </Pressable>
  );
}
