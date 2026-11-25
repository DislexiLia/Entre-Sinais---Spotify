import React, { useEffect, useState } from 'react';
import { Loader2, Play, Search, X } from 'lucide-react';
import type { Album, Artist, Playlist, RouteView, SearchResults, Track } from '../types/music.ts';
import { CoverImage, ENTRE_SINAIS_KV_URL } from './BrandAssets.tsx';
import { AlbumCard, ArtistCard, PlaylistCard } from './MediaCards.tsx';
import { TrackRow } from './TrackRow.tsx';

interface SearchViewProps {
  initialQuery?: string;
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

const BROWSE_CATEGORIES = [
  { label: 'Pop Brasil', query: 'Pop Brasil', color: 'from-[#8c1932] to-[#3b0a15]' },
  { label: 'Entre Sinais · Libras', action: 'entre-sinais' as const, color: 'from-[#166534] to-[#0f1f16]' },
  { label: 'MPB & Brasilidades', query: 'MPB Marina Sena Liniker', color: 'from-[#b45309] to-[#451a03]' },
  { label: 'Funk & Pagode', query: 'Ludmilla Numanice Funk', color: 'from-[#6b21a8] to-[#2e1065]' },
  { label: 'R&B & Soul', query: 'IZA Liniker R&B', color: 'from-[#0f766e] to-[#042f2e]' },
  { label: 'Indie Nacional', query: 'Jão Duda Beat Rubel', color: 'from-[#1d4ed8] to-[#172554]' },
  { label: 'Rock Brasileiro', query: 'Legião Urbana Cássia Eller Pitty', color: 'from-[#991b1b] to-[#450a0a]' },
  { label: 'Sertanejo & Modão', query: 'Marília Mendonça Jorge e Mateus', color: 'from-[#a16207] to-[#422006]' },
];

export function SearchView({
  initialQuery = '',
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
}: SearchViewProps) {
  const [query, setQuery] = useState(initialQuery);
  const [filter, setFilter] = useState<'all' | 'track' | 'artist' | 'album' | 'playlist'>('all');
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults(null);
      setLoading(false);
      setError(null);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(trimmed)}&type=${encodeURIComponent(filter)}`,
          { signal: controller.signal }
        );
        if (!res.ok) throw new Error('Falha na busca');
        const data: SearchResults = await res.json();
        setResults(data);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          setError('Não foi possível completar a busca agora. Tente novamente.');
        }
      } finally {
        setLoading(false);
      }
    }, 280);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [query, filter]);

  const filterTabs: Array<{ id: typeof filter; label: string }> = [
    { id: 'all', label: 'Tudo' },
    { id: 'track', label: 'Músicas' },
    { id: 'artist', label: 'Artistas' },
    { id: 'album', label: 'Álbuns' },
    { id: 'playlist', label: 'Playlists' },
  ];

  const hasResults =
    results &&
    (results.tracks.length > 0 ||
      results.artists.length > 0 ||
      results.albums.length > 0 ||
      results.playlists.length > 0);

  return (
    <div className="space-y-6 pb-8">
      {/* Search Input */}
      <div className="space-y-4">
        <div className="relative max-w-xl">
          <Search className="w-5 h-5 text-[#121212] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="O que você quer ouvir? Busque músicas, artistas, álbuns ou cole um link do Spotify"
            aria-label="Buscar músicas, artistas, álbuns ou playlists"
            autoFocus
            className="w-full h-12 pl-12 pr-11 rounded-full bg-white text-[#121212] placeholder-[#555] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#1DB954]"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Limpar busca"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center text-[#333] hover:bg-black/10"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {filterTabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setFilter(t.id)}
              className={`min-h-[36px] px-4 rounded-full text-xs sm:text-sm font-bold transition whitespace-nowrap ${
                filter === t.id
                  ? 'bg-white text-black'
                  : 'bg-[#282828] text-white hover:bg-[#333333]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Empty Query -> Browse Categories */}
      {!query.trim() && (
        <section className="space-y-4">
          <h2 className="text-xl font-extrabold text-white">Navegar por todas as seções</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {BROWSE_CATEGORIES.map((cat) => (
              <button
                key={cat.label}
                type="button"
                onClick={() => {
                  if (cat.action === 'entre-sinais') {
                    onNavigate({ page: 'entre-sinais', tab: 'sobre' });
                  } else if (cat.query) {
                    setQuery(cat.query);
                  }
                }}
                className={`group relative h-28 sm:h-32 rounded-xl bg-gradient-to-br ${cat.color} p-4 text-left overflow-hidden hover:brightness-110 transition focus-visible:outline-2 focus-visible:outline-white flex flex-col justify-between`}
                aria-label={cat.action === 'entre-sinais' ? 'Campanha Entre Sinais' : undefined}
              >
                {cat.action === 'entre-sinais' ? (
                  <img
                    src={ENTRE_SINAIS_KV_URL}
                    alt="Entre Sinais · Spotify"
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <span className="text-base sm:text-lg font-extrabold text-white leading-tight block max-w-[85%]">
                    {cat.label}
                  </span>
                )}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center gap-3 py-8 text-sm text-[#b3b3b3]">
          <Loader2 className="w-5 h-5 animate-spin text-[#1DB954]" />
          <span>Buscando no catálogo Spotify e biblioteca global…</span>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="p-4 rounded-xl bg-[#2a1818] border border-red-500/30 text-sm text-red-200">
          {error}
        </div>
      )}

      {/* Empty Search Result */}
      {!loading && !error && query.trim() && results && !hasResults && (
        <div className="py-12 text-center space-y-2">
          <p className="text-lg font-bold text-white">Nenhum resultado para “{query}”</p>
          <p className="text-sm text-[#b3b3b3]">
            Verifique a ortografia ou tente buscar outro artista, música ou álbum.
          </p>
        </div>
      )}

      {/* Search Results */}
      {!loading && results && hasResults && (
        <div className="space-y-8">
          {/* Spotify Top Result + Songs 2-Column Split when filter === 'all' */}
          {filter === 'all' && results.bestMatch && (
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)] gap-6 items-start">
              {/* Top Result */}
              <div className="space-y-3">
                <h2 className="text-xl font-extrabold text-white">Melhor resultado</h2>
                {results.bestMatch.kind === 'artist' && (
                  <div className="group relative bg-[#181818] hover:bg-[#242424] rounded-xl p-5 transition">
                    <button
                      type="button"
                      onClick={() => onNavigate({ page: 'artist', id: results.bestMatch!.item.id })}
                      className="w-full text-left space-y-4"
                    >
                      <CoverImage
                        src={(results.bestMatch.item as Artist).imageUrl}
                        alt={(results.bestMatch.item as Artist).name}
                        className="w-24 h-24 shadow-xl"
                        rounded="full"
                        fallbackType="artist"
                      />
                      <div>
                        <div className="text-2xl font-extrabold text-white truncate">
                          {(results.bestMatch.item as Artist).name}
                        </div>
                        <div className="text-xs font-bold text-[#b3b3b3] mt-1">
                          Artista {(results.bestMatch.item as Artist).genre ? `· ${(results.bestMatch.item as Artist).genre}` : ''}
                        </div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => onPlayArtist(results.bestMatch!.item as Artist)}
                      aria-label={`Tocar ${(results.bestMatch.item as Artist).name}`}
                      className="absolute right-5 bottom-5 w-12 h-12 rounded-full bg-[#1DB954] text-black flex items-center justify-center shadow-xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition"
                    >
                      <Play className="w-5 h-5 fill-black ml-0.5" />
                    </button>
                  </div>
                )}

                {results.bestMatch.kind === 'album' && (
                  <div className="group relative bg-[#181818] hover:bg-[#242424] rounded-xl p-5 transition">
                    <button
                      type="button"
                      onClick={() => onNavigate({ page: 'album', id: results.bestMatch!.item.id })}
                      className="w-full text-left space-y-4"
                    >
                      <CoverImage
                        src={(results.bestMatch.item as Album).coverUrl}
                        alt={(results.bestMatch.item as Album).title}
                        className="w-24 h-24 shadow-xl"
                        rounded="md"
                      />
                      <div>
                        <div className="text-2xl font-extrabold text-white truncate">
                          {(results.bestMatch.item as Album).title}
                        </div>
                        <div className="text-xs font-bold text-[#b3b3b3] mt-1">
                          Álbum · {(results.bestMatch.item as Album).artistName}
                        </div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => onPlayAlbum(results.bestMatch!.item as Album)}
                      aria-label={`Tocar álbum ${(results.bestMatch.item as Album).title}`}
                      className="absolute right-5 bottom-5 w-12 h-12 rounded-full bg-[#1DB954] text-black flex items-center justify-center shadow-xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition"
                    >
                      <Play className="w-5 h-5 fill-black ml-0.5" />
                    </button>
                  </div>
                )}

                {results.bestMatch.kind === 'track' && (
                  <div className="group relative bg-[#181818] hover:bg-[#242424] rounded-xl p-5 transition">
                    <button
                      type="button"
                      onClick={() => onPlayTrack(results.bestMatch!.item as Track, results.tracks)}
                      className="w-full text-left space-y-4"
                    >
                      <CoverImage
                        src={(results.bestMatch.item as Track).coverUrl}
                        alt={(results.bestMatch.item as Track).albumName}
                        className="w-24 h-24 shadow-xl"
                        rounded="md"
                      />
                      <div>
                        <div className="text-2xl font-extrabold text-white truncate">
                          {(results.bestMatch.item as Track).title}
                        </div>
                        <div className="text-xs font-bold text-[#b3b3b3] mt-1">
                          Música · {(results.bestMatch.item as Track).artistName}
                        </div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => onPlayTrack(results.bestMatch!.item as Track, results.tracks)}
                      aria-label={`Tocar ${(results.bestMatch.item as Track).title}`}
                      className="absolute right-5 bottom-5 w-12 h-12 rounded-full bg-[#1DB954] text-black flex items-center justify-center shadow-xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition"
                    >
                      <Play className="w-5 h-5 fill-black ml-0.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Top 4 Songs */}
              {results.tracks.length > 0 && (
                <div className="space-y-3 min-w-0">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-extrabold text-white">Músicas</h2>
                    {results.tracks.length > 4 && (
                      <button
                        type="button"
                        onClick={() => setFilter('track')}
                        className="text-xs font-bold text-[#b3b3b3] hover:text-white hover:underline"
                      >
                        Ver todas ({results.tracks.length})
                      </button>
                    )}
                  </div>
                  <div className="space-y-1">
                    {results.tracks.slice(0, 4).map((tr, i) => (
                      <TrackRow
                        key={tr.id}
                        track={tr}
                        index={i}
                        showAlbum={false}
                        isCurrent={currentTrack?.id === tr.id}
                        isPlaying={isPlaying}
                        isLiked={likedTrackIds.has(tr.id)}
                        onPlay={() => onPlayTrack(tr, results.tracks)}
                        onToggleLike={onToggleLike}
                        onAddToPlaylist={onAddToPlaylist}
                        onOpenArtist={(id) => onNavigate({ page: 'artist', id })}
                        onOpenAlbum={(id) => onNavigate({ page: 'album', id })}
                        onOpenLibras={(clipId) => onNavigate({ page: 'entre-sinais', tab: 'clipes', clipId })}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Full Tracks list when filter === 'track' */}
          {filter === 'track' && results.tracks.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-xl font-extrabold text-white">Músicas</h2>
              <div className="space-y-1">
                {results.tracks.map((tr, i) => (
                  <TrackRow
                    key={tr.id}
                    track={tr}
                    index={i}
                    isCurrent={currentTrack?.id === tr.id}
                    isPlaying={isPlaying}
                    isLiked={likedTrackIds.has(tr.id)}
                    onPlay={() => onPlayTrack(tr, results.tracks)}
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

          {/* Artists Grid */}
          {(filter === 'all' || filter === 'artist') && results.artists.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-xl font-extrabold text-white">Artistas</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {results.artists.map((ar) => (
                  <ArtistCard
                    key={ar.id}
                    artist={ar}
                    onOpen={() => onNavigate({ page: 'artist', id: ar.id })}
                    onPlay={() => onPlayArtist(ar)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Albums Grid */}
          {(filter === 'all' || filter === 'album') && results.albums.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-xl font-extrabold text-white">Álbuns</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {results.albums.map((al) => (
                  <AlbumCard
                    key={al.id}
                    album={al}
                    onOpen={() => onNavigate({ page: 'album', id: al.id })}
                    onPlay={() => onPlayAlbum(al)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Playlists Grid */}
          {(filter === 'all' || filter === 'playlist') && results.playlists.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-xl font-extrabold text-white">Playlists</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {results.playlists.map((pl) => (
                  <PlaylistCard
                    key={pl.id}
                    playlist={pl}
                    onOpen={() => onNavigate({ page: 'playlist', id: pl.id })}
                    onPlay={() => onPlayPlaylist(pl)}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
