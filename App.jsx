import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './App.css';
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomePage from "./pages/Home";
import MoviesPage from "./pages/Movies";
import TVShowsPage from "./pages/TVShows";
import FavoritesPage from "./pages/Favorites";
import LoginPage from "./pages/login";
import SearchResultsPage from "./pages/searchResult";
import api from './api';

const App = () => {
  const [favorites, setFavorites] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  

  const handleLogin = (userData) => {
    // derive user id from token if present
    const token = localStorage.getItem('token');
    const payload = api.decodeJwt(token);
    if (payload && payload.id) {
      setUser({ id: payload.id, ...userData });
    } else {
      setUser(userData);
    }
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem('token');
    setFavorites([]);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) setIsLoggedIn(true);
  }, []);


  // Load favorites when user logs in
  useEffect(() => {
    let mounted = true;
    async function loadFavorites() {
      try {
        const token = localStorage.getItem('token');
        const payload = api.decodeJwt(token);
        if (!payload || !payload.id) return;
        const favs = await api.getFavorites(payload.id);
        if (!mounted) return;
        setFavorites(favs.map(f => f.id));
        setUser(prev => ({ ...(prev || {}), id: payload.id }));
      } catch (err) {
        console.error('Failed to load favorites', err);
      }
    }
    if (isLoggedIn) loadFavorites();
    return () => { mounted = false; };
  }, [isLoggedIn]);

  const handleToggleFavorite = (id) => {
    // If not logged in, toggle locally
    const token = localStorage.getItem('token');
    const payload = api.decodeJwt(token);
    if (!payload || !payload.id) {
      setFavorites(prev => (prev.includes(id) ? prev.filter(fav => fav !== id) : [...prev, id]));
      return;
    }

    const userId = payload.id;

    // optimistic update
    setFavorites(prev => (prev.includes(id) ? prev.filter(fav => fav !== id) : [...prev, id]));

    (async () => {
      try {
        if (favorites.includes(id)) {
          await api.removeFavorite(userId, id);
        } else {
          await api.addFavorite(userId, id);
        }
      } catch (err) {
        // revert on error
        setFavorites(prev => (prev.includes(id) ? prev.filter(fav => fav !== id) : [...prev, id]));
        console.error('Favorite toggle failed', err);
      }
    })();
  };

  return (
          <Router>
            <div className="app">
            <Navbar isLoggedIn={isLoggedIn} onLogout={handleLogout} />
           <main className="main-content">
            <Routes>
                 <Route
                  path="/"
                  element={
                    <HomePage
                      favorites={favorites}
                      onToggleFavorite={handleToggleFavorite}
                       />
                     }
                   />
                 <Route
                   path="/movies"
                  element={
                <MoviesPage
                  favorites={favorites}
                  onToggleFavorite={handleToggleFavorite}
                    />
                }
                 />
                    <Route
                   path="/tvshows"
                  element={
                   <TVShowsPage
                  favorites={favorites}
                    onToggleFavorite={handleToggleFavorite}
                    />
                  }
                />
                   <Route
                  path="/favorites"
                    element={
                <FavoritesPage
                  favorites={favorites}
                  onToggleFavorite={handleToggleFavorite}
                  />
                }
                 />
                 <Route
               path="/login"
               element={<LoginPage onLogin={handleLogin} />}
            />
            {/* Search page using query string */}
                   <Route
                   path="/search"
                 element={
                <SearchResultsPage
                  favorites={favorites}
                   onToggleFavorite={handleToggleFavorite}
                />
                }
                />
                </Routes>
              </main>
             <Footer />
           </div>
        </Router>
      );
        };

export default App;