import React, { useState, useEffect } from 'react';
import './GitHub.css';
import { 
  getGitHub, 
  fetchGit, 
  pullGit, 
  pushGit
} from '../../services/api';
import { useToast } from '../../components/Toast/Toast';
import { useConfirm } from '../../components/ConfirmDialog/ConfirmDialog';
import { DataTable } from '../../components/DataTable/DataTable';
import { SkeletonCard } from '../../components/Skeleton/Skeleton';
import { EmptyState } from '../../components/EmptyState/EmptyState';
import { 
  GitBranch, 
  Download, 
  Upload, 
  RefreshCw, 
  Calendar,
  User,
  Info,
  ExternalLink
} from 'lucide-react';
import { FiGithub } from 'react-icons/fi';

const GitHub = () => {
  const [gitData, setGitData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const toast = useToast();
  const confirm = useConfirm();

  const fetchRepoData = async () => {
    try {
      setLoading(true);
      const data = await getGitHub();
      setGitData(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load GitHub repository details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRepoData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAction = async (actionFn, actionName, confirmType = 'info') => {
    const isPush = actionName === 'Push';
    const approved = await confirm({
      title: `Git ${actionName}`,
      message: isPush 
        ? `Are you sure you want to run Git Push to origin? This will publish committed revisions to the remote master branch.`
        : `Are you sure you want to run Git ${actionName}?`,
      type: confirmType,
      confirmText: `Run ${actionName}`,
      cancelText: 'Cancel'
    });

    if (!approved) return;

    try {
      setActionLoading(true);
      toast.info(`Executing Git ${actionName.toLowerCase()} stream...`);
      const data = await actionFn();
      
      if (data.status === 'success' || data.success) {
        toast.success(`Git ${actionName} operation completed successfully.`);
      } else {
        toast.warning(data.output || `Git ${actionName} finished with warning remarks.`);
      }
      
      await fetchRepoData();
    } catch (err) {
      console.error(err);
      toast.error(`Git ${actionName} failed to execute.`);
    } finally {
      setActionLoading(false);
    }
  };

  const columns = [
    {
      key: 'hash',
      label: 'Commit SHA',
      render: (val) => <code className="small text-primary text-mono">{val?.substring(0, 7) || 'N/A'}</code>
    },
    {
      key: 'message',
      label: 'Message',
      render: (val) => <span className="text-white font-weight-500">{val}</span>
    },
    {
      key: 'author',
      label: 'Author',
      render: (val) => (
        <div className="d-flex align-items-center gap-1.5 small text-secondary">
          <User size={13} />
          <span>{val || 'Unknown'}</span>
        </div>
      )
    },
    {
      key: 'date',
      label: 'Commited Date',
      render: (val) => (
        <div className="d-flex align-items-center gap-1.5 small text-muted">
          <Calendar size={13} />
          <span>{val || 'N/A'}</span>
        </div>
      )
    }
  ];

  if (loading) {
    return (
      <div className="container-fluid p-0">
        <div className="page-header">
          <h1 className="page-title">Version Control (GitHub)</h1>
          <p className="page-subtitle">Inspect repository status, commits history, and publish workspace modifications</p>
        </div>
        <SkeletonCard rows={8} />
      </div>
    );
  }

  // Fallback checks for Git installations inside container workspace
  const isGitAvailable = gitData?.git_version && gitData?.status?.toLowerCase() !== 'unknown';
  const recentCommits = gitData?.recent_commits || [];

  if (!isGitAvailable) {
    return (
      <div className="container-fluid p-0">
        <div className="page-header">
          <h1 className="page-title">Version Control (GitHub)</h1>
          <p className="page-subtitle">Inspect repository status, commits history, and publish workspace modifications</p>
        </div>
        <EmptyState 
          variant="git-not-found" 
          description="Ensure git is configured and /workspace is trusted in the container settings."
          actionText="Retry Repository Audit"
          onActionClick={fetchRepoData}
        />
      </div>
    );
  }

  return (
    <div className="github-container">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Version Control (GitHub)</h1>
        <p className="page-subtitle">Inspect repository status, commits history, and publish workspace modifications</p>
      </div>

      {/* Git CLI Actions */}
      <div className="git-actions-row">
        <button 
          className="git-btn git-btn-fetch"
          disabled={actionLoading}
          onClick={() => handleAction(fetchGit, 'Fetch', 'info')}
        >
          <RefreshCw size={14} /> Fetch Remote
        </button>
        <button 
          className="git-btn git-btn-pull"
          disabled={actionLoading}
          onClick={() => handleAction(pullGit, 'Pull', 'warning')}
        >
          <Download size={14} /> Pull Origin
        </button>
        <button 
          className="git-btn git-btn-push"
          disabled={actionLoading}
          onClick={() => handleAction(pushGit, 'Push', 'danger')}
        >
          <Upload size={14} /> Push Changes
        </button>
      </div>

      <div className="row g-4 mb-4">
        {/* Info panel */}
        <div className="col-12">
          <div className="card-base-static p-4 h-100">
            <h5 className="text-white mb-4 d-flex align-items-center gap-2">
              <FiGithub className="text-primary" /> Repository details
            </h5>
            <div className="d-flex flex-column gap-3">
              <div className="d-flex justify-content-between pb-1 border-bottom border-secondary border-opacity-10">
                <span className="text-secondary">Repository URL:</span>
                <a
                  className="text-primary text-mono small d-inline-flex align-items-center gap-1"
                  href={gitData.remote}
                  target="_blank"
                  rel="noreferrer"
                >
                  {gitData.remote}
                  <ExternalLink size={13} />
                </a>
              </div>
              <div className="d-flex justify-content-between pb-1 border-bottom border-secondary border-opacity-10">
                <span className="text-secondary">Current Branch:</span>
                <span className="text-white font-weight-600 d-flex align-items-center gap-1">
                  <GitBranch size={13} className="text-success" /> {gitData.branch}
                </span>
              </div>
              <div className="d-flex justify-content-between pb-1 border-bottom border-secondary border-opacity-10">
                <span className="text-secondary">Working status:</span>
                <span className={`status-badge ${gitData.status?.toLowerCase() === 'clean' ? 'status-badge-success' : 'status-badge-warning'}`}>
                  {gitData.status}
                </span>
              </div>
              <div className="d-flex justify-content-between pb-1 border-bottom border-secondary border-opacity-10">
                <span className="text-secondary">Ahead / Behind:</span>
                <span className="text-light small">
                  {gitData.ahead} ahead, {gitData.behind} behind
                </span>
              </div>
              <div className="d-flex justify-content-between pb-1 border-bottom border-secondary border-opacity-10">
                <span className="text-secondary">Total commit count:</span>
                <span className="text-white text-mono">{gitData.commit_count ?? gitData.commits ?? 0}</span>
              </div>
              <div className="d-flex justify-content-between pb-1 border-bottom border-secondary border-opacity-10">
                <span className="text-secondary">Pack file size:</span>
                <span className="text-white text-mono">{gitData.pack_size || gitData.size || 'Unavailable'}</span>
              </div>
              <div className="d-flex justify-content-between pb-1 border-bottom border-secondary border-opacity-10">
                <span className="text-secondary">Git version:</span>
                <span className="text-white text-mono small">{gitData.git_version}</span>
              </div>
              <div className="d-flex justify-content-between pb-1">
                <span className="text-secondary">Last Sync Check:</span>
                <span className="text-muted small">{gitData.last_fetch || 'Just now'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Commits table */}
      <div className="card-base-static p-4">
        <h4 className="text-white font-weight-600 mb-4 d-flex align-items-center gap-2">
          <Info size={16} className="text-primary" /> Recent Revisions History
        </h4>
        <DataTable 
          columns={columns} 
          data={recentCommits}
          pageSize={5}
          emptyVariant="no-data"
          emptyMessage="No commit records available in local git history logs."
        />
      </div>
    </div>
  );
};

export default GitHub;
