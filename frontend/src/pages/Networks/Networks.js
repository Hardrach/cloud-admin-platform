import React, { useState, useEffect } from 'react';
import './Networks.css';
import { getNetworks } from '../../services/api';
import { useToast } from '../../components/Toast/Toast';
import { DataTable } from '../../components/DataTable/DataTable';
import { SkeletonCard } from '../../components/Skeleton/Skeleton';
import { 
  Globe, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Settings, 
  Activity,
  RefreshCw
} from 'lucide-react';

const Networks = () => {
  const [interfaces, setInterfaces] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const fetchNetworks = async () => {
    try {
      setLoading(true);
      const data = await getNetworks();
      setInterfaces(data?.interfaces || []);
      setStats({
        ip: data?.azure?.public_ip || data?.public_ip || 'Unavailable',
        dns: data?.dns_servers?.length ? data.dns_servers.join(', ') : data?.dns || 'Unavailable',
        gateway: data?.gateway || data?.azure?.subnet || 'Unavailable',
        rx: data?.rx_bytes || data?.traffic?.rx || '0 MB',
        tx: data?.tx_bytes || data?.traffic?.tx || '0 MB'
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to retrieve host network interfaces.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNetworks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const columns = [
    {
      key: 'name',
      label: 'Interface',
      sortable: true,
      render: (val) => <span className="text-white fw-semibold">{val}</span>
    },
    {
      key: 'ip',
      label: 'IP Address',
      render: (val) => <code className="small text-primary text-mono">{val || 'Unassigned'}</code>
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (val) => {
        const isUp = val?.toLowerCase() === 'up' || val?.toLowerCase() === 'active';
        return (
          <span className={`status-badge ${isUp ? 'status-badge-success' : 'status-badge-neutral'}`}>
            <span className={`status-dot ${isUp ? 'success pulse' : 'neutral'}`} />
            {val || 'Unknown'}
          </span>
        );
      }
    },
    {
      key: 'mac',
      label: 'MAC Address',
      render: (val) => <span className="text-mono small text-secondary">{val || 'N/A'}</span>
    },
    {
      key: 'mtu',
      label: 'MTU',
      render: (val) => <span className="small text-secondary">{val || '1500'}</span>
    }
  ];

  if (loading) {
    return (
      <div className="container-fluid p-0">
        <div className="page-header">
          <h1 className="page-title">Networks</h1>
          <p className="page-subtitle">Inspect virtual and physical network configurations</p>
        </div>
        <div className="row g-4 mb-4">
          <div className="col-md-4"><SkeletonCard rows={2} /></div>
          <div className="col-md-4"><SkeletonCard rows={2} /></div>
          <div className="col-md-4"><SkeletonCard rows={2} /></div>
        </div>
        <SkeletonCard rows={6} />
      </div>
    );
  }

  return (
    <div className="networks-container">
      <div className="page-header">
        <h1 className="page-title">Networks</h1>
        <p className="page-subtitle">Inspect virtual and physical network configurations</p>
      </div>

      {/* Network Core Stats */}
      <div className="row g-4 mb-4 network-stats-row">
        <div className="col-md-4">
          <div className="card-base card-accent-primary p-3">
            <span className="small text-muted d-block mb-1">External public IP</span>
            <div className="d-flex align-items-center gap-2">
              <Globe size={16} className="text-primary" />
              <span className="h5 m-0 font-weight-700 text-white text-mono">{stats?.ip}</span>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card-base card-accent-secondary p-3">
            <span className="small text-muted d-block mb-1">Gateway Router</span>
            <div className="d-flex align-items-center gap-2">
              <Settings size={16} className="text-secondary" />
              <span className="h5 m-0 font-weight-700 text-white text-mono">{stats?.gateway}</span>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card-base card-accent-tertiary p-3">
            <span className="small text-muted d-block mb-1">DNS Nameservers</span>
            <div className="d-flex align-items-center gap-2">
              <Activity size={16} className="text-secondary" />
              <span className="h6 m-0 font-weight-700 text-white text-mono truncate">{stats?.dns}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Interfaces List Table */}
        <div className="col-lg-8">
          <div className="card-base-static p-4 h-100">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4 className="m-0 text-white font-weight-600">Interface Inventory</h4>
              <button 
                className="btn btn-outline-secondary btn-sm text-white border-color" 
                onClick={fetchNetworks}
              >
                <RefreshCw size={12} className="me-1" /> Reload
              </button>
            </div>

            <DataTable 
              columns={columns} 
              data={interfaces}
              pageSize={5}
              emptyVariant="no-data"
              emptyMessage="No active network adaptors listed from VM host interface tables."
            />
          </div>
        </div>

        {/* Traffic Telemetry Card */}
        <div className="col-lg-4">
          <div className="card-base traffic-card">
            <h4 className="text-white font-weight-600 mb-4 d-flex align-items-center gap-2">
              <Activity size={16} className="text-primary" /> Traffic Diagnostics
            </h4>
            <div className="d-flex flex-column gap-4">
              <div className="card-base bg-elevated p-3">
                <div className="d-flex align-items-center gap-2 text-success mb-2">
                  <ArrowDownLeft size={16} />
                  <span className="small font-weight-600 uppercase">Received (RX)</span>
                </div>
                <div className="traffic-value-large">
                  {stats?.rx.split(' ')[0]}
                  <span className="traffic-unit">{stats?.rx.split(' ')[1]}</span>
                </div>
              </div>
              <div className="card-base bg-elevated p-3">
                <div className="d-flex align-items-center gap-2 text-primary mb-2">
                  <ArrowUpRight size={16} />
                  <span className="small font-weight-600 uppercase">Transmitted (TX)</span>
                </div>
                <div className="traffic-value-large">
                  {stats?.tx.split(' ')[0]}
                  <span className="traffic-unit">{stats?.tx.split(' ')[1]}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Networks;
