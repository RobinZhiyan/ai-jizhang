// Icon.js — 单线 SVG 图标（react-native-svg），路径与 HTML 版 1:1 一致
import React from 'react';
import Svg, { Path } from 'react-native-svg';

const ICONS = {
  fork:  'M7 3v7m0 0a2 2 0 0 0 2-2V3M7 10v11M9 3v5M16 3c-1.2 0-2 1.8-2 4s.8 4 2 4m0 0v10',
  car:   'M4 13l1.5-4.5A2 2 0 0 1 7.4 7h9.2a2 2 0 0 1 1.9 1.5L20 13m-16 0v5m0-5h16m0 0v5M6.5 18v2M17.5 18v2M6.5 15.5h.01M17.5 15.5h.01',
  book:  'M12 6c-1.5-1.2-4-1.5-6-1.5v13c2 0 4.5.3 6 1.5m0-13c1.5-1.2 4-1.5 6-1.5v13c-2 0-4.5.3-6 1.5m0-13v13',
  house: 'M4 11l8-6 8 6m-14-1v9h12v-9',
  play:  'M9 8l7 4-7 4V8z',
  smoke: 'M3 16h14v3H3zM17 13c1.5 0 2-1 2-2s-.6-2-1.6-2.4M15 13c2 0 2.5-1.2 2.5-2.5S16.5 8 15.5 8',
  wallet:'M4 7h13a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h11M16 13h.01',
  spark: 'M12 4l1.8 5.2L19 11l-5.2 1.8L12 18l-1.8-5.2L5 11l5.2-1.8L12 4z',
  chart: 'M5 19V10M12 19V5M19 19v-6',
  mic:   'M12 4a3 3 0 0 0-3 3v5a3 3 0 0 0 6 0V7a3 3 0 0 0-3-3zM6 11a6 6 0 0 0 12 0M12 17v3',
  plus:  'M12 5v14M5 12h14',
  trash: 'M5 7h14M10 7V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2M7 7l1 13h8l1-13',
  check: 'M5 12.5l4.5 4.5L19 7',
  trend: 'M4 15l4.5-5 3.5 3L20 6',
  pie:   'M12 3v9h9a9 9 0 1 0-9 9',
  target:'M12 3v3M12 18v3M3 12h3M18 12h3',
  users: 'M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM3 20c0-3 2.7-5 6-5s6 2 6 5M17 7a2.5 2.5 0 0 1 0 5M16 15c2.5.4 4 2.2 4 5',
  income:'M12 4v10m0 0l-4-4m4 4l4-4M5 19h14',
  search:'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-4-4',
  sliders:'M4 7h10M18 7h2M4 12h2M10 12h10M4 17h7M15 17h5M14 5v4M6 10v4M11 15v4',
  edit:  'M4 20h4L19 9l-4-4L4 16v4zM14 6l4 4',
  close: 'M6 6l12 12M18 6L6 18',
  sparkles:'M12 4l1.4 4L17 9.4 13.4 11 12 15l-1.4-4L7 9.4 10.6 8 12 4zM18 14l.7 2 2 .7-2 .7L18 19l-.7-1.6-2-.7 2-.7L18 14z',
  calendar:'M5 6h14v14H5zM5 10h14M9 4v3M15 4v3',
  chevron:'M9 6l6 6-6 6',
  wave:  'M4 12h2M8 8v8M12 5v14M16 8v8M20 12h0',
  bowl:  'M3 11h18a9 9 0 0 1-18 0z M12 4v3 M9 5v2 M15 5v2',
  bag:   'M6 8h12l-1 11a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1L6 8z M9 8V6a3 3 0 0 1 6 0v2',
  box:   'M4 8l8-4 8 4v8l-8 4-8-4V8z M4 8l8 4 8-4 M12 12v8',
  leaf:  'M5 19c0-8 6-13 14-14 0 8-5 14-13 14H5z M8 16c2-3 5-5 8-7',
  apple: 'M12 8c-3 0-5 2.2-5 5.5S9 21 12 21s5-3 5-6.5S15 8 12 8z M12.5 8c0-2 1-3 3-3',
  fuel:  'M5 21V5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v16 M4 21h10 M5 12h8 M16 9v7a1.5 1.5 0 0 0 3 0V10l-2-2',
  phone: 'M8 3h8a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z M10.5 18h3',
  chat:  'M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H9l-4 4V6z',
  dumbbell: 'M4 9v6 M7 7v10 M17 7v10 M20 9v6 M7 12h10',
  shirt: 'M9 4L4 7l2 3.5 3-1.5V20h6V9l3 1.5L20 7l-5-3a3 2.2 0 0 1-6 0z',
  package: 'M4 8l8-4 8 4v8l-8 4-8-4V8z M4 8l8 4 8-4 M8 6l8 4',
  bottle: 'M10 3h4v2.5l1.2 3V20a1 1 0 0 1-1 1h-4.4a1 1 0 0 1-1-1V8.5L10 5.5V3z M8.8 12h6.4',
  cross: 'M10 4h4v6h6v4h-6v6h-4v-6H4v-4h6V4z',
  paw:   'M12 14.5c-1.8 0-3.2 1.1-3.2 2.5s1.4 2 3.2 2 3.2-.6 3.2-2-1.4-2.5-3.2-2.5z M7.6 11.6a1 1 0 1 0 .01 0 M10.5 9.4a1 1 0 1 0 .01 0 M13.5 9.4a1 1 0 1 0 .01 0 M16.4 11.6a1 1 0 1 0 .01 0',
  bank:  'M4 9l8-5 8 5 M5 9v9 M9 9v9 M15 9v9 M19 9v9 M3 20h18',
  hammer: 'M13 7l4 4M15 5l4 4-2 2-4-4 2-2z M13 7L4 16l3 3 9-9',
  wrench: 'M16 4a4 4 0 0 0-3.5 6L4 18.5 5.5 20l8.4-8.4A4 4 0 0 0 20 8l-2.6 2.6L15 8l2.6-2.6A4 4 0 0 0 16 4z',
  brick: 'M3 7h18v4H3z M3 13h18v4H3z M10 7v4 M16 13v4',
  roller: 'M4 5h11v5H4z M15 7h4v3h-6 M11 10v3a1 1 0 0 1-1 1H9v6',
  sofa:  'M5 12a2 2 0 0 1 4 0v2h6v-2a2 2 0 0 1 4 0v5H5v-5z M7 12V9a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v3',
  plug:  'M9 3v4 M15 3v4 M7 7h10v3a5 5 0 0 1-10 0V7z M12 15v6',
  drop:  'M12 4c3.2 5 5 7.2 5 10a5 5 0 0 1-10 0c0-2.8 1.8-5 5-10z',
  camera: 'M3 8a2 2 0 0 1 2-2h2l1.2-1.6h5.6L17 6h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8z M12 11.5a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
  wechat: 'M9 5.5C5.4 5.5 2.5 7.9 2.5 10.9c0 1.7.9 3.2 2.4 4.2L4 17.5l2.6-1.3c.8.2 1.6.3 2.4.3M14.5 9.5c-3.3 0-6 2.2-6 5s2.7 5 6 5c.7 0 1.4-.1 2-.3l2.3 1.1-.7-2c1.3-.9 2.1-2.2 2.1-3.8 0-2.8-2.7-5-5.7-5z',
};

export default function Icon({ name, size = 22, sw = 1.8, color = '#000', fill = false, style }) {
  const d = ICONS[name] || ICONS.plus;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <Path d={d} stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" fill={fill ? color : 'none'} />
    </Svg>
  );
}

export { ICONS };
