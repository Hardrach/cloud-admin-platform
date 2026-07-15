import React, { useState } from 'react';
import { 
  FiGrid, 
  FiServer, 
  FiActivity, 
  FiShield, 
  FiCpu, 
  FiSettings, 
  FiUser, 
  FiChevronLeft, 
  FiChevronRight,
  FiChevronDown,
  FiChevronUp,
  FiGlobe,
  FiTerminal,
  FiFileText,
  FiAlertCircle,
  FiLock,
  FiKey,
  FiCode,
  FiGithub
} from 'react-icons/fi';
import { RiHardDrive3Line } from 'react-icons/ri';

const Sidebar = ({ isCollapsed, setIsCollapsed, activeItem, setActiveItem, isMobileOpen, setIsMobileOpen }) => {
  // Keep track of which groups are expanded
  const [expandedGroups, setExpandedGroups] = useState({
    infrastructure: true,
    monitoring: true,
    security: true,
    devops: true,
  });

  const toggleGroup = (group) => {
    setExpandedGroups(prev => ({
      ...prev,
      [group]: !prev[group]
    }));
  };

  const handleItemClick = (itemId, groupName, itemName) => {
    setActiveItem({ id: itemId, group: groupName, name: itemName });
    if (isMobileOpen) {
      setIsMobileOpen(false);
    }
  };

  const menuConfig = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: <FiGrid />,
      isGroup: false,
    },
    {
      id: 'infrastructure',
      name: 'Infrastructure',
      icon: <FiServer />,
      isGroup: true,
      children: [
        { id: 'vm', name: 'Virtual Machines', icon: <FiServer /> },
        { id: 'docker', name: 'Docker', icon: <FiTerminal /> },
        { id: 'networks', name: 'Networks', icon: <FiGlobe /> },
        { id: 'storage', name: 'Storage', icon: <RiHardDrive3Line /> }
      ]
    },
    {
      id: 'monitoring',
      name: 'Monitoring',
      icon: <FiActivity />,
      isGroup: true,
      children: [
        { id: 'metrics', name: 'Metrics', icon: <FiActivity /> },
        { id: 'logs', name: 'Logs', icon: <FiFileText /> },
        { id: 'alerts', name: 'Alerts', icon: <FiAlertCircle /> }
      ]
    },
    {
      id: 'security',
      name: 'Security',
      icon: <FiShield />,
      isGroup: true,
      children: [
        { id: 'firewall', name: 'Firewall', icon: <FiShield /> },
        { id: 'ssh', name: 'SSH Keys', icon: <FiKey /> },
        { id: 'iam', name: 'IAM', icon: <FiLock /> }
      ]
    },
    {
      id: 'devops',
      name: 'DevOps',
      icon: <FiCpu />,
      isGroup: true,
      children: [
        { id: 'terraform', name: 'Terraform', icon: <FiCode /> },
        { id: 'compose', name: 'Docker Compose', icon: <FiTerminal /> },
        { id: 'github', name: 'GitHub', icon: <FiGithub /> }
      ]
    },
    {
      id: 'settings',
      name: 'Settings',
      icon: <FiSettings />,
      isGroup: false,
    },
    {
      id: 'profile',
      name: 'Profile',
      icon: <FiUser />,
      isGroup: false,
    }
  ];

  return (
    <aside className={`sidebar-wrapper ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}>
      {/* Brand Header */}
      <div className="sidebar-brand">
        <div className="brand-icon">
          <FiCpu style={{ strokeWidth: 2.5 }} />
        </div>
        <span className="brand-text">CloudAdmin</span>
      </div>

      {/* Navigation Menu */}
      <div className="sidebar-menu">
        {menuConfig.map((group) => {
          if (!group.isGroup) {
            const isActive = activeItem.id === group.id;
            return (
              <a
                key={group.id}
                href={`#${group.id}`}
                className={`menu-item-link ${isActive ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  handleItemClick(group.id, null, group.name);
                }}
                title={group.name}
              >
                <span className="menu-item-icon">{group.icon}</span>
                <span className="menu-item-text">{group.name}</span>
              </a>
            );
          }

          const isGroupExpanded = expandedGroups[group.id];

          return (
            <div key={group.id} className="menu-group">
              <div 
                className="menu-header d-flex justify-content-between align-items-center"
                style={{ cursor: isCollapsed ? 'default' : 'pointer' }}
                onClick={() => !isCollapsed && toggleGroup(group.id)}
              >
                <span>{group.name}</span>
                {!isCollapsed && (
                  <span>
                    {isGroupExpanded ? <FiChevronUp size={10} /> : <FiChevronDown size={10} />}
                  </span>
                )}
              </div>

              {/* Group items */}
              {(!isCollapsed && isGroupExpanded) || isCollapsed ? (
                <div>
                  {group.children.map((child) => {
                    const isActive = activeItem.id === child.id;
                    return (
                      <a
                        key={child.id}
                        href={`#${child.id}`}
                        className={`menu-item-link ${isActive ? 'active' : ''}`}
                        style={{ paddingLeft: isCollapsed ? '0.75rem' : '1.5rem' }}
                        onClick={(e) => {
                          e.preventDefault();
                          handleItemClick(child.id, group.name, child.name);
                        }}
                        title={child.name}
                      >
                        <span className="menu-item-icon">{child.icon}</span>
                        <span className="menu-item-text">{child.name}</span>
                      </a>
                    );
                  })}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      {/* Sidebar Footer collapse control */}
      <div className="sidebar-footer">
        <button 
          className="collapse-btn" 
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <FiChevronRight size={16} /> : <FiChevronLeft size={16} />}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
