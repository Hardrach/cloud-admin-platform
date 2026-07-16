import React from 'react';
import './Profile.css';
import { 
  User, 
  Mail, 
  Shield, 
  Clock, 
  Server, 
  Lock
} from 'lucide-react';

const Profile = () => {
  const user = {
    username: 'admin',
    email: 'admin@cloud.local',
    role: 'Administrator',
    status: 'Active',
    created: '2026-07-15 10:00:00',
    lastLogin: 'Just now',
    mfa: 'Enabled'
  };

  return (
    <div className="profile-container">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">User Profile</h1>
        <p className="page-subtitle">Personal information, login logs, and access security settings</p>
      </div>

      <div className="row g-4">
        {/* Avatar Profile details */}
        <div className="col-lg-5">
          <div className="card-base profile-card d-flex flex-column align-items-center text-center p-5">
            <div className="profile-avatar-large mb-4">
              AD
            </div>
            <h3 className="text-white font-weight-700 m-0">{user.username}</h3>
            <span className="small text-primary font-weight-600 mt-1 uppercase text-mono">{user.role}</span>
            <span className="status-badge status-badge-success mt-3">
              <span className="status-dot success pulse" />
              {user.status}
            </span>

            <div className="section-divider w-100" />

            <div className="d-flex align-items-center gap-2 small text-secondary">
              <Server size={14} />
              <span>Identity Provider: CloudAdmin-Internal</span>
            </div>
          </div>
        </div>

        {/* Detailed accounts info */}
        <div className="col-lg-7">
          <div className="card-base-static p-4 h-100">
            <h4 className="text-white font-weight-600 mb-4 d-flex align-items-center gap-2">
              <User size={16} className="text-primary" /> Profile Properties
            </h4>

            <div className="profile-details-group">
              <div className="profile-row">
                <span className="profile-label d-flex align-items-center gap-2">
                  <User size={14} /> Account Username
                </span>
                <span className="profile-value">{user.username}</span>
              </div>
              <div className="profile-row">
                <span className="profile-label d-flex align-items-center gap-2">
                  <Mail size={14} /> Email Address
                </span>
                <span className="profile-value text-mono">{user.email}</span>
              </div>
              <div className="profile-row">
                <span className="profile-label d-flex align-items-center gap-2">
                  <Shield size={14} /> Account Role / Group
                </span>
                <span className="profile-value">{user.role}</span>
              </div>
              <div className="profile-row">
                <span className="profile-label d-flex align-items-center gap-2">
                  <Lock size={14} /> Multi-Factor Auth (MFA)
                </span>
                <span className="profile-value text-success font-weight-600">{user.mfa}</span>
              </div>
              <div className="profile-row">
                <span className="profile-label d-flex align-items-center gap-2">
                  <Calendar size={14} /> Created At
                </span>
                <span className="profile-value text-mono small">{user.created}</span>
              </div>
              <div className="profile-row">
                <span className="profile-label d-flex align-items-center gap-2">
                  <Clock size={14} /> Last Session Active
                </span>
                <span className="profile-value text-mono small">{user.lastLogin}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Simple stub for calendar icon since Calendar wasn't destructured
const Calendar = ({ size }) => <span style={{ width: size, height: size, border: '1.5px solid currentColor', borderRadius: 2, display: 'inline-block', opacity: 0.7 }} />;

export default Profile;
