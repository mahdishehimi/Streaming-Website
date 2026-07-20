import React, { useEffect, useState } from 'react';
import MediaCard from '../components/MediaCard';
import '../styles/tvShow.css';
import api from '../api';
import MediaModal from '../components/MediaModal';

const TVShowsPage = ({ favorites = [], onToggleFavorite }) => {
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
        // backend stores shows as type 'show'
        const raw = await api.fetchMediaByType('show');
        if (!mounted) return;
        const media = raw.map(m => ({
          ...m,
          image: m.image_path || m.image || '',
          year: m.release_year || m.year || null,
          rating: m.rating || m.vote_average || '',
        }));
        setTvShows(media);
      } catch (err) {
        console.error('TV load error', err);
        if (!mounted) return;
        setError('Failed to load TV shows');
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
        <h1>TV Shows</h1>
        <p>Discover amazing TV series</p>
      </div>
      <div className="media-grid">
        {tvShows.map(show => (
          <MediaCard
            key={show.id}
            media={show}
            onToggleFavorite={onToggleFavorite}
            onOpen={(m) => setSelected(m)}
            isFavorite={favorites.includes(show.id)}
          />
        ))}
      </div>
      {selected && <MediaModal media={selected} onClose={() => setSelected(null)} />}
    </div>
  );
};

export default TVShowsPage;
