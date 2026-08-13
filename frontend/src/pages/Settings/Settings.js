import React, { useState, useEffect } from 'react';
import './Settings.css';
import {
  Settings as SettingsIcon,
  Monitor,
  Server,
  Info,
  Globe,
  Key,
  Save,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { getAzureConfig, updateAzureConfig } from '../../services/api';
import { useToast } from '../../components/Toast/Toast';

const Settings = ({ isLightTheme, themePreference, setThemePreference }) => {
  const toast = useToast();
  
  const [settings, setSettings] = useState({
    platformName: 'Cloud Admin Platform',
    organization: 'Enterprise Corp.',
    timezone: 'Europe/Paris (UTC+1)',
    language: 'English',
    refreshInterval: '30 seconds',
    darkMode: !isLightTheme,
    lightMode: isLightTheme,
    autoMode: themePreference === 'auto',
    accentColor: '#00D4FF',
  });

  // Azure Credentials State
  const [azureForm, setAzureForm] = useState({
    subscription_id: '',
    tenant_id: '',
    client_id: '',
    client_secret: '',
    resource_group: 'rg-cloud-admin-platform',
    vm_name: 'vm-cloud-admin'
  });
  
  const [maskedSecret, setMaskedSecret] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [azureLoading, setAzureLoading] = useState(false);
  const [azureStatus, setAzureStatus] = useState(null);

  useEffect(() => {
    setSettings(prev => ({
      ...prev,
      darkMode: !isLightTheme,
      lightMode: isLightTheme,
      autoMode: themePreference === 'auto'
    }));
  }, [isLightTheme, themePreference]);

  // Load existing Azure config from backend
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const data = await getAzureConfig();
        if (data) {
          setAzureForm({
            subscription_id: data.subscription_id || '',
            tenant_id: data.tenant_id || '',
            client_id: data.client_id || '',
            client_secret: '',
            resource_group: data.resource_group || 'rg-cloud-admin-platform',
            vm_name: data.vm_name || 'vm-cloud-admin'
          });
          setMaskedSecret(data.client_secret_masked || '••••••••');
        }
      } catch (err) {
        console.warn('Could not load dynamic Azure config from backend:', err);
      }
    };
    loadConfig();
  }, []);

  const handleAzureSubmit = async (e) => {
    e.preventDefault();
    try {
      setAzureLoading(true);
      toast.info('Saving Azure credentials & verifying Service Principal connection...');
      
      const res = await updateAzureConfig(azureForm);
      if (res.success) {
        setAzureStatus({
          success: res.login_success,
          message: res.login_success 
            ? 'Azure Service Principal connection verified successfully! ✅' 
            : `Saved, but Azure CLI test login failed: ${res.login_output}`
        });
        
        if (res.login_success) {
          toast.success('Azure credentials saved and connection verified!');
        } else {
          toast.warning('Saved, but Azure connection failed. Check your Tenant/Client ID & Secret.');
        }
      }
    } catch (err) {
      console.error(err);
      toast.error(`Failed to save Azure config: ${err.response?.data?.detail || err.message}`);
    } finally {
      setAzureLoading(false);
    }
  };

  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  return (
    <div className="settings-container">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Platform configuration, Azure cloud connection, appearance preferences, and system parameters</p>
      </div>

      <div className="row g-4">
        {/* Left Column */}
        <div className="col-xl-7 col-lg-7">

          {/* Azure Cloud Configuration (Multi-Tenant Enterprise Settings) */}
          <div className="settings-section" style={{ border: '1px solid rgba(32, 227, 178, 0.3)' }}>
            <div className="settings-section-header">
              <div className="settings-section-icon" style={{ backgroundColor: 'rgba(32, 227, 178, 0.12)', color: 'var(--color-primary)' }}>
                <Key size={18} />
              </div>
              <div>
                <h3 className="settings-section-title">Azure Cloud Subscription & Service Principal</h3>
                <p className="settings-section-desc">Configure your enterprise Azure tenant credentials to control your own VMs securely</p>
              </div>
            </div>
            
            <div className="settings-section-body">
              <form onSubmit={handleAzureSubmit}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label text-secondary small fw-semibold">Subscription ID</label>
                    <input 
                      type="text" 
                      className="form-control form-control-sm text-mono"
                      value={azureForm.subscription_id}
                      onChange={(e) => setAzureForm({ ...azureForm, subscription_id: e.target.value })}
                      placeholder="e.g. d9ed69ab-886c-40cc-b8b6-..."
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label text-secondary small fw-semibold">Tenant ID (Directory ID)</label>
                    <input 
                      type="text" 
                      className="form-control form-control-sm text-mono"
                      value={azureForm.tenant_id}
                      onChange={(e) => setAzureForm({ ...azureForm, tenant_id: e.target.value })}
                      placeholder="e.g. 0aa23530-bf26-4354-9ec0-..."
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label text-secondary small fw-semibold">Client ID (Application ID)</label>
                    <input 
                      type="text" 
                      className="form-control form-control-sm text-mono"
                      value={azureForm.client_id}
                      onChange={(e) => setAzureForm({ ...azureForm, client_id: e.target.value })}
                      placeholder="e.g. 0a2303db-54ae-4801-888c-..."
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label text-secondary small fw-semibold">Client Secret</label>
                    <div className="input-group input-group-sm">
                      <input 
                        type={showSecret ? "text" : "password"}
                        className="form-control text-mono"
                        value={azureForm.client_secret}
                        onChange={(e) => setAzureForm({ ...azureForm, client_secret: e.target.value })}
                        placeholder={maskedSecret || "Enter Client Secret Value"}
                      />
                      <button 
                        type="button" 
                        className="btn btn-outline-secondary"
                        onClick={() => setShowSecret(!showSecret)}
                      >
                        {showSecret ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label text-secondary small fw-semibold">Resource Group Name</label>
                    <input 
                      type="text" 
                      className="form-control form-control-sm text-mono"
                      value={azureForm.resource_group}
                      onChange={(e) => setAzureForm({ ...azureForm, resource_group: e.target.value })}
                      placeholder="rg-cloud-admin-platform"
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label text-secondary small fw-semibold">Virtual Machine Name</label>
                    <input 
                      type="text" 
                      className="form-control form-control-sm text-mono"
                      value={azureForm.vm_name}
                      onChange={(e) => setAzureForm({ ...azureForm, vm_name: e.target.value })}
                      placeholder="vm-cloud-admin"
                      required
                    />
                  </div>
                </div>

                {azureStatus && (
                  <div className={`mt-3 alert alert-${azureStatus.success ? 'success' : 'warning'} d-flex align-items-center gap-2 p-2 small mb-0`}>
                    {azureStatus.success ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                    <div>{azureStatus.message}</div>
                  </div>
                )}

                <div className="mt-4 d-flex justify-content-end">
                  <button 
                    type="submit" 
                    className="btn btn-sm btn-primary d-flex align-items-center gap-2 px-3 fw-bold"
                    disabled={azureLoading}
                  >
                    <Save size={15} />
                    {azureLoading ? 'Testing & Saving...' : 'Save & Verify Connection'}
                  </button>
                </div>
              </form>
            </div>
          </div>

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
                <span className="settings-row-label">Automatic Theme</span>
                <button
                  className={`toggle-switch-custom ${settings.autoMode ? 'active' : ''}`}
                  onClick={() => setThemePreference(settings.autoMode ? (isLightTheme ? 'light' : 'dark') : 'auto')}
                  aria-label="Toggle automatic theme mode"
                />
              </div>
              <div className="settings-row">
                <span className="settings-row-label">Dark Theme Active</span>
                <button
                  className={`toggle-switch-custom ${settings.darkMode ? 'active' : ''}`}
                  onClick={() => setThemePreference('dark')}
                  aria-label="Toggle dark mode"
                />
              </div>
              <div className="settings-row">
                <span className="settings-row-label">Light Theme Active</span>
                <button
                  className={`toggle-switch-custom ${settings.lightMode ? 'active' : ''}`}
                  onClick={() => setThemePreference('light')}
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
