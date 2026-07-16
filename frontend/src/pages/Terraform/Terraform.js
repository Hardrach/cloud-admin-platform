import React, { useState, useEffect } from 'react';
import './Terraform.css';
import { 
  getTerraform, 
  runTerraformPlan, 
  runTerraformApply, 
  runTerraformDestroy 
} from '../../services/api';
import { useToast } from '../../components/Toast/Toast';
import { useConfirm } from '../../components/ConfirmDialog/ConfirmDialog';
import { DataTable } from '../../components/DataTable/DataTable';
import { SkeletonCard } from '../../components/Skeleton/Skeleton';
import { EmptyState } from '../../components/EmptyState/EmptyState';
import { 
  Play, 
  CheckSquare, 
  Trash2, 
  Terminal, 
  Layers, 
  RefreshCw
} from 'lucide-react';

const Terraform = () => {
  const [stateData, setStateData] = useState(null);
  const [consoleOutput, setConsoleOutput] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const toast = useToast();
  const confirm = useConfirm();

  const fetchTerraformState = async () => {
    try {
      setLoading(true);
      const data = await getTerraform();
      const resources = data?.resources || data?.resources_list || [];
      setStateData({
        ...data,
        terraform_version: data?.terraform_version || data?.version || (data?.installed ? 'Terraform CLI detected' : 'Project configuration mode'),
        resources_list: resources.length ? resources : (data?.files || []).map((file) => ({
          name: file,
          type: 'terraform.config',
          provider: 'local workspace'
        }))
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to load Terraform state telemetry.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTerraformState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAction = async (actionFn, actionName, confirmType = 'warning') => {
    const isDestroy = actionName === 'Destroy';
    const approved = await confirm({
      title: `Terraform ${actionName}`,
      message: isDestroy 
        ? `CAUTION: Are you sure you want to run Terraform Destroy? This will tear down all managed infrastructure resources!`
        : `Are you sure you want to run Terraform ${actionName}?`,
      type: confirmType,
      confirmText: `Run ${actionName}`,
      cancelText: 'Cancel'
    });

    if (!approved) return;

    try {
      setActionLoading(true);
      setConsoleOutput(`[CloudAdmin-Shell] Running terraform ${actionName.toLowerCase()}... \n`);
      toast.info(`Executing terraform ${actionName.toLowerCase()} stream...`);
      
      const data = await actionFn();
      setConsoleOutput(prev => prev + (data.output || 'Success. Zero output returned.'));
      
      if (data.status === 'success' || data.success) {
        toast.success(`Terraform ${actionName} finished successfully.`);
      } else {
        toast.warning(`Terraform ${actionName} completed with warnings or errors.`);
      }
      
      await fetchTerraformState();
    } catch (err) {
      console.error(err);
      setConsoleOutput(prev => prev + `\nError: Command failed to execute correctly.\n${err.message || ''}`);
      toast.error(`Terraform ${actionName} failed.`);
    } finally {
      setActionLoading(false);
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Resource Identifier Name',
      sortable: true,
      render: (val) => <span className="text-white font-weight-600">{val}</span>
    },
    {
      key: 'type',
      label: 'Provider Resource Type',
      sortable: true,
      render: (val) => <code className="small text-secondary">{val}</code>
    },
    {
      key: 'provider',
      label: 'Provider Namespace',
      render: (val) => <span className="small text-muted">{val || 'registry.terraform.io'}</span>
    }
  ];

  if (loading) {
    return (
      <div className="container-fluid p-0">
        <div className="page-header">
          <h1 className="page-title">Terraform Deployments</h1>
          <p className="page-subtitle">Inspect local state allocations and execute IaC orchestration pipelines</p>
        </div>
        <SkeletonCard rows={8} />
      </div>
    );
  }

  // Parse resources list mapped from api. If terraform is absent, stateData might represent mock structure
  const isTerraformAvailable = Boolean(stateData?.terraform_version || stateData?.files?.length || stateData?.resources_list?.length);
  const resourcesList = stateData?.resources_list || [];

  if (!isTerraformAvailable) {
    return (
      <div className="container-fluid p-0">
        <div className="page-header">
          <h1 className="page-title">Terraform Deployments</h1>
          <p className="page-subtitle">Inspect local state allocations and execute IaC orchestration pipelines</p>
        </div>
        <EmptyState variant="terraform-absent" onActionClick={fetchTerraformState} actionText="Retry CLI check" />
      </div>
    );
  }

  return (
    <div className="terraform-container">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Terraform Deployments</h1>
        <p className="page-subtitle">Inspect local state allocations and execute IaC orchestration pipelines</p>
      </div>

      {/* Action Pipeline Control Group */}
      <div className="tf-action-btn-group">
        <button 
          className="tf-btn tf-btn-plan"
          disabled={actionLoading}
          onClick={() => handleAction(runTerraformPlan, 'Plan', 'info')}
        >
          <Play size={14} /> Plan Changes
        </button>
        <button 
          className="tf-btn tf-btn-apply"
          disabled={actionLoading}
          onClick={() => handleAction(runTerraformApply, 'Apply', 'warning')}
        >
          <CheckSquare size={14} /> Apply Infrastructure
        </button>
        <button 
          className="tf-btn tf-btn-destroy"
          disabled={actionLoading}
          onClick={() => handleAction(runTerraformDestroy, 'Destroy', 'danger')}
        >
          <Trash2 size={14} /> Destroy All
        </button>
      </div>

      <div className="row g-4 mb-4">
        {/* Resource inventory */}
        <div className="col-lg-8">
          <div className="card-base-static p-4 h-100">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div className="d-flex align-items-center gap-2">
                <Layers size={16} className="text-primary" />
                <h4 className="m-0 text-white font-weight-600">Active State Resources ({resourcesList.length})</h4>
              </div>
              <button 
                className="btn btn-outline-secondary btn-sm text-white border-color" 
                onClick={fetchTerraformState}
              >
                <RefreshCw size={12} className="me-1" /> Reload State
              </button>
            </div>

            <DataTable 
              columns={columns} 
              data={resourcesList}
              pageSize={5}
              emptyVariant="no-data"
              emptyMessage="No resources are mapped inside the local state backend file."
            />
          </div>
        </div>

        {/* Console outputs */}
        <div className="col-lg-4">
          <div className="terraform-console-panel h-100">
            <div className="terraform-console-header">
              <div className="d-flex align-items-center gap-2">
                <Terminal size={14} className="text-primary" />
                <span className="small text-secondary fw-semibold">terraform_stdout.log</span>
              </div>
            </div>
            <pre className="terraform-terminal">
              {consoleOutput || 'Standard input shell ready. Execute an orchestration action above to display log outputs...'}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terraform;
