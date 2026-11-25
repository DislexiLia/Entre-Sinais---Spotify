import React from 'react';
import { Hand, Heart, Pause, Play, Plus } from 'lucide-react';
import type { Track } from '../types/music.ts';
import { CoverImage, EqualizerBars, formatMs } from './BrandAssets.tsx';

interface TrackRowProps {
  track: Track;
  index: number;
  isCurrent: boolean;
  isPlaying: boolean;
  isLiked: boolean;
  showCover?: boolean;
  showAlbum?: boolean;
  onPlay: () => void;
  onToggleLike: (track: Track) => void;
  onAddToPlaylist: (track: Track) => void;
  onOpenArtist: (artistId: string) => void;
  onOpenAlbum: (albumId: string) => void;
  onOpenLibras?: (clipId: string) => void;
}

export function TrackRow({
  track,
  index,
  isCurrent,
  isPlaying,
  isLiked,
  showCover = true,
  showAlbum = true,
  onPlay,
  onToggleLike,
  onAddToPlaylist,
  onOpenArtist,
  onOpenAlbum,
  onOpenLibras,
}: TrackRowProps) {
  return (
    <div
      className={`group grid items-center gap-3 px-3 py-2 rounded-md transition-colors duration-150 ${
        showAlbum
          ? 'grid-cols-[32px_minmax(0,1.6fr)_minmax(0,1fr)_auto] md:grid-cols-[36px_minmax(0,1.8fr)_minmax(0,1fr)_auto]'
          : 'grid-cols-[32px_minmax(0,1fr)_auto]'
      } ${isCurrent ? 'bg-white/[0.08]' : 'hover:bg-white/[0.06]'}`}
    >
      {/* Index / Play / Equalizer */}
      <div className="flex items-center justify-center w-8 h-10">
        <button
          type="button"
          onClick={onPlay}
          aria-label={isCurrent && isPlaying ? `Pausar ${track.title}` : `Tocar ${track.title}`}
          className="w-8 h-8 flex items-center justify-center rounded-full text-sm focus-visible:outline-2 focus-visible:outline-[#1DB954]"
        >
          {isCurrent && isPlaying ? (
            <>
              <span className="group-hover:hidden">
                <EqualizerBars />
              </span>
              <Pause className="hidden group-hover:block w-4 h-4 text-white fill-white" />
            </>
          ) : (
            <>
              <span className={`font-mono-num text-sm group-hover:hidden ${isCurrent ? 'text-[#1DB954] font-bold' : 'text-[#b3b3b3]'}`}>
                {index + 1}
              </span>
              <Play className="hidden group-hover:block w-4 h-4 text-white fill-white ml-0.5" />
            </>
          )}
        </button>
      </div>

      {/* Cover + Title + Artist */}
      <div className="flex items-center gap-3 min-w-0">
        {showCover && (
          <button
            type="button"
            onClick={onPlay}
            className="shrink-0 focus-visible:outline-2 focus-visible:outline-[#1DB954] rounded"
            aria-label={`Tocar ${track.title}`}
          >
            <CoverImage src={track.coverUrl} alt={track.albumName} className="w-10 h-10" rounded="sm" />
          </button>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={onPlay}
              className={`text-left text-sm font-semibold truncate hover:underline focus-visible:outline-2 focus-visible:outline-[#1DB954] ${
                isCurrent ? 'text-[#1DB954]' : 'text-white'
              }`}
            >
              {track.title}
            </button>
            {track.isExplicit && (
              <span
                className="shrink-0 inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold bg-[#b3b3b3]/25 text-[#b3b3b3] rounded-[2px]"
                title="Conteúdo explícito"
              >
                E
              </span>
            )}
            {track.hasLibras && (
              <button
                type="button"
                onClick={() => onOpenLibras?.(track.librasClipId || 'clip-aurora')}
                className="shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-extrabold bg-[#4ade80] text-[#0b0b0b] rounded-[3px] hover:brightness-110 transition"
                title="Disponível em Libras na aba Entre Sinais"
              >
                <Hand className="w-2.5 h-2.5" />
                LIBRAS
              </button>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#b3b3b3] truncate">
            <button
              type="button"
              onClick={() => onOpenArtist(track.artistId)}
              className="truncate hover:text-white hover:underline focus-visible:outline-2 focus-visible:outline-[#1DB954]"
            >
              {track.artistName}
            </button>
            {!track.previewUrl && (
              <span className="text-[11px] text-[#777] shrink-0">· Spotify Embed</span>
            )}
          </div>
        </div>
      </div>

      {/* Album column */}
      {showAlbum && (
        <div className="hidden sm:block min-w-0">
          <button
            type="button"
            onClick={() => onOpenAlbum(track.albumId)}
            className="text-left text-xs text-[#b3b3b3] hover:text-white hover:underline truncate max-w-full block focus-visible:outline-2 focus-visible:outline-[#1DB954]"
          >
            {track.albumName}
          </button>
        </div>
      )}

      {/* Actions + Duration */}
      <div className="flex items-center justify-end gap-1 sm:gap-2">
        <button
          type="button"
          onClick={() => onToggleLike(track)}
          aria-label={isLiked ? `Remover ${track.title} das curtidas` : `Curtir ${track.title}`}
          aria-pressed={isLiked}
          className={`w-9 h-9 flex items-center justify-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-[#1DB954] ${
            isLiked ? 'text-[#1DB954]' : 'text-[#b3b3b3] sm:opacity-0 sm:group-hover:opacity-100 hover:text-white'
          }`}
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-[#1DB954]' : ''}`} />
        </button>

        <button
          type="button"
          onClick={() => onAddToPlaylist(track)}
          aria-label={`Adicionar ${track.title} a uma playlist`}
          className="w-9 h-9 flex items-center justify-center rounded-full text-[#b3b3b3] sm:opacity-0 sm:group-hover:opacity-100 hover:text-white transition-colors focus-visible:outline-2 focus-visible:outline-[#1DB954]"
          title="Adicionar à playlist"
        >
          <Plus className="w-4 h-4" />
        </button>

        <span className="font-mono-num text-xs text-[#b3b3b3] w-11 text-right">
          {formatMs(track.durationMs)}
        </span>
      </div>
    </div>
  );
}
