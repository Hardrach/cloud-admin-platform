import React, { useState, useEffect } from 'react';
import './DockerCompose.css';
import { getDockerCompose } from '../../services/api';
import { 
  FiLayers, 
  FiPackage, 
  FiRefreshCw,
  FiAlertTriangle,
  FiSearch
} from 'react-icons/fi';

const DockerCompose = () => {
  const [composeData, setComposeData] = useState({ version: null, containers: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchComposeData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getDockerCompose();
      setComposeData(data || { version: null, containers: [] });
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load Docker Compose details.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchComposeData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchComposeData();
  };

  const filteredContainers = composeData.containers
    ? composeData.containers.filter(c => 
        c.project.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.image.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  // Compute stat metrics dynamically
  const activeProjects = [...new Set(composeData.containers?.map(c => c.project) || [])].length || 0;
  const runningContainers = composeData.containers?.filter(c => c.status?.toLowerCase().includes('up') || c.status?.toLowerCase().includes('running')).length || 0;
  const stoppedContainers = (composeData.containers?.length || 0) - runningContainers;

  const getStatusBadgeClass = (status) => {
    if (!status) return 'badge-secondary';
    if (status.toLowerCase().includes('up') || status.toLowerCase().includes('running')) return 'badge-running';
    return 'badge-error';
  };

  return (
    <div className={`compose-container ${isRefreshing ? 'refresh-animate' : ''}`}>
      {/* Header */}
      <div className="compose-header-toolbar mb-3">
        <div>
          <h1 className="compose-title">Docker Compose</h1>
          <p className="compose-subtitle">Monitor multi-container Docker applications and stack deployments</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="compose-actions-row">
        <div className="compose-search position-relative">
          <FiSearch className="position-absolute start-3 top-50 translate-middle-y text-secondary" style={{ left: '0.75rem' }} />
          <input 
            type="text" 
            className="form-control ps-5 search-input" 
            placeholder="Search Docker Compose..." 
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

      {/* Error Alert */}
      {error && (
        <div className="alert alert-danger border-0 mb-4 d-flex align-items-center gap-3 text-white" style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)' }} role="alert">
          <FiAlertTriangle className="text-danger flex-shrink-0" size={24} />
          <div>
            <strong className="d-block text-danger mb-1">Docker Compose Service Error</strong>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="compose-stat-card p-3 rounded" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary small font-medium">Compose Version</span>
              <FiLayers className="text-primary" size={20} />
            </div>
            <div className="fs-5 fw-bold text-white">{loading ? '...' : (composeData.version || 'v2.29.2')}</div>
            <div className="small text-muted mt-1">Docker Engine CLI plugin</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="compose-stat-card p-3 rounded" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary small font-medium">Projects</span>
              <FiPackage className="text-info" size={20} />
            </div>
            <div className="fs-4 fw-bold text-white">{loading ? '...' : activeProjects}</div>
            <div className="small text-muted mt-1">Active multi-container stacks</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="compose-stat-card p-3 rounded" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary small font-medium">Running Containers</span>
              <FiPackage className="text-success" size={20} />
            </div>
            <div className="fs-4 fw-bold text-success">{loading ? '...' : runningContainers}</div>
            <div className="small text-muted mt-1">Active instances linked to Compose</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="compose-stat-card p-3 rounded" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary small font-medium">Stopped Containers</span>
              <FiPackage className="text-danger" size={20} />
            </div>
            <div className="fs-4 fw-bold text-danger">{loading ? '...' : stoppedContainers}</div>
            <div className="small text-muted mt-1">Exited instances linked to Compose</div>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="compose-table-card">
        <div className="table-responsive">
          <table className="compose-table">
            <thead>
              <tr>
                <th>Project</th>
                <th>Container</th>
                <th>Status</th>
                <th>Ports</th>
                <th>Image</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1].map((i) => (
                  <tr key={i} className="placeholder-loading-row">
                    <td><div className="skeleton-text short" /></td>
                    <td><div className="skeleton-text" /></td>
                    <td><div className="skeleton-text short" /></td>
                    <td><div className="skeleton-text" /></td>
                    <td><div className="skeleton-text" /></td>
                  </tr>
                ))
              ) : filteredContainers.length > 0 ? (
                filteredContainers.map((container, idx) => (
                  <tr key={idx}>
                    <td>
                      <span className="fw-semibold text-white">{container.project}</span>
                    </td>
                    <td>
                      <span className="text-light">{container.name}</span>
                    </td>
                    <td>
                      <span className={`compose-status-badge ${getStatusBadgeClass(container.status)}`}>
                        <span className="dot"></span>
                        {container.status?.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <code className="text-secondary" style={{ fontSize: '0.8rem' }}>{container.ports || '-'}</code>
                    </td>
                    <td>
                      <code className="text-light" style={{ fontSize: '0.8rem' }}>{container.image}</code>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-5 text-secondary">
                    <FiLayers size={32} className="mb-2 text-secondary opacity-50" />
                    <p className="mb-0 fw-medium">No Docker Compose projects found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DockerCompose;
