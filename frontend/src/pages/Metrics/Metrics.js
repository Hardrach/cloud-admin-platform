import React, { useState, useEffect } from 'react';
import './Metrics.css';
import { getMetrics } from '../../services/api';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  RadialBarChart, 
  RadialBar, 
  LineChart, 
  Line 
} from 'recharts';
import { 
  FiCpu, 
  FiActivity, 
  FiHardDrive, 
  FiWifi, 
  FiDatabase, 
  FiRefreshCw, 
  FiAlertTriangle 
} from 'react-icons/fi';

const Metrics = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchMetrics = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setError(null);
      const data = await getMetrics();
      setMetrics(data);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load metrics telemetry.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMetrics(true);

    // Automatic refresh every 5 seconds
    const interval = setInterval(() => {
      setIsRefreshing(true);
      fetchMetrics(false);
    }, 5000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchMetrics(true);
  };

  if (loading && !metrics) {
    return (
      <div className="metrics-container">
        <div className="storage-header-toolbar mb-4">
          <div>
            <h1 className="storage-title">System Metrics</h1>
            <p className="storage-subtitle">Loading system telemetry and historical analytics...</p>
          </div>
        </div>
        <div className="row g-3 mb-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="col-md-3">
              <div className="metric-card p-3 rounded" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', height: '110px' }}>
                <div className="skeleton-text mb-2" />
                <div className="skeleton-text short" />
              </div>
            </div>
          ))}
        </div>
        <div className="row g-4">
          <div className="col-md-6">
            <div className="disk-card p-4 rounded" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', height: '300px' }}>
              <div className="skeleton-text mb-3" style={{ width: '40%' }} />
              <div className="skeleton-text" style={{ height: '200px' }} />
            </div>
          </div>
          <div className="col-md-6">
            <div className="disk-card p-4 rounded" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', height: '300px' }}>
              <div className="skeleton-text mb-3" style={{ width: '40%' }} />
              <div className="skeleton-text" style={{ height: '200px' }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Radial Bar Data
  const diskData = [
    {
      name: 'Disk Used',
      uv: metrics?.disk?.percent || 0,
      fill: 'var(--primary-color)',
    }
  ];

  const cpuUsage = metrics?.cpu?.usage || 0;
  const cpuColor = cpuUsage > 80 ? 'text-danger' : cpuUsage > 50 ? 'text-warning' : 'text-success';

  const memPercent = metrics?.memory?.percent || 0;
  const memColor = memPercent > 80 ? 'text-danger' : memPercent > 50 ? 'text-warning' : 'text-success';

  const diskPercent = metrics?.disk?.percent || 0;
  const diskColor = diskPercent > 80 ? 'text-danger' : diskPercent > 50 ? 'text-warning' : 'text-success';

  return (
    <div className={`metrics-container ${isRefreshing ? 'refresh-animate' : ''}`}>
      {/* Header */}
      <div className="storage-header-toolbar mb-3">
        <div>
          <h1 className="storage-title">System Metrics</h1>
          <p className="storage-subtitle">Real-time CPU, memory, disk partitions, and interface traffic statistics</p>
        </div>
        <div className="ms-auto d-flex align-items-center gap-2">
          <button className="btn btn-outline-secondary border-color text-white d-flex align-items-center gap-2" onClick={handleRefresh} style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
            <FiRefreshCw className={isRefreshing ? 'spin-animation' : ''} /> Refresh
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert-danger border-0 mb-4 d-flex align-items-center gap-3 text-white" style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)' }} role="alert">
          <FiAlertTriangle className="text-danger flex-shrink-0" size={24} />
          <div>
            <strong className="d-block text-danger mb-1">Metrics Service Error</strong>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* 4 Metrics Header Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="metric-card p-3 rounded" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary small font-medium">CPU Usage</span>
              <FiCpu className="text-primary" size={20} />
            </div>
            <div className={`fs-4 fw-bold ${cpuColor}`}>{metrics?.cpu?.usage}%</div>
            <div className="small text-muted mt-1">Processor core load ({metrics?.cpu?.cores} Cores)</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="metric-card p-3 rounded" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary small font-medium">Memory Usage</span>
              <FiActivity className="text-warning" size={20} />
            </div>
            <div className={`fs-4 fw-bold ${memColor}`}>{metrics?.memory?.percent}%</div>
            <div className="small text-muted mt-1">{metrics?.memory?.used_gb} GB of {metrics?.memory?.total_gb} GB</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="metric-card p-3 rounded" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary small font-medium">Disk Usage</span>
              <FiHardDrive className="text-success" size={20} />
            </div>
            <div className={`fs-4 fw-bold ${diskColor}`}>{metrics?.disk?.percent}%</div>
            <div className="small text-muted mt-1">{metrics?.disk?.used_gb} GB of {metrics?.disk?.total_gb} GB</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="metric-card p-3 rounded" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary small font-medium">Network Traffic</span>
              <FiWifi className="text-info" size={20} />
            </div>
            <div className="fs-6 fw-bold text-white">
              ▲ {metrics?.network?.upload_mb} MB/s | ▼ {metrics?.network?.download_mb} MB/s
            </div>
            <div className="small text-muted mt-1">Active interface throughput</div>
          </div>
        </div>
      </div>

      {/* Section: Recharts Graphs */}
      <div className="row g-4 mb-4">
        {/* CPU History AreaChart */}
        <div className="col-md-6">
          <div className="chart-card p-3 rounded" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
            <div className="fw-semibold text-white mb-3 d-flex align-items-center gap-2">
              <FiCpu className="text-primary" /> CPU Usage History
            </div>
            <div style={{ width: '100%', height: 220 }}>
              <ResponsiveContainer>
                <AreaChart data={metrics?.cpu_history || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary-color)" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="var(--primary-color)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="time" stroke="var(--text-secondary)" fontSize={11} />
                  <YAxis stroke="var(--text-secondary)" fontSize={11} domain={[0, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)', color: '#fff' }} />
                  <Area type="monotone" dataKey="usage" stroke="var(--primary-color)" fillOpacity={1} fill="url(#colorCpu)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Memory History AreaChart */}
        <div className="col-md-6">
          <div className="chart-card p-3 rounded" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
            <div className="fw-semibold text-white mb-3 d-flex align-items-center gap-2">
              <FiActivity className="text-warning" /> Memory Usage History
            </div>
            <div style={{ width: '100%', height: 220 }}>
              <ResponsiveContainer>
                <AreaChart data={metrics?.memory_history || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorMem" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--warning-color)" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="var(--warning-color)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="time" stroke="var(--text-secondary)" fontSize={11} />
                  <YAxis stroke="var(--text-secondary)" fontSize={11} domain={[0, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)', color: '#fff' }} />
                  <Area type="monotone" dataKey="usage" stroke="var(--warning-color)" fillOpacity={1} fill="url(#colorMem)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Extended Telemetry Metrics Row */}
      <div className="row g-3 mb-4 mt-1">
        <div className="col-md-4">
          <div className="metric-card p-3 rounded h-100" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
            <div className="fw-semibold text-white mb-2 d-flex align-items-center gap-2">
              <FiCpu className="text-primary" /> Load Average
            </div>
            <div className="fs-5 fw-bold text-white mt-2">
              {metrics?.load_average ? `${metrics.load_average['1min']} (1m) | ${metrics.load_average['5min']} (5m) | ${metrics.load_average['15min']} (15m)` : '0.00 | 0.00 | 0.00'}
            </div>
            <div className="small text-muted mt-1">CPU process load queues</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="metric-card p-3 rounded h-100" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
            <div className="fw-semibold text-white mb-2 d-flex align-items-center gap-2">
              <FiActivity className="text-warning" /> Swap Memory
            </div>
            <div className="fs-5 fw-bold text-warning mt-2">
              {metrics?.swap?.percent || 0}% Used
            </div>
            <div className="small text-muted mt-1">
              Swap: {metrics?.swap?.used_gb || 0} GB used of {metrics?.swap?.total_gb || 0} GB ({metrics?.swap?.free_gb || 0} GB free)
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="metric-card p-3 rounded h-100" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
            <div className="fw-semibold text-white mb-2 d-flex align-items-center gap-2">
              <FiHardDrive className="text-success" /> Disk I/O Counters
            </div>
            <div className="small text-white mt-2">
              <strong>Reads:</strong> {metrics?.disk_io?.read_count || 0} ({metrics?.disk_io?.read_mb || 0} MB)
            </div>
            <div className="small text-white mt-1">
              <strong>Writes:</strong> {metrics?.disk_io?.write_count || 0} ({metrics?.disk_io?.write_mb || 0} MB)
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Network LineChart */}
        <div className="col-md-8">
          <div className="chart-card p-3 rounded" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
            <div className="fw-semibold text-white mb-3 d-flex align-items-center gap-2">
              <FiWifi className="text-info" /> Network Upload/Download History
            </div>
            <div style={{ width: '100%', height: 240 }}>
              <ResponsiveContainer>
                <LineChart data={metrics?.network_history || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="time" stroke="var(--text-secondary)" fontSize={11} />
                  <YAxis stroke="var(--text-secondary)" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)', color: '#fff' }} />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                  <Line type="monotone" dataKey="download" name="Download (MB/s)" stroke="var(--primary-color)" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                  <Line type="monotone" dataKey="upload" name="Upload (MB/s)" stroke="var(--warning-color)" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Disk radial and Docker summary */}
        <div className="col-md-4">
          <div className="row g-3">
            <div className="col-12">
              <div className="chart-card p-3 rounded" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
                <div className="fw-semibold text-white mb-2 d-flex align-items-center gap-2">
                  <FiHardDrive className="text-success" /> Disk Utilization
                </div>
                <div className="d-flex align-items-center justify-content-between w-100">
                  <div className="position-relative d-inline-flex align-items-center justify-content-center" style={{ width: 100, height: 100 }}>
                    <ResponsiveContainer>
                      <RadialBarChart 
                        cx="50%" 
                        cy="50%" 
                        innerRadius="65%" 
                        outerRadius="100%" 
                        barSize={6} 
                        data={diskData}
                        startAngle={90}
                        endAngle={-270}
                      >
                        <RadialBar
                          minAngle={15}
                          background={{ fill: 'rgba(255,255,255,0.05)' }}
                          clockWise
                          dataKey="uv"
                        />
                      </RadialBarChart>
                    </ResponsiveContainer>
                    <div className="position-absolute d-flex flex-column align-items-center justify-content-center">
                      <span className={`fw-bold ${diskColor}`} style={{ fontSize: '0.85rem' }}>{metrics?.disk?.percent}%</span>
                      <span style={{ fontSize: '0.55rem', color: 'var(--text-secondary)' }}>Used</span>
                    </div>
                  </div>
                  <div className="text-end">
                    <div className="fs-6 fw-bold text-white">Disk Storage</div>
                    <div className="small text-secondary">{metrics?.disk?.used_gb} GB / {metrics?.disk?.total_gb} GB</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12">
              <div className="chart-card p-3 rounded" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
                <div className="fw-semibold text-white mb-3 d-flex align-items-center gap-2">
                  <FiDatabase className="text-info" /> Docker Status
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <span className="small text-secondary d-block">Running Containers</span>
                    <span className="fs-4 fw-bold text-success">{metrics?.docker?.running || 0}</span>
                  </div>
                  <div>
                    <span className="small text-secondary d-block">Stopped Containers</span>
                    <span className="fs-4 fw-bold text-muted">{metrics?.docker?.stopped || 0}</span>
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

export default Metrics;
