import React, { useState, useEffect } from 'react';
import './Firewall.css';
import { getFirewall } from '../../services/api';
import { 
  FiShield, 
  FiLock, 
  FiRefreshCw, 
  FiAlertTriangle,
  FiCheckCircle,
  FiSearch
} from 'react-icons/fi';

const Firewall = () => {
  const [firewallData, setFirewallData] = useState({ status: 'unknown', rules: [], count: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchFirewallData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getFirewall();
      setFirewallData(data || { status: 'unknown', rules: [], count: 0 });
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load firewall configurations.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFirewallData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchFirewallData();
  };

  const filteredRules = firewallData.rules
    ? firewallData.rules.filter(rule => 
        rule.rule.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rule.protocol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rule.port.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rule.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rule.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rule.action.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  // Compute stat metrics dynamically from the rules list
  const totalRules = firewallData.rules?.length || 0;
  const allowedRulesCount = firewallData.rules?.filter(r => r.action?.toLowerCase() === 'allow').length || 0;
  const blockedRulesCount = firewallData.rules?.filter(r => r.action?.toLowerCase() === 'block' || r.action?.toLowerCase() === 'deny').length || 0;

  const getStatusBadgeClass = (status) => {
    if (!status) return 'badge-secondary';
    switch (status.toLowerCase()) {
      case 'running':
      case 'active':
      case 'on':
        return 'badge-running';
      case 'stopped':
      case 'inactive':
      case 'off':
        return 'badge-error';
      default:
        return 'badge-secondary';
    }
  };

  const getActionBadgeClass = (action) => {
    if (!action) return 'badge-secondary';
    switch (action.toLowerCase()) {
      case 'allow':
      case 'accept':
        return 'badge-running';
      case 'block':
      case 'deny':
      case 'drop':
        return 'badge-error';
      default:
        return 'badge-secondary';
    }
  };

  return (
    <div className={`firewall-container ${isRefreshing ? 'refresh-animate' : ''}`}>
      {/* Header */}
      <div className="firewall-header-toolbar mb-3">
        <div>
          <h1 className="firewall-title">Firewall</h1>
          <p className="firewall-subtitle">Manage security access control lists, inbound routes and traffic filtering</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="firewall-actions-row">
        <div className="firewall-search position-relative">
          <FiSearch className="position-absolute start-3 top-50 translate-middle-y text-secondary" style={{ left: '0.75rem' }} />
          <input 
            type="text" 
            className="form-control ps-5 search-input" 
            placeholder="Search firewall rules..." 
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
            <strong className="d-block text-danger mb-1">Firewall Service Error</strong>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Stats row cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="firewall-stat-card p-3 rounded h-100" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary small font-medium">Firewall Status</span>
              <FiShield className="text-primary" size={20} />
            </div>
            <div className="d-flex align-items-center mt-2">
              <span className={`firewall-status-badge ${getStatusBadgeClass(firewallData.status)}`}>
                <span className="dot"></span>
                {loading ? 'LOADING...' : firewallData.status?.toUpperCase()}
              </span>
            </div>
            <div className="small text-muted mt-2">Default Policy: <code className="text-light">{firewallData.default_policy || 'N/A'}</code></div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="firewall-stat-card p-3 rounded h-100" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary small font-medium">Rules Overview</span>
              <FiLock className="text-info" size={20} />
            </div>
            <div className="fs-4 fw-bold text-white">{loading ? '...' : totalRules} Rules</div>
            <div className="small text-muted mt-1">
              IPv4: <span className="text-light">{firewallData.ipv4_rules || 0}</span> | IPv6: <span className="text-light">{firewallData.ipv6_rules || 0}</span>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="firewall-stat-card p-3 rounded h-100" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary small font-medium">Traffic Actions</span>
              <FiCheckCircle className="text-success" size={20} />
            </div>
            <div className="fs-6 text-white mt-1">
              <span className="text-success fw-bold">✓ Allowed:</span> {loading ? '...' : (firewallData.allowed_ports?.join(', ') || 'None')}
            </div>
            <div className="fs-6 text-white mt-1">
              <span className="text-danger fw-bold">✗ Blocked:</span> {loading ? '...' : (firewallData.blocked_ports?.join(', ') || 'None')}
            </div>
          </div>
        </div>
      </div>

      {/* Main rules table */}
      <div className="firewall-table-card">
        <div className="table-responsive">
          <table className="firewall-table">
            <thead>
              <tr>
                <th>Rule</th>
                <th>Protocol</th>
                <th>Port</th>
                <th>Source</th>
                <th>Destination</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1, 2, 3].map((i) => (
                  <tr key={i} className="placeholder-loading-row">
                    <td><div className="skeleton-text short" /></td>
                    <td><div className="skeleton-text" /></td>
                    <td><div className="skeleton-text short" /></td>
                    <td><div className="skeleton-text" /></td>
                    <td><div className="skeleton-text" /></td>
                    <td><div className="skeleton-text short" /></td>
                  </tr>
                ))
              ) : filteredRules.length > 0 ? (
                filteredRules.map((rule, idx) => (
                  <tr key={idx}>
                    <td>
                      <span className="fw-semibold text-white">{rule.rule}</span>
                    </td>
                    <td>
                      <code className="text-secondary">{rule.protocol}</code>
                    </td>
                    <td>
                      <code className="text-light">{rule.port}</code>
                    </td>
                    <td>
                      <span className="text-secondary" style={{ fontSize: '0.85rem' }}>{rule.source}</span>
                    </td>
                    <td>
                      <span className="text-secondary" style={{ fontSize: '0.85rem' }}>{rule.destination}</span>
                    </td>
                    <td>
                      <span className={`firewall-status-badge ${getActionBadgeClass(rule.action)}`}>
                        <span className="dot"></span>
                        {rule.action?.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-secondary">
                    <FiShield size={32} className="mb-2 text-secondary opacity-50" />
                    <p className="mb-0 fw-medium">No firewall rules detected.</p>
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

export default Firewall;
