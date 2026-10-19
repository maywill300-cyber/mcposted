// Small stroke icons used across the app.

const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
};

export const Up = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" strokeWidth="2.5" {...base}>
    <path d="M12 19V5" /><path d="M5 12l7-7 7 7" />
  </svg>
);

export const Down = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" strokeWidth="2.5" {...base}>
    <path d="M12 5v14" /><path d="M19 12l-7 7-7-7" />
  </svg>
);

export const Bubble = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" strokeWidth="2" {...base}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

export const Dots = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" strokeWidth="2.5" {...base}>
    <circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" />
  </svg>
);

export const Back = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" strokeWidth="2.2" {...base}>
    <path d="M19 12H5" /><path d="M12 19l-7-7 7-7" />
  </svg>
);

export const Arrow = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" strokeWidth="2" {...base}>
    <path d="M5 12h14" /><path d="M12 5l7 7-7 7" />
  </svg>
);

export const Send = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" strokeWidth="2.2" {...base}>
    <path d="M22 2L11 13" /><path d="M22 2l-7 20-4-9-9-4 20-7z" />
  </svg>
);

export const Plus = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" strokeWidth="2.5" {...base}>
    <path d="M12 5v14" /><path d="M5 12h14" />
  </svg>
);

export const Home = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" strokeWidth="2.2" {...base}>
    <path d="M3 10.5L12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" />
  </svg>
);

export const Tray = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" strokeWidth="2" {...base}>
    <path d="M3 11h18" /><path d="M5 11a7 7 0 0 1 14 0" /><path d="M4 15h16l-1.5 4h-13z" />
  </svg>
);

export const Person = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" strokeWidth="2" {...base}>
    <circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" />
  </svg>
);

export const Check = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" strokeWidth="2.5" {...base}>
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

export const Clock = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" strokeWidth="2.2" {...base}>
    <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
  </svg>
);

export const Shield = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" strokeWidth="2" {...base}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

export const Alert = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" strokeWidth="2.2" {...base}>
    <path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
    <path d="M12 9v4" /><path d="M12 17h.01" />
  </svg>
);
