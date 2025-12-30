import React from 'react';

function Sidebar({ currentView, onViewChange }) {
  const views = [
    { id: 'home', icon: '🏠', label: 'Home' },
    { id: 'read', icon: '📖', label: 'Read Library' },
    { id: 'liked', icon: '❤️', label: 'Liked Library' }
  ];

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {views.map(view => (
          <button 
            key={view.id}
            className={`nav-btn ${currentView === view.id ? 'active' : ''}`}
            onClick={() => onViewChange(view.id)}
          >
            <span>{view.icon}</span> {view.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
