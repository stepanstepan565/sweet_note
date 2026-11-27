import { useEffect, useRef } from 'react';
import QRCodeStyling from 'qr-code-styling';
import type { QrColorPreset, QrDotStyle } from '../types';
import { formatEnvelopeNumber } from '../themes';

interface QrCodeTileProps {
  envelopeId: number;
  url: string;
  sizeMm: number;
  dotStyle: QrDotStyle;
  colorPreset: QrColorPreset;
}

function buildColorOptions(preset: QrColorPreset) {
  if (preset === 'gradient') {
    return {
      gradient: {
        type: 'linear' as const,
        rotation: Math.PI / 4,
        colorStops: [
          { offset: 0, color: '#8E2E4E' },
          { offset: 1, color: '#C58B43' },
        ],
      },
    };
  }

  const map: Record<Exclude<QrColorPreset, 'gradient'>, string> = {
    burgundy: '#7A1F3D',
    chocolate: '#4A2C1D',
    black: '#18181B',
  };

  return {
    color: map[preset],
  };
}

export function QrCodeTile({
  envelopeId,
  url,
  sizeMm,
  dotStyle,
  colorPreset,
}: QrCodeTileProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const colorOpts = buildColorOptions(colorPreset);

    const qrCode = new QRCodeStyling({
      width: 240,
      height: 240,
      type: 'svg',
      data: url,
      margin: 2,
      qrOptions: {
        errorCorrectionLevel: 'M',
      },
      dotsOptions: {
        type: dotStyle,
        ...colorOpts,
      },
      cornersSquareOptions: {
        type: dotStyle === 'dots' ? 'dot' : 'extra-rounded',
        ...colorOpts,
      },
      cornersDotOptions: {
        type: 'dot',
        ...colorOpts,
      },
      backgroundOptions: {
        color: '#FFFFFF',
      },
    });

    el.innerHTML = '';
    qrCode.append(el);

    return () => {
      el.innerHTML = '';
    };
  }, [url, dotStyle, colorPreset]);

  return (
    <div className="qr-sticker-cell inline-flex flex-col items-center justify-center border border-dashed border-[#B9AFB3] bg-white p-[3mm]">
      <div
        ref={containerRef}
        style={{ width: `${sizeMm}mm`, height: `${sizeMm}mm` }}
        className="flex items-center justify-center [&>svg]:h-full [&>svg]:w-full"
        aria-label={`QR-код для конверта №${formatEnvelopeNumber(envelopeId)}`}
      />
      <div className="mt-[1.8mm] font-mono text-[9pt] font-semibold tracking-wider text-[#2C2226] tabular-nums">
        №{formatEnvelopeNumber(envelopeId)}
      </div>
    </div>
  );
}
