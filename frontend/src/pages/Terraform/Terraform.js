import React, { useState, useEffect } from 'react';
import './Terraform.css';
import { 
  getTerraform, 
  runTerraformPlan, 
  runTerraformApply, 
  runTerraformDestroy 
} from '../../services/api';
import { 
  FiServer, 
  FiCheckCircle, 
  FiXCircle, 
  FiRefreshCw,
  FiAlertTriangle,
  FiPlay,
  FiTerminal,
  FiFileText,
  FiTrash2,
  FiCpu
} from 'react-icons/fi';

const Terraform = () => {
  const [tfData, setTfData] = useState({ 
    installed: false, 
    version: null,
    files: [],
    workspace: 'default',
    resources: [],
    outputs: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Command Execution State
  const [actionLoading, setActionLoading] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState('');
  const [showConfirm, setShowConfirm] = useState(null); // 'apply' or 'destroy'

  const fetchTfData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTerraform();
      setTfData(data || { 
        installed: false, 
        version: null,
        files: [],
        workspace: 'default',
        resources: [],
        outputs: {}
      });
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
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchTfData();
  };

  const executeAction = async (actionFn, actionName) => {
    try {
      setActionLoading(true);
      setConsoleOutput(`Running: terraform ${actionName}...\n\n`);
      setError(null);
      
      const res = await actionFn();
      
      let logs = '';
      if (res.stdout) logs += res.stdout;
      if (res.stderr) logs += `\nERROR LOGS:\n${res.stderr}`;
      
      setConsoleOutput(logs || `terraform ${actionName} finished with no output logs.`);
      
      if (res.success) {
        await fetchTfData();
      } else {
        setError(`Terraform ${actionName} execution failed. Review console logs.`);
      }
    } catch (err) {
      console.error(err);
      setConsoleOutput(prev => prev + `\nFATAL EXCEPTION: ${err.message}`);
      setError(err.response?.data?.detail || err.message || `Failed to execute terraform ${actionName}.`);
    } finally {
      setActionLoading(false);
      setShowConfirm(null);
    }
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
        <div className="d-flex gap-2 flex-wrap">
          <button 
            className="btn btn-primary d-flex align-items-center gap-2"
            disabled={actionLoading || loading || !tfData.installed}
            onClick={() => executeAction(runTerraformPlan, 'plan')}
          >
            <FiPlay /> Plan Changes
          </button>
          <button 
            className="btn btn-outline-success text-white d-flex align-items-center gap-2"
            style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}
            disabled={actionLoading || loading || !tfData.installed}
            onClick={() => setShowConfirm('apply')}
          >
            <FiCheckCircle /> Apply Config
          </button>
          <button 
            className="btn btn-outline-danger text-white d-flex align-items-center gap-2"
            style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}
            disabled={actionLoading || loading || !tfData.installed}
            onClick={() => setShowConfirm('destroy')}
          >
            <FiTrash2 /> Destroy Stack
          </button>
        </div>
        <div className="ms-auto">
          <button className="btn btn-outline-secondary border-color text-white d-flex align-items-center gap-2" onClick={handleRefresh} style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
            <FiRefreshCw className={loading ? 'spin-animation' : ''} /> Refresh Telemetry
          </button>
        </div>
      </div>

      {/* Confirmation Dialog Modal */}
      {showConfirm && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center z-3" style={{ backgroundColor: 'rgba(7, 17, 31, 0.8)' }}>
          <div className="p-4 rounded border text-center" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)', maxWidth: '400px' }}>
            <FiAlertTriangle className="text-warning mb-3" size={40} />
            <h5 className="text-white mb-2">Confirm Terraform {showConfirm.toUpperCase()}</h5>
            <p className="text-secondary small mb-4">
              Are you sure you want to execute this action? 
              {showConfirm === 'destroy' && ' This will completely delete all managed cloud infrastructure resources.'}
            </p>
            <div className="d-flex gap-2 justify-content-center">
              <button 
                className={`btn ${showConfirm === 'destroy' ? 'btn-danger' : 'btn-success'}`}
                onClick={() => {
                  if (showConfirm === 'apply') executeAction(runTerraformApply, 'apply');
                  if (showConfirm === 'destroy') executeAction(runTerraformDestroy, 'destroy');
                }}
              >
                Confirm {showConfirm.toUpperCase()}
              </button>
              <button 
                className="btn btn-outline-secondary"
                onClick={() => setShowConfirm(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

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
                <span className="badge bg-success-soft text-success px-2 py-1" style={{ border: '1px solid currentColor', fontSize: '0.75rem' }}>
                  🟢 INSTALLED
                </span>
              ) : (
                <span className="badge bg-danger-soft text-danger px-2 py-1" style={{ border: '1px solid currentColor', fontSize: '0.75rem' }}>
                  🔴 NOT INSTALLED
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
        <div className="col-md-2">
          <div className="tf-stat-card p-3 rounded" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary small font-medium">Config Files</span>
              <FiFileText className="text-warning" size={20} />
            </div>
            <div className="fs-5 fw-bold text-white">{loading ? '...' : `${tfData.files?.length || 0} files`}</div>
            <div className="small text-muted mt-1">Active code templates</div>
          </div>
        </div>
        <div className="col-md-2">
          <div className="tf-stat-card p-3 rounded" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary small font-medium">State Resources</span>
              <FiCpu className="text-danger" size={20} />
            </div>
            <div className="fs-5 fw-bold text-white">{loading ? '...' : `${tfData.resources?.length || 0} items`}</div>
            <div className="small text-muted mt-1">Tracked active stack</div>
          </div>
        </div>
        <div className="col-md-2">
          <div className="tf-stat-card p-3 rounded" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary small font-medium">Workspace</span>
              <FiServer className="text-success" size={20} />
            </div>
            <div className="fs-5 fw-bold text-white text-truncate">{loading ? '...' : (tfData.workspace || 'default')}</div>
            <div className="small text-muted mt-1">Active workspace scope</div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* State resources and files */}
        <div className="col-lg-5">
          <div className="github-table-card p-4 mb-4">
            <h5 className="text-white mb-3 d-flex align-items-center gap-2">
              <FiFileText className="text-primary" /> Configuration Files
            </h5>
            <div className="table-responsive" style={{ maxHeight: '180px', overflowY: 'auto' }}>
              <table className="github-table">
                <thead>
                  <tr>
                    <th>Filename</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td><div className="skeleton-text" /></td></tr>
                  ) : tfData.files && tfData.files.length > 0 ? (
                    tfData.files.map((file, idx) => (
                      <tr key={idx}>
                        <td className="font-monospace text-white" style={{ fontSize: '0.85rem' }}>{file}</td>
                      </tr>
                    ))
                  ) : (
                    <tr><td className="text-secondary text-center">No .tf config blocks found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="github-table-card p-4">
            <h5 className="text-white mb-3 d-flex align-items-center gap-2">
              <FiCpu className="text-danger" /> State Resources List ({tfData.resources?.length || 0})
            </h5>
            <div className="table-responsive" style={{ maxHeight: '280px', overflowY: 'auto' }}>
              <table className="github-table">
                <thead>
                  <tr>
                    <th>Resource Address</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td><div className="skeleton-text" /></td></tr>
                  ) : tfData.resources && tfData.resources.length > 0 ? (
                    tfData.resources.map((res, idx) => (
                      <tr key={idx}>
                        <td className="font-monospace text-light" style={{ fontSize: '0.8rem' }}>{res}</td>
                      </tr>
                    ))
                  ) : (
                    <tr><td className="text-secondary text-center">No active state tracked resources.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Console logs */}
        <div className="col-lg-7">
          <div className="github-table-card p-4 h-100 d-flex flex-column" style={{ minHeight: '450px' }}>
            <h5 className="text-white mb-3 d-flex align-items-center gap-2">
              <FiTerminal className="text-info" /> Execution Live Output Console
            </h5>
            <pre 
              className="bg-dark p-3 rounded text-break font-monospace flex-grow-1 mb-0" 
              style={{ 
                color: '#76ff03', 
                backgroundColor: 'rgba(0, 0, 0, 0.45)', 
                border: '1px solid var(--border-color)',
                fontSize: '0.85rem',
                overflowY: 'auto',
                maxHeight: '450px'
              }}
            >
              {consoleOutput || 'Console idle. Trigger an action (Plan, Apply, Destroy) to stream logs...'}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terraform;
