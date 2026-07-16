import React, { useState } from 'react';
import './Settings.css';
import {
  Settings as SettingsIcon,
  Monitor,
  Server,
  Info,
  Globe
} from 'lucide-react';

const Settings = ({ isLightTheme, toggleGlobalTheme }) => {
  const [settings, setSettings] = useState({
    platformName: 'Cloud Admin Platform',
    organization: 'Enterprise Corp.',
    timezone: 'Europe/Paris (UTC+1)',
    language: 'English',
    refreshInterval: '30 seconds',
    darkMode: !isLightTheme,
    lightMode: isLightTheme,
    accentColor: '#00D4FF',
  });

  React.useEffect(() => {
    setSettings(prev => ({
      ...prev,
      darkMode: !isLightTheme,
      lightMode: isLightTheme
    }));
  }, [isLightTheme]);

  const handleThemeChange = (mode) => {
    if (mode === 'light' && !isLightTheme) {
      toggleGlobalTheme();
    } else if (mode === 'dark' && isLightTheme) {
      toggleGlobalTheme();
    }
  };

  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  return (
    <div className="settings-container">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Platform configuration, appearance preferences, and system parameters</p>
      </div>

      <div className="row g-4">
        <div className="col-xl-7 col-lg-7">

          {/* General */}
          <div className="settings-section">
            <div className="settings-section-header">
              <div className="settings-section-icon" style={{ backgroundColor: 'rgba(0, 212, 255, 0.08)', color: 'var(--color-primary)' }}>
                <Globe size={18} />
              </div>
              <div>
                <h3 className="settings-section-title">General</h3>
                <p className="settings-section-desc">Core platform identity and regional defaults</p>
              </div>
            </div>
            <div className="settings-section-body">
              <div className="settings-row">
                <span className="settings-row-label">Platform Name</span>
                <span className="settings-row-value">{settings.platformName}</span>
              </div>
              <div className="settings-row">
                <span className="settings-row-label">Organization</span>
                <span className="settings-row-value">{settings.organization}</span>
              </div>
              <div className="settings-row">
                <span className="settings-row-label">Timezone</span>
                <span className="settings-row-value">{settings.timezone}</span>
              </div>
              <div className="settings-row">
                <span className="settings-row-label">Default Language</span>
                <span className="settings-row-value">{settings.language}</span>
              </div>
              <div className="settings-row">
                <span className="settings-row-label">Auto-Refresh Interval</span>
                <span className="settings-row-value">{settings.refreshInterval}</span>
              </div>
            </div>
          </div>

          {/* Appearance */}
          <div className="settings-section">
            <div className="settings-section-header">
              <div className="settings-section-icon" style={{ backgroundColor: 'rgba(52, 211, 153, 0.08)', color: 'var(--color-secondary)' }}>
                <Monitor size={18} />
              </div>
              <div>
                <h3 className="settings-section-title">Appearance</h3>
                <p className="settings-section-desc">Theme and visual preferences</p>
              </div>
            </div>
            <div className="settings-section-body">
              <div className="settings-row">
                <span className="settings-row-label">Dark Theme Active</span>
                <button
                  className={`toggle-switch-custom ${settings.darkMode ? 'active' : ''}`}
                  onClick={() => handleThemeChange(settings.darkMode ? 'light' : 'dark')}
                  aria-label="Toggle dark mode"
                />
              </div>
              <div className="settings-row">
                <span className="settings-row-label">Light Theme Active</span>
                <button
                  className={`toggle-switch-custom ${settings.lightMode ? 'active' : ''}`}
                  onClick={() => handleThemeChange(settings.lightMode ? 'dark' : 'light')}
                  aria-label="Toggle light mode"
                />
              </div>
              <div className="settings-row">
                <span className="settings-row-label">Accent Color</span>
                <div className="d-flex align-items-center gap-2">
                  <div style={{
                    width: 20,
                    height: 20,
                    borderRadius: 4,
                    backgroundColor: settings.accentColor,
                    border: '1px solid var(--border-default)'
                  }} />
                  <code style={{ color: 'var(--color-primary)', fontSize: '0.8rem' }}>{settings.accentColor}</code>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column */}
        <div className="col-xl-5 col-lg-5">

          {/* API */}
          <div className="settings-section">
            <div className="settings-section-header">
              <div className="settings-section-icon" style={{ backgroundColor: 'rgba(0, 212, 255, 0.08)', color: 'var(--color-primary)' }}>
                <Server size={18} />
              </div>
              <div>
                <h3 className="settings-section-title">API Configuration</h3>
                <p className="settings-section-desc">Backend connection parameters</p>
              </div>
            </div>
            <div className="settings-section-body">
              <div className="settings-row">
                <span className="settings-row-label">Backend URL</span>
                <code className="settings-row-value text-mono" style={{ color: 'var(--color-primary)', fontSize: '0.8rem' }}>{apiUrl}</code>
              </div>
              <div className="settings-row">
                <span className="settings-row-label">API Version</span>
                <span className="settings-row-value">v1.0</span>
              </div>
              <div className="settings-row">
                <span className="settings-row-label">Connection</span>
                <span className="settings-row-value d-flex align-items-center">
                  <span className="status-dot success pulse me-2"></span>
                  <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>Connected</span>
                </span>
              </div>
              <div className="settings-row">
                <span className="settings-row-label">Protocol</span>
                <span className="settings-row-value">REST / JSON</span>
              </div>
            </div>
          </div>

          {/* About */}
          <div className="settings-section">
            <div className="settings-section-header">
              <div className="settings-section-icon" style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}>
                <Info size={18} />
              </div>
              <div>
                <h3 className="settings-section-title">About</h3>
                <p className="settings-section-desc">Build metadata and runtime versions</p>
              </div>
            </div>
            <div className="settings-section-body">
              <div className="settings-row">
                <span className="settings-row-label">Platform Version</span>
                <span className="settings-row-value">1.0.0</span>
              </div>
              <div className="settings-row">
                <span className="settings-row-label">Build</span>
                <span className="settings-row-value text-mono" style={{ fontSize: '0.8rem' }}>2026.07.15</span>
              </div>
              <div className="settings-row">
                <span className="settings-row-label">React</span>
                <span className="settings-row-value">{React.version}</span>
              </div>
              <div className="settings-row">
                <span className="settings-row-label">FastAPI</span>
                <span className="settings-row-value">0.115.x</span>
              </div>
              <div className="settings-row">
                <span className="settings-row-label">Runtime</span>
                <span className="settings-row-value">Python 3.12</span>
              </div>
            </div>
          </div>

          {/* Platform Identity */}
          <div className="settings-section">
            <div className="settings-section-header">
              <div className="settings-section-icon" style={{ backgroundColor: 'rgba(0, 212, 255, 0.08)', color: 'var(--color-primary)' }}>
                <SettingsIcon size={18} />
              </div>
              <div>
                <h3 className="settings-section-title">Platform Identity</h3>
                <p className="settings-section-desc">Brand and project metadata</p>
              </div>
            </div>
            <div className="settings-section-body">
              <div className="settings-row">
                <span className="settings-row-label">Project</span>
                <span className="settings-row-value">Cloud Admin Platform</span>
              </div>
              <div className="settings-row">
                <span className="settings-row-label">Type</span>
                <span className="settings-row-value">PFE / SaaS Dashboard</span>
              </div>
              <div className="settings-row">
                <span className="settings-row-label">License</span>
                <span className="settings-row-value">MIT</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Settings;
