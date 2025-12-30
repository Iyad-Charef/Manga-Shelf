import React from 'react';

function SuccessMessage({ message }) {
  return (
    <div className="success-message">
      <div className="status status--success">
        <span>{message}</span>
      </div>
    </div>
  );
}

export default SuccessMessage;
