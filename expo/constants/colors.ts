export const COLORS = {
  // Primary — deep space-black base
  primary: '#070A1F',
  primaryLight: '#0F1530',
  primaryDark: '#03050F',

  // Core accent (emerald) — Client
  accent: '#00FFA3',
  accentLight: '#5BFFC4',
  accentDark: '#00CC82',

  // Secondary accents
  coral: '#FF5C7A',
  amber: '#FFB547',
  sky: '#4FC3F7',
  violet: '#B18CFF',
  magenta: '#FF4FD8',
  cyan: '#22E5FF',

  // Role-themed accents
  clientAccent: '#00FFA3',    // emerald
  clientGlow: 'rgba(0,255,163,0.25)',
  providerAccent: '#22E5FF',  // electric cyan
  providerGlow: 'rgba(34,229,255,0.25)',
  adminAccent: '#FF4FD8',     // magenta
  adminGlow: 'rgba(255,79,216,0.25)',

  // Glass surfaces — layered translucency
  glassBg: 'rgba(255,255,255,0.05)',
  glassBgLight: 'rgba(255,255,255,0.09)',
  glassBgStrong: 'rgba(255,255,255,0.13)',
  glassBorder: 'rgba(255,255,255,0.11)',
  glassBorderLight: 'rgba(255,255,255,0.18)',
  glassHighlight: 'rgba(255,255,255,0.08)',
  glassInnerGlow: 'rgba(255,255,255,0.04)',

  // Solid surfaces
  white: '#FFFFFF',
  offWhite: '#F8F9FB',
  background: '#03050F',
  surface: '#070A1F',
  surfaceLight: '#0F1530',
  surfaceElevated: '#141A3A',
  cardBg: 'rgba(255,255,255,0.06)',
  border: 'rgba(255,255,255,0.10)',
  divider: 'rgba(255,255,255,0.06)',

  // Text
  textPrimary: '#F2F5FA',
  textSecondary: 'rgba(242,245,250,0.62)',
  textTertiary: 'rgba(242,245,250,0.38)',
  textInverse: '#03050F',

  // Status colors — neon variants
  statusRequested: '#FFB547',
  statusAccepted: '#22E5FF',
  statusEnRoute: '#B18CFF',
  statusInProgress: '#00FFA3',
  statusCompleted: '#00FFA3',
  statusDeclined: '#FF5C7A',
  statusCancelled: 'rgba(242,245,250,0.35)',
  statusDisputed: '#FF5C7A',

  // Badge levels
  badgeNew: 'rgba(242,245,250,0.45)',
  badgeRisingStar: '#FFB547',
  badgeVerifiedPro: '#22E5FF',
  badgeMaster: '#B18CFF',

  // Payment
  orangeMoney: '#FF8800',
  africellMoney: '#4FC3F7',

  // Legacy aliases (used by remaining screens)
  navy: '#070A1F',
  navyLight: '#0F1530',
  navyDark: '#03050F',
  green: '#00FFA3',
  greenLight: '#5BFFC4',
  greenDark: '#00CC82',
  error: '#FF5C7A',
  errorLight: '#FF8A9A',
  warning: '#FFB547',
  info: '#4FC3F7',
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const RADIUS = {
  sm: 10,
  md: 16,
  lg: 20,
  xl: 28,
  pill: 999,
} as const;

export const SHADOWS = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 14,
    elevation: 5,
  },
  float: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 22,
    elevation: 10,
  },
  glow: {
    shadowColor: '#00FFA3',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 0,
  },
  glowCyan: {
    shadowColor: '#22E5FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 0,
  },
  glowMagenta: {
    shadowColor: '#FF4FD8',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 0,
  },
} as const;

/** Role → accent color mapping for role-themed UI */
type ShadowStyle = typeof SHADOWS.glow;

export const ROLE_ACCENT: Record<'CUSTOMER' | 'PROVIDER' | 'ADMIN', {
  color: string;
  glow: string;
  glowShadow: ShadowStyle;
  label: string;
}> = {
  CUSTOMER: { color: COLORS.clientAccent, glow: COLORS.clientGlow, glowShadow: SHADOWS.glow, label: 'Customer' },
  PROVIDER: { color: COLORS.providerAccent, glow: COLORS.providerGlow, glowShadow: SHADOWS.glowCyan as unknown as ShadowStyle, label: 'Trader' },
  ADMIN: { color: COLORS.adminAccent, glow: COLORS.adminGlow, glowShadow: SHADOWS.glowMagenta as unknown as ShadowStyle, label: 'Admin' },
};

export type ThemeColors = {
  light: {
    text: string;
    background: string;
    tint: string;
    tabIconDefault: string;
    tabIconSelected: string;
  };
  dark: {
    text: string;
    background: string;
    tint: string;
    tabIconDefault: string;
    tabIconSelected: string;
  };
};

const Colors: ThemeColors = {
  light: {
    text: COLORS.textPrimary,
    background: COLORS.background,
    tint: COLORS.accent,
    tabIconDefault: 'rgba(242,245,250,0.40)',
    tabIconSelected: COLORS.accent,
  },
  dark: {
    text: '#F2F5FA',
    background: '#03050F',
    tint: '#00FFA3',
    tabIconDefault: 'rgba(242,245,250,0.40)',
    tabIconSelected: '#00FFA3',
  },
};

export default Colors;
