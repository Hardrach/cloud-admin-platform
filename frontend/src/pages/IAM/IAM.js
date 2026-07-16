import React, { useState, useEffect } from 'react';
import './IAM.css';
import { getIAM } from '../../services/api';
import { useToast } from '../../components/Toast/Toast';
import { DataTable } from '../../components/DataTable/DataTable';
import { SkeletonCard } from '../../components/Skeleton/Skeleton';
import { 
  Users, 
  Lock,
  RefreshCw
} from 'lucide-react';

const IAM = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const fetchIAM = async () => {
    try {
      setLoading(true);
      const data = await getIAM();
      setUsers(data?.users || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load identity and access management tables.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIAM();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const columns = [
    {
      key: 'username',
      label: 'Username ID',
      sortable: true,
      render: (val) => (
        <span className="text-white font-weight-600">{val}</span>
      )
    },
    {
      key: 'role',
      label: 'System Group / Role',
      sortable: true,
      render: (val) => {
        const isAdmin = val?.toLowerCase().includes('admin') || val?.toLowerCase().includes('sudo');
        return (
          <span className={`status-badge ${isAdmin ? 'status-badge-danger' : 'status-badge-neutral'}`}>
            <Lock size={10} className="me-1" />
            {val || 'User'}
          </span>
        );
      }
    },
    {
      key: 'status',
      label: 'Access Status',
      sortable: true,
      render: (val) => {
        const isActive = val?.toLowerCase() === 'active' || val?.toLowerCase() === 'enabled';
        return (
          <span className={`status-badge ${isActive ? 'status-badge-success' : 'status-badge-neutral'}`}>
            <span className={`status-dot ${isActive ? 'success' : 'neutral'}`} />
            {val || 'Inactive'}
          </span>
        );
      }
    },
    {
      key: 'last_login',
      label: 'Last Sign-in Activity',
      render: (val) => <span className="small text-secondary text-mono">{val || 'Never'}</span>
    }
  ];

  if (loading) {
    return (
      <div className="container-fluid p-0">
        <div className="page-header">
          <h1 className="page-title">Identity & Access Management</h1>
          <p className="page-subtitle">Configure administrative login accounts and group privileges</p>
        </div>
        <SkeletonCard rows={8} />
      </div>
    );
  }

  return (
    <div className="iam-container">
      <div className="page-header">
        <h1 className="page-title">Identity & Access Management</h1>
        <p className="page-subtitle">Configure administrative login accounts and group privileges</p>
      </div>

      <div className="card-base-static p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="d-flex align-items-center gap-2">
            <Users size={18} className="text-primary" />
            <h4 className="m-0 text-white font-weight-600">Local Accounts and Privileges</h4>
          </div>
          <button 
            className="btn btn-outline-secondary btn-sm text-white border-color" 
            onClick={fetchIAM}
          >
            <RefreshCw size={12} className="me-1" /> Reload
          </button>
        </div>

        <DataTable 
          columns={columns} 
          data={users}
          pageSize={10}
          emptyVariant="no-data"
          emptyMessage="No active user accounts listed on host IAM tables."
        />
      </div>
    </div>
  );
};

export default IAM;
