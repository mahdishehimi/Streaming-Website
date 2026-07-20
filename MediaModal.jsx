import React from 'react';
import '../styles/MediaModal.css';

function getYouTubeEmbed(urlOrKey) {
  if (!urlOrKey) return null;
  try {
   
    const u = new URL(urlOrKey);
    if (u.hostname.includes('youtube.com')) {
      return `https://www.youtube.com/embed/${new URLSearchParams(u.search).get('v')}`;
    }
    if (u.hostname.includes('youtu.be')) {
      return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
    }
  } catch (e) {
    return `https://www.youtube.com/embed/${urlOrKey}`;
  }
  return urlOrKey;
}

const MediaModal = ({ media, onClose }) => {
  if (!media) return null;
  const embed = getYouTubeEmbed(media.trailer || media.trailer_url || media.trailer_key);

  return (
    <div className="media-modal-backdrop" onClick={onClose}>
      <div className="media-modal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
        <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
        <div className="modal-body">
          <div className="modal-left">
            <img src={media.image} alt={media.title} />
          </div>
          <div className="modal-right">
            <h2>{media.title}</h2>
            <p className="meta">{media.year} {media.rating ? `• ${Number(media.rating).toFixed(1)}` : ''}</p>
            {media.description && <p className="description">{media.description}</p>}
            {embed ? (
              <div className="trailer">
                <iframe
                  title={`trailer-${media.id}`}
                  src={embed}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="no-trailer">No trailer available</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaModal;
