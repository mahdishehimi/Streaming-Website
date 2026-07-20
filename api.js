const API_BASE = 'http://localhost:5000';

function decodeJwt(token) {
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(payload)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(json);
  } catch (e) {
    return null;
  }
}

async function fetchAllMedia() {
  const res = await fetch(`${API_BASE}/media`);
  if (!res.ok) throw new Error('Failed to fetch media');
  return res.json();
}

async function fetchMediaByType(type) {
  const res = await fetch(`${API_BASE}/media?type=${encodeURIComponent(type)}`);
  if (!res.ok) throw new Error('Failed to fetch media by type');
  return res.json();
}

async function getFavorites(userId) {
  const res = await fetch(`${API_BASE}/favorites/${userId}`);
  if (!res.ok) throw new Error('Failed to fetch favorites');
  return res.json();
}

async function addFavorite(userId, mediaId) {
  const res = await fetch(`${API_BASE}/favorites`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, media_id: mediaId }),
  });
  if (!res.ok) throw new Error('Failed to add favorite');
  return res.json();
}

async function removeFavorite(userId, mediaId) {
  const res = await fetch(`${API_BASE}/favorites`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, media_id: mediaId }),
  });
  if (!res.ok) throw new Error('Failed to remove favorite');
  return res.json();
}

// Seed TMDB data into the backend DB
async function fetchMoviesFromTMDB() {
  const res = await fetch(`${API_BASE}/media/fetch-movies`);
  if (!res.ok) throw new Error('Failed to fetch movies from TMDB');
  return res.json();
}

async function fetchTVFromTMDB() {
  const res = await fetch(`${API_BASE}/media/fetch-tv`);
  if (!res.ok) throw new Error('Failed to fetch TV shows from TMDB');
  return res.json();
}

export default {
  fetchAllMedia,
  fetchMediaByType,
  getFavorites,
  addFavorite,
  removeFavorite,
  fetchMoviesFromTMDB,
  fetchTVFromTMDB,
  decodeJwt,
};
