import { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';

interface PhotoFrameProps {
  src: string;
  alt: string;
  className?: string;
}

export function PhotoFrame({ src, alt, className = '' }: PhotoFrameProps) {
  const [hasError, setHasError] = useState(false);

  const resolvedSrc = src.startsWith('/src/assets/')
    ? `${import.meta.env.BASE_URL}${src.slice(1)}`
    : src;

  if (hasError || !resolvedSrc) {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-[#F4EAEF] to-[#EBE3DA] p-6 text-center text-[#7A6A70] ${className}`}
      >
        <ImageIcon className="h-6 w-6 opacity-60" strokeWidth={1.5} />
        <span className="text-xs font-medium">{alt || 'Фото воспоминания'}</span>
      </div>
    );
  }

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={`object-cover ${className}`}
    />
  );
}
