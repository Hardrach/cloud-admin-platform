import React, { useState, useEffect } from 'react';
import './VirtualMachines.css';
import { 
  getVirtualMachines, 
  startVirtualMachine, 
  stopVirtualMachine, 
  restartVirtualMachine, 
  deallocateVirtualMachine 
} from '../../services/api';
import { useToast } from '../../components/Toast/Toast';
import { useConfirm } from '../../components/ConfirmDialog/ConfirmDialog';
import { SkeletonCard } from '../../components/Skeleton/Skeleton';
import { EmptyState } from '../../components/EmptyState/EmptyState';
import { 
  Server, 
  Play, 
  Square, 
  RefreshCw, 
  PowerOff, 
  Cpu, 
  Database, 
  Info,
  Clock
} from 'lucide-react';

const VirtualMachines = () => {
  const [vm, setVm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const toast = useToast();
  const confirm = useConfirm();

  const fetchVM = async () => {
    try {
      setLoading(true);
      const data = await getVirtualMachines();
      const nextVm = Array.isArray(data) ? data[0] : data?.vm || data;
      setVm(nextVm || null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to retrieve VM status telemetry.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVM();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAction = async (actionFn, actionName, confirmType = 'warning') => {
    const approved = await confirm({
      title: `${actionName} Virtual Machine`,
      message: `Are you sure you want to ${actionName.toLowerCase()} the virtual machine "${vm.name}"?`,
      type: confirmType,
      confirmText: actionName,
      cancelText: 'Cancel'
    });

    if (!approved) return;

    try {
      setActionLoading(true);
      toast.info(`Executing VM ${actionName.toLowerCase()} sequence...`);
      await actionFn(vm.name);
      toast.success(`VM ${actionName.toLowerCase()} command completed successfully.`);
      await fetchVM();
    } catch (err) {
      console.error(err);
      toast.error(`Failed to ${actionName.toLowerCase()} the VM: ${err.message || 'Unknown error'}`);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container-fluid p-0">
        <div className="page-header">
          <h1 className="page-title">Virtual Machines</h1>
          <p className="page-subtitle">Manage cloud host nodes and instances</p>
        </div>
        <div className="row g-4">
          <div className="col-lg-8">
            <SkeletonCard rows={8} />
          </div>
          <div className="col-lg-4">
            <SkeletonCard rows={4} />
          </div>
        </div>
      </div>
    );
  }

  if (!vm) {
    return (
      <div className="container-fluid p-0">
        <div className="page-header">
          <h1 className="page-title">Virtual Machines</h1>
          <p className="page-subtitle">Manage cloud host nodes and instances</p>
        </div>
        <EmptyState variant="no-vms" onActionClick={fetchVM} actionText="Refresh Instance list" />
      </div>
    );
  }

  const isRunning = vm.status?.toLowerCase() === 'running';
  const isStopped = vm.status?.toLowerCase() === 'stopped' || vm.status?.toLowerCase() === 'deallocated';

  return (
    <div className="vms-container">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Virtual Machines</h1>
        <p className="page-subtitle">Manage cloud host nodes and instances</p>
      </div>

      <div className="row g-4">
        {/* Core details */}
        <div className="col-lg-8">
          <div className="card-base vm-card">
            <div className="d-flex align-items-center justify-content-between mb-4">
              <div className="d-flex align-items-center gap-3">
                <div className="stat-card-icon stat-icon-blue">
                  <Server size={20} />
                </div>
                <div>
                  <h3 className="m-0 text-white font-weight-600">{vm.name}</h3>
                  <span className="small text-muted">{vm.resource_group || 'rg-cloud-admin-platform'}</span>
                </div>
              </div>
              <span className={`status-badge ${isRunning ? 'status-badge-success' : 'status-badge-danger'}`}>
                <span className={`status-dot ${isRunning ? 'success' : 'danger'} pulse`} />
                {vm.status}
              </span>
            </div>

            <div className="vm-details-group-title">Hardware Profile</div>
            <div className="vm-detail-row">
              <span className="vm-detail-label">Instance Size</span>
              <span className="vm-detail-value text-mono">{vm.size}</span>
            </div>
            <div className="vm-detail-row">
              <span className="vm-detail-label">Location (Region)</span>
              <span className="vm-detail-value">{vm.region}</span>
            </div>
            <div className="vm-detail-row">
              <span className="vm-detail-label">Operating System</span>
              <span className="vm-detail-value">{vm.os_type || vm.os || 'Linux (Ubuntu 22.04)'}</span>
            </div>

            <div className="vm-details-group-title">Network Configuration</div>
            <div className="vm-detail-row">
              <span className="vm-detail-label">Public IP Address</span>
              <span className="vm-detail-value text-mono text-primary">{vm.public_ip || 'None'}</span>
            </div>
            <div className="vm-detail-row">
              <span className="vm-detail-label">Private IP Address</span>
              <span className="vm-detail-value text-mono">{vm.private_ip || '10.0.0.4'}</span>
            </div>

            {/* Actions */}
            <div className="vm-action-btn-group mt-5">
              <button 
                className="vm-btn vm-btn-start"
                disabled={actionLoading || isRunning}
                onClick={() => handleAction(startVirtualMachine, 'Start', 'info')}
              >
                <Play size={12} /> Start
              </button>
              <button 
                className="vm-btn vm-btn-stop"
                disabled={actionLoading || isStopped}
                onClick={() => handleAction(stopVirtualMachine, 'Stop', 'danger')}
              >
                <Square size={12} /> Stop
              </button>
              <button 
                className="vm-btn vm-btn-restart"
                disabled={actionLoading || isStopped}
                onClick={() => handleAction(restartVirtualMachine, 'Restart', 'warning')}
              >
                <RefreshCw size={12} /> Restart
              </button>
              <button 
                className="vm-btn vm-btn-deallocate"
                disabled={actionLoading || isStopped}
                onClick={() => handleAction(deallocateVirtualMachine, 'Deallocate', 'danger')}
              >
                <PowerOff size={12} /> Deallocate
              </button>
            </div>
          </div>
        </div>

        {/* Info panel */}
        <div className="col-lg-4">
          <div className="card-base h-100">
            <h4 className="text-white font-weight-600 mb-4 d-flex align-items-center gap-2">
              <Info size={16} className="text-primary" /> Properties
            </h4>
            <div className="d-flex flex-column gap-4">
              <div className="d-flex align-items-start gap-3">
                <Cpu size={16} className="text-secondary mt-1" />
                <div>
                  <span className="small text-muted d-block uppercase">CPU Cores</span>
                  <span className="text-white font-weight-500">{vm.cpu ? `${vm.cpu}% host load` : '2 vCPUs'}</span>
                </div>
              </div>
              <div className="d-flex align-items-start gap-3">
                <Database size={16} className="text-secondary mt-1" />
                <div>
                  <span className="small text-muted d-block uppercase">RAM allocation</span>
                  <span className="text-white font-weight-500">{vm.memory ? `${vm.memory}% allocated` : '8 GB Memory'}</span>
                </div>
              </div>
              <div className="d-flex align-items-start gap-3">
                <Clock size={16} className="text-secondary mt-1" />
                <div>
                  <span className="small text-muted d-block uppercase">Uptime tracking</span>
                  <span className="text-white font-weight-500">{isRunning ? 'Active' : 'Offline'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VirtualMachines;
