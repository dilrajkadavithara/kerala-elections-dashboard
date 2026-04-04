export const ALLIANCE_COLORS = {
  UDF: { primary: '#2563EB', light: '#DBEAFE', dark: '#1E40AF' },
  LDF: { primary: '#DC2626', light: '#FEE2E2', dark: '#991B1B' },
  NDA: { primary: '#F59E0B', light: '#FEF3C7', dark: '#D97706' },
  IND: { primary: '#6B7280', light: '#F3F4F6', dark: '#4B5563' },
  OTH: { primary: '#8B5CF6', light: '#EDE9FE', dark: '#8B5CF6' },
} as const;

export const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'UDF BASTION': { bg: '#1E40AF', text: '#FFFFFF', border: '#1E40AF' },
  'UDF STRONG': { bg: '#2563EB', text: '#FFFFFF', border: '#2563EB' },
  'UDF LEANING': { bg: '#DBEAFE', text: '#1E40AF', border: '#60A5FA' },
  'LDF BASTION': { bg: '#991B1B', text: '#FFFFFF', border: '#991B1B' },
  'LDF STRONG': { bg: '#DC2626', text: '#FFFFFF', border: '#DC2626' },
  'LDF LEANING': { bg: '#FEE2E2', text: '#991B1B', border: '#F87171' },
  'NDA LEANING': { bg: '#FEF3C7', text: '#92400E', border: '#D97706' },
  'SWINGING': { bg: '#F3F4F6', text: '#374151', border: '#9CA3AF' },
};

export const ELECTIONS = [
  { key: 'A2011', label: 'Assembly 2011', shortLabel: "A'11", year: 2011, type: 'assembly' as const },
  { key: 'A2016', label: 'Assembly 2016', shortLabel: "A'16", year: 2016, type: 'assembly' as const },
  { key: 'A2021', label: 'Assembly 2021', shortLabel: "A'21", year: 2021, type: 'assembly' as const },
  { key: 'A2026', label: 'Assembly 2026', shortLabel: "A'26", year: 2026, type: 'assembly' as const },
  { key: 'LS2014', label: 'Lok Sabha 2014', shortLabel: "LS'14", year: 2014, type: 'loksabha' as const },
  { key: 'LS2019', label: 'Lok Sabha 2019', shortLabel: "LS'19", year: 2019, type: 'loksabha' as const },
  { key: 'LS2024', label: 'Lok Sabha 2024', shortLabel: "LS'24", year: 2024, type: 'loksabha' as const },
] as const;

export const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/constituencies', label: 'Constituencies' },
  { href: '/districts', label: 'Districts' },
  { href: '/categories', label: 'Categories' },
  { href: '/compare', label: 'Compare' },
  { href: '/trends', label: 'Trends' },
  { href: '/demographics', label: 'Demographics' },
] as const;
