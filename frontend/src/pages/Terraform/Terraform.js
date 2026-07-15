import React, { useState, useEffect } from 'react';
import './Terraform.css';
import { getTerraform } from '../../services/api';
import { 
  FiServer, 
  FiCheckCircle, 
  FiXCircle, 
  FiRefreshCw,
  FiAlertTriangle
} from 'react-icons/fi';

const Terraform = () => {
  const [tfData, setTfData] = useState({ installed: false, version: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchTfData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTerraform();
      setTfData(data || { installed: false, version: null });
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load Terraform daemon status.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTfData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchTfData();
  };

  return (
    <div className={`terraform-container ${isRefreshing ? 'refresh-animate' : ''}`}>
      {/* Header */}
      <div className="terraform-header-toolbar mb-3">
        <div>
          <h1 className="terraform-title">Terraform</h1>
          <p className="terraform-subtitle">Monitor HashiCorp Infrastructure as Code deployment configurations</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="terraform-actions-row mb-4">
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
            <strong className="d-block text-danger mb-1">Terraform Service Error</strong>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="tf-stat-card p-3 rounded" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary small font-medium">Installation Status</span>
              <FiServer className="text-primary" size={20} />
            </div>
            <div className="d-flex align-items-center mt-2">
              {loading ? (
                <span className="text-white">...</span>
              ) : tfData.installed ? (
                <span className="badge bg-success-soft text-success px-2 py-1" style={{ border: '1px solid currentColor' }}>
                  INSTALLED
                </span>
              ) : (
                <span className="badge bg-dark border-color text-light px-2 py-1" style={{ border: '1px solid var(--border-color)' }}>
                  NOT INSTALLED
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="tf-stat-card p-3 rounded" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary small font-medium">Version</span>
              <FiServer className="text-info" size={20} />
            </div>
            <div className="fs-5 fw-bold text-white">{loading ? '...' : (tfData.version || 'N/A')}</div>
            <div className="small text-muted mt-1">Binary revision number</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="tf-stat-card p-3 rounded" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary small font-medium">Configuration Files</span>
              <FiServer className="text-warning" size={20} />
            </div>
            <div className="fs-5 fw-bold text-white">{loading ? '...' : '0 files'}</div>
            <div className="small text-muted mt-1">Active deployment blocks</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="tf-stat-card p-3 rounded" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary small font-medium">Workspace</span>
              <FiServer className="text-success" size={20} />
            </div>
            <div className="fs-5 fw-bold text-white">{loading ? '...' : 'default'}</div>
            <div className="small text-muted mt-1">Active workspace scope</div>
          </div>
        </div>
      </div>

      {/* Large Status Widget Card */}
      <div className="tf-status-card-widget p-5 text-center rounded" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
        {loading ? (
          <div className="py-4">
            <div className="skeleton-text mb-2 mx-auto" style={{ width: '40%' }} />
            <div className="skeleton-text mx-auto" style={{ width: '20%' }} />
          </div>
        ) : tfData.installed ? (
          <div>
            <FiCheckCircle size={48} className="text-success mb-3" />
            <h2 className="text-white fw-bold mb-2">Terraform Installed</h2>
            <p className="text-secondary mb-0">Terraform engine is fully configured and ready to parse deployment scripts.</p>
          </div>
        ) : (
          <div>
            <FiXCircle size={48} className="text-secondary mb-3 opacity-60" />
            <h2 className="text-white fw-bold mb-2">Terraform Not Installed</h2>
            <p className="text-secondary mb-0">Terraform binary CLI was not detected on the remote host virtual machine.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Terraform;
