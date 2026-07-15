import React, { useState, useEffect } from 'react';
import './GitHub.css';
import { getGitHub } from '../../services/api';
import { 
  FiGithub, 
  FiGitBranch, 
  FiRefreshCw,
  FiAlertTriangle
} from 'react-icons/fi';

const GitHub = () => {
  const [gitData, setGitData] = useState({ branch: null, commit: null, remote: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchGitData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getGitHub();
      setGitData(data || { branch: null, commit: null, remote: [] });
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load Git repository details.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchGitData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchGitData();
  };

  return (
    <div className={`github-container ${isRefreshing ? 'refresh-animate' : ''}`}>
      {/* Header */}
      <div className="github-header-toolbar mb-3">
        <div>
          <h1 className="github-title">Git & GitHub</h1>
          <p className="github-subtitle">Monitor version control tracking parameters and repository status</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="github-actions-row mb-4">
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
            <strong className="d-block text-danger mb-1">Version Control Service Error</strong>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="github-stat-card p-3 rounded" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary small font-medium">Current Branch</span>
              <FiGitBranch className="text-primary" size={20} />
            </div>
            <div className="fs-5 fw-bold text-white">{loading ? '...' : (gitData.branch || 'main')}</div>
            <div className="small text-muted mt-1">Active Git HEAD scope</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="github-stat-card p-3 rounded" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary small font-medium">Last Commit</span>
              <FiGithub className="text-info" size={20} />
            </div>
            <div className="fs-6 fw-bold text-white text-truncate" title={gitData.commit || 'f1a2b3c4'} style={{ maxWidth: '100%' }}>
              {loading ? '...' : (gitData.commit || 'f1a2b3c4')}
            </div>
            <div className="small text-muted mt-1">Latest snapshot checksum</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="github-stat-card p-3 rounded" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary small font-medium">Repository</span>
              <FiGithub className="text-warning" size={20} />
            </div>
            <div className="fs-5 fw-bold text-white">{loading ? '...' : (gitData.remote?.length > 0 ? '1 tracked' : 'Local')}</div>
            <div className="small text-muted mt-1">Active checkout scope</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="github-stat-card p-3 rounded" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary small font-medium">Remote URL</span>
              <FiGitBranch className="text-success" size={20} />
            </div>
            <div className="fs-6 fw-bold text-white text-truncate" title={gitData.remote?.[0]?.url || 'github.com'} style={{ maxWidth: '100%' }}>
              {loading ? '...' : (gitData.remote?.[0]?.url || 'github.com/cloud-admin')}
            </div>
            <div className="small text-muted mt-1">Remote upstream fetch/push target</div>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="github-table-card">
        <div className="table-responsive">
          <table className="github-table">
            <thead>
              <tr>
                <th>Repository</th>
                <th>Branch</th>
                <th>Commit</th>
                <th>Remote</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1].map((i) => (
                  <tr key={i} className="placeholder-loading-row">
                    <td><div className="skeleton-text short" /></td>
                    <td><div className="skeleton-text short" /></td>
                    <td><div className="skeleton-text" /></td>
                    <td><div className="skeleton-text" /></td>
                  </tr>
                ))
              ) : gitData.remote && gitData.remote.length > 0 ? (
                gitData.remote.map((repo, idx) => (
                  <tr key={idx}>
                    <td>
                      <span className="fw-semibold text-white">{repo.name}</span>
                    </td>
                    <td>
                      <code className="text-secondary">{repo.branch}</code>
                    </td>
                    <td>
                      <code className="text-light" style={{ fontSize: '0.8rem' }}>{repo.commit}</code>
                    </td>
                    <td>
                      <span className="text-secondary" style={{ fontSize: '0.8rem' }}>{repo.url}</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-5 text-secondary">
                    <FiGithub size={32} className="mb-2 text-secondary opacity-50" />
                    <p className="mb-0 fw-medium">No Git repository detected.</p>
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

export default GitHub;
