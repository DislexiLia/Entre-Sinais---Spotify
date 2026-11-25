import React, { useState } from 'react';
import {
  ExternalLink,
  Hand,
  Heart,
  ListMusic,
  Loader2,
  Pause,
  Play,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import type { RepeatMode, Track } from '../types/music.ts';
import { CoverImage, SpotifyMark, formatSec } from './BrandAssets.tsx';

interface PlayerBarProps {
  currentTrack: Track | null;
  queue: Track[];
  queueIndex: number;
  isPlaying: boolean;
  isBuffering: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  shuffle: boolean;
  repeat: RepeatMode;
  isLiked: boolean;
  accessibleMode: boolean;
  playbackNotice: string | null;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrev: () => void;
  onSeek: (seconds: number) => void;
  onVolumeChange: (vol: number) => void;
  onToggleMute: () => void;
  onToggleShuffle: () => void;
  onCycleRepeat: () => void;
  onToggleLike: (track: Track) => void;
  onToggleAccessible: () => void;
  onOpenAlbum: (albumId: string) => void;
  onOpenArtist: (artistId: string) => void;
  onOpenLibrasClip: (clipId: string) => void;
  onOpenSpotifyEmbed: (track: Track) => void;
  onSelectQueueIndex: (index: number) => void;
}

export function PlayerBar({
  currentTrack,
  queue,
  queueIndex,
  isPlaying,
  isBuffering,
  currentTime,
  duration,
  volume,
  isMuted,
  shuffle,
  repeat,
  isLiked,
  accessibleMode,
  playbackNotice,
  onTogglePlay,
  onNext,
  onPrev,
  onSeek,
  onVolumeChange,
  onToggleMute,
  onToggleShuffle,
  onCycleRepeat,
  onToggleLike,
  onToggleAccessible,
  onOpenAlbum,
  onOpenArtist,
  onOpenLibrasClip,
  onOpenSpotifyEmbed,
  onSelectQueueIndex,
}: PlayerBarProps) {
  const [showQueue, setShowQueue] = useState(false);

  const effectiveDuration = duration > 0 ? duration : 30;
  const progressPct = currentTrack ? Math.min(100, Math.max(0, (currentTime / effectiveDuration) * 100)) : 0;
  const effectiveVolume = isMuted ? 0 : volume;

  return (
    <footer className="fixed bottom-14 md:bottom-0 left-0 right-0 z-30 bg-[#000000]/95 md:bg-[#000000] border-t border-white/[0.08] px-3 md:px-4 py-2 md:h-[88px] flex items-center justify-between gap-3">
      {/* Left: Track Info */}
      <div className="flex items-center gap-3 min-w-0 flex-1 md:flex-none md:w-[30%]">
        {currentTrack ? (
          <>
            <button
              type="button"
              onClick={() => onOpenAlbum(currentTrack.albumId)}
              className="shrink-0 rounded focus-visible:outline-2 focus-visible:outline-[#1DB954]"
              aria-label={`Abrir álbum ${currentTrack.albumName}`}
            >
              <CoverImage
                src={currentTrack.coverUrl}
                alt={currentTrack.albumName}
                className="w-11 h-11 md:w-14 md:h-14"
                rounded="sm"
              />
            </button>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 min-w-0">
                <button
                  type="button"
                  onClick={() => onOpenAlbum(currentTrack.albumId)}
                  className="text-sm font-semibold text-white truncate hover:underline text-left focus-visible:outline-2 focus-visible:outline-[#1DB954]"
                >
                  {currentTrack.title}
                </button>
                {currentTrack.hasLibras && (
                  <button
                    type="button"
                    onClick={() => onOpenLibrasClip(currentTrack.librasClipId || 'clip-aurora')}
                    className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-extrabold bg-[#4ade80] text-[#0b0b0b] rounded-[3px] shrink-0 hover:brightness-110"
                    title="Abrir versão em Libras"
                  >
                    LIBRAS
                  </button>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#b3b3b3] truncate">
                <button
                  type="button"
                  onClick={() => onOpenArtist(currentTrack.artistId)}
                  className="truncate hover:text-white hover:underline focus-visible:outline-2 focus-visible:outline-[#1DB954]"
                >
                  {currentTrack.artistName}
                </button>
                {playbackNotice && (
                  <span className="hidden lg:inline text-[11px] text-[#4ade80]/90 truncate">
                    · {playbackNotice}
                  </span>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => onToggleLike(currentTrack)}
              aria-label={isLiked ? 'Remover das curtidas' : 'Curtir música'}
              aria-pressed={isLiked}
              className={`w-9 h-9 flex items-center justify-center rounded-full shrink-0 transition focus-visible:outline-2 focus-visible:outline-[#1DB954] ${
                isLiked ? 'text-[#1DB954]' : 'text-[#b3b3b3] hover:text-white'
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-[#1DB954]' : ''}`} />
            </button>
          </>
        ) : (
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 md:w-14 md:h-14 rounded bg-[#181818] shrink-0" />
            <div className="min-w-0">
              <div className="text-sm font-semibold text-white truncate">Nenhuma música tocando</div>
              <div className="text-xs text-[#b3b3b3] truncate">Escolha uma faixa para ouvir</div>
            </div>
          </div>
        )}
      </div>

      {/* Center: Playback Controls + Progress */}
      <div className="flex flex-col items-center gap-1 md:w-[40%] md:max-w-[560px]">
        <div className="flex items-center gap-2 md:gap-4">
          <button
            type="button"
            onClick={onToggleShuffle}
            aria-label="Reprodução aleatória"
            aria-pressed={shuffle}
            className={`hidden md:flex w-8 h-8 items-center justify-center rounded-full transition focus-visible:outline-2 focus-visible:outline-[#1DB954] ${
              shuffle ? 'text-[#1DB954]' : 'text-[#b3b3b3] hover:text-white'
            }`}
            title={shuffle ? 'Aleatório ativado' : 'Ativar aleatório'}
          >
            <Shuffle className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onPrev}
            aria-label="Música anterior"
            className="hidden sm:flex w-9 h-9 items-center justify-center rounded-full text-[#b3b3b3] hover:text-white transition focus-visible:outline-2 focus-visible:outline-[#1DB954]"
          >
            <SkipBack className="w-5 h-5 fill-current" />
          </button>

          <button
            type="button"
            onClick={onTogglePlay}
            aria-label={isPlaying ? 'Pausar' : 'Tocar'}
            className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition focus-visible:outline-2 focus-visible:outline-[#1DB954]"
          >
            {isBuffering ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-4 h-4 fill-black" />
            ) : (
              <Play className="w-4 h-4 fill-black ml-0.5" />
            )}
          </button>

          <button
            type="button"
            onClick={onNext}
            aria-label="Próxima música"
            className="w-9 h-9 flex items-center justify-center rounded-full text-[#b3b3b3] hover:text-white transition focus-visible:outline-2 focus-visible:outline-[#1DB954]"
          >
            <SkipForward className="w-5 h-5 fill-current" />
          </button>

          <button
            type="button"
            onClick={onCycleRepeat}
            aria-label={`Repetir: ${repeat === 'off' ? 'desligado' : repeat === 'all' ? 'tudo' : 'uma música'}`}
            className={`hidden md:flex w-8 h-8 items-center justify-center rounded-full transition focus-visible:outline-2 focus-visible:outline-[#1DB954] ${
              repeat !== 'off' ? 'text-[#1DB954]' : 'text-[#b3b3b3] hover:text-white'
            }`}
            title={
              repeat === 'off'
                ? 'Ativar repetição'
                : repeat === 'all'
                ? 'Repetindo fila (clique para repetir 1)'
                : 'Repetindo uma música'
            }
          >
            {repeat === 'one' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
          </button>
        </div>

        {/* Audio Progress Bar */}
        <div className="hidden md:flex items-center gap-2 w-full">
          <span className="font-mono-num text-[11px] text-[#b3b3b3] w-9 text-right">
            {formatSec(currentTime)}
          </span>
          <div className="group relative flex-1 h-4 flex items-center">
            <div className="w-full h-1 rounded-full bg-[#4d4d4d] overflow-hidden">
              <div
                className="h-full bg-white group-hover:bg-[#1DB954] transition-colors"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <input
              type="range"
              min={0}
              max={effectiveDuration}
              step={0.25}
              value={Math.min(currentTime, effectiveDuration)}
              disabled={!currentTrack}
              onChange={(e) => onSeek(Number(e.target.value))}
              aria-label="Progresso da música"
              className="sp-range absolute inset-0 w-full h-full opacity-0 group-hover:opacity-100"
            />
          </div>
          <span className="font-mono-num text-[11px] text-[#b3b3b3] w-9">
            {currentTrack ? formatSec(effectiveDuration) : '0:00'}
          </span>
        </div>
      </div>

      {/* Right: Spotify Embed, Queue, Libras, Volume */}
      <div className="hidden md:flex items-center justify-end gap-1.5 w-[30%]">
        {accessibleMode && currentTrack?.hasLibras && (
          <button
            type="button"
            onClick={() => onOpenLibrasClip(currentTrack.librasClipId || 'clip-aurora')}
            className="px-2.5 h-8 rounded-full bg-[#4ade80] text-[#0b0b0b] text-xs font-extrabold whitespace-nowrap hover:brightness-110 transition"
          >
            Ver em Libras
          </button>
        )}

        {currentTrack && (
          <button
            type="button"
            onClick={() => onOpenSpotifyEmbed(currentTrack)}
            className="h-8 px-2.5 rounded-full bg-white/[0.08] hover:bg-white/[0.15] text-xs font-semibold text-white inline-flex items-center gap-1.5 whitespace-nowrap transition focus-visible:outline-2 focus-visible:outline-[#1DB954]"
            title="Abrir player oficial do Spotify (Embed)"
          >
            <SpotifyMark className="w-3.5 h-3.5 text-[#1DB954]" />
            <span className="hidden xl:inline">Spotify Oficial</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => setShowQueue((v) => !v)}
          aria-label="Fila de reprodução"
          aria-expanded={showQueue}
          className={`w-8 h-8 flex items-center justify-center rounded-full transition focus-visible:outline-2 focus-visible:outline-[#1DB954] ${
            showQueue ? 'text-[#1DB954]' : 'text-[#b3b3b3] hover:text-white'
          }`}
          title="Fila de reprodução"
        >
          <ListMusic className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={onToggleAccessible}
          aria-label="Experiência acessível Entre Sinais"
          aria-pressed={accessibleMode}
          className={`w-8 h-8 flex items-center justify-center rounded-full transition focus-visible:outline-2 focus-visible:outline-[#4ade80] ${
            accessibleMode ? 'text-[#4ade80] bg-[#1b2a21]' : 'text-[#b3b3b3] hover:text-white'
          }`}
          title={accessibleMode ? 'Modo acessível Entre Sinais ativado' : 'Ativar experiência acessível em Libras'}
        >
          <Hand className="w-4 h-4" />
        </button>

        {/* Volume */}
        <div className="flex items-center gap-1.5 ml-1">
          <button
            type="button"
            onClick={onToggleMute}
            aria-label={isMuted || volume === 0 ? 'Ativar som' : 'Silenciar'}
            className="w-8 h-8 flex items-center justify-center rounded-full text-[#b3b3b3] hover:text-white transition focus-visible:outline-2 focus-visible:outline-[#1DB954]"
          >
            {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <div className="group relative w-20 lg:w-24 h-4 flex items-center">
            <div className="w-full h-1 rounded-full bg-[#4d4d4d] overflow-hidden">
              <div
                className="h-full bg-white group-hover:bg-[#1DB954] transition-colors"
                style={{ width: `${effectiveVolume * 100}%` }}
              />
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.02}
              value={effectiveVolume}
              onChange={(e) => onVolumeChange(Number(e.target.value))}
              aria-label="Volume"
              className="sp-range absolute inset-0 w-full h-full opacity-0 group-hover:opacity-100"
            />
          </div>
        </div>
      </div>

      {/* Queue Drawer */}
      {showQueue && (
        <div className="fixed bottom-[96px] right-4 z-40 w-[340px] max-w-[calc(100vw-2rem)] max-h-[420px] bg-[#181818] border border-white/10 rounded-xl shadow-2xl flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <div>
              <h3 className="text-sm font-bold text-white">Fila de reprodução</h3>
              <p className="text-xs text-[#b3b3b3]">{queue.length} músicas na fila</p>
            </div>
            <div className="flex items-center gap-2">
              {currentTrack?.spotifyUrl && (
                <a
                  href={currentTrack.spotifyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#1DB954] hover:underline inline-flex items-center gap-1"
                >
                  Spotify <ExternalLink className="w-3 h-3" />
                </a>
              )}
              <button
                type="button"
                onClick={() => setShowQueue(false)}
                aria-label="Fechar fila"
                className="w-7 h-7 rounded-full flex items-center justify-center text-[#b3b3b3] hover:text-white hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="overflow-y-auto p-2 space-y-1">
            {queue.length === 0 ? (
              <p className="text-xs text-[#b3b3b3] p-4 text-center">Nenhuma música na fila.</p>
            ) : (
              queue.map((t, idx) => {
                const active = idx === queueIndex;
                return (
                  <button
                    key={`${t.id}-${idx}`}
                    type="button"
                    onClick={() => onSelectQueueIndex(idx)}
                    className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition ${
                      active ? 'bg-white/10' : 'hover:bg-white/[0.06]'
                    }`}
                  >
                    <CoverImage src={t.coverUrl} alt={t.albumName} className="w-9 h-9" rounded="sm" />
                    <div className="min-w-0 flex-1">
                      <div className={`text-xs font-semibold truncate ${active ? 'text-[#1DB954]' : 'text-white'}`}>
                        {t.title}
                      </div>
                      <div className="text-[11px] text-[#b3b3b3] truncate">{t.artistName}</div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </footer>
  );
}
