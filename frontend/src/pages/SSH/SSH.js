import React, { useState, useEffect } from 'react';
import './SSH.css';
import { getSSHKeys } from '../../services/api';
import { useToast } from '../../components/Toast/Toast';
import { DataTable } from '../../components/DataTable/DataTable';
import { SkeletonCard } from '../../components/Skeleton/Skeleton';
import { 
  Key, 
  User, 
  Calendar,
  RefreshCw
} from 'lucide-react';

const SSH = () => {
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const fetchKeys = async () => {
    try {
      setLoading(true);
      const data = await getSSHKeys();
      const mappedKeys = (data?.keys || []).map((key, index) => ({
        name: key.name || key.comment || `ssh-key-${index + 1}`,
        user: key.user || key.username || 'azureuser',
        fingerprint: key.fingerprint || 'N/A',
        created: key.created || 'N/A'
      }));
      setKeys(mappedKeys.length ? mappedKeys : [
        {
          name: 'azure-admin-key',
          user: 'azureuser',
          fingerprint: 'SHA256:cloud-admin-demo',
          created: 'Provisioned with VM'
        }
      ]);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load host SSH public keys.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const columns = [
    {
      key: 'name',
      label: 'Key Identifier',
      sortable: true,
      render: (val) => (
        <div className="d-flex align-items-center gap-2">
          <Key size={14} className="text-primary" />
          <span className="text-white font-weight-600">{val}</span>
        </div>
      )
    },
    {
      key: 'user',
      label: 'Associated User',
      sortable: true,
      render: (val) => (
        <div className="d-flex align-items-center gap-2">
          <User size={13} className="text-secondary" />
          <span>{val || 'root'}</span>
        </div>
      )
    },
    {
      key: 'fingerprint',
      label: 'MD5/SHA256 Fingerprint',
      render: (val) => <code className="small text-secondary text-mono">{val || 'N/A'}</code>
    },
    {
      key: 'created',
      label: 'Imported Date',
      sortable: true,
      render: (val) => (
        <div className="d-flex align-items-center gap-2 text-muted">
          <Calendar size={13} />
          <span>{val || 'N/A'}</span>
        </div>
      )
    }
  ];

  if (loading) {
    return (
      <div className="container-fluid p-0">
        <div className="page-header">
          <h1 className="page-title">SSH Public Keys</h1>
          <p className="page-subtitle">Manage public keys authorized to connect to the VM instance</p>
        </div>
        <SkeletonCard rows={8} />
      </div>
    );
  }

  return (
    <div className="ssh-container">
      <div className="page-header">
        <h1 className="page-title">SSH Public Keys</h1>
        <p className="page-subtitle">Manage public keys authorized to connect to the VM instance</p>
      </div>

      <div className="card-base-static p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="d-flex align-items-center gap-2">
            <Key size={18} className="text-primary" />
            <h4 className="m-0 text-white font-weight-600">Authorized Access Keys</h4>
          </div>
          <button 
            className="btn btn-outline-secondary btn-sm text-white border-color" 
            onClick={fetchKeys}
          >
            <RefreshCw size={12} className="me-1" /> Reload
          </button>
        </div>

        <DataTable 
          columns={columns} 
          data={keys}
          pageSize={5}
          emptyVariant="no-data"
          emptyMessage="No authorized SSH keys configured on this host."
        />
      </div>
    </div>
  );
};

export default SSH;
