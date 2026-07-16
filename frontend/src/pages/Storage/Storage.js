import React, { useState, useEffect } from 'react';
import './Storage.css';
import { getStorage } from '../../services/api';
import { useToast } from '../../components/Toast/Toast';
import { DataTable } from '../../components/DataTable/DataTable';
import { SkeletonCard } from '../../components/Skeleton/Skeleton';
import { 
  Database, 
  HardDrive, 
  Layers, 
  Activity,
  RefreshCw,
  TrendingUp
} from 'lucide-react';

const Storage = () => {
  const [disks, setDisks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const formatGb = (value) => value !== undefined && value !== null ? `${value} GB` : 'N/A';

  const fetchStorage = async () => {
    try {
      setLoading(true);
      const data = await getStorage();
      const diskInfo = data?.disk || {};
      const percent = diskInfo.total_gb ? Math.round((diskInfo.used_gb / diskInfo.total_gb) * 100) : diskInfo.percent || 0;
      const mappedVolumes = (data?.volumes || []).map((volume) => ({
        device: volume.name,
        mount: volume.mountpoint || '/var/lib/docker/volumes',
        size: formatGb(diskInfo.total_gb),
        used: formatGb(diskInfo.used_gb),
        percent: `${percent}%`
      }));
      const rootDisk = {
        device: diskInfo.filesystem || 'rootfs',
        mount: '/',
        size: formatGb(diskInfo.total_gb),
        used: formatGb(diskInfo.used_gb),
        percent: `${percent}%`
      };
      const nextDisks = data?.disks?.length ? data.disks : [rootDisk, ...mappedVolumes];
      setDisks(nextDisks);
      
      const systemDisk = nextDisks.find(d => d.mount === '/' || d.mount === '/workspace') || nextDisks[0];
      setStats({
        total: data?.total_space || formatGb(diskInfo.total_gb),
        used: data?.used_space || formatGb(diskInfo.used_gb),
        free: data?.free_space || formatGb(diskInfo.free_gb),
        percent: systemDisk ? parseInt(systemDisk.percent) : 0,
        mount: systemDisk ? systemDisk.mount : 'N/A'
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to load host storage metrics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStorage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const columns = [
    {
      key: 'device',
      label: 'Filesystem Device',
      sortable: true,
      render: (val) => <span className="text-white fw-semibold">{val}</span>
    },
    {
      key: 'mount',
      label: 'Mount Point',
      sortable: true,
      render: (val) => <code className="small text-primary text-mono">{val}</code>
    },
    {
      key: 'size',
      label: 'Capacity',
      render: (val) => <span className="text-mono small text-secondary">{val}</span>
    },
    {
      key: 'used',
      label: 'Used',
      render: (val) => <span className="text-mono small text-secondary">{val}</span>
    },
    {
      key: 'percent',
      label: 'Usage Bar',
      sortable: true,
      render: (val) => {
        const pct = parseInt(val) || 0;
        const colorClass = pct > 85 ? 'bg-danger' : pct > 65 ? 'bg-amber-gradient' : 'bg-cyan-gradient';
        return (
          <div className="d-flex align-items-center gap-2" style={{ minWidth: '120px' }}>
            <span className="small text-mono text-light" style={{ width: '32px' }}>{val}</span>
            <div className="progress-custom" style={{ height: '6px' }}>
              <div 
                className={`progress-bar-fill ${colorClass}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      }
    }
  ];

  if (loading) {
    return (
      <div className="container-fluid p-0">
        <div className="page-header">
          <h1 className="page-title">Storage</h1>
          <p className="page-subtitle">Inspect file mounts and storage utilization metrics</p>
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
    <div className="storage-container">
      <div className="page-header">
        <h1 className="page-title">Storage</h1>
        <p className="page-subtitle">Inspect file mounts and storage utilization metrics</p>
      </div>

      {/* Storage Core Stats */}
      <div className="row g-4 mb-4 storage-stats-row">
        <div className="col-md-4">
          <div className="card-base card-accent-primary p-3">
            <span className="small text-muted d-block mb-1">Total disk volume</span>
            <div className="d-flex align-items-center gap-2">
              <HardDrive size={16} className="text-primary" />
              <span className="h5 m-0 font-weight-700 text-white text-mono">{stats?.total}</span>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card-base card-accent-secondary p-3">
            <span className="small text-muted d-block mb-1">Consumed storage</span>
            <div className="d-flex align-items-center gap-2">
              <Layers size={16} className="text-secondary" />
              <span className="h5 m-0 font-weight-700 text-white text-mono">{stats?.used}</span>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card-base card-accent-tertiary p-3">
            <span className="small text-muted d-block mb-1">Available free space</span>
            <div className="d-flex align-items-center gap-2">
              <TrendingUp size={16} className="text-secondary" />
              <span className="h5 m-0 font-weight-700 text-white text-mono">{stats?.free}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Disks List Table */}
        <div className="col-lg-8">
          <div className="card-base-static p-4 h-100">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4 className="m-0 text-white font-weight-600">Storage Partition Mounts</h4>
              <button 
                className="btn btn-outline-secondary btn-sm text-white border-color" 
                onClick={fetchStorage}
              >
                <RefreshCw size={12} className="me-1" /> Reload
              </button>
            </div>

            <DataTable 
              columns={columns} 
              data={disks}
              pageSize={5}
              emptyVariant="no-data"
              emptyMessage="No local storage drives detected from server system tables."
            />
          </div>
        </div>

        {/* Gauge card */}
        <div className="col-lg-4">
          <div className="card-base storage-gauge-card">
            <h4 className="text-white font-weight-600 mb-4 d-flex align-items-center gap-2">
              <Activity size={16} className="text-primary" /> Active Mount Utilisation
            </h4>
            <div className="storage-gauge-wrapper">
              <div className="storage-gauge-val-large">
                {stats?.percent}
                <span className="small text-secondary" style={{ fontSize: '1.25rem', fontWeight: 600 }}>%</span>
              </div>
              <div className="storage-gauge-label">Root Host Disk ({stats?.mount})</div>

              <div className="progress-custom mt-4" style={{ height: '8px', maxWidth: '240px' }}>
                <div 
                  className={`progress-bar-fill ${stats?.percent > 85 ? 'bg-danger' : stats?.percent > 65 ? 'bg-amber-gradient' : 'bg-cyan-gradient'}`}
                  style={{ width: `${stats?.percent}%` }}
                />
              </div>
            </div>
            <div className="section-divider" />
            <div className="d-flex align-items-center gap-2 small text-secondary">
              <Database size={14} />
              <span>Block device maps: ext4 filesystem format.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Storage;
