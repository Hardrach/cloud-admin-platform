FROM python:3.12-slim-bookworm

WORKDIR /app

# Dépendances système
RUN apt-get update && apt-get install -y \
    curl \
    ca-certificates \
    apt-transport-https \
    gnupg \
    git \
    docker.io

# Azure CLI
RUN mkdir -p /etc/apt/keyrings

RUN curl -sLS https://packages.microsoft.com/keys/microsoft.asc \
    | gpg --dearmor \
    -o /etc/apt/keyrings/microsoft.gpg

RUN chmod go+r /etc/apt/keyrings/microsoft.gpg

RUN echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/microsoft.gpg] https://packages.microsoft.com/repos/azure-cli/ $(. /etc/os-release && echo $VERSION_CODENAME) main" \
> /etc/apt/sources.list.d/azure-cli.list

RUN apt-get update && apt-get install -y azure-cli

# Docker Compose Plugin
RUN mkdir -p /usr/local/lib/docker/cli-plugins

RUN curl -SL https://github.com/docker/compose/releases/download/v2.39.1/docker-compose-linux-x86_64 \
    -o /usr/local/lib/docker/cli-plugins/docker-compose

RUN chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY main.py .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
