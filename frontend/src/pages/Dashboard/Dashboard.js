import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import { getDashboard } from '../../services/api';
import { 
  FiServer, 
  FiCpu, 
  FiDatabase, 
  FiGlobe, 
  FiActivity, 
  FiTerminal, 
  FiCode, 
  FiRefreshCw, 
  FiExternalLink, 
  FiKey, 
  FiFileText,
  FiSettings,
  FiAlertTriangle
} from 'react-icons/fi';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getDashboard();
      setData(res);
    } catch (err) {
      console.error("API error:", err);
      setError(err.message || "Failed to fetch cloud infrastructure data from backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="text-secondary font-weight-500">Retrieving Cloud Infrastructure Telemetry...</p>
      </div>
    );
  }

  // Safe navigation mapping helpers to support varying API structures or defaults
  const vmName = data?.vm?.name || 'N/A';
  const vmStatus = data?.vm?.status || 'N/A';
  const azureRegion = data?.vm?.region || 'N/A';
  const publicIp = data?.vm?.public_ip || 'N/A';
  
  const dockerContainers = data?.docker?.containers !== undefined ? data.docker.containers : 'N/A';
  const dockerStatus = data?.docker?.status || 'N/A';
  const dockerVersion = data?.docker?.version || 'N/A';

  const databaseStatus = data?.database?.status || 'N/A';
  const databaseEngine = data?.database?.engine || 'PostgreSQL';
  const postgresVersion = data?.database?.version || 'N/A';

  const apiStatus = data?.api?.status || 'N/A';
  
  const cpuUsage = data?.system?.cpu !== undefined ? data.system.cpu : 0;
  const memoryUsage = data?.system?.memory !== undefined ? data.system.memory : 0;
  const diskUsage = data?.system?.disk !== undefined ? data.system.disk : 0;

  // Extra config values
  const subscription = data?.subscription || 'Enterprise (Pay-As-You-Go)';
  const terraformVersion = data?.terraform || data?.terraform_version || 'v1.5.7';

  // Stats Card data structures mapping the API
  const stats = [
    {
      id: 'vms',
      label: 'Running Virtual Machines',
      value: vmStatus === 'Running' || vmStatus === 'running' || vmStatus === 'Healthy' ? '1 / 1' : '0 / 1',
      trend: vmName,
      trendClass: 'trend-neutral',
      icon: <FiServer />,
      iconColorClass: 'icon-blue'
    },
    {
      id: 'containers',
      label: 'Docker Containers',
      value: dockerContainers !== 'N/A' ? `${dockerContainers} Active` : 'N/A',
      trend: 'Host running',
      trendClass: 'trend-neutral',
      icon: <FiTerminal />,
      iconColorClass: 'icon-cyan'
    },
    {
      id: 'apis',
      label: 'API Services',
      value: apiStatus === 'Healthy' || apiStatus === 'Online' ? '1 Active' : '0 Active',
      trend: 'FastAPI',
      trendClass: 'trend-neutral',
      icon: <FiGlobe />,
      iconColorClass: 'icon-green'
    },
    {
      id: 'databases',
      label: 'Databases',
      value: databaseStatus === 'Healthy' ? '1 Active' : '0 Active',
      trend: databaseEngine,
      trendClass: 'trend-neutral',
      icon: <FiDatabase />,
      iconColorClass: 'icon-purple'
    }
  ];

  return (
    <div className="dashboard-container">
      {/* 1. Header & Actions */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h1 className="dashboard-title">Cloud Infrastructure Dashboard</h1>
          <p className="dashboard-subtitle">Real-time monitoring of cloud resources</p>
        </div>
        <button 
          className="btn btn-outline-secondary d-flex align-items-center gap-2 border-color text-white" 
          onClick={fetchDashboardData}
          style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}
        >
          <FiRefreshCw /> Refresh Telemetry
        </button>
      </div>


      {/* Backend Alert (if API error occurs) */}
      {error && (
        <div className="alert alert-danger border-0 mb-4 d-flex align-items-center gap-3 text-white" style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)' }} role="alert">
          <FiAlertTriangle className="text-danger flex-shrink-0" size={24} />
          <div>
            <strong className="d-block text-danger mb-1">Backend API Connection Failure</strong>
            <span>Unable to reach backend API endpoint. Please ensure the backend services are running. ({error})</span>
          </div>
        </div>
      )}

      {/* 2. Statistics Cards */}
      <div className="row g-4 mb-4">
        {stats.map((stat) => (
          <div key={stat.id} className="col-12 col-md-6 col-xl-3">
            <div className="stat-card">
              <div className="stat-card-header">
                <div className={`stat-card-icon ${stat.iconColorClass}`}>
                  {stat.icon}
                </div>
                <span className={`stat-trend ${stat.trendClass}`}>
                  {stat.trend}
                </span>
              </div>
              <div className="stat-card-value">{stat.value}</div>
              <div className="stat-card-label">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Grid: Health Status & Resources & Activity & Info */}
      <div className="row g-4 mb-4">
        {/* Left column: Health Status & Resources */}
        <div className="col-12 col-lg-8">
          <div className="row g-4">
            
            {/* 3. Infrastructure Health */}
            <div className="col-12">
              <div className="dashboard-panel">
                <h2 className="panel-title">
                  <FiActivity className="text-success" /> Infrastructure Health
                </h2>
                <div className="health-grid">
                  <div className="health-item-card">
                    <span className="health-item-name">Azure VM ({vmName})</span>
                    <span className="health-badge badge-healthy">
                      <span className="dot-indicator"></span>
                      {vmStatus}
                    </span>
                  </div>
                  <div className="health-item-card">
                    <span className="health-item-name">Docker</span>
                    <span className="health-badge badge-healthy">
                      <span className="dot-indicator"></span>
                      {dockerStatus}
                    </span>
                  </div>
                  <div className="health-item-card">
                    <span className="health-item-name">FastAPI</span>
                    <span className="health-badge badge-healthy">
                      <span className="dot-indicator"></span>
                      {apiStatus}
                    </span>
                  </div>
                  <div className="health-item-card">
                    <span className="health-item-name">{databaseEngine}</span>
                    <span className="health-badge badge-healthy">
                      <span className="dot-indicator"></span>
                      {databaseStatus}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Resource Usage */}
            <div className="col-12">
              <div className="dashboard-panel">
                <h2 className="panel-title">
                  <FiCpu className="text-info" /> Resource Usage
                </h2>
                <div>
                  {/* CPU Progress bar */}
                  <div className="resource-usage-item">
                    <div className="usage-meta">
                      <span className="usage-label">CPU Usage</span>
                      <span className="usage-value">{cpuUsage}%</span>
                    </div>
                    <div className="progress">
                      <div 
                        className="progress-bar progress-bar-striped progress-bar-animated bg-primary" 
                        role="progressbar" 
                        style={{ width: `${cpuUsage}%` }} 
                        aria-valuenow={cpuUsage} 
                        aria-valuemin="0" 
                        aria-valuemax="100"
                      />
                    </div>
                  </div>

                  {/* Memory Progress bar */}
                  <div className="resource-usage-item">
                    <div className="usage-meta">
                      <span className="usage-label">Memory Allocation</span>
                      <span className="usage-value">{memoryUsage}%</span>
                    </div>
                    <div className="progress">
                      <div 
                        className="progress-bar progress-bar-striped progress-bar-animated bg-info" 
                        role="progressbar" 
                        style={{ width: `${memoryUsage}%` }} 
                        aria-valuenow={memoryUsage} 
                        aria-valuemin="0" 
                        aria-valuemax="100"
                      />
                    </div>
                  </div>

                  {/* Disk Progress bar */}
                  <div className="resource-usage-item">
                    <div className="usage-meta">
                      <span className="usage-label">Disk Capacity</span>
                      <span className="usage-value">{diskUsage}%</span>
                    </div>
                    <div className="progress">
                      <div 
                        className="progress-bar progress-bar-striped progress-bar-animated bg-success" 
                        role="progressbar" 
                        style={{ width: `${diskUsage}%` }} 
                        aria-valuenow={diskUsage} 
                        aria-valuemin="0" 
                        aria-valuemax="100"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 5. Cloud Information */}
            <div className="col-12">
              <div className="dashboard-panel">
                <h2 className="panel-title">
                  <FiSettings className="text-secondary" /> Cloud Information
                </h2>
                <div className="info-card-grid">
                  <div className="info-card">
                    <span className="info-label">Region</span>
                    <span className="info-value">{azureRegion}</span>
                  </div>
                  <div className="info-card">
                    <span className="info-label">Subscription</span>
                    <span className="info-value">{subscription}</span>
                  </div>
                  <div className="info-card">
                    <span className="info-label">Public IP</span>
                    <span className="info-value">{publicIp}</span>
                  </div>
                  <div className="info-card">
                    <span className="info-label">Terraform</span>
                    <span className="info-value">{terraformVersion}</span>
                  </div>
                  <div className="info-card">
                    <span className="info-label">Docker Version</span>
                    <span className="info-value">{dockerVersion}</span>
                  </div>
                  <div className="info-card">
                    <span className="info-label">PostgreSQL Version</span>
                    <span className="info-value">{postgresVersion}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Right column: Quick Actions & Recent Activity */}
        <div className="col-12 col-lg-4">
          <div className="row g-4">
            
            {/* 6. Quick Actions */}
            <div className="col-12">
              <div className="dashboard-panel">
                <h2 className="panel-title">
                  <FiCode className="text-primary" /> Quick Actions
                </h2>
                <div className="action-grid">
                  <button className="btn-quick-action" id="action-swagger">
                    <FiExternalLink className="action-icon" />
                    <span>Open Swagger</span>
                  </button>
                  <button className="btn-quick-action" id="action-ssh">
                    <FiKey className="action-icon" />
                    <span>SSH Connection</span>
                  </button>
                  <button className="btn-quick-action" id="action-restart">
                    <FiRefreshCw className="action-icon" />
                    <span>Restart Services</span>
                  </button>
                  <button className="btn-quick-action" id="action-logs">
                    <FiFileText className="action-icon" />
                    <span>View Logs</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 7. Recent Activity */}
            <div className="col-12">
              <div className="dashboard-panel">
                <h2 className="panel-title">
                  <FiTerminal className="text-warning" /> Recent Activity
                </h2>
                <div className="timeline-list">
                  {[
                    {
                      id: 'act-1',
                      title: 'VM Connected',
                      details: `Linked to: ${vmName}`,
                      time: 'Just now',
                      dotClass: 'success'
                    },
                    {
                      id: 'act-2',
                      title: 'Docker Started',
                      details: `Host has ${dockerContainers} containers.`,
                      time: 'Recently',
                      dotClass: 'cyan'
                    },
                    {
                      id: 'act-3',
                      title: 'Terraform Applied',
                      details: `Using Terraform ${terraformVersion}`,
                      time: 'Active',
                      dotClass: 'success'
                    },
                    {
                      id: 'act-4',
                      title: 'API Running',
                      details: 'Endpoints verified with health checks.',
                      time: 'Active',
                      dotClass: 'warning'
                    }
                  ].map((act) => (
                    <div key={act.id} className="timeline-item">
                      <span className={`timeline-dot ${act.dotClass}`} />
                      <div className="timeline-content">
                        <span className="timeline-title">{act.title}</span>
                        <span className="text-secondary" style={{ fontSize: '0.825rem' }}>
                          {act.details}
                        </span>
                        <span className="timeline-time">{act.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
