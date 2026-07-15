import React, { useState } from 'react';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard/Dashboard';
import VirtualMachines from './pages/VirtualMachines/VirtualMachines';
import DockerContainers from './pages/DockerContainers/DockerContainers';
import Networks from './pages/Networks/Networks';
import Storage from './pages/Storage/Storage';
import Metrics from './pages/Metrics/Metrics';
import Logs from './pages/Logs/Logs';
import Alerts from './pages/Alerts/Alerts';
import Firewall from './pages/Firewall/Firewall';
import SSH from './pages/SSH/SSH';
import IAM from './pages/IAM/IAM';
import Terraform from './pages/Terraform/Terraform';
import DockerCompose from './pages/DockerCompose/DockerCompose';
import GitHub from './pages/GitHub/GitHub';
import Settings from './pages/Settings/Settings';
import Profile from './pages/Profile/Profile';
import { FiCpu, FiPlayCircle, FiTerminal, FiGlobe, FiDatabase, FiActivity, FiLock, FiCode } from 'react-icons/fi';

function App() {
  const [activeItem, setActiveItem] = useState({
    id: 'dashboard',
    group: null,
    name: 'Dashboard'
  });

  // Simple icon selector based on active item to make the placeholder look neat
  const getActiveIcon = () => {
    switch (activeItem.id) {
      case 'dashboard': return <FiCpu className="welcome-logo" />;
      case 'vm': return <FiPlayCircle className="welcome-logo" style={{ color: 'var(--primary-color)' }} />;
      case 'docker':
      case 'compose': return <FiTerminal className="welcome-logo" style={{ color: 'var(--secondary-color)' }} />;
      case 'networks': return <FiGlobe className="welcome-logo" style={{ color: 'var(--success-color)' }} />;
      case 'storage': return <FiDatabase className="welcome-logo" style={{ color: 'var(--warning-color)' }} />;
      case 'metrics':
      case 'logs':
      case 'alerts': return <FiActivity className="welcome-logo" style={{ color: 'var(--warning-color)' }} />;
      case 'firewall':
      case 'ssh':
      case 'iam': return <FiLock className="welcome-logo" style={{ color: 'var(--danger-color)' }} />;
      case 'terraform':
      case 'github': return <FiCode className="welcome-logo" style={{ color: 'var(--primary-color)' }} />;
      default: return <FiCpu className="welcome-logo" />;
    }
  };

  return (
    <Layout activeItem={activeItem} setActiveItem={setActiveItem}>
      {activeItem.id === 'dashboard' ? (
        <Dashboard />
      ) : activeItem.id === 'vm' ? (
        <VirtualMachines />
      ) : activeItem.id === 'docker' ? (
        <DockerContainers />
      ) : activeItem.id === 'networks' ? (
        <Networks />
      ) : activeItem.id === 'storage' ? (
        <Storage />
      ) : activeItem.id === 'metrics' ? (
        <Metrics />
      ) : activeItem.id === 'logs' ? (
        <Logs />
      ) : activeItem.id === 'alerts' ? (
        <Alerts />
      ) : activeItem.id === 'firewall' ? (
        <Firewall />
      ) : activeItem.id === 'ssh' ? (
        <SSH />
      ) : activeItem.id === 'iam' ? (
        <IAM />
      ) : activeItem.id === 'terraform' ? (
        <Terraform />
      ) : activeItem.id === 'compose' ? (
        <DockerCompose />
      ) : activeItem.id === 'github' ? (
        <GitHub />
      ) : activeItem.id === 'settings' ? (
        <Settings />
      ) : activeItem.id === 'profile' ? (
        <Profile />
      ) : (
        /* Welcome Placeholder for other pages */
        <div className="welcome-card">
          <div className="d-flex justify-content-center">
            {getActiveIcon()}
          </div>
          <h1 className="welcome-title">Welcome to Cloud Admin Platform</h1>
          <p className="welcome-subtitle">
            This content container is currently empty. The system shell will render the selected {activeItem.name} view here.
          </p>

          <div className="info-grid">
            <div className="info-item">
              <div className="info-item-title">Active Path</div>
              <div className="info-item-value fw-semibold text-white">
                {activeItem.group ? `${activeItem.group} > ${activeItem.name}` : activeItem.name}
              </div>
            </div>
            <div className="info-item">
              <div className="info-item-title">Platform Status</div>
              <div className="info-item-value text-success fw-semibold">
                ● Connected
              </div>
            </div>
            <div className="info-item">
              <div className="info-item-title">Zone</div>
              <div className="info-item-value text-info fw-semibold">
                us-east-1 (Primary)
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default App;
