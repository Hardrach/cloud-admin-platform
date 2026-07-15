import React, { useState, useEffect } from 'react';
import './IAM.css';
import { getIAM } from '../../services/api';
import { 
  FiUsers, 
  FiUser, 
  FiShield,
  FiRefreshCw, 
  FiAlertTriangle,
  FiSearch
} from 'react-icons/fi';

const IAM = () => {
  const [iamData, setIamData] = useState({ count: 0, users: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchIAMData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getIAM();
      setIamData(data || { count: 0, users: [] });
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load identity accounts.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchIAMData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchIAMData();
  };

  const filteredUsers = iamData.users
    ? iamData.users.filter(user => 
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.home.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.shell.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  // Compute stat metrics dynamically
  const totalUsers = iamData.users?.length || 0;
  const systemAccounts = iamData.users?.filter(u => u.uid < 1000 || u.uid === 65534).length || 0;
  const administratorsCount = iamData.users?.filter(u => u.uid === 0 || u.username.includes('admin') || u.username === 'root').length || 0;
  const guestAccounts = totalUsers - systemAccounts - administratorsCount;

  return (
    <div className={`iam-container ${isRefreshing ? 'refresh-animate' : ''}`}>
      {/* Header */}
      <div className="iam-header-toolbar mb-3">
        <div>
          <h1 className="iam-title">IAM</h1>
          <p className="iam-subtitle">Manage user accounts, system groups, and OS security credentials</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="iam-actions-row">
        <div className="iam-search position-relative">
          <FiSearch className="position-absolute start-3 top-50 translate-middle-y text-secondary" style={{ left: '0.75rem' }} />
          <input 
            type="text" 
            className="form-control ps-5 search-input" 
            placeholder="Search users..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="ms-auto d-flex gap-2">
          <button className="btn btn-outline-secondary border-color text-white d-flex align-items-center gap-2" onClick={handleRefresh} style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
            <FiRefreshCw className={loading ? 'spin-animation' : ''} /> Refresh
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert-danger border-0 mb-4 d-flex align-items-center gap-3 text-white" style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)' }} role="alert">
          <FiAlertTriangle className="text-danger flex-shrink-0" size={24} />
          <div>
            <strong className="d-block text-danger mb-1">IAM Service Error</strong>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="iam-stat-card p-3 rounded" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary small font-medium">Users</span>
              <FiUsers className="text-primary" size={20} />
            </div>
            <div className="fs-4 fw-bold text-white">{loading ? '...' : totalUsers}</div>
            <div className="small text-muted mt-1">Total configured accounts</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="iam-stat-card p-3 rounded" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary small font-medium">System Accounts</span>
              <FiUser className="text-warning" size={20} />
            </div>
            <div className="fs-4 fw-bold text-warning">{loading ? '...' : systemAccounts}</div>
            <div className="small text-muted mt-1">Daemon process shells</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="iam-stat-card p-3 rounded" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary small font-medium">Administrators</span>
              <FiShield className="text-danger" size={20} />
            </div>
            <div className="fs-4 fw-bold text-danger">{loading ? '...' : (administratorsCount || 1)}</div>
            <div className="small text-muted mt-1">Root administrative privileges</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="iam-stat-card p-3 rounded" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary small font-medium">Guests</span>
              <FiUser className="text-success" size={20} />
            </div>
            <div className="fs-4 fw-bold text-success">{loading ? '...' : (guestAccounts > 0 ? guestAccounts : 0)}</div>
            <div className="small text-muted mt-1">Unprivileged guest shells</div>
          </div>
        </div>
      </div>

      {/* Main Users Table */}
      <div className="iam-table-card">
        <div className="table-responsive">
          <table className="iam-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>UID</th>
                <th>Home Directory</th>
                <th>Shell</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1, 2].map((i) => (
                  <tr key={i} className="placeholder-loading-row">
                    <td><div className="skeleton-text short" /></td>
                    <td><div className="skeleton-text short" /></td>
                    <td><div className="skeleton-text" /></td>
                    <td><div className="skeleton-text" /></td>
                  </tr>
                ))
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((user, idx) => (
                  <tr key={idx}>
                    <td>
                      <div className="fw-semibold d-flex align-items-center gap-2">
                        <FiUser className={user.uid === 0 ? 'text-danger' : 'text-info'} />
                        <span className="text-white">{user.username}</span>
                      </div>
                    </td>
                    <td>
                      <code className="text-secondary">{user.uid}</code>
                    </td>
                    <td>
                      <code className="text-light" style={{ fontSize: '0.8rem' }}>{user.home}</code>
                    </td>
                    <td>
                      <code className="text-light" style={{ fontSize: '0.8rem' }}>{user.shell}</code>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-5 text-secondary">
                    <FiUsers size={32} className="mb-2 text-secondary opacity-50" />
                    <p className="mb-0 fw-medium">No OS Users Found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default IAM;
