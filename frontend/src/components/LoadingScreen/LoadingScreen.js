import React from 'react';
import { Cloud } from 'lucide-react';
import './LoadingScreen.css';

export const LoadingScreen = ({ message = 'Loading Cloud Admin Platform...' }) => {
  return (
    <div className="loading-screen-wrapper">
      <div className="loading-screen-card">
        <div className="loading-brand-logo">
          <Cloud className="loading-cloud-icon" size={48} />
        </div>
        <h2 className="loading-brand-title">CloudAdmin</h2>
        <div className="loading-indicator">
          <div className="loading-bar-fill" />
        </div>
        <p className="loading-screen-message">{message}</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
