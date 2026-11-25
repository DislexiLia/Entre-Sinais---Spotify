import React, { useState } from 'react';
import { Heart, Play } from 'lucide-react';
import type { Album, Artist, HistoryEntry, Playlist, RouteView, Track } from '../types/music.ts';
import { CoverImage, ENTRE_SINAIS_KV_URL, EntreSinaisLogo } from './BrandAssets.tsx';
import { AlbumCard, ArtistCard, PlaylistCard } from './MediaCards.tsx';
import { TrackRow } from './TrackRow.tsx';

interface HomeViewProps {
  albums: Album[];
  artists: Artist[];
  playlists: Playlist[];
  accessibleTracks: Track[];
  history: HistoryEntry[];
  likedTracks: Track[];
  currentTrack: Track | null;
  isPlaying: boolean;
  likedTrackIds: Set<string>;
  onNavigate: (view: RouteView) => void;
  onPlayTrack: (track: Track, queue?: Track[]) => void;
  onPlayAlbum: (album: Album) => void;
  onPlayArtist: (artist: Artist) => void;
  onPlayPlaylist: (playlist: Playlist) => void;
  onToggleLike: (track: Track) => void;
  onAddToPlaylist: (track: Track) => void;
}

export function HomeView({
  albums,
  artists,
  playlists,
  accessibleTracks,
  history,
  likedTracks,
  currentTrack,
  isPlaying,
  likedTrackIds,
  onNavigate,
  onPlayTrack,
  onPlayAlbum,
  onPlayArtist,
  onPlayPlaylist,
  onToggleLike,
  onAddToPlaylist,
}: HomeViewProps) {
  const [filter, setFilter] = useState<'all' | 'music' | 'libras'>('all');

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';

  const quickTiles = [
    ...albums.slice(0, 3).map((al) => ({
      id: al.id,
      title: al.title,
      coverUrl: al.coverUrl,
      onOpen: () => onNavigate({ page: 'album', id: al.id }),
      onPlay: () => onPlayAlbum(al),
    })),
    ...artists.slice(0, 2).map((ar) => ({
      id: ar.id,
      title: ar.name,
      coverUrl: ar.imageUrl,
      onOpen: () => onNavigate({ page: 'artist', id: ar.id }),
      onPlay: () => onPlayArtist(ar),
    })),
  ];

  return (
    <div className="space-y-8 pb-8">
      {/* Greeting + Filter Chips */}
      <div className="space-y-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">{greeting}</h1>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`min-h-[38px] px-4 rounded-full text-xs sm:text-sm font-bold transition whitespace-nowrap ${
              filter === 'all' ? 'bg-white text-black' : 'bg-[#282828] text-white hover:bg-[#333333]'
            }`}
          >
            Tudo
          </button>
          <button
            type="button"
            onClick={() => setFilter('music')}
            className={`min-h-[38px] px-4 rounded-full text-xs sm:text-sm font-bold transition whitespace-nowrap ${
              filter === 'music' ? 'bg-white text-black' : 'bg-[#282828] text-white hover:bg-[#333333]'
            }`}
          >
            Música
          </button>
          <button
            type="button"
            onClick={() => setFilter('libras')}
            aria-label="Entre Sinais"
            className={`min-h-[38px] px-4 rounded-full text-xs sm:text-sm font-bold transition inline-flex items-center gap-2 whitespace-nowrap ${
              filter === 'libras'
                ? 'bg-[#1b2a21] ring-2 ring-[#4ade80]'
                : 'bg-[#1b2a21] border border-[#4ade80]/40 hover:border-[#4ade80]'
            }`}
          >
            <EntreSinaisLogo size="sm" />
          </button>
        </div>
      </div>

      {/* Quick Tiles Grid (Spotify mobile 2-column compact layout) */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-2.5">
        <button
          type="button"
          onClick={() => onNavigate({ page: 'playlist', id: 'curtidas' })}
          className="group flex items-center gap-2.5 sm:gap-3 bg-[#282828]/90 hover:bg-[#333333] rounded-[4px] overflow-hidden pr-2 sm:pr-3 text-left transition h-14"
        >
          <div className="w-14 h-14 bg-gradient-to-br from-[#450af5] to-[#c4efd9] flex items-center justify-center shrink-0">
            <Heart className="w-5 h-5 text-white fill-white" />
          </div>
          <span className="text-xs sm:text-sm font-bold text-white leading-tight line-clamp-2 flex-1">
            Músicas curtidas ({likedTracks.length})
          </span>
        </button>

        {quickTiles.map((tile) => (
          <div
            key={tile.id}
            className="group relative flex items-center bg-[#282828]/90 hover:bg-[#333333] rounded-[4px] overflow-hidden pr-2 sm:pr-3 transition h-14"
          >
            <button
              type="button"
              onClick={tile.onOpen}
              className="flex items-center gap-2.5 sm:gap-3 flex-1 min-w-0 text-left h-full"
            >
              <CoverImage src={tile.coverUrl} alt={tile.title} className="w-14 h-14 !rounded-none" rounded="sm" />
              <span className="text-xs sm:text-sm font-bold text-white leading-tight line-clamp-2 pr-1">
                {tile.title}
              </span>
            </button>
            <button
              type="button"
              onClick={tile.onPlay}
              aria-label={`Tocar ${tile.title}`}
              className="hidden sm:flex w-9 h-9 rounded-full bg-[#1DB954] text-black items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition shrink-0 hover:scale-105"
            >
              <Play className="w-4 h-4 fill-black ml-0.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Entre Sinais Campaign Banner */}
      {filter !== 'music' && (
        <section className="max-w-3xl rounded-xl border border-[#4ade80] bg-[#1b2a21] p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="space-y-3 flex-1 min-w-0">
            <div className="text-[11px] font-bold tracking-[1.5px] text-[#4ade80] uppercase">
              CAMPANHA INTEGRADA DE ACESSIBILIDADE
            </div>
            <EntreSinaisLogo size="md" />
            <p className="text-sm text-[#d4d4d4] leading-relaxed">
              Histórias dos fãs, clipes com interpretação em Libras sincronizada e os sinais dos seus artistas favoritos, integrados diretamente à sua experiência no Spotify.
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <button
                type="button"
                onClick={() => onNavigate({ page: 'entre-sinais', tab: 'sobre' })}
                className="min-h-[42px] px-5 rounded-full bg-[#4ade80] text-[#0b0b0b] text-sm font-extrabold inline-flex items-center gap-2 hover:brightness-110 transition"
              >
                Abrir aba
              </button>
              <button
                type="button"
                onClick={() => onNavigate({ page: 'entre-sinais', tab: 'clipes', clipId: 'clip-aurora' })}
                className="min-h-[42px] px-5 rounded-full border border-[#4ade80]/50 text-[#4ade80] text-sm font-bold hover:border-[#4ade80] transition"
              >
                Assistir Aurora em Libras
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigate({ page: 'entre-sinais', tab: 'sobre' })}
            className="sm:w-52 aspect-video rounded-lg overflow-hidden border border-[#4ade80]/40 shrink-0 hover:brightness-110 transition"
            aria-label="Abrir campanha Entre Sinais"
          >
            <img
              src={ENTRE_SINAIS_KV_URL}
              alt="Key Visual Entre Sinais Spotify"
              className="w-full h-full object-cover"
            />
          </button>
        </section>
      )}

      {/* Libras Accessible Tracks when Libras filter active */}
      {filter === 'libras' && (
        <section className="space-y-3">
          <h2 className="text-xl font-extrabold text-white">Faixas com versão em Libras</h2>
          <div className="space-y-1">
            {accessibleTracks.map((tr, i) => (
              <TrackRow
                key={tr.id}
                track={tr}
                index={i}
                isCurrent={currentTrack?.id === tr.id}
                isPlaying={isPlaying}
                isLiked={likedTrackIds.has(tr.id)}
                onPlay={() => onPlayTrack(tr, accessibleTracks)}
                onToggleLike={onToggleLike}
                onAddToPlaylist={onAddToPlaylist}
                onOpenArtist={(id) => onNavigate({ page: 'artist', id })}
                onOpenAlbum={(id) => onNavigate({ page: 'album', id })}
                onOpenLibras={(clipId) => onNavigate({ page: 'entre-sinais', tab: 'clipes', clipId })}
              />
            ))}
          </div>
        </section>
      )}

      {/* Featured Albums */}
      <section className="space-y-4">
        <div className="flex items-baseline justify-between">
          <h2 className="text-xl font-extrabold text-white">Álbuns em destaque</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {albums.map((album) => (
            <AlbumCard
              key={album.id}
              album={album}
              onOpen={() => onNavigate({ page: 'album', id: album.id })}
              onPlay={() => onPlayAlbum(album)}
            />
          ))}
        </div>
      </section>

      {/* Featured Artists */}
      <section className="space-y-4">
        <h2 className="text-xl font-extrabold text-white">Artistas para você</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {artists.map((artist) => (
            <ArtistCard
              key={artist.id}
              artist={artist}
              onOpen={() => onNavigate({ page: 'artist', id: artist.id })}
              onPlay={() => onPlayArtist(artist)}
            />
          ))}
        </div>
      </section>

      {/* Curated Playlists */}
      <section className="space-y-4">
        <h2 className="text-xl font-extrabold text-white">Playlists recomendadas</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {playlists.map((pl) => (
            <PlaylistCard
              key={pl.id}
              playlist={pl}
              onOpen={() => onNavigate({ page: 'playlist', id: pl.id })}
              onPlay={() => onPlayPlaylist(pl)}
            />
          ))}
        </div>
      </section>

      {/* Recently Played */}
      {history.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-white">Tocado recentemente</h2>
            <button
              type="button"
              onClick={() => onNavigate({ page: 'history' })}
              className="text-xs font-bold text-[#b3b3b3] hover:text-white hover:underline"
            >
              Ver tudo
            </button>
          </div>
          <div className="space-y-1">
            {history.slice(0, 5).map((entry, idx) => (
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
        </section>
      )}
    </div>
  );
}
