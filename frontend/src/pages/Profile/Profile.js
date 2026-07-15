import React from 'react';
import './Profile.css';
import {
  FiUser,
  FiMail,
  FiEdit,
  FiLock,
  FiLogOut,
  FiKey,
  FiTerminal,
  FiClock,
  FiCalendar,
  FiBriefcase,
  FiShield,
  FiFileText
} from 'react-icons/fi';

const Profile = () => {
  // Simulated user data
  const user = {
    name: 'Yassine Rachid',
    email: 'yassine.rachid@enterprise.local',
    initials: 'YR',
    role: 'Administrator',
    department: 'Cloud Engineering',
    createdDate: 'July 6, 2026',
    lastLogin: 'July 15, 2026 — 15:48 UTC+1',
    status: 'Active'
  };

  return (
    <div className="profile-container">
      {/* Header */}
      <div className="profile-header">
        <h1 className="profile-title">Profile</h1>
        <p className="profile-subtitle">Manage your identity, credentials, and account preferences</p>
      </div>

      <div className="row g-4">
        {/* Left Column — User Card */}
        <div className="col-lg-5">

          {/* User Identity Card */}
          <div className="profile-user-card mb-4">
            <div className="profile-banner">
              <div className="profile-avatar-wrapper">
                <div className="profile-avatar">{user.initials}</div>
              </div>
            </div>
            <div className="profile-user-info">
              <div className="profile-user-name">{user.name}</div>
              <div className="profile-user-email">{user.email}</div>
              <span className="profile-role-badge">
                <FiShield size={12} /> {user.role}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="d-flex flex-column gap-2 mb-4">
            <button className="profile-action-btn primary">
              <FiEdit size={16} /> Edit Profile
            </button>
            <button className="profile-action-btn">
              <FiLock size={16} /> Change Password
            </button>
            <button className="profile-action-btn danger">
              <FiLogOut size={16} /> Sign Out
            </button>
          </div>

          {/* Future Sections */}
          <div className="profile-detail-section">
            <div className="profile-detail-header">
              <div className="profile-detail-icon" style={{ backgroundColor: 'rgba(144, 167, 191, 0.1)', color: 'var(--text-secondary)' }}>
                <FiClock />
              </div>
              <div>
                <h3 className="profile-detail-title">Coming Soon</h3>
              </div>
            </div>
            <div className="profile-detail-body">
              <div className="profile-detail-row">
                <span className="profile-detail-label d-flex align-items-center gap-2">
                  <FiKey size={14} /> SSH Keys
                </span>
                <span className="profile-future-label">Planned</span>
              </div>
              <div className="profile-detail-row">
                <span className="profile-detail-label d-flex align-items-center gap-2">
                  <FiTerminal size={14} /> API Tokens
                </span>
                <span className="profile-future-label">Planned</span>
              </div>
              <div className="profile-detail-row">
                <span className="profile-detail-label d-flex align-items-center gap-2">
                  <FiFileText size={14} /> Access Logs
                </span>
                <span className="profile-future-label">Planned</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column — Account Details */}
        <div className="col-lg-7">

          {/* Account Information */}
          <div className="profile-detail-section mb-4">
            <div className="profile-detail-header">
              <div className="profile-detail-icon" style={{ backgroundColor: 'rgba(0, 200, 255, 0.1)', color: 'var(--primary-color)' }}>
                <FiUser />
              </div>
              <div>
                <h3 className="profile-detail-title">Account Information</h3>
              </div>
            </div>
            <div className="profile-detail-body">
              <div className="profile-detail-row">
                <span className="profile-detail-label">Full Name</span>
                <span className="profile-detail-value">{user.name}</span>
              </div>
              <div className="profile-detail-row">
                <span className="profile-detail-label d-flex align-items-center gap-2"><FiMail size={14} /> Email</span>
                <span className="profile-detail-value">{user.email}</span>
              </div>
              <div className="profile-detail-row">
                <span className="profile-detail-label d-flex align-items-center gap-2"><FiShield size={14} /> Role</span>
                <span className="profile-detail-value">{user.role}</span>
              </div>
              <div className="profile-detail-row">
                <span className="profile-detail-label d-flex align-items-center gap-2"><FiBriefcase size={14} /> Department</span>
                <span className="profile-detail-value">{user.department}</span>
              </div>
              <div className="profile-detail-row">
                <span className="profile-detail-label">Account Status</span>
                <span className="profile-detail-value d-flex align-items-center gap-1" style={{ color: 'var(--success-color)' }}>
                  <span className="status-dot online" style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: 'var(--success-color)',
                    display: 'inline-block'
                  }}></span>
                  {user.status}
                </span>
              </div>
            </div>
          </div>

          {/* Session Activity */}
          <div className="profile-detail-section">
            <div className="profile-detail-header">
              <div className="profile-detail-icon" style={{ backgroundColor: 'rgba(255, 176, 32, 0.1)', color: 'var(--warning-color)' }}>
                <FiClock />
              </div>
              <div>
                <h3 className="profile-detail-title">Session & Activity</h3>
              </div>
            </div>
            <div className="profile-detail-body">
              <div className="profile-detail-row">
                <span className="profile-detail-label d-flex align-items-center gap-2"><FiCalendar size={14} /> Account Created</span>
                <span className="profile-detail-value">{user.createdDate}</span>
              </div>
              <div className="profile-detail-row">
                <span className="profile-detail-label d-flex align-items-center gap-2"><FiClock size={14} /> Last Login</span>
                <span className="profile-detail-value">{user.lastLogin}</span>
              </div>
              <div className="profile-detail-row">
                <span className="profile-detail-label">Session Duration</span>
                <span className="profile-detail-value">Active</span>
              </div>
              <div className="profile-detail-row">
                <span className="profile-detail-label">Authentication Method</span>
                <span className="profile-detail-value">Local Credentials</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;
