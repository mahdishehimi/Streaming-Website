import React, { useState, useEffect } from 'react';
import MediaCard from '../components/MediaCard';
import '../styles/home.css';
import HeroSlider from '../components/HeroSlider';
import '../styles/hero.css';
import api from '../api';
import MediaModal from '../components/MediaModal';

const HomePage = ({ favorites = [], onToggleFavorite }) => {
  const STEP = 10;
  const [movieCount, setMovieCount] = useState(STEP);
  const [tvCount, setTvCount] = useState(STEP);
  const [movies, setMovies] = useState([]);
  const [tvShows, setTvShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const raw = await api.fetchAllMedia();
        if (!mounted) return;
        const media = raw.map(m => ({
          ...m,
          image: m.image_path || m.image || '',
          year: m.release_year || m.year || null,
          rating: m.rating || m.vote_average || '',
        }));
        setMovies(media.filter(m => (m.type || '').toLowerCase() === 'movie'));
        setTvShows(media.filter(m => {
          const t = (m.type || '').toLowerCase();
          return t === 'tv' || t === 'show';
        }));
      } catch (err) {
        console.error('Home load error', err);
        if (!mounted) return;
        setError('Failed to load media');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  if (loading) return <div className="page">Loading...</div>;
  if (error) return <div className="page">{error}</div>;

  return (
    <div className="page">
      <HeroSlider media={[...movies.slice(0,3), ...tvShows.slice(0,3)]} />

      <section className="media-section">
        <h2>Trending Movies</h2>
        <div className="media-grid">
          {movies.slice(0, movieCount).map(movie => (
            <MediaCard
              key={movie.id}
              media={movie}
              onToggleFavorite={onToggleFavorite}
              onOpen={(m) => setSelected(m)}
              isFavorite={favorites.includes(movie.id)}
            />
          ))}
        </div>
        {movies.length > movieCount && (
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <button className="load-more" onClick={() => setMovieCount(c => c + STEP)}>
              Load more
            </button>
          </div>
        )}
      </section>

      <section className="media-section">
        <h2>Popular TV Shows</h2>
        <div className="media-grid">
          {tvShows.slice(0, tvCount).map(show => (
            <MediaCard
              key={show.id}
              media={show}
              onToggleFavorite={onToggleFavorite}
              onOpen={(m) => setSelected(m)}
              isFavorite={favorites.includes(show.id)}
            />
          ))}
        </div>
        {tvShows.length > tvCount && (
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <button className="load-more" onClick={() => setTvCount(c => c + STEP)}>
              Load more
            </button>
          </div>
        )}
      </section>
      {selected && (
        <MediaModal media={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
};

export default HomePage;


