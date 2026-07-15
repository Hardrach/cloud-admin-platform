import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer-container">
      <div className="d-flex align-items-center gap-3">
        <span className="fw-semibold text-white">Cloud Admin Platform</span>
        <span className="text-secondary d-none d-sm-inline">|</span>
        <span className="d-none d-sm-inline">&copy; {currentYear} Enterprise Corp. All rights reserved.</span>
      </div>
      <div>
        <span className="badge bg-secondary text-dark fw-bold px-2 py-1" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
          VERSION 1.0
        </span>
      </div>
    </footer>
  );
};

export default Footer;
