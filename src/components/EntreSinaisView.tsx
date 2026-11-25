import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Hand,
  Pause,
  Play,
  Subtitles,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import type { ArtistSign, FanStory, LibrasClip, Track } from '../types/music.ts';
import {
  CoverImage,
  ENTRE_SINAIS_KV_URL,
  EntreSinaisLogo,
  formatSec,
} from './BrandAssets.tsx';
import { TrackRow } from './TrackRow.tsx';

interface EntreSinaisViewProps {
  activeTab: 'sobre' | 'historias' | 'clipes' | 'sinais';
  initialClipId?: string;
  librasClips: LibrasClip[];
  artistSigns: ArtistSign[];
  fanStories: FanStory[];
  accessibleTracks: Track[];
  accessibleMode: boolean;
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  likedTrackIds: Set<string>;
  onChangeTab: (tab: 'sobre' | 'historias' | 'clipes' | 'sinais') => void;
  onToggleAccessibleMode: () => void;
  onPlayTrack: (track: Track, queue?: Track[]) => void;
  onTogglePlay: () => void;
  onSeek: (sec: number) => void;
  onToggleLike: (track: Track) => void;
  onAddToPlaylist: (track: Track) => void;
  onOpenArtist: (artistId: string) => void;
  onOpenAlbum: (albumId: string) => void;
  onPauseMainAudio?: () => void;
}

export function EntreSinaisView({
  activeTab,
  initialClipId,
  librasClips,
  artistSigns,
  fanStories,
  accessibleTracks,
  accessibleMode,
  currentTrack,
  isPlaying,
  likedTrackIds,
  onChangeTab,
  onToggleAccessibleMode,
  onPlayTrack,
  onTogglePlay,
  onToggleLike,
  onAddToPlaylist,
  onOpenArtist,
  onOpenAlbum,
  onPauseMainAudio,
}: EntreSinaisViewProps) {
  const [selectedClipId, setSelectedClipId] = useState<string>(
    initialClipId || librasClips[0]?.id || 'clip-aurora'
  );
  const [showCaptions, setShowCaptions] = useState(true);

  // Real <video> player state for Clipes em Libras
  const clipVideoRef = useRef<HTMLVideoElement | null>(null);
  const [clipPlaying, setClipPlaying] = useState(false);
  const [clipTime, setClipTime] = useState(0);
  const [clipDuration, setClipDuration] = useState(0);

  // Artist Sign tab state
  const [selectedArtistIdx, setSelectedArtistIdx] = useState(0);
  const signVideoRef = useRef<HTMLVideoElement | null>(null);
  const [signVideoPlaying, setSignVideoPlaying] = useState(false);
  const [signVideoTime, setSignVideoTime] = useState(0);
  const [signVideoDuration, setSignVideoDuration] = useState(0);

  // Fan Story modal state with real <video>
  const storyVideoRef = useRef<HTMLVideoElement | null>(null);
  const [activeStoryIdx, setActiveStoryIdx] = useState<number>(-1);
  const [storyPlaying, setStoryPlaying] = useState(false);
  const [storyMuted, setStoryMuted] = useState(false);
  const [storyElapsed, setStoryElapsed] = useState(0);
  const [storyDuration, setStoryDuration] = useState(30);

  useEffect(() => {
    if (initialClipId && librasClips.some((c) => c.id === initialClipId)) {
      setSelectedClipId(initialClipId);
    }
  }, [initialClipId, librasClips]);

  const activeClip = useMemo(
    () => librasClips.find((c) => c.id === selectedClipId) || librasClips[0],
    [librasClips, selectedClipId]
  );

  const activeClipTrack = useMemo(() => {
    if (!activeClip) return null;
    return accessibleTracks.find((t) => t.id === activeClip.trackId) || accessibleTracks[0] || null;
  }, [activeClip, accessibleTracks]);

  const activeCue = useMemo(() => {
    if (!activeClip) return null;
    return (
      activeClip.cues.find((c) => clipTime >= c.startSec && clipTime < c.endSec) ||
      activeClip.cues[0]
    );
  }, [activeClip, clipTime]);

  const activeSign = artistSigns[selectedArtistIdx] || artistSigns[0];
  const activeSignTrack = useMemo(() => {
    if (!activeSign) return null;
    return accessibleTracks.find((t) => t.id === activeSign.featuredTrackId) || null;
  }, [activeSign, accessibleTracks]);
  const isSignPlaying = Boolean(
    activeSignTrack && currentTrack?.id === activeSignTrack.id && isPlaying
  );

  const activeStory = activeStoryIdx >= 0 ? fanStories[activeStoryIdx] : null;

  // Reset clip video state when switching clip
  useEffect(() => {
    setClipTime(0);
    setClipDuration(0);
    setClipPlaying(false);
    const v = clipVideoRef.current;
    if (v) {
      v.pause();
      v.currentTime = 0;
    }
  }, [activeClip?.id]);

  // Sync story video autoplay when opening or switching stories
  useEffect(() => {
    if (activeStoryIdx < 0) return;
    setStoryElapsed(0);
    const v = storyVideoRef.current;
    if (v) {
      v.currentTime = 0;
      v.muted = storyMuted;
      onPauseMainAudio?.();
      v.play()
        .then(() => setStoryPlaying(true))
        .catch(() => setStoryPlaying(false));
    }
  }, [activeStoryIdx]);

  const handleToggleClipVideo = () => {
    const v = clipVideoRef.current;
    if (!v) return;
    if (v.paused) {
      onPauseMainAudio?.();
      v.play()
        .then(() => setClipPlaying(true))
        .catch(() => setClipPlaying(false));
    } else {
      v.pause();
      setClipPlaying(false);
    }
  };

  const handleSelectClip = (clipId: string) => {
    setSelectedClipId(clipId);
    window.setTimeout(() => {
      const v = clipVideoRef.current;
      if (v) {
        onPauseMainAudio?.();
        v.play()
          .then(() => setClipPlaying(true))
          .catch(() => {});
      }
    }, 60);
  };

  const handleToggleStoryVideo = () => {
    const v = storyVideoRef.current;
    if (!v) return;
    if (v.paused) {
      onPauseMainAudio?.();
      v.play()
        .then(() => setStoryPlaying(true))
        .catch(() => {});
    } else {
      v.pause();
      setStoryPlaying(false);
    }
  };

  const handleToggleSignPlay = () => {
    if (activeSign?.videoUrl && signVideoRef.current) {
      const v = signVideoRef.current;
      if (v.paused) {
        v.play()
          .then(() => setSignVideoPlaying(true))
          .catch(() => setSignVideoPlaying(false));
      } else {
        v.pause();
        setSignVideoPlaying(false);
      }
      return;
    }
    if (!activeSignTrack) return;
    if (currentTrack?.id === activeSignTrack.id) {
      onTogglePlay();
    } else {
      onPlayTrack(activeSignTrack, accessibleTracks);
    }
  };

  useEffect(() => {
    setSignVideoTime(0);
    setSignVideoDuration(0);
    setSignVideoPlaying(false);
    if (signVideoRef.current) {
      signVideoRef.current.pause();
      signVideoRef.current.currentTime = 0;
    }
  }, [selectedArtistIdx]);

  const tabs: Array<{ id: 'sobre' | 'historias' | 'clipes' | 'sinais'; label: string }> = [
    { id: 'sobre', label: 'Sobre' },
    { id: 'historias', label: 'Histórias dos fãs' },
    { id: 'clipes', label: 'Clipes em Libras' },
    { id: 'sinais', label: 'Sinais' },
  ];

  return (
    <div className="space-y-6 pb-8">
      {/* Header + Clean KV Hero Banner */}
      <div className="pt-2 space-y-5">
        <div className="rounded-2xl overflow-hidden border border-[#4ade80]/50 bg-[#0d1410]">
          <img
            src={ENTRE_SINAIS_KV_URL}
            alt="Campanha Entre Sinais · Spotify"
            className="w-full h-44 sm:h-64 md:h-80 object-cover object-center"
          />
        </div>

        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Seções da campanha">
          {tabs.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onChangeTab(tab.id)}
                className={`min-h-[42px] px-4 rounded-full text-sm font-bold transition whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[#4ade80] ${
                  active
                    ? 'bg-[#4ade80] text-[#0b0b0b]'
                    : 'bg-[#282828] text-white hover:bg-[#333333]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB: SOBRE */}
      {activeTab === 'sobre' && (
        <div className="space-y-8">
          <div className="max-w-3xl rounded-xl border border-[#4ade80] bg-[#1b2a21] p-6 space-y-4">
            <div className="text-[11px] font-bold tracking-[1.5px] text-[#4ade80] uppercase">
              A CAMPANHA
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white">
              Acessibilidade musical integrada ao seu streaming
            </h2>
            <p className="text-sm sm:text-base text-[#e5e5e5] leading-relaxed">
              É uma iniciativa de acessibilidade musical dentro do aplicativo. Aqui, fãs surdos e ouvintes compartilham suas vivências em vídeo, videoclipes ganham interpretação em Libras na tela e cada artista apresenta seu próprio sinal.
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <button
                type="button"
                onClick={() => onChangeTab('clipes')}
                className="min-h-[44px] px-6 rounded-full bg-[#4ade80] text-[#0b0b0b] text-sm font-extrabold hover:brightness-110 transition"
              >
                Ver clipes em Libras
              </button>
              <button
                type="button"
                onClick={() => onChangeTab('sinais')}
                className="min-h-[44px] px-6 rounded-full border border-white/40 text-white text-sm font-bold hover:border-white transition"
              >
                Ver os sinais dos artistas
              </button>
            </div>
          </div>

          <section className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-xl font-extrabold text-white">
                Clipes dos artistas com intérprete de Libras
              </h3>
              <button
                type="button"
                onClick={() => onChangeTab('clipes')}
                className="text-xs font-bold text-[#4ade80] hover:underline"
              >
                Abrir player completo
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-5xl">
              {librasClips.map((clip) => (
                <button
                  key={clip.id}
                  type="button"
                  onClick={() => {
                    onChangeTab('clipes');
                    handleSelectClip(clip.id);
                  }}
                  className="group text-left rounded-xl overflow-hidden bg-[#181818] border border-white/10 hover:border-[#4ade80] transition focus-visible:outline-2 focus-visible:outline-[#4ade80]"
                >
                  <div className="relative aspect-video bg-black overflow-hidden">
                    <img
                      src={clip.posterUrl || clip.coverUrl}
                      alt={`${clip.title} — ${clip.artistName} com intérprete de Libras`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/25" />
                    <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-[#4ade80] text-[#0b0b0b] text-[10px] font-extrabold">
                      INTÉRPRETE DE LIBRAS
                    </span>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-black/65 border border-white/30 flex items-center justify-center text-white group-hover:bg-[#4ade80] group-hover:text-[#0b0b0b] group-hover:border-[#4ade80] transition">
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      </div>
                    </div>
                  </div>
                  <div className="p-3.5 space-y-1">
                    <div className="text-sm font-extrabold text-white truncate">{clip.title}</div>
                    <div className="text-xs font-semibold text-[#4ade80] truncate">{clip.artistName}</div>
                    <p className="text-xs text-[#b3b3b3] line-clamp-2 leading-snug">{clip.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-xl font-extrabold text-white">
                Como fazer os sinais dos artistas em Libras
              </h3>
              <button
                type="button"
                onClick={() => onChangeTab('sinais')}
                className="text-xs font-bold text-[#4ade80] hover:underline"
              >
                Ver tutoriais
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl">
              {artistSigns.map((sign, idx) => (
                <button
                  key={sign.artistId}
                  type="button"
                  onClick={() => {
                    setSelectedArtistIdx(idx);
                    onChangeTab('sinais');
                  }}
                  className="group flex items-center gap-3.5 p-3 rounded-xl bg-[#181818] border border-white/10 hover:border-[#4ade80] text-left transition"
                >
                  <div className="relative w-16 aspect-[9/16] rounded-lg overflow-hidden bg-black shrink-0">
                    <img
                      src={sign.posterUrl || sign.artistImageUrl}
                      alt={sign.signTitle}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                      <Play className="w-4 h-4 text-white fill-current group-hover:text-[#4ade80]" />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <span className="inline-block px-1.5 py-0.5 rounded bg-[#4ade80]/20 text-[#4ade80] text-[10px] font-extrabold">
                      TUTORIAL EM LIBRAS
                    </span>
                    <div className="text-sm font-extrabold text-white truncate">{sign.artistName}</div>
                    <p className="text-xs text-[#b3b3b3] line-clamp-2 leading-snug">{sign.signDescription}</p>
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-xl font-extrabold text-white">Experiência acessível no player</h3>
            <p className="text-sm text-[#b3b3b3] max-w-xl leading-relaxed">
              Ative a experiência acessível para destacar faixas com versão em Libras no catálogo e exibir o atalho direto no player inferior enquanto você navega.
            </p>
            <button
              type="button"
              onClick={onToggleAccessibleMode}
              aria-pressed={accessibleMode}
              className={`min-h-[44px] px-5 rounded-full text-sm font-bold inline-flex items-center gap-2 transition ${
                accessibleMode
                  ? 'bg-[#4ade80] text-[#0b0b0b]'
                  : 'bg-[#282828] text-white hover:bg-[#333333]'
              }`}
            >
              <Hand className="w-4 h-4" />
              Experiência acessível: {accessibleMode ? 'ligada' : 'desligada'}
            </button>
          </section>

          <section className="space-y-3">
            <h3 className="text-xl font-extrabold text-white">Músicas com interpretação em Libras</h3>
            <div className="space-y-1">
              {accessibleTracks.map((track, idx) => (
                <TrackRow
                  key={track.id}
                  track={track}
                  index={idx}
                  isCurrent={currentTrack?.id === track.id}
                  isPlaying={isPlaying}
                  isLiked={likedTrackIds.has(track.id)}
                  onPlay={() => onPlayTrack(track, accessibleTracks)}
                  onToggleLike={onToggleLike}
                  onAddToPlaylist={onAddToPlaylist}
                  onOpenArtist={onOpenArtist}
                  onOpenAlbum={onOpenAlbum}
                  onOpenLibras={(clipId) => {
                    setSelectedClipId(clipId);
                    onChangeTab('clipes');
                  }}
                />
              ))}
            </div>
          </section>
        </div>
      )}

      {/* TAB: CLIPES EM LIBRAS (Real MP4 Video Players) */}
      {activeTab === 'clipes' && activeClip && (
        <div className="space-y-5">
          {/* Clip Visual Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-4xl">
            {librasClips.map((clip) => {
              const active = clip.id === activeClip.id;
              return (
                <button
                  key={clip.id}
                  type="button"
                  onClick={() => handleSelectClip(clip.id)}
                  className={`group flex items-center gap-3 p-2.5 rounded-xl text-left transition border ${
                    active
                      ? 'bg-[#1b2a21] border-[#4ade80]'
                      : 'bg-[#181818] border-white/10 hover:bg-[#222222] hover:border-white/25'
                  }`}
                >
                  <div className="relative w-24 aspect-video rounded-lg overflow-hidden bg-black shrink-0">
                    <img
                      src={clip.posterUrl || clip.coverUrl}
                      alt={`${clip.title} — ${clip.artistName}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                      <Play className={`w-4 h-4 fill-current ${active ? 'text-[#4ade80]' : 'text-white'}`} />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className={`text-sm font-extrabold truncate ${active ? 'text-[#4ade80]' : 'text-white'}`}>
                      {clip.title}
                    </div>
                    <div className="text-xs text-[#b3b3b3] truncate">{clip.artistName}</div>
                    <div className="text-[10px] font-bold text-[#4ade80]/90 mt-0.5">Com intérprete em Libras</div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Real Video Stage */}
          <div className="relative max-w-4xl aspect-video rounded-xl overflow-hidden bg-black border border-white/10 shadow-2xl">
            <video
              ref={clipVideoRef}
              key={activeClip.videoUrl}
              src={activeClip.videoUrl}
              poster={activeClip.posterUrl || activeClip.coverUrl}
              controls
              playsInline
              preload="auto"
              onPlay={() => {
                onPauseMainAudio?.();
                setClipPlaying(true);
              }}
              onPause={() => setClipPlaying(false)}
              onTimeUpdate={(e) => setClipTime(e.currentTarget.currentTime)}
              onLoadedMetadata={(e) => setClipDuration(e.currentTarget.duration || 30)}
              onEnded={() => setClipPlaying(false)}
              className="w-full h-full object-contain bg-black"
            />

            {/* Top Badges */}
            <div className="absolute top-3 left-3 flex items-center gap-2 pointer-events-none">
              <span className="px-2.5 py-1 rounded text-[11px] font-extrabold bg-[#4ade80] text-[#0b0b0b]">
                LIBRAS
              </span>
              {showCaptions && (
                <span className="px-2.5 py-1 rounded text-[11px] font-extrabold bg-black/80 text-white border border-white/15">
                  CC
                </span>
              )}
              {activeCue && (
                <span className="hidden sm:inline-block px-2.5 py-1 rounded text-[11px] font-semibold bg-black/75 text-[#4ade80]">
                  {activeCue.signLabel}
                </span>
              )}
            </div>

            {/* Optional Synchronized Captions (CC) */}
            {showCaptions && activeCue && (
              <div className="absolute left-3 bottom-14 max-w-[65%] bg-black/80 backdrop-blur-sm rounded-md px-3 py-1.5 text-xs sm:text-sm font-semibold text-white leading-snug border border-white/10 pointer-events-none">
                {activeCue.caption}
              </div>
            )}
          </div>

          {/* Info & Controls */}
          <div className="max-w-4xl space-y-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <h2 className="text-xl font-extrabold text-white">{activeClip.title}</h2>
                <p className="text-sm text-[#b3b3b3]">
                  <button
                    type="button"
                    onClick={() => onOpenArtist(activeClip.artistId)}
                    className="text-white font-semibold hover:underline"
                  >
                    {activeClip.artistName}
                  </button>{' '}
                  · {activeClip.description}
                </p>
              </div>
              <span className="font-mono-num text-xs text-[#b3b3b3]">
                {formatSec(clipTime)} / {formatSec(clipDuration)}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleToggleClipVideo}
                className="min-h-[42px] px-5 rounded-full bg-[#4ade80] text-[#0b0b0b] text-sm font-extrabold inline-flex items-center gap-2 hover:brightness-110 transition"
              >
                {clipPlaying ? (
                  <Pause className="w-4 h-4 fill-current" />
                ) : (
                  <Play className="w-4 h-4 fill-current" />
                )}
                {clipPlaying ? 'Pausar clipe' : 'Assistir clipe em Libras'}
              </button>

              <button
                type="button"
                onClick={() => setShowCaptions((v) => !v)}
                aria-pressed={showCaptions}
                className={`min-h-[42px] px-4 rounded-full text-xs font-bold inline-flex items-center gap-1.5 transition ${
                  showCaptions ? 'bg-white text-black' : 'bg-[#282828] text-white'
                }`}
              >
                <Subtitles className="w-3.5 h-3.5" /> Legenda (CC)
              </button>

              {activeClipTrack && (
                <button
                  type="button"
                  onClick={() => onPlayTrack(activeClipTrack, accessibleTracks)}
                  className="min-h-[42px] px-4 rounded-full border border-white/25 text-white text-xs font-bold inline-flex items-center gap-1.5 hover:border-white transition"
                >
                  <Volume2 className="w-3.5 h-3.5 text-[#1DB954]" />
                  Tocar faixa no player
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB: SINAIS DOS ARTISTAS */}
      {activeTab === 'sinais' && activeSign && (
        <div className="space-y-6">
          <div className="flex flex-wrap gap-4">
            {artistSigns.map((sign, idx) => {
              const selected = idx === selectedArtistIdx;
              return (
                <button
                  key={sign.artistId}
                  type="button"
                  onClick={() => setSelectedArtistIdx(idx)}
                  className="flex flex-col items-center gap-2 w-24 text-center group focus-visible:outline-2 focus-visible:outline-[#4ade80]"
                >
                  <div
                    className={`w-20 h-20 rounded-full p-0.5 transition ${
                      selected
                        ? 'ring-3 ring-[#4ade80]'
                        : 'ring-1 ring-white/15 group-hover:ring-white/40'
                    }`}
                  >
                    <CoverImage
                      src={sign.artistImageUrl}
                      alt={sign.artistName}
                      className="w-full h-full"
                      rounded="full"
                      fallbackType="artist"
                    />
                  </div>
                  <span className={`text-xs font-bold ${selected ? 'text-[#4ade80]' : 'text-white'}`}>
                    {sign.artistName}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="max-w-4xl grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6 items-start">
            <div className="relative w-full max-w-[300px] aspect-[9/16] rounded-2xl overflow-hidden bg-black border border-[#4ade80]/50 shadow-2xl mx-auto md:mx-0">
              {activeSign.videoUrl ? (
                <video
                  ref={signVideoRef}
                  key={activeSign.videoUrl}
                  src={activeSign.videoUrl}
                  poster={activeSign.posterUrl || activeSign.artistImageUrl}
                  controls
                  muted
                  playsInline
                  preload="auto"
                  onPlay={() => setSignVideoPlaying(true)}
                  onPause={() => setSignVideoPlaying(false)}
                  onTimeUpdate={(e) => setSignVideoTime(e.currentTarget.currentTime)}
                  onLoadedMetadata={(e) => setSignVideoDuration(e.currentTarget.duration || 5)}
                  onEnded={() => setSignVideoPlaying(false)}
                  className="w-full h-full object-cover bg-black"
                />
              ) : (
                <img
                  src={activeSign.artistImageUrl}
                  alt={activeSign.artistName}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute top-3 left-3 pointer-events-none">
                <span className="px-2.5 py-1 rounded text-[11px] font-extrabold bg-[#4ade80] text-[#0b0b0b]">
                  SINAL EM LIBRAS
                </span>
              </div>
            </div>

            <div className="bg-[#181818] border border-white/10 rounded-2xl p-6 space-y-5">
              <div className="space-y-2">
                <div className="text-[11px] font-bold tracking-[1.4px] uppercase text-[#4ade80]">
                  TUTORIAL EM LIBRAS · {activeSign.artistName}
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white">{activeSign.signTitle}</h2>
                <p className="text-sm text-[#d4d4d4] leading-relaxed">{activeSign.signDescription}</p>
              </div>

              {activeSign.videoUrl && (
                <div className="text-xs font-mono-num text-[#b3b3b3]">
                  Duração do tutorial: {formatSec(signVideoTime)} / {formatSec(signVideoDuration)}
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleToggleSignPlay}
                  className="min-h-[42px] px-5 rounded-full bg-[#4ade80] text-[#0b0b0b] text-sm font-extrabold inline-flex items-center gap-2 hover:brightness-110 transition"
                >
                  {signVideoPlaying || (!activeSign.videoUrl && isSignPlaying) ? (
                    <Pause className="w-4 h-4 fill-current" />
                  ) : (
                    <Play className="w-4 h-4 fill-current" />
                  )}
                  {signVideoPlaying ? 'Pausar vídeo do sinal' : 'Assistir como fazer o sinal'}
                </button>

                {activeSignTrack && (
                  <button
                    type="button"
                    onClick={() => onPlayTrack(activeSignTrack, accessibleTracks)}
                    className="min-h-[42px] px-4 rounded-full border border-white/25 text-white text-xs font-bold inline-flex items-center gap-1.5 hover:border-white transition"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-[#1DB954]" />
                    Ouvir {activeSign.featuredTrackTitle}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => onOpenArtist(activeSign.artistId)}
                  className="min-h-[42px] px-4 rounded-full border border-white/25 text-white text-xs font-bold hover:border-white transition"
                >
                  Perfil de {activeSign.artistName}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: HISTÓRIAS DOS FÃS (4 Real Vertical MP4 Videos) */}
      {activeTab === 'historias' && (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl">
          {fanStories.map((story, idx) => (
            <button
              key={story.id}
              type="button"
              onClick={() => {
                setActiveStoryIdx(idx);
                setStoryElapsed(0);
                setStoryPlaying(true);
              }}
              className="group relative aspect-[9/15] rounded-xl overflow-hidden bg-[#181818] text-left border border-white/10 hover:border-[#4ade80] transition focus-visible:outline-2 focus-visible:outline-[#4ade80]"
            >
              <img
                src={story.posterUrl}
                alt={story.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/30" />

              <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                <span className="px-2 py-0.5 rounded bg-[#4ade80] text-[#0b0b0b] text-[10px] font-extrabold">
                  HISTÓRIA
                </span>
                <span className="font-mono-num text-[11px] font-semibold text-white/90 bg-black/55 px-1.5 py-0.5 rounded">
                  {formatSec(story.durationSec)}
                </span>
              </div>

              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-black/60 border border-white/30 flex items-center justify-center text-white group-hover:bg-[#4ade80] group-hover:text-[#0b0b0b] group-hover:border-[#4ade80] transition">
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                </div>
              </div>

              <div className="absolute bottom-3 left-3 right-3 space-y-1">
                <div className="text-base font-extrabold text-white leading-tight">{story.name}</div>
                <div className="text-[11px] text-[#4ade80] font-semibold truncate">{story.role}</div>
                <p className="text-[11px] text-[#e5e5e5] line-clamp-2 leading-snug">
                  “{story.quote}”
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Fan Story Full Modal with Real Video */}
      {activeStory && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => {
            storyVideoRef.current?.pause();
            setActiveStoryIdx(-1);
            setStoryPlaying(false);
          }}
          role="dialog"
          aria-modal="true"
          aria-label={`História de ${activeStory.name}`}
        >
          <div
            className="relative w-full max-w-[380px] h-[640px] max-h-[90vh] rounded-2xl overflow-hidden bg-black border border-white/15 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <video
              ref={storyVideoRef}
              key={activeStory.videoUrl}
              src={activeStory.videoUrl}
              poster={activeStory.posterUrl}
              playsInline
              preload="auto"
              muted={storyMuted}
              onTimeUpdate={(e) => setStoryElapsed(e.currentTarget.currentTime)}
              onLoadedMetadata={(e) =>
                setStoryDuration(e.currentTarget.duration || activeStory.durationSec)
              }
              onEnded={() => {
                setActiveStoryIdx((i) => (i + 1) % fanStories.length);
              }}
              onClick={handleToggleStoryVideo}
              className="absolute inset-0 w-full h-full object-cover cursor-pointer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/50 pointer-events-none" />

            {/* Top Progress Segments */}
            <div className="absolute top-3 left-3 right-3 flex gap-1.5 z-10">
              {fanStories.map((s, idx) => (
                <div key={s.id} className="flex-1 h-1 rounded-full bg-white/30 overflow-hidden">
                  <div
                    className="h-full bg-[#4ade80] transition-all duration-150"
                    style={{
                      width:
                        idx < activeStoryIdx
                          ? '100%'
                          : idx === activeStoryIdx
                          ? `${storyDuration > 0 ? Math.min(100, (storyElapsed / storyDuration) * 100) : 0}%`
                          : '0%',
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Top Controls */}
            <div className="absolute top-7 left-3 right-3 z-10 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  storyVideoRef.current?.pause();
                  setActiveStoryIdx(-1);
                  setStoryPlaying(false);
                }}
                aria-label="Fechar história"
                className="w-10 h-10 rounded-full bg-black/65 text-white flex items-center justify-center hover:bg-black"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setStoryMuted((m) => !m);
                    if (storyVideoRef.current) storyVideoRef.current.muted = !storyMuted;
                  }}
                  aria-label={storyMuted ? 'Ativar áudio' : 'Silenciar'}
                  className="w-10 h-10 rounded-full bg-black/65 text-white flex items-center justify-center hover:bg-black"
                >
                  {storyMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={handleToggleStoryVideo}
                  aria-label={storyPlaying ? 'Pausar história' : 'Reproduzir história'}
                  className="w-10 h-10 rounded-full bg-black/65 text-white flex items-center justify-center hover:bg-[#4ade80] hover:text-[#0b0b0b] transition"
                >
                  {storyPlaying ? (
                    <Pause className="w-4 h-4 fill-current" />
                  ) : (
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Prev / Next Arrows */}
            <button
              type="button"
              onClick={() => setActiveStoryIdx((i) => (i - 1 + fanStories.length) % fanStories.length)}
              aria-label="História anterior"
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/55 text-white flex items-center justify-center hover:bg-black/80"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => setActiveStoryIdx((i) => (i + 1) % fanStories.length)}
              aria-label="Próxima história"
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/55 text-white flex items-center justify-center hover:bg-black/80"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Bottom Metadata & Favorite Track */}
            <div className="absolute left-4 right-4 bottom-4 z-10 space-y-2.5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-extrabold text-white">{activeStory.name}</span>
                  {activeStory.handle && (
                    <span className="text-xs text-[#4ade80] font-semibold">{activeStory.handle}</span>
                  )}
                </div>
                <div className="text-xs text-[#d4d4d4]">{activeStory.role}</div>
              </div>
              <div className="flex items-center justify-between gap-2 pt-1">
                <EntreSinaisLogo size="xs" />
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const fav = accessibleTracks.find(
                        (t) => t.id === activeStory.favoriteTrackId
                      );
                      if (fav) {
                        storyVideoRef.current?.pause();
                        setStoryPlaying(false);
                        onPlayTrack(fav, accessibleTracks);
                      }
                    }}
                    className="px-3 py-1.5 rounded-full bg-[#4ade80] text-[#0b0b0b] text-xs font-extrabold hover:brightness-110 transition"
                  >
                    Ouvir faixa
                  </button>
                  <span className="font-mono-num text-xs text-white/90">
                    {formatSec(storyElapsed)} / {formatSec(storyDuration)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
