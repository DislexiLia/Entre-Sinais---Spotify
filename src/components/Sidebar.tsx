import React from 'react';
import { Clock, Hand, Heart, Home, Library, ListMusic, Plus, Search } from 'lucide-react';
import type { Album, Playlist, RouteView, UserPlaylist } from '../types/music.ts';
import { CoverImage, EntreSinaisLogo, SpotifyMark } from './BrandAssets.tsx';

interface SidebarProps {
  route: RouteView;
  likedCount: number;
  userPlaylists: UserPlaylist[];
  systemPlaylists: Playlist[];
  pinnedAlbums: Album[];
  savedAlbums: Album[];
  onNavigate: (view: RouteView) => void;
  onCreatePlaylistQuick: () => void;
}

export function Sidebar({
  route,
  likedCount,
  userPlaylists,
  systemPlaylists,
  pinnedAlbums,
  savedAlbums,
  onNavigate,
  onCreatePlaylistQuick,
}: SidebarProps) {
  const navItems = [
    { id: 'home', label: 'Início', icon: Home, view: { page: 'home' } as RouteView, active: route.page === 'home' },
    { id: 'search', label: 'Buscar', icon: Search, view: { page: 'search' } as RouteView, active: route.page === 'search' },
    { id: 'library', label: 'Sua Biblioteca', icon: Library, view: { page: 'library' } as RouteView, active: route.page === 'library' },
    { id: 'history', label: 'Histórico', icon: Clock, view: { page: 'history' } as RouteView, active: route.page === 'history' },
    {
      id: 'entre-sinais',
      label: 'Entre Sinais',
      icon: Hand,
      view: { page: 'entre-sinais', tab: 'sobre' } as RouteView,
      active: route.page === 'entre-sinais',
      accent: true,
    },
  ];

  // Combine saved albums + featured albums without duplicates
  const libraryAlbums = [...savedAlbums];
  for (const al of pinnedAlbums.slice(0, 3)) {
    if (!libraryAlbums.some((x) => x.id === al.id)) {
      libraryAlbums.push(al);
    }
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col gap-2 w-[264px] lg:w-[280px] shrink-0 h-full min-h-0">
        {/* Top Navigation Card */}
        <nav
          aria-label="Navegação principal"
          className="bg-[#121212] rounded-xl p-3 flex flex-col gap-1"
        >
          <button
            type="button"
            onClick={() => onNavigate({ page: 'home' })}
            className="flex items-center gap-2.5 px-3 py-2 mb-1 text-left rounded-lg hover:bg-white/[0.04] transition focus-visible:outline-2 focus-visible:outline-[#1DB954]"
          >
            <SpotifyMark className="w-7 h-7 text-[#1DB954] shrink-0" />
            <span className="font-extrabold text-base tracking-tight text-white">Spotify</span>
          </button>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.view)}
                className={`flex items-center gap-3.5 px-3 min-h-[42px] rounded-lg text-sm font-semibold transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[#1DB954] ${
                  item.active
                    ? item.accent
                      ? 'bg-[#1b2a21] text-[#4ade80]'
                      : 'bg-[#282828] text-white'
                    : item.accent
                    ? 'text-[#4ade80] hover:bg-[#1b2a21]/60'
                    : 'text-[#b3b3b3] hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {item.id === 'entre-sinais' ? (
                  <EntreSinaisLogo size="sm" />
                ) : (
                  <span className="truncate">{item.label}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Library Card */}
        <div className="bg-[#121212] rounded-xl p-3 flex-1 min-h-0 flex flex-col">
          <div className="flex items-center justify-between px-2 pb-3 border-b border-white/[0.08]">
            <button
              type="button"
              onClick={() => onNavigate({ page: 'library' })}
              className="flex items-center gap-2.5 text-sm font-bold text-[#b3b3b3] hover:text-white transition"
            >
              <Library className="w-5 h-5" />
              <span>Sua Biblioteca</span>
            </button>
            <button
              type="button"
              onClick={onCreatePlaylistQuick}
              aria-label="Criar nova playlist"
              title="Criar playlist"
              className="w-8 h-8 rounded-full flex items-center justify-center text-[#b3b3b3] hover:text-white hover:bg-white/[0.08] transition focus-visible:outline-2 focus-visible:outline-[#1DB954]"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-2 flex-1 overflow-y-auto space-y-0.5 pr-1">
            {/* Músicas curtidas */}
            <button
              type="button"
              onClick={() => onNavigate({ page: 'playlist', id: 'curtidas' })}
              className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition ${
                route.page === 'playlist' && route.id === 'curtidas'
                  ? 'bg-[#282828]'
                  : 'hover:bg-white/[0.06]'
              }`}
            >
              <div className="w-10 h-10 rounded bg-gradient-to-br from-[#450af5] to-[#c4efd9] flex items-center justify-center shrink-0">
                <Heart className="w-4 h-4 text-white fill-white" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-white truncate">Músicas curtidas</div>
                <div className="text-xs text-[#b3b3b3] truncate">Playlist · {likedCount} músicas</div>
              </div>
            </button>

            {/* User Playlists */}
            {userPlaylists.map((pl) => (
              <button
                key={pl.id}
                type="button"
                onClick={() => onNavigate({ page: 'playlist', id: pl.id })}
                className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition ${
                  route.page === 'playlist' && route.id === pl.id
                    ? 'bg-[#282828]'
                    : 'hover:bg-white/[0.06]'
                }`}
              >
                {pl.tracks[0]?.coverUrl ? (
                  <CoverImage src={pl.tracks[0].coverUrl} alt={pl.name} className="w-10 h-10" rounded="sm" />
                ) : (
                  <div className="w-10 h-10 rounded bg-[#282828] flex items-center justify-center shrink-0 text-[#b3b3b3]">
                    <ListMusic className="w-4 h-4" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-white truncate">{pl.name}</div>
                  <div className="text-xs text-[#b3b3b3] truncate">Playlist · {pl.tracks.length} músicas</div>
                </div>
              </button>
            ))}

            {/* Curated System Playlists */}
            {systemPlaylists.map((pl) => (
              <button
                key={pl.id}
                type="button"
                onClick={() => onNavigate({ page: 'playlist', id: pl.id })}
                className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition ${
                  route.page === 'playlist' && route.id === pl.id
                    ? 'bg-[#282828]'
                    : 'hover:bg-white/[0.06]'
                }`}
              >
                <CoverImage src={pl.coverUrl} alt={pl.title} className="w-10 h-10" rounded="sm" fallbackType="playlist" />
                <div className="min-w-0 flex-1">
                  {pl.id === 'destaques' ? (
                    <div className="flex items-center gap-1.5 min-w-0">
                      <EntreSinaisLogo size="xs" className="shrink-0" />
                      <span className="text-xs font-semibold text-[#b3b3b3] truncate">· Destaques</span>
                    </div>
                  ) : (
                    <div className="text-sm font-semibold text-white truncate">{pl.title}</div>
                  )}
                  <div className="text-xs text-[#b3b3b3] truncate">Playlist · {pl.creator || 'Spotify'}</div>
                </div>
              </button>
            ))}

            {/* Saved & Featured Albums */}
            {libraryAlbums.map((al) => (
              <button
                key={al.id}
                type="button"
                onClick={() => onNavigate({ page: 'album', id: al.id })}
                className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition ${
                  route.page === 'album' && route.id === al.id
                    ? 'bg-[#282828]'
                    : 'hover:bg-white/[0.06]'
                }`}
              >
                <CoverImage src={al.coverUrl} alt={al.title} className="w-10 h-10" rounded="sm" />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-white truncate">{al.title}</div>
                  <div className="text-xs text-[#b3b3b3] truncate">Álbum · {al.artistName}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav
        aria-label="Navegação móvel"
        className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#121212]/95 backdrop-blur-md border-t border-white/10 grid grid-cols-5 h-14 px-1"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.view)}
              className={`flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold transition-colors ${
                item.active
                  ? item.accent
                    ? 'text-[#4ade80]'
                    : 'text-white'
                  : item.accent
                  ? 'text-[#4ade80]/80'
                  : 'text-[#b3b3b3]'
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.id === 'entre-sinais' ? (
                <EntreSinaisLogo size="xxs" className="max-w-[60px]" />
              ) : (
                <span className="truncate max-w-full px-1">
                  {item.label === 'Sua Biblioteca' ? 'Biblioteca' : item.label}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </>
  );
}
