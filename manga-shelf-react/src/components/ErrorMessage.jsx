import React from 'react';

function ErrorMessage({ message, onClose }) {
  return (
    <div className="error-message">
      <div className="status status--error">
        <span>{message}</span>
        {onClose && (
          <button className="close-btn" onClick={onClose}>×</button>
        )}
      </div>
    </div>
  );
}

export default ErrorMessage;
