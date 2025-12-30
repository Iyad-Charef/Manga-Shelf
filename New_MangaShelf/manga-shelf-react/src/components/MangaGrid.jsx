import React from 'react';
import MangaCard from './MangaCard';

function MangaGrid({ manga, viewType, onAddToLibrary, onRemoveFromLibrary, emptyMessage }) {
  if (!manga || manga.length === 0) {
    return (
      <div className="no-results">
        <h3>{emptyMessage}</h3>
      </div>
    );
  }

  return (
    <div className="manga-grid">
      {manga.map((item) => (
        <MangaCard 
          key={item.externalId || item._id || item.id}
          manga={item}
          viewType={viewType}
          onAddToLibrary={onAddToLibrary}
          onRemoveFromLibrary={onRemoveFromLibrary}
        />
      ))}
    </div>
  );
}

export default MangaGrid;
