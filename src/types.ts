export type EnvelopeTheme =
  | 'soft-pink'
  | 'morning-coffee'
  | 'secret-news'
  | 'golden-coupon';

export interface Envelope {
  id: number;
  theme: EnvelopeTheme;
  text: string;
  date: string; // Формат YYYY-MM-DD
  photoUrl?: string; // Base64 Data URL для демо или публичный URL для Supabase Storage
  opened: boolean;
  openedAt?: string; // ISO-время прочтения
  updatedAt: string; // ISO-время последнего сохранения
}

export interface ArchiveEntry {
  id: string;
  envelopeId: number;
  theme: EnvelopeTheme;
  text: string;
  noteDate: string;
  photoUrl?: string;
  archivedAt: string; // ISO-время добавления в копилку
}

export type QrDotStyle = 'rounded' | 'dots';
export type QrColorPreset = 'burgundy' | 'chocolate' | 'black' | 'gradient';

export interface QrPrintSettings {
  colorPreset: QrColorPreset;
  dotStyle: QrDotStyle;
  sizeMm: number;
  rangeStart: number;
  rangeEnd: number;
}
