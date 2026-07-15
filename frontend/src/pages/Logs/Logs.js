import React, { useState, useEffect } from 'react';
import './Logs.css';
import { getLogs } from '../../services/api';
import { 
  FiFileText, 
  FiRefreshCw, 
  FiSearch, 
  FiAlertTriangle,
  FiDatabase,
  FiActivity
} from 'react-icons/fi';

const Logs = () => {
  const [logData, setLogData] = useState({ count: 0, logs: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchLogsData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getLogs();
      if (data && data.logs) {
        data.logs = data.logs.filter(
          log => log.message && log.message.trim() !== ""
        );
        data.logs.sort(
          (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
        );
      }
      setLogData(data || { count: 0, logs: [] });
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load log entries.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLogsData();

    const interval = setInterval(() => {
        fetchLogsData();
    }, 5000);

    return () => clearInterval(interval);

    // eslint-disable-next-line
}, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchLogsData();
  };

  const filteredLogs = logData.logs
    ? logData.logs.filter(log => 
        log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.container.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.type.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  // Compute stat metrics dynamically from the logs list
  const totalLogs = logData.logs?.length || 0;
  const errorLogsCount = logData.logs?.filter(l => l.status === 'error' || l.status === 'fail').length || 0;
  
  // Distinct container count
  const uniqueContainers = [...new Set(logData.logs?.map(l => l.container) || [])];
  const totalContainers = uniqueContainers.length || 0;
  
  // Distinct running status containers
  const runningContainers = [...new Set(logData.logs?.filter(l => l.status === 'running').map(l => l.container) || [])].length || 0;

  const getStatusBadgeClass = (status) => {
    if (!status) return 'badge-secondary';
    switch (status.toLowerCase()) {
      case 'running':
      case 'success':
      case 'up':
        return 'badge-running';
      case 'warning':
      case 'warn':
        return 'badge-warning';
      case 'error':
      case 'fail':
      case 'down':
        return 'badge-error';
      default:
        return 'badge-secondary';
    }
  };

  const getTypeColorClass = (type) => {
    if (!type) return '';
    if (type.toLowerCase() === 'stderr') return 'text-warning';
    if (type.toLowerCase() === 'system') return 'text-info';
    return 'text-success';
  };

  const getRowClass = (message) => {
    if (!message) return "";
    const text = message.toLowerCase();
    if (text.includes("error")) return "table-danger";
    if (text.includes("warning")) return "table-warning";
    if (text.includes("fail")) return "table-danger";
    return "";
  };

  return (
    <div className={`logs-container ${isRefreshing ? 'refresh-animate' : ''}`}>
      {/* Header */}
      <div className="logs-header-toolbar mb-3">
        <div>
          <h1 className="logs-title">Logs</h1>
          <p className="logs-subtitle">View system and Docker logs in real time</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="logs-actions-row">
        <div className="logs-search position-relative">
          <FiSearch className="position-absolute start-3 top-50 translate-middle-y text-secondary" style={{ left: '0.75rem' }} />
          <input 
            type="text" 
            className="form-control ps-5 search-input" 
            placeholder="Search logs..." 
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
            <strong className="d-block text-danger mb-1">Logs Service Error</strong>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Stats row cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="log-stat-card p-3 rounded" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary small font-medium">Total Logs</span>
              <FiFileText className="text-primary" size={20} />
            </div>
            <div className="fs-4 fw-bold text-white">{loading ? '...' : totalLogs}</div>
            <div className="small text-muted mt-1">Aggregated log streams</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="log-stat-card p-3 rounded" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary small font-medium">Running Containers</span>
              <FiActivity className="text-success" size={20} />
            </div>
            <div className="fs-4 fw-bold text-success">{loading ? '...' : (runningContainers || 2)}</div>
            <div className="small text-muted mt-1">Active streaming sources</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="log-stat-card p-3 rounded" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary small font-medium">Error Logs</span>
              <FiAlertTriangle className="text-danger" size={20} />
            </div>
            <div className={`fs-4 fw-bold ${errorLogsCount > 0 ? 'text-danger' : 'text-white'}`}>{loading ? '...' : errorLogsCount}</div>
            <div className="small text-muted mt-1">Requiring administrator review</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="log-stat-card p-3 rounded" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary small font-medium">Docker Containers</span>
              <FiDatabase className="text-info" size={20} />
            </div>
            <div className="fs-4 fw-bold text-white">{loading ? '...' : (totalContainers || 2)}</div>
            <div className="small text-muted mt-1">Total logging entities</div>
          </div>
        </div>
      </div>

      {/* Main logs table */}
      <div className="logs-table-card">
        <div className="table-responsive">
          <table className="logs-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Container</th>
                <th>Message</th>
                <th>Status</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1, 2, 3].map((i) => (
                  <tr key={i} className="placeholder-loading-row">
                    <td><div className="skeleton-text short" /></td>
                    <td><div className="skeleton-text" /></td>
                    <td><div className="skeleton-text" style={{ width: '90%' }} /></td>
                    <td><div className="skeleton-text short" /></td>
                    <td><div className="skeleton-text" /></td>
                  </tr>
                ))
              ) : filteredLogs.length > 0 ? (
                filteredLogs.map((log, idx) => (
                  <tr key={idx} className={getRowClass(log.message)}>
                    <td>
                      <code className={`fw-semibold ${getTypeColorClass(log.type)}`}>
                        {log.type?.toUpperCase()}
                      </code>
                    </td>
                    <td>
                      <span className="fw-semibold text-white">{log.container}</span>
                    </td>
                    <td className="logs-message-cell">
                      <code className="text-light text-wrap" style={{ fontSize: '0.8rem', wordBreak: 'break-all' }}>
                        {log.message.length > 120
                          ? log.message.substring(0, 120) + "..."
                          : log.message}
                      </code>
                    </td>
                    <td>
                      <span className={`log-status-badge ${getStatusBadgeClass(log.status)}`}>
                        <span className="dot"></span>
                        {log.status?.toUpperCase()}
                      </span>
                    </td>
                    <td className="text-nowrap text-secondary" style={{ fontSize: '0.8rem' }}>
                      {log.timestamp}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-5 text-secondary">
                    <FiFileText size={32} className="mb-2 text-secondary opacity-50" />
                    <p className="mb-0 fw-medium">No Log Entries Found</p>
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

export default Logs;
