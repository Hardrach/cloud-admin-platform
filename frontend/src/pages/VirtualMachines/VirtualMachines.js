import React, { useState, useEffect } from 'react';
import './VirtualMachines.css';
import {
  getVirtualMachines,
  startVirtualMachine,
  stopVirtualMachine,
  restartVirtualMachine,
  deallocateVirtualMachine
} from "../../services/api";
import {
  FiRefreshCw,
  FiPlus,
  FiPlay,
  FiSquare,
  FiRotateCw,
  FiTerminal,
  FiInfo,
  FiX,
  FiMonitor,
  FiAlertTriangle
} from 'react-icons/fi';
import { FaUbuntu } from 'react-icons/fa';

const VirtualMachines = () => {
  const [virtualMachines, setVirtualMachines] = useState([]);
  const [selectedVmId, setSelectedVmId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadVirtualMachines = async () => {
    try {
      const data = await getVirtualMachines();
      setVirtualMachines(data);
      if (data && data.length > 0 && !selectedVmId) {
        setSelectedVmId(data[0].id);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load compute virtual machines.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadVirtualMachines();

    const interval = setInterval(loadVirtualMachines, 10000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    loadVirtualMachines();
  };

  const handleStart = async (vm) => {
    try {
      setError(null);
      await startVirtualMachine(vm.name);
      await loadVirtualMachines();
    } catch (err) {
      setError(`Failed to start VM ${vm.name}: ${err.message}`);
    }
  };

  const handleStop = async (vm) => {
    try {
      setError(null);
      await stopVirtualMachine(vm.name);
      await loadVirtualMachines();
    } catch (err) {
      setError(`Failed to stop VM ${vm.name}: ${err.message}`);
    }
  };

  const handleRestart = async (vm) => {
    try {
      setError(null);
      await restartVirtualMachine(vm.name);
      await loadVirtualMachines();
    } catch (err) {
      setError(`Failed to restart VM ${vm.name}: ${err.message}`);
    }
  };

  const handleDeallocate = async (vm) => {
    try {
      setError(null);
      await deallocateVirtualMachine(vm.name);
      await loadVirtualMachines();
    } catch (err) {
      setError(`Failed to deallocate VM ${vm.name}: ${err.message}`);
    }
  };

  // Toggle details drawer helper
  const handleDetailsClick = (vmId) => {
    if (selectedVmId === vmId) {
      setSelectedVmId(null);
    } else {
      setSelectedVmId(vmId);
    }
  };

  const selectedVm = virtualMachines.find(vm => vm.id === selectedVmId);

  const getStatusClass = (status) => {
    if (!status) return '';
    switch (status.toLowerCase()) {
      case 'running': return 'status-running';
      case 'stopped': return 'status-stopped';
      case 'deallocated': return 'status-stopped';
      case 'starting': return 'status-starting';
      default: return '';
    }
  };

  const hasStoppedVm = virtualMachines.some(
    (vm) => vm.status?.toLowerCase() === 'stopped' || vm.status?.toLowerCase() === 'deallocated'
  );

  return (
    <div className={`vm-container ${isRefreshing ? 'refresh-animate' : ''}`}>
      {/* Top Toolbar */}
      <div className="vm-header-toolbar">
        <div>
          <h1 className="vm-title">Virtual Machines</h1>
          <p className="vm-subtitle">Manage and monitor compute resources in your subscription</p>
        </div>
        <div className="d-flex gap-2">
          <button 
            className="btn btn-outline-secondary border-color text-white d-flex align-items-center gap-2" 
            onClick={handleManualRefresh} 
            style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}
          >
            <FiRefreshCw className={loading ? 'spin-animation' : ''} /> Refresh
          </button>
          <button className="btn btn-primary d-flex align-items-center gap-2" style={{ backgroundColor: 'var(--primary-color)' }}>
            <FiPlus /> Create VM
          </button>
        </div>
      </div>

      {/* Stopped VM hosting warning alert banner */}
      {hasStoppedVm && (
        <div className="alert alert-warning border-0 mb-4 d-flex align-items-start gap-3 text-white" style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.3)' }} role="alert">
          <FiAlertTriangle className="text-warning flex-shrink-0 mt-1" size={24} />
          <div>
            <strong className="d-block text-warning mb-1">VM Stopped/Deallocated</strong>
            <span style={{ fontSize: '0.9rem', lineHeight: '1.4' }}>
              The backend is hosted on this virtual machine. Since the VM is stopped, the backend is unavailable and cannot send the Start command. Please start the VM from the Azure Portal.
            </span>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="alert alert-danger border-0 mb-4 d-flex align-items-center gap-3 text-white" style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)' }} role="alert">
          <FiAlertTriangle className="text-danger flex-shrink-0" size={24} />
          <div>
            <strong className="d-block text-danger mb-1">Compute Action Error</strong>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Main layout splitting List table and Slide-over Details panel */}
      <div className="vm-main-layout">

        {/* Table Listing section */}
        <div className="vm-list-section">
          <div className="vm-table-card">
            <div className="table-responsive">
              <table className="vm-table">
                <thead>
                  <tr>
                    <th>VM Name</th>
                    <th>Status</th>
                    <th>Operating System</th>
                    <th>Azure Region</th>
                    <th>Public IP</th>
                    <th>CPU Usage</th>
                    <th>Memory Usage</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && virtualMachines.length === 0 ? (
                    [1].map((i) => (
                      <tr key={i} className="placeholder-loading-row">
                        <td><div className="skeleton-text short" /></td>
                        <td><div className="skeleton-text short" /></td>
                        <td><div className="skeleton-text" /></td>
                        <td><div className="skeleton-text" /></td>
                        <td><div className="skeleton-text" /></td>
                        <td><div className="skeleton-text short" /></td>
                        <td><div className="skeleton-text short" /></td>
                        <td><div className="skeleton-text" /></td>
                      </tr>
                    ))
                  ) : virtualMachines.length > 0 ? (
                    virtualMachines.map((vm) => {
                      const isStopped = vm.status?.toLowerCase() === 'stopped' || vm.status?.toLowerCase() === 'deallocated';
                      return (
                        <tr key={vm.id} className={selectedVmId === vm.id ? 'table-active-row' : ''}>
                          <td>
                            <div className="vm-name-cell">
                              <FiMonitor className="text-primary" />
                              <span className="fw-semibold text-white">{vm.name}</span>
                            </div>
                          </td>
                          <td>
                            <span className={`vm-status-badge ${getStatusClass(vm.status)}`}>
                              <span className="dot"></span>
                              {vm.status}
                            </span>
                          </td>
                          <td>
                            <div className="d-flex align-items-center gap-2 text-secondary">
                              <FaUbuntu className="os-icon text-danger" />
                              <span>{vm.os}</span>
                            </div>
                          </td>
                          <td>
                            <span className="text-secondary">{vm.region}</span>
                          </td>
                          <td>
                            <code className="text-light">{vm.public_ip}</code>
                          </td>
                          <td>
                            <span className={vm.cpu > 80 ? 'text-danger fw-bold' : 'text-light'}>
                              {vm.cpu}%
                            </span>
                          </td>
                          <td>
                            <span className="text-light">{vm.memory}%</span>
                          </td>
                          <td>
                            <div className="vm-row-actions justify-content-end">
                              <button 
                                className="btn-row-action btn-start" 
                                title="Start VM" 
                                disabled={vm.status === 'Running' || isStopped}
                                onClick={() => handleStart(vm)}
                              >
                                <FiPlay />
                              </button>
                              <button 
                                className="btn-row-action btn-stop" 
                                title="Stop VM" 
                                disabled={isStopped}
                                onClick={() => handleStop(vm)}
                              >
                                <FiSquare />
                              </button>
                              <button 
                                className="btn-row-action btn-restart" 
                                title="Restart VM" 
                                disabled={isStopped}
                                onClick={() => handleRestart(vm)}
                              >
                                <FiRotateCw />
                              </button>
                              <button className="btn-row-action" title="SSH Terminal" disabled={vm.status !== 'Running'}>
                                <FiTerminal />
                              </button>
                              <button
                                className={`btn-row-action btn-details ${selectedVmId === vm.id ? 'active' : ''}`}
                                title="Details"
                                onClick={() => handleDetailsClick(vm.id)}
                              >
                                <FiInfo />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="8" className="text-center py-5 text-secondary">
                        <FiMonitor size={32} className="mb-2 text-secondary opacity-50" />
                        <p className="mb-0 fw-medium">No Virtual Machines detected.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Slide-over details panel */}
        {selectedVm && (() => {
          const isStopped = selectedVm.status?.toLowerCase() === 'stopped' || selectedVm.status?.toLowerCase() === 'deallocated';
          return (
            <div className="vm-details-panel">
              <div className="panel-header">
                <div className="d-flex align-items-center gap-2">
                  <FiMonitor className="text-secondary" />
                  <span className="fw-bold text-white text-truncate" style={{ maxWidth: '220px' }}>
                    {selectedVm.name}
                  </span>
                </div>
                <button
                  className="close-panel-btn"
                  onClick={() => setSelectedVmId(null)}
                  aria-label="Close details panel"
                >
                  <FiX />
                </button>
              </div>

              <div className="panel-body">
                {/* Power operations widget */}
                <div className="detail-group-title">Power Actions</div>
                <div className="d-flex flex-wrap gap-2 mb-4 justify-content-between">
                  <button 
                    className="btn btn-sm btn-success d-flex align-items-center gap-1" 
                    onClick={() => handleStart(selectedVm)}
                    disabled={selectedVm.status === 'Running' || isStopped}
                  >
                    <FiPlay /> Start
                  </button>
                  <button 
                    className="btn btn-sm btn-warning d-flex align-items-center gap-1 text-dark" 
                    onClick={() => handleStop(selectedVm)}
                    disabled={isStopped}
                  >
                    <FiSquare /> Stop
                  </button>
                  <button 
                    className="btn btn-sm btn-info d-flex align-items-center gap-1 text-white" 
                    onClick={() => handleRestart(selectedVm)}
                    disabled={isStopped}
                  >
                    <FiRotateCw /> Restart
                  </button>
                  <button 
                    className="btn btn-sm btn-danger d-flex align-items-center gap-1" 
                    onClick={() => handleDeallocate(selectedVm)}
                    disabled={selectedVm.status === 'Deallocated'}
                  >
                    Deallocate
                  </button>
                </div>

                {/* Properties Section */}
                <div>
                  <div className="detail-group-title">Instance Properties</div>
                  <div className="detail-row">
                    <span className="detail-label">Hostname</span>
                    <span className="detail-value">{selectedVm.name}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">OS Version</span>
                    <span className="detail-value">{selectedVm.os}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Kernel</span>
                    <span className="detail-value">{selectedVm.kernel}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Size</span>
                    <span className="detail-value">{selectedVm.size}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Resource Group</span>
                    <span className="detail-value">{selectedVm.resource_group || 'rg-cloud-admin'}</span>
                  </div>
                </div>

                {/* Networking Section */}
                <div>
                  <div className="detail-group-title">Networking</div>
                  <div className="detail-row">
                    <span className="detail-label">Public IP</span>
                    <span className="detail-value text-primary">{selectedVm.public_ip}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Private IP</span>
                    <span className="detail-value">{selectedVm.private_ip}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Docker status</span>
                    <span className="detail-value text-info">{selectedVm.docker}</span>
                  </div>
                </div>

                {/* Resources Monitoring Section */}
                <div>
                  <div className="detail-group-title">Telemetry</div>

                  {/* CPU Progress */}
                  <div className="vm-panel-progress">
                    <div className="progress-mini-labels">
                      <span>CPU Usage</span>
                      <span>{selectedVm.cpu}%</span>
                    </div>
                    <div className="progress progress-mini">
                      <div
                        className="progress-bar bg-primary"
                        role="progressbar"
                        style={{ width: `${selectedVm.cpu}%` }}
                        aria-valuenow={selectedVm.cpu}
                        aria-valuemin="0"
                        aria-valuemax="100"
                      />
                    </div>
                  </div>

                  {/* Memory Progress */}
                  <div className="vm-panel-progress">
                    <div className="progress-mini-labels">
                      <span>Memory Allocation</span>
                      <span>{selectedVm.memory}%</span>
                    </div>
                    <div className="progress progress-mini">
                      <div
                        className="progress-bar bg-info"
                        role="progressbar"
                        style={{ width: `${selectedVm.memory}%` }}
                        aria-valuenow={selectedVm.memory}
                        aria-valuemin="0"
                        aria-valuemax="100"
                      />
                    </div>
                  </div>

                  {/* Disk Progress */}
                  <div className="vm-panel-progress">
                    <div className="progress-mini-labels">
                      <span>Disk Capacity</span>
                      <span>{selectedVm.disk}%</span>
                    </div>
                    <div className="progress progress-mini">
                      <div
                        className="progress-bar bg-success"
                        role="progressbar"
                        style={{ width: `${selectedVm.disk}%` }}
                        aria-valuenow={selectedVm.disk}
                        aria-valuemin="0"
                        aria-valuemax="100"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

      </div>
    </div>
  );
};

export default VirtualMachines;
