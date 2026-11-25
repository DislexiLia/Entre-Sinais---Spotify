import React, { useState } from 'react';
import { Disc3, Music } from 'lucide-react';

export const ENTRE_SINAIS_LOGO_URL = '/assets/aistudio/Logo_entre_sinais_428f4cdc.png';
export const ENTRE_SINAIS_KV_URL = '/assets/aistudio/KV_1c7d16c0.png';

export function formatMs(ms: number): string {
  if (!ms || ms <= 0) return '—';
  const totalSec = Math.floor(ms / 1000);
  const mins = Math.floor(totalSec / 60);
  const secs = totalSec % 60;
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

export function formatSec(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return '0:00';
  const total = Math.floor(sec);
  const mins = Math.floor(total / 60);
  const rem = total % 60;
  return `${mins}:${String(rem).padStart(2, '0')}`;
}

export function SpotifyMark({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="currentColor">
      <path d="M12 1.5C6.201 1.5 1.5 6.201 1.5 12S6.201 22.5 12 22.5 22.5 17.799 22.5 12 17.799 1.5 12 1.5zm4.812 15.146a.748.748 0 01-1.028.248c-2.816-1.72-6.36-2.109-10.534-1.155a.748.748 0 11-.334-1.459c4.567-1.044 8.485-.594 11.648 1.338a.748.748 0 01.248 1.028zm1.284-2.858a.936.936 0 01-1.287.308c-3.222-1.981-8.133-2.555-11.944-1.398a.937.937 0 01-.545-1.793c4.354-1.321 9.766-.681 13.468 1.594a.937.937 0 01.308 1.289zm.11-2.976C14.342 8.516 7.967 8.305 4.278 9.425a1.123 1.123 0 11-.652-2.15c4.234-1.285 11.276-1.037 15.729 1.606a1.123 1.123 0 01-1.149 1.931z" />
    </svg>
  );
}

export function EntreSinaisLogo({
  size = 'md',
  className = '',
}: {
  size?: 'xxs' | 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const heightCls =
    size === 'xxs'
      ? 'h-3'
      : size === 'xs'
      ? 'h-4'
      : size === 'sm'
      ? 'h-5'
      : size === 'lg'
      ? 'h-10 sm:h-12'
      : 'h-7';

  return (
    <img
      src={ENTRE_SINAIS_LOGO_URL}
      alt="Entre Sinais"
      className={`w-auto object-contain select-none ${heightCls} ${className}`}
    />
  );
}

export function EqualizerBars() {
  return (
    <span className="inline-flex items-end gap-[2px] h-3.5 w-4 justify-center" aria-label="Tocando agora">
      <i className="eq-bar w-[3px] h-full bg-[#1DB954] rounded-[1px]" />
      <i className="eq-bar w-[3px] h-full bg-[#1DB954] rounded-[1px]" />
      <i className="eq-bar w-[3px] h-full bg-[#1DB954] rounded-[1px]" />
    </span>
  );
}

interface CoverImageProps {
  src?: string;
  alt: string;
  className?: string;
  rounded?: 'sm' | 'md' | 'full';
  fallbackType?: 'album' | 'artist' | 'playlist';
}

export function CoverImage({
  src,
  alt,
  className = 'w-full aspect-square',
  rounded = 'md',
  fallbackType = 'album',
}: CoverImageProps) {
  const [failed, setFailed] = useState(false);
  const radiusClass = rounded === 'full' ? 'rounded-full' : rounded === 'sm' ? 'rounded' : 'rounded-md';

  if (!src || failed) {
    return (
      <div
        className={`${className} ${radiusClass} bg-gradient-to-br from-[#282828] via-[#1f2922] to-[#121212] flex items-center justify-center text-[#b3b3b3] shrink-0`}
        aria-label={alt}
      >
        {fallbackType === 'album' ? <Disc3 className="w-1/3 h-1/3 opacity-70" /> : <Music className="w-1/3 h-1/3 opacity-70" />}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={`${className} ${radiusClass} object-cover bg-[#282828] shrink-0`}
    />
  );
}
