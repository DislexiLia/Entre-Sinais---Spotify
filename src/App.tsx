import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Hand, Loader2, Search } from 'lucide-react';
import { EntreSinaisLogo } from './components/BrandAssets.tsx';
import {
  AlbumView,
  ArtistView,
  HistoryView,
  LibraryView,
  PlaylistView,
} from './components/DetailViews.tsx';
import { EntreSinaisView } from './components/EntreSinaisView.tsx';
import { HomeView } from './components/HomeView.tsx';
import { PlayerBar } from './components/PlayerBar.tsx';
import { PlaylistDialog } from './components/PlaylistDialog.tsx';
import { SearchView } from './components/SearchView.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { SpotifyEmbedModal } from './components/SpotifyEmbedModal.tsx';
import type {
  Album,
  Artist,
  ArtistSign,
  FanStory,
  LibrasClip,
  LibraryState,
  Playlist,
  RepeatMode,
  RouteView,
  Track,
} from './types/music.ts';

interface HomeDataPayload {
  featuredAlbums: Album[];
  artists: Artist[];
  playlists: Playlist[];
  entreSinais: {
    librasClips: LibrasClip[];
    artistSigns: ArtistSign[];
    fanStories: FanStory[];
    accessibleTracks: Track[];
  };
}

const STORAGE_KEY = 'sp_es_library_v1';

const DEFAULT_LIBRARY: LibraryState = {
  likedTracks: [],
  userPlaylists: [],
  savedAlbums: [],
  followedArtists: [],
  history: [],
  accessibleMode: false,
};

function loadLibrary(): LibraryState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_LIBRARY;
    const parsed = JSON.parse(raw);
    return {
      likedTracks: Array.isArray(parsed.likedTracks) ? parsed.likedTracks : [],
      userPlaylists: Array.isArray(parsed.userPlaylists) ? parsed.userPlaylists : [],
      savedAlbums: Array.isArray(parsed.savedAlbums) ? parsed.savedAlbums : [],
      followedArtists: Array.isArray(parsed.followedArtists) ? parsed.followedArtists : [],
      history: Array.isArray(parsed.history) ? parsed.history : [],
      accessibleMode: Boolean(parsed.accessibleMode),
    };
  } catch {
    return DEFAULT_LIBRARY;
  }
}

export default function App() {
  const [homeData, setHomeData] = useState<HomeDataPayload | null>(null);
  const [homeLoading, setHomeLoading] = useState(true);
  const [homeError, setHomeError] = useState<string | null>(null);

  // Navigation history stack
  const [navStack, setNavStack] = useState<RouteView[]>([{ page: 'home' }]);
  const [navIndex, setNavIndex] = useState(0);
  const currentRoute = navStack[navIndex] || { page: 'home' };
  const mainScrollRef = useRef<HTMLDivElement | null>(null);

  // Persistent personal library
  const [library, setLibrary] = useState<LibraryState>(() => loadLibrary());
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(library));
    } catch {
      // ignore quota errors
    }
  }, [library]);

  // Real audio player state
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [queue, setQueue] = useState<Track[]>([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(30);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<RepeatMode>('off');
  const [playbackNotice, setPlaybackNotice] = useState<string | null>(null);

  // Modals
  const [playlistDialogTrack, setPlaylistDialogTrack] = useState<Track | null | undefined>(undefined);
  const [embedTarget, setEmbedTarget] = useState<{
    track: Track | null;
    albumSpotifyId?: string | null;
    albumTitle?: string | null;
  } | null>(null);

  const currentTrack = queue[queueIndex] || null;
  const likedTrackIds = useMemo(
    () => new Set(library.likedTracks.map((t) => t.id)),
    [library.likedTracks]
  );

  // Fetch initial catalog
  useEffect(() => {
    fetch('/api/home')
      .then((res) => {
        if (!res.ok) throw new Error('Falha ao carregar catálogo');
        return res.json();
      })
      .then((data: HomeDataPayload) => {
        setHomeData(data);
        // Pre-seed queue quietly with Memórias Póstumas without auto-playing
        const firstTracks = data.featuredAlbums[0]?.tracks || [];
        if (firstTracks.length > 0) {
          setQueue((prev) => (prev.length === 0 ? firstTracks : prev));
        }
      })
      .catch(() => {
        setHomeError('Não foi possível conectar ao catálogo musical.');
      })
      .finally(() => {
        setHomeLoading(false);
      });
  }, []);

  const navigate = useCallback((view: RouteView) => {
    setNavStack((prev) => {
      const sliced = prev.slice(0, navIndex + 1);
      const next = [...sliced, view];
      setNavIndex(next.length - 1);
      return next;
    });
    mainScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [navIndex]);

  const goBack = () => {
    if (navIndex > 0) {
      setNavIndex((i) => i - 1);
      mainScrollRef.current?.scrollTo({ top: 0 });
    }
  };

  const goForward = () => {
    if (navIndex < navStack.length - 1) {
      setNavIndex((i) => i + 1);
      mainScrollRef.current?.scrollTo({ top: 0 });
    }
  };

  // Record track in history
  const recordHistory = useCallback((track: Track) => {
    setLibrary((prev) => ({
      ...prev,
      history: [
        { track, playedAt: Date.now() },
        ...prev.history.filter((h) => h.track.id !== track.id),
      ].slice(0, 40),
    }));
  }, []);

  // Load & play audio URL with automatic refresh fallback
  const playTrackFromQueue = useCallback(
    async (nextQueue: Track[], index: number) => {
      const target = nextQueue[index];
      if (!target) return;

      setQueue(nextQueue);
      setQueueIndex(index);
      setCurrentTime(0);
      setPlaybackNotice(null);
      recordHistory(target);

      const audio = audioRef.current;
      if (!audio) return;

      let url = target.previewUrl;
      if (!url) {
        setIsBuffering(true);
        try {
          const res = await fetch(
            `/api/track/preview?id=${encodeURIComponent(target.id)}&title=${encodeURIComponent(
              target.title
            )}&artist=${encodeURIComponent(target.artistName)}`
          );
          const data = await res.json();
          if (data.previewUrl) {
            url = data.previewUrl;
            // Cache refreshed URL back into queue
            setQueue((q) =>
              q.map((item, idx) => (idx === index ? { ...item, previewUrl: url } : item))
            );
          }
        } catch {
          // ignore
        } finally {
          setIsBuffering(false);
        }
      }

      if (!url) {
        setIsPlaying(false);
        setPlaybackNotice('Prévia indisponível — abra o Spotify Oficial');
        setEmbedTarget({ track: target });
        return;
      }

      audio.src = url;
      audio.currentTime = 0;
      setIsBuffering(true);
      try {
        await audio.play();
        setIsPlaying(true);
        setPlaybackNotice('Prévia oficial 30s');
      } catch (err) {
        console.warn('Audio play interrupted or blocked:', err);
        setIsPlaying(false);
      } finally {
        setIsBuffering(false);
      }
    },
    [recordHistory]
  );

  const handlePlayTrack = useCallback(
    (track: Track, contextQueue?: Track[]) => {
      if (currentTrack?.id === track.id && audioRef.current?.src) {
        if (isPlaying) {
          audioRef.current.pause();
          setIsPlaying(false);
        } else {
          audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
        }
        return;
      }
      const list = contextQueue && contextQueue.length > 0 ? contextQueue : [track];
      const idx = Math.max(
        0,
        list.findIndex((t) => t.id === track.id)
      );
      playTrackFromQueue(list, idx);
    },
    [currentTrack, isPlaying, playTrackFromQueue]
  );

  const handlePlayAlbum = useCallback(
    async (album: Album) => {
      if (album.tracks && album.tracks.length > 0) {
        playTrackFromQueue(album.tracks, 0);
        return;
      }
      try {
        const res = await fetch(`/api/album/${encodeURIComponent(album.id)}`);
        if (!res.ok) return;
        const full: Album = await res.json();
        if (full.tracks && full.tracks.length > 0) {
          playTrackFromQueue(full.tracks, 0);
        }
      } catch {
        // ignore
      }
    },
    [playTrackFromQueue]
  );

  const handlePlayAlbumById = useCallback(
    async (albumId: string) => {
      try {
        const res = await fetch(`/api/album/${encodeURIComponent(albumId)}`);
        if (!res.ok) return;
        const full: Album = await res.json();
        if (full.tracks && full.tracks.length > 0) {
          playTrackFromQueue(full.tracks, 0);
        }
      } catch {
        // ignore
      }
    },
    [playTrackFromQueue]
  );

  const handlePlayArtist = useCallback(
    async (artist: Artist) => {
      if (artist.topTracks && artist.topTracks.length > 0) {
        playTrackFromQueue(artist.topTracks, 0);
        return;
      }
      try {
        const res = await fetch(`/api/artist/${encodeURIComponent(artist.id)}`);
        if (!res.ok) return;
        const full: Artist = await res.json();
        if (full.topTracks && full.topTracks.length > 0) {
          playTrackFromQueue(full.topTracks, 0);
        }
      } catch {
        // ignore
      }
    },
    [playTrackFromQueue]
  );

  const handlePlayPlaylist = useCallback(
    async (playlist: Playlist) => {
      if (playlist.tracks && playlist.tracks.length > 0) {
        playTrackFromQueue(playlist.tracks, 0);
        return;
      }
      try {
        const res = await fetch(`/api/playlist/${encodeURIComponent(playlist.id)}`);
        if (!res.ok) return;
        const full: Playlist = await res.json();
        if (full.tracks && full.tracks.length > 0) {
          playTrackFromQueue(full.tracks, 0);
        }
      } catch {
        // ignore
      }
    },
    [playTrackFromQueue]
  );

  const handleTogglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!currentTrack) {
      const fallbackQueue = homeData?.featuredAlbums[0]?.tracks || [];
      if (fallbackQueue.length > 0) {
        playTrackFromQueue(fallbackQueue, 0);
      }
      return;
    }
    if (!audio) return;
    if (!audio.src) {
      playTrackFromQueue(queue, queueIndex);
      return;
    }
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  }, [currentTrack, homeData, isPlaying, playTrackFromQueue, queue, queueIndex]);

  const handleNext = useCallback(
    (isAuto = false) => {
      if (queue.length === 0) return;
      if (isAuto && repeat === 'one') {
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
        }
        return;
      }
      let nextIdx = queueIndex + 1;
      if (shuffle && queue.length > 1) {
        do {
          nextIdx = Math.floor(Math.random() * queue.length);
        } while (nextIdx === queueIndex);
      } else if (nextIdx >= queue.length) {
        if (repeat === 'all' || !isAuto) {
          nextIdx = 0;
        } else {
          setIsPlaying(false);
          setCurrentTime(0);
          return;
        }
      }
      playTrackFromQueue(queue, nextIdx);
    },
    [playTrackFromQueue, queue, queueIndex, repeat, shuffle]
  );

  const handlePrev = useCallback(() => {
    if (queue.length === 0) return;
    if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      return;
    }
    const prevIdx = queueIndex > 0 ? queueIndex - 1 : queue.length - 1;
    playTrackFromQueue(queue, prevIdx);
  }, [playTrackFromQueue, queue, queueIndex]);

  const handleSeek = useCallback((sec: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = sec;
    setCurrentTime(sec);
  }, []);

  // Sync audio element volume & mute
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPlaylistDialogTrack(undefined);
        setEmbedTarget(null);
      }
      if (
        e.code === 'Space' &&
        !['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes((e.target as HTMLElement)?.tagName || '')
      ) {
        e.preventDefault();
        handleTogglePlay();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleTogglePlay]);

  // Library actions
  const toggleLikeTrack = (track: Track) => {
    setLibrary((prev) => {
      const exists = prev.likedTracks.some((t) => t.id === track.id);
      return {
        ...prev,
        likedTracks: exists
          ? prev.likedTracks.filter((t) => t.id !== track.id)
          : [track, ...prev.likedTracks],
      };
    });
  };

  const addTrackToPlaylist = (playlistId: string, track: Track) => {
    setLibrary((prev) => ({
      ...prev,
      userPlaylists: prev.userPlaylists.map((pl) =>
        pl.id === playlistId && !pl.tracks.some((t) => t.id === track.id)
          ? { ...pl, tracks: [...pl.tracks, track] }
          : pl
      ),
    }));
  };

  const createPlaylist = (name: string, initialTrack: Track | null = null) => {
    const id = `user-pl-${Date.now().toString(36)}`;
    setLibrary((prev) => ({
      ...prev,
      userPlaylists: [
        {
          id,
          name,
          description: 'Playlist pessoal',
          tracks: initialTrack ? [initialTrack] : [],
          createdAt: Date.now(),
        },
        ...prev.userPlaylists,
      ],
    }));
  };

  const deleteUserPlaylist = (playlistId: string) => {
    setLibrary((prev) => ({
      ...prev,
      userPlaylists: prev.userPlaylists.filter((pl) => pl.id !== playlistId),
    }));
  };

  const removeTrackFromUserPlaylist = (playlistId: string, trackId: string) => {
    setLibrary((prev) => ({
      ...prev,
      userPlaylists: prev.userPlaylists.map((pl) =>
        pl.id === playlistId
          ? { ...pl, tracks: pl.tracks.filter((t) => t.id !== trackId) }
          : pl
      ),
    }));
  };

  const toggleSaveAlbum = (album: Album) => {
    setLibrary((prev) => {
      const exists = prev.savedAlbums.some((a) => a.id === album.id);
      return {
        ...prev,
        savedAlbums: exists
          ? prev.savedAlbums.filter((a) => a.id !== album.id)
          : [album, ...prev.savedAlbums],
      };
    });
  };

  const toggleFollowArtist = (artist: Artist) => {
    setLibrary((prev) => {
      const exists = prev.followedArtists.some((a) => a.id === artist.id);
      return {
        ...prev,
        followedArtists: exists
          ? prev.followedArtists.filter((a) => a.id !== artist.id)
          : [artist, ...prev.followedArtists],
      };
    });
  };

  const handleAudioError = async () => {
    if (!currentTrack) return;
    // Try refreshing expired Deezer/Spotify preview URL once
    try {
      const res = await fetch(
        `/api/track/preview?id=${encodeURIComponent(currentTrack.id)}&title=${encodeURIComponent(
          currentTrack.title
        )}&artist=${encodeURIComponent(currentTrack.artistName)}`
      );
      const data = await res.json();
      if (data.previewUrl && data.previewUrl !== currentTrack.previewUrl && audioRef.current) {
        audioRef.current.src = data.previewUrl;
        await audioRef.current.play();
        setIsPlaying(true);
        return;
      }
    } catch {
      // ignore
    }
    setIsPlaying(false);
    setPlaybackNotice('Prévia indisponível neste navegador — use Spotify Oficial');
  };

  return (
    <div className="h-screen w-screen bg-black text-white flex flex-col overflow-hidden">
      {/* Hidden Real Audio Element */}
      <audio
        ref={audioRef}
        preload="auto"
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 30)}
        onEnded={() => handleNext(true)}
        onWaiting={() => setIsBuffering(true)}
        onCanPlay={() => setIsBuffering(false)}
        onError={handleAudioError}
      />

      {/* Main Workspace (Sidebar + Main Panel) */}
      <div className="flex-1 min-h-0 flex gap-2 p-2 pb-[144px] md:pb-[96px]">
        <Sidebar
          route={currentRoute}
          likedCount={library.likedTracks.length}
          userPlaylists={library.userPlaylists}
          systemPlaylists={homeData?.playlists || []}
          pinnedAlbums={homeData?.featuredAlbums || []}
          savedAlbums={library.savedAlbums}
          onNavigate={navigate}
          onCreatePlaylistQuick={() => setPlaylistDialogTrack(null)}
        />

        <main className="flex-1 min-w-0 bg-[#121212] rounded-xl flex flex-col overflow-hidden">
          {/* Top Navigation Bar inside Main Panel */}
          <header className="shrink-0 h-14 px-4 sm:px-6 flex items-center justify-between gap-4 border-b border-white/[0.06] bg-[#121212]/90 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={goBack}
                disabled={navIndex === 0}
                aria-label="Voltar"
                className="w-8 h-8 rounded-full bg-black/60 flex items-center justify-center text-white disabled:opacity-35 hover:bg-black transition"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={goForward}
                disabled={navIndex >= navStack.length - 1}
                aria-label="Avançar"
                className="w-8 h-8 rounded-full bg-black/60 flex items-center justify-center text-white disabled:opacity-35 hover:bg-black transition"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {currentRoute.page !== 'search' && (
                <button
                  type="button"
                  onClick={() => navigate({ page: 'search' })}
                  className="hidden sm:inline-flex items-center gap-2 ml-2 h-9 px-4 rounded-full bg-[#242424] hover:bg-[#2f2f2f] text-xs font-medium text-[#b3b3b3] hover:text-white transition"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Buscar músicas, artistas ou álbuns…</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setLibrary((prev) => ({ ...prev, accessibleMode: !prev.accessibleMode }))
                }
                aria-pressed={library.accessibleMode}
                className={`h-8 px-3 rounded-full text-xs font-bold inline-flex items-center gap-1.5 transition whitespace-nowrap ${
                  library.accessibleMode
                    ? 'bg-[#4ade80] text-[#0b0b0b]'
                    : 'bg-[#1b2a21] text-[#4ade80] border border-[#4ade80]/30 hover:border-[#4ade80]'
                }`}
                title="Alternar modo acessível em Libras"
              >
                <Hand className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">
                  Libras {library.accessibleMode ? 'Ativo' : 'Acessível'}
                </span>
              </button>
              <button
                type="button"
                onClick={() => navigate({ page: 'entre-sinais', tab: 'sobre' })}
                className="hidden md:inline-flex items-center px-2 py-1 rounded-full hover:bg-white/[0.06] transition"
                aria-label="Ir para campanha Entre Sinais"
              >
                <EntreSinaisLogo size="sm" />
              </button>
            </div>
          </header>

          {/* Scrollable Viewport */}
          <div ref={mainScrollRef} className="flex-1 overflow-y-auto px-4 sm:px-6 pt-5">
            {homeLoading ? (
              <div className="flex items-center gap-3 py-20 text-sm text-[#b3b3b3]">
                <Loader2 className="w-6 h-6 animate-spin text-[#1DB954]" />
                <span>Carregando músicas, álbuns e perfis reais do Spotify…</span>
              </div>
            ) : homeError || !homeData ? (
              <div className="py-16 text-center space-y-3">
                <p className="text-lg font-bold text-white">{homeError || 'Erro ao carregar'}</p>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="px-5 py-2.5 rounded-full bg-[#1DB954] text-black text-sm font-bold"
                >
                  Tentar novamente
                </button>
              </div>
            ) : (
              <>
                {currentRoute.page === 'home' && (
                  <HomeView
                    albums={homeData.featuredAlbums}
                    artists={homeData.artists}
                    playlists={homeData.playlists}
                    accessibleTracks={homeData.entreSinais.accessibleTracks}
                    history={library.history}
                    likedTracks={library.likedTracks}
                    currentTrack={currentTrack}
                    isPlaying={isPlaying}
                    likedTrackIds={likedTrackIds}
                    onNavigate={navigate}
                    onPlayTrack={handlePlayTrack}
                    onPlayAlbum={handlePlayAlbum}
                    onPlayArtist={handlePlayArtist}
                    onPlayPlaylist={handlePlayPlaylist}
                    onToggleLike={toggleLikeTrack}
                    onAddToPlaylist={(tr) => setPlaylistDialogTrack(tr)}
                  />
                )}

                {currentRoute.page === 'search' && (
                  <SearchView
                    initialQuery={currentRoute.initialQuery}
                    currentTrack={currentTrack}
                    isPlaying={isPlaying}
                    likedTrackIds={likedTrackIds}
                    onNavigate={navigate}
                    onPlayTrack={handlePlayTrack}
                    onPlayAlbum={handlePlayAlbum}
                    onPlayArtist={handlePlayArtist}
                    onPlayPlaylist={handlePlayPlaylist}
                    onToggleLike={toggleLikeTrack}
                    onAddToPlaylist={(tr) => setPlaylistDialogTrack(tr)}
                  />
                )}

                {currentRoute.page === 'artist' && (
                  <ArtistView
                    artistId={currentRoute.id}
                    isFollowed={library.followedArtists.some((a) => a.id === currentRoute.id)}
                    currentTrack={currentTrack}
                    isPlaying={isPlaying}
                    likedTrackIds={likedTrackIds}
                    onNavigate={navigate}
                    onPlayTrack={handlePlayTrack}
                    onToggleLike={toggleLikeTrack}
                    onAddToPlaylist={(tr) => setPlaylistDialogTrack(tr)}
                    onToggleFollowArtist={toggleFollowArtist}
                    onPlayAlbumById={handlePlayAlbumById}
                  />
                )}

                {currentRoute.page === 'album' && (
                  <AlbumView
                    albumId={currentRoute.id}
                    isSaved={library.savedAlbums.some((a) => a.id === currentRoute.id)}
                    currentTrack={currentTrack}
                    isPlaying={isPlaying}
                    likedTrackIds={likedTrackIds}
                    onNavigate={navigate}
                    onPlayTrack={handlePlayTrack}
                    onToggleLike={toggleLikeTrack}
                    onAddToPlaylist={(tr) => setPlaylistDialogTrack(tr)}
                    onToggleSaveAlbum={toggleSaveAlbum}
                    onOpenSpotifyEmbedAlbum={(al) =>
                      setEmbedTarget({
                        track: null,
                        albumSpotifyId: al.id,
                        albumTitle: `${al.title} · ${al.artistName}`,
                      })
                    }
                  />
                )}

                {currentRoute.page === 'playlist' && (
                  <PlaylistView
                    playlistId={currentRoute.id}
                    likedTracks={library.likedTracks}
                    userPlaylists={library.userPlaylists}
                    systemPlaylists={homeData.playlists}
                    currentTrack={currentTrack}
                    isPlaying={isPlaying}
                    likedTrackIds={likedTrackIds}
                    onNavigate={navigate}
                    onPlayTrack={handlePlayTrack}
                    onToggleLike={toggleLikeTrack}
                    onAddToPlaylist={(tr) => setPlaylistDialogTrack(tr)}
                    onRemoveTrackFromUserPlaylist={removeTrackFromUserPlaylist}
                    onDeleteUserPlaylist={deleteUserPlaylist}
                  />
                )}

                {currentRoute.page === 'library' && (
                  <LibraryView
                    likedTracks={library.likedTracks}
                    userPlaylists={library.userPlaylists}
                    systemPlaylists={homeData.playlists}
                    savedAlbums={library.savedAlbums}
                    followedArtists={library.followedArtists}
                    featuredAlbums={homeData.featuredAlbums}
                    featuredArtists={homeData.artists}
                    currentTrack={currentTrack}
                    isPlaying={isPlaying}
                    likedTrackIds={likedTrackIds}
                    onNavigate={navigate}
                    onPlayTrack={handlePlayTrack}
                    onToggleLike={toggleLikeTrack}
                    onAddToPlaylist={(tr) => setPlaylistDialogTrack(tr)}
                    onCreatePlaylist={(name) => createPlaylist(name, null)}
                    onDeleteUserPlaylist={deleteUserPlaylist}
                    onPlayAlbum={handlePlayAlbum}
                    onPlayArtist={handlePlayArtist}
                  />
                )}

                {currentRoute.page === 'history' && (
                  <HistoryView
                    history={library.history}
                    currentTrack={currentTrack}
                    isPlaying={isPlaying}
                    likedTrackIds={likedTrackIds}
                    onNavigate={navigate}
                    onPlayTrack={handlePlayTrack}
                    onToggleLike={toggleLikeTrack}
                    onAddToPlaylist={(tr) => setPlaylistDialogTrack(tr)}
                    onClearHistory={() => setLibrary((prev) => ({ ...prev, history: [] }))}
                  />
                )}

                {currentRoute.page === 'entre-sinais' && (
                  <EntreSinaisView
                    activeTab={currentRoute.tab || 'sobre'}
                    initialClipId={currentRoute.clipId}
                    librasClips={homeData.entreSinais.librasClips}
                    artistSigns={homeData.entreSinais.artistSigns}
                    fanStories={homeData.entreSinais.fanStories}
                    accessibleTracks={homeData.entreSinais.accessibleTracks}
                    accessibleMode={library.accessibleMode}
                    currentTrack={currentTrack}
                    isPlaying={isPlaying}
                    currentTime={currentTime}
                    duration={duration}
                    likedTrackIds={likedTrackIds}
                    onChangeTab={(tab) =>
                      navigate({ page: 'entre-sinais', tab, clipId: currentRoute.clipId })
                    }
                    onToggleAccessibleMode={() =>
                      setLibrary((prev) => ({ ...prev, accessibleMode: !prev.accessibleMode }))
                    }
                    onPlayTrack={handlePlayTrack}
                    onTogglePlay={handleTogglePlay}
                    onSeek={handleSeek}
                    onToggleLike={toggleLikeTrack}
                    onAddToPlaylist={(tr) => setPlaylistDialogTrack(tr)}
                    onOpenArtist={(id) => navigate({ page: 'artist', id })}
                    onOpenAlbum={(id) => navigate({ page: 'album', id })}
                    onPauseMainAudio={() => {
                      if (audioRef.current && !audioRef.current.paused) {
                        audioRef.current.pause();
                        setIsPlaying(false);
                      }
                    }}
                  />
                )}
              </>
            )}
          </div>
        </main>
      </div>

      {/* Fixed Bottom Player Bar */}
      <PlayerBar
        currentTrack={currentTrack}
        queue={queue}
        queueIndex={queueIndex}
        isPlaying={isPlaying}
        isBuffering={isBuffering}
        currentTime={currentTime}
        duration={duration}
        volume={volume}
        isMuted={isMuted}
        shuffle={shuffle}
        repeat={repeat}
        isLiked={Boolean(currentTrack && likedTrackIds.has(currentTrack.id))}
        accessibleMode={library.accessibleMode}
        playbackNotice={playbackNotice}
        onTogglePlay={handleTogglePlay}
        onNext={() => handleNext(false)}
        onPrev={handlePrev}
        onSeek={handleSeek}
        onVolumeChange={(v) => {
          setVolume(v);
          if (v > 0 && isMuted) setIsMuted(false);
        }}
        onToggleMute={() => setIsMuted((m) => !m)}
        onToggleShuffle={() => setShuffle((s) => !s)}
        onCycleRepeat={() =>
          setRepeat((r) => (r === 'off' ? 'all' : r === 'all' ? 'one' : 'off'))
        }
        onToggleLike={toggleLikeTrack}
        onToggleAccessible={() =>
          setLibrary((prev) => ({ ...prev, accessibleMode: !prev.accessibleMode }))
        }
        onOpenAlbum={(id) => navigate({ page: 'album', id })}
        onOpenArtist={(id) => navigate({ page: 'artist', id })}
        onOpenLibrasClip={(clipId) =>
          navigate({ page: 'entre-sinais', tab: 'clipes', clipId })
        }
        onOpenSpotifyEmbed={(track) => setEmbedTarget({ track })}
        onSelectQueueIndex={(idx) => playTrackFromQueue(queue, idx)}
      />

      {/* Playlist Dialog */}
      {playlistDialogTrack !== undefined && (
        <PlaylistDialog
          track={playlistDialogTrack}
          userPlaylists={library.userPlaylists}
          onClose={() => setPlaylistDialogTrack(undefined)}
          onAddTrackToPlaylist={addTrackToPlaylist}
          onCreatePlaylistWithTrack={(name, tr) => createPlaylist(name, tr)}
        />
      )}

      {/* Official Spotify Embed Modal */}
      {embedTarget && (
        <SpotifyEmbedModal
          track={embedTarget.track}
          albumSpotifyId={embedTarget.albumSpotifyId}
          albumTitle={embedTarget.albumTitle}
          onClose={() => setEmbedTarget(null)}
        />
      )}
    </div>
  );
}
