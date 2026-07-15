import React, { useState, useEffect } from 'react';
import './Networks.css';
import { getNetworks } from '../../services/api';
import { 
  FiRefreshCw, 
  FiSearch, 
  FiGlobe, 
  FiX, 
  FiDatabase, 
  FiAlertTriangle,
  FiInfo,
  FiServer,
  FiLock,
  FiCloud
} from 'react-icons/fi';

const Networks = () => {
  const [networkData, setNetworkData] = useState({ docker_networks: [], interfaces: [], azure: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNetworkId, setSelectedNetworkId] = useState(null);

  const getDriverBadgeClass = (driver) => {
    if (!driver) return 'badge-none';
    switch (driver.toLowerCase()) {
      case 'bridge': return 'badge-bridge';
      case 'host': return 'badge-host';
      default: return 'badge-none';
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getNetworks();
      setNetworkData(res || { docker_networks: [], interfaces: [], azure: {} });
      if (res && res.docker_networks && res.docker_networks.length > 0 && !selectedNetworkId) {
        setSelectedNetworkId(res.docker_networks[0].name);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load network configurations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefresh = () => {
    loadData();
  };

  const filteredDockerNetworks = networkData.docker_networks
    ? networkData.docker_networks.filter(n => n.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const selectedNetwork = networkData.docker_networks?.find(n => n.name === selectedNetworkId);

  return (
    <div className="networks-container">
      {/* Header */}
      <div className="networks-header-toolbar">
        <div>
          <h1 className="networks-title">Networks</h1>
          <p className="networks-subtitle">Real-time status of Docker bridge/overlay networks and host network interfaces</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="networks-actions-row">
        <div className="networks-search position-relative">
          <FiSearch className="position-absolute start-3 top-50 translate-middle-y text-secondary" style={{ left: '0.75rem' }} />
          <input 
            type="text" 
            className="form-control ps-5 search-input" 
            placeholder="Search Docker networks..." 
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

      {/* Error placeholder alert */}
      {error && (
        <div className="alert alert-danger border-0 mb-4 d-flex align-items-center gap-3 text-white" style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)' }} role="alert">
          <FiAlertTriangle className="text-danger flex-shrink-0" size={24} />
          <div>
            <strong className="d-block text-danger mb-1">Network Daemon Error</strong>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Main split grid */}
      <div className="networks-main-layout">
        
        {/* Left Section (Table & Cards) */}
        <div className="networks-list-section">
          
          {/* Section: Docker Networks */}
          <div className="networks-section-title mb-3">Docker Networks</div>
          <div className="networks-table-card mb-4">
            <div className="table-responsive">
              <table className="networks-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Driver</th>
                    <th>Subnet</th>
                    <th>Containers</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    [1, 2, 3].map((i) => (
                      <tr key={i} className="placeholder-loading-row">
                        <td><div className="skeleton-text" /></td>
                        <td><div className="skeleton-text" /></td>
                        <td><div className="skeleton-text" /></td>
                        <td><div className="skeleton-text short" /></td>
                        <td><div className="skeleton-text" /></td>
                      </tr>
                    ))
                  ) : filteredDockerNetworks.length > 0 ? (
                    filteredDockerNetworks.map((net) => (
                      <tr key={net.name}>
                        <td>
                          <div className="fw-semibold d-flex align-items-center gap-2">
                            <FiGlobe className="text-cyan" />
                            <span>{net.name}</span>
                          </div>
                        </td>
                        <td>
                          <span className={`driver-badge ${getDriverBadgeClass(net.driver)}`}>
                            <span className="dot"></span>
                            {net.driver}
                          </span>
                        </td>
                        <td>
                          <code className="text-light" style={{ fontSize: '0.8rem' }}>{net.subnet || '-'}</code>
                        </td>
                        <td>
                          <span className={`badge px-2 py-1 ${net.containers > 1 ? 'bg-success-soft text-success' : (net.containers === 1 ? 'bg-warning-soft text-warning' : 'bg-secondary-soft text-secondary')}`} style={{ border: '1px solid currentColor' }}>
                            {net.containers} {net.containers === 1 ? 'Container' : 'Containers'}
                          </span>
                        </td>
                        <td>
                          <div className="networks-row-actions justify-content-end d-flex">
                            <button 
                              className={`btn-networks-action btn-details ${selectedNetworkId === net.name ? 'active' : ''}`} 
                              title="Details"
                              onClick={() => setSelectedNetworkId(selectedNetworkId === net.name ? null : net.name)}
                            >
                              <FiInfo />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center py-5 text-secondary">
                        <FiDatabase size={32} className="mb-2 text-secondary opacity-50" />
                        <p className="mb-0 fw-medium">No Docker Networks Connected</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Grid for Interfaces & Azure Network */}
          <div className="row g-4">
            
            {/* Section: Interfaces */}
            <div className="col-md-7">
              <div className="networks-section-title mb-3">Interfaces</div>
              <div className="d-flex flex-column gap-3">
                {loading ? (
                  [1, 2].map((i) => (
                    <div key={i} className="interface-card p-3 border-color rounded position-relative overflow-hidden" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
                      <div className="skeleton-text mb-2" />
                      <div className="skeleton-text short" />
                    </div>
                  ))
                ) : networkData.interfaces?.length > 0 ? (
                  networkData.interfaces.map((iface, idx) => (
                    <div key={idx} className="interface-card p-3 border-color rounded" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <div className="fw-bold text-white d-flex align-items-center gap-2">
                          <FiServer className="text-info" />
                          {iface.name}
                        </div>
                        <span className={`badge ${iface.status?.toLowerCase() === 'up' ? 'bg-success' : 'bg-warning'} px-2 py-1`}>
                          {iface.status}
                        </span>
                      </div>
                      <div className="row g-2 text-secondary small">
                        <div className="col-6">
                          <span className="d-block text-muted" style={{ fontSize: '0.75rem' }}>IP Address</span>
                          <code className="text-light">{iface.ip || '-'}</code>
                        </div>
                        <div className="col-3">
                          <span className="d-block text-muted" style={{ fontSize: '0.75rem' }}>MTU</span>
                          <span className="text-light">{iface.mtu || '-'}</span>
                        </div>
                        <div className="col-3">
                          <span className="d-block text-muted" style={{ fontSize: '0.75rem' }}>Speed</span>
                          <span className="text-light" style={{ fontSize: '0.75rem' }}>{iface.speed || '-'}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-secondary border-color rounded" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
                    No Interfaces Found
                  </div>
                )}
              </div>
            </div>

            {/* Section: Azure Network */}
            <div className="col-md-5">
              <div className="networks-section-title mb-3">Azure Network</div>
              <div className="azure-card p-3 rounded" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
                {loading ? (
                  <div className="py-4">
                    <div className="skeleton-text mb-2" />
                    <div className="skeleton-text mb-2" />
                    <div className="skeleton-text" />
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-3">
                    <div className="azure-stat-item">
                      <div className="azure-stat-label d-flex align-items-center">
                        <FiGlobe className="text-info me-2" />
                        Public IP
                      </div>
                      <div className="azure-stat-value fw-semibold text-white"><code>{networkData.azure?.public_ip || 'N/A'}</code></div>
                    </div>
                    <div className="azure-stat-item">
                      <div className="azure-stat-label d-flex align-items-center">
                        <FiLock className="text-warning me-2" />
                        Private IP
                      </div>
                      <div className="azure-stat-value fw-semibold text-white"><code>{networkData.azure?.private_ip || 'N/A'}</code></div>
                    </div>
                    <div className="azure-stat-item">
                      <div className="azure-stat-label d-flex align-items-center">
                        <FiCloud className="text-primary me-2" />
                        Virtual Network
                      </div>
                      <div className="azure-stat-value text-white font-medium">{networkData.azure?.vnet || 'N/A'}</div>
                    </div>
                    <div className="azure-stat-item">
                      <div className="azure-stat-label d-flex align-items-center">
                        <FiServer className="text-success me-2" />
                        Subnet
                      </div>
                      <div className="azure-stat-value text-white font-medium">{networkData.azure?.subnet || 'N/A'}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>

        {/* Right side details drawer (for selected Docker network) */}
        {selectedNetwork && (
          <div className="networks-details-panel">
            <div className="networks-panel-header">
              <div className="d-flex align-items-center gap-2">
                <FiGlobe className="text-secondary" />
                <span className="fw-bold text-white text-truncate" style={{ maxWidth: '220px' }}>
                  {selectedNetwork.name}
                </span>
              </div>
              <button 
                className="close-panel-btn" 
                onClick={() => setSelectedNetworkId(null)}
                aria-label="Close details"
              >
                <FiX />
              </button>
            </div>
            
            <div className="networks-panel-body">
              {/* Properties */}
              <div>
                <div className="networks-detail-group-title">Network Details</div>
                <div className="networks-detail-row">
                  <span className="networks-detail-label">Name</span>
                  <span className="networks-detail-value">{selectedNetwork.name}</span>
                </div>
                <div className="networks-detail-row">
                  <span className="networks-detail-label">Driver</span>
                  <span className="networks-detail-value"><code>{selectedNetwork.driver}</code></span>
                </div>
                <div className="networks-detail-row">
                  <span className="networks-detail-label">Scope</span>
                  <span className="networks-detail-value">{selectedNetwork.scope}</span>
                </div>
                <div className="networks-detail-row">
                  <span className="networks-detail-label">Subnet</span>
                  <span className="networks-detail-value"><code>{selectedNetwork.subnet || '-'}</code></span>
                </div>
              </div>

              {/* Containers list */}
              <div>
                <div className="networks-detail-group-title">Containers</div>
                <div className="text-white mt-2" style={{ fontSize: '0.85rem' }}>
                  {selectedNetwork.containers > 0 
                    ? `${selectedNetwork.containers} container${selectedNetwork.containers > 1 ? 's' : ''} attached` 
                    : "This network has no connected containers."
                  }
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Networks;
