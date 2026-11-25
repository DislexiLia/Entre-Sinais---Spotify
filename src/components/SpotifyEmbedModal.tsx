import React from 'react';
import { ExternalLink, Info, X } from 'lucide-react';
import type { Track } from '../types/music.ts';
import { SpotifyMark } from './BrandAssets.tsx';

interface SpotifyEmbedModalProps {
  track: Track | null;
  albumSpotifyId?: string | null;
  albumTitle?: string | null;
  onClose: () => void;
}

export function SpotifyEmbedModal({ track, albumSpotifyId, albumTitle, onClose }: SpotifyEmbedModalProps) {
  if (!track && !albumSpotifyId) return null;

  let embedSrc = '';
  let externalUrl = '';
  let title = '';

  if (albumSpotifyId) {
    const clean = albumSpotifyId.replace(/^sp-album-/, '');
    embedSrc = `https://open.spotify.com/embed/album/${clean}?utm_source=generator&theme=0`;
    externalUrl = `https://open.spotify.com/intl-pt/album/${clean}`;
    title = albumTitle || 'Álbum no Spotify';
  } else if (track) {
    const spId = track.spotifyUri?.split(':').pop() || (track.id.startsWith('sp-track-') ? track.id.replace('sp-track-', '') : '');
    if (spId) {
      embedSrc = `https://open.spotify.com/embed/track/${spId}?utm_source=generator&theme=0`;
      externalUrl = track.spotifyUrl || `https://open.spotify.com/intl-pt/track/${spId}`;
    }
    title = `${track.title} · ${track.artistName}`;
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Player Oficial do Spotify"
    >
      <div
        className="w-full max-w-lg bg-[#181818] border border-white/10 rounded-2xl p-5 shadow-2xl space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <SpotifyMark className="w-6 h-6 text-[#1DB954] shrink-0" />
            <div className="min-w-0">
              <h2 className="text-base font-bold text-white truncate">Spotify Oficial (Embed)</h2>
              <p className="text-xs text-[#b3b3b3] truncate">{title}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar player do Spotify"
            className="w-9 h-9 rounded-full flex items-center justify-center text-[#b3b3b3] hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-xs text-[#b3b3b3] leading-relaxed">
          <Info className="w-4 h-4 text-[#1DB954] shrink-0 mt-0.5" />
          <span>
            No player principal abaixo você ouve as prévias oficiais instantaneamente sem precisar de login. Aqui no{' '}
            <strong className="text-white">Spotify Embed oficial</strong>, se você estiver conectado à sua conta Spotify (ou Premium) neste navegador, poderá reproduzir a faixa completa diretamente.
          </span>
        </div>

        {embedSrc ? (
          <iframe
            title={`Spotify Embed: ${title}`}
            src={embedSrc}
            width="100%"
            height={albumSpotifyId ? 380 : 152}
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            className="rounded-xl border-0 bg-[#121212]"
          />
        ) : (
          <div className="p-6 rounded-xl bg-[#121212] text-center space-y-3">
            <p className="text-sm text-[#b3b3b3]">
              Esta faixa foi localizada via busca global. Você pode ouvi-la no player do app ou abrir diretamente no Spotify.
            </p>
            {track?.spotifyUrl && (
              <a
                href={track.spotifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1DB954] text-black text-sm font-bold hover:brightness-110 transition"
              >
                Buscar no Spotify <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        )}

        {externalUrl && (
          <div className="flex justify-end">
            <a
              href={externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1DB954] hover:underline"
            >
              Abrir no aplicativo Spotify <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
