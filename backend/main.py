# ============================================================
# Imports
# ============================================================
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from collections import deque
from datetime import datetime
import subprocess
import json
import os
import glob
import shutil
import psutil
import logging
import typing
import platform

# ============================================================
# Configuration
# ============================================================
# Configure log outputs and error tracing formatters
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("cloud-admin-backend")

# Safe imports for optional Unix-specific password module
try:
    import pwd
except ImportError:
    pwd = None
    logger.info("Non-Unix platform detected, pwd module is unavailable. Using mock user credentials fallback.")

# ============================================================
# Constants
# ============================================================
RESOURCE_GROUP = "rg-cloud-admin-platform"
VM_NAME = "vm-cloud-admin"
DEFAULT_PUBLIC_IP = "20.215.68.150"
DEFAULT_PRIVATE_IP = "10.10.1.4"
DEFAULT_REGION = "Poland Central"
DEFAULT_VM_SIZE = "Standard_D2s_v3"
DEFAULT_OS = "Ubuntu 24.04 LTS"
DOCKER_VERSION = "29.6.1"
POSTGRES_VERSION = "16"
API_PORT = 8000
LINUX_KERNEL = "6.17.0-1018-azure"

# ============================================================
# Utility Functions
# ============================================================
# Reusable Docker SDK connection manager
_docker_client = None

def get_docker_client() -> typing.Optional[typing.Any]:
    """
    Retrieve or initialize the global Docker SDK client instance.
    """
    global _docker_client
    if _docker_client is not None:
        return _docker_client
    try:
        import docker
        _docker_client = docker.from_env()
        logger.info("Successfully connected to Docker Daemon via docker SDK.")
    except Exception as e:
        _docker_client = None
        logger.debug(f"Could not connect to Docker Daemon (docker SDK): {e}")
    return _docker_client

def docker_available() -> bool:
    """
    Check if Docker is installed and running on the host system.
    """
    client = get_docker_client()
    if client is not None:
        try:
            client.ping()
            return True
        except Exception as e:
            logger.debug(f"Docker ping failed: {e}")
    return shutil.which("docker") is not None

def get_linux_kernel() -> str:
    """
    Get the host OS kernel version dynamically, falling back to constant.
    """
    try:
        return platform.release() or LINUX_KERNEL
    except Exception as e:
        logger.debug(f"Failed to retrieve dynamic OS kernel: {e}")
        return LINUX_KERNEL

def get_docker_version_dynamic() -> str:
    """
    Get the installed Docker engine version dynamically, falling back to constant.
    """
    client = get_docker_client()
    if client:
        try:
            return client.version().get("Version", DOCKER_VERSION)
        except Exception as e:
            logger.debug(f"Failed to retrieve Docker version from SDK: {e}")
            
    # Try running command line
    try:
        out = safe_check_output(["docker", "--version"])
        if out:
            parts = out.split()
            if len(parts) >= 3:
                return parts[2].rstrip(",")
    except Exception as e:
        logger.debug(f"Failed to retrieve Docker version from CLI: {e}")
    return DOCKER_VERSION

def get_postgres_version_dynamic() -> str:
    """
    Determine PostgreSQL container version tag dynamically, falling back to constant.
    """
    client = get_docker_client()
    if client:
        try:
            for c in client.containers.list(all=True):
                if c.image.tags and any("postgres" in t.lower() for t in c.image.tags):
                    tag = c.image.tags[0].split(":")[-1]
                    return tag.split("-")[0]
        except Exception as e:
            logger.debug(f"Failed to retrieve postgres version from SDK: {e}")
    return POSTGRES_VERSION

def run_az_command(args: list) -> str:
    """
    Execute an Azure CLI command and return its JSON or string output.
    Logs errors with traceback info if execution fails.
    """
    try:
        if not shutil.which("az"):
            logger.debug("Azure CLI is not installed or available on PATH.")
            return ""
        result = subprocess.check_output(["az"] + args, text=True, stderr=subprocess.DEVNULL)
        return result.strip()
    except subprocess.CalledProcessError as e:
        logger.error(f"Azure CLI command failed: {e}")
        return ""
    except Exception as e:
        logger.exception(e)
        return ""

def run_az_action(args: list) -> bool:
    """
    Execute a state-modifying Azure CLI command. Returns True if successful.
    """
    try:
        if not shutil.which("az"):
            logger.warning("Azure CLI is not installed or available on PATH.")
            return False
        subprocess.run(["az"] + args, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        return True
    except Exception as e:
        logger.exception(e)
        return False

def safe_json_loads(text: str, default=None) -> typing.Any:
    """
    Decode JSON text string securely with fallback values.
    """
    if not text:
        return default
    try:
        return json.loads(text)
    except json.JSONDecodeError as e:
        logger.error(f"JSON decode failed: {e}")
        return default

def safe_check_output(args: list, default: str = "") -> str:
    """
    Execute host subprocess output retrieval safely.
    """
    binary = args[0]
    if not shutil.which(binary):
        logger.debug(f"Command binary '{binary}' not found on system path.")
        return default
    try:
        return subprocess.check_output(args, text=True, stderr=subprocess.DEVNULL).strip()
    except Exception as e:
        logger.error(f"Execution of command {args} failed: {e}")
        return default

# ============================================================
# FastAPI Application
# ============================================================
app = FastAPI(title="Cloud Admin Platform API", version="0.1.0")

# Enable CORS for the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory mock states for fallback mode
vm_status = "Running"

cpu_history = deque(maxlen=30)
memory_history = deque(maxlen=30)
network_history = deque(maxlen=30)

last_net = psutil.net_io_counters()

@app.get("/")
def home() -> dict:
    """
    Get backend status confirmation.
    """
    return {"message": "Cloud Admin Platform API is running"}

@app.get("/health")
def health() -> dict:
    """
    Confirm health state of the API.
    """
    return {"status": "healthy"}

# ============================================================
# Dashboard Endpoints
# ============================================================
@app.get("/api/dashboard")
def get_dashboard() -> dict:
    """
    Retrieve overview metrics and status of the VM, Docker, Database, API, and System.

    TODO:
    Replace fake metrics with Prometheus.
    """
    current_vm_status = vm_status
    
    # 1. Fetch real VM status using Azure CLI helper
    status_json = run_az_command([
        "vm", "get-instance-view",
        "--resource-group", RESOURCE_GROUP,
        "--name", VM_NAME,
        "--output", "json"
    ])
    status = safe_json_loads(status_json)
    if status and "instanceView" in status and "statuses" in status["instanceView"]:
        for s in status["instanceView"]["statuses"]:
            if s.get("code", "").startswith("PowerState"):
                current_vm_status = s.get("displayStatus", vm_status)

    # 2. Retrieve real Docker count if running, otherwise use fallback
    docker_count = 2
    docker_status = "Healthy"
    client = get_docker_client()
    if client:
        try:
            docker_count = len(client.containers.list(all=True))
        except Exception as e:
            logger.exception(e)

    return {
        "vm": {
            "name": VM_NAME,
            "status": current_vm_status,
            "region": DEFAULT_REGION,
            "public_ip": DEFAULT_PUBLIC_IP
        },
        "docker": {
            "containers": docker_count,
            "status": docker_status,
            "version": get_docker_version_dynamic()
        },
        "database": {
            "engine": "PostgreSQL",
            "version": get_postgres_version_dynamic(),
            "status": "Healthy"
        },
        "api": {
            "status": "Online",
            "port": API_PORT
        },
        "system": {
            "cpu": round(psutil.cpu_percent(), 0),
            "memory": round(psutil.virtual_memory().percent, 0),
            "disk": round(psutil.disk_usage("/").percent, 0)
        }
    }

# ============================================================
# Virtual Machines
# ============================================================
@app.get("/api/vms")
def get_vms() -> list:
    """
    Get the list of configured Azure virtual machines.

    TODO:
    Replace local VM fallback with Azure SDK.
    TODO:
    Support multiple Azure Virtual Machines.
    """
    # 1. Try retrieving real Azure VM properties
    vm_json = run_az_command([
        "vm", "show",
        "--resource-group", RESOURCE_GROUP,
        "--name", VM_NAME,
        "--show-details",
        "--output", "json"
    ])
    vm = safe_json_loads(vm_json)
    
    status_json = run_az_command([
        "vm", "get-instance-view",
        "--resource-group", RESOURCE_GROUP,
        "--name", VM_NAME,
        "--output", "json"
    ])
    status = safe_json_loads(status_json)

    if vm and status and "instanceView" in status and "statuses" in status["instanceView"]:
        power_state = "Unknown"
        for s in status["instanceView"]["statuses"]:
            if s.get("code", "").startswith("PowerState"):
                power_state = s.get("displayStatus", "Unknown")

        return [{
            "id": 1,
            "name": vm.get("name", VM_NAME),
            "status": power_state,
            "os": vm.get("storageProfile", {}).get("imageReference", {}).get("offer", DEFAULT_OS),
            "region": vm.get("location", DEFAULT_REGION),
            "public_ip": vm.get("publicIps", DEFAULT_PUBLIC_IP),
            "private_ip": vm.get("privateIps", DEFAULT_PRIVATE_IP),
            "size": vm.get("hardwareProfile", {}).get("vmSize", DEFAULT_VM_SIZE),
            "cpu": round(psutil.cpu_percent(), 1),
            "memory": round(psutil.virtual_memory().percent, 1),
            "disk": round(psutil.disk_usage("/").percent, 1),
            "docker": "Healthy",
            "kernel": get_linux_kernel(),
        }]

    # 2. Fall back to local mock properties if Azure CLI fails
    return [
        {
            "id": 1,
            "name": VM_NAME,
            "status": vm_status,
            "os": DEFAULT_OS,
            "region": DEFAULT_REGION,
            "public_ip": DEFAULT_PUBLIC_IP,
            "private_ip": DEFAULT_PRIVATE_IP,
            "cpu": round(psutil.cpu_percent(), 1),
            "memory": round(psutil.virtual_memory().percent, 1),
            "disk": round(psutil.disk_usage("/").percent, 1),
            "docker": "Healthy",
            "kernel": get_linux_kernel(),
            "size": DEFAULT_VM_SIZE
        }
    ]

@app.post("/api/vms/{name}/start")
def start_vm(name: str) -> dict:
    """
    Power on the specified virtual machine.
    """
    global vm_status
    vm_status = "Running"
    success = run_az_action([
        "vm", "start",
        "--resource-group", RESOURCE_GROUP,
        "--name", name
    ])
    if success:
        return {"success": True, "message": f"VM {name} started via Azure CLI"}
    return {"status": "success", "message": f"VM {name} started (Local fallback)"}

@app.post("/api/vms/{name}/stop")
def stop_vm(name: str) -> dict:
    """
    Power off the specified virtual machine.
    """
    global vm_status
    vm_status = "Stopped"
    success = run_az_action([
        "vm", "stop",
        "--resource-group", RESOURCE_GROUP,
        "--name", name
    ])
    if success:
        return {"success": True, "message": f"VM {name} stopped via Azure CLI"}
    return {"status": "success", "message": f"VM {name} stopped (Local fallback)"}

@app.post("/api/vms/{name}/restart")
def restart_vm(name: str) -> dict:
    """
    Restart the specified virtual machine.
    """
    global vm_status
    vm_status = "Running"
    success = run_az_action([
        "vm", "restart",
        "--resource-group", RESOURCE_GROUP,
        "--name", name
    ])
    if success:
        return {"success": True, "message": f"VM {name} restarted via Azure CLI"}
    return {"status": "success", "message": f"VM {name} restarted (Local fallback)"}

@app.post("/api/vms/{name}/deallocate")
def deallocate_vm(name: str) -> dict:
    """
    Deallocate the specified virtual machine to stop billing.
    """
    global vm_status
    vm_status = "Deallocated"
    success = run_az_action([
        "vm", "deallocate",
        "--resource-group", RESOURCE_GROUP,
        "--name", name
    ])
    if success:
        return {"success": True, "message": f"VM {name} deallocated via Azure CLI"}
    return {"status": "success", "message": f"VM {name} deallocated (Local fallback)"}

# ============================================================
# Docker
# ============================================================
@app.get("/api/docker")
def get_docker() -> list:
    """
    Get the list of Docker containers.
    """
    # 1. Try querying Docker SDK directly
    client = get_docker_client()
    if client:
        try:
            containers = []
            for c in client.containers.list(all=True):
                ports = []
                if c.ports:
                    for container_port, mappings in c.ports.items():
                        if mappings:
                            for m in mappings:
                                ports.append(f"{m['HostIp']}:{m['HostPort']}->{container_port}")
                
                status_val = c.status
                is_running = status_val.lower() == "running"
                
                cmd_data = c.attrs.get("Config", {}).get("Cmd", "N/A")
                cmd_str = cmd_data if isinstance(cmd_data, str) else " ".join(cmd_data or [])
                
                containers.append({
                    "id": c.short_id,
                    "name": c.name,
                    "image": c.image.tags[0] if c.image.tags else c.image.id[:12],
                    "status": c.status,
                    "ports": ", ".join(ports) if ports else "-",
                    "created": c.attrs.get("Created", "")[:19].replace("T", " "),
                    # Details panel options
                    "hostname": c.name,
                    "command": cmd_str,
                    "network": next(iter(c.attrs.get("NetworkSettings", {}).get("Networks", {}).keys()), "bridge"),
                    "volumes": ", ".join([f"{v['Source']}:{v['Destination']}" for v in c.attrs.get("Mounts", [])]) or "None",
                    "cpu": 1.2 if is_running else 0.0,
                    "memory": 45 if is_running else 0,
                    "health": "Healthy" if is_running else "Unhealthy"
                })
            return containers
        except Exception as e:
            logger.exception(e)

    # 2. Fall back to local command subprocess mapping
    try:
        stdout_content = safe_check_output(["docker", "ps", "-a", "--format", "{{json .}}"])
        if stdout_content:
            containers = []
            for line in stdout_content.splitlines():
                line_str = line.strip()
                if line_str:
                    raw_data = safe_json_loads(line_str)
                    if not raw_data:
                        continue
                    status_val = raw_data.get("State") or raw_data.get("Status") or ""
                    is_running = "up" in status_val.lower() or "running" in status_val.lower()
                    containers.append({
                        "id": raw_data.get("ID", ""),
                        "name": raw_data.get("Names") or raw_data.get("Name") or "",
                        "image": raw_data.get("Image", ""),
                        "status": "running" if is_running else ("paused" if "paused" in status_val.lower() else "exited"),
                        "ports": raw_data.get("Ports") or "-",
                        "created": raw_data.get("CreatedAt") or raw_data.get("CreatedSince") or raw_data.get("RunningFor") or "",
                        "hostname": raw_data.get("Names") or raw_data.get("ID", "")[:12],
                        "command": raw_data.get("Command", "N/A"),
                        "network": raw_data.get("Networks", "bridge"),
                        "volumes": raw_data.get("Mounts", "None"),
                        "cpu": 1.2 if is_running else 0.0,
                        "memory": 45 if is_running else 0,
                        "health": "Healthy" if is_running else "Unhealthy"
                    })
            return containers
    except Exception as e:
        logger.exception(e)

    # 3. Ultimate mock default data fallback
    return [
        {
            "id": "1a2b3c4d5e6f",
            "name": "backend-api",
            "image": "cloud-admin-backend:latest",
            "status": "running",
            "ports": "0.0.0.0:8000->8000/tcp",
            "created": "2 hours ago",
            "hostname": "backend-api",
            "command": "uvicorn main:app --host 0.0.0.0",
            "network": "bridge",
            "volumes": "None",
            "cpu": 1.5,
            "memory": 64,
            "health": "Healthy"
        },
        {
            "id": "9f8e7d6c5b4a",
            "name": "postgres-db",
            "image": "postgres:16-alpine",
            "status": "running",
            "ports": "0.0.0.0:5432->5432/tcp",
            "created": "3 hours ago",
            "hostname": "postgres-db",
            "command": "docker-entrypoint.sh postgres",
            "network": "bridge",
            "volumes": "pgdata:/var/lib/postgresql/data",
            "cpu": 0.5,
            "memory": 128,
            "health": "Healthy"
        }
    ]

@app.get("/api/docker/stats")
def docker_stats() -> list:
    """
    Get resource stats for all containers.
    """
    client = get_docker_client()
    if client:
        try:
            containers = client.containers.list(all=True)
            data = []
            for container in containers:
                try:
                    stats = container.stats(stream=False)
                    cpu_percent = 0.0
                    try:
                        cpu_delta = (
                            stats["cpu_stats"]["cpu_usage"]["total_usage"]
                            - stats["precpu_stats"]["cpu_usage"]["total_usage"]
                        )
                        system_delta = (
                            stats["cpu_stats"]["system_cpu_usage"]
                            - stats["precpu_stats"]["system_cpu_usage"]
                        )
                        online_cpus = stats["cpu_stats"].get("online_cpus", 1)
                        if system_delta > 0:
                            cpu_percent = (cpu_delta / system_delta) * online_cpus * 100
                    except Exception as e:
                        logger.error(f"CPU calculation failed for {container.name}: {e}")

                    memory_usage = stats["memory_stats"]["usage"] / 1024 / 1024
                    memory_limit = stats["memory_stats"]["limit"] / 1024 / 1024
                    data.append({
                        "id": container.id,
                        "name": container.name,
                        "cpu": round(cpu_percent, 2),
                        "memory_mb": round(memory_usage, 2),
                        "memory_limit_mb": round(memory_limit, 2)
                    })
                except Exception as ex:
                    logger.debug(f"Failed to query stats for container {container.name}: {ex}")
            if data:
                return data
        except Exception as e:
            logger.exception(e)

    # Fallback to local default stats if docker SDK metrics fail
    return [
        {"id": "1a2b3c4d5e6f", "name": "backend-api", "cpu": 1.2, "memory_mb": 45.3, "memory_limit_mb": 7935.2},
        {"id": "9f8e7d6c5b4a", "name": "postgres-db", "cpu": 0.4, "memory_mb": 98.7, "memory_limit_mb": 7935.2}
    ]

@app.post("/api/docker/{container_name}/start")
def start_container(container_name: str) -> dict:
    """
    Start the specified container.
    """
    client = get_docker_client()
    if client:
        try:
            container = client.containers.get(container_name)
            container.start()
            return {"success": True, "message": f"{container_name} started"}
        except Exception as e:
            logger.exception(e)
            raise HTTPException(status_code=500, detail=str(e))
    return {"success": True, "message": f"{container_name} started (Local fallback)"}

@app.post("/api/docker/{container_name}/stop")
def stop_container(container_name: str) -> dict:
    """
    Stop the specified container.
    """
    client = get_docker_client()
    if client:
        try:
            container = client.containers.get(container_name)
            container.stop()
            return {"success": True, "message": f"{container_name} stopped"}
        except Exception as e:
            logger.exception(e)
            raise HTTPException(status_code=500, detail=str(e))
    return {"success": True, "message": f"{container_name} stopped (Local fallback)"}

@app.post("/api/docker/{container_name}/restart")
def restart_container(container_name: str) -> dict:
    """
    Restart the specified container.
    """
    client = get_docker_client()
    if client:
        try:
            container = client.containers.get(container_name)
            container.restart()
            return {"success": True, "message": f"{container_name} restarted"}
        except Exception as e:
            logger.exception(e)
            raise HTTPException(status_code=500, detail=str(e))
    return {"success": True, "message": f"{container_name} restarted (Local fallback)"}

@app.get("/api/docker/{container_name}/logs")
def get_container_logs(container_name: str) -> dict:
    """
    Get tail logs of the specified container.
    """
    client = get_docker_client()
    if client:
        try:
            container = client.containers.get(container_name)
            logs = container.logs(tail=200, timestamps=True).decode("utf-8")
            return {"container": container_name, "logs": logs}
        except Exception as e:
            logger.exception(e)
            raise HTTPException(status_code=500, detail=str(e))
    return {"container": container_name, "logs": "Running in local mock environment. Docker logging unavailable."}

# ============================================================
# Networks
# ============================================================
@app.get("/api/networks")
def get_networks() -> dict:
    """
    Get Docker and host interfaces networks metadata.
    """
    docker_networks = []
    client = get_docker_client()
    if client:
        try:
            for network in client.networks.list():
                attrs = network.attrs
                subnet = "-"
                try:
                    subnet = attrs["IPAM"]["Config"][0]["Subnet"]
                except Exception:
                    pass
                containers = attrs.get("Containers") or {}
                docker_networks.append({
                    "id": network.short_id,
                    "name": network.name,
                    "driver": attrs.get("Driver"),
                    "scope": attrs.get("Scope"),
                    "subnet": subnet,
                    "containers": len(containers)
                })
        except Exception as e:
            logger.exception(e)

    # Local fallback for networks
    if not docker_networks:
        docker_networks = [
            {"id": "13a2cb1a4b68", "name": "bridge", "driver": "bridge", "scope": "local", "subnet": "172.17.0.0/16", "containers": 2},
            {"id": "0ad1ae39dde9", "name": "host", "driver": "host", "scope": "local", "subnet": "-", "containers": 0},
            {"id": "ea91a3159c89", "name": "none", "driver": "null", "scope": "local", "subnet": "-", "containers": 0}
        ]

    interfaces = []
    try:
        for name, stats in psutil.net_if_stats().items():
            interfaces.append({
                "name": name,
                "status": "UP" if stats.isup else "DOWN",
                "speed": f"{stats.speed} Mbps" if stats.speed > 0 else "-",
                "mtu": getattr(stats, 'mtu', 1500),
                "ip": next(iter([addr.address for addr in psutil.net_if_addrs().get(name, []) if addr.family.name == 'AF_INET']), "-")
            })
    except Exception as e:
        logger.exception(e)

    if not interfaces:
        interfaces = [
            {"name": "eth0", "status": "UP", "mtu": 1500, "ip": DEFAULT_PRIVATE_IP, "speed": "10000 Mbps"},
            {"name": "lo", "status": "UP", "mtu": 65536, "ip": "127.0.0.1", "speed": "Loopback"}
        ]

    return {
        "docker_networks": docker_networks,
        "interfaces": interfaces,
        "azure": {
            "public_ip": DEFAULT_PUBLIC_IP,
            "private_ip": DEFAULT_PRIVATE_IP,
            "vnet": "vnet-cloud-admin-platform",
            "subnet": "snet-app"
        }
    }

# ============================================================
# Storage
# ============================================================
@app.get("/api/storage")
def get_storage() -> dict:
    """
    Get host partition disk telemetry and docker volumes.
    """
    volumes = []
    client = get_docker_client()
    if client:
        try:
            for vol in client.volumes.list():
                volumes.append({
                    "name": vol.name,
                    "driver": vol.attrs.get("Driver", "local"),
                    "mountpoint": vol.attrs.get("Mountpoint", "")
                })
        except Exception as e:
            logger.exception(e)

    if not volumes:
        # Fallback to local subprocess parsing of Docker CLI
        volume_out = safe_check_output(["docker", "volume", "ls", "--format", "{{.Name}}"])
        if volume_out:
            for name in volume_out.splitlines():
                if name.strip():
                    inspect = safe_check_output(["docker", "volume", "inspect", name.strip()])
                    info = safe_json_loads(inspect)
                    if info and isinstance(info, list) and len(info) > 0:
                        volumes.append({
                            "name": info[0].get("Name", name),
                            "driver": info[0].get("Driver", "local"),
                            "mountpoint": info[0].get("Mountpoint", "")
                        })

    if not volumes:
        volumes = [
            {
                "name": "pgdata",
                "driver": "local",
                "mountpoint": "/var/lib/docker/volumes/pgdata/_data"
            }
        ]

    try:
        total, used, free = shutil.disk_usage("/")
        disk_stats = {
            "total_gb": round(total / (1024**3), 2),
            "used_gb": round(used / (1024**3), 2),
            "free_gb": round(free / (1024**3), 2),
            "filesystem": "ext4"
        }
    except Exception as e:
        logger.exception(e)
        disk_stats = {
            "total_gb": 28.02,
            "used_gb": 5.29,
            "free_gb": 22.72,
            "filesystem": "ext4"
        }

    return {
        "disk": disk_stats,
        "volumes": volumes
    }

# ============================================================
# Metrics
# ============================================================
@app.get("/api/metrics")
def get_metrics() -> dict:
    """
    Get dynamic performance system metrics.

    TODO:
    Replace fake metrics with Prometheus.
    """
    global last_net

    cpu_percent = psutil.cpu_percent(interval=0.1)
    memory = psutil.virtual_memory()
    disk = psutil.disk_usage("/")

    try:
        current_net = psutil.net_io_counters()
        upload_mb = round((current_net.bytes_sent - last_net.bytes_sent) / (1024 * 1024), 2)
        download_mb = round((current_net.bytes_recv - last_net.bytes_recv) / (1024 * 1024), 2)
        last_net = current_net
    except Exception as e:
        logger.error(f"Retrieve net_io_counters failed: {e}")
        upload_mb = 1.2
        download_mb = 5.4

    now = datetime.now().strftime("%H:%M")

    cpu_history.append({"time": now, "usage": round(cpu_percent, 1)})
    memory_history.append({"time": now, "usage": round(memory.percent, 1)})
    network_history.append({"time": now, "upload": upload_mb, "download": download_mb})

    # Prepare final historical list
    cpu_history_list = list(cpu_history)
    memory_history_list = list(memory_history)
    network_history_list = list(network_history)

    # Fallback to defaults if history list is short
    if len(cpu_history_list) < 5:
        cpu_history_list = [
            {"time": "11:50", "usage": 15},
            {"time": "11:51", "usage": 18},
            {"time": "11:52", "usage": 25},
            {"time": "11:53", "usage": 22},
            {"time": "11:54", "usage": 30},
            {"time": "11:55", "usage": round(cpu_percent, 1)}
        ]
        memory_history_list = [
            {"time": "11:50", "usage": 60},
            {"time": "11:51", "usage": 61},
            {"time": "11:52", "usage": 63},
            {"time": "11:53", "usage": 64},
            {"time": "11:54", "usage": 64},
            {"time": "11:55", "usage": round(memory.percent, 1)}
        ]
        network_history_list = [
            {"time": "11:50", "upload": 0.8, "download": 3.2},
            {"time": "11:51", "upload": 0.9, "download": 4.1},
            {"time": "11:52", "upload": 1.5, "download": 5.0},
            {"time": "11:53", "upload": 1.1, "download": 4.5},
            {"time": "11:54", "upload": 1.3, "download": 5.2},
            {"time": "11:55", "upload": upload_mb, "download": download_mb}
        ]

    running = 0
    stopped = 0
    client = get_docker_client()
    if client:
        try:
            running = len(client.containers.list())
            stopped = len(client.containers.list(all=True)) - running
        except Exception as e:
            logger.exception(e)
            running = 2
            stopped = 0
    else:
        running = 2
        stopped = 0

    return {
        "cpu": {
            "usage": round(cpu_percent, 1),
            "cores": psutil.cpu_count() or 2
        },
        "memory": {
            "used_gb": round(memory.used / (1024 ** 3), 2),
            "total_gb": round(memory.total / (1024 ** 3), 2),
            "percent": round(memory.percent, 1)
        },
        "disk": {
            "used_gb": round(disk.used / (1024 ** 3), 2),
            "total_gb": round(disk.total / (1024 ** 3), 2),
            "percent": round(disk.percent, 1)
        },
        "network": {
            "upload_mb": upload_mb,
            "download_mb": download_mb
        },
        "docker": {
            "running": running,
            "stopped": stopped
        },
        "cpu_history": cpu_history_list,
        "memory_history": memory_history_list,
        "network_history": network_history_list
    }

# ============================================================
# Logs
# ============================================================
@app.get("/api/logs")
def get_logs() -> dict:
    """
    Retrieve aggregated container and system logs.
    """
    logs = []

    # Get real docker logs
    client = get_docker_client()
    if client:
        try:
            for container in client.containers.list(all=True):
                try:
                    last_logs = (
                        container.logs(tail=20, timestamps=True)
                        .decode(errors="ignore")
                        .splitlines()
                    )
                    for line in last_logs:
                        logs.append({
                            "type": "stdout" if "error" not in line.lower() else "stderr",
                            "container": container.name,
                            "message": line,
                            "status": container.status,
                            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                        })
                except Exception as ex:
                    logger.debug(f"Docker logs extraction failed for {container.name}: {ex}")
        except Exception as e:
            logger.exception(e)

    # Get real system syslog / auth.log logs
    try:
        auth_logs = ["/var/log/auth.log", "/var/log/syslog"]
        for logfile in auth_logs:
            if os.path.exists(logfile):
                with open(logfile, "r", errors="ignore") as f:
                    lines = f.readlines()[-20:]
                    for line in lines:
                        logs.append({
                            "type": "system",
                            "container": "system-daemon",
                            "message": line.strip(),
                            "status": "running",
                            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                        })
    except Exception as e:
        logger.exception(e)

    # If no logs could be retrieved, output fallback mock values
    if not logs:
        logs = [
            {
                "type": "stdout",
                "container": "backend-api",
                "message": "Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)",
                "status": "running",
                "timestamp": "2026-07-08 09:57:51"
            },
            {
                "type": "stderr",
                "container": "postgres-db",
                "message": "database system is ready to accept connections",
                "status": "running",
                "timestamp": "2026-07-08 09:21:03"
            },
            {
                "type": "system",
                "container": "docker-daemon",
                "message": "Container backend-api restarted successfully",
                "status": "warning",
                "timestamp": "2026-07-08 10:11:42"
            },
            {
                "type": "stderr",
                "container": "redis-cache",
                "message": "Error connecting to cluster instance: Timeout occurred",
                "status": "error",
                "timestamp": "2026-07-08 10:14:15"
            }
        ]

    return {
        "count": len(logs),
        "logs": logs
    }

# ============================================================
# Alerts
# ============================================================
@app.get("/api/alerts")
def get_alerts() -> dict:
    """
    Get active alerts and warning scopes.

    TODO:
    Replace mock alerts with Azure Monitor.
    """
    alerts = []

    cpu = psutil.cpu_percent(interval=0.1)
    memory = psutil.virtual_memory()
    disk = psutil.disk_usage("/")

    if cpu > 80:
        alerts.append({
            "severity": "critical",
            "service": "CPU",
            "message": f"CPU usage is very high ({cpu}%)",
            "timestamp": datetime.now().strftime("%H:%M")
        })
    elif cpu > 50:
        alerts.append({
            "severity": "warning",
            "service": "CPU",
            "message": f"CPU usage is elevated ({cpu}%)",
            "timestamp": datetime.now().strftime("%H:%M")
        })

    if memory.percent > 85:
        alerts.append({
            "severity": "critical",
            "service": "Memory",
            "message": f"Memory usage reached {memory.percent}%",
            "timestamp": datetime.now().strftime("%H:%M")
        })
    elif memory.percent > 60:
        alerts.append({
            "severity": "warning",
            "service": "Memory",
            "message": f"Memory usage is elevated ({memory.percent}%)",
            "timestamp": datetime.now().strftime("%H:%M")
        })

    if disk.percent > 90:
        alerts.append({
            "severity": "critical",
            "service": "Disk",
            "message": f"Disk usage reached {disk.percent}%",
            "timestamp": datetime.now().strftime("%H:%M")
        })
    elif disk.percent > 70:
        alerts.append({
            "severity": "warning",
            "service": "Disk",
            "message": f"Disk usage is elevated ({disk.percent}%)",
            "timestamp": datetime.now().strftime("%H:%M")
        })

    client = get_docker_client()
    if client:
        try:
            running = len(client.containers.list())
            total = len(client.containers.list(all=True))
            stopped = total - running
            if stopped > 0:
                alerts.append({
                    "severity": "warning",
                    "service": "Docker",
                    "message": f"{stopped} stopped container(s) detected",
                    "timestamp": datetime.now().strftime("%H:%M")
                })
        except Exception as e:
            logger.exception(e)

    # Default fallback alert if none are present
    if not alerts:
        alerts.append({
            "severity": "success",
            "service": "Platform",
            "message": "No active alerts. System is healthy.",
            "timestamp": "11:50"
        })

    return {
        "count": len(alerts),
        "alerts": alerts
    }

# ============================================================
# Firewall
# ============================================================
@app.get("/api/firewall")
def get_firewall() -> dict:
    """
    Get security firewall policies and rules.

    TODO:
    Connect Firewall endpoint with Azure NSG.
    """
    status = "unknown"
    rules = []

    if shutil.which("ufw"):
        try:
            result = subprocess.run(
                ["ufw", "status", "numbered"],
                capture_output=True,
                text=True
            )
            for line in result.stdout.splitlines():
                if "[" in line:
                    parts = line.split("]")
                    rule_number = parts[0].replace("[", "").strip()
                    rule_detail = parts[1].strip()
                    rules.append({
                        "rule": f"Rule {rule_number}: {rule_detail}",
                        "protocol": "TCP/UDP" if "v6" in rule_detail else "TCP",
                        "port": rule_detail.split()[0] if rule_detail.split() else "Any",
                        "source": "Any" if "ALLOW" in rule_detail else "Denied",
                        "destination": "Local host",
                        "action": "Allow" if "ALLOW" in rule_detail else "Block"
                    })
            status = "Running" if "Status: active" in result.stdout else "Stopped"
        except Exception as e:
            logger.exception(e)

    if not rules:
        status = "Running"
        rules = [
            {
                "rule": "Allow-HTTP-Inbound",
                "protocol": "TCP",
                "port": "80",
                "source": "Any",
                "destination": "Any",
                "action": "Allow"
            },
            {
                "rule": "Allow-SSH-Admin",
                "protocol": "TCP",
                "port": "22",
                "source": "193.95.22.44",
                "destination": "Any",
                "action": "Allow"
            },
            {
                "rule": "Block-PostgreSQL-External",
                "protocol": "TCP",
                "port": "5432",
                "source": "Any",
                "destination": "Any",
                "action": "Block"
            }
        ]

    return {
        "status": status,
        "rules": rules,
        "count": len(rules)
    }

# ============================================================
# SSH
# ============================================================
@app.get("/api/ssh-keys")
def get_ssh_keys() -> dict:
    """
    Get list of authorized public keys installed on the host.
    """
    ssh_dir = os.path.expanduser("~/.ssh")
    keys = []

    if os.path.exists(ssh_dir):
        try:
            for file in os.listdir(ssh_dir):
                if file.endswith(".pub"):
                    path = os.path.join(ssh_dir, file)
                    keys.append({
                        "username": "azureuser" if "azure" in file else "root",
                        "fingerprint": f"SHA256:{file[:10]}...",
                        "comment": file,
                        "created": datetime.fromtimestamp(os.path.getmtime(path)).strftime("%Y-%m-%d %H:%M")
                    })
        except Exception as e:
            logger.exception(e)

    return {
        "count": len(keys),
        "keys": keys
    }

# ============================================================
# IAM
# ============================================================
@app.get("/api/iam")
def get_iam() -> dict:
    """
    Get user identities list from operating system context.
    """
    users = []

    if pwd:
        try:
            for u in pwd.getpwall():
                if u.pw_uid >= 1000:
                    users.append({
                        "username": u.pw_name,
                        "uid": u.pw_uid,
                        "home": u.pw_dir,
                        "shell": u.pw_shell
                    })
        except Exception as e:
            logger.exception(e)

    if not users:
        users = [
            {
                "username": "nobody",
                "uid": 65534,
                "home": "/nonexistent",
                "shell": "/usr/sbin/nologin"
            },
            {
                "username": "admin-yassin",
                "uid": 1000,
                "home": "/home/admin-yassin",
                "shell": "/bin/bash"
            }
        ]

    return {
        "count": len(users),
        "users": users
    }

# ============================================================
# Terraform
# ============================================================
@app.get("/api/terraform")
def get_terraform() -> dict:
    """
    Retrieve HashiCorp Terraform deployment version metadata.
    """
    installed = shutil.which("terraform") is not None
    version = None

    if installed:
        try:
            version_out = safe_check_output(["terraform", "-version"])
            if version_out:
                version = version_out.splitlines()[0]
        except Exception as e:
            logger.exception(e)
            installed = False

    return {
        "installed": installed,
        "version": version
    }

# ============================================================
# Docker Compose
# ============================================================
@app.get("/api/docker-compose")
def get_docker_compose() -> dict:
    """
    Retrieve Docker Compose configuration metadata.
    """
    version = None
    containers = []

    if shutil.which("docker"):
        try:
            version = safe_check_output(["docker", "compose", "version"])
            client = get_docker_client()
            if client:
                for c in client.containers.list(all=True):
                    ports = []
                    for p in c.attrs.get("NetworkSettings", {}).get("Ports", {}) or {}:
                        mapping = c.attrs["NetworkSettings"]["Ports"][p]
                        if mapping:
                            for m in mapping:
                                ports.append(f'{m["HostPort"]}:{p.split("/")[0]}')

                    containers.append({
                        "project": c.labels.get("com.docker.compose.project", "cloud-admin-platform"),
                        "container": c.name,
                        "status": c.status,
                        "ports": ", ".join(ports),
                        "image": c.image.tags[0] if c.image.tags else "unknown"
                    })
        except Exception as e:
            logger.exception(e)

    return {
        "version": version,
        "containers": containers
    }

# ============================================================
# GitHub
# ============================================================
@app.get("/api/github")
def get_github() -> dict:
    """
    Retrieve revision git tracking parameters and remote origins.
    """
    repo = "/home/azureuser/cloud-admin-platform"
    if not os.path.exists(repo):
        repo = os.getcwd()

    try:
        branch = safe_check_output(["git", "-C", repo, "branch", "--show-current"])
        commit = safe_check_output(["git", "-C", repo, "rev-parse", "--short", "HEAD"])
        remote_out = safe_check_output(["git", "-C", repo, "remote", "-v"])

        remotes = []
        if remote_out:
            for line in remote_out.splitlines():
                parts = line.split()
                if len(parts) >= 2:
                    name, url = parts[0], parts[1]
                    if not any(r["name"] == name for r in remotes):
                        remotes.append({
                            "name": name,
                            "branch": branch or "main",
                            "commit": commit or "N/A",
                            "url": url
                        })

        return {
            "branch": branch or None,
            "commit": commit or None,
            "remote": remotes
        }

    except Exception as e:
        logger.exception(e)
        return {
            "branch": None,
            "commit": None,
            "remote": []
        }
