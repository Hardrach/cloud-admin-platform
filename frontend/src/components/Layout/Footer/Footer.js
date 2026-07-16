import React, { useEffect, useState } from 'react';
import { getDashboard } from '../../../services/api';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [online, setOnline] = useState(true);

  // Poll connection status
  useEffect(() => {
    const checkStatus = async () => {
      try {
        await getDashboard();
        setOnline(true);
      } catch {
        setOnline(false);
      }
    };
    checkStatus();
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="footer-container">
      <div className="d-flex align-items-center gap-3">
        <span className="fw-semibold text-white">Cloud Admin Platform</span>
        <span className="text-secondary d-none d-sm-inline">|</span>
        <span className="d-none d-sm-inline">&copy; {currentYear} Enterprise Corp. All rights reserved.</span>
      </div>
      <div className="d-flex align-items-center gap-3">
        <div className="d-flex align-items-center gap-1.5 small text-secondary">
          <span className={`status-dot ${online ? 'online' : 'offline'}`} />
          <span className="small text-muted">{online ? 'Connected' : 'Offline'}</span>
        </div>
        <span className="badge bg-secondary text-dark fw-bold px-2 py-1" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
          VERSION 1.0
        </span>
      </div>
    </footer>
  );
};

export default Footer;
