import React, { useEffect, useState } from 'react';
import '../styles/Toast.css';

function Toast({ isVisible, message }) {
  const [show, setShow] = useState(isVisible);

  useEffect(() => {
    setShow(isVisible);
    if (isVisible) {
      const timer = setTimeout(() => {
        setShow(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  if (!show) return null;

  return (
    <div className="toast">
      <p className="toast-message">{message || '처리 중입니다...'}</p>
    </div>
  );
}

export default Toast;
