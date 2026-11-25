import React from 'react';
import { Play } from 'lucide-react';
import type { Album, Artist, Playlist } from '../types/music.ts';
import { CoverImage, EntreSinaisLogo } from './BrandAssets.tsx';

export function AlbumCard({
  album,
  onOpen,
  onPlay,
}: {
  album: Album;
  onOpen: () => void;
  onPlay?: () => void;
}) {
  return (
    <div className="group relative bg-[#181818] hover:bg-[#242424] rounded-lg p-3.5 transition-colors duration-200">
      <button
        type="button"
        onClick={onOpen}
        className="w-full text-left focus-visible:outline-2 focus-visible:outline-[#1DB954] rounded"
      >
        <div className="relative">
          <CoverImage src={album.coverUrl} alt={album.title} className="w-full aspect-square shadow-lg" rounded="md" />
        </div>
        <div className="mt-3 text-sm font-bold text-white truncate">{album.title}</div>
        <div className="mt-1 text-xs text-[#b3b3b3] truncate">
          {album.releaseYear} · {album.artistName}
        </div>
      </button>
      {onPlay && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onPlay();
          }}
          aria-label={`Tocar álbum ${album.title}`}
          className="absolute right-5 bottom-[72px] w-11 h-11 rounded-full bg-[#1DB954] text-black flex items-center justify-center shadow-xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 focus-visible:opacity-100 focus-visible:translate-y-0 transition-all duration-200 hover:scale-105"
        >
          <Play className="w-5 h-5 fill-black ml-0.5" />
        </button>
      )}
    </div>
  );
}

export function ArtistCard({
  artist,
  onOpen,
  onPlay,
}: {
  artist: Artist;
  onOpen: () => void;
  onPlay?: () => void;
}) {
  return (
    <div className="group relative bg-[#181818] hover:bg-[#242424] rounded-lg p-3.5 transition-colors duration-200">
      <button
        type="button"
        onClick={onOpen}
        className="w-full text-left focus-visible:outline-2 focus-visible:outline-[#1DB954] rounded"
      >
        <CoverImage
          src={artist.imageUrl}
          alt={artist.name}
          className="w-full aspect-square shadow-lg"
          rounded="full"
          fallbackType="artist"
        />
        <div className="mt-3 text-sm font-bold text-white truncate">{artist.name}</div>
        <div className="mt-1 text-xs text-[#b3b3b3] truncate">Artista</div>
      </button>
      {onPlay && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onPlay();
          }}
          aria-label={`Tocar principais de ${artist.name}`}
          className="absolute right-5 bottom-[72px] w-11 h-11 rounded-full bg-[#1DB954] text-black flex items-center justify-center shadow-xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 focus-visible:opacity-100 focus-visible:translate-y-0 transition-all duration-200 hover:scale-105"
        >
          <Play className="w-5 h-5 fill-black ml-0.5" />
        </button>
      )}
    </div>
  );
}

export function PlaylistCard({
  playlist,
  onOpen,
  onPlay,
}: {
  playlist: Playlist;
  onOpen: () => void;
  onPlay?: () => void;
}) {
  return (
    <div className="group relative bg-[#181818] hover:bg-[#242424] rounded-lg p-3.5 transition-colors duration-200">
      <button
        type="button"
        onClick={onOpen}
        className="w-full text-left focus-visible:outline-2 focus-visible:outline-[#1DB954] rounded"
      >
        <CoverImage
          src={playlist.coverUrl}
          alt={playlist.title}
          className="w-full aspect-square shadow-lg"
          rounded="md"
          fallbackType="playlist"
        />
        {playlist.id === 'destaques' ? (
          <div className="mt-3 flex items-center gap-1.5 min-w-0">
            <EntreSinaisLogo size="xs" />
            <span className="text-xs font-bold text-[#4ade80] truncate">· Destaques</span>
          </div>
        ) : (
          <div className="mt-3 text-sm font-bold text-white truncate">{playlist.title}</div>
        )}
        <div className="mt-1 text-xs text-[#b3b3b3] line-clamp-2 leading-snug">
          {playlist.description}
        </div>
      </button>
      {onPlay && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onPlay();
          }}
          aria-label={`Tocar playlist ${playlist.title}`}
          className="absolute right-5 bottom-[80px] w-11 h-11 rounded-full bg-[#1DB954] text-black flex items-center justify-center shadow-xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 focus-visible:opacity-100 focus-visible:translate-y-0 transition-all duration-200 hover:scale-105"
        >
          <Play className="w-5 h-5 fill-black ml-0.5" />
        </button>
      )}
    </div>
  );
}
