import { useEffect } from 'react';
import { Archive, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import type { ArchiveEntry } from '../types';
import {
  ENVELOPE_THEMES,
  formatEnvelopeNumber,
  formatRussianDate,
} from '../themes';
import { PhotoFrame } from './PhotoFrame';

interface MemoryJarModalProps {
  isOpen: boolean;
  onClose: () => void;
  entries: ArchiveEntry[];
  isLoading?: boolean;
}

export function MemoryJarModal({
  isOpen,
  onClose,
  entries,
  isLoading = false,
}: MemoryJarModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="memory-jar-title"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#1B1316]/45 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, y: 28, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 flex max-h-[88dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl bg-[#FAF8F6] shadow-2xl sm:rounded-3xl border border-[#E7DFDC]"
          >
            {/* Drag handle on mobile */}
            <div className="flex justify-center pt-3 sm:hidden">
              <div className="h-1.5 w-10 rounded-full bg-[#D9CED2]" />
            </div>

            <div className="flex items-start justify-between gap-4 border-b border-[#EAE2DF] px-5 py-4 sm:px-7 sm:py-5">
              <div>
                <h2
                  id="memory-jar-title"
                  className="font-editorial text-2xl font-semibold text-[#231B1E] sm:text-3xl"
                >
                  Наша копилка воспоминаний
                </h2>
                <p className="mt-1 text-xs text-[#6B5B61] tabular-nums">
                  Сохранено записок: {entries.length}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Закрыть копилку воспоминаний"
                className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-[#6B5B61] transition-colors hover:bg-[#EFE9E6] hover:text-[#231B1E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8E2E4E]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2].map((skeleton) => (
                    <div
                      key={skeleton}
                      className="h-32 animate-pulse rounded-2xl bg-[#EFE9E6]"
                    />
                  ))}
                </div>
              ) : entries.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F2EAE6] text-[#8E2E4E]">
                    <Archive className="h-6 w-6" strokeWidth={1.6} />
                  </div>
                  <p className="font-editorial text-xl font-medium text-[#231B1E]">
                    Копилка пока ждёт первую записку
                  </p>
                  <p className="mt-2 max-w-sm text-sm text-[#6B5B61]">
                    Откройте конверт и нажмите «Прочитано и съедено», чтобы
                    сохранить тёплое послание здесь навсегда.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {entries.map((entry) => {
                    const theme =
                      ENVELOPE_THEMES[entry.theme] ??
                      ENVELOPE_THEMES['soft-pink'];
                    return (
                      <article
                        key={entry.id}
                        className={`rounded-2xl border p-5 transition-shadow ${theme.cardBg} ${theme.cardBorder}`}
                      >
                        <div
                          className={`mb-3 flex flex-wrap items-center gap-2 text-xs ${theme.textMuted}`}
                        >
                          <span className="font-mono font-medium tabular-nums">
                            №{formatEnvelopeNumber(entry.envelopeId)}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>{formatRussianDate(entry.noteDate)}</span>
                          <span aria-hidden="true">·</span>
                          <span>{theme.label}</span>
                        </div>

                        {entry.photoUrl && (
                          <div className="mb-3.5 overflow-hidden rounded-xl">
                            <PhotoFrame
                              src={entry.photoUrl}
                              alt={`Фото к записке №${entry.envelopeId}`}
                              className="aspect-[4/3] w-full max-h-56"
                            />
                          </div>
                        )}

                        <p
                          className={`font-editorial text-lg leading-relaxed whitespace-pre-line sm:text-xl ${theme.textPrimary}`}
                        >
                          {entry.text}
                        </p>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
