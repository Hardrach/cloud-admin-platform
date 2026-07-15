import React, { useState, useEffect } from 'react';
import './Alerts.css';
import { getAlerts } from '../../services/api';
import { 
  FiAlertTriangle, 
  FiBell, 
  FiRefreshCw, 
  FiCheckCircle, 
  FiSearch 
} from 'react-icons/fi';

const Alerts = () => {
  const [alertData, setAlertData] = useState({ count: 0, alerts: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchAlertsData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAlerts();
      setAlertData(data || { count: 0, alerts: [] });
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load active security alerts.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAlertsData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchAlertsData();
  };

  const filteredAlerts = alertData.alerts
    ? alertData.alerts.filter(alert => 
        alert.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alert.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alert.severity.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  // Compute stat metrics dynamically from the alerts list
  const activeAlerts = alertData.alerts?.length || 0;
  const criticalCount = alertData.alerts?.filter(a => a.severity === 'critical' || a.severity === 'danger').length || 0;
  const warningCount = alertData.alerts?.filter(a => a.severity === 'warning').length || 0;
  
  // Healthy Services: e.g. 5 minus distinct services with critical issues
  const servicesWithCritical = [...new Set(alertData.alerts?.filter(a => a.severity === 'critical').map(a => a.service) || [])];
  const healthyServices = Math.max(0, 5 - servicesWithCritical.length);

  const getSeverityBadgeClass = (severity) => {
    if (!severity) return 'badge-secondary';
    switch (severity.toLowerCase()) {
      case 'success':
      case 'ok':
        return 'badge-success';
      case 'warning':
      case 'warn':
        return 'badge-warning';
      case 'critical':
      case 'danger':
      case 'error':
        return 'badge-critical';
      case 'info':
        return 'badge-info';
      default:
        return 'badge-secondary';
    }
  };

  return (
    <div className={`alerts-container ${isRefreshing ? 'refresh-animate' : ''}`}>
      {/* Header */}
      <div className="alerts-header-toolbar mb-3">
        <div>
          <h1 className="alerts-title">Alerts</h1>
          <p className="alerts-subtitle">Monitor real-time system warnings and service outages</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="alerts-actions-row">
        <div className="alerts-search position-relative">
          <FiSearch className="position-absolute start-3 top-50 translate-middle-y text-secondary" style={{ left: '0.75rem' }} />
          <input 
            type="text" 
            className="form-control ps-5 search-input" 
            placeholder="Search alerts..." 
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
            <strong className="d-block text-danger mb-1">Alerts Service Error</strong>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Stats row cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="alert-stat-card p-3 rounded" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary small font-medium">Active Alerts</span>
              <FiBell className={activeAlerts > 0 ? 'text-warning' : 'text-primary'} size={20} />
            </div>
            <div className={`fs-4 fw-bold ${activeAlerts > 0 ? 'text-warning' : 'text-white'}`}>{loading ? '...' : activeAlerts}</div>
            <div className="small text-muted mt-1">Pending active triggers</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="alert-stat-card p-3 rounded" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary small font-medium">Critical</span>
              <FiAlertTriangle className="text-danger" size={20} />
            </div>
            <div className={`fs-4 fw-bold ${criticalCount > 0 ? 'text-danger' : 'text-white'}`}>{loading ? '...' : criticalCount}</div>
            <div className="small text-muted mt-1">Requiring immediate response</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="alert-stat-card p-3 rounded" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary small font-medium">Warning</span>
              <FiAlertTriangle className="text-warning" size={20} />
            </div>
            <div className={`fs-4 fw-bold ${warningCount > 0 ? 'text-warning' : 'text-white'}`}>{loading ? '...' : warningCount}</div>
            <div className="small text-muted mt-1">Non-critical policy triggers</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="alert-stat-card p-3 rounded" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary small font-medium">Healthy Services</span>
              <FiCheckCircle className="text-success" size={20} />
            </div>
            <div className="fs-4 fw-bold text-success">{loading ? '...' : `${healthyServices}/5`}</div>
            <div className="small text-muted mt-1">Online cloud applications</div>
          </div>
        </div>
      </div>

      {/* Main alerts table */}
      <div className="alerts-table-card">
        <div className="table-responsive">
          <table className="alerts-table">
            <thead>
              <tr>
                <th>Severity</th>
                <th>Service</th>
                <th>Message</th>
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
                  </tr>
                ))
              ) : filteredAlerts.length > 0 ? (
                filteredAlerts.map((alert, idx) => (
                  <tr key={idx}>
                    <td>
                      <span className={`alert-status-badge ${getSeverityBadgeClass(alert.severity)}`}>
                        <span className="dot"></span>
                        {alert.severity?.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <span className="fw-semibold text-white">{alert.service}</span>
                    </td>
                    <td className="alerts-message-cell">
                      <span className="text-light" style={{ fontSize: '0.85rem' }}>
                        {alert.message}
                      </span>
                    </td>
                    <td className="text-nowrap text-secondary" style={{ fontSize: '0.8rem' }}>
                      {alert.timestamp}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-5 text-secondary">
                    <FiCheckCircle size={32} className="mb-2 text-success opacity-50" />
                    <p className="mb-0 fw-medium text-success">No active alerts.</p>
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

export default Alerts;
