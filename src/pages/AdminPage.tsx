import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  Check,
  CheckCircle2,
  Delete,
  Image as ImageIcon,
  Lock,
  LogOut,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { storageService } from '../services/storageService';
import type { ArchiveEntry, Envelope, EnvelopeTheme } from '../types';
import {
  ENVELOPE_THEMES,
  THEME_LIST,
  formatEnvelopeNumber,
  formatRussianDate,
} from '../themes';
import { TopBar } from '../components/TopBar';
import { PhotoFrame } from '../components/PhotoFrame';

/**
 * Настраиваемый PIN-код для доступа к админ-панели.
 * Измените значение ниже перед публикацией.
 */
export const ADMIN_PIN = '1234';
const PIN_SESSION_KEY = 'sweetnotes_admin_unlocked';

type StatusFilter = 'all' | 'ready' | 'opened';

async function compressImageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Не удалось прочитать файл'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Неверный формат изображения'));
      img.onload = () => {
        const maxWidth = 960;
        const scale = img.width > maxWidth ? maxWidth / img.width : 1;
        const targetWidth = Math.round(img.width * scale);
        const targetHeight = Math.round(img.height * scale);

        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(String(reader.result));
          return;
        }
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

export function AdminPage() {
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    return sessionStorage.getItem(PIN_SESSION_KEY) === 'true';
  });
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  const [envelopes, setEnvelopes] = useState<Envelope[]>([]);
  const [archive, setArchive] = useState<ArchiveEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [filter, setFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Editor modal state
  const [editingEnvelope, setEditingEnvelope] = useState<Envelope | null>(null);
  const [draftTheme, setDraftTheme] = useState<EnvelopeTheme>('soft-pink');
  const [draftDate, setDraftDate] = useState('');
  const [draftText, setDraftText] = useState('');
  const [draftPhotoUrl, setDraftPhotoUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);
  const [workspaceError, setWorkspaceError] = useState('');

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    window.setTimeout(() => {
      setToastMessage((curr) => (curr === message ? '' : curr));
    }, 3000);
  }, []);

  const loadWorkspace = useCallback(async () => {
    setIsLoading(true);
    setWorkspaceError('');
    try {
      const [list, archiveList] = await Promise.all([
        storageService.getEnvelopes(),
        storageService.getArchive(),
      ]);
      setEnvelopes(list);
      setArchive(archiveList);
    } catch (err) {
      setWorkspaceError(
        err instanceof Error
          ? err.message
          : 'Не удалось загрузить конверты из Supabase.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isUnlocked) {
      loadWorkspace();
    }
  }, [isUnlocked, loadWorkspace]);

  const submitPin = useCallback((value: string) => {
    if (value === ADMIN_PIN) {
      sessionStorage.setItem(PIN_SESSION_KEY, 'true');
      setIsUnlocked(true);
      setPinError('');
    } else {
      setPinError('Неверный PIN-код. Попробуйте ещё раз.');
      setPinInput('');
    }
  }, []);

  const handleDigitClick = (digit: string) => {
    if (pinInput.length >= ADMIN_PIN.length) return;
    const next = pinInput + digit;
    setPinInput(next);
    setPinError('');
    if (next.length === ADMIN_PIN.length) {
      window.setTimeout(() => submitPin(next), 120);
    }
  };

  const handlePinBackspace = () => {
    setPinInput((prev) => prev.slice(0, -1));
    setPinError('');
  };

  const handleLock = () => {
    sessionStorage.removeItem(PIN_SESSION_KEY);
    setIsUnlocked(false);
    setPinInput('');
    setPinError('');
  };

  const openEditor = (env: Envelope) => {
    setEditingEnvelope(env);
    setDraftTheme(env.theme);
    setDraftDate(env.date || new Date().toISOString().slice(0, 10));
    setDraftText(env.text);
    setDraftPhotoUrl(env.photoUrl ?? '');
    setUploadError('');
  };

  const handleAddEnvelope = async () => {
    setWorkspaceError('');
    try {
      const created = await storageService.addEnvelope();
      setEnvelopes((prev) => [...prev, created].sort((a, b) => a.id - b.id));
      openEditor(created);
    } catch (err) {
      setWorkspaceError(
        err instanceof Error ? err.message : 'Не удалось создать конверт.'
      );
    }
  };

  const handleSaveEnvelope = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEnvelope || isSaving) return;

    setIsSaving(true);
    setUploadError('');
    try {
      const saved = await storageService.saveEnvelope({
        id: editingEnvelope.id,
        theme: draftTheme,
        date: draftDate,
        text: draftText,
        photoUrl: draftPhotoUrl || undefined,
      });

      setEnvelopes((prev) =>
        prev
          .map((item) => (item.id === saved.id ? saved : item))
          .sort((a, b) => a.id - b.id)
      );
      setEditingEnvelope(null);
      showToast(
        `Конверт №${formatEnvelopeNumber(saved.id)} сохранён и заряжен`
      );
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : 'Не удалось сохранить конверт.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadError('');
    try {
      const base64 = await compressImageToBase64(file);
      setDraftPhotoUrl(base64);
    } catch {
      setUploadError('Не удалось обработать изображение. Попробуйте другой файл.');
    }
    event.target.value = '';
  };

  const handleResetDemo = async () => {
    setWorkspaceError('');
    try {
      await storageService.resetDemoData();
      await loadWorkspace();
      setConfirmReset(false);
      showToast('Демо-конверты (12 шт.) загружены в Supabase');
    } catch (err) {
      setConfirmReset(false);
      setWorkspaceError(
        err instanceof Error
          ? err.message
          : 'Не удалось загрузить демо-данные в Supabase.'
      );
    }
  };

  const stats = useMemo(() => {
    const total = envelopes.length;
    const openedCount = envelopes.filter((item) => item.opened).length;
    const readyCount = total - openedCount;
    return {
      total,
      readyCount,
      openedCount,
      archiveCount: archive.length,
    };
  }, [envelopes, archive]);

  const filteredEnvelopes = useMemo(() => {
    return envelopes.filter((env) => {
      if (filter === 'ready' && env.opened) return false;
      if (filter === 'opened' && !env.opened) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const numStr = formatEnvelopeNumber(env.id);
        const matchesId =
          String(env.id).includes(q) || `№${numStr}`.includes(q);
        const matchesText = env.text.toLowerCase().includes(q);
        return matchesId || matchesText;
      }
      return true;
    });
  }, [envelopes, filter, searchQuery]);

  if (!isUnlocked) {
    return (
      <div className="flex min-h-[100dvh] flex-col bg-[#FAF8F6]">
        <TopBar
          primaryAction={
            <Link
              to="/c/1"
              className="inline-flex min-h-[40px] items-center justify-center rounded-xl border border-[#DFD2D6] bg-white px-4 py-2 text-xs font-medium text-[#231B1E] transition-colors hover:bg-[#F5F0F2] whitespace-nowrap shrink-0"
            >
              Открыть №01
            </Link>
          }
        />

        <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-4 py-10">
          <div className="w-full rounded-3xl border border-[#E7DFDC] bg-white p-7 shadow-[0_18px_45px_-18px_rgba(61,22,36,0.12)] sm:p-8">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F8ECF0] text-[#8E2E4E]">
              <Lock className="h-5 w-5" strokeWidth={1.8} />
            </div>

            <h1 className="text-center font-editorial text-3xl font-semibold text-[#231B1E]">
              Панель управления
            </h1>
            <p className="mt-2 text-center text-sm text-[#6B5B61]">
              Введите PIN-код для редактирования конвертов
            </p>

            {/* PIN Dots */}
            <div className="mt-6 flex items-center justify-center gap-3">
              {Array.from({ length: ADMIN_PIN.length }).map((_, idx) => {
                const filled = idx < pinInput.length;
                return (
                  <div
                    key={idx}
                    className={`flex h-12 w-11 items-center justify-center rounded-xl border text-lg font-mono font-semibold transition-all ${
                      filled
                        ? 'border-[#8E2E4E] bg-[#FDF4F6] text-[#8E2E4E]'
                        : 'border-[#E5DCDA] bg-[#FAF8F6] text-transparent'
                    }`}
                  >
                    {filled ? '•' : '0'}
                  </div>
                );
              })}
            </div>

            {/* Hidden keyboard-friendly input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submitPin(pinInput);
              }}
              className="mt-4"
            >
              <input
                type="password"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={ADMIN_PIN.length}
                value={pinInput}
                onChange={(e) => {
                  const clean = e.target.value.replace(/\D/g, '');
                  setPinInput(clean);
                  setPinError('');
                  if (clean.length === ADMIN_PIN.length) {
                    window.setTimeout(() => submitPin(clean), 100);
                  }
                }}
                aria-label="PIN-код"
                placeholder="Введите 4 цифры с клавиатуры"
                className="w-full rounded-xl border border-[#E5DCDA] bg-[#FAF8F6] px-4 py-2.5 text-center font-mono text-sm text-[#231B1E] placeholder:font-sans placeholder:text-xs placeholder:text-[#98888E] focus:border-[#8E2E4E] focus:outline-none"
              />
            </form>

            {pinError && (
              <p
                role="alert"
                className="mt-3 text-center text-xs font-medium text-[#B91C1C]"
              >
                {pinError}
              </p>
            )}

            {/* Touch-friendly keypad */}
            <div className="mt-5 grid grid-cols-3 gap-2.5">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <button
                  key={digit}
                  type="button"
                  onClick={() => handleDigitClick(digit)}
                  className="flex min-h-[48px] items-center justify-center rounded-xl border border-[#EAE2DF] bg-[#FAF8F6] font-mono text-lg font-medium text-[#231B1E] transition-colors hover:bg-[#F3ECE9] active:scale-[0.97]"
                >
                  {digit}
                </button>
              ))}
              <div />
              <button
                type="button"
                onClick={() => handleDigitClick('0')}
                className="flex min-h-[48px] items-center justify-center rounded-xl border border-[#EAE2DF] bg-[#FAF8F6] font-mono text-lg font-medium text-[#231B1E] transition-colors hover:bg-[#F3ECE9] active:scale-[0.97]"
              >
                0
              </button>
              <button
                type="button"
                onClick={handlePinBackspace}
                aria-label="Удалить цифру"
                className="flex min-h-[48px] items-center justify-center rounded-xl border border-[#EAE2DF] bg-[#FAF8F6] text-[#6B5B61] transition-colors hover:bg-[#F3ECE9] active:scale-[0.97]"
              >
                <Delete className="h-5 w-5" />
              </button>
            </div>

            <p className="mt-5 text-center text-xs text-[#8D7D83]">
              Демо-доступ: <span className="font-mono font-medium">1234</span>
            </p>
          </div>
        </main>
      </div>
    );
  }

  const previewTheme = ENVELOPE_THEMES[draftTheme];

  return (
    <div className="min-h-[100dvh] bg-[#FAF8F6] text-[#231B1E]">
      <TopBar
        primaryAction={
          <button
            type="button"
            onClick={handleAddEnvelope}
            className="inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-xl bg-[#8E2E4E] px-4 py-2 text-xs font-medium text-white shadow-sm transition-colors hover:bg-[#762440] whitespace-nowrap shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Добавить конверт</span>
          </button>
        }
      />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        {/* Heading + Summary strip */}
        <div className="flex flex-col justify-between gap-4 border-b border-[#E8E0DD] pb-6 lg:flex-row lg:items-end">
          <div>
            <h1 className="font-editorial text-3xl font-semibold tracking-tight text-[#231B1E] sm:text-4xl">
              Конверты с посланиями
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[#6B5B61] tabular-nums">
              <span>Всего: {stats.total}</span>
              <span aria-hidden="true">·</span>
              <span>Готовы к вручению: {stats.readyCount}</span>
              <span aria-hidden="true">·</span>
              <span>Уже прочитаны: {stats.openedCount}</span>
              <span aria-hidden="true">·</span>
              <span>В копилке: {stats.archiveCount}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {confirmReset ? (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-[#6B5B61]">Сбросить к 12 демо?</span>
                <button
                  type="button"
                  onClick={handleResetDemo}
                  className="min-h-[36px] rounded-lg bg-[#8E2E4E] px-3 py-1.5 font-medium text-white hover:bg-[#762440]"
                >
                  Да
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="min-h-[36px] rounded-lg border border-[#DDD2CF] bg-white px-3 py-1.5 font-medium text-[#6B5B61] hover:text-[#231B1E]"
                >
                  Отмена
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-[#E5DCDA] bg-white px-3.5 py-2 text-xs font-medium text-[#6B5B61] transition-colors hover:border-[#D0C2C6] hover:text-[#231B1E]"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Сбросить демо</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleLock}
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-[#E5DCDA] bg-white px-3.5 py-2 text-xs font-medium text-[#6B5B61] transition-colors hover:border-[#D0C2C6] hover:text-[#231B1E]"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Выйти</span>
            </button>
          </div>
        </div>

        {/* Filter & Search Toolbar */}
        <div className="mt-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div className="inline-flex items-center gap-1 rounded-xl border border-[#E7DFDC] bg-[#F3EFED] p-1">
            {(
              [
                { key: 'all', label: 'Все' },
                { key: 'ready', label: 'Готовы к вручению' },
                { key: 'opened', label: 'Уже прочитаны' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setFilter(tab.key)}
                className={`min-h-[36px] rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  filter === tab.key
                    ? 'bg-white text-[#231B1E] shadow-xs'
                    : 'text-[#6B5B61] hover:text-[#231B1E]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8C7A80]" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск по номеру или тексту…"
              className="min-h-[42px] w-full rounded-xl border border-[#E5DCDA] bg-white pl-10 pr-4 text-sm text-[#231B1E] placeholder:text-[#99888E] focus:border-[#8E2E4E] focus:outline-none"
            />
          </div>
        </div>

        {workspaceError && (
          <div
            role="alert"
            className="mt-6 flex flex-col justify-between gap-3 rounded-2xl border border-[#F0D5DC] bg-[#FFF5F7] p-4 text-sm text-[#9F1239] sm:flex-row sm:items-center"
          >
            <span>{workspaceError}</span>
            <button
              type="button"
              onClick={loadWorkspace}
              className="min-h-[36px] shrink-0 rounded-xl bg-[#8E2E4E] px-4 py-1.5 text-xs font-medium text-white hover:bg-[#762440]"
            >
              Обновить
            </button>
          </div>
        )}

        {/* Envelopes Grid */}
        {isLoading ? (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div
                key={idx}
                className="h-44 animate-pulse rounded-2xl border border-[#EAE2DF] bg-white"
              />
            ))}
          </div>
        ) : filteredEnvelopes.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-dashed border-[#DDD2CF] bg-white/70 p-10 text-center">
            <p className="font-editorial text-2xl font-medium text-[#231B1E]">
              Конверты не найдены
            </p>
            <p className="mt-1.5 text-sm text-[#6B5B61]">
              Попробуйте сбросить фильтр или добавьте новый конверт.
            </p>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredEnvelopes.map((env) => {
              const theme =
                ENVELOPE_THEMES[env.theme] ?? ENVELOPE_THEMES['soft-pink'];
              const formattedNum = formatEnvelopeNumber(env.id);

              return (
                <div
                  key={env.id}
                  onClick={() => openEditor(env)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      openEditor(env);
                    }
                  }}
                  className="group relative flex cursor-pointer flex-col justify-between rounded-2xl border border-[#E7DFDC] bg-white p-5 text-left transition-all duration-150 hover:border-[#CFB8C0] hover:shadow-[0_12px_28px_-14px_rgba(74,25,44,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8E2E4E]"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-semibold text-[#231B1E] tabular-nums">
                          №{formattedNum}
                        </span>
                        <span
                          aria-hidden="true"
                          className="h-2.5 w-2.5 rounded-full border border-black/10"
                          style={{ backgroundColor: theme.swatchColor }}
                        />
                        <span className="text-xs text-[#7D6C72] truncate max-w-[120px]">
                          {theme.label}
                        </span>
                      </div>

                      <Link
                        to={`/c/${env.id}`}
                        onClick={(e) => e.stopPropagation()}
                        title={`Открыть страницу конверта №${formattedNum}`}
                        aria-label={`Открыть страницу конверта №${formattedNum}`}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-[#8D7B81] transition-colors hover:bg-[#F6EEF1] hover:text-[#8E2E4E]"
                      >
                        <ArrowUpRight className="h-4 w-4" />
                      </Link>
                    </div>

                    <div className="mt-2.5 flex items-center gap-1.5 text-xs font-medium">
                      {env.opened ? (
                        <span className="inline-flex items-center gap-1 text-[#7D6870]">
                          <Check className="h-3.5 w-3.5" />
                          Уже прочитан
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[#166534]">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Готов к вручению
                        </span>
                      )}
                    </div>

                    <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-[#382C30]">
                      {env.text ? (
                        env.text
                      ) : (
                        <span className="italic text-[#9D8D93]">
                          Текст пока не добавлен — нажмите, чтобы заполнить
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-[#F2ECE9] pt-3 text-xs text-[#88767C]">
                    <span className="tabular-nums">
                      {formatRussianDate(env.date)}
                    </span>
                    {env.photoUrl && (
                      <span className="inline-flex items-center gap-1 text-[#6F5860]">
                        <ImageIcon className="h-3.5 w-3.5" />
                        <span>Фото</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Add Envelope Tile */}
            <button
              type="button"
              onClick={handleAddEnvelope}
              className="flex min-h-[176px] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-[#D8C9CE] bg-[#FDFBFC] p-5 text-center text-[#6B5B61] transition-colors hover:border-[#8E2E4E] hover:bg-[#FDF4F6] hover:text-[#8E2E4E]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F5EBEF]">
                <Plus className="h-5 w-5" />
              </div>
              <span className="text-sm font-medium">
                Добавить конверт №{formatEnvelopeNumber(envelopes.length + 1)}
              </span>
            </button>
          </div>
        )}
      </main>

      {/* Non-blocking Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-2xl bg-[#231B1E] px-4 py-3 text-sm font-medium text-white shadow-lg"
          >
            <CheckCircle2 className="h-4 w-4 text-[#E8A0B2]" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Envelope Editor Modal */}
      <AnimatePresence>
        {editingEnvelope && (
          <div
            className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby="editor-modal-title"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingEnvelope(null)}
              className="fixed inset-0 bg-[#1B1316]/45 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 flex max-h-[92dvh] w-full max-w-4xl flex-col overflow-hidden rounded-t-3xl border border-[#E7DFDC] bg-[#FAF8F6] shadow-2xl sm:rounded-3xl"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between gap-4 border-b border-[#EAE2DF] bg-white px-5 py-4 sm:px-7">
                <div className="flex items-center gap-3">
                  <h2
                    id="editor-modal-title"
                    className="font-editorial text-2xl font-semibold text-[#231B1E]"
                  >
                    Редактор конверта №
                    {formatEnvelopeNumber(editingEnvelope.id)}
                  </h2>
                  <Link
                    to={`/c/${editingEnvelope.id}`}
                    className="hidden sm:inline-flex items-center gap-1 text-xs font-medium text-[#8E2E4E] hover:underline"
                  >
                    <span>Открыть страницу</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

                <button
                  type="button"
                  onClick={() => setEditingEnvelope(null)}
                  aria-label="Закрыть редактор"
                  className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-[#6B5B61] transition-colors hover:bg-[#F2ECE9] hover:text-[#231B1E]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Body */}
              <form
                onSubmit={handleSaveEnvelope}
                className="flex flex-1 flex-col overflow-hidden"
              >
                <div className="grid flex-1 grid-cols-1 gap-6 overflow-y-auto p-5 sm:p-7 lg:grid-cols-12">
                  {/* Form Fields */}
                  <div className="space-y-5 lg:col-span-7">
                    {/* Theme selector */}
                    <div>
                      <label className="block text-xs font-semibold tracking-wide text-[#5E4E54]">
                        Шаблон оформления
                      </label>
                      <div className="mt-2 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                        {THEME_LIST.map((item) => {
                          const selected = draftTheme === item.id;
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => setDraftTheme(item.id)}
                              className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                                selected
                                  ? 'border-[#8E2E4E] bg-white ring-1 ring-[#8E2E4E]'
                                  : 'border-[#E5DCDA] bg-white hover:border-[#CFC0C5]'
                              }`}
                            >
                              <span
                                className="h-7 w-7 shrink-0 rounded-lg border border-black/10"
                                style={{ backgroundColor: item.swatchColor }}
                              />
                              <div className="min-w-0">
                                <div className="text-sm font-medium text-[#231B1E] truncate">
                                  {item.label}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Date */}
                    <div>
                      <label
                        htmlFor="envelope-date"
                        className="block text-xs font-semibold tracking-wide text-[#5E4E54]"
                      >
                        Дата послания
                      </label>
                      <input
                        id="envelope-date"
                        type="date"
                        value={draftDate}
                        onChange={(e) => setDraftDate(e.target.value)}
                        required
                        className="mt-1.5 min-h-[44px] w-full rounded-xl border border-[#E5DCDA] bg-white px-3.5 py-2 text-sm text-[#231B1E] focus:border-[#8E2E4E] focus:outline-none"
                      />
                    </div>

                    {/* Message Text */}
                    <div>
                      <div className="flex items-center justify-between">
                        <label
                          htmlFor="envelope-text"
                          className="block text-xs font-semibold tracking-wide text-[#5E4E54]"
                        >
                          Текст записки
                        </label>
                        <span className="font-mono text-xs text-[#8D7B81] tabular-nums">
                          {draftText.length} симв.
                        </span>
                      </div>
                      <textarea
                        id="envelope-text"
                        rows={5}
                        value={draftText}
                        onChange={(e) => setDraftText(e.target.value)}
                        placeholder="Напишите нежные слова, повод для улыбки или секретное приглашение…"
                        required
                        className="mt-1.5 w-full rounded-xl border border-[#E5DCDA] bg-white p-3.5 text-sm leading-relaxed text-[#231B1E] placeholder:text-[#A4949A] focus:border-[#8E2E4E] focus:outline-none"
                      />
                    </div>

                    {/* Photo upload + URL */}
                    <div>
                      <label className="block text-xs font-semibold tracking-wide text-[#5E4E54]">
                        Фотография (по желанию)
                      </label>

                      <div className="mt-2 flex flex-wrap items-center gap-2.5">
                        <label className="inline-flex min-h-[42px] cursor-pointer items-center gap-2 rounded-xl border border-[#DFD2D6] bg-white px-4 py-2 text-xs font-medium text-[#231B1E] transition-colors hover:bg-[#F5F0F2]">
                          <Upload className="h-4 w-4 text-[#8E2E4E]" />
                          <span>Загрузить файл</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="sr-only"
                          />
                        </label>

                        {draftPhotoUrl && (
                          <button
                            type="button"
                            onClick={() => setDraftPhotoUrl('')}
                            className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl border border-[#F0D5DC] bg-[#FFF5F7] px-3.5 py-2 text-xs font-medium text-[#9F1239] hover:bg-[#FCE8ED]"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>Удалить фото</span>
                          </button>
                        )}
                      </div>

                      <input
                        type="text"
                        value={
                          draftPhotoUrl.startsWith('data:') ? '' : draftPhotoUrl
                        }
                        onChange={(e) => setDraftPhotoUrl(e.target.value)}
                        placeholder={
                          draftPhotoUrl.startsWith('data:')
                            ? 'Загружено локальное фото (base64)'
                            : 'Или вставьте URL изображения (для Supabase)'
                        }
                        className="mt-2.5 min-h-[40px] w-full rounded-xl border border-[#E5DCDA] bg-white px-3.5 py-2 text-xs text-[#231B1E] placeholder:text-[#9D8D93] focus:border-[#8E2E4E] focus:outline-none"
                      />

                      {uploadError && (
                        <p className="mt-1.5 text-xs text-[#B91C1C]">
                          {uploadError}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Live Card Preview */}
                  <div className="lg:col-span-5">
                    <div className="text-xs font-semibold tracking-wide text-[#5E4E54]">
                      Предпросмотр карточки
                    </div>
                    <div
                      className={`mt-2 rounded-2xl border p-4 shadow-sm ${previewTheme.cardBg} ${previewTheme.cardBorder}`}
                    >
                      <div
                        className={`rounded-xl border p-4 ${previewTheme.innerFrame}`}
                      >
                        <div
                          className={`flex flex-wrap items-center gap-1.5 text-[11px] ${previewTheme.textMuted}`}
                        >
                          <span className="font-mono font-medium tabular-nums">
                            Конверт №{formatEnvelopeNumber(editingEnvelope.id)}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>{formatRussianDate(draftDate)}</span>
                        </div>

                        {draftPhotoUrl && (
                          <div className="mt-3 overflow-hidden rounded-xl">
                            <PhotoFrame
                              src={draftPhotoUrl}
                              alt="Предпросмотр фото"
                              className="aspect-[4/3] w-full max-h-44"
                            />
                          </div>
                        )}

                        <p
                          className={`mt-3 font-editorial text-lg leading-relaxed whitespace-pre-line ${previewTheme.textPrimary}`}
                        >
                          {draftText || 'Здесь появится текст вашего послания…'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex flex-col-reverse items-center justify-between gap-3 border-t border-[#EAE2DF] bg-white px-5 py-4 sm:flex-row sm:px-7">
                  <p className="text-xs text-[#7D6C72]">
                    Сохранение сбрасывает статус в «Готов к вручению»
                  </p>
                  <div className="flex w-full items-center gap-3 sm:w-auto">
                    <button
                      type="button"
                      onClick={() => setEditingEnvelope(null)}
                      className="min-h-[44px] flex-1 rounded-xl border border-[#DFD2D6] bg-white px-4 py-2 text-sm font-medium text-[#5E4E54] hover:bg-[#F5F0F2] sm:flex-none"
                    >
                      Отмена
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="min-h-[44px] flex-1 rounded-xl bg-[#8E2E4E] px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#762440] disabled:opacity-60 sm:flex-none"
                    >
                      {isSaving
                        ? 'Сохраняем…'
                        : 'Сохранить и зарядить конверт'}
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
