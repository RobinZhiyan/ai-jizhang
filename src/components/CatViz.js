// CatViz.js — 分类支出三种可视化：热力树图 / 消费玫瑰 / 资金流向（1:1 移植 cats.jsx）
import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Rect, Text as SvgText } from 'react-native-svg';
import Icon from './Icon';
import { T, shadow } from '../theme';

const polar = (cx, cy, r, deg) => { const a = (deg - 90) * Math.PI / 180; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; };

// squarify 矩形树图布局
function squarify(data, X, Y, W, H) {
  const out = [];
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const items = data.map((d) => ({ ...d, area: (d.value / total) * (W * H) }));
  const rect = { x: X, y: Y, w: W, h: H };
  const side = () => Math.min(rect.w, rect.h);
  const worst = (row, s) => {
    const sum = row.reduce((a, r) => a + r.area, 0);
    const mx = Math.max(...row.map((r) => r.area)), mn = Math.min(...row.map((r) => r.area));
    return Math.max((s * s * mx) / (sum * sum), (sum * sum) / (s * s * mn));
  };
  const lay = (row) => {
    const sum = row.reduce((a, r) => a + r.area, 0);
    if (rect.w <= rect.h) {
      const rh = sum / rect.w; let cx = rect.x;
      row.forEach((r) => { const rw = r.area / rh; out.push({ ...r, x: cx, y: rect.y, w: rw, h: rh }); cx += rw; });
      rect.y += rh; rect.h -= rh;
    } else {
      const rw = sum / rect.h; let cy = rect.y;
      row.forEach((r) => { const rh = r.area / rw; out.push({ ...r, x: rect.x, y: cy, w: rw, h: rh }); cy += rh; });
      rect.x += rw; rect.w -= rw;
    }
  };
  let row = [];
  items.forEach((it) => {
    const s = side();
    if (row.length === 0 || worst(row, s) >= worst([...row, it], s)) row.push(it);
    else { lay(row); row = [it]; }
  });
  if (row.length) lay(row);
  return out;
}

const chip = { backgroundColor: T.surface2, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5, flexDirection: 'row', alignItems: 'center', gap: 5 };
function Zeros({ list, onOpen, top }) {
  if (!list.length) return null;
  return (
    <View style={{ marginTop: 10, paddingTop: top ? 9 : 0, borderTopWidth: top ? StyleSheet.hairlineWidth : 0, borderTopColor: T.hair, flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
      {list.map((c) => (
        <Pressable key={c.id} onPress={() => onOpen(c.id, c.meta)} style={chip}><Icon name={c.meta.glyph} size={12} sw={2} color={T.muted} /><Text style={{ fontSize: 11.5, color: T.muted }}>{c.meta.zh}</Text></Pressable>
      ))}
    </View>
  );
}

// 热力树图
export function CatTreemap({ cats, onOpen }) {
  const [w, setW] = useState(340);
  const H = 240, GAP = 4;
  const nz = cats.filter((c) => c.amount > 0).sort((a, b) => b.amount - a.amount);
  const zeros = cats.filter((c) => c.amount <= 0);
  const rects = nz.length ? squarify(nz.map((c) => ({ id: c.id, meta: c.meta, value: c.amount, amount: c.amount })), 0, 0, w, H) : [];
  return (
    <View>
      <View onLayout={(e) => { const cw = e.nativeEvent.layout.width; if (cw && Math.abs(cw - w) > 1) setW(cw); }} style={{ width: '100%', height: H, borderRadius: T.radius, overflow: 'hidden', backgroundColor: T.surface }}>
        {rects.map((r) => {
          const col = r.meta.color; const showAmt = r.w > 64 && r.h > 52; const showName = r.w > 42 && r.h > 30;
          return (
            <Pressable key={r.id} onPress={() => onOpen(r.id, r.meta)} style={{ position: 'absolute', left: r.x + GAP / 2, top: r.y + GAP / 2, width: Math.max(r.w - GAP, 0), height: Math.max(r.h - GAP, 0), borderRadius: 12, overflow: 'hidden', padding: showName ? 10 : 0, backgroundColor: col, justifyContent: 'space-between' }}>
              {showName ? (
                <>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}><Icon name={r.meta.glyph} size={showAmt ? 17 : 14} sw={2} color="#fff" /><Text style={{ fontSize: showAmt ? 13.5 : 11.5, fontWeight: '600', color: '#fff' }}>{r.meta.zh}</Text></View>
                  {showAmt && <Text style={{ fontSize: r.w > 120 ? 22 : 17, fontWeight: '700', color: '#fff', letterSpacing: -0.5 }}><Text style={{ fontSize: 13, opacity: 0.8 }}>¥</Text>{r.amount.toLocaleString('zh-CN')}</Text>}
                </>
              ) : (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><Icon name={r.meta.glyph} size={15} sw={2} color="#fff" /></View>
              )}
            </Pressable>
          );
        })}
        {!nz.length && <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontSize: 14, color: T.faint }}>暂无支出</Text></View>}
      </View>
      <Zeros list={zeros} onOpen={onOpen} />
    </View>
  );
}

// 消费玫瑰
export function CatRose({ cats, onOpen }) {
  const nz = cats.filter((c) => c.amount > 0).sort((a, b) => b.amount - a.amount);
  const zeros = cats.filter((c) => c.amount <= 0);
  const total = nz.reduce((s, c) => s + c.amount, 0);
  const SZ = 244, cx = SZ / 2, cy = SZ / 2, r0 = 30, rMax = 110;
  const max = Math.max(1, ...nz.map((c) => c.amount));
  const n = Math.max(nz.length, 1);
  const gap = n > 1 ? 4 : 0;
  const step = 360 / n;
  const petal = (i, c) => {
    const r = r0 + Math.sqrt(c.amount / max) * (rMax - r0);
    const a0 = i * step + gap / 2, a1 = (i + 1) * step - gap / 2;
    const [x0o, y0o] = polar(cx, cy, r, a0), [x1o, y1o] = polar(cx, cy, r, a1);
    const [x0i, y0i] = polar(cx, cy, r0, a0), [x1i, y1i] = polar(cx, cy, r0, a1);
    const large = (a1 - a0) > 180 ? 1 : 0;
    const d = `M${x0i} ${y0i} L${x0o} ${y0o} A${r} ${r} 0 ${large} 1 ${x1o} ${y1o} L${x1i} ${y1i} A${r0} ${r0} 0 ${large} 0 ${x0i} ${y0i} Z`;
    const [tx, ty] = polar(cx, cy, r + 13, (a0 + a1) / 2);
    return { d, tx, ty };
  };
  const petals = nz.map((c, i) => ({ c, p: petal(i, c) }));
  return (
    <View style={{ backgroundColor: T.surface, borderRadius: T.radius, padding: 14, ...shadow }}>
      <View style={{ width: SZ, height: SZ, alignSelf: 'center' }}>
        <Svg width={SZ} height={SZ}>
          {[0.5, 0.78, 1].map((f, i) => <Circle key={i} cx={cx} cy={cy} r={r0 + f * (rMax - r0)} fill="none" stroke={T.hair} strokeWidth={1} strokeDasharray="2 4" />)}
          {petals.map(({ c, p }) => <Path key={c.id} d={p.d} fill={c.meta.color} fillOpacity={0.88} stroke={T.surface} strokeWidth={1.5} onPress={() => onOpen(c.id, c.meta)} />)}
        </Svg>
        {/* 花瓣图标叠加 */}
        {petals.map(({ c, p }) => (
          <View key={'i' + c.id} pointerEvents="none" style={{ position: 'absolute', left: p.tx - 8, top: p.ty - 8 }}><Icon name={c.meta.glyph} size={16} sw={2} color={c.meta.color} /></View>
        ))}
        {/* 中心合计 */}
        <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 10.5, color: T.muted }}>合计</Text>
          <Text style={{ fontWeight: '700', fontSize: 18, color: T.ink, letterSpacing: -0.6 }}><Text style={{ fontSize: 11, opacity: 0.7 }}>¥</Text>{total.toLocaleString('zh-CN')}</Text>
        </View>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 }}>
        {nz.map((c) => (
          <Pressable key={c.id} onPress={() => onOpen(c.id, c.meta)} style={{ width: '50%', flexDirection: 'row', alignItems: 'center', gap: 7, paddingVertical: 3 }}>
            <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: c.meta.color }} />
            <Text style={{ flex: 1, fontSize: 13, color: T.ink }} numberOfLines={1}>{c.meta.zh}</Text>
            <Text style={{ fontSize: 13, fontWeight: '700', color: T.ink, marginRight: 12 }}>¥{c.amount.toLocaleString('zh-CN')}</Text>
          </Pressable>
        ))}
      </View>
      <Zeros list={zeros} onOpen={onOpen} top />
    </View>
  );
}

// 资金流向（桑基）
export function CatSankey({ cats, onOpen }) {
  const nz = cats.filter((c) => c.amount > 0).sort((a, b) => b.amount - a.amount);
  const zeros = cats.filter((c) => c.amount <= 0);
  const total = nz.reduce((s, c) => s + c.amount, 0) || 1;
  const VW = 340, padT = 18, padB = 14, srcX = 0, srcW = 13, nodeX = 150, nodeW = 11, midX = 80;
  const rowH = 40, H = Math.max(186, nz.length * rowH + padT + padB);
  const innerH = H - padT - padB, gap = nz.length > 1 ? 6 : 0;
  const usableH = innerH - gap * (nz.length - 1);
  let sy = padT, ty = padT;
  const bands = nz.map((c) => {
    const h = (c.amount / total) * usableH;
    const b = { id: c.id, meta: c.meta, amount: c.amount, sy0: sy, sy1: sy + h, ty0: ty, ty1: ty + Math.max(h, 6) };
    sy += h + gap; ty += Math.max(h, 6) + gap;
    return b;
  });
  return (
    <View style={{ backgroundColor: T.surface, borderRadius: T.radius, padding: 14, ...shadow }}>
      <Svg width="100%" height={H} viewBox={`0 0 ${VW} ${H}`}>
        <Rect x={srcX} y={padT} width={srcW} height={innerH} rx={5} fill={T.accent} />
        {bands.map((b) => {
          const d = `M${srcX + srcW} ${b.sy0} C${midX} ${b.sy0} ${midX} ${b.ty0} ${nodeX} ${b.ty0} L${nodeX} ${b.ty1} C${midX} ${b.ty1} ${midX} ${b.sy1} ${srcX + srcW} ${b.sy1} Z`;
          return <Path key={b.id} d={d} fill={b.meta.color} fillOpacity={0.42} />;
        })}
        {bands.map((b) => (
          <React.Fragment key={'n' + b.id}>
            <Rect x={nodeX} y={b.ty0} width={nodeW} height={Math.max(b.ty1 - b.ty0, 6)} rx={3} fill={b.meta.color} onPress={() => onOpen(b.id, b.meta)} />
            <SvgText x={nodeX + nodeW + 9} y={(b.ty0 + b.ty1) / 2 - 2} fontSize={13} fontWeight="600" fill={T.ink} onPress={() => onOpen(b.id, b.meta)}>{b.meta.zh}</SvgText>
            <SvgText x={nodeX + nodeW + 9} y={(b.ty0 + b.ty1) / 2 + 13} fontSize={11.5} fill={T.muted}>{`¥${b.amount.toLocaleString('zh-CN')} · ${Math.round(b.amount / total * 100)}%`}</SvgText>
          </React.Fragment>
        ))}
        <SvgText x={srcX} y={padT - 5} fontSize={11} fill={T.muted}>{`总支出 ¥${total.toLocaleString('zh-CN')}`}</SvgText>
        {!nz.length && <SvgText x={VW / 2} y={H / 2} textAnchor="middle" fontSize={14} fill={T.faint}>暂无支出</SvgText>}
      </Svg>
      <Zeros list={zeros} onOpen={onOpen} top />
    </View>
  );
}
