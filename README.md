<!-- Header animated banner (no & in desc to avoid SVG XML error) -->
![header](https://capsule-render.vercel.app/api?type=waving&color=0:00D4FF,100:8B5CF6&height=200&section=header&text=Cloud%20Admin%20Platform&fontSize=48&fontAlignY=40&fontColor=ffffff&desc=Enterprise%20DevOps%20and%20Cloud%20Management%20Dashboard&descAlignY=62&descSize=18&animation=fadeIn)

<div align="center">

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=0B1220)](https://reactjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-Python%203.12-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://docker.com)
[![Azure](https://img.shields.io/badge/Microsoft-Azure-0078D4?style=for-the-badge&logo=microsoftazure&logoColor=white)](https://azure.microsoft.com)
[![Terraform](https://img.shields.io/badge/Terraform-IaC-844FBA?style=for-the-badge&logo=terraform&logoColor=white)](https://terraform.io)

![Status](https://img.shields.io/badge/Status-Production%20Ready-34D399?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-8B5CF6?style=flat-square)
![Build](https://img.shields.io/badge/Build-Passing-00D4FF?style=flat-square&logo=github-actions&logoColor=white)
![Design](https://img.shields.io/badge/Design-Enterprise%20SaaS-FBBF24?style=flat-square)
![Endpoints](https://img.shields.io/badge/API%20Endpoints-27-F87171?style=flat-square)

**[Overview](#-overview)** • **[Features](#-features)** • **[Architecture](#-architecture)** • **[Tech Stack](#-tech-stack)** • **[Quick Start](#-quick-start)** • **[API](#-api-reference)** • **[Roadmap](#-roadmap)**

</div>

---

## ✦ Overview

**Cloud Admin Platform** is a production-grade, full-stack **DevOps administration dashboard** that connects a polished React SaaS frontend to a Python FastAPI backend reading **live data** from Linux, Docker, Git, Terraform, Azure CLI, UFW, SSH and real system metrics.

Built as a **Final Year DevOps Engineering Portfolio Project**, this platform demonstrates mastery of the complete cloud-native engineering stack — from infrastructure provisioning to frontend UX.

> **Every operational page is API-driven. No static mock data. Real system sources only.**

```
🌐 Frontend  →  React 19 SaaS UI
       ↓
🔄 Axios     →  REST API calls
       ↓
🔒 Nginx     →  HTTPS reverse proxy
       ↓
⚡ FastAPI   →  Live data backend
       ↓
┌──────────────────────┐
│  🐧 Linux / psutil   │
│  🐳 Docker SDK       │
│  🌍 Azure CLI        │
│  🏗  Terraform CLI   │
│  🔑 Git CLI          │
│  🛡  UFW Firewall    │
└──────────────────────┘
```

---

## ✦ Project Highlights

| Area | What CloudAdmin Provides |
|:---:|:---|
| 🖥️ **Infrastructure** | Azure VM status, region, IPs and full lifecycle actions |
| 🐳 **Containers** | Docker inventory, status, ports, logs, start/stop/restart |
| 📊 **Monitoring** | CPU, memory, disk, swap, load average, disk IO, network |
| 🛡️ **Security** | UFW firewall rules, SSH keys, Linux IAM users |
| 🔧 **DevOps** | Git status, Terraform state, Docker Compose stack |
| 🎨 **UX** | Dark/light mode, micro-animations, skeletons, toasts |
| 🚀 **Deployment** | Docker Compose, Vercel, Nginx, DuckDNS, HTTPS |

---

## ✦ Features

<details>
<summary><b>🖥️ Dashboard</b></summary>
<br>

- Host CPU, memory and disk usage gauges
- Docker container health indicators
- API and service status panel
- Hostname, kernel, uptime and OS details
- Docker, Terraform and Git metadata widgets
- Animated background with interactive particle network
- Staggered loading with skeleton shimmer animations

</details>

<details>
<summary><b>☁️ Virtual Machines (Azure)</b></summary>
<br>

- Live Azure VM inventory via Azure CLI
- VM status, region, public/private IP
- Instance size and OS profile
- **Start**, **Stop**, **Restart** and **Deallocate** actions with confirmation dialogs
- Real-time status badge (Running / Stopped / Deallocated)

</details>

<details>
<summary><b>🐳 Docker Containers</b></summary>
<br>

- Full Docker container inventory via Docker SDK
- Image name, status, ports, network, volumes metadata
- Live container logs streaming
- **Start**, **Stop** and **Restart** buttons connected to backend
- Container health, IP address, restart count

</details>

<details>
<summary><b>🌐 Networks</b></summary>
<br>

- Host network interfaces with IP and MAC addresses
- Link status, MTU and interface speed
- Default gateway detection
- DNS resolver list
- RX/TX traffic byte counters
- Docker network bridge inventory

</details>

<details>
<summary><b>💾 Storage</b></summary>
<br>

- All disk partitions with capacity, used and free space
- Usage percentage gauge bars
- Docker volumes list
- Root mount point utilization

</details>

<details>
<summary><b>📈 Metrics</b></summary>
<br>

- Historical CPU and memory usage charts (Recharts area graphs)
- Swap utilization
- Disk IO read/write bytes
- Network upload/download rates
- System load average (1m, 5m, 15m)

</details>

<details>
<summary><b>📋 System Logs</b></summary>
<br>

- Aggregated system logs from the backend
- Docker container log streams
- FastAPI access trace logs
- Level filtering (ALL, INFO, WARN, ERROR)
- Search query filtering
- Monospace terminal log viewer

</details>

<details>
<summary><b>🛡️ Security</b></summary>
<br>

- UFW firewall rules with action, protocol, port and source
- SSH public key listing with fingerprint
- Linux user accounts with home directories and shells
- IAM-oriented inspection view

</details>

<details>
<summary><b>🔧 DevOps</b></summary>
<br>

- GitHub repository: branch, HEAD commit, ahead/behind, status
- Recent commit history
- Repository pack size
- Terraform version, workspace, state resources and outputs
- Docker Compose service definitions and state

</details>

<details>
<summary><b>🎨 UX and Design System</b></summary>
<br>

- **Dark Mode** — Deep navy palette with Electric Cyan accents
- **Light Mode** — Clean slate palette with identical token system
- Animated background particle network (dark mode)
- Light-mode aurora gradient animation
- Smooth page transitions (Framer Motion)
- Card hover lift animations
- Staggered list entry animations
- Toast notification system (success, warning, danger, info)
- Confirmation dialog system for destructive actions
- Skeleton shimmer loading states for all pages
- Sticky sortable data tables with pagination
- Responsive from 320px to 1920px

</details>

---

## ✦ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        User Browser                             │
│                    localhost:3000 / Vercel                      │
└─────────────────────────┬───────────────────────────────────────┘
                          │  React 19 SPA
                          │  Axios REST calls
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Nginx Reverse Proxy                          │
│              DuckDNS HTTPS  |  Let's Encrypt SSL               │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                FastAPI Backend  :8000                           │
│                  Azure VM  |  Docker Container                  │
│                                                                 │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │
│   │  Linux   │  │  Docker  │  │ Terraform│  │  Git CLI     │  │
│   │  psutil  │  │  SDK     │  │  CLI     │  │  GitHub API  │  │
│   └──────────┘  └──────────┘  └──────────┘  └──────────────┘  │
│                                                                 │
│   ┌──────────┐  ┌──────────┐  ┌───────────────────────────┐    │
│   │ Azure CLI│  │   UFW    │  │  SSH / IAM (/etc/passwd)  │    │
│   └──────────┘  └──────────┘  └───────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

### Deployment Flow

```
Local Development
       │
       ▼
git commit + git push
       │
       ├──► GitHub Repository
       │           │
       │           ├──► Vercel auto-builds React frontend
       │           │
       │           └──► Azure VM pulls latest backend
       │                       │
       │                       ▼
       └──────────── docker compose up -d --build
```

---

## ✦ Tech Stack

### Frontend

| Technology | Role |
|:---:|:---|
| [![React](https://img.shields.io/badge/-React%2019-61DAFB?style=flat&logo=react&logoColor=black)](https://reactjs.org) | SPA framework, component model |
| [![Framer Motion](https://img.shields.io/badge/-Framer%20Motion-0055FF?style=flat&logo=framer&logoColor=white)](https://framer.com/motion) | Page transitions and micro-animations |
| [![Recharts](https://img.shields.io/badge/-Recharts-FF6384?style=flat)](https://recharts.org) | Area charts and metric visualizations |
| [![Lucide](https://img.shields.io/badge/-Lucide%20React-000000?style=flat&logo=lucide&logoColor=white)](https://lucide.dev) | Icon system |
| [![Axios](https://img.shields.io/badge/-Axios-5A29E4?style=flat&logo=axios&logoColor=white)](https://axios-http.com) | REST API calls |
| CSS Variables | 50+ global design tokens, dark/light themes |

### Backend

| Technology | Role |
|:---:|:---|
| [![FastAPI](https://img.shields.io/badge/-FastAPI-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com) | REST API framework |
| [![Python](https://img.shields.io/badge/-Python%203.12-3776AB?style=flat&logo=python&logoColor=white)](https://python.org) | Runtime |
| psutil | System metrics (CPU, RAM, disk, net) |
| Docker SDK | Container management |
| Azure CLI | VM lifecycle management |
| Terraform CLI | IaC state and workspace |
| Git CLI | Repository metadata and operations |
| UFW | Firewall rule inspection |

### Infrastructure and DevOps

| Technology | Role |
|:---:|:---|
| [![Docker](https://img.shields.io/badge/-Docker-2496ED?style=flat&logo=docker&logoColor=white)](https://docker.com) | Container runtime |
| [![Azure](https://img.shields.io/badge/-Azure%20VM-0078D4?style=flat&logo=microsoftazure&logoColor=white)](https://azure.microsoft.com) | Cloud hosting |
| [![Nginx](https://img.shields.io/badge/-Nginx-009639?style=flat&logo=nginx&logoColor=white)](https://nginx.org) | Reverse proxy and HTTPS |
| [![Vercel](https://img.shields.io/badge/-Vercel-000000?style=flat&logo=vercel&logoColor=white)](https://vercel.com) | Frontend hosting |
| [![GitHub](https://img.shields.io/badge/-GitHub-181717?style=flat&logo=github&logoColor=white)](https://github.com) | Source control and CI delivery |
| DuckDNS | Dynamic DNS for HTTPS domain |
| Let's Encrypt | Free TLS certificate |

---

## ✦ Repository Structure

```
cloud-admin-platform/
├── backend/
│   ├── main.py              # FastAPI app — 27 endpoints
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/
│       │   ├── Layout/          # Sidebar, Navbar, Footer
│       │   ├── Toast/           # Notification system
│       │   ├── ConfirmDialog/   # Action confirmation overlays
│       │   ├── DataTable/       # Sortable, filterable, paginated tables
│       │   ├── Skeleton/        # Shimmer loading states
│       │   ├── EmptyState/      # Zero-data fallback components
│       │   └── LoadingScreen/   # Brand splash screen
│       ├── pages/
│       │   ├── Dashboard/
│       │   ├── VirtualMachines/
│       │   ├── DockerContainers/
│       │   ├── Networks/
│       │   ├── Storage/
│       │   ├── Metrics/
│       │   ├── Logs/
│       │   ├── Alerts/
│       │   ├── Firewall/
│       │   ├── SSH/
│       │   ├── IAM/
│       │   ├── Terraform/
│       │   ├── DockerCompose/
│       │   ├── GitHub/
│       │   ├── Settings/
│       │   └── Profile/
│       └── services/
│           └── api.js           # Centralized Axios service layer
├── docker-compose.yml
├── reports/
└── README.md
```

---

## ✦ Quick Start

### Prerequisites

```bash
# Required
node --version    # Node.js 18+
python --version  # Python 3.12+
docker --version  # Docker 24+
git --version

# Optional — for full cloud feature access
az --version      # Azure CLI
terraform -v      # Terraform CLI
```

### 1. Clone the Repository

```bash
git clone https://github.com/Hardrach/cloud-admin-platform.git
cd cloud-admin-platform
```

### 2. Start the Backend (local)

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Verify:

```bash
curl http://localhost:8000/health
# { "status": "ok", "platform": "...", "python": "..." }
```

### 3. Start the Frontend (local)

```bash
cd frontend
npm install
npm start
```

Open: **http://localhost:3000**

### 4. Docker Compose (full stack)

```bash
# Start everything
docker compose up -d --build

# View logs
docker compose logs -f backend

# Stop
docker compose down
```

---

## ✦ Environment Variables

Create a `.env` file inside the `frontend/` directory:

```env
# Local development
REACT_APP_API_URL=http://localhost:8000

# Azure VM production
REACT_APP_API_URL=https://cloudadminyassine.duckdns.org
```

---

## ✦ API Reference

<details>
<summary><b>🖥️ Infrastructure Endpoints</b></summary>
<br>

| Method | Endpoint | Description |
|:---:|:---|:---|
| `GET` | `/health` | Backend health check |
| `GET` | `/api/dashboard` | Full dashboard system overview |
| `GET` | `/api/vms` | Azure VM inventory and status |
| `POST` | `/api/vms/{name}/start` | Start virtual machine |
| `POST` | `/api/vms/{name}/stop` | Stop virtual machine |
| `POST` | `/api/vms/{name}/restart` | Restart virtual machine |
| `POST` | `/api/vms/{name}/deallocate` | Deallocate virtual machine |

</details>

<details>
<summary><b>🐳 Docker Endpoints</b></summary>
<br>

| Method | Endpoint | Description |
|:---:|:---|:---|
| `GET` | `/api/docker` | Container inventory |
| `GET` | `/api/docker/stats` | Live container stats |
| `POST` | `/api/docker/{name}/start` | Start container |
| `POST` | `/api/docker/{name}/stop` | Stop container |
| `POST` | `/api/docker/{name}/restart` | Restart container |
| `GET` | `/api/docker/{name}/logs` | Container log stream |

</details>

<details>
<summary><b>📊 Monitoring Endpoints</b></summary>
<br>

| Method | Endpoint | Description |
|:---:|:---|:---|
| `GET` | `/api/networks` | Network interfaces, DNS, gateway, RX/TX |
| `GET` | `/api/storage` | Disk mounts, partitions, Docker volumes |
| `GET` | `/api/metrics` | CPU, RAM, swap, disk IO, network history |
| `GET` | `/api/logs` | Aggregated system and Docker logs |
| `GET` | `/api/alerts` | Infrastructure alerts |

</details>

<details>
<summary><b>🛡️ Security Endpoints</b></summary>
<br>

| Method | Endpoint | Description |
|:---:|:---|:---|
| `GET` | `/api/firewall` | UFW firewall rules |
| `GET` | `/api/ssh-keys` | SSH public keys |
| `GET` | `/api/iam` | Linux users and IAM |

</details>

<details>
<summary><b>🔧 DevOps Endpoints</b></summary>
<br>

| Method | Endpoint | Description |
|:---:|:---|:---|
| `GET` | `/api/terraform` | Terraform metadata and resources |
| `POST` | `/api/terraform/plan` | Execute terraform plan |
| `POST` | `/api/terraform/apply` | Execute terraform apply |
| `POST` | `/api/terraform/destroy` | Execute terraform destroy |
| `GET` | `/api/docker-compose` | Compose stack metadata |
| `GET` | `/api/github` | Git repository status |
| `POST` | `/api/github/fetch` | Git fetch from remote |
| `POST` | `/api/github/pull` | Git pull from remote |
| `POST` | `/api/github/push` | Git push to remote |
| `POST` | `/api/github/commit` | Git commit with message |

</details>

---

## ✦ Production Architecture

```
Internet
    │
    ▼
DuckDNS → cloudadminyassine.duckdns.org
    │
    ▼
Azure VM (Ubuntu 24.04 LTS)
    │
    ├── Nginx (port 80/443)
    │       │   Let's Encrypt TLS
    │       └── Proxy → localhost:8000
    │
    └── Docker Compose
            ├── backend-api   (FastAPI :8000)
            └── postgres-db   (PostgreSQL :5432)

Frontend → Vercel (Edge CDN)
    REACT_APP_API_URL → https://cloudadminyassine.duckdns.org
```

---

## ✦ Security Considerations

> ⚠️ This platform exposes live infrastructure actions. Always secure before public production use.

| Area | Recommended Action |
|:---|:---|
| 🔐 Authentication | Add JWT Bearer token authentication |
| 👥 Authorization | Implement role-based access control (RBAC) |
| 🔒 CORS | Restrict to explicit frontend origin only |
| 📝 Audit | Add audit log trail for all destructive actions |
| 🔑 Secrets | Store all keys/tokens in environment variables |
| 🚦 Rate Limiting | Add request throttling on action endpoints |
| 🐳 Docker Socket | Restrict Docker socket permissions |
| 🛡️ Headers | Configure security headers via Nginx |

---

## ✦ Roadmap

```
Phase 1 — Core Platform ✅
├── [x] 27 REST API endpoints
├── [x] 16 frontend pages
├── [x] Enterprise design system (dark + light mode)
├── [x] Docker Compose deployment
├── [x] HTTPS via Nginx + DuckDNS
└── [x] Live Azure VM deployment

Phase 2 — Security Layer 🔜
├── [ ] JWT authentication
├── [ ] Role-based access control
├── [ ] Audit log trail
└── [ ] Rate limiting

Phase 3 — Real-Time 🔜
├── [ ] WebSocket live metrics
├── [ ] Prometheus metrics endpoint
└── [ ] Grafana integration

Phase 4 — Scale 🔜
├── [ ] Kubernetes support
├── [ ] Multi-VM management
├── [ ] GitHub Actions CI/CD pipeline
└── [ ] Terraform workspace manager
```

---

## ✦ Technical Report

A complete technical report is available in `reports/`:

```
reports/Cloud_Admin_Platform_Rapport_Stage_Modele_Final.docx
```

---

## ✦ Author

<div align="center">

**Yassine Rachid**

*Cloud · DevOps · Full Stack Engineering*

[![GitHub](https://img.shields.io/badge/GitHub-Hardrach-181717?style=for-the-badge&logo=github)](https://github.com/Hardrach)

</div>

---

## ✦ License

This project is released under the **MIT License** — free to use, modify and distribute.

---

![footer](https://capsule-render.vercel.app/api?type=waving&color=0:8B5CF6,100:00D4FF&height=100&section=footer&animation=fadeIn)

<div align="center">

*Built with FastAPI · React · Docker · Azure*

</div>
