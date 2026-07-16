import React, { useState, useEffect } from 'react';
import './Alerts.css';
import { getAlerts } from '../../services/api';
import { useToast } from '../../components/Toast/Toast';
import { SkeletonCard } from '../../components/Skeleton/Skeleton';
import { EmptyState } from '../../components/EmptyState/EmptyState';
import { 
  Bell, 
  AlertTriangle, 
  AlertOctagon, 
  Info, 
  CheckCircle,
  RefreshCw
} from 'lucide-react';

const Alerts = () => {
  const [alertsList, setAlertsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const data = await getAlerts();
      setAlertsList(data?.alerts || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load active system alerts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getSeverityClass = (sev) => {
    switch (sev?.toLowerCase()) {
      case 'critical':
      case 'danger':
      case 'error':
        return 'alert-card-danger';
      case 'warning':
      case 'medium':
        return 'alert-card-warning';
      case 'success':
        return 'alert-card-success';
      default:
        return 'alert-card-info';
    }
  };

  const getIcon = (sev) => {
    switch (sev?.toLowerCase()) {
      case 'critical':
      case 'danger':
      case 'error':
        return <AlertOctagon size={18} />;
      case 'warning':
      case 'medium':
        return <AlertTriangle size={18} />;
      case 'success':
        return <CheckCircle size={18} />;
      default:
        return <Info size={18} />;
    }
  };

  if (loading) {
    return (
      <div className="container-fluid p-0">
        <div className="page-header">
          <h1 className="page-title">Security & System Alerts</h1>
          <p className="page-subtitle">Real-time alerts, health warnings, and dependency checks</p>
        </div>
        <div className="d-flex flex-column gap-3">
          <SkeletonCard rows={2} />
          <SkeletonCard rows={2} />
          <SkeletonCard rows={2} />
        </div>
      </div>
    );
  }

  return (
    <div className="alerts-container">
      <div className="page-header">
        <h1 className="page-title">Security & System Alerts</h1>
        <p className="page-subtitle">Real-time alerts, health warnings, and dependency checks</p>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-2">
          <Bell size={18} className="text-primary" />
          <span className="small text-secondary fw-semibold">Active Monitors ({alertsList.length})</span>
        </div>
        <button 
          className="btn btn-outline-secondary btn-sm text-white border-color"
          onClick={fetchAlerts}
        >
          <RefreshCw size={12} className="me-1" /> Reload
        </button>
      </div>

      {alertsList.length === 0 ? (
        <EmptyState 
          variant="no-alerts" 
          title="All Systems Operational"
          description="No active system warnings, hardware alarms, or missing dependencies are reported."
        />
      ) : (
        <div className="d-flex flex-column gap-3">
          {alertsList.map((alert) => (
            <div key={alert.id} className={`alert-item-card ${getSeverityClass(alert.severity)}`}>
              <div className="d-flex align-items-center gap-3">
                <div className="alert-icon-wrapper">
                  {getIcon(alert.severity)}
                </div>
                <div>
                  <h5 className="m-0 text-white font-weight-600" style={{ fontSize: '14px' }}>{alert.title}</h5>
                  <p className="m-0 text-secondary small mt-1">{alert.message}</p>
                </div>
              </div>
              <div className="text-end flex-shrink-0 ms-3">
                <span className={`status-badge ${getSeverityClass(alert.severity).replace('card', 'badge')}`}>
                  {alert.severity}
                </span>
                <span className="d-block small text-muted mt-1" style={{ fontSize: '10px' }}>
                  {alert.timestamp?.split('T')[1]?.substring(0, 5) || 'Active'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Alerts;
