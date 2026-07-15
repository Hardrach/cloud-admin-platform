import axios from 'axios';

const api = axios.create({
  baseURL: 'http://20.215.68.150:8000',
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

export const startVirtualMachine = async (name) => {
  return api.post(`/api/vms/${name}/start`);
};

export const stopVirtualMachine = async (name) => {
  return api.post(`/api/vms/${name}/stop`);
};

export const restartVirtualMachine = async (name) => {
  return api.post(`/api/vms/${name}/restart`);
};

export const deallocateVirtualMachine = async (name) => {
  return api.post(`/api/vms/${name}/deallocate`);
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

export default api;
