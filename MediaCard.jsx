import React from 'react';
import { Heart } from 'lucide-react';
import '../styles/MediaCard.css';

const MediaCard = ({ media, onToggleFavorite, isFavorite, onOpen }) => {
  const rating = media && media.rating !== undefined && media.rating !== null && media.rating !== ''
    ? Number(media.rating).toFixed(1)
    : '';

  return (
    <div className="media-card" onClick={() => onOpen && onOpen(media)}>
      <div className="card-image">
        <img src={media.image} alt={media.title} />
        <div className="card-overlay">
          <button
            className={`favorite-btn ${isFavorite ? 'active' : ''}`}
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(media.id); }}
            aria-pressed={isFavorite}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <span className={`favorite-icon ${isFavorite ? 'filled' : ''}`}>
              <Heart size={20} strokeWidth={2.5} />
            </span>
          </button>
          <div className="card-info">
            <h3>{media.title}</h3>
            <p>{media.year} • {rating}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaCard;
