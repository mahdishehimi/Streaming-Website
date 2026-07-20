const axios = require('axios');
const db = require('./db');
const TMDB_API_KEY = process.env.API_KEY;

function parseArgs() {
  let pages = 5;
  const args = process.argv.slice(2);
  args.forEach(arg => {
    if (arg.startsWith('--pages=')) pages = parseInt(arg.split('=')[1], 10) || pages;
    else if (!isNaN(parseInt(arg))) pages = parseInt(arg);
  });
  pages = Math.max(1, Math.min(20, pages));
  return { pages };
}

async function fetchAndInsertMovies(pages) {
  console.log(`Seeding movies — pages: ${pages}`);
  for (let p = 1; p <= pages; p++) {
    const url = `https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}&language=en-US&page=${p}`;
    try {
      const res = await axios.get(url);
      const items = res.data.results || [];
      if (!items.length) {
        console.log(`  No movies on page ${p}`);
        continue;
      }

      const placeholders = [];
      const params = [];
      for (const movie of items) {
        const title = movie.title || movie.original_title;
        const rating = movie.vote_average || null;
        const year = movie.release_date ? parseInt(movie.release_date.slice(0, 4), 10) : null;
        const image = movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null;
        const description = movie.overview || '';
        const trailer_key = '';

        placeholders.push('(?, ?, ?, ?, ?, ?, ?)');
        params.push(title, 'movie', rating, year, image, description, trailer_key);
      }

      const sql = `INSERT INTO media (title, type, rating, release_year, image_path, description, trailer_key) VALUES ${placeholders.join(',')}`;
      await new Promise((resolve, reject) => {
        db.query(sql, params, (err) => {
          if (err) {
            console.log('Movie page insert error:', err.message);
            return reject(err);
          }
          resolve();
        });
      });

      console.log(`  Inserted page ${p} (${items.length} items)`);
    } catch (err) {
      console.error('Failed fetching movies page', p, err.message);
    }
  }
}

async function fetchAndInsertTV(pages) {
  console.log(`Seeding TV shows — pages: ${pages}`);
  for (let p = 1; p <= pages; p++) {
    const url = `https://api.themoviedb.org/3/tv/popular?api_key=${TMDB_API_KEY}&language=en-US&page=${p}`;
    try {
      const res = await axios.get(url);
      const items = res.data.results || [];
      if (!items.length) {
        console.log(`  No TV shows on page ${p}`);
        continue;
      }

      const placeholders = [];
      const params = [];
      for (const tv of items) {
        const title = tv.name || tv.original_name;
        const rating = tv.vote_average || null;
        const year = tv.first_air_date ? parseInt(tv.first_air_date.slice(0, 4), 10) : null;
        const image = tv.poster_path ? `https://image.tmdb.org/t/p/w500${tv.poster_path}` : null;
        const description = tv.overview || '';
        const trailer_key = '';

        placeholders.push('(?, ?, ?, ?, ?, ?, ?)');
        params.push(title, 'show', rating, year, image, description, trailer_key);
      }

      const sql = `INSERT INTO media (title, type, rating, release_year, image_path, description, trailer_key) VALUES ${placeholders.join(',')}`;
      await new Promise((resolve, reject) => {
        db.query(sql, params, (err) => {
          if (err) {
            console.log('TV page insert error:', err.message);
            return reject(err);
          }
          resolve();
        });
      });

      console.log(`  Inserted page ${p} (${items.length} items)`);
    } catch (err) {
      console.error('Failed fetching TV page', p, err.message);
    }
  }
}

async function main() {
  const { pages } = parseArgs();

  console.log('Starting seed script');
  // clear existing media rows
  await new Promise((resolve, reject) => {
    db.query('DELETE FROM media', (err) => {
      if (err) return reject(err);
      // reset auto increment
      db.query('ALTER TABLE media AUTO_INCREMENT = 1', (e) => { if (e) console.log('Failed to reset AUTO_INCREMENT', e.message); resolve(); });
    });
  });

  await fetchAndInsertMovies(pages);
  await fetchAndInsertTV(pages);

  // give some time for pending inserts to finish
  setTimeout(() => {
    console.log('Seeding finished. You can run the server and open the frontend.');
    process.exit(0);
  }, 1000);
}

main().catch(err => {
  console.error('Seed script failed', err);
  process.exit(1);
});
