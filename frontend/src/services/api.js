import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});


export const getDashboard = async () => {
  const response = await api.get('/api/dashboard');
  return response.data;
};

export const getVMs = async () => {
  const response = await api.get("/api/vms");
  return response.data;
};

export const getVirtualMachines = async () => {
  const response = await api.get("/api/vms");
  return response.data;
};

const AZURE_TENANT_ID = process.env.REACT_APP_AZURE_TENANT_ID || "0aa23530-bf26-4354-9ec0-1c612fead745";
const AZURE_CLIENT_ID = process.env.REACT_APP_AZURE_CLIENT_ID || "0a2303db-54ae-4801-888c-473dcae9cadb";
const AZURE_CLIENT_SECRET = process.env.REACT_APP_AZURE_CLIENT_SECRET || "";
const AZURE_SUBSCRIPTION_ID = process.env.REACT_APP_AZURE_SUBSCRIPTION_ID || "d9ed69ab-886c-40cc-b8b6-0efa4e1049ba";
const AZURE_RESOURCE_GROUP = process.env.REACT_APP_AZURE_RESOURCE_GROUP || "rg-cloud-admin-platform";

export const startAzureVMDirectly = async (vmName = "vm-cloud-admin") => {
  const tokenUrl = `https://login.microsoftonline.com/${AZURE_TENANT_ID}/oauth2/v2.0/token`;
  const params = new URLSearchParams();
  params.append("grant_type", "client_credentials");
  params.append("client_id", AZURE_CLIENT_ID);
  params.append("client_secret", AZURE_CLIENT_SECRET);
  params.append("scope", "https://management.azure.com/.default");

  const tokenRes = await axios.post(tokenUrl, params, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" }
  });

  const accessToken = tokenRes.data.access_token;
  const azureApiUrl = `https://management.azure.com/subscriptions/${AZURE_SUBSCRIPTION_ID}/resourceGroups/${AZURE_RESOURCE_GROUP}/providers/Microsoft.Compute/virtualMachines/${vmName}/start?api-version=2023-09-01`;

  const azureRes = await axios.post(azureApiUrl, {}, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    }
  });

  return {
    success: true,
    via: "azure_rest_api",
    message: `Azure REST API successfully triggered Start for VM '${vmName}'.`
  };
};

export const startVirtualMachine = async (name) => {
  try {
    return await api.post(`/api/vms/${name}/start`, {}, { timeout: 8000 });
  } catch (err) {
    const isOffline = err.code === 'ERR_NETWORK' || err.message?.includes('timeout') || !err.response;
    if (isOffline) {
      console.warn("Backend API offline — triggering Azure REST API Start directly...");
      return await startAzureVMDirectly(name);
    }
    throw err;
  }
};

export const stopVirtualMachine = async (name) => {
  return api.post(`/api/vms/${name}/stop`, {}, { timeout: 30000 });
};

export const restartVirtualMachine = async (name) => {
  return api.post(`/api/vms/${name}/restart`, {}, { timeout: 30000 });
};

export const deallocateVirtualMachine = async (name) => {
  return api.post(`/api/vms/${name}/deallocate`, {}, { timeout: 30000 });
};

export const getDocker = async () => {
  const response = await api.get("/api/docker");
  return response.data;
};

export const getDockerStats = async () => {
  const response = await api.get("/api/docker/stats");
  return response.data;
};

export const startContainer = (name) =>
  api.post(`/api/docker/${name}/start`);

export const stopContainer = (name) =>
  api.post(`/api/docker/${name}/stop`);

export const restartContainer = (name) =>
  api.post(`/api/docker/${name}/restart`);

export const getContainerLogs = async (containerName) => {
  const response = await api.get(`/api/docker/${containerName}/logs`);
  return response.data;
};

export const getNetworks = async () => {
  const response = await api.get("/api/networks");
  return response.data;
};

export const getStorage = async () => {
  const response = await api.get("/api/storage");
  return response.data;
};

export const getMetrics = async () => {
  const response = await api.get("/api/metrics");
  return response.data;
};

export const getLogs = async () => {
  const response = await api.get("/api/logs");
  return response.data;
};

export const getAlerts = async () => {
  const response = await api.get("/api/alerts");
  return response.data;
};

export const getFirewall = async () => {
  const response = await api.get("/api/firewall");
  return response.data;
};

export const getSSHKeys = async () => {
  const response = await api.get("/api/ssh-keys");
  return response.data;
};

export const getIAM = async () => {
  const response = await api.get("/api/iam");
  return response.data;
};

export const getTerraform = async () => {
  const response = await api.get("/api/terraform");
  return response.data;
};

export const getDockerCompose = async () => {
  const response = await api.get("/api/docker-compose");
  return response.data;
};

export const getGitHub = async () => {
  const response = await api.get("/api/github");
  return response.data;
};

export const fetchGit = async () => {
  const response = await api.post("/api/github/fetch");
  return response.data;
};

export const pullGit = async () => {
  const response = await api.post("/api/github/pull");
  return response.data;
};

export const pushGit = async () => {
  const response = await api.post("/api/github/push");
  return response.data;
};

export const commitGit = async (message) => {
  const response = await api.post("/api/github/commit", { message });
  return response.data;
};

export const runTerraformPlan = async () => {
  const response = await api.post("/api/terraform/plan");
  return response.data;
};

export const runTerraformApply = async () => {
  const response = await api.post("/api/terraform/apply");
  return response.data;
};

export const runTerraformDestroy = async () => {
  const response = await api.post("/api/terraform/destroy");
  return response.data;
};

export default api;
