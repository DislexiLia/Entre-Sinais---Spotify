import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  getAlbumById,
  getArtistById,
  getHomeData,
  getPlaylistById,
  refreshTrackPreview,
  searchCatalog,
} from './server/catalog.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.get('/api/home', async (_req, res) => {
    try {
      const data = await getHomeData();
      res.json(data);
    } catch (error) {
      console.error('/api/home error:', error);
      res.status(500).json({ error: 'Falha ao carregar catálogo inicial.' });
    }
  });

  app.get('/api/search', async (req, res) => {
    try {
      const q = String(req.query.q || '');
      const type = String(req.query.type || 'all');
      const results = await searchCatalog(q, type);
      res.json(results);
    } catch (error) {
      console.error('/api/search error:', error);
      res.status(500).json({ error: 'Erro ao realizar busca musical.' });
    }
  });

  app.get('/api/artist/:id', async (req, res) => {
    try {
      const artist = await getArtistById(req.params.id);
      if (!artist) {
        res.status(404).json({ error: 'Artista não encontrado.' });
        return;
      }
      res.json(artist);
    } catch (error) {
      console.error('/api/artist error:', error);
      res.status(500).json({ error: 'Erro ao carregar perfil do artista.' });
    }
  });

  app.get('/api/album/:id', async (req, res) => {
    try {
      const album = await getAlbumById(req.params.id);
      if (!album) {
        res.status(404).json({ error: 'Álbum não encontrado.' });
        return;
      }
      res.json(album);
    } catch (error) {
      console.error('/api/album error:', error);
      res.status(500).json({ error: 'Erro ao carregar álbum.' });
    }
  });

  app.get('/api/playlist/:id', async (req, res) => {
    try {
      const playlist = await getPlaylistById(req.params.id);
      if (!playlist) {
        res.status(404).json({ error: 'Playlist não encontrada.' });
        return;
      }
      res.json(playlist);
    } catch (error) {
      console.error('/api/playlist error:', error);
      res.status(500).json({ error: 'Erro ao carregar playlist.' });
    }
  });

  app.get('/api/track/preview', async (req, res) => {
    try {
      const id = String(req.query.id || '');
      const title = req.query.title ? String(req.query.title) : undefined;
      const artist = req.query.artist ? String(req.query.artist) : undefined;
      const previewUrl = await refreshTrackPreview(id, title, artist);
      res.json({ previewUrl });
    } catch (error) {
      console.error('/api/track/preview error:', error);
      res.status(500).json({ previewUrl: null });
    }
  });

  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Spotify · Entre Sinais server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
