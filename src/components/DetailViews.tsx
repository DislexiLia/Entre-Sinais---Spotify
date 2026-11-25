import React, { useEffect, useState } from 'react';
import {
  BadgeCheck,
  Clock,
  ExternalLink,
  Hand,
  Heart,
  Loader2,
  Play,
  Plus,
  Trash2,
} from 'lucide-react';
import type {
  Album,
  Artist,
  HistoryEntry,
  Playlist,
  RouteView,
  Track,
  UserPlaylist,
} from '../types/music.ts';
import { CoverImage, EntreSinaisLogo, SpotifyMark, formatMs } from './BrandAssets.tsx';
import { AlbumCard, ArtistCard, PlaylistCard } from './MediaCards.tsx';
import { TrackRow } from './TrackRow.tsx';

interface SharedDetailProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  likedTrackIds: Set<string>;
  onNavigate: (view: RouteView) => void;
  onPlayTrack: (track: Track, queue?: Track[]) => void;
  onToggleLike: (track: Track) => void;
  onAddToPlaylist: (track: Track) => void;
}

/* ===========================
   ARTIST VIEW
=========================== */
interface ArtistViewProps extends SharedDetailProps {
  artistId: string;
  isFollowed: boolean;
  onToggleFollowArtist: (artist: Artist) => void;
  onPlayAlbumById: (albumId: string) => void;
}

export function ArtistView({
  artistId,
  isFollowed,
  currentTrack,
  isPlaying,
  likedTrackIds,
  onNavigate,
  onPlayTrack,
  onToggleLike,
  onAddToPlaylist,
  onToggleFollowArtist,
  onPlayAlbumById,
}: ArtistViewProps) {
  const [artist, setArtist] = useState<Artist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAllTracks, setShowAllTracks] = useState(false);
  const [discoTab, setDiscoTab] = useState<'all' | 'albums' | 'singles'>('all');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    setShowAllTracks(false);

    fetch(`/api/artist/${encodeURIComponent(artistId)}`)
      .then((res) => {
        if (!res.ok) throw new Error('Artista não encontrado');
        return res.json();
      })
      .then((data: Artist) => {
        if (active) setArtist(data);
      })
      .catch(() => {
        if (active) setError('Não foi possível carregar o perfil deste artista.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [artistId]);

  if (loading) {
    return (
      <div className="flex items-center gap-3 py-16 text-sm text-[#b3b3b3]">
        <Loader2 className="w-5 h-5 animate-spin text-[#1DB954]" />
        <span>Carregando perfil do artista…</span>
      </div>
    );
  }

  if (error || !artist) {
    return (
      <div className="py-12 space-y-4">
        <p className="text-lg font-bold text-white">{error || 'Artista não encontrado'}</p>
        <button
          type="button"
          onClick={() => onNavigate({ page: 'home' })}
          className="px-5 py-2.5 rounded-full bg-white text-black text-sm font-bold"
        >
          Voltar ao Início
        </button>
      </div>
    );
  }

  const topTracks = artist.topTracks || [];
  const visibleTracks = showAllTracks ? topTracks : topTracks.slice(0, 5);
  const albums = artist.albums || [];
  const singles = artist.singles || [];
  const displayedReleases =
    discoTab === 'albums' ? albums : discoTab === 'singles' ? singles : [...albums, ...singles];

  return (
    <div className="space-y-8 pb-10">
      {/* Artist Hero */}
      <div
        className="rounded-xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-end gap-6"
        style={{
          background: `linear-gradient(180deg, ${artist.accentColor || '#262626'} 0%, #121212 100%)`,
        }}
      >
        <CoverImage
          src={artist.imageUrl}
          alt={artist.name}
          className="w-36 h-36 sm:w-48 sm:h-48 shadow-2xl"
          rounded="full"
          fallbackType="artist"
        />
        <div className="space-y-2 min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-white">
            <BadgeCheck className="w-5 h-5 text-[#3b82f6] fill-[#3b82f6] stroke-white" />
            <span>Artista verificado</span>
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white break-words">
            {artist.name}
          </h1>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-[#e5e5e5] pt-1">
            <span>{artist.genre}</span>
            {artist.monthlyListenersLabel && (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-mono-num">{artist.monthlyListenersLabel}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-3">
        {topTracks.length > 0 && (
          <button
            type="button"
            onClick={() => onPlayTrack(topTracks[0], topTracks)}
            className="h-12 px-7 rounded-full bg-[#1DB954] text-black text-sm font-extrabold inline-flex items-center gap-2 hover:scale-105 transition"
          >
            <Play className="w-5 h-5 fill-black" />
            Tocar
          </button>
        )}

        <button
          type="button"
          onClick={() => onToggleFollowArtist(artist)}
          aria-pressed={isFollowed}
          className={`h-10 px-5 rounded-full text-xs sm:text-sm font-bold border transition ${
            isFollowed
              ? 'border-[#1DB954] text-[#1DB954] bg-[#1DB954]/10'
              : 'border-white/40 text-white hover:border-white'
          }`}
        >
          {isFollowed ? 'Seguindo' : 'Seguir'}
        </button>

        {artist.spotifyUrl && (
          <a
            href={artist.spotifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="h-10 px-5 rounded-full border border-white/25 text-sm font-semibold text-white hover:border-white inline-flex items-center gap-2 transition"
          >
            <SpotifyMark className="w-4 h-4 text-[#1DB954]" />
            Ouvir no Spotify
            <ExternalLink className="w-3.5 h-3.5 text-[#b3b3b3]" />
          </a>
        )}
      </div>

      {/* Top Tracks */}
      {topTracks.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xl font-extrabold text-white">Populares</h2>
          <div className="space-y-1">
            {visibleTracks.map((tr, idx) => (
              <TrackRow
                key={tr.id}
                track={tr}
                index={idx}
                isCurrent={currentTrack?.id === tr.id}
                isPlaying={isPlaying}
                isLiked={likedTrackIds.has(tr.id)}
                onPlay={() => onPlayTrack(tr, topTracks)}
                onToggleLike={onToggleLike}
                onAddToPlaylist={onAddToPlaylist}
                onOpenArtist={(id) => onNavigate({ page: 'artist', id })}
                onOpenAlbum={(id) => onNavigate({ page: 'album', id })}
                onOpenLibras={(clipId) => onNavigate({ page: 'entre-sinais', tab: 'clipes', clipId })}
              />
            ))}
          </div>
          {topTracks.length > 5 && (
            <button
              type="button"
              onClick={() => setShowAllTracks((v) => !v)}
              className="text-xs font-bold text-[#b3b3b3] hover:text-white px-3 py-1"
            >
              {showAllTracks ? 'Mostrar menos' : `Ver mais (${topTracks.length})`}
            </button>
          )}
        </section>
      )}

      {/* Discography */}
      {(albums.length > 0 || singles.length > 0) && (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-extrabold text-white">Discografia</h2>
            <div className="flex gap-2">
              {[
                { id: 'all' as const, label: 'Tudo' },
                { id: 'albums' as const, label: `Álbuns (${albums.length})` },
                { id: 'singles' as const, label: `Singles e EPs (${singles.length})` },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setDiscoTab(t.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition ${
                    discoTab === t.id ? 'bg-white text-black' : 'bg-[#282828] text-white hover:bg-[#333333]'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          {displayedReleases.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {displayedReleases.map((al) => (
                <AlbumCard
                  key={al.id}
                  album={al}
                  onOpen={() => onNavigate({ page: 'album', id: al.id })}
                  onPlay={() => onPlayAlbumById(al.id)}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#b3b3b3]">Nenhum lançamento nesta categoria.</p>
          )}
        </section>
      )}

      {/* Sobre / Biography */}
      {artist.bio && (
        <section className="space-y-3">
          <h2 className="text-xl font-extrabold text-white">Sobre</h2>
          <div className="max-w-3xl bg-[#181818] border border-white/[0.06] rounded-xl p-5 sm:p-6 flex flex-col sm:flex-row gap-5 items-start">
            <CoverImage
              src={artist.imageUrl}
              alt={artist.name}
              className="w-24 h-24 shrink-0"
              rounded="md"
              fallbackType="artist"
            />
            <div className="space-y-2">
              <p className="text-sm text-[#d4d4d4] leading-relaxed">{artist.bio}</p>
              <div className="text-xs text-[#b3b3b3]">
                Gênero principal: <span className="text-white font-semibold">{artist.genre}</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Videoclipes */}
      {artist.videoclipes && artist.videoclipes.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xl font-extrabold text-white">Videoclipes e Acessibilidade</h2>
          <div className="space-y-2 max-w-3xl">
            {artist.videoclipes.map((clip, i) => (
              <div
                key={`${clip.title}-${i}`}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-[#181818] border border-white/[0.06]"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-white">{clip.title}</span>
                    {clip.year && <span className="text-xs text-[#b3b3b3]">· {clip.year}</span>}
                    {clip.hasLibras && (
                      <>
                        <EntreSinaisLogo size="xs" />
                        <span className="px-1.5 py-0.5 rounded bg-[#4ade80] text-[#0b0b0b] text-[10px] font-extrabold">
                          LIBRAS
                        </span>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-[#b3b3b3] leading-relaxed">{clip.description}</p>
                </div>
                {clip.hasLibras ? (
                  <button
                    type="button"
                    onClick={() =>
                      onNavigate({
                        page: 'entre-sinais',
                        tab: 'clipes',
                        clipId: clip.librasClipId || 'clip-aurora',
                      })
                    }
                    className="shrink-0 h-9 px-4 rounded-full bg-[#4ade80] text-[#0b0b0b] text-xs font-extrabold inline-flex items-center gap-1.5 hover:brightness-110 transition"
                  >
                    <Hand className="w-3.5 h-3.5" />
                    Ver com Libras
                  </button>
                ) : (
                  <a
                    href={`https://www.youtube.com/results?search_query=${encodeURIComponent(
                      clip.youtubeQuery || `${artist.name} ${clip.title} clipe oficial`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 h-9 px-4 rounded-full border border-white/25 text-white text-xs font-bold inline-flex items-center gap-1.5 hover:border-white transition"
                  >
                    Buscar clipe <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Related Playlists */}
      {artist.relatedPlaylists && artist.relatedPlaylists.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-extrabold text-white">Playlists relacionadas</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {artist.relatedPlaylists.map((pl) => (
              <PlaylistCard
                key={pl.id}
                playlist={pl}
                onOpen={() => onNavigate({ page: 'playlist', id: pl.id })}
                onPlay={() => {
                  if (pl.tracks && pl.tracks.length > 0) onPlayTrack(pl.tracks[0], pl.tracks);
                }}
              />
            ))}
          </div>
        </section>
      )}

      {/* Related Artists */}
      {artist.relatedArtists && artist.relatedArtists.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-extrabold text-white">Os fãs também curtem</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {artist.relatedArtists.map((ra) => (
              <ArtistCard
                key={ra.id}
                artist={{ id: ra.id, name: ra.name, imageUrl: ra.imageUrl, genre: 'Artista', bio: '' }}
                onOpen={() => onNavigate({ page: 'artist', id: ra.id })}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

/* ===========================
   ALBUM VIEW
=========================== */
interface AlbumViewProps extends SharedDetailProps {
  albumId: string;
  isSaved: boolean;
  onToggleSaveAlbum: (album: Album) => void;
  onOpenSpotifyEmbedAlbum: (album: Album) => void;
}

export function AlbumView({
  albumId,
  isSaved,
  currentTrack,
  isPlaying,
  likedTrackIds,
  onNavigate,
  onPlayTrack,
  onToggleLike,
  onAddToPlaylist,
  onToggleSaveAlbum,
  onOpenSpotifyEmbedAlbum,
}: AlbumViewProps) {
  const [album, setAlbum] = useState<Album | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    fetch(`/api/album/${encodeURIComponent(albumId)}`)
      .then((res) => {
        if (!res.ok) throw new Error('Álbum não encontrado');
        return res.json();
      })
      .then((data: Album) => {
        if (active) setAlbum(data);
      })
      .catch(() => {
        if (active) setError('Não foi possível carregar este álbum.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [albumId]);

  if (loading) {
    return (
      <div className="flex items-center gap-3 py-16 text-sm text-[#b3b3b3]">
        <Loader2 className="w-5 h-5 animate-spin text-[#1DB954]" />
        <span>Carregando faixas do álbum…</span>
      </div>
    );
  }

  if (error || !album) {
    return (
      <div className="py-12 space-y-4">
        <p className="text-lg font-bold text-white">{error || 'Álbum não encontrado'}</p>
        <button
          type="button"
          onClick={() => onNavigate({ page: 'home' })}
          className="px-5 py-2.5 rounded-full bg-white text-black text-sm font-bold"
        >
          Voltar ao Início
        </button>
      </div>
    );
  }

  const tracks = album.tracks || [];
  const totalMs = tracks.reduce((sum, t) => sum + (t.durationMs || 0), 0);
  const totalMin = Math.round(totalMs / 60000);

  return (
    <div className="space-y-6 pb-10">
      {/* Album Hero */}
      <div
        className="rounded-xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-end gap-6"
        style={{
          background: `linear-gradient(180deg, ${album.accentColor || '#262626'} 0%, #121212 100%)`,
        }}
      >
        <CoverImage
          src={album.coverUrl}
          alt={album.title}
          className="w-40 h-40 sm:w-52 sm:h-52 shadow-2xl"
          rounded="md"
        />
        <div className="space-y-2 min-w-0 flex-1">
          <div className="text-xs font-bold uppercase tracking-wider text-white/80">
            {album.recordType === 'single' ? 'Single' : 'Álbum'}
          </div>
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white break-words">
            {album.title}
          </h1>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-[#e5e5e5] pt-1">
            <button
              type="button"
              onClick={() => onNavigate({ page: 'artist', id: album.artistId })}
              className="font-bold text-white hover:underline"
            >
              {album.artistName}
            </button>
            <span aria-hidden="true">·</span>
            <span className="font-mono-num">{album.releaseYear}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono-num">{tracks.length} músicas</span>
            {totalMin > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-mono-num text-[#b3b3b3]">{totalMin} min</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3">
        {tracks.length > 0 && (
          <button
            type="button"
            onClick={() => onPlayTrack(tracks[0], tracks)}
            className="h-12 px-7 rounded-full bg-[#1DB954] text-black text-sm font-extrabold inline-flex items-center gap-2 hover:scale-105 transition"
          >
            <Play className="w-5 h-5 fill-black" />
            Tocar
          </button>
        )}

        <button
          type="button"
          onClick={() => onToggleSaveAlbum(album)}
          aria-pressed={isSaved}
          className={`h-10 px-4 rounded-full border text-xs sm:text-sm font-bold inline-flex items-center gap-2 transition ${
            isSaved
              ? 'border-[#1DB954] text-[#1DB954] bg-[#1DB954]/10'
              : 'border-white/30 text-white hover:border-white'
          }`}
        >
          <Heart className={`w-4 h-4 ${isSaved ? 'fill-[#1DB954]' : ''}`} />
          {isSaved ? 'Salvo na Biblioteca' : 'Salvar álbum'}
        </button>

        {album.id.startsWith('sp-album-') && (
          <button
            type="button"
            onClick={() => onOpenSpotifyEmbedAlbum(album)}
            className="h-10 px-4 rounded-full bg-[#242424] hover:bg-[#303030] text-white text-xs sm:text-sm font-semibold inline-flex items-center gap-2 transition"
          >
            <SpotifyMark className="w-4 h-4 text-[#1DB954]" />
            Spotify Embed
          </button>
        )}

        {album.spotifyUrl && (
          <a
            href={album.spotifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="h-10 px-4 rounded-full border border-white/25 text-xs sm:text-sm font-semibold text-white hover:border-white inline-flex items-center gap-2 transition"
          >
            Ouvir no Spotify <ExternalLink className="w-3.5 h-3.5 text-[#b3b3b3]" />
          </a>
        )}
      </div>

      {/* Tracklist Header */}
      <div className="border-b border-white/10 px-3 pb-2 text-xs font-semibold text-[#b3b3b3] grid grid-cols-[32px_minmax(0,1fr)_auto] items-center gap-3">
        <span className="text-center">#</span>
        <span>Título</span>
        <span className="w-11 text-right inline-flex justify-end">
          <Clock className="w-3.5 h-3.5" />
        </span>
      </div>

      <div className="space-y-1">
        {tracks.map((tr, idx) => (
          <TrackRow
            key={tr.id}
            track={tr}
            index={idx}
            showCover={false}
            showAlbum={false}
            isCurrent={currentTrack?.id === tr.id}
            isPlaying={isPlaying}
            isLiked={likedTrackIds.has(tr.id)}
            onPlay={() => onPlayTrack(tr, tracks)}
            onToggleLike={onToggleLike}
            onAddToPlaylist={onAddToPlaylist}
            onOpenArtist={(id) => onNavigate({ page: 'artist', id })}
            onOpenAlbum={(id) => onNavigate({ page: 'album', id })}
            onOpenLibras={(clipId) => onNavigate({ page: 'entre-sinais', tab: 'clipes', clipId })}
          />
        ))}
      </div>
    </div>
  );
}

/* ===========================
   PLAYLIST VIEW
=========================== */
interface PlaylistViewProps extends SharedDetailProps {
  playlistId: string;
  likedTracks: Track[];
  userPlaylists: UserPlaylist[];
  systemPlaylists: Playlist[];
  onRemoveTrackFromUserPlaylist: (playlistId: string, trackId: string) => void;
  onDeleteUserPlaylist: (playlistId: string) => void;
}

export function PlaylistView({
  playlistId,
  likedTracks,
  userPlaylists,
  systemPlaylists,
  currentTrack,
  isPlaying,
  likedTrackIds,
  onNavigate,
  onPlayTrack,
  onToggleLike,
  onAddToPlaylist,
  onRemoveTrackFromUserPlaylist,
  onDeleteUserPlaylist,
}: PlaylistViewProps) {
  const [remotePlaylist, setRemotePlaylist] = useState<Playlist | null>(null);
  const [loading, setLoading] = useState(false);

  const isLikedView = playlistId === 'curtidas';
  const userPl = userPlaylists.find((p) => p.id === playlistId);
  const sysPl = systemPlaylists.find((p) => p.id === playlistId);

  useEffect(() => {
    if (isLikedView || userPl || sysPl) {
      setRemotePlaylist(null);
      return;
    }
    let active = true;
    setLoading(true);
    fetch(`/api/playlist/${encodeURIComponent(playlistId)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active) setRemotePlaylist(data);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [playlistId, isLikedView, userPl, sysPl]);

  if (loading) {
    return (
      <div className="flex items-center gap-3 py-16 text-sm text-[#b3b3b3]">
        <Loader2 className="w-5 h-5 animate-spin text-[#1DB954]" />
        <span>Carregando playlist…</span>
      </div>
    );
  }

  let title = '';
  let description = '';
  let coverUrl = '';
  let creator = '';
  let tracks: Track[] = [];

  if (isLikedView) {
    title = 'Músicas curtidas';
    description = 'Todas as faixas que você marcou com coração ficam salvas aqui.';
    creator = 'Sua Biblioteca';
    tracks = likedTracks;
  } else if (userPl) {
    title = userPl.name;
    description = userPl.description || 'Playlist criada por você.';
    coverUrl = userPl.tracks[0]?.coverUrl || '';
    creator = 'Você';
    tracks = userPl.tracks;
  } else if (sysPl || remotePlaylist) {
    const pl = sysPl || remotePlaylist!;
    title = pl.title;
    description = pl.description;
    coverUrl = pl.coverUrl;
    creator = pl.creator || 'Spotify';
    tracks = pl.tracks || [];
  } else {
    return (
      <div className="py-12 space-y-4">
        <p className="text-lg font-bold text-white">Playlist não encontrada</p>
        <button
          type="button"
          onClick={() => onNavigate({ page: 'library' })}
          className="px-5 py-2.5 rounded-full bg-white text-black text-sm font-bold"
        >
          Ir para Biblioteca
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="rounded-xl p-6 sm:p-8 bg-gradient-to-b from-[#282828] to-[#121212] flex flex-col sm:flex-row items-start sm:items-end gap-6">
        {isLikedView ? (
          <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-lg bg-gradient-to-br from-[#450af5] to-[#c4efd9] flex items-center justify-center shadow-2xl shrink-0">
            <Heart className="w-16 h-16 text-white fill-white" />
          </div>
        ) : (
          <CoverImage
            src={coverUrl}
            alt={title}
            className="w-40 h-40 sm:w-48 sm:h-48 shadow-2xl"
            rounded="md"
            fallbackType="playlist"
          />
        )}
        <div className="space-y-2 min-w-0 flex-1">
          <div className="text-xs font-bold uppercase tracking-wider text-white/80">Playlist</div>
          {playlistId === 'destaques' ? (
            <div className="flex flex-wrap items-center gap-3">
              <EntreSinaisLogo size="lg" />
              <span className="text-xl sm:text-3xl font-extrabold text-[#4ade80]">· Destaques</span>
            </div>
          ) : (
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white break-words">
              {title}
            </h1>
          )}
          {description && <p className="text-sm text-[#d4d4d4] max-w-2xl">{description}</p>}
          <div className="text-xs sm:text-sm text-[#e5e5e5] pt-1">
            <span className="font-bold">{creator}</span> ·{' '}
            <span className="font-mono-num">{tracks.length} músicas</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {tracks.length > 0 && (
          <button
            type="button"
            onClick={() => onPlayTrack(tracks[0], tracks)}
            className="h-12 px-7 rounded-full bg-[#1DB954] text-black text-sm font-extrabold inline-flex items-center gap-2 hover:scale-105 transition"
          >
            <Play className="w-5 h-5 fill-black" />
            Tocar
          </button>
        )}
        {userPl && (
          <button
            type="button"
            onClick={() => {
              onDeleteUserPlaylist(userPl.id);
              onNavigate({ page: 'library' });
            }}
            className="h-10 px-4 rounded-full border border-white/25 text-xs sm:text-sm font-semibold text-[#b3b3b3] hover:text-white hover:border-white inline-flex items-center gap-1.5 transition"
          >
            <Trash2 className="w-4 h-4" />
            Excluir playlist
          </button>
        )}
      </div>

      {tracks.length === 0 ? (
        <div className="py-10 text-center space-y-3 bg-[#181818] rounded-xl p-6">
          <p className="text-base font-bold text-white">Esta playlist ainda está vazia</p>
          <p className="text-sm text-[#b3b3b3]">
            Use o botão <strong className="text-white">+</strong> ou o coração em qualquer música para adicioná-la aqui.
          </p>
          <button
            type="button"
            onClick={() => onNavigate({ page: 'search' })}
            className="px-5 py-2.5 rounded-full bg-white text-black text-sm font-bold"
          >
            Buscar músicas
          </button>
        </div>
      ) : (
        <div className="space-y-1">
          {tracks.map((tr, idx) => (
            <div key={`${tr.id}-${idx}`} className="flex items-center gap-1">
              <div className="flex-1 min-w-0">
                <TrackRow
                  track={tr}
                  index={idx}
                  isCurrent={currentTrack?.id === tr.id}
                  isPlaying={isPlaying}
                  isLiked={likedTrackIds.has(tr.id)}
                  onPlay={() => onPlayTrack(tr, tracks)}
                  onToggleLike={onToggleLike}
                  onAddToPlaylist={onAddToPlaylist}
                  onOpenArtist={(id) => onNavigate({ page: 'artist', id })}
                  onOpenAlbum={(id) => onNavigate({ page: 'album', id })}
                  onOpenLibras={(clipId) => onNavigate({ page: 'entre-sinais', tab: 'clipes', clipId })}
                />
              </div>
              {userPl && (
                <button
                  type="button"
                  onClick={() => onRemoveTrackFromUserPlaylist(userPl.id, tr.id)}
                  aria-label={`Remover ${tr.title} desta playlist`}
                  title="Remover da playlist"
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[#b3b3b3] hover:text-red-400 hover:bg-white/10 shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ===========================
   LIBRARY VIEW
=========================== */
interface LibraryViewProps extends SharedDetailProps {
  likedTracks: Track[];
  userPlaylists: UserPlaylist[];
  systemPlaylists: Playlist[];
  savedAlbums: Album[];
  followedArtists: Artist[];
  featuredAlbums: Album[];
  featuredArtists: Artist[];
  onCreatePlaylist: (name: string) => void;
  onDeleteUserPlaylist: (id: string) => void;
  onPlayAlbum: (album: Album) => void;
  onPlayArtist: (artist: Artist) => void;
}

export function LibraryView({
  likedTracks,
  userPlaylists,
  systemPlaylists,
  savedAlbums,
  followedArtists,
  featuredAlbums,
  featuredArtists,
  currentTrack,
  isPlaying,
  likedTrackIds,
  onNavigate,
  onPlayTrack,
  onToggleLike,
  onAddToPlaylist,
  onCreatePlaylist,
  onDeleteUserPlaylist,
  onPlayAlbum,
  onPlayArtist,
}: LibraryViewProps) {
  const [tab, setTab] = useState<'playlists' | 'albums' | 'artists' | 'liked'>('playlists');
  const [newName, setNewName] = useState('');

  const albumsToShow = savedAlbums.length > 0 ? savedAlbums : featuredAlbums.slice(0, 3);
  const artistsToShow = followedArtists.length > 0 ? followedArtists : featuredArtists.slice(0, 3);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newName.trim() || `Minha Playlist #${userPlaylists.length + 1}`;
    onCreatePlaylist(clean);
    setNewName('');
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Sua Biblioteca</h1>
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { id: 'playlists' as const, label: 'Playlists' },
          { id: 'albums' as const, label: `Álbuns (${savedAlbums.length})` },
          { id: 'artists' as const, label: `Artistas (${followedArtists.length})` },
          { id: 'liked' as const, label: `Curtidas (${likedTracks.length})` },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`min-h-[38px] px-4 rounded-full text-xs sm:text-sm font-bold transition ${
              tab === t.id ? 'bg-white text-black' : 'bg-[#282828] text-white hover:bg-[#333333]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'playlists' && (
        <div className="space-y-6">
          <form onSubmit={handleCreate} className="flex flex-wrap gap-2 max-w-md">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              maxLength={48}
              placeholder="Nome da nova playlist"
              aria-label="Nome da nova playlist"
              className="flex-1 min-w-[200px] h-11 px-4 rounded-full bg-[#242424] text-sm text-white placeholder-[#888] focus:outline-none focus:ring-2 focus:ring-[#1DB954]"
            />
            <button
              type="submit"
              className="h-11 px-5 rounded-full bg-[#1DB954] text-black text-sm font-bold inline-flex items-center gap-1.5 hover:brightness-110 transition"
            >
              <Plus className="w-4 h-4" /> Criar playlist
            </button>
          </form>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* Liked Songs card */}
            <div className="bg-gradient-to-br from-[#450af5] to-[#8e8ee5] rounded-lg p-4 flex flex-col justify-between min-h-[190px] col-span-2 sm:col-span-1">
              <button
                type="button"
                onClick={() => onNavigate({ page: 'playlist', id: 'curtidas' })}
                className="text-left flex-1 flex flex-col justify-end"
              >
                <div className="text-xl font-extrabold text-white">Músicas curtidas</div>
                <div className="text-xs text-white/90 mt-1">{likedTracks.length} músicas curtidas</div>
              </button>
            </div>

            {userPlaylists.map((pl) => (
              <div key={pl.id} className="relative">
                <PlaylistCard
                  playlist={{
                    id: pl.id,
                    title: pl.name,
                    description: `${pl.tracks.length} músicas · Criada por você`,
                    coverUrl: pl.tracks[0]?.coverUrl || '',
                    trackCount: pl.tracks.length,
                    tracks: pl.tracks,
                  }}
                  onOpen={() => onNavigate({ page: 'playlist', id: pl.id })}
                  onPlay={() => {
                    if (pl.tracks.length > 0) onPlayTrack(pl.tracks[0], pl.tracks);
                  }}
                />
                <button
                  type="button"
                  onClick={() => onDeleteUserPlaylist(pl.id)}
                  aria-label={`Excluir ${pl.name}`}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/70 text-[#b3b3b3] hover:text-red-400 flex items-center justify-center"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {systemPlaylists.map((pl) => (
              <PlaylistCard
                key={pl.id}
                playlist={pl}
                onOpen={() => onNavigate({ page: 'playlist', id: pl.id })}
                onPlay={() => {
                  if (pl.tracks && pl.tracks.length > 0) onPlayTrack(pl.tracks[0], pl.tracks);
                }}
              />
            ))}
          </div>
        </div>
      )}

      {tab === 'albums' && (
        <div className="space-y-4">
          {savedAlbums.length === 0 && (
            <p className="text-xs text-[#b3b3b3]">
              Você ainda não salvou álbuns. Mostrando álbuns em destaque para explorar:
            </p>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {albumsToShow.map((al) => (
              <AlbumCard
                key={al.id}
                album={al}
                onOpen={() => onNavigate({ page: 'album', id: al.id })}
                onPlay={() => onPlayAlbum(al)}
              />
            ))}
          </div>
        </div>
      )}

      {tab === 'artists' && (
        <div className="space-y-4">
          {followedArtists.length === 0 && (
            <p className="text-xs text-[#b3b3b3]">
              Você ainda não segue nenhum artista. Mostrando artistas recomendados:
            </p>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {artistsToShow.map((ar) => (
              <ArtistCard
                key={ar.id}
                artist={ar}
                onOpen={() => onNavigate({ page: 'artist', id: ar.id })}
                onPlay={() => onPlayArtist(ar)}
              />
            ))}
          </div>
        </div>
      )}

      {tab === 'liked' && (
        <div className="space-y-2">
          {likedTracks.length === 0 ? (
            <p className="text-sm text-[#b3b3b3] py-6">
              Nenhuma música curtida ainda. Clique no ícone de coração em qualquer faixa para salvá-la aqui.
            </p>
          ) : (
            likedTracks.map((tr, i) => (
              <TrackRow
                key={tr.id}
                track={tr}
                index={i}
                isCurrent={currentTrack?.id === tr.id}
                isPlaying={isPlaying}
                isLiked={likedTrackIds.has(tr.id)}
                onPlay={() => onPlayTrack(tr, likedTracks)}
                onToggleLike={onToggleLike}
                onAddToPlaylist={onAddToPlaylist}
                onOpenArtist={(id) => onNavigate({ page: 'artist', id })}
                onOpenAlbum={(id) => onNavigate({ page: 'album', id })}
                onOpenLibras={(clipId) => onNavigate({ page: 'entre-sinais', tab: 'clipes', clipId })}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

/* ===========================
   HISTORY VIEW
=========================== */
interface HistoryViewProps extends SharedDetailProps {
  history: HistoryEntry[];
  onClearHistory: () => void;
}

export function HistoryView({
  history,
  currentTrack,
  isPlaying,
  likedTrackIds,
  onNavigate,
  onPlayTrack,
  onToggleLike,
  onAddToPlaylist,
  onClearHistory,
}: HistoryViewProps) {
  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Histórico de reprodução</h1>
          <p className="text-sm text-[#b3b3b3] mt-1">
            As músicas reproduzidas recentemente aparecem aqui em ordem cronológica.
          </p>
        </div>
        {history.length > 0 && (
          <button
            type="button"
            onClick={onClearHistory}
            className="h-10 px-4 rounded-full border border-white/25 text-xs font-bold text-[#b3b3b3] hover:text-white hover:border-white transition"
          >
            Limpar histórico
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="py-12 text-center bg-[#181818] rounded-xl p-6 space-y-3">
          <p className="text-base font-bold text-white">Nenhuma reprodução registrada ainda</p>
          <p className="text-sm text-[#b3b3b3]">
            Dê play em qualquer álbum, artista ou busca para começar a montar seu histórico.
          </p>
          <button
            type="button"
            onClick={() => onNavigate({ page: 'home' })}
            className="px-5 py-2.5 rounded-full bg-[#1DB954] text-black text-sm font-bold"
          >
            Explorar músicas
          </button>
        </div>
      ) : (
        <div className="space-y-1">
          {history.map((entry, idx) => (
            <TrackRow
              key={`${entry.track.id}-${entry.playedAt}`}
              track={entry.track}
              index={idx}
              isCurrent={currentTrack?.id === entry.track.id}
              isPlaying={isPlaying}
              isLiked={likedTrackIds.has(entry.track.id)}
              onPlay={() =>
                onPlayTrack(
                  entry.track,
                  history.map((h) => h.track)
                )
              }
              onToggleLike={onToggleLike}
              onAddToPlaylist={onAddToPlaylist}
              onOpenArtist={(id) => onNavigate({ page: 'artist', id })}
              onOpenAlbum={(id) => onNavigate({ page: 'album', id })}
              onOpenLibras={(clipId) => onNavigate({ page: 'entre-sinais', tab: 'clipes', clipId })}
            />
          ))}
        </div>
      )}
    </div>
  );
}
