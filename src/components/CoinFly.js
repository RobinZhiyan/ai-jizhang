// CoinFly.js — 金币入袋飞行 + 落定粒子爆发（1:1 移植 income.jsx 的 IncomeCoinLayer，Animated 实现）
import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Easing } from 'react-native';

const GOLD = '#FFB020', GOLD_DK = '#E8920A', RED = '#FF3B30', RED_DK = '#D70015';

export function CoinFly({ kind = 'gain', onLand, onDone }) {
  const loss = kind === 'loss';
  const c = loss ? RED : GOLD;
  const dk = loss ? RED_DK : GOLD_DK;
  const fly = useRef(new Animated.Value(0)).current;
  const burst = useRef(new Animated.Value(0)).current;
  const parts = useRef(
    Array.from({ length: 18 }, (_, i) => {
      const ang = (i / 18) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
      const dist = 44 + Math.random() * 54;
      return { dx: Math.cos(ang) * dist, dy: Math.sin(ang) * dist - 12, size: 6 + Math.random() * 5 };
    })
  ).current;

  useEffect(() => {
    Animated.timing(fly, { toValue: 1, duration: 640, easing: Easing.bezier(0.55, 0.06, 0.68, 0.4), useNativeDriver: true }).start(() => {
      onLand && onLand();
      Animated.timing(burst, { toValue: 1, duration: 720, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start(() => onDone && onDone());
    });
  }, []);

  const translateY = fly.interpolate({ inputRange: [0, 1], outputRange: [250, 0] });
  const scale = fly.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1.05] });
  const opacity = fly.interpolate({ inputRange: [0, 0.2, 0.9, 1], outputRange: [0.2, 1, 1, 0] });
  const rotate = fly.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '540deg'] });

  return (
    <View pointerEvents="none" style={{ position: 'absolute', top: 150, left: 0, right: 0, alignItems: 'center', zIndex: 60 }}>
      {/* 飞行金币 */}
      <Animated.View style={{ position: 'absolute', transform: [{ translateY }, { scale }, { rotate }], opacity }}>
        <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: c, borderWidth: 3, borderColor: dk, alignItems: 'center', justifyContent: 'center', shadowColor: c, shadowOpacity: 0.6, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } }}>
          <Text style={{ color: '#fff', fontWeight: '800', fontSize: 18 }}>{loss ? '−' : '¥'}</Text>
        </View>
      </Animated.View>
      {/* 落定爆发粒子 */}
      {parts.map((p, i) => {
        const tx = burst.interpolate({ inputRange: [0, 1], outputRange: [0, p.dx] });
        const ty = burst.interpolate({ inputRange: [0, 1], outputRange: [0, p.dy] });
        const po = burst.interpolate({ inputRange: [0, 0.6, 1], outputRange: [0, 1, 0] });
        const ps = burst.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0.3, 1, 0.6] });
        return (
          <Animated.View key={i} style={{ position: 'absolute', width: p.size, height: p.size, borderRadius: p.size / 2, backgroundColor: i % 2 ? c : dk, transform: [{ translateX: tx }, { translateY: ty }, { scale: ps }], opacity: po }} />
        );
      })}
    </View>
  );
}
