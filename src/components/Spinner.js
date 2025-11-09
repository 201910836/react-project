import React from 'react';
import '../styles/Spinner.css';

function Spinner({ isVisible, message }) {
  if (!isVisible) return null;

  return (
    <div className="spinner-overlay">
      <div className="spinner-container">
        <div className="spinner"></div>
        <p className="spinner-message">{message || '로딩 중...'}</p>
      </div>
    </div>
  );
}

export default Spinner;
