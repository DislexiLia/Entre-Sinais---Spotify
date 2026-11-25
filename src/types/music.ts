export interface Track {
  id: string;
  title: string;
  artistName: string;
  artistId: string;
  albumName: string;
  albumId: string;
  coverUrl: string;
  durationMs: number;
  previewUrl: string | null;
  spotifyUri?: string;
  spotifyUrl?: string;
  deezerId?: number;
  isExplicit?: boolean;
  isSingle?: boolean;
  hasLibras?: boolean;
  librasClipId?: string;
  trackNumber?: number;
}

export interface Album {
  id: string;
  title: string;
  artistName: string;
  artistId: string;
  coverUrl: string;
  releaseYear: string;
  releaseDate?: string;
  recordType?: 'album' | 'single' | 'ep';
  genre?: string;
  totalTracks?: number;
  spotifyUri?: string;
  spotifyUrl?: string;
  deezerId?: number;
  accentColor?: string;
  tracks?: Track[];
}

export interface VideoClipInfo {
  title: string;
  description: string;
  year?: string;
  director?: string;
  hasLibras?: boolean;
  librasClipId?: string;
  youtubeQuery?: string;
}

export interface Artist {
  id: string;
  name: string;
  imageUrl: string;
  genre: string;
  bio: string;
  fans?: number;
  monthlyListenersLabel?: string;
  spotifyUri?: string;
  spotifyUrl?: string;
  deezerId?: number;
  accentColor?: string;
  topTracks?: Track[];
  albums?: Album[];
  singles?: Album[];
  videoclipes?: VideoClipInfo[];
  relatedPlaylists?: Playlist[];
  relatedArtists?: Array<{
    id: string;
    name: string;
    imageUrl: string;
  }>;
}

export interface Playlist {
  id: string;
  title: string;
  description: string;
  coverUrl: string;
  creator?: string;
  trackCount: number;
  tracks?: Track[];
  isUserPlaylist?: boolean;
  isSystem?: boolean;
  spotifyUrl?: string;
}

export interface SearchResults {
  query: string;
  bestMatch:
    | { kind: 'artist'; item: Artist }
    | { kind: 'album'; item: Album }
    | { kind: 'track'; item: Track }
    | null;
  tracks: Track[];
  artists: Artist[];
  albums: Album[];
  playlists: Playlist[];
}

export interface LibrasCue {
  startSec: number;
  endSec: number;
  caption: string;
  signLabel: string;
  handPose: 'wave' | 'heart' | 'aurora' | 'open' | 'pulse' | 'point';
}

export interface LibrasClip {
  id: string;
  title: string;
  artistName: string;
  artistId: string;
  trackId: string;
  videoUrl: string;
  posterUrl?: string;
  coverUrl: string;
  artistImageUrl: string;
  description: string;
  interpreterNote: string;
  cues: LibrasCue[];
}

export interface ArtistSign {
  artistId: string;
  artistName: string;
  artistImageUrl: string;
  signTitle: string;
  signDescription: string;
  videoUrl?: string;
  posterUrl?: string;
  featuredTrackId: string;
  featuredTrackTitle: string;
}

export interface FanStory {
  id: string;
  name: string;
  handle?: string;
  city: string;
  role: string;
  videoUrl: string;
  posterUrl?: string;
  durationSec: number;
  accentGradient: string;
  initials: string;
  quote: string;
  captions: Array<{ startSec: number; text: string }>;
  favoriteTrackId: string;
}

export interface UserPlaylist {
  id: string;
  name: string;
  description: string;
  tracks: Track[];
  createdAt: number;
}

export interface HistoryEntry {
  track: Track;
  playedAt: number;
  contextLabel?: string;
}

export interface LibraryState {
  likedTracks: Track[];
  userPlaylists: UserPlaylist[];
  savedAlbums: Album[];
  followedArtists: Artist[];
  history: HistoryEntry[];
  accessibleMode: boolean;
}

export type RepeatMode = 'off' | 'all' | 'one';

export type RouteView =
  | { page: 'home' }
  | { page: 'search'; initialQuery?: string }
  | { page: 'library' }
  | { page: 'history' }
  | { page: 'entre-sinais'; tab?: 'sobre' | 'historias' | 'clipes' | 'sinais'; clipId?: string }
  | { page: 'artist'; id: string }
  | { page: 'album'; id: string }
  | { page: 'playlist'; id: string };
