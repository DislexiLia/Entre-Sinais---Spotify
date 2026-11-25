import React, { useState } from 'react';
import { Check, ListMusic, Plus, X } from 'lucide-react';
import type { Track, UserPlaylist } from '../types/music.ts';

interface PlaylistDialogProps {
  track: Track | null;
  userPlaylists: UserPlaylist[];
  onClose: () => void;
  onAddTrackToPlaylist: (playlistId: string, track: Track) => void;
  onCreatePlaylistWithTrack: (name: string, track: Track | null) => void;
}

export function PlaylistDialog({
  track,
  userPlaylists,
  onClose,
  onAddTrackToPlaylist,
  onCreatePlaylistWithTrack,
}: PlaylistDialogProps) {
  const [newName, setNewName] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newName.trim() || `Minha Playlist #${userPlaylists.length + 1}`;
    onCreatePlaylistWithTrack(clean, track);
    setNewName('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={track ? 'Adicionar música à playlist' : 'Criar nova playlist'}
    >
      <div
        className="w-full max-w-md bg-[#242424] border border-white/10 rounded-2xl p-5 shadow-2xl space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-lg font-extrabold text-white">
              {track ? 'Adicionar à playlist' : 'Nova playlist'}
            </h2>
            {track && (
              <p className="text-xs text-[#b3b3b3] truncate mt-0.5">
                {track.title} · {track.artistName}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#b3b3b3] hover:text-white hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {track && (
          <div className="max-h-56 overflow-y-auto space-y-1">
            {userPlaylists.length === 0 ? (
              <p className="text-xs text-[#b3b3b3] py-2">
                Você ainda não criou nenhuma playlist pessoal. Crie uma abaixo!
              </p>
            ) : (
              userPlaylists.map((pl) => {
                const already = pl.tracks.some((t) => t.id === track.id);
                return (
                  <button
                    key={pl.id}
                    type="button"
                    onClick={() => {
                      if (!already) onAddTrackToPlaylist(pl.id, track);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.09] text-left transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <ListMusic className="w-4 h-4 text-[#b3b3b3] shrink-0" />
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-white truncate">{pl.name}</div>
                        <div className="text-xs text-[#b3b3b3]">{pl.tracks.length} músicas</div>
                      </div>
                    </div>
                    {already ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#1DB954] shrink-0">
                        <Check className="w-3.5 h-3.5" /> Adicionada
                      </span>
                    ) : (
                      <Plus className="w-4 h-4 text-[#b3b3b3] shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        )}

        <form onSubmit={handleCreate} className="pt-2 border-t border-white/10 space-y-3">
          <label htmlFor="new-playlist-name" className="block text-xs font-semibold text-[#b3b3b3]">
            {track ? 'Ou criar uma nova playlist' : 'Nome da playlist'}
          </label>
          <div className="flex gap-2">
            <input
              id="new-playlist-name"
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              maxLength={48}
              placeholder="Ex.: Minhas favoritas em Libras"
              className="flex-1 min-w-0 h-10 px-4 rounded-full bg-[#121212] border border-white/10 text-sm text-white placeholder-[#777] focus:outline-none focus:border-[#1DB954]"
            />
            <button
              type="submit"
              className="px-4 h-10 rounded-full bg-[#1DB954] text-black text-sm font-bold whitespace-nowrap hover:brightness-110 transition"
            >
              {track ? 'Criar e adicionar' : 'Criar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
