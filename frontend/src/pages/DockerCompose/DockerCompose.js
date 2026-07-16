import React, { useState, useEffect } from 'react';
import './DockerCompose.css';
import { getDockerCompose } from '../../services/api';
import { useToast } from '../../components/Toast/Toast';
import { SkeletonCard } from '../../components/Skeleton/Skeleton';
import { EmptyState } from '../../components/EmptyState/EmptyState';
import { 
  Layers, 
  FileCode,
  RefreshCw
} from 'lucide-react';

const DockerCompose = () => {
  const [composeData, setComposeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const fetchCompose = async () => {
    try {
      setLoading(true);
      const data = await getDockerCompose();
      const containers = data?.containers || [];
      const generatedYaml = containers.length ? [
        'services:',
        ...containers.map((container) => [
          `  ${container.name || container.container}:`,
          `    image: ${container.image || 'unknown'}`,
          `    container_name: ${container.container || container.name}`,
          `    status: ${container.status || 'unknown'}`
        ].join('\n'))
      ].join('\n') : '';
      setComposeData({
        ...data,
        raw_yaml: data?.raw_yaml || generatedYaml,
        services_count: data?.services_count || containers.length,
        project_path: data?.project_path || 'cloud-admin-platform'
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to load Docker Compose configuration telemetry.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="container-fluid p-0">
        <div className="page-header">
          <h1 className="page-title">Docker Compose</h1>
          <p className="page-subtitle">Inspect stack configurations and deployment definitions</p>
        </div>
        <SkeletonCard rows={10} />
      </div>
    );
  }

  // Ensure content is parsed safely
  const rawYaml = composeData?.raw_yaml || '';
  const servicesCount = composeData?.services_count || 0;
  const projectPath = composeData?.project_path || '/workspace';

  if (!rawYaml) {
    return (
      <div className="container-fluid p-0">
        <div className="page-header">
          <h1 className="page-title">Docker Compose</h1>
          <p className="page-subtitle">Inspect stack configurations and deployment definitions</p>
        </div>
        <EmptyState 
          variant="no-data" 
          title="Compose Stack Offline"
          description="No active docker-compose config files were detected in the deployment folder."
          actionText="Refresh stack configuration"
          onActionClick={fetchCompose}
        />
      </div>
    );
  }

  return (
    <div className="compose-container">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Docker Compose</h1>
        <p className="page-subtitle">Inspect stack configurations and deployment definitions</p>
      </div>

      {/* Meta details */}
      <div className="row g-4 mb-4">
        <div className="col-md-6">
          <div className="card-base card-accent-primary p-3">
            <span className="small text-muted d-block mb-1">Stack project path</span>
            <span className="h6 m-0 font-weight-700 text-white text-mono">{projectPath}</span>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card-base card-accent-secondary p-3">
            <span className="small text-muted d-block mb-1">Defined Services Stack</span>
            <div className="d-flex align-items-center gap-2">
              <Layers size={16} className="text-secondary" />
              <span className="h5 m-0 font-weight-700 text-white">{servicesCount} microservices configured</span>
            </div>
          </div>
        </div>
      </div>

      {/* Yaml Editor wrapper */}
      <div className="compose-yaml-panel">
        <div className="compose-yaml-header">
          <div className="d-flex align-items-center gap-2">
            <FileCode size={16} className="text-primary" />
            <span className="small text-secondary fw-semibold">docker-compose.yml</span>
          </div>
          <button 
            className="btn btn-outline-secondary btn-sm text-white border-color" 
            onClick={fetchCompose}
          >
            <RefreshCw size={12} className="me-1" /> Reload Project
          </button>
        </div>

        <pre className="compose-terminal">
          {rawYaml}
        </pre>
      </div>
    </div>
  );
};

export default DockerCompose;
