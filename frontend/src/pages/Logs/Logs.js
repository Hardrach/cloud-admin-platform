import React, { useState, useEffect, useRef } from 'react';
import './Logs.css';
import { getLogs } from '../../services/api';
import { useToast } from '../../components/Toast/Toast';
import { SkeletonCard } from '../../components/Skeleton/Skeleton';
import { EmptyState } from '../../components/EmptyState/EmptyState';
import { 
  Terminal, 
  Search, 
  RefreshCw
} from 'lucide-react';

const Logs = () => {
  const [logsList, setLogsList] = useState([]);
  const [filterText, setFilterText] = useState('');
  const [levelFilter, setLevelFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const terminalEndRef = useRef(null);
  const toast = useToast();

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await getLogs();
      setLogsList(data?.logs || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load host standard logs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Scroll to bottom on load
  useEffect(() => {
    if (!loading && terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [loading, logsList]);

  // Filter logs list
  const filteredLogs = logsList.filter(log => {
    const matchesLevel = levelFilter === 'ALL' || log.level?.toUpperCase() === levelFilter;
    const matchesSearch = !filterText || 
      log.message?.toLowerCase().includes(filterText.toLowerCase()) ||
      log.timestamp?.toLowerCase().includes(filterText.toLowerCase());
    return matchesLevel && matchesSearch;
  });

  if (loading) {
    return (
      <div className="container-fluid p-0">
        <div className="page-header">
          <h1 className="page-title">System Logs</h1>
          <p className="page-subtitle">Standard output and runtime streams from backend microservices</p>
        </div>
        <SkeletonCard rows={12} />
      </div>
    );
  }

  return (
    <div className="logs-container">
      <div className="page-header">
        <h1 className="page-title">System Logs</h1>
        <p className="page-subtitle">Standard output and runtime streams from backend microservices</p>
      </div>

      {/* Control filters bar */}
      <div className="logs-control-panel mb-4 card-base p-3">
        <div className="d-flex align-items-center gap-2 flex-grow-1" style={{ maxWidth: '320px' }}>
          <Search size={16} style={{ color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search log outputs..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="logs-search-input"
          />
        </div>

        <div className="d-flex align-items-center gap-2 logs-filter-group">
          <span className="small" style={{ color: 'var(--text-secondary)' }}>Log level:</span>
          <select 
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="logs-level-select"
          >
            <option value="ALL">ALL LEVELS</option>
            <option value="INFO">INFO</option>
            <option value="WARN">WARNING</option>
            <option value="ERROR">ERROR</option>
          </select>
        </div>

        <button 
          className="logs-refresh-btn ms-auto"
          onClick={fetchLogs}
        >
          <RefreshCw size={14} className="me-1" /> Refresh
        </button>
      </div>

      {/* Log Console Terminal wrapper */}
      <div className="log-viewer-panel">
        <div className="log-viewer-header">
          <div className="d-flex align-items-center gap-2">
            <Terminal size={16} className="text-primary" />
            <span className="small text-secondary fw-semibold">stdout_stream.log</span>
          </div>
          <span className="small text-muted">{filteredLogs.length} lines listed</span>
        </div>

        {filteredLogs.length === 0 ? (
          <EmptyState variant="no-data" description="No system log traces match your level or search query." />
        ) : (
          <div className="log-terminal" role="table" aria-label="System log lines">
            {filteredLogs.map((log, idx) => {
              const lvl = log.level?.toLowerCase() || 'info';
              return (
                <div key={`${log.timestamp}-${idx}`} className="log-line" role="row">
                  <span className="log-num">{idx + 1}</span>
                  <span className="log-time">{log.timestamp?.split('T')[1] || log.timestamp}</span>
                  <span className={`log-level level-${lvl}`}>{log.level}</span>
                  <span className="log-msg">{log.message}</span>
                </div>
              );
            })}
            <div ref={terminalEndRef} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Logs;
