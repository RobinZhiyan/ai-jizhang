// usePersisted.js — 用 AsyncStorage 持久化 state（替代原型的 localStorage）
import { useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function usePersistedState(key, initial) {
  const [value, setValue] = useState(initial);
  const loaded = useRef(false);
  useEffect(() => {
    let alive = true;
    AsyncStorage.getItem(key).then((raw) => {
      if (alive && raw != null) { try { setValue(JSON.parse(raw)); } catch (e) {} }
      loaded.current = true;
    }).catch(() => { loaded.current = true; });
    return () => { alive = false; };
  }, [key]);
  useEffect(() => {
    if (loaded.current) AsyncStorage.setItem(key, JSON.stringify(value)).catch(() => {});
  }, [key, value]);
  return [value, setValue];
}
