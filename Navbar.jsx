
import React, { useState } from "react";
import { Search, Film } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Navbar.css";

const Navbar = ({ isLoggedIn, onLogout }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

 
  const handleSearch = () => {
    if (searchQuery.trim() !== "") {
      navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
      setSearchQuery(""); 
    }
  };

  
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault(); 
      handleSearch();
    }
  };

  return (
    <nav className="navbar">
      <div className="nav-container container">
        {/* Logo */}
        <div className="logo">
          <Link to="/" className="logo-link">
            <Film size={32} />
            <span className="brand">StreamFlix</span>
          </Link>
        </div>

        {/* Navigation Menu */}
        <ul className="nav-menu">
          <li>
            <Link to="/" className="nav-link">
              Home
            </Link>
          </li>
          <li>
            <Link to="/movies" className="nav-link">
              Movies
            </Link>
          </li>
          <li>
            <Link to="/tvshows" className="nav-link">
              TV Shows
            </Link>
          </li>
          <li>
            <Link to="/favorites" className="nav-link">
              Favorites
            </Link>
          </li>
        </ul>

        {/* Search Bar and Login/Logout */}
        <div className="nav-right">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search movies, TV shows..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button onClick={handleSearch}>
              <Search size={20} />
            </button>
          </div>

          {isLoggedIn ? (
            <button className="logout-btn" onClick={onLogout}>
              Logout
            </button>
          ) : (
            <Link className="signin-btn" to="/login">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
