import React from 'react';
import { FiSearch, FiBell, FiMenu, FiChevronRight, FiGrid } from 'react-icons/fi';

const Navbar = ({ activeItem, setIsMobileOpen, isMobileOpen }) => {
  return (
    <nav className="top-navbar">
      <div className="navbar-left">
        {/* Mobile menu trigger */}
        <button 
          className="nav-action-btn d-md-none me-2"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          aria-label="Toggle Navigation Menu"
        >
          <FiMenu />
        </button>

        {/* Title visible on desktop */}
        <a href="/" className="navbar-brand-mobile d-none d-sm-block text-decoration-none">
          Cloud Admin Platform
        </a>

        {/* Breadcrumb section */}
        <div className="breadcrumb-nav d-none d-md-flex ms-3">
          <div className="breadcrumb-item">
            <FiGrid className="me-1" size={13} />
            <span>Console</span>
          </div>
          {activeItem.group && (
            <>
              <div className="breadcrumb-separator"><FiChevronRight size={12} /></div>
              <div className="breadcrumb-item">
                <span>{activeItem.group}</span>
              </div>
            </>
          )}
          <div className="breadcrumb-separator"><FiChevronRight size={12} /></div>
          <div className="breadcrumb-item active">
            <span>{activeItem.name}</span>
          </div>
        </div>
      </div>

      {/* Search area */}
      <div className="navbar-center">
        <div className="search-box-wrapper">
          <FiSearch className="search-icon" size={15} />
          <input 
            type="text" 
            placeholder="Search resources, services, and docs (e.g. vm-prod-01)..." 
            className="search-input"
            id="global-search-input"
          />
        </div>
      </div>

      {/* Actions, indicators, avatar */}
      <div className="navbar-right">
        {/* Theme badge placeholder */}
        <span className="theme-badge d-none d-sm-inline-block">
          DARK MODE
        </span>

        {/* Notifications */}
        <button className="nav-action-btn" aria-label="Notifications" id="notifications-btn">
          <FiBell size={18} />
          <span className="badge-dot"></span>
        </button>

        {/* User avatar */}
        <div className="avatar-wrapper ms-2" id="user-profile-menu">
          <div className="user-avatar">
            AD
          </div>
          <span className="text-white d-none d-lg-inline-block font-size-sm font-weight-500">
            admin@cloud.local
          </span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
