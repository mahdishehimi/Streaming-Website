const express = require('express');
const router = express.Router();
const axios = require('axios');
const db = require('../db');

const TMDB_API_KEY = process.env.API_KEY;

// Get all media or filtered by type
router.get('/', (req, res) => {
  const type = req.query.type;
  let query = 'SELECT * FROM media';
  const params = [];

  if(type) {
    query += ' WHERE type = ?';
    params.push(type);
  }

  db.query(query, params, (err, results) => {
    if(err) return res.status(500).json(err);
    res.json(results);
  });
});

// Fetch popular movies from TMDB and insert into DB (supports ?pages=n)
router.get('/fetch-movies', async (req, res) => {
  const pages = Math.max(1, Math.min(20, parseInt(req.query.pages) || 1));
  try {
    for (let p = 1; p <= pages; p++) {
      const response = await axios.get(
        `https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}&language=en-US&page=${p}`
      );
      const movies = response.data.results || [];

      movies.forEach(movie => {
        const { title, vote_average, release_date, poster_path } = movie;
        const year = release_date ? parseInt(release_date.slice(0, 4)) : null;
        db.query(
          'INSERT INTO media (title, type, rating, release_year, image_path) VALUES (?, ?, ?, ?, ?)',
          [title, 'movie', vote_average, year, poster_path ? `https://image.tmdb.org/t/p/w500${poster_path}` : null],
          (err) => { if(err) console.log(err); }
        );
      });
    }

    res.json({ message: `Movies added successfully (${pages} page(s))` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fetch popular TV shows from TMDB and insert into DB (supports ?pages=n)
router.get('/fetch-tv', async (req, res) => {
  const pages = Math.max(1, Math.min(20, parseInt(req.query.pages) || 1));
  try {
    for (let p = 1; p <= pages; p++) {
      const response = await axios.get(
        `https://api.themoviedb.org/3/tv/popular?api_key=${TMDB_API_KEY}&language=en-US&page=${p}`
      );
      const tvShows = response.data.results || [];

      tvShows.forEach(tv => {
        const { name, vote_average, first_air_date, poster_path } = tv;
        const year = first_air_date ? parseInt(first_air_date.slice(0, 4)) : null;
        db.query(
          'INSERT INTO media (title, type, rating, release_year, image_path) VALUES (?, ?, ?, ?, ?)',
          [name, 'show', vote_average, year, poster_path ? `https://image.tmdb.org/t/p/w500${poster_path}` : null],
          (err) => { if(err) console.log(err); }
        );
      });
    }

    res.json({ message: `TV shows added successfully (${pages} page(s))` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fetch detailed info (overview + trailer) from TMDB for a specific local media id
// Expects JSON body: { id: <local_media_id> }
router.post('/fetch-details', async (req, res) => {
  const { id } = req.body || {};
  if (!id) return res.status(400).json({ error: 'Missing media id' });

  db.query('SELECT * FROM media WHERE id = ?', [id], async (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!rows || rows.length === 0) return res.status(404).json({ error: 'Media not found' });

    const media = rows[0];
    const title = media.title;
    const type = (media.type || 'movie').toLowerCase();

    try {
      // Search TMDB for matching title
      const searchPath = type === 'show' || type === 'tv' ? 'search/tv' : 'search/movie';
      const searchRes = await axios.get(`https://api.themoviedb.org/3/${searchPath}`, {
        params: { api_key: TMDB_API_KEY, query: title, language: 'en-US' }
      });
      const results = searchRes.data.results || [];
      if (!results.length) return res.status(404).json({ error: 'No TMDB match found' });

      const tmdbId = results[0].id;
      const detailPath = type === 'show' || type === 'tv' ? `tv/${tmdbId}` : `movie/${tmdbId}`;
      const detailRes = await axios.get(`https://api.themoviedb.org/3/${detailPath}`, {
        params: { api_key: TMDB_API_KEY, append_to_response: 'videos', language: 'en-US' }
      });

      const detail = detailRes.data || {};
      const description = detail.overview || media.description || null;

      // find a youtube trailer
      let trailerUrl = media.trailer_key || media.trailer || null;
      const videos = (detail.videos && detail.videos.results) || [];
      const yt = videos.find(v => v.site === 'YouTube' && v.type === 'Trailer') || videos.find(v => v.site === 'YouTube');
      if (yt && yt.key) trailerUrl = `https://www.youtube.com/watch?v=${yt.key}`;

      // store trailer_key (YouTube full URL) and description
      db.query('UPDATE media SET description = ?, trailer_key = ? WHERE id = ?', [description, trailerUrl, id], (uerr) => {
        if (uerr) return res.status(500).json({ error: uerr.message });
        // return updated row
        db.query('SELECT * FROM media WHERE id = ?', [id], (qerr, updatedRows) => {
          if (qerr) return res.status(500).json({ error: qerr.message });
          res.json({ message: 'Updated', media: updatedRows[0] });
        });
      });
    } catch (e) {
      console.error('Failed to fetch details', e.message || e);
      res.status(500).json({ error: e.message || 'Failed to fetch TMDB details' });
    }
  });
});

      // Bulk fetch details for all media rows missing description or trailer
      router.post('/fetch-details-all', async (req, res) => {
        try {
          db.query("SELECT * FROM media WHERE (description IS NULL OR description = '') OR (trailer_key IS NULL OR trailer_key = '')", async (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!rows || rows.length === 0) return res.json({ message: 'No media require details' });

            const results = [];
            for (const media of rows) {
              try {
                const title = media.title;
                const type = (media.type || 'movie').toLowerCase();
                const searchPath = type === 'show' || type === 'tv' ? 'search/tv' : 'search/movie';
                const searchRes = await axios.get(`https://api.themoviedb.org/3/${searchPath}`, {
                  params: { api_key: TMDB_API_KEY, query: title, language: 'en-US' }
                });
                const resultsList = searchRes.data.results || [];
                if (!resultsList.length) {
                  results.push({ id: media.id, updated: false, reason: 'no_match' });
                  continue;
                }

                const tmdbId = resultsList[0].id;
                const detailPath = type === 'show' || type === 'tv' ? `tv/${tmdbId}` : `movie/${tmdbId}`;
                const detailRes = await axios.get(`https://api.themoviedb.org/3/${detailPath}`, {
                  params: { api_key: TMDB_API_KEY, append_to_response: 'videos', language: 'en-US' }
                });
                const detail = detailRes.data || {};
                const description = detail.overview || media.description || null;
                const videos = (detail.videos && detail.videos.results) || [];
                const yt = videos.find(v => v.site === 'YouTube' && v.type === 'Trailer') || videos.find(v => v.site === 'YouTube');
                const trailerUrl = yt && yt.key ? `https://www.youtube.com/watch?v=${yt.key}` : (media.trailer_key || media.trailer || null);

                await new Promise((resolve, reject) => {
                  db.query('UPDATE media SET description = ?, trailer_key = ? WHERE id = ?', [description, trailerUrl, media.id], (uerr) => {
                    if (uerr) return reject(uerr);
                    resolve();
                  });
                });

                results.push({ id: media.id, updated: true });
              } catch (e) {
                console.error('Bulk update error for', media.id, e.message || e);
                results.push({ id: media.id, updated: false, reason: e.message || 'error' });
              }
            }

            res.json({ message: 'Bulk update completed', summary: results });
          });
        } catch (e) {
          res.status(500).json({ error: e.message || 'Bulk update failed' });
        }
      });

module.exports = router;
