import React, { useState, useEffect } from 'react';
import './Firewall.css';
import { getFirewall } from '../../services/api';
import { useToast } from '../../components/Toast/Toast';
import { DataTable } from '../../components/DataTable/DataTable';
import { SkeletonCard } from '../../components/Skeleton/Skeleton';
import { 
  Shield, 
  Lock, 
  RefreshCw,
  Sliders
} from 'lucide-react';

const Firewall = () => {
  const [rules, setRules] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const fetchFirewall = async () => {
    try {
      setLoading(true);
      const data = await getFirewall();
      const normalizedRules = (data?.rules || []).map((rule) => ({
        ...rule,
        to_port: rule.to_port || rule.port || 'Any',
        protocol: rule.protocol || 'TCP',
        from_ip: rule.from_ip || rule.source || 'Anywhere',
        comment: rule.comment || rule.rule || rule.destination || 'Firewall policy'
      }));
      setRules(normalizedRules);
      setStats({
        status: data?.status || 'inactive',
        defaultPolicy: data?.default_policy || 'deny (incoming)',
        rulesCount: normalizedRules.length,
        ipv6: data?.ipv6_enabled ? 'Enabled' : 'Disabled',
        allowedCount: data?.allowed_rules_count || 0,
        blockedCount: data?.blocked_rules_count || 0
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to load host firewall (UFW) telemetry.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFirewall();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const columns = [
    {
      key: 'to_port',
      label: 'To Port / Protocol',
      sortable: true,
      render: (val, row) => (
        <span className="text-white font-weight-600">
          {val} {row.protocol ? `/ ${row.protocol.toLowerCase()}` : ''}
        </span>
      )
    },
    {
      key: 'action',
      label: 'Action Rule',
      sortable: true,
      render: (val) => {
        const isAllow = val?.toLowerCase() === 'allow';
        return (
          <span className={`status-badge ${isAllow ? 'status-badge-success' : 'status-badge-danger'}`}>
            <span className={`status-dot ${isAllow ? 'success' : 'danger'}`} />
            {val?.toUpperCase() || 'DENY'}
          </span>
        );
      }
    },
    {
      key: 'from_ip',
      label: 'Source Address',
      render: (val) => <span className="text-mono small text-secondary">{val || 'Anywhere'}</span>
    },
    {
      key: 'comment',
      label: 'Rule Comment',
      render: (val) => <span className="small text-muted">{val || 'N/A'}</span>
    }
  ];

  if (loading) {
    return (
      <div className="container-fluid p-0">
        <div className="page-header">
          <h1 className="page-title">Firewall Security</h1>
          <p className="page-subtitle">Configure ports, access lists, and UFW firewall policies</p>
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

  const isUfwActive = stats?.status?.toLowerCase() === 'active';

  return (
    <div className="firewall-container">
      <div className="page-header">
        <h1 className="page-title">Firewall Security</h1>
        <p className="page-subtitle">Configure ports, access lists, and UFW firewall policies</p>
      </div>

      {/* Firewall Stats */}
      <div className="row g-3 mb-4 firewall-stats-row">
        <div className="col-md-4">
          <div className={`card-base ${isUfwActive ? 'card-accent-secondary' : 'card-accent-danger'} p-3`}>
            <span className="small text-muted d-block mb-1">Firewall Service Status</span>
            <div className="d-flex align-items-center gap-2">
              <span className={`status-dot ${isUfwActive ? 'success' : 'danger'} pulse`} />
              <span className="h5 m-0 font-weight-700 text-white uppercase">{stats?.status}</span>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card-base card-accent-primary p-3">
            <span className="small text-muted d-block mb-1">Default policy (inbound)</span>
            <div className="d-flex align-items-center gap-2">
              <Lock size={16} className="text-primary" />
              <span className="h5 m-0 font-weight-700 text-white text-mono">{stats?.defaultPolicy}</span>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card-base card-accent-tertiary p-3">
            <span className="small text-muted d-block mb-1">Total active policies</span>
            <div className="d-flex align-items-center gap-2">
              <Sliders size={16} className="text-secondary" />
              <span className="h5 m-0 font-weight-700 text-white">{stats?.rulesCount} rules active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Rules Table */}
      <div className="card-base-static p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="d-flex align-items-center gap-2">
            <Shield size={18} className="text-primary" />
            <h4 className="m-0 text-white font-weight-600">Active Access Control Rules (ACL)</h4>
          </div>
          <button 
            className="btn btn-outline-secondary btn-sm text-white border-color" 
            onClick={fetchFirewall}
          >
            <RefreshCw size={12} className="me-1" /> Reload
          </button>
        </div>

        <DataTable 
          columns={columns} 
          data={rules}
          pageSize={10}
          emptyVariant="no-data"
          emptyMessage="No firewall rules configured in the active UFW tables."
        />
      </div>
    </div>
  );
};

export default Firewall;
