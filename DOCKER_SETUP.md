# Docker Setup Guide - Personal Expense Tracker

This guide provides comprehensive instructions for setting up and deploying the Personal Expense Tracker application using Docker containers.

## 🏗️ Architecture Overview

The application consists of four main services:
- **PostgreSQL Database**: Persistent data storage with encrypted PII
- **Keycloak**: OAuth2 authentication and user management
- **Spring Boot Backend**: REST API with security and encryption
- **React Frontend**: User interface with OAuth2 integration

## 📋 Prerequisites

- **Docker**: Version 20.10 or higher
- **Docker Compose**: Version 2.0 or higher
- **Git**: For cloning the repository
- **8GB RAM**: Minimum for running all services
- **10GB Disk Space**: For images and data volumes

### Installation Links
- [Docker Desktop](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## 🚀 Quick Start (Development)

### 1. Clone and Setup
```bash
git clone https://github.com/your-repo/expense-tracker
cd expense-tracker

# Copy environment template
cp .env.example .env

# Edit environment variables (see Configuration section)
nano .env
```

### 2. Deploy Development Environment
```bash
# Make script executable
chmod +x scripts/deploy-dev.sh

# Run deployment script
./scripts/deploy-dev.sh
```

### 3. Access Services
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **Keycloak Admin**: http://localhost:8081
- **Database**: localhost:5432

### 4. Default Credentials
- **Keycloak Admin**: admin / admin
- **Demo User**: demo@expensetracker.com / DemoPassword123!
- **Database**: postgres / password

## 🏭 Production Deployment

### 1. Environment Configuration
```bash
# Copy and configure production environment
cp .env.example .env

# Update with production values
ENCRYPTION_MASTER_KEY=your-secure-32-character-key  # CRITICAL!
KEYCLOAK_CLIENT_SECRET=your-secure-client-secret
DB_PASSWORD=your-secure-database-password
KEYCLOAK_ADMIN_PASSWORD=your-secure-admin-password

# Production URLs
REACT_APP_API_BASE_URL=https://api.yourdomain.com
REACT_APP_KEYCLOAK_URL=https://auth.yourdomain.com
CORS_ALLOWED_ORIGINS=https://yourdomain.com
```

### 2. Deploy Production
```bash
# Make script executable
chmod +x scripts/deploy-prod.sh

# Run production deployment
./scripts/deploy-prod.sh
```

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `DB_USERNAME` | Database username | postgres | Yes |
| `DB_PASSWORD` | Database password | your-secure-password | Yes |
| `KEYCLOAK_ADMIN_USER` | Keycloak admin username | admin | Yes |
| `KEYCLOAK_ADMIN_PASSWORD` | Keycloak admin password | your-secure-password | Yes |
| `KEYCLOAK_CLIENT_SECRET` | OAuth2 client secret | your-client-secret | Yes |
| `ENCRYPTION_MASTER_KEY` | AES-256 encryption key (32 chars) | your-256-bit-key | Yes |
| `CORS_ALLOWED_ORIGINS` | Allowed CORS origins | https://yourdomain.com | Yes |
| `REACT_APP_API_BASE_URL` | Backend API URL | https://api.yourdomain.com | Yes |
| `REACT_APP_KEYCLOAK_URL` | Keycloak server URL | https://auth.yourdomain.com | Yes |

### Security Configuration

#### Encryption Key Generation
```bash
# Generate secure 32-character key for AES-256
openssl rand -base64 32 | head -c 32

# Alternative method
head /dev/urandom | tr -dc A-Za-z0-9 | head -c 32
```

#### Client Secret Generation
```bash
# Generate secure client secret
openssl rand -hex 32
```

## 🛠️ Manual Docker Commands

### Development Environment

```bash
# Start all services
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop all services
docker-compose -f docker-compose.dev.yml down

# Rebuild specific service
docker-compose -f docker-compose.dev.yml up -d --build backend

# Execute command in running container
docker-compose -f docker-compose.dev.yml exec backend bash
```

### Production Environment

```bash
# Start all services
docker-compose -f docker-compose.prod.yml up -d

# Scale backend service
docker-compose -f docker-compose.prod.yml up -d --scale backend=3

# Monitor resource usage
docker stats

# View service status
docker-compose -f docker-compose.prod.yml ps
```

### Individual Service Management

```bash
# Database operations
docker-compose -f docker-compose.dev.yml exec postgres psql -U postgres -d expense_tracker

# Keycloak administration
docker-compose -f docker-compose.dev.yml exec keycloak /opt/keycloak/bin/kc.sh --help

# Backend application logs
docker-compose -f docker-compose.dev.yml logs -f backend

# Frontend development
docker-compose -f docker-compose.dev.yml exec frontend npm run build
```

## 🔍 Health Monitoring

### Health Check Endpoints

| Service | Endpoint | Description |
|---------|----------|-------------|
| Backend | http://localhost:8080/actuator/health | Spring Boot health |
| Keycloak | http://localhost:8081/health/ready | Keycloak readiness |
| Frontend | http://localhost:3000 | React application |
| Database | Internal health checks | PostgreSQL status |

### Monitoring Commands

```bash
# Check all service health
docker-compose -f docker-compose.dev.yml ps

# View service logs
docker-compose -f docker-compose.dev.yml logs --tail=100 -f [service_name]

# Monitor resource usage
docker stats --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}"

# Check disk usage
docker system df
```

## 🗄️ Data Management

### Database Backup

```bash
# Create backup
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U postgres expense_tracker > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore backup
docker-compose -f docker-compose.prod.yml exec -T postgres psql -U postgres expense_tracker < backup_file.sql
```

### Volume Management

```bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect expense_tracker_postgres_data

# Backup volume data
docker run --rm -v expense_tracker_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_backup.tar.gz -C /data .

# Restore volume data
docker run --rm -v expense_tracker_postgres_data:/data -v $(pwd):/backup alpine tar xzf /backup/postgres_backup.tar.gz -C /data
```

### Keycloak Configuration Backup

```bash
# Export realm configuration
docker-compose -f docker-compose.dev.yml exec keycloak /opt/keycloak/bin/kc.sh export --realm expense-tracker --file /tmp/realm-export.json

# Copy exported file
docker-compose -f docker-compose.dev.yml cp keycloak:/tmp/realm-export.json ./realm-backup.json
```

## 🧪 Testing

### Service Testing

```bash
# Test backend health
curl http://localhost:8080/actuator/health

# Test frontend
curl http://localhost:3000

# Test Keycloak
curl http://localhost:8081/realms/expense-tracker

# Test database connection
docker-compose -f docker-compose.dev.yml exec postgres psql -U postgres -d expense_tracker -c "SELECT version();"
```

### Load Testing

```bash
# Install Apache Bench
sudo apt-get install apache2-utils

# Test backend endpoint
ab -n 1000 -c 10 http://localhost:8080/api/expenses

# Test frontend
ab -n 100 -c 5 http://localhost:3000/
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Port Conflicts
```bash
# Check which process is using a port
sudo lsof -i :8080

# Kill process using port
sudo kill -9 $(sudo lsof -t -i:8080)
```

#### 2. Memory Issues
```bash
# Check Docker memory usage
docker system df

# Clean up unused resources
docker system prune -a

# Restart Docker daemon
sudo systemctl restart docker
```

#### 3. Database Connection Issues
```bash
# Check PostgreSQL logs
docker-compose -f docker-compose.dev.yml logs postgres

# Test database connectivity
docker-compose -f docker-compose.dev.yml exec postgres pg_isready -U postgres
```

#### 4. Keycloak Startup Issues
```bash
# Check Keycloak logs
docker-compose -f docker-compose.dev.yml logs keycloak

# Restart Keycloak
docker-compose -f docker-compose.dev.yml restart keycloak
```

### Performance Optimization

#### 1. Resource Limits
```yaml
# Add to docker-compose.yml
deploy:
  resources:
    limits:
      cpus: '2.0'
      memory: 2G
    reservations:
      cpus: '1.0'
      memory: 1G
```

#### 2. Image Optimization
```bash
# Multi-stage build optimization
docker build --target production .

# Remove unused layers
docker image prune -f
```

### Security Hardening

#### 1. Network Security
```bash
# Create custom network
docker network create expense-tracker-secure

# Use custom network in compose
networks:
  default:
    external:
      name: expense-tracker-secure
```

#### 2. Secret Management
```bash
# Use Docker secrets
echo "my-secret" | docker secret create db_password -

# Reference in compose
secrets:
  - db_password
```

## 📊 Monitoring and Logs

### Log Collection

```bash
# Centralized logging
docker-compose -f docker-compose.dev.yml logs -f > app_logs_$(date +%Y%m%d).log

# Service-specific logs
docker-compose -f docker-compose.dev.yml logs -f backend
docker-compose -f docker-compose.dev.yml logs -f frontend
docker-compose -f docker-compose.dev.yml logs -f keycloak
docker-compose -f docker-compose.dev.yml logs -f postgres
```

### Metrics Collection

```bash
# Export metrics
curl http://localhost:8080/actuator/metrics

# Prometheus metrics (if enabled)
curl http://localhost:8080/actuator/prometheus
```

## 🔄 Updates and Maintenance

### Application Updates

```bash
# Pull latest changes
git pull origin main

# Rebuild and redeploy
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d
```

### Base Image Updates

```bash
# Pull latest base images
docker-compose -f docker-compose.prod.yml pull

# Update and restart
docker-compose -f docker-compose.prod.yml up -d
```

### Maintenance Tasks

```bash
# Weekly maintenance script
#!/bin/bash
docker system prune -f
docker volume prune -f
docker image prune -a -f
docker-compose -f docker-compose.prod.yml restart
```

## 📞 Support

For issues related to Docker deployment:

1. Check service logs: `docker-compose logs [service]`
2. Verify environment configuration
3. Ensure all required ports are available
4. Check Docker daemon status
5. Review this documentation for troubleshooting steps

For application-specific issues, refer to the main README.md file.