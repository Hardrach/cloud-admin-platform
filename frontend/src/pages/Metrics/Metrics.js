import React, { useState, useEffect } from 'react';
import './Metrics.css';
import { getMetrics } from '../../services/api';
import { useToast } from '../../components/Toast/Toast';
import { SkeletonChart } from '../../components/Skeleton/Skeleton';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  Cpu, 
  Database
} from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-chart-tooltip">
        <div className="tooltip-time">{label}</div>
        {payload.map((entry, idx) => (
          <div key={idx} className="tooltip-val-row" style={{ color: entry.color }}>
            <span className="tooltip-dot" style={{ backgroundColor: entry.color }} />
            <span>{entry.name}: {entry.value}%</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const Metrics = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const data = await getMetrics();
      const cpuHistory = data?.cpu_history || [];
      const memoryHistory = data?.memory_history || [];
      const maxLength = Math.max(cpuHistory.length, memoryHistory.length);
      const mergedHistory = Array.from({ length: maxLength }).map((_, index) => ({
        time: cpuHistory[index]?.time || memoryHistory[index]?.time || `T-${maxLength - index}`,
        cpu: cpuHistory[index]?.cpu ?? cpuHistory[index]?.usage ?? data?.cpu?.usage ?? 0,
        memory: memoryHistory[index]?.memory ?? memoryHistory[index]?.usage ?? data?.memory?.percent ?? 0
      }));
      setHistory(data?.history?.length ? data.history : mergedHistory);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load metrics telemetry.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="container-fluid p-0">
        <div className="page-header">
          <h1 className="page-title">Metrics Analytics</h1>
          <p className="page-subtitle">Real-time telemetry and resource usage charts</p>
        </div>
        <div className="row g-4 mb-4">
          <div className="col-md-6"><SkeletonChart /></div>
          <div className="col-md-6"><SkeletonChart /></div>
        </div>
      </div>
    );
  }

  return (
    <div className="metrics-container">
      <div className="page-header">
        <h1 className="page-title">Metrics Analytics</h1>
        <p className="page-subtitle">Real-time telemetry and resource usage charts</p>
      </div>

      <div className="row g-4 mb-4">
        {/* CPU Chart */}
        <div className="col-md-6">
          <div className="card-base chart-card">
            <h4 className="text-white font-weight-600 mb-4 d-flex align-items-center gap-2">
              <Cpu size={16} className="text-primary" /> CPU Utilization History
            </h4>
            <div style={{ width: '100%', height: '240px' }}>
              <ResponsiveContainer>
                <AreaChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                  <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={11} />
                  <YAxis stroke="var(--text-muted)" fontSize={11} domain={[0, 100]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="cpu" 
                    name="CPU Usage"
                    stroke="var(--color-primary)" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#cpuGradient)" 
                    isAnimationActive={true}
                    animationDuration={800}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* RAM Chart */}
        <div className="col-md-6">
          <div className="card-base chart-card">
            <h4 className="text-white font-weight-600 mb-4 d-flex align-items-center gap-2">
              <Database size={16} className="text-success" /> Memory Allocation History
            </h4>
            <div style={{ width: '100%', height: '240px' }}>
              <ResponsiveContainer>
                <AreaChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="ramGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-secondary)" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="var(--color-secondary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                  <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={11} />
                  <YAxis stroke="var(--text-muted)" fontSize={11} domain={[0, 100]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="memory" 
                    name="RAM Usage"
                    stroke="var(--color-secondary)" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#ramGradient)" 
                    isAnimationActive={true}
                    animationDuration={800}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Metrics;
