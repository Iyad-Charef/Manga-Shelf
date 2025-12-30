import React from 'react';

function MangaCard({ manga, viewType, onAddToLibrary, onRemoveFromLibrary }) {
  // Extract title
  const getTitle = () => {
    if (manga.title && typeof manga.title === 'object') {
      return manga.title['en'] || Object.values(manga.title) || 'Untitled';
    }
    return manga.title || 'Untitled';
  };

  // Extract description
  const getDescription = () => {
    if (manga.description && typeof manga.description === 'object') {
      return manga.description['en'] || Object.values(manga.description) || '';
    }
    return manga.description || '';
  };

  const title = getTitle();
  const description = getDescription();
  const genres = Array.isArray(manga.genres) ? manga.genres : [];
  const author = manga.author || 'Unknown';

  const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '…';
  };

  return (
    <div className="manga-card">
      {manga.coverImage && (
        <img 
          src={manga.coverImage} 
          alt={title}
          className="manga-cover"
        />
      )}
      
      <div className="manga-title">{title}</div>
      <div className="manga-author">
        By <span className="text-muted">{author}</span>
      </div>
      
      <div className="manga-description">
        {truncateText(description, 300)}
      </div>
      
      {genres.length > 0 && (
        <div className="manga-genres">
          {genres.map((tag, index) => (
            <span key={index} className="genre-tag">{tag}</span>
          ))}
        </div>
      )}
      
      <div className="manga-actions">
        {viewType === 'search' ? (
          <>
            <button 
              className="btn btn--primary btn-save"
              onClick={() => onAddToLibrary(manga, 'liked')}
            >
              Like
            </button>
            <button 
              className="btn btn--secondary btn-save"
              onClick={() => onAddToLibrary(manga, 'read')}
            >
              Read
            </button>
          </>
        ) : (
          <>
            <span className={`status-badge status-badge--${manga.status}`}>
              {manga.status}
            </span>
            <button 
              className="btn btn--danger btn--small"
              onClick={() => onRemoveFromLibrary(manga._id || manga.id)}
            >
              Remove
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default MangaCard;