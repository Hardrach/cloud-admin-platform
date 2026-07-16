import React from 'react';
import { ServerOff, Terminal, BellOff, Info, FileQuestion, HelpCircle, Activity } from 'lucide-react';
import './EmptyState.css';

const ICONS = {
  'no-containers': Terminal,
  'no-alerts': BellOff,
  'no-vms': ServerOff,
  'git-not-found': FileQuestion,
  'terraform-absent': ServerOff,
  'docker-stopped': Activity,
  'no-data': Info,
};

export const EmptyState = ({
  variant = 'no-data',
  title,
  description,
  actionText,
  onActionClick,
  className = '',
}) => {
  const Icon = ICONS[variant] || HelpCircle;

  const getDefaultTitle = () => {
    switch (variant) {
      case 'no-containers': return 'No Containers Found';
      case 'no-alerts': return 'All Clear';
      case 'no-vms': return 'No Virtual Machines';
      case 'git-not-found': return 'Git Repository Not Found';
      case 'terraform-absent': return 'Terraform CLI Not Detected';
      case 'docker-stopped': return 'Docker Daemon Inactive';
      default: return 'No Data Available';
    }
  };

  const getDefaultDesc = () => {
    switch (variant) {
      case 'no-containers': return 'There are no active or stopped Docker containers on this system host.';
      case 'no-alerts': return 'No system warnings or high-priority health alerts are currently triggered.';
      case 'no-vms': return 'No cloud virtual machine resources have been provisioned or imported.';
      case 'git-not-found': return 'Unable to retrieve version control metadata. Ensure this folder is inside a Git workspace.';
      case 'terraform-absent': return 'The Terraform CLI is missing on the VM environment. Operations are unavailable.';
      case 'docker-stopped': return 'The system Docker service is offline. Please start docker to list running services.';
      default: return 'No record information matches your active system filters.';
    }
  };

  return (
    <div className={`empty-state-card card-base ${className}`}>
      <div className="empty-state-icon-wrapper">
        <Icon size={32} />
      </div>
      <h4 className="empty-state-title">{title || getDefaultTitle()}</h4>
      <p className="empty-state-description">{description || getDefaultDesc()}</p>
      {actionText && onActionClick && (
        <button className="empty-state-btn" onClick={onActionClick}>
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
