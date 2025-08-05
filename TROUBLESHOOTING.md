# Troubleshooting Guide

## Quick Start & Debug

### 1. Run Debug Startup Script
```bash
./scripts/debug-startup.sh
```

### 2. Manual Troubleshooting Steps

#### Step 1: Start Services Individually
```bash
# Clean up first
docker-compose -f docker-compose.dev.yml down --remove-orphans

# Start PostgreSQL first
docker-compose -f docker-compose.dev.yml up postgres
```

#### Step 2: Check Service Logs
```bash
# PostgreSQL logs
docker-compose -f docker-compose.dev.yml logs postgres

# Keycloak logs
docker-compose -f docker-compose.dev.yml logs keycloak

# Backend logs
docker-compose -f docker-compose.dev.yml logs backend

# Frontend logs
docker-compose -f docker-compose.dev.yml logs frontend
```

## Common Issues & Solutions

### 🔍 Issue: Keycloak fails to start
**Symptoms:**
- `Cannot invoke "org.keycloak.models.AuthenticationFlowModel.getId()" because "flow" is null`

**Solution:**
- ✅ **FIXED:** Updated realm-export.json to remove invalid authentication flows

### 🔍 Issue: Backend fails to connect to database
**Symptoms:**
- Connection refused errors
- Database connection timeout

**Solutions:**
1. Ensure PostgreSQL is healthy:
   ```bash
   docker-compose -f docker-compose.dev.yml exec postgres pg_isready -U postgres -d expense_tracker
   ```

2. Check database initialization:
   ```bash
   docker-compose -f docker-compose.dev.yml logs postgres
   ```

### 🔍 Issue: Frontend build fails
**Symptoms:**
- Node/npm errors during build
- Missing dependencies

**Solutions:**
1. Clear node_modules and reinstall:
   ```bash
   cd expense-tracker-frontend
   rm -rf node_modules package-lock.json
   npm install
   ```

2. Check if all source files exist:
   ```bash
   ls -la expense-tracker-frontend/src/
   ```

### 🔍 Issue: Docker build fails
**Symptoms:**
- Base image not found
- Build context errors

**Solutions:**
- ✅ **FIXED:** Updated to modern base images:
  - Backend: `eclipse-temurin:17-jre-alpine`
  - Frontend: `node:20-alpine`

### 🔍 Issue: Port conflicts
**Symptoms:**
- Port already in use errors

**Solution:**
```bash
# Check what's using the ports
lsof -i :3000  # Frontend
lsof -i :8080  # Backend
lsof -i :8081  # Keycloak
lsof -i :5432  # PostgreSQL

# Kill conflicting processes if needed
sudo kill -9 <PID>
```

### 🔍 Issue: OAuth2 authentication fails
**Symptoms:**
- Login redirects fail
- Token validation errors

**Solutions:**
1. Check Keycloak realm import:
   ```bash
   docker-compose -f docker-compose.dev.yml exec keycloak /opt/keycloak/bin/kcadm.sh get realms/expense-tracker --no-config --server http://localhost:8080 --realm master --user admin --password admin
   ```

2. Verify client configuration in Keycloak admin console:
   - Go to http://localhost:8081
   - Login: admin/admin
   - Check realm: expense-tracker
   - Verify clients: expense-tracker-backend, expense-tracker-frontend

### 🔍 Issue: CORS errors
**Symptoms:**
- Browser console shows CORS policy errors
- Frontend can't reach backend API

**Solution:**
- Check CORS configuration in docker-compose.dev.yml:
  ```yaml
  CORS_ALLOWED_ORIGINS: http://localhost:3000,http://localhost:8081
  ```

## Health Checks

### Service Health Status
```bash
# Check all services
docker-compose -f docker-compose.dev.yml ps

# Check individual service health
docker inspect expense-tracker-db --format='{{.State.Health.Status}}'
docker inspect expense-tracker-keycloak --format='{{.State.Health.Status}}'
docker inspect expense-tracker-backend --format='{{.State.Health.Status}}'
```

### Manual Health Check URLs
- Backend: http://localhost:8080/actuator/health
- Keycloak: http://localhost:8081/health/ready
- PostgreSQL: `docker-compose -f docker-compose.dev.yml exec postgres pg_isready`

## Environment Variables

### Required Environment Variables
Create `.env` file from `.env.example`:
```bash
cp .env.example .env
# Edit .env with your actual values
```

**Critical Variables:**
- `ENCRYPTION_MASTER_KEY` - Must be exactly 32 characters
- `KEYCLOAK_CLIENT_SECRET` - Should match realm configuration
- `DB_PASSWORD` - PostgreSQL password

## Reset Everything

### Complete Reset (Nuclear Option)
```bash
# Stop and remove everything
docker-compose -f docker-compose.dev.yml down --remove-orphans --volumes

# Remove all related images
docker rmi $(docker images | grep expense-tracker | awk '{print $3}')

# Remove volumes
docker volume rm $(docker volume ls | grep personalexpensetracker | awk '{print $2}')

# Start fresh
docker-compose -f docker-compose.dev.yml up --build
```

## Debug Information to Share

When asking for help, please provide:

1. **Docker Compose logs:**
   ```bash
   docker-compose -f docker-compose.dev.yml logs > debug-logs.txt
   ```

2. **Service status:**
   ```bash
   docker-compose -f docker-compose.dev.yml ps
   ```

3. **System information:**
   ```bash
   docker version
   docker-compose version
   uname -a
   ```

4. **Port usage:**
   ```bash
   netstat -tlnp | grep -E ':(3000|8080|8081|5432)'
   ```

## Success Indicators

✅ **All services should show:**
- PostgreSQL: `healthy`
- Keycloak: `healthy` 
- Backend: `healthy`
- Frontend: `running`

✅ **URLs should respond:**
- http://localhost:3000 - React app loads
- http://localhost:8080/actuator/health - Returns `{"status":"UP"}`
- http://localhost:8081 - Keycloak admin login page
- Demo login works with: demo@expensetracker.com / DemoPassword123!