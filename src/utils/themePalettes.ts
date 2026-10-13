export type ThemePaletteId =
  | 'cyber-green'
  | 'cyber-volt'
  | 'inferno-red'
  | 'arctic-cyan'
  | 'titanium-gold';

export interface ThemePaletteConfig {
  id: ThemePaletteId;
  name: string;
  subtitle: string;
  emoji: string;
  primaryColor: string;
  secondaryColor: string;
  primaryHover: string;
  primaryTextOnAccent: string;
  accentGradient: string;
  accentGlow: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  accentSubtle?: string;
  accentSubtleBorder?: string;
  darkCanvasBg: string;
  darkSurfaceBg: string;
  darkBorder: string;
  lightCanvasBg: string;
  lightSurfaceBg: string;
  lightBorder: string;
}

export const THEME_PALETTES: Record<ThemePaletteId, ThemePaletteConfig> = {
  'cyber-green': {
    id: 'cyber-green',
    name: 'Cyber Green & Black',
    subtitle: 'Signature Athletic Green & Obsidian Black',
    emoji: '🟢',
    primaryColor: '#10B981', // Electric Emerald Green
    secondaryColor: '#059669',
    primaryHover: '#047857',
    primaryTextOnAccent: '#000000',
    accentGradient: 'from-[#10B981] via-[#34D399] to-[#059669]',
    accentGlow: 'rgba(16, 185, 129, 0.45)',
    badgeBg: 'rgba(16, 185, 129, 0.16)',
    badgeBorder: 'rgba(16, 185, 129, 0.45)',
    badgeText: '#10B981',
    darkCanvasBg: '#000000',
    darkSurfaceBg: '#0B0F0D',
    darkBorder: '#18241D',
    lightCanvasBg: '#FFFFFF',
    lightSurfaceBg: '#F0FDF4',
    lightBorder: '#DCFCE7',
  },
  'cyber-volt': {
    id: 'cyber-volt',
    name: 'Cyber Volt & Acid Lime',
    subtitle: 'High-Visibility Neon Volt',
    emoji: '⚡',
    primaryColor: '#D4FF00',
    secondaryColor: '#88A400',
    primaryHover: '#BCE000',
    primaryTextOnAccent: '#000000',
    accentGradient: 'from-[#D4FF00] via-[#E2FF4D] to-[#88A400]',
    accentGlow: 'rgba(212, 255, 0, 0.35)',
    badgeBg: 'rgba(212, 255, 0, 0.14)',
    badgeBorder: 'rgba(212, 255, 0, 0.4)',
    badgeText: '#D4FF00',
    darkCanvasBg: '#000000',
    darkSurfaceBg: '#0E100A',
    darkBorder: '#232A12',
    lightCanvasBg: '#FFFFFF',
    lightSurfaceBg: '#FAFFE5',
    lightBorder: '#ECFCCB',
  },
  'inferno-red': {
    id: 'inferno-red',
    name: 'GymX Inferno Red & Black',
    subtitle: 'High-Contrast Athletic Iron',
    emoji: '🔴',
    primaryColor: '#EF4444',
    secondaryColor: '#B91C1C',
    primaryHover: '#DC2626',
    primaryTextOnAccent: '#FFFFFF',
    accentGradient: 'from-[#EF4444] via-[#DC2626] to-[#B91C1C]',
    accentGlow: 'rgba(239, 68, 68, 0.4)',
    badgeBg: 'rgba(239, 68, 68, 0.16)',
    badgeBorder: 'rgba(239, 68, 68, 0.45)',
    badgeText: '#EF4444',
    darkCanvasBg: '#000000',
    darkSurfaceBg: '#0E0E10',
    darkBorder: '#27272A',
    lightCanvasBg: '#FFFFFF',
    lightSurfaceBg: '#F9FAFB',
    lightBorder: '#E5E7EB',
  },
  'arctic-cyan': {
    id: 'arctic-cyan',
    name: 'Arctic Neon Cyan',
    subtitle: 'Biometric Smart Telemetry',
    emoji: '🌊',
    primaryColor: '#00E5FF',
    secondaryColor: '#0284C7',
    primaryHover: '#00B8D4',
    primaryTextOnAccent: '#00141E',
    accentGradient: 'from-[#00E5FF] via-[#80F3FF] to-[#0284C7]',
    accentGlow: 'rgba(0, 229, 255, 0.35)',
    badgeBg: 'rgba(0, 229, 255, 0.14)',
    badgeBorder: 'rgba(0, 229, 255, 0.35)',
    badgeText: '#00E5FF',
    darkCanvasBg: '#070C12',
    darkSurfaceBg: '#0E1724',
    darkBorder: '#1A293E',
    lightCanvasBg: '#F0F9FF',
    lightSurfaceBg: '#FFFFFF',
    lightBorder: '#BAE6FD',
  },
  'titanium-gold': {
    id: 'titanium-gold',
    name: 'Titanium & Champagne Gold',
    subtitle: 'VIP Equinox Luxury Club',
    emoji: '🏆',
    primaryColor: '#E5C378',
    secondaryColor: '#997328',
    primaryHover: '#D4AF37',
    primaryTextOnAccent: '#0D0D0E',
    accentGradient: 'from-[#E5C378] via-[#F3DA96] to-[#A87E2C]',
    accentGlow: 'rgba(229, 195, 120, 0.25)',
    badgeBg: 'rgba(229, 195, 120, 0.12)',
    badgeBorder: 'rgba(229, 195, 120, 0.35)',
    badgeText: '#E5C378',
    darkCanvasBg: '#0A0A0C',
    darkSurfaceBg: '#121316',
    darkBorder: '#272521',
    lightCanvasBg: '#FDFBF7',
    lightSurfaceBg: '#FFFFFF',
    lightBorder: '#E7DFD5',
  },
};
