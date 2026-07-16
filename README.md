# CloudAdmin

<p align="center">
  <strong>Modern Cloud Administration Platform for Azure, Docker, Linux, Terraform, Git and DevOps Monitoring</strong>
</p>

<p align="center">
  <img alt="React" src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=0B1220">
  <img alt="FastAPI" src="https://img.shields.io/badge/FastAPI-Python-009688?style=for-the-badge&logo=fastapi&logoColor=white">
  <img alt="Docker" src="https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white">
  <img alt="Azure" src="https://img.shields.io/badge/Microsoft-Azure-0078D4?style=for-the-badge&logo=microsoftazure&logoColor=white">
  <img alt="Terraform" src="https://img.shields.io/badge/Terraform-IaC-844FBA?style=for-the-badge&logo=terraform&logoColor=white">
</p>

<p align="center">
  <a href="#overview">Overview</a> |
  <a href="#features">Features</a> |
  <a href="#architecture">Architecture</a> |
  <a href="#quick-start">Quick Start</a> |
  <a href="#api-reference">API</a> |
  <a href="#roadmap">Roadmap</a>
</p>

---

## Overview

**CloudAdmin** is a full-stack DevOps and Cloud Administration dashboard designed to supervise and operate a real infrastructure from a modern web interface.

The platform connects a polished **React SaaS frontend** to a **FastAPI backend** that reads live data from Linux, Docker, Git, Terraform, Azure CLI, UFW, SSH and system metrics.

It was built as a **Final Year Project / DevOps portfolio project** and demonstrates practical skills across:

- Cloud infrastructure administration
- Linux and Docker monitoring
- REST API design
- React dashboard engineering
- DevOps deployment workflows
- Azure VM hosting
- Nginx reverse proxy and HTTPS
- GitHub-based delivery

> The core operational pages are API-driven. The platform avoids static business data for infrastructure monitoring and uses real system sources wherever possible.

---

## Project Highlights

| Area | What CloudAdmin Provides |
|---|---|
| Infrastructure | Azure VM status, region, IP addresses and lifecycle actions |
| Containers | Docker inventory, status, ports, logs and start/stop/restart actions |
| Monitoring | CPU, memory, disk, swap, load average, disk IO and network history |
| Security | UFW firewall rules, SSH keys and Linux IAM users |
| DevOps | Git status, repository metadata, Terraform state and Docker Compose |
| UX | Dark mode, light mode, automatic day/night theme and micro-interactions |
| Deployment | Docker Compose backend, Vercel frontend, Nginx, DuckDNS and HTTPS |

---

## Features

### Dashboard

- Host CPU, memory and disk usage
- Docker container health
- API and database status
- Hostname, kernel and uptime
- Docker, Terraform and Git metadata
- Animated resource panels and SaaS-style interface

### Virtual Machines

- Azure VM inventory
- VM status and region
- Public/private IP display
- Start, stop, restart and deallocate actions

### Docker Containers

- Real Docker container inventory
- Image, status, ports, network and volume metadata
- Container logs
- Start, stop and restart buttons connected to backend API
- Docker engine version and image size

### Networks

- Host interfaces
- IP addresses
- MAC addresses
- MTU and link status
- DNS servers
- Default gateway
- RX/TX traffic counters

### Storage

- Disk capacity
- Used/free storage
- Docker volumes
- Root mount utilization

### Metrics

- CPU and memory history
- Swap usage
- Disk IO
- Network upload/download
- Load average

### Logs

- Docker logs
- System logs
- FastAPI access traces
- Level filtering and search

### Security

- Firewall/UFW rules
- SSH public keys
- Linux users, home directories and shells
- IAM-oriented inspection view

### DevOps

- GitHub repository status
- Current branch
- Ahead/behind status
- Commit history
- Repository size
- Terraform version, files, workspace, resources and outputs
- Docker Compose stack metadata

### User Experience

- Persistent theme preference per browser/user
- Automatic light/dark mode based on device preference and local time
- First-access theme prompt
- Animated background in dark and light mode
- Smooth page transitions
- Hover micro-interactions
- Toast notifications
- Confirm dialogs
- Skeleton loading states

---

## Architecture

```text
User Browser
    |
    | React SPA
    v
Frontend / Vercel
    |
    | Axios REST calls
    v
Nginx Reverse Proxy / HTTPS
    |
    v
FastAPI Backend on Azure VM
    |
    +--> Linux / psutil
    +--> Docker SDK / Docker CLI
    +--> Terraform CLI
    +--> Git CLI
    +--> Azure CLI
    +--> UFW Firewall
    +--> SSH / IAM files
```

### Deployment Flow

```text
Local Development
    |
    v
Git Commit + Push
    |
    +--> GitHub Repository
             |
             +--> Vercel builds frontend
             |
             +--> Azure VM pulls backend changes
                         |
                         v
                  docker compose up -d --build
                         |
                         v
                  FastAPI + PostgreSQL + Docker Socket
```

---

## Technology Stack

### Frontend

- React 19
- Axios
- Bootstrap Grid
- Framer Motion
- Lucide React
- React Icons
- Recharts
- CSS variables
- Responsive SaaS design system

### Backend

- Python
- FastAPI
- Pydantic
- psutil
- Docker SDK
- subprocess
- shutil
- Git CLI
- Terraform CLI
- Azure CLI
- UFW CLI

### DevOps and Infrastructure

- Docker
- Docker Compose
- PostgreSQL
- Microsoft Azure VM
- Ubuntu/Linux
- Nginx
- Let's Encrypt
- DuckDNS
- Vercel
- GitHub

---

## Repository Structure

```text
cloud-admin-platform/
|-- backend/
|   |-- main.py
|   |-- requirements.txt
|   `-- Dockerfile
|-- frontend/
|   |-- public/
|   |-- src/
|   |   |-- components/
|   |   |-- pages/
|   |   `-- services/
|   |-- package.json
|   `-- package-lock.json
|-- infrastructure/
|   `-- terraform/
|-- docker-compose.yml
|-- reports/
`-- README.md
```

---

## Quick Start

### Prerequisites

Install:

- Node.js
- Python 3.12+
- Docker Desktop or Docker Engine
- Docker Compose
- Git

Optional for full cloud features:

- Azure CLI
- Terraform CLI
- Nginx
- Certbot

---

## Local Development

### 1. Clone the repository

```bash
git clone https://github.com/Hardrach/cloud-admin-platform.git
cd cloud-admin-platform
```

### 2. Start the backend locally

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend health check:

```bash
curl http://localhost:8000/health
```

### 3. Start the frontend locally

```bash
cd frontend
npm install
npm start
```

Frontend URL:

```text
http://localhost:3000
```

---

## Docker Deployment

Run the complete backend stack:

```bash
docker compose up -d --build
```

Check containers:

```bash
docker compose ps
```

Follow backend logs:

```bash
docker compose logs -f backend
```

Stop the stack:

```bash
docker compose down
```

Rebuild from scratch:

```bash
docker compose down
docker compose up -d --build
```

---

## Environment Variables

The frontend reads the backend URL from:

```text
REACT_APP_API_URL
```

Example for local development:

```env
REACT_APP_API_URL=http://localhost:8000
```

Example for production:

```env
REACT_APP_API_URL=https://cloudadminyassine.duckdns.org
```

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Backend health check |
| GET | `/api/dashboard` | Dashboard system overview |
| GET | `/api/vms` | Azure VM inventory |
| POST | `/api/vms/{name}/start` | Start VM |
| POST | `/api/vms/{name}/stop` | Stop VM |
| POST | `/api/vms/{name}/restart` | Restart VM |
| POST | `/api/vms/{name}/deallocate` | Deallocate VM |
| GET | `/api/docker` | Docker container inventory |
| GET | `/api/docker/stats` | Docker container stats |
| POST | `/api/docker/{container}/start` | Start container |
| POST | `/api/docker/{container}/stop` | Stop container |
| POST | `/api/docker/{container}/restart` | Restart container |
| GET | `/api/docker/{container}/logs` | Container logs |
| GET | `/api/networks` | Network interfaces and traffic |
| GET | `/api/storage` | Disk and Docker volume metrics |
| GET | `/api/metrics` | CPU, RAM, disk, swap and network metrics |
| GET | `/api/logs` | Aggregated system and Docker logs |
| GET | `/api/alerts` | System and infrastructure alerts |
| GET | `/api/firewall` | UFW firewall rules |
| GET | `/api/ssh-keys` | SSH public keys |
| GET | `/api/iam` | Linux users |
| GET | `/api/terraform` | Terraform metadata and state |
| POST | `/api/terraform/plan` | Run Terraform plan |
| POST | `/api/terraform/apply` | Run Terraform apply |
| POST | `/api/terraform/destroy` | Run Terraform destroy |
| GET | `/api/docker-compose` | Docker Compose stack metadata |
| GET | `/api/github` | Git repository status |
| POST | `/api/github/fetch` | Git fetch |
| POST | `/api/github/pull` | Git pull |
| POST | `/api/github/push` | Git push |
| POST | `/api/github/commit` | Git commit |

---

## UI and Theme System

CloudAdmin includes a polished interface designed for a SaaS-style administration product.

### Theme Modes

- **Dark Mode**
- **Light Mode**
- **Automatic Mode**

Automatic mode:

- Uses the user's system preference
- Switches to dark mode at night
- Switches to light mode during the day
- Saves the selected preference in `localStorage`

### UX Enhancements

- Animated background
- Light-mode aurora animation
- Smooth page transitions
- Hover glow effects
- Toast notifications
- Loading skeletons
- Confirmation dialogs
- Responsive layout

---

## Production Architecture Notes

### Backend

The backend is intended to run on an Azure VM through Docker Compose.

```text
Azure VM
`-- Docker Compose
    |-- backend-api
    `-- postgres-db
```

### HTTPS

Recommended production path:

```text
DuckDNS Domain
    |
    v
Nginx Reverse Proxy
    |
    v
FastAPI Backend :8000
```

### Frontend

The frontend can be deployed on Vercel and configured with:

```env
REACT_APP_API_URL=https://your-domain.duckdns.org
```

---

## Security Considerations

This platform exposes infrastructure actions and should be protected before public production use.

Recommended next security steps:

- Add JWT authentication
- Add role-based access control
- Protect destructive actions
- Add audit logs
- Move secrets to environment variables
- Add rate limiting
- Restrict Docker socket exposure
- Add HTTPS-only CORS policy

---

## Roadmap

- [ ] JWT authentication
- [ ] Role-based access control
- [ ] WebSocket real-time metrics
- [ ] Prometheus integration
- [ ] Grafana dashboards
- [ ] Kubernetes support
- [ ] GitHub Actions CI/CD
- [ ] Advanced alerting
- [ ] Audit logs
- [ ] Multi-VM management
- [ ] Terraform workspace manager
- [ ] Three.js or GSAP-powered dashboard effects

---

## Technical Report

A complete Word technical report is available in:

```text
reports/Cloud_Admin_Platform_Rapport_Stage_Modele_Final.docx
```

It includes:

- Professional cover page
- Table of contents
- Architecture diagrams
- API tables
- Technology tables
- Screenshots
- Code blocks
- Conclusion and future improvements

---

## Author

**Yassine Rachid**

Cloud / DevOps / Full Stack Engineering Portfolio Project

---

## License

This project is released under the MIT License.
