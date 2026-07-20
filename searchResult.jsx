import React, { useEffect, useState } from "react";
import MediaCard from "../components/MediaCard";
import { Search } from "lucide-react";
import { useLocation } from "react-router-dom";
import "../styles/searchResult.css";
import api from '../api';
import MediaModal from '../components/MediaModal';

const SearchResultsPage = ({ favorites = [], onToggleFavorite }) => {
  // Get the search query from URL
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get("query") || "";

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
        console.error('Search load error', err);
        if (!mounted) return;
        setError('Failed to load search results');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [searchQuery]);

  if (loading) return <div className="page">Loading...</div>;
  if (error) return <div className="page">{error}</div>;

  // Filter media based on search query
  const searchResults = allMedia.filter(media =>
    media.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="page">
      <div className="page-header">
        <h1>Search Results</h1>
        <p>Results for "{searchQuery}"</p>
      </div>

      {searchResults.length === 0 ? (
        <div className="empty-state">
          <Search size={64} />
          <p>No results found for "{searchQuery}"</p>
          <p style={{ fontSize: "14px", marginTop: "10px" }}>
            Try searching for different keywords
          </p>
        </div>
      ) : (
        <div className="media-grid">
          {searchResults.map(media => (
            <MediaCard
              key={media.id}
              media={media}
              onToggleFavorite={onToggleFavorite}
              onOpen={(m) => setSelected(m)}
              isFavorite={favorites.includes(media.id)}
            />
          ))}
        </div>
      )}
      {selected && <MediaModal media={selected} onClose={() => setSelected(null)} />}
    </div>
  );
};

export default SearchResultsPage;
