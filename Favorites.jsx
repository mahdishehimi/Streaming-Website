import React, { useEffect, useState } from 'react';
import MediaCard from '../components/MediaCard';
import { Heart } from 'lucide-react';
import '../styles/Favorites.css';
import api from '../api';
import MediaModal from '../components/MediaModal';

const FavoritesPage = ({ favorites = [], onToggleFavorite }) => {
  const [allMedia, setAllMedia] = useState([]);
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
        setAllMedia(media);
      } catch (err) {
        console.error('Favorites load error', err);
        if (!mounted) return;
        setError('Failed to load favorites');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  if (loading) return <div className="page">Loading...</div>;
  if (error) return <div className="page">{error}</div>;

  const favoriteMedia = allMedia.filter(media => favorites.includes(media.id));

  return (
    <div className="page">
      <div className="page-header">
        <h1>My Favorites</h1>
        <p>Your liked movies and TV shows</p>
      </div>
      {favoriteMedia.length === 0 ? (
        <div className="empty-state">
          <Heart size={64} />
          <p>No favorites yet. Start adding movies and shows you love!</p>
        </div>
      ) : (
        <div className="media-grid">
          {favoriteMedia.map(media => (
            <MediaCard
              key={media.id}
              media={media}
              onToggleFavorite={onToggleFavorite}
              onOpen={(m) => setSelected(m)}
              isFavorite={true}
            />
          ))}
        </div>
      )}
      {selected && <MediaModal media={selected} onClose={() => setSelected(null)} />}
    </div>
  );
};

export default FavoritesPage;

