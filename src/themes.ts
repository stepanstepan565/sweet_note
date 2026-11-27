import type { EnvelopeTheme } from './types';

export interface ThemeMeta {
  id: EnvelopeTheme;
  label: string;
  subtitle: string;
  cardBg: string;
  cardBorder: string;
  innerFrame: string;
  textPrimary: string;
  textMuted: string;
  accentBg: string;
  accentText: string;
  accentBorder: string;
  sealColor: string;
  swatchColor: string;
  isDark: boolean;
}

export const ENVELOPE_THEMES: Record<EnvelopeTheme, ThemeMeta> = {
  'soft-pink': {
    id: 'soft-pink',
    label: 'Нежный розовый',
    subtitle: 'Мягкая пудровая бумага и бордовый шрифт',
    cardBg: 'bg-[#FDF4F6]',
    cardBorder: 'border-[#E9C8D1]',
    innerFrame: 'border-[#E9C8D1]/80',
    textPrimary: 'text-[#3D1624]',
    textMuted: 'text-[#7A4C5B]',
    accentBg: 'bg-[#8E2E4E]',
    accentText: 'text-[#8E2E4E]',
    accentBorder: 'border-[#8E2E4E]/25',
    sealColor: '#8E2E4E',
    swatchColor: '#F3D7DF',
    isDark: false,
  },
  'morning-coffee': {
    id: 'morning-coffee',
    label: 'Утренний кофе',
    subtitle: 'Тёплый лён, крафтовые оттенки и аромат эспрессо',
    cardBg: 'bg-[#F8F2EA]',
    cardBorder: 'border-[#DECDBD]',
    innerFrame: 'border-[#DECDBD]/85',
    textPrimary: 'text-[#2C1D14]',
    textMuted: 'text-[#6F584A]',
    accentBg: 'bg-[#6F4329]',
    accentText: 'text-[#6F4329]',
    accentBorder: 'border-[#6F4329]/25',
    sealColor: '#6F4329',
    swatchColor: '#EAE0D2',
    isDark: false,
  },
  'secret-news': {
    id: 'secret-news',
    label: 'Секретная новость',
    subtitle: 'Глубокий бархатный сливовый и золотое тиснение',
    cardBg: 'bg-[#1E1B28]',
    cardBorder: 'border-[#433A59]',
    innerFrame: 'border-[#D7B472]/35',
    textPrimary: 'text-[#F9F4EC]',
    textMuted: 'text-[#C8BDCF]',
    accentBg: 'bg-[#D7B472]',
    accentText: 'text-[#D7B472]',
    accentBorder: 'border-[#D7B472]/35',
    sealColor: '#3B2C47',
    swatchColor: '#1E1B28',
    isDark: true,
  },
  'golden-coupon': {
    id: 'golden-coupon',
    label: 'Золотой купон',
    subtitle: 'Бумага цвета шампань и античная позолота',
    cardBg: 'bg-[#FBF6E6]',
    cardBorder: 'border-[#C9A449]',
    innerFrame: 'border-[#C9A449]/65',
    textPrimary: 'text-[#2D2212]',
    textMuted: 'text-[#6E5B3A]',
    accentBg: 'bg-[#946B1B]',
    accentText: 'text-[#946B1B]',
    accentBorder: 'border-[#C9A449]/50',
    sealColor: '#A9802B',
    swatchColor: '#F3E5BD',
    isDark: false,
  },
};

export const THEME_LIST: ThemeMeta[] = Object.values(ENVELOPE_THEMES);

export function formatRussianDate(dateStr: string): string {
  if (!dateStr) return '';
  const parsed = new Date(dateStr);
  if (Number.isNaN(parsed.getTime())) return dateStr;
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(parsed);
}

export function formatEnvelopeNumber(id: number): string {
  return String(id).padStart(2, '0');
}
