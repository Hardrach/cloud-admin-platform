import React, { useState, useEffect, useRef } from 'react';
import './Dashboard.css';
import { getDashboard } from '../../services/api';
import { SkeletonCard } from '../../components/Skeleton/Skeleton';
import { 
  Server, 
  Cpu, 
  Database, 
  Globe, 
  Activity, 
  Terminal, 
  Code, 
  RefreshCw, 
  ExternalLink, 
  Key, 
  FileText,
  Settings as SettingsIcon,
  AlertTriangle
} from 'lucide-react';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const canvasRef = useRef(null);

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

  // Background animated particle field canvas effect
  useEffect(() => {
    if (loading || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resizeCanvas = () => {
      canvas.width = canvas.parentElement.offsetWidth;
      canvas.height = canvas.parentElement.offsetHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const particles = Array.from({ length: 25 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: Math.random() * 2 + 1,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#00D4FF';
      ctx.strokeStyle = 'rgba(0, 212, 255, 0.04)';
      ctx.lineWidth = 1;

      // Update & Draw particles
      particles.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();

        // Lines connecting points
        for (let j = idx + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      });

      animationFrameId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [loading]);

  if (loading) {
    return (
      <div className="container-fluid p-0">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="page-title">Cloud Infrastructure Dashboard</h1>
            <p className="page-subtitle">Real-time monitoring of cloud resources</p>
          </div>
        </div>
        <div className="row g-4 mb-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="col-12 col-md-6 col-xl-3">
              <SkeletonCard rows={2} />
            </div>
          ))}
        </div>
        <div className="row g-4">
          <div className="col-12 col-lg-8">
            <SkeletonCard rows={6} className="mb-4" />
            <SkeletonCard rows={4} />
          </div>
          <div className="col-12 col-lg-4">
            <SkeletonCard rows={5} className="mb-4" />
            <SkeletonCard rows={4} />
          </div>
        </div>
      </div>
    );
  }

  // Safe navigation mapping helpers
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
  const terraformVersion = data?.terraform_version || 'Not installed';
  const hostname = data?.system?.hostname || 'N/A';
  const kernel = data?.system?.kernel || 'N/A';
  const uptime = data?.system?.uptime || 'N/A';
  const gitBranch = data?.git_branch || 'N/A';

  const stats = [
    {
      id: 'vms',
      label: 'Running Virtual Machines',
      value: vmStatus === 'Running' || vmStatus === 'running' || vmStatus === 'Healthy' ? '1 / 1' : '0 / 1',
      trend: vmName,
      icon: <Server size={18} />,
      iconColorClass: 'stat-icon-blue',
      accentClass: 'card-accent-primary'
    },
    {
      id: 'containers',
      label: 'Docker Containers',
      value: dockerContainers !== 'N/A' ? `${dockerContainers} Active` : 'N/A',
      trend: 'Host running',
      icon: <Terminal size={18} />,
      iconColorClass: 'stat-icon-emerald',
      accentClass: 'card-accent-secondary'
    },
    {
      id: 'apis',
      label: 'API Services',
      value: apiStatus === 'Healthy' || apiStatus === 'Online' ? '1 Active' : '0 Active',
      trend: 'FastAPI',
      icon: <Globe size={18} />,
      iconColorClass: 'stat-icon-amber',
      accentClass: 'card-accent-tertiary'
    },
    {
      id: 'databases',
      label: 'Databases',
      value: databaseStatus === 'Healthy' ? '1 Active' : '0 Active',
      trend: databaseEngine,
      icon: <Database size={18} />,
      iconColorClass: 'stat-icon-violet',
      accentClass: 'card-accent-accent'
    }
  ];

  return (
    <div className="dashboard-container">
      <canvas ref={canvasRef} className="dashboard-canvas-bg" />
      
      <div className="dashboard-content-wrapper">
        {/* Header & Actions */}
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
          <div>
            <h1 className="page-title">Cloud Infrastructure Dashboard</h1>
            <p className="page-subtitle">Real-time monitoring of cloud resources</p>
          </div>
          <button 
            className="btn btn-outline-secondary d-flex align-items-center gap-2 border-color text-white" 
            onClick={fetchDashboardData}
            style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}
          >
            <RefreshCw size={14} /> Refresh Telemetry
          </button>
        </div>

        {/* Backend Alert (if API error occurs) */}
        {error && (
          <div className="alert alert-danger border-0 mb-4 d-flex align-items-center gap-3 text-white" style={{ backgroundColor: 'rgba(248, 113, 113, 0.15)', border: '1px solid rgba(248, 113, 113, 0.3)' }} role="alert">
            <AlertTriangle className="text-danger flex-shrink-0" size={24} />
            <div>
              <strong className="d-block text-danger mb-1">Backend API Connection Failure</strong>
              <span>Unable to reach backend API endpoint. Please ensure the backend services are running. ({error})</span>
            </div>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="row g-4 mb-4">
          {stats.map((stat) => (
            <div key={stat.id} className="col-12 col-md-6 col-xl-3">
              <div className={`stat-card ${stat.accentClass}`}>
                <div className="stat-card-header">
                  <div className={`stat-card-icon ${stat.iconColorClass}`}>
                    {stat.icon}
                  </div>
                  <span className="stat-trend trend-neutral">
                    {stat.trend}
                  </span>
                </div>
                <div>
                  <div className="stat-card-value">{stat.value}</div>
                  <div className="stat-card-label">{stat.label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Grid: Health Status & Resources & Activity & Info */}
        <div className="row g-4 mb-4">
          {/* Left column: Health Status & Resources */}
          <div className="col-12 col-lg-8">
            <div className="row g-4">
              
              {/* Infrastructure Health */}
              <div className="col-12">
                <div className="dashboard-panel">
                  <h2 className="panel-title">
                    <Activity className="text-success" size={18} /> Infrastructure Health
                  </h2>
                  <div className="health-grid">
                    <div className="health-item-card">
                      <span className="health-item-name">Azure VM ({vmName})</span>
                      <span className="status-badge status-badge-success">
                        <span className="status-dot success pulse"></span>
                        {vmStatus}
                      </span>
                    </div>
                    <div className="health-item-card">
                      <span className="health-item-name">Docker</span>
                      <span className="status-badge status-badge-success">
                        <span className="status-dot success pulse"></span>
                        {dockerStatus}
                      </span>
                    </div>
                    <div className="health-item-card">
                      <span className="health-item-name">FastAPI</span>
                      <span className="status-badge status-badge-success">
                        <span className="status-dot success pulse"></span>
                        {apiStatus}
                      </span>
                    </div>
                    <div className="health-item-card">
                      <span className="health-item-name">{databaseEngine}</span>
                      <span className="status-badge status-badge-success">
                        <span className="status-dot success pulse"></span>
                        {databaseStatus}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Resource Usage */}
              <div className="col-12">
                <div className="dashboard-panel">
                  <h2 className="panel-title">
                    <Cpu className="text-info" size={18} /> Resource Usage
                  </h2>
                  <div>
                    {/* CPU Progress bar */}
                    <div className="resource-usage-item">
                      <div className="usage-meta">
                        <span className="usage-label">CPU Usage</span>
                        <span className="usage-value">{cpuUsage}%</span>
                      </div>
                      <div className="progress-custom">
                        <div 
                          className="progress-bar-fill bg-cyan-gradient" 
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
                      <div className="progress-custom">
                        <div 
                          className="progress-bar-fill bg-emerald-gradient" 
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
                      <div className="progress-custom">
                        <div 
                          className="progress-bar-fill bg-amber-gradient" 
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

              {/* Cloud Information */}
              <div className="col-12">
                <div className="dashboard-panel">
                  <h2 className="panel-title">
                    <SettingsIcon className="text-secondary" size={18} /> Cloud Information
                  </h2>
                  <div className="info-card-grid">
                    <div className="info-card">
                      <span className="info-label">Hostname</span>
                      <span className="info-value">{hostname}</span>
                    </div>
                    <div className="info-card">
                      <span className="info-label">Uptime</span>
                      <span className="info-value">{uptime}</span>
                    </div>
                    <div className="info-card">
                      <span className="info-label">Kernel</span>
                      <span className="info-value">{kernel}</span>
                    </div>
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
                    <div className="info-card">
                      <span className="info-label">Git Branch</span>
                      <span className="info-value">{gitBranch}</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Right column: Quick Actions & Recent Activity */}
          <div className="col-12 col-lg-4">
            <div className="row g-4">
              
              {/* Quick Actions */}
              <div className="col-12">
                <div className="dashboard-panel">
                  <h2 className="panel-title">
                    <Code className="text-primary" size={18} /> Quick Actions
                  </h2>
                  <div className="action-grid">
                    <button className="btn-quick-action" id="action-swagger">
                      <ExternalLink className="action-icon" size={16} />
                      <span>Open Swagger</span>
                    </button>
                    <button className="btn-quick-action" id="action-ssh">
                      <Key className="action-icon" size={16} />
                      <span>SSH Connection</span>
                    </button>
                    <button className="btn-quick-action" id="action-restart">
                      <RefreshCw className="action-icon" size={16} />
                      <span>Restart Services</span>
                    </button>
                    <button className="btn-quick-action" id="action-logs">
                      <FileText className="action-icon" size={16} />
                      <span>View Logs</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="col-12">
                <div className="dashboard-panel">
                  <h2 className="panel-title">
                    <Terminal className="text-warning" size={18} /> Recent Activity
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
    </div>
  );
};

export default Dashboard;
