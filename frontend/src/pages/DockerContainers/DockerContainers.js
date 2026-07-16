import React, { useState, useEffect } from 'react';
import './DockerContainers.css';
import { 
  getDocker, 
  getDashboard,
  startContainer, 
  stopContainer, 
  restartContainer, 
  getContainerLogs 
} from '../../services/api';
import { useToast } from '../../components/Toast/Toast';
import { useConfirm } from '../../components/ConfirmDialog/ConfirmDialog';
import { DataTable } from '../../components/DataTable/DataTable';
import { SkeletonCard } from '../../components/Skeleton/Skeleton';
import { EmptyState } from '../../components/EmptyState/EmptyState';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  Play, 
  Square, 
  RotateCw, 
  FileText, 
  X, 
  Layers, 
  Cpu, 
  RefreshCw,
  Activity
} from 'lucide-react';

const DockerContainers = () => {
  const [containers, setContainers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedContainer, setSelectedContainer] = useState(null);
  const [logs, setLogs] = useState('');
  const [loadingLogs, setLoadingLogs] = useState(false);
  
  const toast = useToast();
  const confirm = useConfirm();

  const fetchDockerData = async () => {
    try {
      setLoading(true);
      const [data, dashboard] = await Promise.all([
        getDocker(),
        getDashboard().catch(() => null)
      ]);
      const nextContainers = Array.isArray(data) ? data : data?.containers_list || data?.containers || [];
      const normalizedContainers = Array.isArray(nextContainers) ? nextContainers : [];
      setContainers(normalizedContainers);
      setStats({
        active: normalizedContainers.filter((container) => {
          const status = container.status?.toLowerCase() || '';
          return status.includes('up') || status.includes('running');
        }).length,
        status: normalizedContainers.length ? 'Healthy' : (data?.status || 'Offline'),
        version: data?.version || dashboard?.docker?.version || 'Unavailable'
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to load Docker telemetry.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDockerData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAction = async (actionFn, containerName, actionName) => {
    const isRestart = actionName === 'Restart';
    const isStop = actionName === 'Stop';
    const confirmType = isStop ? 'danger' : isRestart ? 'warning' : 'info';

    const approved = await confirm({
      title: `${actionName} Container`,
      message: `Are you sure you want to ${actionName.toLowerCase()} the container "${containerName}"?`,
      type: confirmType,
      confirmText: actionName,
      cancelText: 'Cancel'
    });

    if (!approved) return;

    try {
      setActionLoading(true);
      toast.info(`Executing container ${actionName.toLowerCase()} sequence...`);
      await actionFn(containerName);
      toast.success(`Container ${containerName} ${actionName.toLowerCase()}ed.`);
      await fetchDockerData();
      if (selectedContainer?.name === containerName) {
        // Refresh detail panel too
        const updated = containers.find(c => c.name === containerName);
        if (updated) setSelectedContainer(updated);
      }
    } catch (err) {
      console.error(err);
      toast.error(`Failed to execute ${actionName.toLowerCase()} action.`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleShowLogs = async (container) => {
    setSelectedContainer(container);
    setLoadingLogs(true);
    setLogs('');
    try {
      const data = await getContainerLogs(container.name);
      setLogs(data.logs || 'No output logs recorded.');
    } catch (err) {
      console.error(err);
      setLogs('Error: Failed to fetch container logs.');
    } finally {
      setLoadingLogs(false);
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Container Name',
      sortable: true,
      render: (val, row) => (
        <span 
          className="text-white fw-semibold" 
          style={{ cursor: 'pointer', hover: 'text-decoration: underline' }}
          onClick={() => handleShowLogs(row)}
        >
          {val}
        </span>
      )
    },
    {
      key: 'image',
      label: 'Docker Image',
      render: (val) => <code className="small text-secondary">{val}</code>
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (val) => {
        const status = val?.toLowerCase() || '';
        const isUp = status.includes('up') || status.includes('running');
        return (
          <span className={`status-badge ${isUp ? 'status-badge-success' : 'status-badge-danger'}`}>
            <span className={`status-dot ${isUp ? 'success' : 'danger'} ${isUp ? 'pulse' : ''}`} />
            {val}
          </span>
        );
      }
    },
    {
      key: 'ports',
      label: 'Port Bindings',
      render: (val) => <span className="text-mono small text-secondary">{val || 'None'}</span>
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => {
        const status = row.status?.toLowerCase() || '';
        const isUp = status.includes('up') || status.includes('running');
        return (
          <div className="docker-row-actions">
            <button 
              className="docker-row-btn btn-start" 
              title="Start"
              disabled={actionLoading || isUp}
              onClick={() => handleAction(startContainer, row.name, 'Start')}
            >
              <Play size={12} />
            </button>
            <button 
              className="docker-row-btn btn-stop" 
              title="Stop"
              disabled={actionLoading || !isUp}
              onClick={() => handleAction(stopContainer, row.name, 'Stop')}
            >
              <Square size={12} />
            </button>
            <button 
              className="docker-row-btn btn-restart" 
              title="Restart"
              disabled={actionLoading || !isUp}
              onClick={() => handleAction(restartContainer, row.name, 'Restart')}
            >
              <RotateCw size={12} />
            </button>
            <button 
              className="docker-row-btn" 
              title="View Logs & Settings"
              onClick={() => handleShowLogs(row)}
            >
              <FileText size={12} />
            </button>
          </div>
        );
      }
    }
  ];

  if (loading) {
    return (
      <div className="container-fluid p-0">
        <div className="page-header">
          <h1 className="page-title">Docker Containers</h1>
          <p className="page-subtitle">Inspect and monitor microservices running on the host</p>
        </div>
        <div className="row g-4 mb-4">
          <div className="col-md-4"><SkeletonCard rows={2} /></div>
          <div className="col-md-4"><SkeletonCard rows={2} /></div>
          <div className="col-md-4"><SkeletonCard rows={2} /></div>
        </div>
        <SkeletonCard rows={8} />
      </div>
    );
  }

  if (stats?.status === 'Offline' && containers.length === 0) {
    return (
      <div className="container-fluid p-0">
        <div className="page-header">
          <h1 className="page-title">Docker Containers</h1>
          <p className="page-subtitle">Inspect and monitor microservices running on the host</p>
        </div>
        <EmptyState variant="docker-stopped" onActionClick={fetchDockerData} actionText="Retry Daemon connection" />
      </div>
    );
  }

  return (
    <div className="docker-container">
      <div className="page-header">
        <h1 className="page-title">Docker Containers</h1>
        <p className="page-subtitle">Inspect and monitor microservices running on the host</p>
      </div>

      {/* Stats row cards */}
      <div className="row g-3 mb-4 docker-stats-row">
        <div className="col-md-4">
          <div className="card-base card-accent-primary p-3">
            <span className="small text-muted d-block mb-1">Docker daemon status</span>
            <div className="d-flex align-items-center gap-2">
              <span className="status-dot success pulse" />
              <span className="h5 m-0 font-weight-700 text-white">Active</span>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card-base card-accent-secondary p-3">
            <span className="small text-muted d-block mb-1">Active microservices</span>
            <div className="d-flex align-items-center gap-2">
              <Layers size={16} className="text-secondary" />
              <span className="h5 m-0 font-weight-700 text-white">{stats?.active} Containers</span>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card-base card-accent-tertiary p-3">
            <span className="small text-muted d-block mb-1">Engine version</span>
            <div className="d-flex align-items-center gap-2">
              <Cpu size={16} className="text-secondary" />
              <span className="h5 m-0 font-weight-700 text-white text-mono">{stats?.version}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Containers Table */}
      <div className="card-base-static p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="m-0 text-white font-weight-600">Container Inventory</h4>
          <button 
            className="btn btn-outline-secondary btn-sm text-white border-color" 
            onClick={fetchDockerData}
          >
            <RefreshCw size={12} className="me-1" /> Reload
          </button>
        </div>

        <DataTable 
          columns={columns} 
          data={containers}
          pageSize={10}
          emptyVariant="no-containers"
          emptyMessage="No container runtimes were parsed from the host socket."
        />
      </div>

      {/* Slide-out details panel */}
      <AnimatePresence>
        {selectedContainer && (
          <>
            {/* Dark Backdrop Overlay */}
            <motion.div 
              className="confirm-backdrop" 
              style={{ zIndex: 999 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedContainer(null)}
            />

            <motion.div 
              className="docker-detail-panel"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              style={{ zIndex: 1000 }}
            >
              <div className="docker-panel-header">
                <div className="d-flex align-items-center gap-2">
                  <Activity size={18} className="text-primary" />
                  <h3 className="docker-panel-title">{selectedContainer.name}</h3>
                </div>
                <button className="docker-panel-close" onClick={() => setSelectedContainer(null)}>
                  <X size={16} />
                </button>
              </div>

              <div className="docker-panel-body">
                <div className="docker-detail-group-title">Container Properties</div>
                <div className="docker-detail-row">
                  <span className="docker-detail-label">Status</span>
                  <span className={`status-badge ${selectedContainer.status?.toLowerCase().includes('up') ? 'status-badge-success' : 'status-badge-danger'}`}>
                    {selectedContainer.status}
                  </span>
                </div>
                <div className="docker-detail-row">
                  <span className="docker-detail-label">Image Reference</span>
                  <span className="docker-detail-value text-mono small">{selectedContainer.image}</span>
                </div>
                <div className="docker-detail-row">
                  <span className="docker-detail-label">Port Map</span>
                  <span className="docker-detail-value text-mono small">{selectedContainer.ports || 'None'}</span>
                </div>
                
                {/* Advanced Properties injected from Sprint 1 Step 3 */}
                {selectedContainer.image_size && (
                  <div className="docker-detail-row">
                    <span className="docker-detail-label">Image Size</span>
                    <span className="docker-detail-value">{selectedContainer.image_size}</span>
                  </div>
                )}
                {selectedContainer.restart_count !== undefined && (
                  <div className="docker-detail-row">
                    <span className="docker-detail-label">Restart Count</span>
                    <span className="docker-detail-value">{selectedContainer.restart_count}</span>
                  </div>
                )}
                {selectedContainer.ip_address && (
                  <div className="docker-detail-row">
                    <span className="docker-detail-label">IP Address</span>
                    <span className="docker-detail-value text-mono">{selectedContainer.ip_address}</span>
                  </div>
                )}
                {selectedContainer.network_mode && (
                  <div className="docker-detail-row">
                    <span className="docker-detail-label">Network Mode</span>
                    <span className="docker-detail-value">{selectedContainer.network_mode}</span>
                  </div>
                )}

                <div className="docker-detail-group-title">Container Logs</div>
                {loadingLogs ? (
                  <div className="py-5 text-center text-muted">
                    <RefreshCw size={20} className="spin text-primary mb-2" />
                    <div>Fetching CLI standard outputs...</div>
                  </div>
                ) : (
                  <div className="log-console">{logs}</div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DockerContainers;
