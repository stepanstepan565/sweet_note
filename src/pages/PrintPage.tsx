import { useEffect, useMemo, useState } from 'react';
import { Printer } from 'lucide-react';
import { TopBar } from '../components/TopBar';
import { QrCodeTile } from '../components/QrCodeTile';
import { storageService } from '../services/storageService';
import type { QrColorPreset, QrDotStyle } from '../types';
import { formatEnvelopeNumber } from '../themes';

const COLOR_PRESETS: Array<{
  id: QrColorPreset;
  label: string;
  swatchStyle: string;
}> = [
  {
    id: 'burgundy',
    label: 'Бордовый',
    swatchStyle: '#7A1F3D',
  },
  {
    id: 'chocolate',
    label: 'Шоколадный',
    swatchStyle: '#4A2C1D',
  },
  {
    id: 'black',
    label: 'Чёрный',
    swatchStyle: '#18181B',
  },
  {
    id: 'gradient',
    label: 'Градиент',
    swatchStyle: 'linear-gradient(135deg, #8E2E4E 0%, #C58B43 100%)',
  },
];

export function PrintPage() {
  const [colorPreset, setColorPreset] = useState<QrColorPreset>('burgundy');
  const [dotStyle, setDotStyle] = useState<QrDotStyle>('rounded');
  const [sizeMm, setSizeMm] = useState<number>(30);
  const [rangeStart, setRangeStart] = useState<number>(1);
  const [rangeEnd, setRangeEnd] = useState<number>(12);
  const [maxAvailableId, setMaxAvailableId] = useState<number>(30);

  useEffect(() => {
    storageService
      .getEnvelopes()
      .then((list) => {
        const highest = list.reduce((max, item) => Math.max(max, item.id), 30);
        setMaxAvailableId(Math.max(30, highest));
      })
      .catch(() => {
        setMaxAvailableId(30);
      });
  }, []);

  const baseOriginPath = useMemo(() => {
    if (typeof window === 'undefined') return '';
    const cleanPath = window.location.pathname.replace(/\/+$/, '');
    return `${window.location.origin}${cleanPath}`;
  }, []);

  const ids = useMemo(() => {
    const safeStart = Math.max(1, Math.min(rangeStart, rangeEnd));
    const safeEnd = Math.min(maxAvailableId, Math.max(rangeStart, rangeEnd));
    const result: number[] = [];
    for (let i = safeStart; i <= safeEnd; i += 1) {
      result.push(i);
    }
    return result;
  }, [rangeStart, rangeEnd, maxAvailableId]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-[100dvh] bg-[#F2ECEA] text-[#231B1E] print:bg-white">
      <TopBar
        primaryAction={
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex min-h-[40px] items-center justify-center gap-2 rounded-xl bg-[#8E2E4E] px-4 py-2 text-xs font-medium text-white shadow-sm transition-colors hover:bg-[#762440] whitespace-nowrap shrink-0"
          >
            <Printer className="h-4 w-4" />
            <span>Распечатать лист (A4)</span>
          </button>
        }
      />

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 print:p-0 print:max-w-none">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 print:block">
          {/* Left Settings Panel — Hidden on Print */}
          <aside className="no-print lg:col-span-4">
            <div className="sticky top-24 rounded-3xl border border-[#E7DFDC] bg-white p-6 shadow-sm">
              <h1 className="font-editorial text-3xl font-semibold text-[#231B1E]">
                Настройка QR-листа
              </h1>
              <p className="mt-1.5 text-sm text-[#6B5B61]">
                Подготовьте наклейки нужного размера для конфетных конвертиков
                и вырежьте по пунктирным линиям.
              </p>

              <div className="mt-6 space-y-6">
                {/* Color Selector */}
                <div>
                  <label className="block text-xs font-semibold tracking-wide text-[#5E4E54]">
                    Цвет точек QR-кода
                  </label>
                  <div className="mt-2.5 grid grid-cols-2 gap-2.5">
                    {COLOR_PRESETS.map((preset) => {
                      const active = colorPreset === preset.id;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => setColorPreset(preset.id)}
                          className={`flex min-h-[44px] items-center gap-2.5 rounded-xl border px-3 py-2 text-left text-xs font-medium transition-all ${
                            active
                              ? 'border-[#8E2E4E] bg-[#FDF4F6] text-[#231B1E] ring-1 ring-[#8E2E4E]'
                              : 'border-[#E5DCDA] bg-white text-[#5A4B50] hover:border-[#CFC0C5]'
                          }`}
                        >
                          <span
                            className="h-4 w-4 shrink-0 rounded-full border border-black/10"
                            style={{ background: preset.swatchStyle }}
                          />
                          <span className="truncate">{preset.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Dot Shape Selector */}
                <div>
                  <label className="block text-xs font-semibold tracking-wide text-[#5E4E54]">
                    Форма точек
                  </label>
                  <div className="mt-2.5 grid grid-cols-2 gap-2.5">
                    {(
                      [
                        { id: 'rounded', label: 'Скруглённые (rounded)' },
                        { id: 'dots', label: 'Точки (dots)' },
                      ] as const
                    ).map((shape) => {
                      const active = dotStyle === shape.id;
                      return (
                        <button
                          key={shape.id}
                          type="button"
                          onClick={() => setDotStyle(shape.id)}
                          className={`min-h-[44px] rounded-xl border px-3 py-2 text-xs font-medium transition-all ${
                            active
                              ? 'border-[#8E2E4E] bg-[#FDF4F6] text-[#231B1E] ring-1 ring-[#8E2E4E]'
                              : 'border-[#E5DCDA] bg-white text-[#5A4B50] hover:border-[#CFC0C5]'
                          }`}
                        >
                          {shape.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Size in Millimeters Slider */}
                <div>
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="qr-size-slider"
                      className="text-xs font-semibold tracking-wide text-[#5E4E54]"
                    >
                      Размер QR-кода
                    </label>
                    <span className="font-mono text-sm font-semibold text-[#8E2E4E] tabular-nums">
                      {sizeMm} мм
                    </span>
                  </div>
                  <input
                    id="qr-size-slider"
                    type="range"
                    min={20}
                    max={45}
                    step={1}
                    value={sizeMm}
                    onChange={(e) => setSizeMm(Number(e.target.value))}
                    className="mt-3 h-2 w-full cursor-pointer accent-[#8E2E4E]"
                  />
                  <div className="mt-1 flex justify-between font-mono text-[11px] text-[#8D7B81] tabular-nums">
                    <span>20 мм</span>
                    <span>32 мм</span>
                    <span>45 мм</span>
                  </div>
                </div>

                {/* Number Range */}
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold tracking-wide text-[#5E4E54]">
                      Диапазон номеров
                    </span>
                    <div className="flex items-center gap-1.5 text-xs">
                      <button
                        type="button"
                        onClick={() => {
                          setRangeStart(1);
                          setRangeEnd(12);
                        }}
                        className="rounded-md px-2 py-1 text-[#6B5B61] hover:bg-[#F3ECE9] hover:text-[#231B1E]"
                      >
                        1–12
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setRangeStart(1);
                          setRangeEnd(30);
                        }}
                        className="rounded-md px-2 py-1 text-[#6B5B61] hover:bg-[#F3ECE9] hover:text-[#231B1E]"
                      >
                        1–30
                      </button>
                    </div>
                  </div>

                  <div className="mt-2.5 grid grid-cols-2 gap-3">
                    <div>
                      <label
                        htmlFor="range-start"
                        className="block text-[11px] text-[#7D6C72]"
                      >
                        С номера
                      </label>
                      <input
                        id="range-start"
                        type="number"
                        min={1}
                        max={maxAvailableId}
                        value={rangeStart}
                        onChange={(e) =>
                          setRangeStart(
                            Math.max(
                              1,
                              Math.min(maxAvailableId, Number(e.target.value) || 1)
                            )
                          )
                        }
                        className="mt-1 min-h-[42px] w-full rounded-xl border border-[#E5DCDA] bg-[#FAF8F6] px-3 font-mono text-sm text-[#231B1E] tabular-nums focus:border-[#8E2E4E] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="range-end"
                        className="block text-[11px] text-[#7D6C72]"
                      >
                        По номер
                      </label>
                      <input
                        id="range-end"
                        type="number"
                        min={1}
                        max={maxAvailableId}
                        value={rangeEnd}
                        onChange={(e) =>
                          setRangeEnd(
                            Math.max(
                              1,
                              Math.min(maxAvailableId, Number(e.target.value) || 1)
                            )
                          )
                        }
                        className="mt-1 min-h-[42px] w-full rounded-xl border border-[#E5DCDA] bg-[#FAF8F6] px-3 font-mono text-sm text-[#231B1E] tabular-nums focus:border-[#8E2E4E] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Encoded URL preview */}
                <div className="rounded-2xl border border-[#ECE4E1] bg-[#FAF8F6] p-3.5">
                  <div className="text-[11px] font-medium text-[#7D6C72]">
                    Пример ссылки внутри кода №
                    {formatEnvelopeNumber(ids[0] ?? 1)}
                  </div>
                  <div className="mt-1 break-all font-mono text-[11px] text-[#3B2E33]">
                    {baseOriginPath}/#/c/{ids[0] ?? 1}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handlePrint}
                  className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl bg-[#8E2E4E] px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#762440]"
                >
                  <Printer className="h-4 w-4" />
                  <span>Распечатать лист (A4)</span>
                </button>
              </div>
            </div>
          </aside>

          {/* Right A4 Sheet Preview */}
          <section className="lg:col-span-8 print:w-full">
            <div className="no-print mb-3 flex items-center justify-between text-xs text-[#6B5B61]">
              <span>Предпросмотр листа A4 (210 × 297 мм)</span>
              <span className="font-mono tabular-nums">
                Кодов на листе: {ids.length}
              </span>
            </div>

            <div className="overflow-x-auto pb-6 print:overflow-visible print:pb-0">
              <div className="print-sheet mx-auto w-[210mm] min-h-[297mm] border border-[#E2D9D6] bg-white p-[10mm] shadow-[0_18px_45px_-20px_rgba(35,27,30,0.25)]">
                <div className="flex flex-wrap content-start justify-start gap-[4mm]">
                  {ids.map((id) => (
                    <QrCodeTile
                      key={id}
                      envelopeId={id}
                      url={`${baseOriginPath}/#/c/${id}`}
                      sizeMm={sizeMm}
                      dotStyle={dotStyle}
                      colorPreset={colorPreset}
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
