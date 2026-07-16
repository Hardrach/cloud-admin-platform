import React, { useState, useEffect } from 'react';
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
import LoadingScreen from './components/LoadingScreen/LoadingScreen';
import { Cpu, Server, Terminal, Globe, Database, Activity, Lock, Code } from 'lucide-react';

function App() {
  const [activeItem, setActiveItem] = useState({
    id: 'dashboard',
    group: null,
    name: 'Dashboard'
  });

  const [isLightTheme, setIsLightTheme] = useState(document.body.classList.contains('light-theme'));
  const [appInitializing, setAppInitializing] = useState(true);

  // Initial load branded screen simulation
  useEffect(() => {
    const timer = setTimeout(() => {
      setAppInitializing(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const toggleGlobalTheme = () => {
    if (document.body.classList.contains('light-theme')) {
      document.body.classList.remove('light-theme');
      setIsLightTheme(false);
    } else {
      document.body.classList.add('light-theme');
      setIsLightTheme(true);
    }
  };

  const getActiveIcon = () => {
    switch (activeItem.id) {
      case 'dashboard': return <Cpu className="welcome-logo" size={48} />;
      case 'vm': return <Server className="welcome-logo text-primary" size={48} />;
      case 'docker':
      case 'compose': return <Terminal className="welcome-logo text-success" size={48} />;
      case 'networks': return <Globe className="welcome-logo text-primary" size={48} />;
      case 'storage': return <Database className="welcome-logo text-warning" size={48} />;
      case 'metrics':
      case 'logs':
      case 'alerts': return <Activity className="welcome-logo text-warning" size={48} />;
      case 'firewall':
      case 'ssh':
      case 'iam': return <Lock className="welcome-logo text-danger" size={48} />;
      case 'terraform':
      case 'github': return <Code className="welcome-logo text-primary" size={48} />;
      default: return <Cpu className="welcome-logo" size={48} />;
    }
  };

  if (appInitializing) {
    return <LoadingScreen message="Initializing cloud administration console..." />;
  }

  return (
    <Layout activeItem={activeItem} setActiveItem={setActiveItem} isLightTheme={isLightTheme} toggleGlobalTheme={toggleGlobalTheme}>
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
        <Settings isLightTheme={isLightTheme} toggleGlobalTheme={toggleGlobalTheme} />
      ) : activeItem.id === 'profile' ? (
        <Profile />
      ) : (
        /* Welcome Placeholder for other pages */
        <div className="welcome-card">
          <div className="d-flex justify-content-center">
            {getActiveIcon()}
          </div>
          <h1 className="welcome-title mt-4">Welcome to Cloud Admin Platform</h1>
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
