import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

function Navbar({ onSearch, onShowLogin, onShowRegister }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <h2>Manga Shelf</h2>
      </div>
      <div className="navbar-search">
        <form onSubmit={handleSubmit} className="search-form">
          <input 
            type="text" 
            className="form-control" 
            placeholder="Search for manga titles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            required
          />
          <button type="submit" className="btn btn--primary">Search</button>
        </form>
      </div>
      <div className="navbar-auth">
        {isAuthenticated ? (
          <div className="user-menu">
            <button 
              className="user-button" 
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <div className="user-avatar">
                {user?.username?.[0]?.toUpperCase()}
              </div>
              <span>{user?.username}</span>
            </button>
            {showDropdown && (
              <div className="dropdown-menu">
                <button onClick={() => setShowDropdown(false)}>
                  👤 Profile
                </button>
                <button onClick={handleLogout} className="logout-btn">
                  🚪 Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="auth-buttons">
            <button onClick={onShowLogin} className="btn btn--secondary">
              Login
            </button>
            <button onClick={onShowRegister} className="btn btn--primary">
              Register
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;