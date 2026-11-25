import type {
  Album,
  Artist,
  ArtistSign,
  FanStory,
  LibrasClip,
  Playlist,
  SearchResults,
  Track,
} from '../src/types/music.ts';

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry<unknown>>();
const CACHE_TTL_MS = 1000 * 60 * 15; // 15 minutes so preview URLs stay fresh

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.value as T;
}

function setCached<T>(key: string, value: T, ttlMs = CACHE_TTL_MS): T {
  cache.set(key, { value, expiresAt: Date.now() + ttlMs });
  return value;
}

function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function toHighResSpotifyCover(url: string): string {
  if (!url) return '';
  return url.replace('ab67616d00001e02', 'ab67616d0000b273');
}

export const SPOTIFY_FEATURED_ALBUM_IDS = [
  '37oi5fAM46AtRr3bXNj8M3', // Memórias Póstumas - Jão
  '15llRNuI2Ng20iaY9SQgsY', // De Primeira - Marina Sena
  '4JZQXCD2TwUZmxSLlMDRoX', // A danada sou eu - LUDMILLA
] as const;

export const SPOTIFY_ARTIST_MAP = {
  '59FrDXDVJz0EKqYg39dnT2': {
    id: 'sp-artist-59FrDXDVJz0EKqYg39dnT2',
    spotifyId: '59FrDXDVJz0EKqYg39dnT2',
    name: 'Jão',
    wikiTitle: 'Jão',
    deezerId: 5297266,
    genre: 'Pop · Indie Pop Brasileiro',
    imageUrl: 'https://image-cdn-ak.spotifycdn.com/image/ab6761610000e5ebe4b5c3d3af19c3d107f29c69',
    accentColor: '#7f1d1d',
    monthlyListenersLabel: '4,2 milhões de ouvintes mensais',
    bio: 'João Vitor Romania Balbino, conhecido como Jão, é um cantor e compositor brasileiro nascido em Américo Brasiliense (SP). Iniciou sua trajetória postando covers no YouTube e assinou com a Universal Music em 2017. Construiu uma discografia marcada por narrativas confessionais e turnês de estádio, passando por Lobos (2018), Anti-Herói (2019), Pirata (2021), SUPER (2023) e Memórias Póstumas (2026), álbum de 14 faixas inspirado na obra de Machado de Assis.',
    curatedAlbums: [
      { id: 'sp-album-37oi5fAM46AtRr3bXNj8M3', title: 'Memórias Póstumas', releaseYear: '2026', deezerId: 1035598992 },
      { id: 'dz-album-474461765', title: 'SUPER', releaseYear: '2023', deezerId: 474461765 },
      { id: 'dz-album-266464212', title: 'PIRATA', releaseYear: '2021', deezerId: 266464212 },
      { id: 'dz-album-70550092', title: 'LOBOS', releaseYear: '2018', deezerId: 70550092 },
    ],
    videoclipes: [
      {
        title: 'Aurora',
        year: '2026',
        description: 'Faixa de Memórias Póstumas com janela de interpretação em Libras e legendagem sincronizada.',
        hasLibras: true,
        librasClipId: 'clip-aurora',
      },
      {
        title: 'Idiota',
        year: '2022',
        description: 'Videoclipe dirigido por Pedro Tófani que recria cenas clássicas do cinema e da cultura pop romântica.',
        youtubeQuery: 'Jão Idiota clipe oficial',
      },
      {
        title: 'Imaturo',
        year: '2018',
        description: 'Primeiro grande sucesso de Lobos, certificado diamante no Brasil e marco visual da estreia do artista.',
        youtubeQuery: 'Jão Imaturo clipe oficial',
      },
    ],
  },
  '0nFdWpwl7h6fp3ADRyG14L': {
    id: 'sp-artist-0nFdWpwl7h6fp3ADRyG14L',
    spotifyId: '0nFdWpwl7h6fp3ADRyG14L',
    name: 'Marina Sena',
    wikiTitle: 'Marina_Sena',
    deezerId: 12194225,
    genre: 'Pop · MPB · Brasilidades',
    imageUrl: 'https://image-cdn-ak.spotifycdn.com/image/ab6761610000e5eba1f1da49af37bc62284c9cc9',
    accentColor: '#682000',
    monthlyListenersLabel: '3,6 milhões de ouvintes mensais',
    bio: 'Marina de Oliveira Sena é cantora, compositora e produtora musical nascida em Taiobeiras (MG). Antes da carreira solo, integrou A Outra Banda da Lua e o grupo Rosa Neon. Em 2021 lançou De Primeira, produzido por Iuri Rio Branco, indicado ao Grammy Latino e impulsionado pelo hit global Por Supuesto. Consolidou sua assinatura estética em Vício Inerente (2023) e Coisas Naturais (2025).',
    curatedAlbums: [
      { id: 'sp-album-15llRNuI2Ng20iaY9SQgsY', title: 'De Primeira', releaseYear: '2021', deezerId: 720732981 },
      { id: 'dz-album-431239617', title: 'Vício Inerente', releaseYear: '2023', deezerId: 431239617 },
      { id: 'dz-album-730003741', title: 'Coisas Naturais', releaseYear: '2025', deezerId: 730003741 },
    ],
    videoclipes: [
      {
        title: 'Santo',
        year: '2021',
        description: 'Faixa de De Primeira disponível com interpretação completa em Libras e janela integrada.',
        hasLibras: true,
        librasClipId: 'clip-santo',
      },
      {
        title: 'Por Supuesto',
        year: '2021',
        description: 'Sucesso de De Primeira que alcançou o topo do Viral Global do Spotify.',
        youtubeQuery: 'Marina Sena Por Supuesto clipe oficial',
      },
      {
        title: 'Me Toca',
        year: '2021',
        description: 'Primeiro single solo de Marina Sena, com clipe coreografado lançado em janeiro de 2021.',
        youtubeQuery: 'Marina Sena Me Toca clipe oficial',
      },
    ],
  },
  '3CDoRporvSjdzTrm99a3gi': {
    id: 'sp-artist-3CDoRporvSjdzTrm99a3gi',
    spotifyId: '3CDoRporvSjdzTrm99a3gi',
    name: 'LUDMILLA',
    wikiTitle: 'Ludmilla',
    deezerId: 5832541,
    genre: 'Funk · Pop · Pagode',
    imageUrl: 'https://image-cdn-fa.spotifycdn.com/image/ab6761610000e5eb4eadf41038c8f5f3938121b9',
    accentColor: '#481810',
    monthlyListenersLabel: '12,4 milhões de ouvintes mensais',
    bio: 'Ludmila Oliveira da Silva, conhecida como LUDMILLA, é cantora, compositora e empresária brasileira vencedora do Grammy Latino. Começou a cantar aos oito anos em rodas de pagode no Rio de Janeiro e ganhou projeção nacional em 2012 como MC Beyoncé. Lançou A danada sou eu (2016), indicado ao Grammy Latino, além dos projetos Hello Mundo, VILÃ e o fenômeno Numanice.',
    curatedAlbums: [
      { id: 'sp-album-4JZQXCD2TwUZmxSLlMDRoX', title: 'A danada sou eu', releaseYear: '2016', deezerId: 14023748 },
      { id: 'dz-album-347205797', title: 'Numanice #2 (Ao Vivo)', releaseYear: '2022', deezerId: 347205797 },
      { id: 'dz-album-414019567', title: 'VILÃ', releaseYear: '2023', deezerId: 414019567 },
    ],
    videoclipes: [
      {
        title: 'Cheguei',
        year: '2016',
        description: 'Faixa de abertura de A danada sou eu, com tradução rítmica e interpretação visual em Libras.',
        hasLibras: true,
        librasClipId: 'clip-cheguei',
      },
      {
        title: 'Bom',
        year: '2016',
        description: 'Clipe dirigido por Felipe Sassi, marcando a fase pop/R&B do álbum A danada sou eu.',
        youtubeQuery: 'Ludmilla Bom clipe oficial',
      },
      {
        title: 'Sou Eu',
        year: '2016',
        description: 'Videoclipe dirigido por Fabio Iadeluca em locações urbanas e coreografias de destaque.',
        youtubeQuery: 'Ludmilla Sou Eu clipe oficial',
      },
    ],
  },
} as const;

export const EXTRA_CURATED_ARTISTS = [
  { id: 'dz-artist-9151334', deezerId: 9151334, name: 'Liniker', wikiTitle: 'Liniker', genre: 'MPB · Soul · Black Music', featuredAlbumId: 'dz-album-713384901', accentColor: '#7c2d12' },
  { id: 'dz-artist-10286020', deezerId: 10286020, name: 'Luísa Sonza', wikiTitle: 'Luísa_Sonza', genre: 'Pop · Funk · R&B', featuredAlbumId: 'dz-album-480890205', accentColor: '#3f3f46' },
  { id: 'dz-artist-262833', deezerId: 262833, name: 'IZA', wikiTitle: 'Iza_(cantora)', genre: 'Pop · R&B · Soul', featuredAlbumId: 'dz-album-469639335', accentColor: '#713f12' },
  { id: 'dz-artist-4390053', deezerId: 4390053, name: 'Anitta', wikiTitle: 'Anitta', genre: 'Pop · Funk Brasileiro · Reggaeton', featuredAlbumId: 'dz-album-309370177', accentColor: '#312e81' },
];

const LIBRAS_TRACK_OVERRIDES: Record<string, string> = {
  '6PPB5jKQ257UqzP7tgmozP': 'clip-aurora',
  '6PETRfB5ssib6VqCAG6nIF': 'clip-santo',
  '6cbZb9mVAc5s8HtwklLoI0': 'clip-cheguei',
};

const ALBUM_META_OVERRIDES: Record<string, { releaseYear: string; genre: string; accentColor: string; artistId: string }> = {
  '37oi5fAM46AtRr3bXNj8M3': {
    releaseYear: '2026',
    genre: 'Pop Brasileiro',
    accentColor: '#7f1d1d',
    artistId: 'sp-artist-59FrDXDVJz0EKqYg39dnT2',
  },
  '15llRNuI2Ng20iaY9SQgsY': {
    releaseYear: '2021',
    genre: 'Pop · MPB',
    accentColor: '#7c2d12',
    artistId: 'sp-artist-0nFdWpwl7h6fp3ADRyG14L',
  },
  '4JZQXCD2TwUZmxSLlMDRoX': {
    releaseYear: '2016',
    genre: 'Funk · Pop',
    accentColor: '#581c87',
    artistId: 'sp-artist-3CDoRporvSjdzTrm99a3gi',
  },
};

export async function fetchSpotifyEmbedAlbum(spotifyAlbumId: string): Promise<Album | null> {
  const cleanId = spotifyAlbumId.replace(/^sp-album-/, '');
  const cacheKey = `sp-album:${cleanId}`;
  const cached = getCached<Album>(cacheKey);
  if (cached) return cached;

  try {
    const [embedRes, oembedRes] = await Promise.all([
      fetch(`https://open.spotify.com/embed/album/${cleanId}`),
      fetch(`https://open.spotify.com/oembed?url=https://open.spotify.com/album/${cleanId}`),
    ]);

    if (!embedRes.ok) return null;
    const html = await embedRes.text();
    const match = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
    if (!match) return null;

    const parsed = JSON.parse(match[1]);
    const entity = parsed?.props?.pageProps?.state?.data?.entity;
    if (!entity || !entity.name) return null;

    let coverUrl = '';
    if (oembedRes.ok) {
      const oembed = await oembedRes.json();
      coverUrl = toHighResSpotifyCover(oembed.thumbnail_url || '');
    }
    if (!coverUrl && entity.coverArt?.sources?.[0]?.url) {
      coverUrl = entity.coverArt.sources[0].url;
    }

    const meta = ALBUM_META_OVERRIDES[cleanId];
    const artistName = entity.subtitle || 'Artista';
    const artistId = meta?.artistId || `sp-search-artist-${encodeURIComponent(artistName)}`;

    const tracks: Track[] = (entity.trackList || []).map((t: any, idx: number) => {
      const uri: string = t.uri || '';
      const spTrackId = uri.split(':').pop() || `${cleanId}-${idx + 1}`;
      const librasClipId = LIBRAS_TRACK_OVERRIDES[spTrackId];
      return {
        id: `sp-track-${spTrackId}`,
        title: t.title,
        artistName: t.subtitle || artistName,
        artistId,
        albumName: entity.name,
        albumId: `sp-album-${cleanId}`,
        coverUrl,
        durationMs: Number(t.duration) || 180000,
        previewUrl: t.audioPreview?.url || null,
        spotifyUri: uri || `spotify:track:${spTrackId}`,
        spotifyUrl: `https://open.spotify.com/intl-pt/track/${spTrackId}`,
        isExplicit: Boolean(t.isExplicit),
        hasLibras: Boolean(librasClipId),
        librasClipId,
        trackNumber: idx + 1,
      };
    });

    const album: Album = {
      id: `sp-album-${cleanId}`,
      title: entity.name,
      artistName,
      artistId,
      coverUrl,
      releaseYear: meta?.releaseYear || (entity.releaseDate?.isoString?.slice(0, 4) ?? '—'),
      genre: meta?.genre || 'Spotify',
      recordType: tracks.length <= 3 ? 'single' : 'album',
      totalTracks: tracks.length,
      spotifyUri: `spotify:album:${cleanId}`,
      spotifyUrl: `https://open.spotify.com/intl-pt/album/${cleanId}`,
      accentColor: meta?.accentColor || '#1f2937',
      tracks,
    };

    return setCached(cacheKey, album);
  } catch (err) {
    console.error('Error fetching Spotify album', cleanId, err);
    return null;
  }
}

export async function fetchSpotifyEmbedArtistTopTracks(spotifyArtistId: string): Promise<{ imageUrl: string; tracks: Track[] }> {
  const cleanId = spotifyArtistId.replace(/^sp-artist-/, '');
  const cacheKey = `sp-artist-top:${cleanId}`;
  const cached = getCached<{ imageUrl: string; tracks: Track[] }>(cacheKey);
  if (cached) return cached;

  try {
    const res = await fetch(`https://open.spotify.com/embed/artist/${cleanId}`);
    if (!res.ok) return { imageUrl: '', tracks: [] };
    const html = await res.text();
    const match = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
    if (!match) return { imageUrl: '', tracks: [] };

    const parsed = JSON.parse(match[1]);
    const entity = parsed?.props?.pageProps?.state?.data?.entity;
    const img640 =
      entity?.visualIdentity?.image?.find((i: any) => i.maxWidth === 640)?.url ||
      entity?.visualIdentity?.image?.[0]?.url ||
      '';

    const curated = SPOTIFY_ARTIST_MAP[cleanId as keyof typeof SPOTIFY_ARTIST_MAP];
    const artistName = entity?.name || curated?.name || 'Artista';

    const tracks: Track[] = (entity?.trackList || []).map((t: any, idx: number) => {
      const uri: string = t.uri || '';
      const spTrackId = uri.split(':').pop() || `${cleanId}-${idx + 1}`;
      const librasClipId = LIBRAS_TRACK_OVERRIDES[spTrackId];
      return {
        id: `sp-track-${spTrackId}`,
        title: t.title,
        artistName: t.subtitle || artistName,
        artistId: `sp-artist-${cleanId}`,
        albumName: artistName,
        albumId: curated?.curatedAlbums?.[0]?.id || `sp-artist-${cleanId}`,
        coverUrl: img640,
        durationMs: Number(t.duration) || 180000,
        previewUrl: t.audioPreview?.url || null,
        spotifyUri: uri || `spotify:track:${spTrackId}`,
        spotifyUrl: `https://open.spotify.com/intl-pt/track/${spTrackId}`,
        isExplicit: Boolean(t.isExplicit),
        hasLibras: Boolean(librasClipId),
        librasClipId,
        trackNumber: idx + 1,
      };
    });

    return setCached(cacheKey, { imageUrl: img640, tracks });
  } catch (err) {
    console.error('Error fetching Spotify artist embed', cleanId, err);
    return { imageUrl: '', tracks: [] };
  }
}

export async function fetchWikipediaBio(title: string): Promise<string | null> {
  const cacheKey = `wiki:${title}`;
  const cached = getCached<string>(cacheKey);
  if (cached) return cached;

  try {
    const res = await fetch(`https://pt.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`, {
      headers: { 'User-Agent': 'SpotifyEntreSinaisApp/1.0' },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data?.type === 'disambiguation' || !data?.extract) return null;
    return setCached(cacheKey, data.extract, 1000 * 60 * 60);
  } catch {
    return null;
  }
}

function mapDeezerTrack(t: any, fallbackCover = ''): Track {
  const coverUrl = t.album?.cover_big || t.album?.cover_medium || fallbackCover || '';
  const artistName = t.artist?.name || 'Artista';
  const artistId = t.artist?.id ? `dz-artist-${t.artist.id}` : `search-artist-${encodeURIComponent(artistName)}`;
  const albumId = t.album?.id ? `dz-album-${t.album.id}` : `search-album-${encodeURIComponent(t.album?.title || '')}`;
  return {
    id: `dz-track-${t.id}`,
    title: t.title,
    artistName,
    artistId,
    albumName: t.album?.title || 'Single',
    albumId,
    coverUrl,
    durationMs: (Number(t.duration) || 30) * 1000,
    previewUrl: t.preview || null,
    deezerId: Number(t.id),
    isExplicit: Boolean(t.explicit_lyrics),
    spotifyUrl: `https://open.spotify.com/search/${encodeURIComponent(`${t.title} ${artistName}`)}`,
  };
}

function mapDeezerAlbum(a: any): Album {
  return {
    id: `dz-album-${a.id}`,
    title: a.title,
    artistName: a.artist?.name || 'Artista',
    artistId: a.artist?.id ? `dz-artist-${a.artist.id}` : 'unknown',
    coverUrl: a.cover_xl || a.cover_big || a.cover_medium || '',
    releaseYear: (a.release_date || '').slice(0, 4) || '—',
    releaseDate: a.release_date || undefined,
    recordType: a.record_type === 'single' ? 'single' : a.record_type === 'ep' ? 'ep' : 'album',
    totalTracks: a.nb_tracks || undefined,
    deezerId: Number(a.id),
    spotifyUrl: `https://open.spotify.com/search/${encodeURIComponent(`${a.title} ${a.artist?.name || ''}`)}`,
  };
}

function mapDeezerPlaylist(p: any): Playlist {
  return {
    id: `dz-playlist-${p.id}`,
    title: p.title,
    description: p.user?.name ? `Curadoria por ${p.user.name}` : 'Playlist',
    coverUrl: p.picture_xl || p.picture_big || p.picture_medium || '',
    creator: p.user?.name || 'Spotify',
    trackCount: Number(p.nb_tracks) || 0,
  };
}

export async function fetchDeezerAlbum(deezerId: number): Promise<Album | null> {
  const cacheKey = `dz-album:${deezerId}`;
  const cached = getCached<Album>(cacheKey);
  if (cached) return cached;

  try {
    const res = await fetch(`https://api.deezer.com/album/${deezerId}`);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data || data.error) return null;

    const coverUrl = data.cover_xl || data.cover_big || data.cover_medium || '';
    const genre = data.genres?.data?.map((g: any) => g.name).slice(0, 2).join(' · ') || 'Música';
    const mappedArtistId =
      Object.values(SPOTIFY_ARTIST_MAP).find((a) => a.deezerId === Number(data.artist?.id))?.id ||
      `dz-artist-${data.artist?.id}`;

    const tracks: Track[] = (data.tracks?.data || []).map((t: any, idx: number) => ({
      ...mapDeezerTrack(
        {
          ...t,
          album: { id: data.id, title: data.title, cover_big: coverUrl },
          artist: t.artist || data.artist,
        },
        coverUrl
      ),
      artistId: mappedArtistId,
      albumId: `dz-album-${data.id}`,
      trackNumber: idx + 1,
    }));

    const album: Album = {
      id: `dz-album-${data.id}`,
      title: data.title,
      artistName: data.artist?.name || 'Artista',
      artistId: mappedArtistId,
      coverUrl,
      releaseYear: (data.release_date || '').slice(0, 4) || '—',
      releaseDate: data.release_date,
      recordType: data.record_type === 'single' ? 'single' : data.record_type === 'ep' ? 'ep' : 'album',
      genre,
      totalTracks: data.nb_tracks || tracks.length,
      deezerId: Number(data.id),
      spotifyUrl: `https://open.spotify.com/search/${encodeURIComponent(`${data.title} ${data.artist?.name || ''}`)}`,
      tracks,
    };

    return setCached(cacheKey, album);
  } catch (err) {
    console.error('Error fetching Deezer album', deezerId, err);
    return null;
  }
}

export async function fetchDeezerPlaylist(deezerId: number): Promise<Playlist | null> {
  const cacheKey = `dz-playlist:${deezerId}`;
  const cached = getCached<Playlist>(cacheKey);
  if (cached) return cached;

  try {
    const res = await fetch(`https://api.deezer.com/playlist/${deezerId}`);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data || data.error) return null;

    const tracks: Track[] = (data.tracks?.data || []).slice(0, 40).map((t: any, idx: number) => ({
      ...mapDeezerTrack(t),
      trackNumber: idx + 1,
    }));

    const playlist: Playlist = {
      id: `dz-playlist-${data.id}`,
      title: data.title,
      description: data.description || (data.creator?.name ? `Seleção por ${data.creator.name}` : 'Playlist em destaque'),
      coverUrl: data.picture_xl || data.picture_big || data.picture_medium || tracks[0]?.coverUrl || '',
      creator: data.creator?.name || 'Spotify',
      trackCount: data.nb_tracks || tracks.length,
      tracks,
    };

    return setCached(cacheKey, playlist);
  } catch (err) {
    console.error('Error fetching Deezer playlist', deezerId, err);
    return null;
  }
}

export async function getCuratedPlaylists(): Promise<Playlist[]> {
  const [alJao, alMarina, alLud] = await Promise.all([
    fetchSpotifyEmbedAlbum('37oi5fAM46AtRr3bXNj8M3'),
    fetchSpotifyEmbedAlbum('15llRNuI2Ng20iaY9SQgsY'),
    fetchSpotifyEmbedAlbum('4JZQXCD2TwUZmxSLlMDRoX'),
  ]);

  const jaoTracks = alJao?.tracks || [];
  const marinaTracks = alMarina?.tracks || [];
  const ludTracks = alLud?.tracks || [];

  const destaquesTracks = [
    jaoTracks[2], // Aurora
    marinaTracks[9], // Santo
    ludTracks[0], // Cheguei
    jaoTracks[0], // Catedral
    marinaTracks[2], // Por Supuesto
    ludTracks[1], // Bom
    jaoTracks[3], // Por Você
    marinaTracks[0], // Me Toca
    ludTracks[2], // Sou eu
  ].filter(Boolean) as Track[];

  const popBrasilTracks = [
    jaoTracks[2],
    jaoTracks[3],
    marinaTracks[2],
    marinaTracks[0],
    ludTracks[1],
    ludTracks[0],
    jaoTracks[1],
    marinaTracks[1],
  ].filter(Boolean) as Track[];

  const mpbTracks = [
    marinaTracks[2],
    marinaTracks[7], // Amiúde
    marinaTracks[8], // Seu Olhar
    jaoTracks[4], // Literatura
    jaoTracks[6], // Jabuticabeira
    jaoTracks[13], // Memórias Póstumas
  ].filter(Boolean) as Track[];

  const funkPagodeTracks = [
    ludTracks[0],
    ludTracks[1],
    ludTracks[2],
    ludTracks[4],
    ludTracks[6],
    ludTracks[10],
  ].filter(Boolean) as Track[];

  return [
    {
      id: 'destaques',
      title: 'Entre Sinais · Destaques',
      description: 'Seleção oficial com os destaques da campanha de acessibilidade em Libras e os principais sucessos dos artistas participantes.',
      coverUrl: '/assets/aistudio/KV_1c7d16c0.png',
      creator: 'Spotify · Acessibilidade em Libras',
      trackCount: destaquesTracks.length,
      tracks: destaquesTracks,
      isSystem: true,
    },
    {
      id: 'pop-brasil',
      title: 'Pop Brasil Atual',
      description: 'Os maiores nomes do pop brasileiro contemporâneo: Jão, Marina Sena, LUDMILLA e mais.',
      coverUrl: alMarina?.coverUrl || '',
      creator: 'Spotify Brasil',
      trackCount: popBrasilTracks.length,
      tracks: popBrasilTracks,
      isSystem: true,
    },
    {
      id: 'mpb-nova',
      title: 'MPB & Nova Música Brasileira',
      description: 'Canções autorais que conectam poesia, MPB moderna e brasilidades.',
      coverUrl: alJao?.coverUrl || '',
      creator: 'Spotify Brasil',
      trackCount: mpbTracks.length,
      tracks: mpbTracks,
      isSystem: true,
    },
    {
      id: 'funk-pagode',
      title: 'Funk, Pop & Energia',
      description: 'Batidas contagiantes lideradas por LUDMILLA e clássicos das pistas brasileiras.',
      coverUrl: alLud?.coverUrl || '',
      creator: 'Spotify Brasil',
      trackCount: funkPagodeTracks.length,
      tracks: funkPagodeTracks,
      isSystem: true,
    },
  ];
}

export async function getArtistById(artistId: string): Promise<Artist | null> {
  // 1. Check curated Spotify artist
  const cleanSpotifyId = artistId.replace(/^sp-artist-/, '');
  const curated = SPOTIFY_ARTIST_MAP[cleanSpotifyId as keyof typeof SPOTIFY_ARTIST_MAP];
  if (curated) {
    const [spTop, dzAlbumsRes, spFeaturedAlbums, playlists] = await Promise.all([
      fetchSpotifyEmbedArtistTopTracks(curated.spotifyId),
      fetch(`https://api.deezer.com/artist/${curated.deezerId}/albums?limit=25`).then((r) => r.json()).catch(() => ({ data: [] })),
      Promise.all(
        curated.curatedAlbums
          .filter((a) => a.id.startsWith('sp-album-'))
          .map((a) => fetchSpotifyEmbedAlbum(a.id))
      ),
      getCuratedPlaylists(),
    ]);

    const featuredValid = spFeaturedAlbums.filter(Boolean) as Album[];
    const featuredCover = featuredValid[0]?.coverUrl || spTop.imageUrl || curated.imageUrl;

    // Enrich top tracks with album cover if matched in featured albums
    const featuredTrackByUri = new Map<string, Track>();
    for (const alb of featuredValid) {
      for (const tr of alb.tracks || []) {
        if (tr.spotifyUri) featuredTrackByUri.set(tr.spotifyUri, tr);
      }
    }

    const topTracks = spTop.tracks.map((t) => {
      const matched = t.spotifyUri ? featuredTrackByUri.get(t.spotifyUri) : undefined;
      if (matched) return matched;
      return { ...t, coverUrl: t.coverUrl || featuredCover };
    });

    const dzAlbumsRaw: Album[] = (dzAlbumsRes?.data || []).map((a: any) => ({
      ...mapDeezerAlbum({ ...a, artist: { id: curated.deezerId, name: curated.name } }),
      artistId: curated.id,
    }));

    // Merge curated Spotify albums first, deduplicating matching titles
    const seenTitles = new Set(featuredValid.map((a) => normalizeText(a.title)));
    const allReleases = [
      ...featuredValid,
      ...dzAlbumsRaw.filter((a) => !seenTitles.has(normalizeText(a.title))),
    ];

    const albums = allReleases.filter((a) => a.recordType !== 'single');
    const singles = allReleases.filter((a) => a.recordType === 'single');

    const relatedPlaylists = playlists.filter((pl) =>
      (pl.tracks || []).some((t) => t.artistId === curated.id || normalizeText(t.artistName).includes(normalizeText(curated.name)))
    );

    return {
      id: curated.id,
      name: curated.name,
      imageUrl: spTop.imageUrl || curated.imageUrl,
      genre: curated.genre,
      bio: curated.bio,
      monthlyListenersLabel: curated.monthlyListenersLabel,
      spotifyUri: `spotify:artist:${curated.spotifyId}`,
      spotifyUrl: `https://open.spotify.com/intl-pt/artist/${curated.spotifyId}`,
      deezerId: curated.deezerId,
      accentColor: curated.accentColor,
      topTracks,
      albums,
      singles,
      videoclipes: [...curated.videoclipes],
      relatedPlaylists,
      relatedArtists: Object.values(SPOTIFY_ARTIST_MAP)
        .filter((other) => other.id !== curated.id)
        .map((other) => ({
          id: other.id,
          name: other.name,
          imageUrl: other.imageUrl,
        })),
    };
  }

  // 2. Dynamic Deezer artist lookup
  const cleanDzId = artistId.replace(/^dz-artist-/, '');
  const numericId = Number(cleanDzId);
  if (!Number.isFinite(numericId)) return null;

  const cacheKey = `full-dz-artist:${numericId}`;
  const cached = getCached<Artist>(cacheKey);
  if (cached) return cached;

  try {
    const [artistRes, topRes, albumsRes, relatedRes] = await Promise.all([
      fetch(`https://api.deezer.com/artist/${numericId}`).then((r) => r.json()),
      fetch(`https://api.deezer.com/artist/${numericId}/top?limit=12`).then((r) => r.json()),
      fetch(`https://api.deezer.com/artist/${numericId}/albums?limit=24`).then((r) => r.json()),
      fetch(`https://api.deezer.com/artist/${numericId}/related?limit=6`).then((r) => r.json()),
    ]);

    if (!artistRes || artistRes.error) return null;

    const extraMeta = EXTRA_CURATED_ARTISTS.find((a) => a.deezerId === numericId);
    const wikiBio = await fetchWikipediaBio(extraMeta?.wikiTitle || artistRes.name);

    const topTracks: Track[] = (topRes?.data || []).map((t: any, idx: number) => ({
      ...mapDeezerTrack(t),
      artistId: `dz-artist-${numericId}`,
      trackNumber: idx + 1,
    }));

    const allAlbums: Album[] = (albumsRes?.data || []).map((a: any) => ({
      ...mapDeezerAlbum({ ...a, artist: { id: numericId, name: artistRes.name } }),
      artistId: `dz-artist-${numericId}`,
    }));

    const albums = allAlbums.filter((a) => a.recordType !== 'single');
    const singles = allAlbums.filter((a) => a.recordType === 'single');
    const fansCount = Number(artistRes.nb_fan || 0);

    const artist: Artist = {
      id: `dz-artist-${numericId}`,
      name: artistRes.name,
      imageUrl: artistRes.picture_xl || artistRes.picture_big || artistRes.picture_medium || '',
      genre: extraMeta?.genre || 'Música',
      bio:
        wikiBio ||
        `${artistRes.name} soma ${fansCount.toLocaleString('pt-BR')} fãs na plataforma, com ${albums.length} álbuns e ${singles.length} singles catalogados.`,
      fans: fansCount,
      monthlyListenersLabel: `${fansCount.toLocaleString('pt-BR')} fãs seguem este artista`,
      deezerId: numericId,
      spotifyUrl: `https://open.spotify.com/search/${encodeURIComponent(artistRes.name)}`,
      accentColor: extraMeta?.accentColor || '#1f2937',
      topTracks,
      albums,
      singles,
      videoclipes: topTracks.slice(0, 3).map((t) => ({
        title: t.title,
        description: `Videoclipe oficial de ${t.title}, faixa do álbum ${t.albumName}.`,
        youtubeQuery: `${artistRes.name} ${t.title} clipe oficial`,
      })),
      relatedArtists: (relatedRes?.data || []).slice(0, 6).map((ra: any) => ({
        id: `dz-artist-${ra.id}`,
        name: ra.name,
        imageUrl: ra.picture_big || ra.picture_medium || '',
      })),
    };

    return setCached(cacheKey, artist);
  } catch (err) {
    console.error('Error fetching Deezer artist', numericId, err);
    return null;
  }
}

export async function getAlbumById(albumId: string): Promise<Album | null> {
  if (albumId.startsWith('sp-album-') || /^[A-Za-z0-9]{22}$/.test(albumId)) {
    return fetchSpotifyEmbedAlbum(albumId);
  }
  if (albumId.startsWith('dz-album-')) {
    return fetchDeezerAlbum(Number(albumId.replace(/^dz-album-/, '')));
  }
  return null;
}

export async function getPlaylistById(playlistId: string): Promise<Playlist | null> {
  if (playlistId.startsWith('dz-playlist-')) {
    return fetchDeezerPlaylist(Number(playlistId.replace(/^dz-playlist-/, '')));
  }
  const curated = await getCuratedPlaylists();
  return curated.find((p) => p.id === playlistId) || null;
}

export async function searchCatalog(query: string, type = 'all'): Promise<SearchResults> {
  const trimmed = query.trim();
  if (!trimmed) {
    return { query: '', bestMatch: null, tracks: [], artists: [], albums: [], playlists: [] };
  }

  // Check if user pasted a Spotify URL directly
  const spMatch = trimmed.match(/open\.spotify\.com(?:\/intl-[a-z-]+)?\/(album|artist|track|playlist)\/([A-Za-z0-9]{22})/);
  if (spMatch) {
    const [, kind, spId] = spMatch;
    if (kind === 'album') {
      const al = await fetchSpotifyEmbedAlbum(spId);
      if (al) {
        return {
          query: trimmed,
          bestMatch: { kind: 'album', item: al },
          tracks: al.tracks || [],
          artists: [],
          albums: [al],
          playlists: [],
        };
      }
    } else if (kind === 'artist') {
      const ar = await getArtistById(`sp-artist-${spId}`);
      if (ar) {
        return {
          query: trimmed,
          bestMatch: { kind: 'artist', item: ar },
          tracks: ar.topTracks || [],
          artists: [ar],
          albums: ar.albums || [],
          playlists: [],
        };
      }
    }
  }

  const nq = normalizeText(trimmed);

  // 1. Curated local catalog matching (our 3 featured Spotify albums + artists + playlists)
  const [featuredAlbums, playlists] = await Promise.all([
    Promise.all(SPOTIFY_FEATURED_ALBUM_IDS.map((id) => fetchSpotifyEmbedAlbum(id))),
    getCuratedPlaylists(),
  ]);

  const curatedAlbums = featuredAlbums.filter(Boolean) as Album[];
  const curatedTracks = curatedAlbums.flatMap((a) => a.tracks || []);
  const curatedArtists: Artist[] = Object.values(SPOTIFY_ARTIST_MAP).map((a) => ({
    id: a.id,
    name: a.name,
    imageUrl: a.imageUrl,
    genre: a.genre,
    bio: a.bio,
    spotifyUrl: `https://open.spotify.com/intl-pt/artist/${a.spotifyId}`,
    accentColor: a.accentColor,
  }));

  const localTracks = curatedTracks.filter(
    (t) => normalizeText(t.title).includes(nq) || normalizeText(t.artistName).includes(nq) || normalizeText(t.albumName).includes(nq)
  );
  const localAlbums = curatedAlbums.filter(
    (a) => normalizeText(a.title).includes(nq) || normalizeText(a.artistName).includes(nq)
  );
  const localArtists = curatedArtists.filter(
    (a) => normalizeText(a.name).includes(nq) || normalizeText(a.genre).includes(nq)
  );
  const localPlaylists = playlists.filter(
    (p) => normalizeText(p.title).includes(nq) || normalizeText(p.description).includes(nq)
  );

  // 2. Live Deezer search in parallel for universal Spotify-like search
  const shouldFetch = (kind: string) => type === 'all' || type === kind;

  const [dzTracksRes, dzArtistsRes, dzAlbumsRes, dzPlaylistsRes] = await Promise.all([
    shouldFetch('track')
      ? fetch(`https://api.deezer.com/search/track?q=${encodeURIComponent(trimmed)}&limit=18`).then((r) => r.json()).catch(() => ({ data: [] }))
      : Promise.resolve({ data: [] }),
    shouldFetch('artist')
      ? fetch(`https://api.deezer.com/search/artist?q=${encodeURIComponent(trimmed)}&limit=12`).then((r) => r.json()).catch(() => ({ data: [] }))
      : Promise.resolve({ data: [] }),
    shouldFetch('album')
      ? fetch(`https://api.deezer.com/search/album?q=${encodeURIComponent(trimmed)}&limit=12`).then((r) => r.json()).catch(() => ({ data: [] }))
      : Promise.resolve({ data: [] }),
    shouldFetch('playlist')
      ? fetch(`https://api.deezer.com/search/playlist?q=${encodeURIComponent(trimmed)}&limit=10`).then((r) => r.json()).catch(() => ({ data: [] }))
      : Promise.resolve({ data: [] }),
  ]);

  // Merge Tracks (deduplicate title + artist)
  const seenTrackKeys = new Set(localTracks.map((t) => `${normalizeText(t.title)}|${normalizeText(t.artistName)}`));
  const dzTracks = (dzTracksRes?.data || [])
    .map((t: any) => mapDeezerTrack(t))
    .filter((t: Track) => {
      const k = `${normalizeText(t.title)}|${normalizeText(t.artistName)}`;
      if (seenTrackKeys.has(k)) return false;
      seenTrackKeys.add(k);
      return true;
    });
  const tracks = [...localTracks, ...dzTracks].slice(0, 24);

  // Merge Artists (sort live Deezer artists by fan count descending so main artists rank #1)
  const seenArtistNames = new Set(localArtists.map((a) => normalizeText(a.name)));
  const dzArtistsSorted = (dzArtistsRes?.data || [])
    .slice()
    .sort((a: any, b: any) => (b.nb_fan || 0) - (a.nb_fan || 0))
    .map((a: any): Artist => {
      const mappedCurated = Object.values(SPOTIFY_ARTIST_MAP).find((c) => c.deezerId === Number(a.id));
      if (mappedCurated) {
        return {
          id: mappedCurated.id,
          name: mappedCurated.name,
          imageUrl: mappedCurated.imageUrl,
          genre: mappedCurated.genre,
          bio: mappedCurated.bio,
        };
      }
      return {
        id: `dz-artist-${a.id}`,
        name: a.name,
        imageUrl: a.picture_xl || a.picture_big || a.picture_medium || '',
        genre: 'Artista',
        bio: '',
        fans: Number(a.nb_fan || 0),
        monthlyListenersLabel: a.nb_fan ? `${Number(a.nb_fan).toLocaleString('pt-BR')} fãs` : undefined,
      };
    })
    .filter((a: Artist) => {
      const k = normalizeText(a.name);
      if (seenArtistNames.has(k)) return false;
      seenArtistNames.add(k);
      return true;
    });
  const artists = [...localArtists, ...dzArtistsSorted].slice(0, 12);

  // Merge Albums
  const seenAlbumKeys = new Set(localAlbums.map((a) => `${normalizeText(a.title)}|${normalizeText(a.artistName)}`));
  const dzAlbums = (dzAlbumsRes?.data || [])
    .map((a: any) => mapDeezerAlbum(a))
    .filter((a: Album) => {
      const k = `${normalizeText(a.title)}|${normalizeText(a.artistName)}`;
      if (seenAlbumKeys.has(k)) return false;
      seenAlbumKeys.add(k);
      return true;
    });
  const mergedAlbums = [...localAlbums, ...dzAlbums].slice(0, 12);

  // Merge Playlists
  const dzPlaylists = (dzPlaylistsRes?.data || []).map((p: any) => mapDeezerPlaylist(p));
  const mergedPlaylists = [...localPlaylists, ...dzPlaylists].slice(0, 10);

  // Determine Best Match like Spotify
  let bestMatch: SearchResults['bestMatch'] = null;
  if (artists[0] && normalizeText(artists[0].name) === nq) {
    bestMatch = { kind: 'artist', item: artists[0] };
  } else if (mergedAlbums[0] && normalizeText(mergedAlbums[0].title) === nq) {
    bestMatch = { kind: 'album', item: mergedAlbums[0] };
  } else if (tracks[0] && normalizeText(tracks[0].title) === nq) {
    bestMatch = { kind: 'track', item: tracks[0] };
  } else if (artists[0] && normalizeText(artists[0].name).startsWith(nq)) {
    bestMatch = { kind: 'artist', item: artists[0] };
  } else if (tracks[0]) {
    bestMatch = { kind: 'track', item: tracks[0] };
  } else if (artists[0]) {
    bestMatch = { kind: 'artist', item: artists[0] };
  } else if (mergedAlbums[0]) {
    bestMatch = { kind: 'album', item: mergedAlbums[0] };
  }

  return {
    query: trimmed,
    bestMatch,
    tracks,
    artists,
    albums: mergedAlbums,
    playlists: mergedPlaylists,
  };
}

export async function refreshTrackPreview(trackId: string, title?: string, artist?: string): Promise<string | null> {
  if (trackId.startsWith('sp-track-')) {
    const rawId = trackId.replace(/^sp-track-/, '');
    try {
      const html = await fetch(`https://open.spotify.com/embed/track/${rawId}`).then((r) => r.text());
      const m = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
      if (m) {
        const d = JSON.parse(m[1]);
        const url = d?.props?.pageProps?.state?.data?.entity?.audioPreview?.url;
        if (url) return url;
      }
    } catch {
      // fall through
    }
  }

  if (trackId.startsWith('dz-track-')) {
    const rawId = trackId.replace(/^dz-track-/, '');
    try {
      const d = await fetch(`https://api.deezer.com/track/${rawId}`).then((r) => r.json());
      if (d?.preview) return d.preview;
    } catch {
      // fall through
    }
  }

  if (title) {
    const q = `${title} ${artist || ''}`.trim();
    try {
      const dz = await fetch(`https://api.deezer.com/search/track?q=${encodeURIComponent(q)}&limit=1`).then((r) => r.json());
      if (dz?.data?.[0]?.preview) return dz.data[0].preview;
    } catch {
      // fall through
    }
    try {
      const it = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(q)}&entity=song&limit=1&country=BR`).then((r) => r.json());
      if (it?.results?.[0]?.previewUrl) return it.results[0].previewUrl;
    } catch {
      // ignore
    }
  }
  return null;
}

export async function getHomeData() {
  const [spAlbumsRaw, extraAlbumsRaw, playlists, curatedArtistsFull] = await Promise.all([
    Promise.all(SPOTIFY_FEATURED_ALBUM_IDS.map((id) => fetchSpotifyEmbedAlbum(id))),
    Promise.all(
      EXTRA_CURATED_ARTISTS.map((a) => fetchDeezerAlbum(Number(a.featuredAlbumId.replace('dz-album-', ''))))
    ),
    getCuratedPlaylists(),
    Promise.all(Object.keys(SPOTIFY_ARTIST_MAP).map((id) => getArtistById(`sp-artist-${id}`))),
  ]);

  const extraArtistsFull = await Promise.all(
    EXTRA_CURATED_ARTISTS.map((a) => getArtistById(a.id))
  );

  const featuredAlbums = [
    ...(spAlbumsRaw.filter(Boolean) as Album[]),
    ...(extraAlbumsRaw.filter(Boolean) as Album[]),
  ];

  const artists = [
    ...(curatedArtistsFull.filter(Boolean) as Artist[]),
    ...(extraArtistsFull.filter(Boolean) as Artist[]),
  ];

  const alJao = featuredAlbums.find((a) => a.id === 'sp-album-37oi5fAM46AtRr3bXNj8M3');
  const alMarina = featuredAlbums.find((a) => a.id === 'sp-album-15llRNuI2Ng20iaY9SQgsY');
  const alLud = featuredAlbums.find((a) => a.id === 'sp-album-4JZQXCD2TwUZmxSLlMDRoX');

  const auroraTrack = alJao?.tracks?.find((t) => t.title === 'Aurora');
  const santoTrack = alMarina?.tracks?.find((t) => t.title === 'Santo');
  const chegueiTrack = alLud?.tracks?.find((t) => t.title === 'Cheguei');

  const librasClips: LibrasClip[] = [
    {
      id: 'clip-aurora',
      title: 'Aurora',
      artistName: 'Jão',
      artistId: 'sp-artist-59FrDXDVJz0EKqYg39dnT2',
      trackId: auroraTrack?.id || 'sp-track-6PPB5jKQ257UqzP7tgmozP',
      videoUrl: '/assets/aistudio/web/aurora_libras_v2.mp4',
      posterUrl: '/assets/aistudio/web/aurora_libras_v2.jpg',
      coverUrl: alJao?.coverUrl || '',
      artistImageUrl: SPOTIFY_ARTIST_MAP['59FrDXDVJz0EKqYg39dnT2'].imageUrl,
      description: 'Videoclipe oficial de Aurora (Memórias Póstumas) com intérprete de Libras integrado.',
      interpreterNote: 'Tradução musical em Libras com foco na prosódia visual e expressão cênica.',
      cues: [
        { startSec: 0, endSec: 6, caption: '♪ Entre no meu corpo, seja água, seja fogo…', signLabel: 'AURORA · JÃO', handPose: 'aurora' },
        { startSec: 6, endSec: 15, caption: 'Eu só quero ser feliz de novo…', signLabel: 'SENTIR · CORAÇÃO', handPose: 'heart' },
        { startSec: 15, endSec: 24, caption: 'E se amanhã eu não voltar, meu bem, você me espera…', signLabel: 'ESPERA · TEMPO', handPose: 'pulse' },
        { startSec: 24, endSec: 40, caption: 'Já tive medo, mas eu sei também o tempo não erra.', signLabel: 'ENTRE SINAIS', handPose: 'wave' },
      ],
    },
    {
      id: 'clip-santo',
      title: 'Santo',
      artistName: 'Marina Sena',
      artistId: 'sp-artist-0nFdWpwl7h6fp3ADRyG14L',
      trackId: santoTrack?.id || 'sp-track-6PETRfB5ssib6VqCAG6nIF',
      videoUrl: '/assets/aistudio/web/santo_libras.mp4',
      posterUrl: '/assets/aistudio/web/santo_libras.jpg',
      coverUrl: alMarina?.coverUrl || '',
      artistImageUrl: SPOTIFY_ARTIST_MAP['0nFdWpwl7h6fp3ADRyG14L'].imageUrl,
      description: 'Videoclipe oficial de Santo (De Primeira) com interpretação musical em Libras integrada.',
      interpreterNote: 'Interpretação em Libras acompanhando a cadência vocal e percussiva de Marina Sena.',
      cues: [
        { startSec: 0, endSec: 8, caption: '♪ Jeito de quem corre, sofro na estrada, lindo é o caminho…', signLabel: 'SANTO · MARINA SENA', handPose: 'open' },
        { startSec: 8, endSec: 18, caption: 'Fé que vai chegar um santo que me mostre que eu já sou um anjo…', signLabel: 'ANJO · LIBERDADE', handPose: 'aurora' },
        { startSec: 18, endSec: 36, caption: 'E vi a minha liberdade.', signLabel: 'ENTRE SINAIS', handPose: 'wave' },
      ],
    },
    {
      id: 'clip-cheguei',
      title: 'Cheguei',
      artistName: 'LUDMILLA',
      artistId: 'sp-artist-3CDoRporvSjdzTrm99a3gi',
      trackId: chegueiTrack?.id || 'sp-track-6cbZb9mVAc5s8HtwklLoI0',
      videoUrl: '/assets/aistudio/web/cheguei_libras_v2.mp4',
      posterUrl: '/assets/aistudio/web/cheguei_libras_v2.jpg',
      coverUrl: alLud?.coverUrl || '',
      artistImageUrl: SPOTIFY_ARTIST_MAP['3CDoRporvSjdzTrm99a3gi'].imageUrl,
      description: 'Videoclipe oficial de Cheguei (A danada sou eu) com janela de Libras integrada.',
      interpreterNote: 'Tradução energética em Libras acompanhando a batida funk/pop.',
      cues: [
        { startSec: 0, endSec: 7, caption: '♪ Cheguei, cheguei chegando bagunçando a zorra toda…', signLabel: 'CHEGUEI · LUDMILLA', handPose: 'pulse' },
        { startSec: 7, endSec: 18, caption: 'Porque ninguém vai estragar meu dia, avisa lá pode falar que eu cheguei!', signLabel: 'PRESENÇA · FORÇA', handPose: 'open' },
        { startSec: 18, endSec: 38, caption: '♪ Ritmo e celebração em Libras.', signLabel: 'ENTRE SINAIS', handPose: 'heart' },
      ],
    },
  ];

  const artistSigns: ArtistSign[] = [
    {
      artistId: 'sp-artist-59FrDXDVJz0EKqYg39dnT2',
      artistName: 'Jão',
      artistImageUrl: SPOTIFY_ARTIST_MAP['59FrDXDVJz0EKqYg39dnT2'].imageUrl,
      signTitle: 'Como fazer o sinal de Jão em Libras',
      signDescription: 'A intérprete demonstra o sinal pessoal de Jão em Libras, associado às características marcantes do artista.',
      videoUrl: '/assets/aistudio/web/sinal_jao_v2.mp4',
      posterUrl: '/assets/aistudio/web/sinal_jao_v2.jpg',
      featuredTrackId: auroraTrack?.id || 'sp-track-6PPB5jKQ257UqzP7tgmozP',
      featuredTrackTitle: 'Aurora',
    },
    {
      artistId: 'sp-artist-0nFdWpwl7h6fp3ADRyG14L',
      artistName: 'Marina Sena',
      artistImageUrl: SPOTIFY_ARTIST_MAP['0nFdWpwl7h6fp3ADRyG14L'].imageUrl,
      signTitle: 'Como fazer o sinal de Marina Sena em Libras',
      signDescription: 'Sinal criado em referência aos cachos característicos de Marina Sena, fazendo o movimento em espiral ao lado da cabeça.',
      videoUrl: '/assets/aistudio/web/sinal_marina_v2.mp4',
      posterUrl: '/assets/aistudio/web/sinal_marina_v2.jpg',
      featuredTrackId: santoTrack?.id || 'sp-track-6PETRfB5ssib6VqCAG6nIF',
      featuredTrackTitle: 'Santo',
    },
    {
      artistId: 'sp-artist-3CDoRporvSjdzTrm99a3gi',
      artistName: 'LUDMILLA',
      artistImageUrl: SPOTIFY_ARTIST_MAP['3CDoRporvSjdzTrm99a3gi'].imageUrl,
      signTitle: 'Como fazer o sinal de LUDMILLA em Libras',
      signDescription: 'Configuração da letra "L" posicionada na testa com movimento curto e firme para frente.',
      videoUrl: '/assets/aistudio/web/sinal_ludmilla_v2.mp4',
      posterUrl: '/assets/aistudio/web/sinal_ludmilla_v2.jpg',
      featuredTrackId: chegueiTrack?.id || 'sp-track-6cbZb9mVAc5s8HtwklLoI0',
      featuredTrackTitle: 'Cheguei',
    },
  ];

  const fanStories: FanStory[] = [
    {
      id: 'story-igor',
      name: 'Igor Bucioli',
      handle: '@igorbucioli',
      city: 'Brasil',
      role: 'Criador surdo · Comunidade Libras',
      videoUrl: '/assets/aistudio/Igor_Bucioli_video_no_watermark_6724fd99.mp4',
      posterUrl: '/assets/aistudio/web/story_igor.jpg',
      durationSec: 60,
      accentGradient: 'from-emerald-900 via-teal-950 to-neutral-900',
      initials: 'IB',
      quote: 'Quando voltei para a escola bilíngue com Libras, tudo ficou mais claro. A língua de sinais transforma a nossa forma de aprender e sentir.',
      captions: [
        { startSec: 0, text: '“Sou surdo. Quando estava na 2ª série em uma escola especial para surdos…”' },
        { startSec: 15, text: '“Na escola com ouvintes não tinha intérprete e eu ficava no modo silencioso.”' },
        { startSec: 36, text: '“Lá com Libras tudo ficou fácil. Foi um alívio poder me comunicar e aprender assim.”' },
      ],
      favoriteTrackId: auroraTrack?.id || 'sp-track-6PPB5jKQ257UqzP7tgmozP',
    },
    {
      id: 'story-tony',
      name: 'Tony Alves',
      handle: '@tonyalves_libras',
      city: 'Brasil',
      role: 'CODA · Filho ouvinte de pais surdos',
      videoUrl: '/assets/aistudio/tonyalves_libras_video_no_watermark_3a9d551e.mp4',
      posterUrl: '/assets/aistudio/web/story_tony.jpg',
      durationSec: 89,
      accentGradient: 'from-rose-950 via-stone-900 to-neutral-950',
      initials: 'TA',
      quote: 'Aprendi primeiro a língua de sinais e depois o português. Dentro de casa, a nossa comunicação sempre foi em Libras.',
      captions: [
        { startSec: 0, text: '“Eu aprendi primeiro a língua de sinais e depois o português. Sou filho ouvinte de pai e mãe surdos.”' },
        { startSec: 28, text: '“Com 4 ou 5 anos eu já me comunicava perfeitamente em Libras dentro de casa.”' },
        { startSec: 60, text: '“E se você quer aprender um pouquinho mais sobre a comunidade surda, vem com a gente.”' },
      ],
      favoriteTrackId: chegueiTrack?.id || 'sp-track-6cbZb9mVAc5s8HtwklLoI0',
    },
    {
      id: 'story-taina',
      name: 'Tainá Moser',
      handle: '@tainamoser',
      city: 'Brasil',
      role: 'Educadora e influenciadora em Libras',
      videoUrl: '/assets/aistudio/Taina_Moser_video_no_watermark_497a3229.mp4',
      posterUrl: '/assets/aistudio/web/story_taina.jpg',
      durationSec: 56,
      accentGradient: 'from-purple-950 via-neutral-900 to-black',
      initials: 'TM',
      quote: 'Se fala muito sobre inclusão, mas pouco sobre a inclusão real na vida das pessoas surdas. Bora aprender Libras?',
      captions: [
        { startSec: 0, text: '“Você já parou para pensar quantos surdos não conseguem se comunicar no dia a dia?”' },
        { startSec: 22, text: '“Já imaginou eu começar a sinalizar aqui sem falar nada? Se coloque no lugar do surdo.”' },
        { startSec: 40, text: '“Tenha empatia e bora aprender Libras!”' },
      ],
      favoriteTrackId: santoTrack?.id || 'sp-track-6PETRfB5ssib6VqCAG6nIF',
    },
    {
      id: 'story-bella',
      name: 'Isabella Bauer',
      handle: '@isabella.bauer',
      city: 'Brasil',
      role: 'Criadora surda · Música e Spotify',
      videoUrl: '/assets/aistudio/Bella_Bauer_video_no_watermark_61a848f8.mp4',
      posterUrl: '/assets/aistudio/web/story_bella.jpg',
      durationSec: 49,
      accentGradient: 'from-amber-950 via-stone-900 to-neutral-950',
      initials: 'BB',
      quote: 'Tem uma coisa muito legal do Spotify que é a letra passando enquanto a música está tocando — aí eu consigo acompanhar tudo.',
      captions: [
        { startSec: 0, text: '“Eu (surda) escuto música? Escuto, mas de um jeito novo e conectado ao visual.”' },
        { startSec: 20, text: '“No Spotify, acompanhar a letra passando em tempo real faz toda diferença.”' },
        { startSec: 36, text: '“Agora estou explorando cada vez mais músicas — e vocês também podem indicar suas favoritas!”' },
      ],
      favoriteTrackId: auroraTrack?.id || 'sp-track-6PPB5jKQ257UqzP7tgmozP',
    },
  ];

  return {
    featuredAlbums,
    artists,
    playlists,
    entreSinais: {
      librasClips,
      artistSigns,
      fanStories,
      accessibleTracks: [auroraTrack, santoTrack, chegueiTrack].filter(Boolean) as Track[],
    },
  };
}
