import React, { useState, useEffect } from 'react';
import './Storage.css';
import { getStorage } from '../../services/api';
import { 
  FiHardDrive, 
  FiDatabase, 
  FiRefreshCw, 
  FiSearch, 
  FiInfo, 
  FiX, 
  FiAlertTriangle,
  FiFolder,
  FiArchive,
  FiCheckCircle,
  FiPieChart
} from 'react-icons/fi';

const Storage = () => {
  const [storageData, setStorageData] = useState({ disk: {}, volumes: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVolumeName, setSelectedVolumeName] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadStorageData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getStorage();
      setStorageData(data || { disk: {}, volumes: [] });
      if (data && data.volumes && data.volumes.length > 0 && !selectedVolumeName) {
        setSelectedVolumeName(data.volumes[0].name);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load storage telemetry.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadStorageData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadStorageData();
  };

  const filteredVolumes = storageData.volumes
    ? storageData.volumes.filter(v => v.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const selectedVolume = storageData.volumes?.find(v => v.name === selectedVolumeName);

  const disk = storageData.disk || {};
  const progressPercent = disk.total_gb && disk.used_gb
    ? parseFloat(((disk.used_gb / disk.total_gb) * 100).toFixed(1))
    : 0;

  // Storage Health Check logic
  const getHealthStatus = (percent) => {
    if (percent < 60) return { label: 'Healthy', class: 'status-active', color: 'var(--success-color)' };
    if (percent >= 60 && percent <= 80) return { label: 'Warning', class: 'status-pending', color: 'var(--warning-color)' };
    return { label: 'Critical', class: 'status-critical', color: 'var(--danger-color)' };
  };

  const health = getHealthStatus(progressPercent);

  // SVG Donut Calculations
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className={`storage-container ${isRefreshing ? 'refresh-animate' : ''}`}>
      {/* Header */}
      <div className="storage-header-toolbar">
        <div>
          <h1 className="storage-title">Storage</h1>
          <p className="storage-subtitle">Monitor Docker volumes and Azure virtual machine storage usage</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="storage-actions-row">
        <div className="storage-search position-relative">
          <FiSearch className="position-absolute start-3 top-50 translate-middle-y text-secondary" style={{ left: '0.75rem' }} />
          <input 
            type="text" 
            className="form-control ps-5 search-input" 
            placeholder="Search Docker volumes..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="ms-auto d-flex gap-2">
          <button className="btn btn-outline-secondary border-color text-white d-flex align-items-center gap-2" onClick={handleRefresh} style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
            <FiRefreshCw className={loading ? 'spin-animation' : ''} /> Refresh
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="alert alert-danger border-0 mb-4 d-flex align-items-center gap-3 text-white" style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)' }} role="alert">
          <FiAlertTriangle className="text-danger flex-shrink-0" size={24} />
          <div>
            <strong className="d-block text-danger mb-1">Storage Service Error</strong>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Top 4 Storage Metric Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="metric-card p-3 rounded" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary small font-medium">Total Space</span>
              <FiDatabase className="text-primary" size={20} />
            </div>
            <div className="fs-4 fw-bold text-white">{loading ? '...' : `${disk.total_gb || '0'} GB`}</div>
            <div className="small text-muted mt-1">Virtual Machine capacity</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="metric-card p-3 rounded" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary small font-medium">Used Space</span>
              <FiHardDrive className="text-warning" size={20} />
            </div>
            <div className="fs-4 fw-bold text-white">{loading ? '...' : `${disk.used_gb || '0'} GB`}</div>
            <div className="small text-muted mt-1">Allocated VM sectors</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="metric-card p-3 rounded" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary small font-medium">Free Capacity</span>
              <FiCheckCircle className="text-success" size={20} />
            </div>
            <div className="fs-4 fw-bold text-white">{loading ? '...' : `${disk.free_gb || '0'} GB`}</div>
            <div className="small text-muted mt-1">Available sectors</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="metric-card p-3 rounded" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary small font-medium">Filesystem</span>
              <FiArchive className="text-info" size={20} />
            </div>
            <div className="fs-4 fw-bold text-white">{loading ? '...' : (disk.filesystem || 'N/A')}</div>
            <div className="small text-muted mt-1">VM partition layout</div>
          </div>
        </div>
      </div>

      {/* Main split grid */}
      <div className="storage-main-layout">
        
        {/* Left column (75%) */}
        <div className="storage-left-col">
          <div className="storage-section-title mb-3">Docker Volumes</div>
          <div className="storage-table-card">
            <div className="table-responsive">
              <table className="storage-table">
                <thead>
                  <tr>
                    <th>Volume Name</th>
                    <th>Driver</th>
                    <th>Mount Point</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    [1, 2].map((i) => (
                      <tr key={i} className="placeholder-loading-row">
                        <td><div className="skeleton-text" /></td>
                        <td><div className="skeleton-text short" /></td>
                        <td><div className="skeleton-text" /></td>
                        <td><div className="skeleton-text" /></td>
                      </tr>
                    ))
                  ) : filteredVolumes.length > 0 ? (
                    filteredVolumes.map((vol) => (
                      <tr key={vol.name}>
                        <td>
                          <div className="fw-semibold d-flex align-items-center gap-2">
                            <FiDatabase className="text-primary" />
                            <span>{vol.name}</span>
                          </div>
                        </td>
                        <td>
                          <span className="driver-badge badge-bridge">
                            <span className="dot"></span>
                            {vol.driver?.toUpperCase() || 'LOCAL'}
                          </span>
                        </td>
                        <td>
                          <div className="text-light d-flex align-items-center gap-1" style={{ fontSize: '0.8rem' }}>
                            <FiFolder className="text-secondary flex-shrink-0" />
                            <span className="text-truncate" style={{ maxWidth: '280px' }} title={vol.mountpoint}>
                              {vol.mountpoint}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="storage-row-actions justify-content-end d-flex">
                            <button 
                              className={`btn-storage-action btn-details ${selectedVolumeName === vol.name ? 'active' : ''}`} 
                              title="Details"
                              onClick={() => setSelectedVolumeName(selectedVolumeName === vol.name ? null : vol.name)}
                            >
                              <FiInfo />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center py-5 text-secondary">
                        <div className="fs-2 mb-2">📦</div>
                        <p className="mb-1 fw-bold text-white">No Docker Volumes</p>
                        <p className="mb-0 text-muted small">Docker volumes will appear here when persistent storage is created.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right column (25%) */}
        <div className="storage-right-col">
          
          {/* Disk Usage Card with SVG Donut */}
          <div className="storage-section-title mb-3">Disk Usage</div>
          <div className="disk-card p-3 rounded mb-4 text-center" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
            {loading ? (
              <div className="py-4">
                <div className="skeleton-text mb-2 mx-auto" style={{ width: '50%' }} />
                <div className="skeleton-text mb-2 mx-auto" style={{ width: '30%' }} />
                <div className="skeleton-text mx-auto" style={{ width: '70%' }} />
              </div>
            ) : (
              <div>
                <div className="d-flex align-items-center gap-2 mb-3 text-start">
                  <FiPieChart className="text-info" />
                  <span className="text-white fw-bold">Usage Percentage</span>
                </div>
                
                {/* Custom SVG Donut Chart */}
                <div className="position-relative d-inline-flex align-items-center justify-content-center mb-3">
                  <svg width="110" height="110" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                    {/* Background circle */}
                    <circle
                      cx="50"
                      cy="50"
                      r={radius}
                      fill="transparent"
                      stroke="rgba(255, 255, 255, 0.05)"
                      strokeWidth="8"
                    />
                    {/* Foreground circle */}
                    <circle
                      cx="50"
                      cy="50"
                      r={radius}
                      fill="transparent"
                      stroke="var(--primary-color)"
                      strokeWidth="8"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }}
                    />
                  </svg>
                  {/* Inside Text Overlay */}
                  <div className="position-absolute d-flex flex-column align-items-center justify-content-center">
                    <span className="fs-5 fw-bold text-white">{progressPercent}%</span>
                  </div>
                </div>

                <div className="text-secondary small mt-2">
                  Used <span className="text-white fw-semibold">{disk.used_gb || '0'} GB</span> of <span className="text-white fw-semibold">{disk.total_gb || '0'} GB</span>
                </div>

                <div className="d-flex justify-content-center align-items-center gap-2 mt-2">
                  <span className="dot" style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--success-color)' }}></span>
                  <span className="text-success small fw-semibold">Free: {disk.free_gb || '0'} GB</span>
                </div>
              </div>
            )}
          </div>

          {/* Storage Health & Azure Disk widget info */}
          <div className="storage-section-title mb-3">Storage Health</div>
          <div className="disk-card p-3 rounded mb-4" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
            {loading ? (
              <div className="skeleton-text" />
            ) : (
              <div className="d-flex justify-content-between align-items-center">
                <span className="text-secondary small font-medium">VM Storage Status</span>
                <span className={`network-status-badge ${health.class}`}>
                  <span className="dot"></span>
                  {health.label}
                </span>
              </div>
            )}
          </div>

          <div className="storage-section-title mb-3">Azure VM Disk</div>
          <div className="disk-card p-3 rounded" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
            {loading ? (
              <div className="py-2">
                <div className="skeleton-text mb-2" />
                <div className="skeleton-text" />
              </div>
            ) : (
              <div className="d-flex flex-column gap-2 small">
                <div className="d-flex justify-content-between">
                  <span className="text-secondary">Filesystem</span>
                  <span className="text-white fw-semibold">{disk.filesystem || 'N/A'}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-secondary">Mounted</span>
                  <span className="text-success fw-semibold">Yes</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-secondary">Docker Ready</span>
                  <span className="text-success fw-semibold">Yes</span>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Right side slide-over Details panel */}
        {selectedVolume && (
          <div className="storage-details-panel">
            <div className="storage-panel-header">
              <div className="d-flex align-items-center gap-2">
                <FiDatabase className="text-secondary" />
                <span className="fw-bold text-white text-truncate" style={{ maxWidth: '220px' }}>
                  {selectedVolume.name}
                </span>
              </div>
              <button 
                className="close-panel-btn" 
                onClick={() => setSelectedVolumeName(null)}
                aria-label="Close details"
              >
                <FiX />
              </button>
            </div>
            
            <div className="storage-panel-body">
              <div>
                <div className="storage-detail-group-title">Volume Details</div>
                <div className="storage-detail-row">
                  <span className="storage-detail-label">Volume Name</span>
                  <span className="storage-detail-value">{selectedVolume.name}</span>
                </div>
                <div className="storage-detail-row">
                  <span className="storage-detail-label">Driver</span>
                  <span className="storage-detail-value">
                    <span className="driver-badge badge-bridge">
                      <span className="dot"></span>
                      {selectedVolume.driver?.toUpperCase() || 'LOCAL'}
                    </span>
                  </span>
                </div>
                <div className="storage-detail-row">
                  <span className="storage-detail-label">Mount Point</span>
                  <span className="storage-detail-value text-truncate" title={selectedVolume.mountpoint} style={{ maxWidth: '180px' }}>
                    <code>{selectedVolume.mountpoint}</code>
                  </span>
                </div>
                <div className="storage-detail-row">
                  <span className="storage-detail-label">Created</span>
                  <span className="storage-detail-value">2026-07-08 09:21:03</span>
                </div>
                <div className="storage-detail-row">
                  <span className="storage-detail-label">Status</span>
                  <span className="storage-detail-value">
                    <span className="badge bg-success-soft text-success px-2 py-1" style={{ border: '1px solid currentColor' }}>
                      Mounted
                    </span>
                  </span>
                </div>
                <div className="storage-detail-row">
                  <span className="storage-detail-label">Usage</span>
                  <span className="storage-detail-value">Active</span>
                </div>
                <div className="storage-detail-row">
                  <span className="storage-detail-label">Filesystem</span>
                  <span className="storage-detail-value">docker-local</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Storage;
