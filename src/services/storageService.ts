import { createClient, type PostgrestError } from '@supabase/supabase-js';
import type { ArchiveEntry, Envelope, EnvelopeTheme } from '../types';

/**
 * Контракт хранилища SweetNotes (Supabase PostgreSQL).
 *
 * Соответствует схеме таблиц в Supabase:
 * - public.envelopes (id, theme, message, image_url, is_opened, updated_at)
 * - public.archive   (id, envelope_id, theme, message, image_url, created_at)
 */
export interface IStorageService {
  getEnvelopes(): Promise<Envelope[]>;
  getEnvelopeById(id: number): Promise<Envelope | null>;
  saveEnvelope(
    payload: Pick<Envelope, 'id' | 'theme' | 'text' | 'date' | 'photoUrl'>
  ): Promise<Envelope>;
  addEnvelope(): Promise<Envelope>;
  markAsOpenedAndArchive(id: number): Promise<{
    envelope: Envelope;
    archiveEntry: ArchiveEntry;
  }>;
  getArchive(): Promise<ArchiveEntry[]>;
  resetDemoData(): Promise<void>;
}

const DEFAULT_SUPABASE_URL = 'https://wtzqaxafleacvdgoclan.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0enFheGFmbGVhY3ZkZ29jbGFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTUyNzYwMDMsImV4cCI6MjExMDg1MjAwM30.LYl_oVSU_qNd-DQLDx7sQQjoiNH5pkUbhkU56tfOh_k';

// @supabase/supabase-js ожидает базовый HTTP/HTTPS URL проекта без суффикса /rest/v1/
function resolveSupabaseUrl(raw?: string): string {
  if (!raw) return DEFAULT_SUPABASE_URL;
  const cleaned = raw
    .trim()
    .replace(/\/rest\/v1\/?$/i, '')
    .replace(/\/+$/, '');
  return /^https?:\/\/.+/i.test(cleaned) ? cleaned : DEFAULT_SUPABASE_URL;
}

const SUPABASE_URL = resolveSupabaseUrl(import.meta.env.VITE_SUPABASE_URL);

const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() || DEFAULT_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

interface EnvelopeRow {
  id: number;
  theme: EnvelopeTheme;
  message: string | null;
  image_url: string | null;
  is_opened: boolean;
  updated_at: string;
}

interface ArchiveRow {
  id: string;
  envelope_id: number;
  theme: EnvelopeTheme;
  message: string;
  image_url: string | null;
  created_at: string;
}

function mapEnvelopeRow(row: EnvelopeRow): Envelope {
  const isoTimestamp = row.updated_at || new Date().toISOString();
  return {
    id: row.id,
    theme: row.theme || 'soft-pink',
    text: row.message ?? '',
    date: isoTimestamp.slice(0, 10),
    photoUrl: row.image_url ?? undefined,
    opened: Boolean(row.is_opened),
    openedAt: row.is_opened ? isoTimestamp : undefined,
    updatedAt: isoTimestamp,
  };
}

function mapArchiveRow(row: ArchiveRow): ArchiveEntry {
  const createdAt = row.created_at || new Date().toISOString();
  return {
    id: row.id,
    envelopeId: row.envelope_id,
    theme: row.theme || 'soft-pink',
    text: row.message ?? '',
    noteDate: createdAt.slice(0, 10),
    photoUrl: row.image_url ?? undefined,
    archivedAt: createdAt,
  };
}

function wrapSupabaseError(error: PostgrestError, context: string): Error {
  if (error.code === '42501') {
    return new Error(
      `Нет доступа к таблице Supabase (${error.message}). Выполните GRANT / RLS-политики для роли anon в SQL Editor.`
    );
  }
  return new Error(`${context}: ${error.message}`);
}

const DEMO_PHOTOS = {
  coffee: '/src/assets/images/note_morning_coffee_1795280796864.jpg',
  flowers: '/src/assets/images/note_flower_bouquet_1795280795807.jpg',
  treats: '/src/assets/images/note_sweet_treats_1795280795615.jpg',
  evening: '/src/assets/images/note_evening_lights_1795280796537.jpg',
};

const INITIAL_DEMO_ENVELOPES: EnvelopeRow[] = [
  {
    id: 1,
    theme: 'soft-pink',
    message:
      'Доброе утро, родная! Пусть этот маленький трюфель сделает начало дня чуть слаще. Спасибо за каждую улыбку, которой ты согреваешь наш дом.',
    image_url: DEMO_PHOTOS.flowers,
    is_opened: false,
    updated_at: '2026-11-21T08:00:00.000Z',
  },
  {
    id: 2,
    theme: 'morning-coffee',
    message:
      'Если сегодня день покажется слишком длинным, просто вспомни: вечером нас ждёт горячий капучино, тёплый плед и наше любимое кино.',
    image_url: DEMO_PHOTOS.coffee,
    is_opened: false,
    updated_at: '2026-11-22T08:05:00.000Z',
  },
  {
    id: 3,
    theme: 'golden-coupon',
    message:
      'КУПОН №03: Освобождение от всех вечерних дел и приготовление твоего любимого ужина при свечах. Предъявить с улыбкой в любой день недели!',
    image_url: DEMO_PHOTOS.treats,
    is_opened: false,
    updated_at: '2026-11-23T08:10:00.000Z',
  },
  {
    id: 4,
    theme: 'secret-news',
    message:
      'Секрет на эту субботу: я уже забронировал столик у окна в том самом тихом бистро, где мы отмечали нашу первую годовщину. В 19:30 будь готова удивляться.',
    image_url: DEMO_PHOTOS.evening,
    is_opened: false,
    updated_at: '2026-11-24T08:15:00.000Z',
  },
  {
    id: 5,
    theme: 'soft-pink',
    message:
      'Ты удивительным образом умеешь превращать обыкновенный вторник в маленький праздник. Просто знай, что я очень тебя люблю.',
    image_url: null,
    is_opened: false,
    updated_at: '2026-11-25T08:20:00.000Z',
  },
  {
    id: 6,
    theme: 'morning-coffee',
    message:
      'Маленькая пауза для тебя: выпей стакан воды, потянись, съешь эту конфетку и выдохни. Ты справляешься блестяще!',
    image_url: null,
    is_opened: false,
    updated_at: '2026-11-26T08:25:00.000Z',
  },
  {
    id: 7,
    theme: 'golden-coupon',
    message:
      'ЗОЛОТОЙ КУПОН: Долгая прогулка без телефонов, горячий какао в термосе и 30 минут расслабляющего массажа плеч вечером.',
    image_url: null,
    is_opened: false,
    updated_at: '2026-11-27T08:30:00.000Z',
  },
  {
    id: 8,
    theme: 'secret-news',
    message:
      'Подсказка к следующему выходному дню: возьми с собой тёплый шарф и фотоаппарат — мы едем смотреть осенний залив.',
    image_url: null,
    is_opened: false,
    updated_at: '2026-11-28T08:35:00.000Z',
  },
  {
    id: 9,
    theme: 'soft-pink',
    message:
      'Случайное напоминание: твой смех — мой самый любимый звук на свете. Хочу слышать его сегодня как можно чаще.',
    image_url: null,
    is_opened: false,
    updated_at: '2026-11-29T08:40:00.000Z',
  },
  {
    id: 10,
    theme: 'morning-coffee',
    message:
      'Даже в самый пасмурный день рядом с тобой удивительно светло. Захвати эту сладость с собой на прогулку.',
    image_url: null,
    is_opened: false,
    updated_at: '2026-11-30T08:45:00.000Z',
  },
  {
    id: 11,
    theme: 'soft-pink',
    message:
      'Самое первое утро ноября, когда мы пили кофе на балконе и строили планы на зиму. Сберегу это чувство навсегда.',
    image_url: DEMO_PHOTOS.coffee,
    is_opened: true,
    updated_at: '2026-11-12T09:15:00.000Z',
  },
  {
    id: 12,
    theme: 'golden-coupon',
    message:
      'Купон на спонтанный ночной променад за самым вкусным пломбиром в городе — использован с особым удовольствием!',
    image_url: DEMO_PHOTOS.evening,
    is_opened: true,
    updated_at: '2026-11-15T21:40:00.000Z',
  },
];

class SupabaseStorageService implements IStorageService {
  async getEnvelopes(): Promise<Envelope[]> {
    const { data, error } = await supabase
      .from('envelopes')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      throw wrapSupabaseError(error, 'Не удалось загрузить конверты');
    }

    return ((data ?? []) as EnvelopeRow[]).map(mapEnvelopeRow);
  }

  async getEnvelopeById(id: number): Promise<Envelope | null> {
    const { data, error } = await supabase
      .from('envelopes')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw wrapSupabaseError(error, `Не удалось загрузить конверт №${id}`);
    }

    return data ? mapEnvelopeRow(data as EnvelopeRow) : null;
  }

  async saveEnvelope(
    payload: Pick<Envelope, 'id' | 'theme' | 'text' | 'date' | 'photoUrl'>
  ): Promise<Envelope> {
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const updatedAtIso =
      payload.date && payload.date !== todayStr
        ? `${payload.date}T12:00:00.000Z`
        : now.toISOString();

    const { data, error } = await supabase
      .from('envelopes')
      .upsert(
        {
          id: payload.id,
          theme: payload.theme,
          message: payload.text.trim(),
          image_url: payload.photoUrl?.trim() ? payload.photoUrl.trim() : null,
          // При «Сохранить и зарядить конверт» статус всегда сбрасывается в false
          is_opened: false,
          updated_at: updatedAtIso,
        },
        { onConflict: 'id' }
      )
      .select('*')
      .single();

    if (error) {
      throw wrapSupabaseError(error, 'Не удалось сохранить конверт');
    }

    return mapEnvelopeRow(data as EnvelopeRow);
  }

  async addEnvelope(): Promise<Envelope> {
    const { data: lastRows, error: fetchError } = await supabase
      .from('envelopes')
      .select('id')
      .order('id', { ascending: false })
      .limit(1);

    if (fetchError) {
      throw wrapSupabaseError(fetchError, 'Не удалось определить номер конверта');
    }

    const maxId = lastRows && lastRows.length > 0 ? Number(lastRows[0].id) : 0;
    const nextId = maxId + 1;
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('envelopes')
      .insert({
        id: nextId,
        theme: 'soft-pink',
        message: '',
        image_url: null,
        is_opened: false,
        updated_at: now,
      })
      .select('*')
      .single();

    if (error) {
      throw wrapSupabaseError(error, 'Не удалось создать конверт');
    }

    return mapEnvelopeRow(data as EnvelopeRow);
  }

  async markAsOpenedAndArchive(id: number): Promise<{
    envelope: Envelope;
    archiveEntry: ArchiveEntry;
  }> {
    const current = await this.getEnvelopeById(id);
    if (!current) {
      throw new Error(`Конверт №${id} не найден`);
    }

    const now = new Date().toISOString();

    const { data: updatedRow, error: updateError } = await supabase
      .from('envelopes')
      .update({
        is_opened: true,
        updated_at: now,
      })
      .eq('id', id)
      .select('*')
      .single();

    if (updateError) {
      throw wrapSupabaseError(updateError, 'Не удалось обновить статус конверта');
    }

    const { data: archiveRow, error: archiveError } = await supabase
      .from('archive')
      .insert({
        envelope_id: current.id,
        theme: current.theme,
        message: current.text,
        image_url: current.photoUrl ?? null,
        created_at: now,
      })
      .select('*')
      .single();

    if (archiveError) {
      throw wrapSupabaseError(
        archiveError,
        'Не удалось сохранить послание в копилку'
      );
    }

    return {
      envelope: mapEnvelopeRow(updatedRow as EnvelopeRow),
      archiveEntry: mapArchiveRow(archiveRow as ArchiveRow),
    };
  }

  async getArchive(): Promise<ArchiveEntry[]> {
    const { data, error } = await supabase
      .from('archive')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw wrapSupabaseError(error, 'Не удалось загрузить копилку воспоминаний');
    }

    return ((data ?? []) as ArchiveRow[]).map(mapArchiveRow);
  }

  async resetDemoData(): Promise<void> {
    const { error: upsertError } = await supabase
      .from('envelopes')
      .upsert(INITIAL_DEMO_ENVELOPES, { onConflict: 'id' });

    if (upsertError) {
      throw wrapSupabaseError(upsertError, 'Не удалось загрузить демо-конверты');
    }

    const { data: existingArchive, error: archCheckError } = await supabase
      .from('archive')
      .select('id')
      .limit(1);

    if (archCheckError) {
      throw wrapSupabaseError(archCheckError, 'Не удалось проверить копилку');
    }

    if (!existingArchive || existingArchive.length === 0) {
      const { error: archInsertError } = await supabase.from('archive').insert([
        {
          envelope_id: 12,
          theme: 'golden-coupon',
          message:
            'Купон на спонтанный ночной променад за самым вкусным пломбиром в городе — использован с особым удовольствием!',
          image_url: DEMO_PHOTOS.evening,
          created_at: '2026-11-15T21:40:00.000Z',
        },
        {
          envelope_id: 11,
          theme: 'soft-pink',
          message:
            'Самое первое утро ноября, когда мы пили кофе на балконе и строили планы на зиму. Сберегу это чувство навсегда.',
          image_url: DEMO_PHOTOS.coffee,
          created_at: '2026-11-12T09:15:00.000Z',
        },
      ]);

      if (archInsertError) {
        throw wrapSupabaseError(
          archInsertError,
          'Не удалось добавить демо-записи в копилку'
        );
      }
    }
  }
}

export const storageService: IStorageService = new SupabaseStorageService();
