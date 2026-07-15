import React, { useState, useEffect } from 'react';
import './GitHub.css';
import { getGitHub, fetchGit, pullGit, pushGit, commitGit } from '../../services/api';
import { 
  FiGithub, 
  FiGitBranch, 
  FiRefreshCw,
  FiAlertTriangle,
  FiFileText,
  FiActivity,
  FiCalendar,
  FiUser,
  FiCopy,
  FiCheckCircle,
  FiArrowUp,
  FiArrowDown,
  FiClock,
  FiTag,
  FiDatabase,
  FiCommand,
  FiPlay
} from 'react-icons/fi';

const GitHub = () => {
  const [gitData, setGitData] = useState({
    repository: '',
    branch: '',
    last_commit: { hash: '', message: '', author: '', date: '' },
    remote: '',
    commits: 0,
    ahead: 0,
    behind: 0,
    status: '',
    recent_commits: [],
    branches: [],
    tags: [],
    size: '',
    files: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Git Action States
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);
  const [commitMessage, setCommitMessage] = useState('');
  const [copied, setCopied] = useState(false);

  const fetchGitData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getGitHub();
      setGitData(data || {
        repository: 'cloud-admin-platform',
        branch: 'main',
        last_commit: { hash: 'unknown', message: 'no commit detected', author: 'system', date: 'N/A' },
        remote: 'https://github.com/Hardrach/cloud-admin-platform.git',
        commits: 0,
        ahead: 0,
        behind: 0,
        status: 'Clean',
        recent_commits: [],
        branches: ['main'],
        tags: [],
        size: 'N/A',
        files: []
      });
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
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchGitData();
  };

  const handleAction = async (actionFn, successMsg) => {
    try {
      setActionLoading(true);
      setActionMessage(null);
      setError(null);
      const res = await actionFn();
      if (res.success !== false) {
        setActionMessage({ type: 'success', text: res.message || successMsg });
        // Refresh git info after action
        await fetchGitData();
      } else {
        setActionMessage({ type: 'error', text: res.message || "Operation completed with warnings." });
      }
    } catch (err) {
      console.error(err);
      setActionMessage({ type: 'error', text: err.response?.data?.detail || err.message || "Action failed." });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCommitSubmit = async (e) => {
    e.preventDefault();
    if (!commitMessage.trim()) return;
    
    await handleAction(
      () => commitGit(commitMessage),
      "Changes committed successfully."
    );
    setCommitMessage('');
  };

  const copyToClipboard = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadgeClass = (status) => {
    if (!status) return 'badge-secondary';
    switch (status.toLowerCase()) {
      case 'clean':
        return 'badge-running';
      case 'modified':
        return 'badge-warning';
      case 'conflicts':
        return 'badge-error';
      case 'untracked':
        return 'badge-info';
      default:
        return 'badge-secondary';
    }
  };

  const getStatusTextPrefix = (status) => {
    switch (status?.toLowerCase()) {
      case 'clean': return '🟢 ';
      case 'modified': return '🟡 ';
      case 'conflicts': return '🔴 ';
      case 'untracked': return '🔵 ';
      default: return '⚪ ';
    }
  };

  const getFileStatusClass = (status) => {
    switch (status) {
      case 'untracked': return 'text-info';
      case 'modified': return 'text-warning';
      case 'deleted': return 'text-danger';
      case 'added': return 'text-success';
      default: return 'text-secondary';
    }
  };

  return (
    <div className={`github-container ${isRefreshing ? 'refresh-animate' : ''}`}>
      {/* Header */}
      <div className="github-header-toolbar mb-3">
        <div>
          <h1 className="github-title">Git & GitHub</h1>
          <p className="github-subtitle">Monitor version control tracking parameters, repository status, and deploy actions</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="github-actions-row mb-4">
        <div className="d-flex gap-2 flex-wrap">
          <button 
            className="btn btn-primary d-flex align-items-center gap-2" 
            disabled={actionLoading || loading}
            onClick={() => handleAction(fetchGit, "Repository origin fetched successfully.")}
          >
            <FiRefreshCw /> Fetch Origin
          </button>
          <button 
            className="btn btn-outline-info text-white d-flex align-items-center gap-2"
            style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}
            disabled={actionLoading || loading}
            onClick={() => handleAction(pullGit, "Updates pulled successfully.")}
          >
            <FiArrowDown /> Pull Updates
          </button>
          <button 
            className="btn btn-outline-success text-white d-flex align-items-center gap-2"
            style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}
            disabled={actionLoading || loading}
            onClick={() => handleAction(pushGit, "Local commits pushed successfully.")}
          >
            <FiArrowUp /> Push Commits
          </button>
        </div>
        <div className="ms-auto">
          <button className="btn btn-outline-secondary border-color text-white d-flex align-items-center gap-2" onClick={handleRefresh} style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
            <FiRefreshCw className={loading ? 'spin-animation' : ''} /> Refresh Telemetry
          </button>
        </div>
      </div>

      {/* Action result notification message */}
      {actionMessage && (
        <div 
          className={`alert ${actionMessage.type === 'success' ? 'alert-success' : 'alert-danger'} border-0 mb-4 d-flex align-items-center gap-3 text-white`} 
          style={{ 
            backgroundColor: actionMessage.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            border: actionMessage.type === 'success' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)'
          }}
        >
          {actionMessage.type === 'success' ? <FiCheckCircle className="text-success" size={24} /> : <FiAlertTriangle className="text-danger" size={24} />}
          <div>{actionMessage.text}</div>
        </div>
      )}

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
              <span className="text-secondary small font-medium">Status</span>
              <FiGithub className="text-primary" size={20} />
            </div>
            <div className="d-flex align-items-center mt-1">
              <span className={`firewall-status-badge ${getStatusBadgeClass(gitData.status)}`}>
                <span className="dot"></span>
                {loading ? 'LOADING...' : `${getStatusTextPrefix(gitData.status)}${gitData.status?.toUpperCase()}`}
              </span>
            </div>
            <div className="small text-muted mt-2">Working tree status</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="github-stat-card p-3 rounded" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary small font-medium">Current Branch</span>
              <FiGitBranch className="text-info" size={20} />
            </div>
            <div className="fs-5 fw-bold text-white text-truncate">{loading ? '...' : (gitData.branch || 'main')}</div>
            <div className="small text-muted mt-1">Active Git HEAD scope</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="github-stat-card p-3 rounded" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary small font-medium">Commit Count</span>
              <FiActivity className="text-warning" size={20} />
            </div>
            <div className="fs-5 fw-bold text-white">{loading ? '...' : gitData.commits}</div>
            <div className="small text-muted mt-1">Total commits in history</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="github-stat-card p-3 rounded" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary small font-medium">Pack Disk Size</span>
              <FiDatabase className="text-success" size={20} />
            </div>
            <div className="fs-5 fw-bold text-white">{loading ? '...' : (gitData.size || 'N/A')}</div>
            <div className="small text-muted mt-1">Packfile space on disk</div>
          </div>
        </div>
      </div>

      <div className="row g-4 mb-4">
        {/* Repository details */}
        <div className="col-lg-6">
          <div className="github-table-card p-4 h-100">
            <h5 className="text-white mb-4 d-flex align-items-center gap-2">
              <FiGithub className="text-primary" /> Repository Dashboard
            </h5>
            <div className="d-flex flex-column gap-3">
              <div className="d-flex justify-content-between border-bottom pb-2" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                <span className="text-secondary">Name:</span>
                <span className="text-white fw-semibold">{gitData.repository || 'N/A'}</span>
              </div>
              <div className="d-flex justify-content-between border-bottom pb-2" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                <span className="text-secondary">Git CLI Version:</span>
                <span className="text-light small">{gitData.git_version || 'N/A'}</span>
              </div>
              <div className="d-flex justify-content-between border-bottom pb-2" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                <span className="text-secondary">Default Branch:</span>
                <span className="text-light small"><code className="text-secondary">{gitData.default_branch || 'main'}</code></span>
              </div>
              <div className="d-flex justify-content-between border-bottom pb-2" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                <span className="text-secondary">Current Branch:</span>
                <span className="text-white d-flex align-items-center gap-2">
                  <FiGitBranch className="text-info" /> <code className="text-info">{gitData.branch || 'N/A'}</code>
                </span>
              </div>
              <div className="d-flex justify-content-between border-bottom pb-2" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                <span className="text-secondary">Remote Origin:</span>
                <span className="text-secondary text-truncate ms-2" title={gitData.remote} style={{ maxWidth: '65%', fontSize: '0.85rem' }}>
                  {gitData.remote || 'None'}
                </span>
              </div>
              <div className="d-flex justify-content-between border-bottom pb-2" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                <span className="text-secondary">Current HEAD:</span>
                <span className="text-white d-flex align-items-center gap-2">
                  <code className="text-warning">{gitData.last_commit?.hash || 'N/A'}</code>
                  <button 
                    className="btn btn-link p-0 text-secondary hover-white" 
                    title="Copy HEAD hash"
                    onClick={() => copyToClipboard(gitData.current_head || gitData.last_commit?.hash)}
                  >
                    <FiCopy size={14} className={copied ? 'text-success' : ''} />
                  </button>
                </span>
              </div>
              <div className="d-flex justify-content-between border-bottom pb-2" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                <span className="text-secondary">Last Remote Fetch:</span>
                <span className="text-light small">{gitData.last_fetch || 'N/A'}</span>
              </div>
              <div className="d-flex justify-content-between pb-1">
                <span className="text-secondary">Branch Offset:</span>
                <span className="text-light small">
                  {gitData.ahead} ahead, {gitData.behind} behind remote tracker
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Git Action / Local Commit Form */}
        <div className="col-lg-6">
          <div className="github-table-card p-4 h-100">
            <h5 className="text-white mb-4 d-flex align-items-center gap-2">
              <FiCommand className="text-warning" /> Local Working Tree Commit
            </h5>
            
            {gitData.status === 'Clean' ? (
              <div className="d-flex flex-column align-items-center justify-content-center h-75 text-center text-secondary">
                <FiCheckCircle size={40} className="text-success mb-2" />
                <p className="fw-medium mb-0">Working tree clean. No changes to commit.</p>
              </div>
            ) : (
              <form onSubmit={handleCommitSubmit} className="d-flex flex-column justify-content-between h-75">
                <div className="mb-3">
                  <label className="form-label text-secondary small">Commit Message</label>
                  <textarea 
                    className="form-control text-white" 
                    rows="3" 
                    placeholder="Enter commit message (e.g. Fix docker compose volume bindings)..."
                    style={{ backgroundColor: 'rgba(0,0,0,0.15)', borderColor: 'var(--border-color)', color: '#fff' }}
                    value={commitMessage}
                    onChange={(e) => setCommitMessage(e.target.value)}
                    required
                  />
                </div>
                <button 
                  type="submit" 
                  className="btn btn-warning w-100 d-flex align-items-center justify-content-center gap-2"
                  disabled={actionLoading || !commitMessage.trim()}
                >
                  <FiPlay /> Stage and Commit All Changes
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <div className="row g-4 mb-4">
        {/* Working Tree Files Status */}
        <div className="col-lg-6">
          <div className="github-table-card p-4">
            <h5 className="text-white mb-3 d-flex align-items-center gap-2">
              <FiFileText className="text-info" /> Working Tree Files ({gitData.files?.length || 0})
            </h5>
            
            <div className="table-responsive" style={{ maxHeight: '350px', overflowY: 'auto' }}>
              <table className="github-table">
                <thead>
                  <tr>
                    <th>File Path</th>
                    <th className="text-end">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="2"><div className="skeleton-text" /></td>
                    </tr>
                  ) : gitData.files && gitData.files.length > 0 ? (
                    gitData.files.map((file, idx) => (
                      <tr key={idx}>
                        <td className="text-white text-break font-monospace" style={{ fontSize: '0.8rem' }}>{file.file}</td>
                        <td className="text-end">
                          <span className={`fw-semibold text-capitalize ${getFileStatusClass(file.status)}`}>
                            {file.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="2" className="text-center py-4 text-secondary">
                        <FiCheckCircle size={24} className="mb-2 text-success opacity-75" />
                        <p className="mb-0 fw-medium">No modified or untracked files detected.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Recent Commit History (last 5) */}
        <div className="col-lg-6">
          <div className="github-table-card p-4">
            <h5 className="text-white mb-3 d-flex align-items-center gap-2">
              <FiClock className="text-warning" /> Recent Commits History
            </h5>
            
            <div className="d-flex flex-column gap-3" style={{ maxHeight: '350px', overflowY: 'auto' }}>
              {loading ? (
                <div className="skeleton-text" />
              ) : gitData.recent_commits && gitData.recent_commits.length > 0 ? (
                gitData.recent_commits.map((commit, idx) => (
                  <div key={idx} className="p-3 rounded border" style={{ backgroundColor: 'rgba(255,255,255,0.01)', borderColor: 'rgba(255,255,255,0.05)' }}>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <span className="text-white fw-semibold text-break" style={{ fontSize: '0.9rem' }}>
                        {commit.message}
                      </span>
                      <code 
                        className="text-warning font-monospace ps-2 cursor-pointer hover-white flex-shrink-0" 
                        title="Click to copy hash"
                        onClick={() => copyToClipboard(commit.hash)}
                        style={{ fontSize: '0.8rem' }}
                      >
                        {commit.hash}
                      </code>
                    </div>
                    <div className="d-flex justify-content-between text-secondary small" style={{ fontSize: '0.75rem' }}>
                      <span className="d-flex align-items-center gap-1">
                        <FiUser size={12} /> {commit.author}
                      </span>
                      <span className="d-flex align-items-center gap-1">
                        <FiCalendar size={12} /> {commit.date}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-secondary">
                  <p className="mb-0 fw-medium">No recent commits found.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Branches list card */}
        <div className="col-md-6">
          <div className="github-table-card p-4">
            <h5 className="text-white mb-3 d-flex align-items-center gap-2">
              <FiGitBranch className="text-info" /> Branches ({gitData.branches?.length || 0})
            </h5>
            <div className="d-flex flex-wrap gap-2">
              {loading ? (
                <div className="skeleton-text short" />
              ) : gitData.branches && gitData.branches.length > 0 ? (
                gitData.branches.map((b, idx) => (
                  <span 
                    key={idx} 
                    className={`badge ${b === gitData.branch ? 'bg-primary text-white' : 'bg-dark text-secondary border'}`}
                    style={{ borderColor: 'rgba(255,255,255,0.05)' }}
                  >
                    {b === gitData.branch ? '★ ' : ''}{b}
                  </span>
                ))
              ) : (
                <span className="text-secondary small">No branches detected.</span>
              )}
            </div>
          </div>
        </div>

        {/* Tags list card */}
        <div className="col-md-6">
          <div className="github-table-card p-4">
            <h5 className="text-white mb-3 d-flex align-items-center gap-2">
              <FiTag className="text-warning" /> Tags ({gitData.tags?.length || 0})
            </h5>
            <div className="d-flex flex-wrap gap-2">
              {loading ? (
                <div className="skeleton-text short" />
              ) : gitData.tags && gitData.tags.length > 0 ? (
                gitData.tags.map((t, idx) => (
                  <span 
                    key={idx} 
                    className="badge bg-dark text-secondary border"
                    style={{ borderColor: 'rgba(255,255,255,0.05)' }}
                  >
                    {t}
                  </span>
                ))
              ) : (
                <span className="text-secondary small">No tags configured in this repository.</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GitHub;
