import React, { useState, useEffect } from 'react';
import './SSH.css';
import { getSSHKeys } from '../../services/api';
import { 
  FiKey, 
  FiUser, 
  FiRefreshCw, 
  FiAlertTriangle,
  FiSearch
} from 'react-icons/fi';

const SSH = () => {
  const [sshData, setSshData] = useState({ count: 0, keys: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchSSHData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSSHKeys();
      setSshData(data || { count: 0, keys: [] });
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load SSH keys.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSSHData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchSSHData();
  };

  const filteredKeys = sshData.keys
    ? sshData.keys.filter(key => 
        key.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        key.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
        key.fingerprint.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <div className={`ssh-container ${isRefreshing ? 'refresh-animate' : ''}`}>
      {/* Header */}
      <div className="ssh-header-toolbar mb-3">
        <div>
          <h1 className="ssh-title">SSH Keys</h1>
          <p className="ssh-subtitle">Manage public SSH keys authorized to connect to the Virtual Machine</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="ssh-actions-row">
        <div className="ssh-search position-relative">
          <FiSearch className="position-absolute start-3 top-50 translate-middle-y text-secondary" style={{ left: '0.75rem' }} />
          <input 
            type="text" 
            className="form-control ps-5 search-input" 
            placeholder="Search SSH keys..." 
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
            <strong className="d-block text-danger mb-1">SSH Key Service Error</strong>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="ssh-stat-card p-3 rounded" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary small font-medium">Total Keys</span>
              <FiKey className="text-primary" size={20} />
            </div>
            <div className="fs-4 fw-bold text-white">{loading ? '...' : sshData.count}</div>
            <div className="small text-muted mt-1">Installed authorized public keys</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="ssh-stat-card p-3 rounded" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary small font-medium">Authorized Users</span>
              <FiUser className="text-success" size={20} />
            </div>
            <div className="fs-4 fw-bold text-success">{loading ? '...' : (sshData.count > 0 ? 1 : 0)}</div>
            <div className="small text-muted mt-1">Target admin accounts</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="ssh-stat-card p-3 rounded" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary small font-medium">Last Updated</span>
              <FiRefreshCw className="text-info" size={20} />
            </div>
            <div className="fs-6 fw-bold text-white">2026-07-08 09:21</div>
            <div className="small text-muted mt-1">Last key deployment cycle</div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="ssh-table-card">
        <div className="table-responsive">
          <table className="ssh-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Fingerprint</th>
                <th>Comment</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1].map((i) => (
                  <tr key={i} className="placeholder-loading-row">
                    <td><div className="skeleton-text short" /></td>
                    <td><div className="skeleton-text" /></td>
                    <td><div className="skeleton-text" /></td>
                    <td><div className="skeleton-text short" /></td>
                  </tr>
                ))
              ) : filteredKeys.length > 0 ? (
                filteredKeys.map((key, idx) => (
                  <tr key={idx}>
                    <td>
                      <span className="fw-semibold text-white">{key.username}</span>
                    </td>
                    <td>
                      <code className="text-secondary" style={{ fontSize: '0.75rem' }}>{key.fingerprint}</code>
                    </td>
                    <td>
                      <span className="text-light">{key.comment}</span>
                    </td>
                    <td>
                      <span className="text-muted small">{key.created}</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-5 text-secondary">
                    <FiKey size={32} className="mb-2 text-secondary opacity-50" />
                    <p className="mb-1 fw-bold text-white">No SSH Keys Found</p>
                    <p className="mb-0 text-muted small">Authorize public SSH keys to authenticate connection scopes.</p>
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

export default SSH;
