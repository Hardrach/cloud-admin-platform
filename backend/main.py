from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import subprocess
import json

app = FastAPI(title="Cloud Admin Platform API", version="0.1.0")

# Enable CORS for the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this to specific frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "Cloud Admin Platform API is running"}

@app.get("/health")
def health():
    return {"status": "healthy"}

@app.get("/api/dashboard")
def get_dashboard():
    # Return structured nested JSON matching the frontend requirements
    return {
        "vm": {
            "name": "vm-cloud-admin",
            "status": "Running",
            "region": "Poland Central",
            "public_ip": "20.215.68.150"
        },
        "docker": {
            "containers": 2,
            "status": "Healthy",
            "version": "29.6.1"
        },
        "database": {
            "engine": "PostgreSQL",
            "version": "16",
            "status": "Healthy"
        },
        "api": {
            "status": "Online",
            "port": 8000
        },
        "system": {
            "cpu": 7,
            "memory": 11,
            "disk": 9
        }
    }

vm_status = "Running"

@app.get("/api/vms")
def get_vms():
    # Return compute nodes telemetry list matching VM page properties
    return [
        {
            "id": 1,
            "name": "vm-cloud-admin",
            "status": vm_status,
            "os": "Ubuntu 24.04 LTS",
            "region": "Poland Central",
            "public_ip": "20.215.68.150",
            "private_ip": "10.10.1.4",
            "cpu": 7,
            "memory": 11,
            "disk": 9,
            "docker": "Healthy",
            "kernel": "6.17.0-1018-azure",
            "size": "Standard_D2s_v3"
        }
    ]

@app.post("/api/vms/{name}/start")
def start_vm(name: str):
    global vm_status
    vm_status = "Running"
    return {"status": "success", "message": f"VM {name} started"}

@app.post("/api/vms/{name}/stop")
def stop_vm(name: str):
    global vm_status
    vm_status = "Stopped"
    return {"status": "success", "message": f"VM {name} stopped"}

@app.post("/api/vms/{name}/restart")
def restart_vm(name: str):
    global vm_status
    vm_status = "Running"
    return {"status": "success", "message": f"VM {name} restarted"}

@app.post("/api/vms/{name}/deallocate")
def deallocate_vm(name: str):
    global vm_status
    vm_status = "Deallocated"
    return {"status": "success", "message": f"VM {name} deallocated"}

@app.get("/api/docker")
def get_docker():
    try:
        # Run command 'docker ps -a --format "{{json .}}"' using Python subprocess
        result = subprocess.run(
            ["docker", "ps", "-a", "--format", "{{json .}}"],
            capture_output=True,
            text=True,
            check=True
        )
        
        stdout_content = result.stdout.strip()
        if not stdout_content:
            return []
            
        containers = []
        for line in stdout_content.splitlines():
            line_str = line.strip()
            if line_str:
                try:
                    raw_data = json.loads(line_str)
                    status_val = raw_data.get("State") or raw_data.get("Status") or ""
                    is_running = "up" in status_val.lower() or "running" in status_val.lower()
                    
                    # Normalize Docker CLI JSON format to match exact React UI schema keys
                    containers.append({
                        "id": raw_data.get("ID", ""),
                        "name": raw_data.get("Names") or raw_data.get("Name") or "",
                        "image": raw_data.get("Image", ""),
                        "status": "running" if is_running else ("paused" if "paused" in status_val.lower() else "exited"),
                        "ports": raw_data.get("Ports") or "-",
                        "created": raw_data.get("CreatedAt") or raw_data.get("CreatedSince") or raw_data.get("RunningFor") or "",
                        
                        # Extra fields for the details panel
                        "hostname": raw_data.get("Names") or raw_data.get("ID", "")[:12],
                        "command": raw_data.get("Command", "N/A"),
                        "network": raw_data.get("Networks", "bridge"),
                        "volumes": raw_data.get("Mounts", "None"),
                        "cpu": 1.2 if is_running else 0.0,
                        "memory": 45 if is_running else 0,
                        "health": "Healthy" if is_running else "Unhealthy"
                    })
                except json.JSONDecodeError:
                    continue
        return containers
    except Exception as e:
        print(f"Docker command failed: {e}")
        return []

@app.get("/api/networks")
def get_networks():
    return {
        "docker_networks": [
            {
                "id": "13a2cb1a4b68",
                "name": "bridge",
                "driver": "bridge",
                "scope": "local",
                "subnet": "172.17.0.0/16",
                "containers": 2
            },
            {
                "id": "0ad1ae39dde9",
                "name": "host",
                "driver": "host",
                "scope": "local",
                "subnet": "-",
                "containers": 0
            },
            {
                "id": "ea91a3159c89",
                "name": "none",
                "driver": "null",
                "scope": "local",
                "subnet": "-",
                "containers": 0
            }
        ],
        "interfaces": [
            {
                "name": "eth0",
                "status": "UP",
                "mtu": 1500,
                "ip": "10.10.1.4",
                "speed": "10000 Mbps"
            },
            {
                "name": "lo",
                "status": "UP",
                "mtu": 65536,
                "ip": "127.0.0.1",
                "speed": "Loopback"
            }
        ],
        "azure": {
            "public_ip": "20.215.68.150",
            "private_ip": "10.10.1.4",
            "vnet": "vnet-cloud-admin",
            "subnet": "subnet-backend"
        }
    }

@app.get("/api/storage")
def get_storage():
    return {
        "disk": {
            "total_gb": 28.02,
            "used_gb": 5.29,
            "free_gb": 22.72,
            "filesystem": "ext4"
        },
        "volumes": [
            {
                "name": "pgdata",
                "driver": "local",
                "mountpoint": "/var/lib/docker/volumes/pgdata/_data"
            }
        ]
    }

@app.get("/api/metrics")
def get_metrics():
    return {
        "cpu": {
            "usage": 23.4,
            "cores": 2
        },
        "memory": {
            "used_gb": 4.97,
            "total_gb": 7.75,
            "percent": 64.2
        },
        "disk": {
            "used_gb": 5.29,
            "total_gb": 28.02,
            "percent": 18.9,
            "filesystem": "ext4"
        },
        "network": {
            "upload_mb": 1.2,
            "download_mb": 5.4
        },
        "docker": {
            "running": 2,
            "stopped": 0
        },
        "cpu_history": [
            {"time": "11:50", "usage": 15},
            {"time": "11:51", "usage": 18},
            {"time": "11:52", "usage": 25},
            {"time": "11:53", "usage": 22},
            {"time": "11:54", "usage": 30},
            {"time": "11:55", "usage": 23}
        ],
        "memory_history": [
            {"time": "11:50", "usage": 60},
            {"time": "11:51", "usage": 61},
            {"time": "11:52", "usage": 63},
            {"time": "11:53", "usage": 64},
            {"time": "11:54", "usage": 64},
            {"time": "11:55", "usage": 64.2}
        ],
        "network_history": [
            {"time": "11:50", "upload": 0.8, "download": 3.2},
            {"time": "11:51", "upload": 0.9, "download": 4.1},
            {"time": "11:52", "upload": 1.5, "download": 5.0},
            {"time": "11:53", "upload": 1.1, "download": 4.5},
            {"time": "11:54", "upload": 1.3, "download": 5.2},
            {"time": "11:55", "upload": 1.2, "download": 5.4}
        ]
    }

@app.get("/api/logs")
def get_logs():
    return {
        "count": 4,
        "logs": [
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
    }

@app.get("/api/alerts")
def get_alerts():
    return {
        "count": 3,
        "alerts": [
            {
                "severity": "critical",
                "service": "Database",
                "message": "High memory consumption on postgres-db container (>90%)",
                "timestamp": "12:45"
            },
            {
                "severity": "warning",
                "service": "Storage",
                "message": "Virtual Machine disk partition space utilization exceeds 80%",
                "timestamp": "12:12"
            },
            {
                "severity": "info",
                "service": "Network",
                "message": "VNET peering vnet-peer-prod state connection established",
                "timestamp": "11:50"
            }
        ]
    }

@app.get("/api/firewall")
def get_firewall():
    return {
        "status": "Running",
        "count": 3,
        "rules": [
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
    }

@app.get("/api/ssh-keys")
def get_ssh_keys():
    return {
        "count": 0,
        "keys": []
    }

@app.get("/api/iam")
def get_iam():
    return {
        "count": 2,
        "users": [
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
    }

@app.get("/api/terraform")
def get_terraform():
    return {
        "installed": False,
        "version": None
    }

@app.get("/api/docker-compose")
def get_docker_compose():
    return {
        "version": None,
        "containers": []
    }

@app.get("/api/github")
def get_github():
    return {
        "branch": None,
        "commit": None,
        "remote": []
    }
