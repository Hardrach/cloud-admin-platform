import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, Menu, ChevronRight, Grid, Sun, Moon, Monitor } from 'lucide-react';

const Navbar = ({ activeItem, setIsMobileOpen, isMobileOpen, isLightTheme, themePreference, setThemePreference, toggleGlobalTheme }) => {
  const [searchVal, setSearchVal] = useState('');
  const searchInputRef = useRef(null);

  // Focus search with ⌘K or Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <nav className="top-navbar">
      <div className="navbar-left">
        {/* Mobile menu trigger */}
        <button 
          className="nav-action-btn d-md-none me-2"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          aria-label="Toggle Navigation Menu"
        >
          <Menu size={20} />
        </button>

        {/* Title visible on desktop */}
        <a href="/" className="navbar-brand-mobile d-none d-sm-block text-decoration-none">
          Cloud Admin Platform
        </a>

        {/* Breadcrumb section */}
        <div className="breadcrumb-nav d-none d-md-flex ms-3">
          <div className="breadcrumb-item">
            <Grid className="me-1" size={13} />
            <span>Console</span>
          </div>
          {activeItem.group && (
            <>
              <div className="breadcrumb-separator"><ChevronRight size={12} /></div>
              <div className="breadcrumb-item">
                <span>{activeItem.group}</span>
              </div>
            </>
          )}
          <div className="breadcrumb-separator"><ChevronRight size={12} /></div>
          <div className="breadcrumb-item active">
            <span>{activeItem.name}</span>
          </div>
        </div>
      </div>

      {/* Search area */}
      <div className="navbar-center">
        <div className="search-box-wrapper">
          <Search className="search-icon" size={15} />
          <input 
            ref={searchInputRef}
            type="text" 
            placeholder="Search console (e.g. vm-prod-01)                 Ctrl+K" 
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="search-input"
            id="global-search-input"
          />
        </div>
      </div>

      {/* Actions, indicators, avatar */}
      <div className="navbar-right">
        {/* Theme toggle control */}
        <button
          className="nav-action-btn d-none d-sm-flex align-items-center gap-1 theme-toggle-btn"
          onClick={() => {
            if (themePreference === 'auto') {
              setThemePreference(isLightTheme ? 'dark' : 'light');
            } else {
              toggleGlobalTheme();
            }
          }}
          style={{ border: '1px solid var(--border-default)', padding: '4px 10px', borderRadius: 'var(--radius-full)' }}
          title={themePreference === 'auto' ? 'Auto mode active' : isLightTheme ? "Switch to Dark Mode" : "Switch to Light Mode"}
        >
          {themePreference === 'auto' ? (
            <>
              <Monitor size={14} className="text-primary" />
              <span className="small text-secondary" style={{ fontSize: '11px', fontWeight: 600 }}>AUTO</span>
            </>
          ) : isLightTheme ? (
            <>
              <Sun size={14} className="text-warning" />
              <span className="small text-secondary" style={{ fontSize: '11px', fontWeight: 600 }}>LIGHT</span>
            </>
          ) : (
            <>
              <Moon size={14} className="text-primary" />
              <span className="small text-secondary" style={{ fontSize: '11px', fontWeight: 600 }}>DARK</span>
            </>
          )}
        </button>

        {/* Notifications */}
        <button className="nav-action-btn" aria-label="Notifications" id="notifications-btn">
          <Bell size={18} />
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
