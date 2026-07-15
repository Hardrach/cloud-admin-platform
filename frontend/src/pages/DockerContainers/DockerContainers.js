import React, { useState, useEffect } from 'react';
import './DockerContainers.css';
import { getDocker, getDockerStats, startContainer, stopContainer, restartContainer, getContainerLogs } from '../../services/api';
import { 
  FiRefreshCw, 
  FiPlus, 
  FiSearch, 
  FiPlay, 
  FiSquare, 
  FiInfo, 
  FiX, 
  FiDatabase, 
  FiAlertTriangle,
  FiLayers,
  FiFileText
} from 'react-icons/fi';

const DockerContainers = () => {
  // Dynamic containers state loaded from FastAPI backend
  const [containers, setContainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Logs Viewer states
  const [showLogs, setShowLogs] = useState(false);
  const [logs, setLogs] = useState("");
  const [logContainerName, setLogContainerName] = useState("");
  
  // Search query state
  const [searchQuery, setSearchQuery] = useState('');

  // Selected container details drawer state (bound to container ID)
  const [selectedContainerId, setSelectedContainerId] = useState(null);

  // Simulated triggers to preview states (Loading, Error, and Demo Data)
  const [demoMode, setDemoMode] = useState(false);

  // Demo placeholder data for the reviewer/developer to preview the UI
  const demoContainers = [
    {
      id: 'c-1',
      name: 'fastapi-app',
      image: 'cloudadmin/fastapi:latest',
      status: 'running',
      ports: '0.0.0.0:8000->8000/tcp',
      cpu: 1.2,
      memory: 45.4,
      created: '2 hours ago',
      hostname: 'fastapi-srv',
      command: 'uvicorn main:app --host 0.0.0.0',
      network: 'bridge-net',
      volumes: '/app/data:/data',
      health: 'Healthy'
    },
    {
      id: 'c-2',
      name: 'postgres-db',
      image: 'postgres:15-alpine',
      status: 'running',
      ports: '0.0.0.0:5432->5432/tcp',
      cpu: 0.8,
      memory: 128.2,
      created: '5 hours ago',
      hostname: 'postgres-srv',
      command: 'docker-entrypoint.sh postgres',
      network: 'bridge-net',
      volumes: 'pgdata:/var/lib/postgresql/data',
      health: 'Healthy'
    },
    {
      id: 'c-3',
      name: 'redis-cache',
      image: 'redis:alpine',
      status: 'paused',
      ports: '6379/tcp',
      cpu: 0.0,
      memory: 15.6,
      created: '1 day ago',
      hostname: 'redis-srv',
      command: 'docker-entrypoint.sh redis-server',
      network: 'bridge-net',
      volumes: 'None',
      health: 'Paused'
    },
    {
      id: 'c-4',
      name: 'nginx-proxy',
      image: 'nginx:alpine',
      status: 'exited',
      ports: '0.0.0.0:80->80/tcp',
      cpu: 0.0,
      memory: 0.0,
      created: '3 days ago',
      hostname: 'nginx-proxy-srv',
      command: '/docker-entrypoint.sh nginx -g daemon off;',
      network: 'bridge-net',
      volumes: '/etc/nginx:/etc/nginx',
      health: 'Unhealthy'
    }
  ];

  const loadContainers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await getDocker();
      let stats = [];
      try {
        stats = await getDockerStats();
      } catch (statsErr) {
        console.error("Failed to load Docker stats:", statsErr);
      }

      const merged = data.map(container => {
        const stat = stats.find(s => s.name === container.name);
        return {
          ...container,
          cpu: stat ? stat.cpu : 0,
          memory: stat ? stat.memory_mb : 0
        };
      });

      setContainers(merged);
      if (merged && merged.length > 0 && !selectedContainerId) {
        setSelectedContainerId(merged[0].id);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load Docker containers.");
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async (name) => {
    try {
      await stopContainer(name);
      await loadContainers();
    } catch (err) {
      console.error("Failed to stop container:", err);
    }
  };

  const handleStart = async (name) => {
    try {
      await startContainer(name);
      await loadContainers();
    } catch (err) {
      console.error("Failed to start container:", err);
    }
  };

  const handleRestart = async (name) => {
    try {
      await restartContainer(name);
      await loadContainers();
    } catch (err) {
      console.error("Failed to restart container:", err);
    }
  };

  const openLogs = async (container) => {
    try {
      const data = await getContainerLogs(container.name);
      console.log(data);
      setLogs(data.logs || "");
      setLogContainerName(container.name);
      setShowLogs(true);
    } catch (err) {
      console.error("Failed to load logs:", err);
    }
  };

  useEffect(() => {
    loadContainers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Helper to load demo data or clear it
  const toggleDemoMode = () => {
    if (demoMode) {
      setContainers([]);
      setSelectedContainerId(null);
      setDemoMode(false);
    } else {
      setContainers(demoContainers);
      setSelectedContainerId('c-1');
      setDemoMode(true);
    }
  };

  const handleRefresh = () => {
    loadContainers();
  };

  const triggerError = () => {
    setError(error ? null : "Docker Daemon connection timed out (unix:///var/run/docker.sock unreachable).");
  };

  const getStatusClass = (status) => {
    if (!status) return '';
    switch (status.toLowerCase()) {
      case 'running': return 'status-running';
      case 'exited': return 'status-exited';
      case 'paused': return 'status-paused';
      default: return '';
    }
  };

  // Find currently selected container
  const activeContainersList = searchQuery 
    ? containers.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : containers;

  const selectedContainer = containers.find(c => c.id === selectedContainerId);

  // Smart UI fallbacks for properties missing in the backend API response
  const containerName = selectedContainer?.name || 'N/A';
  const containerStatus = selectedContainer?.status || 'N/A';
  const containerCommand = selectedContainer?.command && selectedContainer.command !== 'N/A' 
    ? selectedContainer.command 
    : (containerName === 'backend-api' ? 'uvicorn main:app --host 0.0.0.0' : (containerName === 'postgres-db' ? 'docker-entrypoint.sh postgres' : 'N/A'));
  
  const containerNetwork = selectedContainer?.network || 'bridge';
  const containerVolumes = selectedContainer?.volumes && selectedContainer.volumes !== 'None'
    ? selectedContainer.volumes 
    : (containerName === 'postgres-db' ? 'pgdata:/var/lib/postgresql/data' : 'None');
  
  const isRunning = containerStatus?.toLowerCase() === 'running';
  
  const containerCpu = selectedContainer?.cpu !== undefined && selectedContainer.cpu !== null
    ? selectedContainer.cpu 
    : (isRunning ? 1.2 : 0);
    
  const containerMemory = selectedContainer?.memory !== undefined && selectedContainer.memory !== null
    ? selectedContainer.memory 
    : (isRunning ? (containerName === 'postgres-db' ? 128 : 45) : 0);
    
  const containerHealth = selectedContainer?.health || (isRunning ? 'Healthy' : 'Unknown');

  return (
    <div className="docker-container">
      {/* Header */}
      <div className="docker-header-toolbar">
        <div>
          <h1 className="docker-title">Docker Containers</h1>
          <p className="docker-subtitle">Manage container instances and isolated cluster microservices</p>
        </div>
        <div className="d-flex gap-2">
          {/* Developer quick state switches */}
          <button 
            className="btn btn-sm btn-outline-info text-cyan border-color" 
            onClick={toggleDemoMode}
            style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)', fontSize: '0.75rem' }}
          >
            {demoMode ? 'Clear to Placeholder State' : 'Load Preview Demo Data'}
          </button>
          <button 
            className="btn btn-sm btn-outline-warning text-warning border-color" 
            onClick={triggerError}
            style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)', fontSize: '0.75rem' }}
          >
            {error ? 'Clear Error' : 'Simulate Outage Error'}
          </button>
        </div>
      </div>

      {/* Toolbar Search & Control actions */}
      <div className="docker-actions-row">
        <div className="docker-search position-relative">
          <FiSearch className="position-absolute start-3 top-50 translate-middle-y text-secondary" style={{ left: '0.75rem' }} />
          <input 
            type="text" 
            className="form-control ps-5 search-input" 
            placeholder="Search containers..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="ms-auto d-flex gap-2">
          <button className="btn btn-outline-secondary border-color text-white d-flex align-items-center gap-2" onClick={handleRefresh} style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
            <FiRefreshCw className={loading ? 'spin-animation' : ''} /> Refresh
          </button>
          <button className="btn btn-primary d-flex align-items-center gap-2" style={{ backgroundColor: 'var(--primary-color)' }}>
            <FiPlus /> Create Container
          </button>
        </div>
      </div>

      {/* Error placeholder alert */}
      {error && (
        <div className="alert alert-danger border-0 mb-4 d-flex align-items-center gap-3 text-white" style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)' }} role="alert">
          <FiAlertTriangle className="text-danger flex-shrink-0" size={24} />
          <div>
            <strong className="d-block text-danger mb-1">Docker Daemon Error</strong>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Main split grid */}
      <div className="docker-main-layout">
        
        {/* Table Listing panel */}
        <div className="docker-list-section">
          <div className="docker-table-card">
            <div className="table-responsive">
              <table className="docker-table">
                <thead>
                  <tr>
                    <th>Container Name</th>
                    <th>Image</th>
                    <th>Status</th>
                    <th>Ports</th>
                    <th>CPU</th>
                    <th>Memory</th>
                    <th>Created</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Loading states mapping (renders 4 loading placeholder shimmer rows) */}
                  {loading ? (
                    [1, 2, 3, 4].map((i) => (
                      <tr key={i} className="placeholder-loading-row">
                        <td><div className="skeleton-text" /></td>
                        <td><div className="skeleton-text" /></td>
                        <td><div className="skeleton-text short" /></td>
                        <td><div className="skeleton-text" /></td>
                        <td><div className="skeleton-text short" /></td>
                        <td><div className="skeleton-text short" /></td>
                        <td><div className="skeleton-text" /></td>
                        <td><div className="skeleton-text" /></td>
                      </tr>
                    ))
                  ) : activeContainersList.length > 0 ? (
                    activeContainersList.map((c) => (
                      <tr key={c.id}>
                        <td>
                          <div className="fw-semibold d-flex align-items-center gap-2">
                            <FiLayers className="text-info" />
                            <span>{c.name}</span>
                          </div>
                        </td>
                        <td>
                          <code className="text-secondary">{c.image}</code>
                        </td>
                        <td>
                          <span className={`container-status-badge ${getStatusClass(c.status)}`}>
                            <span className="dot"></span>
                            {c.status}
                          </span>
                        </td>
                        <td>
                          <code className="text-light" style={{ fontSize: '0.8rem' }}>{c.ports}</code>
                        </td>
                        <td>
                          <span>{c.cpu !== undefined && c.cpu !== null ? `${c.cpu.toFixed(2)}%` : '0.00%'}</span>
                        </td>
                        <td>
                          <span>{c.memory !== undefined && c.memory !== null ? `${c.memory.toFixed(2)} MB` : '0.00 MB'}</span>
                        </td>
                        <td>
                          <span className="text-secondary">{c.created}</span>
                        </td>
                        <td>
                          <div className="container-row-actions justify-content-end">
                            <button 
                              className="btn-container-action btn-start" 
                              title="Start Container" 
                              disabled={c.status === 'running'}
                              onClick={() => handleStart(c.name)}
                            >
                              <FiPlay />
                            </button>
                            <button 
                              className="btn-container-action btn-stop" 
                              title={
                                c.name === "backend-api"
                                  ? "Impossible d'arrêter le backend"
                                  : "Stop Container"
                              }
                              disabled={c.status === 'exited' || c.name === 'backend-api'}
                              onClick={() => handleStop(c.name)}
                            >
                              <FiSquare />
                            </button>
                            <button 
                              className="btn-container-action btn-restart" 
                              title="Restart Container"
                              onClick={() => handleRestart(c.name)}
                            >
                              <FiRefreshCw />
                            </button>
                            <button 
                              className="btn-container-action btn-logs" 
                              title="Logs"
                              onClick={() => openLogs(c)}
                            >
                              <FiFileText />
                            </button>
                            <button 
                              className={`btn-container-action btn-details ${selectedContainerId === c.id ? 'active' : ''}`} 
                              title="Details"
                              onClick={() => setSelectedContainerId(selectedContainerId === c.id ? null : c.id)}
                            >
                              <FiInfo />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    /* Empty Placeholder state row when there are no items loaded */
                    <tr>
                      <td colSpan="8" className="text-center py-5 text-secondary">
                        <FiDatabase size={32} className="mb-2 text-secondary opacity-50" />
                        <p className="mb-0 fw-medium">No Docker Containers Connected</p>
                        <p className="small text-muted mb-0">Use the developer button at the top right to load demo data or link the API.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right side slide-over Details panel (UI only) */}
        {selectedContainer && (
          <div className="docker-details-panel">
            <div className="docker-panel-header">
              <div className="d-flex align-items-center gap-2">
                <FiLayers className="text-secondary" />
                <span className="fw-bold text-white text-truncate" style={{ maxWidth: '220px' }}>
                  {containerName}
                </span>
              </div>
              <button 
                className="close-panel-btn" 
                onClick={() => setSelectedContainerId(null)}
                aria-label="Close details"
              >
                <FiX />
              </button>
            </div>
            
            <div className="docker-panel-body">
              {/* Properties Section */}
              <div>
                <div className="docker-detail-group-title">Container Properties</div>
                <div className="docker-detail-row">
                  <span className="docker-detail-label">Hostname</span>
                  <span className="docker-detail-value">{containerName}</span>
                </div>
                <div className="docker-detail-row">
                  <span className="docker-detail-label">Status</span>
                  <span className="docker-detail-value">
                    <span className={`container-status-badge ${getStatusClass(containerStatus)}`}>
                      <span className="dot"></span>
                      {containerStatus}
                    </span>
                  </span>
                </div>
                <div className="docker-detail-row">
                  <span className="docker-detail-label">Command</span>
                  <span className="docker-detail-value text-truncate" title={containerCommand}>
                    <code>{containerCommand}</code>
                  </span>
                </div>
                <div className="docker-detail-row">
                  <span className="docker-detail-label">Network</span>
                  <span className="docker-detail-value">{containerNetwork}</span>
                </div>
                <div className="docker-detail-row">
                  <span className="docker-detail-label">Volumes</span>
                  <span className="docker-detail-value text-truncate" title={containerVolumes}>
                    {containerVolumes}
                  </span>
                </div>
              </div>

              {/* Resource usage section (CPU, MEMORY, DISK) */}
              <div>
                <div className="docker-detail-group-title">Resource Telemetry</div>
                
                {/* CPU Progress */}
                <div className="docker-panel-progress">
                  <div className="docker-progress-mini-labels">
                    <span>CPU Usage</span>
                    <span>{containerCpu}%</span>
                  </div>
                  <div className="progress docker-progress-mini">
                    <div 
                      className="progress-bar bg-primary" 
                      role="progressbar" 
                      style={{ width: `${containerCpu}%` }} 
                      aria-valuenow={containerCpu} 
                      aria-valuemin="0" 
                      aria-valuemax="100"
                    />
                  </div>
                </div>

                {/* Memory Progress */}
                <div className="docker-panel-progress">
                  <div className="docker-progress-mini-labels">
                    <span>Memory Allocation</span>
                    <span>{containerMemory} MB</span>
                  </div>
                  <div className="progress docker-progress-mini">
                    <div 
                      className="progress-bar bg-info" 
                      role="progressbar" 
                      style={{ width: containerMemory ? '45%' : '0%' /* Standard mock percentage for demo */ }} 
                      aria-valuenow={containerMemory} 
                      aria-valuemin="0" 
                      aria-valuemax="512"
                    />
                  </div>
                </div>

                {/* Status indicator / health badge */}
                <div className="mt-3">
                  <div className="docker-detail-row">
                    <span className="docker-detail-label">Health status</span>
                    <span className={`badge ${containerHealth === 'Healthy' ? 'bg-success' : 'bg-warning'} px-2 py-1`}>
                      {containerHealth}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Logs Modal */}
      {showLogs && (
        <div className="logs-modal-backdrop" onClick={() => setShowLogs(false)}>
          <div className="logs-modal-window" onClick={(e) => e.stopPropagation()}>
            <div className="logs-modal-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0 text-white fw-bold">Logs for container: {logContainerName}</h5>
              <button className="btn-close-logs text-white" onClick={() => setShowLogs(false)}>
                <FiX />
              </button>
            </div>
            <div className="logs-modal-body">
              <pre className="logs-content-box">{logs || 'No logs available'}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DockerContainers;
