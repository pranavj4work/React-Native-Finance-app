export const lightColors = {
  background: '#F3F6F4',
  surface: '#FFFFFF',
  surfaceMuted: '#E7EFEC',
  primary: '#0F766E',
  primarySoft: '#CCFBF1',
  onPrimary: '#FFFFFF',
  income: '#047857',
  incomeSoft: '#D1FAE5',
  expense: '#E11D48',
  expenseSoft: '#FFE4E6',
  text: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  border: '#E2E8F0',
  warning: '#D97706',
  warningSoft: '#FEF3C7',
  danger: '#DC2626',
  overlay: 'rgba(15, 23, 42, 0.45)',
  tabBar: '#FFFFFF',
  fab: '#0F766E',
  success: '#059669',
};

export const darkColors: typeof lightColors = {
  background: '#0B1110',
  surface: '#151C1B',
  surfaceMuted: '#1C2624',
  primary: '#2DD4BF',
  primarySoft: '#134E4A',
  onPrimary: '#042F2E',
  income: '#34D399',
  incomeSoft: '#064E3B',
  expense: '#FB7185',
  expenseSoft: '#4C0519',
  text: '#F8FAFC',
  textSecondary: '#CBD5E1',
  textMuted: '#64748B',
  border: '#243330',
  warning: '#FBBF24',
  warningSoft: '#451A03',
  danger: '#F87171',
  overlay: 'rgba(0, 0, 0, 0.55)',
  tabBar: '#101716',
  fab: '#2DD4BF',
  success: '#34D399',
};

export type ColorTokens = typeof lightColors;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const radius = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  full: 999,
};

export const typography = {
  display: { fontSize: 32, fontWeight: '700' as const },
  title: { fontSize: 22, fontWeight: '700' as const },
  subtitle: { fontSize: 17, fontWeight: '600' as const },
  body: { fontSize: 15, fontWeight: '500' as const },
  caption: { fontSize: 12, fontWeight: '500' as const },
};
