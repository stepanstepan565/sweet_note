import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { AnimatePresence, motion } from 'motion/react';
import { Archive, Check, RotateCcw, Sparkles } from 'lucide-react';
import { storageService } from '../services/storageService';
import type { ArchiveEntry, Envelope } from '../types';
import {
  ENVELOPE_THEMES,
  formatEnvelopeNumber,
  formatRussianDate,
} from '../themes';
import { MemoryJarModal } from '../components/MemoryJarModal';
import { PhotoFrame } from '../components/PhotoFrame';

function triggerRoseGoldConfetti(intensity: 'open' | 'save' = 'open') {
  if (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    return;
  }

  const colors = [
    '#E8A0B2',
    '#D4AF37',
    '#F6D3D8',
    '#C87D87',
    '#F2D096',
    '#9D3B56',
  ];

  if (intensity === 'open') {
    confetti({
      particleCount: 72,
      spread: 68,
      startVelocity: 32,
      origin: { y: 0.56 },
      colors,
      ticks: 220,
      scalar: 0.95,
    });
    window.setTimeout(() => {
      confetti({
        particleCount: 36,
        angle: 60,
        spread: 52,
        origin: { x: 0.15, y: 0.62 },
        colors,
        scalar: 0.85,
      });
      confetti({
        particleCount: 36,
        angle: 120,
        spread: 52,
        origin: { x: 0.85, y: 0.62 },
        colors,
        scalar: 0.85,
      });
    }, 160);
  } else {
    confetti({
      particleCount: 40,
      spread: 55,
      startVelocity: 24,
      origin: { y: 0.72 },
      colors,
      scalar: 0.85,
    });
  }
}

export function EnvelopePage() {
  const { id } = useParams<{ id: string }>();
  const numericId = Number(id);

  const [envelope, setEnvelope] = useState<Envelope | null>(null);
  const [archive, setArchive] = useState<ArchiveEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnvelopeOpen, setIsEnvelopeOpen] = useState(false);
  const [isSavingRead, setIsSavingRead] = useState(false);
  const [justArchived, setJustArchived] = useState(false);
  const [isMemoryModalOpen, setIsMemoryModalOpen] = useState(false);
  const [loadError, setLoadError] = useState('');

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setLoadError('');
    setIsEnvelopeOpen(false);
    setJustArchived(false);

    try {
      const [foundEnvelope, archiveList] = await Promise.all([
        Number.isFinite(numericId) && numericId > 0
          ? storageService.getEnvelopeById(numericId)
          : Promise.resolve(null),
        storageService.getArchive(),
      ]);
      setEnvelope(foundEnvelope);
      setArchive(archiveList);
    } catch (err) {
      setLoadError(
        err instanceof Error
          ? err.message
          : 'Не удалось загрузить данные конверта из Supabase.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [numericId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenEnvelope = () => {
    setIsEnvelopeOpen(true);
    triggerRoseGoldConfetti('open');
  };

  const handleMarkAsReadAndEaten = async () => {
    if (!envelope || isSavingRead || envelope.opened) return;
    setIsSavingRead(true);
    setLoadError('');
    try {
      const { envelope: updated, archiveEntry } =
        await storageService.markAsOpenedAndArchive(envelope.id);
      setEnvelope(updated);
      setArchive((prev) => [archiveEntry, ...prev]);
      setJustArchived(true);
      triggerRoseGoldConfetti('save');
    } catch (err) {
      setLoadError(
        err instanceof Error
          ? err.message
          : 'Не удалось сохранить послание в копилку.'
      );
    } finally {
      setIsSavingRead(false);
    }
  };

  const activeTheme = envelope
    ? ENVELOPE_THEMES[envelope.theme] ?? ENVELOPE_THEMES['soft-pink']
    : ENVELOPE_THEMES['soft-pink'];

  const formattedNumber = Number.isFinite(numericId) && numericId > 0
    ? formatEnvelopeNumber(numericId)
    : '??';

  return (
    <div className="relative flex min-h-[100dvh] flex-col justify-between overflow-x-hidden bg-[#FAF8F6] px-4 py-6 sm:px-6 sm:py-10 paper-grain">
      {/* Soft ambient background tint */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 overflow-hidden"
      >
        <div
          className="absolute -top-32 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full opacity-45 blur-3xl transition-colors duration-700"
          style={{
            background:
              isEnvelopeOpen && envelope
                ? `radial-gradient(circle, ${activeTheme.swatchColor} 0%, transparent 70%)`
                : 'radial-gradient(circle, #F4DDE3 0%, transparent 70%)',
          }}
        />
      </div>

      {/* Quiet wordmark header */}
      <header className="relative z-10 flex items-center justify-center pt-1">
        <Link
          to="/"
          className="font-editorial text-xl font-semibold tracking-tight text-[#5F474F] transition-colors hover:text-[#231B1E]"
        >
          SweetNotes
        </Link>
      </header>

      {/* Main Focal Area */}
      <main className="relative z-10 mx-auto my-auto flex w-full max-w-md flex-col items-center py-6">
        {isLoading ? (
          <div className="w-full animate-pulse rounded-3xl border border-[#EADFE2] bg-white/80 p-8 shadow-sm">
            <div className="mx-auto h-40 w-56 rounded-2xl bg-[#F2E9EC]" />
            <div className="mx-auto mt-6 h-6 w-48 rounded bg-[#EFE6E9]" />
            <div className="mx-auto mt-4 h-12 w-40 rounded-2xl bg-[#E8DCE0]" />
          </div>
        ) : loadError ? (
          <div className="w-full rounded-3xl border border-[#F0D5DC] bg-white p-7 text-center shadow-[0_14px_40px_-16px_rgba(61,22,36,0.12)] sm:p-9">
            <p className="font-mono text-xs tracking-wide text-[#9F1239]">
              Ошибка подключения к базе
            </p>
            <h1 className="mt-2 font-editorial text-2xl font-semibold text-[#231B1E] text-balance">
              Не удалось загрузить конверт №{formattedNumber}
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-[#6B5B61]">
              {loadError}
            </p>
            <button
              type="button"
              onClick={loadData}
              className="mt-6 inline-flex min-h-[46px] w-full items-center justify-center rounded-2xl bg-[#8E2E4E] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#762440]"
            >
              Повторить попытку
            </button>
          </div>
        ) : !envelope ? (
          <div className="w-full rounded-3xl border border-[#E7DFDC] bg-white p-7 text-center shadow-[0_14px_40px_-16px_rgba(61,22,36,0.12)] sm:p-9">
            <p className="font-mono text-xs tracking-wide text-[#8A757D] tabular-nums">
              Конверт №{formattedNumber}
            </p>
            <h1 className="mt-2 font-editorial text-3xl font-semibold text-[#231B1E] text-balance">
              Этот конвертик ещё ждёт своё послание
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-[#6B5B61]">
              Возможно, автор ещё не успел наполнить его тёплыми словами или
              номер указан с опечаткой.
            </p>
            <div className="mt-7 flex flex-col gap-3">
              <Link
                to="/admin"
                className="inline-flex min-h-[48px] w-full items-center justify-center rounded-2xl bg-[#8E2E4E] px-6 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#76243F]"
              >
                Заполнить в панели управления
              </Link>
              <Link
                to="/c/1"
                className="inline-flex min-h-[44px] w-full items-center justify-center rounded-2xl text-sm font-medium text-[#6B5B61] transition-colors hover:text-[#231B1E]"
              >
                Открыть пример №01
              </Link>
            </div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {!isEnvelopeOpen ? (
              <motion.section
                key="closed-envelope"
                initial={{ opacity: 0, y: 16, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -14, scale: 0.96 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                className="w-full"
              >
                <div className="relative overflow-hidden rounded-3xl border border-[#E9DCE0] bg-white/95 p-6 text-center shadow-[0_20px_50px_-20px_rgba(74,25,44,0.18)] sm:p-8">
                  {/* Stylized tactile paper envelope illustration */}
                  <div className="mx-auto mb-6 w-full max-w-[270px]">
                    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-[#E6D6DA] bg-gradient-to-b from-[#FDF7F8] to-[#F7EAEF] shadow-[0_10px_28px_-12px_rgba(95,38,56,0.22)]">
                      {/* Envelope flap lines */}
                      <svg
                        viewBox="0 0 280 210"
                        className="h-full w-full"
                        aria-hidden="true"
                      >
                        {/* Bottom fold triangle */}
                        <path
                          d="M0 210 L140 108 L280 210 Z"
                          fill="#F3E2E7"
                          stroke="#E5CFD6"
                          strokeWidth="1"
                        />
                        {/* Side folds */}
                        <path
                          d="M0 0 L118 105 L0 210 Z"
                          fill="#F8ECF0"
                          stroke="#E5CFD6"
                          strokeWidth="1"
                        />
                        <path
                          d="M280 0 L162 105 L280 210 Z"
                          fill="#F8ECF0"
                          stroke="#E5CFD6"
                          strokeWidth="1"
                        />
                        {/* Top closed flap */}
                        <path
                          d="M0 0 L140 122 L280 0 Z"
                          fill="#FFF9FA"
                          stroke="#E0C7CF"
                          strokeWidth="1.2"
                        />
                      </svg>

                      {/* Wax seal with envelope number */}
                      <div className="absolute left-1/2 top-[56%] flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#8E2E4E] text-white shadow-[0_6px_16px_rgba(142,46,78,0.42)] ring-4 ring-[#8E2E4E]/15">
                        <span className="font-mono text-sm font-semibold tracking-tight tabular-nums">
                          №{formattedNumber}
                        </span>
                      </div>
                    </div>
                  </div>

                  <h1 className="font-editorial text-3xl font-semibold tracking-tight text-[#231B1E] text-balance sm:text-[34px]">
                    Сладкий сюрприз №{envelope.id}
                  </h1>

                  <p className="mt-2.5 text-sm leading-relaxed text-[#6B5B61]">
                    {envelope.opened
                      ? 'Это послание уже открыто и бережно хранится в вашей копилке.'
                      : 'Внутри маленького конверта спрятано тёплое послание для тебя.'}
                  </p>

                  <div className="mt-7">
                    <button
                      type="button"
                      onClick={handleOpenEnvelope}
                      className="inline-flex min-h-[50px] w-full items-center justify-center gap-2.5 rounded-2xl bg-[#8E2E4E] px-7 py-3.5 text-base font-medium text-white shadow-[0_10px_24px_-8px_rgba(142,46,78,0.5)] transition-all duration-150 hover:bg-[#772440] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8E2E4E] focus-visible:ring-offset-2"
                    >
                      <Sparkles className="h-4 w-4" strokeWidth={1.8} />
                      <span>Открыть</span>
                    </button>
                  </div>
                </div>
              </motion.section>
            ) : (
              <motion.section
                key="opened-card"
                initial={{ opacity: 0, y: 22, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 14, scale: 0.97 }}
                transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
                className="w-full"
              >
                <article
                  className={`relative overflow-hidden rounded-3xl border p-5 shadow-[0_22px_55px_-20px_rgba(45,25,30,0.22)] sm:p-7 ${activeTheme.cardBg} ${activeTheme.cardBorder}`}
                >
                  {/* Inner fine stationery frame */}
                  <div
                    className={`rounded-2xl border p-5 sm:p-6 ${activeTheme.innerFrame}`}
                  >
                    {/* Metadata line — clean unboxed typography */}
                    <div
                      className={`flex flex-wrap items-center gap-2 text-xs ${activeTheme.textMuted}`}
                    >
                      <span className="font-mono font-medium tabular-nums">
                        Конверт №{formattedNumber}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{formatRussianDate(envelope.date)}</span>
                      <span aria-hidden="true">·</span>
                      <span>{activeTheme.label}</span>
                    </div>

                    {/* Optional attached photograph */}
                    {envelope.photoUrl && (
                      <div className="mt-5 overflow-hidden rounded-2xl shadow-sm">
                        <PhotoFrame
                          src={envelope.photoUrl}
                          alt={`Фото к посланию №${envelope.id}`}
                          className="aspect-[4/3] w-full"
                        />
                      </div>
                    )}

                    {/* Message body */}
                    <div className="mt-5">
                      {envelope.text ? (
                        <p
                          className={`font-editorial text-[22px] leading-[1.55] whitespace-pre-line sm:text-[24px] ${activeTheme.textPrimary}`}
                        >
                          {envelope.text}
                        </p>
                      ) : (
                        <p
                          className={`font-editorial text-xl italic ${activeTheme.textMuted}`}
                        >
                          Текст послания для этого конверта пока не добавлен.
                        </p>
                      )}
                    </div>

                    {/* Action Area */}
                    <div className="mt-7 border-t border-current/10 pt-5">
                      {!envelope.opened ? (
                        <button
                          type="button"
                          onClick={handleMarkAsReadAndEaten}
                          disabled={isSavingRead || !envelope.text}
                          className={`inline-flex min-h-[50px] w-full items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-semibold shadow-sm transition-all duration-150 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                            activeTheme.isDark
                              ? 'bg-[#D7B472] text-[#1E1B28] hover:bg-[#E2C284] focus-visible:ring-[#D7B472]'
                              : 'bg-[#8E2E4E] text-white hover:bg-[#772440] focus-visible:ring-[#8E2E4E]'
                          }`}
                        >
                          <span>❤️</span>
                          <span>
                            {isSavingRead
                              ? 'Сохраняем в копилку…'
                              : 'Прочитано и съедено'}
                          </span>
                        </button>
                      ) : (
                        <div className="flex flex-col gap-3">
                          <div
                            className={`flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-medium ${activeTheme.accentBorder} ${activeTheme.textPrimary}`}
                          >
                            <Check className="h-4 w-4 shrink-0" />
                            <span>
                              {justArchived
                                ? 'Сохранено в копилку воспоминаний!'
                                : 'Уже в нашей копилке воспоминаний'}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setIsEnvelopeOpen(false)}
                            className={`inline-flex min-h-[44px] items-center justify-center gap-1.5 text-xs font-medium transition-opacity hover:opacity-80 ${activeTheme.textMuted}`}
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                            <span>Свернуть конверт</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              </motion.section>
            )}
          </AnimatePresence>
        )}
      </main>

      {/* Bottom Memory Jar Link + Quiet Owner Link */}
      <footer className="relative z-10 mx-auto flex w-full max-w-md flex-col items-center gap-3 pb-2 pt-4 text-center">
        <button
          type="button"
          onClick={() => setIsMemoryModalOpen(true)}
          className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-[#5A3E48] underline decoration-[#D4B8C1] underline-offset-4 transition-colors hover:text-[#231B1E] hover:decoration-[#8E2E4E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8E2E4E]"
        >
          <Archive className="h-4 w-4" strokeWidth={1.7} />
          <span>
            Открыть нашу копилку воспоминаний
            <span className="ml-1.5 font-mono text-xs text-[#8A7179] tabular-nums">
              ({archive.length})
            </span>
          </span>
        </button>

        <div className="flex items-center gap-3 text-xs text-[#9C8B91]">
          <Link to="/admin" className="hover:text-[#5F474F] transition-colors">
            Панель управления
          </Link>
          <span aria-hidden="true">·</span>
          <Link to="/print" className="hover:text-[#5F474F] transition-colors">
            Печать QR
          </Link>
        </div>
      </footer>

      <MemoryJarModal
        isOpen={isMemoryModalOpen}
        onClose={() => setIsMemoryModalOpen(false)}
        entries={archive}
      />
    </div>
  );
}
