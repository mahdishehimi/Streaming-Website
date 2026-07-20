import React, { useEffect, useState } from 'react';
import MediaCard from '../components/MediaCard';
import '../styles/movies.css';
import api from '../api';
import MediaModal from '../components/MediaModal';

const MoviesPage = ({ favorites = [], onToggleFavorite }) => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const raw = await api.fetchMediaByType('movie');
        if (!mounted) return;
        const media = raw.map(m => ({
          ...m,
          image: m.image_path || m.image || '',
          year: m.release_year || m.year || null,
          rating: m.rating || m.vote_average || '',
        }));
        setMovies(media);
      } catch (err) {
        console.error('Movies load error', err);
        if (!mounted) return;
        setError('Failed to load movies');
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
      <div className="page-header">
        <h1>Movies</h1>
        <p>Explore our collection of movies</p>
      </div>
      <div className="media-grid">
        {movies.map(movie => (
          <MediaCard
            key={movie.id}
            media={movie}
            onToggleFavorite={onToggleFavorite}
            onOpen={(m) => setSelected(m)}
            isFavorite={favorites.includes(movie.id)}
          />
        ))}
      </div>
      {selected && <MediaModal media={selected} onClose={() => setSelected(null)} />}
    </div>
  );
};

export default MoviesPage;
