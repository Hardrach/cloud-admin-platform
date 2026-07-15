import React, { useState } from 'react';
import './Settings.css';
import {
  FiSettings,
  FiMonitor,
  FiBell,
  FiServer,
  FiShield,
  FiInfo,
  FiGlobe
} from 'react-icons/fi';

const Settings = () => {
  // Simulated settings state
  const [settings, setSettings] = useState({
    platformName: 'Cloud Admin Platform',
    organization: 'Enterprise Corp.',
    timezone: 'Europe/Paris (UTC+1)',
    language: 'English',
    refreshInterval: '30 seconds',
    darkMode: true,
    lightMode: false,
    accentColor: '#00C8FF',
    emailAlerts: true,
    desktopNotifications: false,
    sound: true,
    sessionTimeout: '30 minutes',
    autoLogout: true,
    mfaEnabled: false,
  });

  const toggleSetting = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  return (
    <div className="settings-container">
      {/* Header */}
      <div className="settings-header">
        <h1 className="settings-title">Settings</h1>
        <p className="settings-subtitle">Platform configuration, appearance preferences, and system parameters</p>
      </div>

      <div className="row g-4">
        <div className="col-lg-8">

          {/* ── General ── */}
          <div className="settings-section">
            <div className="settings-section-header">
              <div className="settings-section-icon" style={{ backgroundColor: 'rgba(0, 200, 255, 0.1)', color: 'var(--primary-color)' }}>
                <FiGlobe />
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

          {/* ── Appearance ── */}
          <div className="settings-section">
            <div className="settings-section-header">
              <div className="settings-section-icon" style={{ backgroundColor: 'rgba(61, 213, 152, 0.1)', color: 'var(--secondary-color)' }}>
                <FiMonitor />
              </div>
              <div>
                <h3 className="settings-section-title">Appearance</h3>
                <p className="settings-section-desc">Theme and visual preferences</p>
              </div>
            </div>
            <div className="settings-section-body">
              <div className="settings-row">
                <span className="settings-row-label">Dark Mode</span>
                <button
                  className={`toggle-switch ${settings.darkMode ? 'active' : ''}`}
                  onClick={() => toggleSetting('darkMode')}
                  aria-label="Toggle dark mode"
                />
              </div>
              <div className="settings-row">
                <span className="settings-row-label">Light Mode</span>
                <button
                  className={`toggle-switch ${settings.lightMode ? 'active' : ''}`}
                  onClick={() => toggleSetting('lightMode')}
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
                    border: '1px solid var(--border-color)'
                  }} />
                  <code style={{ color: 'var(--primary-color)', fontSize: '0.8rem' }}>{settings.accentColor}</code>
                </div>
              </div>
            </div>
          </div>

          {/* ── Notifications ── */}
          <div className="settings-section">
            <div className="settings-section-header">
              <div className="settings-section-icon" style={{ backgroundColor: 'rgba(255, 176, 32, 0.1)', color: 'var(--warning-color)' }}>
                <FiBell />
              </div>
              <div>
                <h3 className="settings-section-title">Notifications</h3>
                <p className="settings-section-desc">Alert channels and delivery preferences</p>
              </div>
            </div>
            <div className="settings-section-body">
              <div className="settings-row">
                <span className="settings-row-label">Email Alerts</span>
                <button
                  className={`toggle-switch ${settings.emailAlerts ? 'active' : ''}`}
                  onClick={() => toggleSetting('emailAlerts')}
                  aria-label="Toggle email alerts"
                />
              </div>
              <div className="settings-row">
                <span className="settings-row-label">Desktop Notifications</span>
                <button
                  className={`toggle-switch ${settings.desktopNotifications ? 'active' : ''}`}
                  onClick={() => toggleSetting('desktopNotifications')}
                  aria-label="Toggle desktop notifications"
                />
              </div>
              <div className="settings-row">
                <span className="settings-row-label">Sound</span>
                <button
                  className={`toggle-switch ${settings.sound ? 'active' : ''}`}
                  onClick={() => toggleSetting('sound')}
                  aria-label="Toggle sound"
                />
              </div>
            </div>
          </div>

          {/* ── Security ── */}
          <div className="settings-section">
            <div className="settings-section-header">
              <div className="settings-section-icon" style={{ backgroundColor: 'rgba(255, 93, 115, 0.1)', color: 'var(--danger-color)' }}>
                <FiShield />
              </div>
              <div>
                <h3 className="settings-section-title">Security</h3>
                <p className="settings-section-desc">Session management and authentication policies</p>
              </div>
            </div>
            <div className="settings-section-body">
              <div className="settings-row">
                <span className="settings-row-label">Session Timeout</span>
                <span className="settings-row-value">{settings.sessionTimeout}</span>
              </div>
              <div className="settings-row">
                <span className="settings-row-label">Auto Logout on Idle</span>
                <button
                  className={`toggle-switch ${settings.autoLogout ? 'active' : ''}`}
                  onClick={() => toggleSetting('autoLogout')}
                  aria-label="Toggle auto logout"
                />
              </div>
              <div className="settings-row">
                <span className="settings-row-label">Multi-Factor Authentication</span>
                <div className="d-flex align-items-center gap-2">
                  <button
                    className={`toggle-switch ${settings.mfaEnabled ? 'active' : ''}`}
                    onClick={() => toggleSetting('mfaEnabled')}
                    aria-label="Toggle MFA"
                  />
                  <span className="text-secondary" style={{ fontSize: '0.75rem' }}>Coming Soon</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column */}
        <div className="col-lg-4">

          {/* ── API ── */}
          <div className="settings-section">
            <div className="settings-section-header">
              <div className="settings-section-icon" style={{ backgroundColor: 'rgba(0, 200, 255, 0.1)', color: 'var(--primary-color)' }}>
                <FiServer />
              </div>
              <div>
                <h3 className="settings-section-title">API Configuration</h3>
                <p className="settings-section-desc">Backend connection parameters</p>
              </div>
            </div>
            <div className="settings-section-body">
              <div className="settings-row">
                <span className="settings-row-label">Backend URL</span>
                <code className="settings-row-value" style={{ color: 'var(--primary-color)', fontSize: '0.8rem' }}>{apiUrl}</code>
              </div>
              <div className="settings-row">
                <span className="settings-row-label">API Version</span>
                <span className="settings-row-value">v1.0</span>
              </div>
              <div className="settings-row">
                <span className="settings-row-label">Connection</span>
                <span className="settings-row-value d-flex align-items-center">
                  <span className="status-dot online"></span>
                  <span style={{ color: 'var(--success-color)' }}>Connected</span>
                </span>
              </div>
              <div className="settings-row">
                <span className="settings-row-label">Protocol</span>
                <span className="settings-row-value">REST / JSON</span>
              </div>
            </div>
          </div>

          {/* ── About ── */}
          <div className="settings-section">
            <div className="settings-section-header">
              <div className="settings-section-icon" style={{ backgroundColor: 'rgba(144, 167, 191, 0.1)', color: 'var(--text-secondary)' }}>
                <FiInfo />
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
                <span className="settings-row-value" style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>2026.07.15</span>
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

          {/* ── Platform Identity ── */}
          <div className="settings-section">
            <div className="settings-section-header">
              <div className="settings-section-icon" style={{ backgroundColor: 'rgba(0, 200, 255, 0.1)', color: 'var(--primary-color)' }}>
                <FiSettings />
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
