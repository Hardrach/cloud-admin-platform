import React, { useState } from 'react';
import { FiGithub } from 'react-icons/fi';
import { 
  LayoutDashboard, 
  Server, 
  Activity, 
  Shield, 
  Cpu, 
  Settings, 
  User, 
  ChevronLeft, 
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Globe,
  Terminal,
  FileText,
  AlertCircle,
  Lock,
  Key,
  Code,
  HardDrive
} from 'lucide-react';

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
      icon: <LayoutDashboard size={18} />,
      isGroup: false,
    },
    {
      id: 'infrastructure',
      name: 'Infrastructure',
      icon: <Server size={18} />,
      isGroup: true,
      children: [
        { id: 'vm', name: 'Virtual Machines', icon: <Server size={16} /> },
        { id: 'docker', name: 'Docker', icon: <Terminal size={16} /> },
        { id: 'networks', name: 'Networks', icon: <Globe size={16} /> },
        { id: 'storage', name: 'Storage', icon: <HardDrive size={16} /> }
      ]
    },
    {
      id: 'monitoring',
      name: 'Monitoring',
      icon: <Activity size={18} />,
      isGroup: true,
      children: [
        { id: 'metrics', name: 'Metrics', icon: <Activity size={16} /> },
        { id: 'logs', name: 'Logs', icon: <FileText size={16} /> },
        { id: 'alerts', name: 'Alerts', icon: <AlertCircle size={16} /> }
      ]
    },
    {
      id: 'security',
      name: 'Security',
      icon: <Shield size={18} />,
      isGroup: true,
      children: [
        { id: 'firewall', name: 'Firewall', icon: <Shield size={16} /> },
        { id: 'ssh', name: 'SSH Keys', icon: <Key size={16} /> },
        { id: 'iam', name: 'IAM', icon: <Lock size={16} /> }
      ]
    },
    {
      id: 'devops',
      name: 'DevOps',
      icon: <Cpu size={18} />,
      isGroup: true,
      children: [
        { id: 'terraform', name: 'Terraform', icon: <Code size={16} /> },
        { id: 'compose', name: 'Docker Compose', icon: <Terminal size={16} /> },
        { id: 'github', name: 'GitHub', icon: <FiGithub size={16} /> }
      ]
    },
    {
      id: 'settings',
      name: 'Settings',
      icon: <Settings size={18} />,
      isGroup: false,
    },
    {
      id: 'profile',
      name: 'Profile',
      icon: <User size={18} />,
      isGroup: false,
    }
  ];

  return (
    <aside className={`sidebar-wrapper ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}>
      {/* Brand Header */}
      <div className="sidebar-brand">
        <div className="brand-icon">
          <Cpu size={22} style={{ strokeWidth: 2.5 }} />
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
                title={isCollapsed ? group.name : undefined}
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
                    {isGroupExpanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
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
                        title={isCollapsed ? child.name : undefined}
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
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
