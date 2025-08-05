# Local Development Setup

This guide explains how to run the Personal Expense Tracker application locally using your IDE while keeping PostgreSQL and Keycloak in Docker containers.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   PostgreSQL    │
│   (React)       │    │  (Spring Boot)  │    │   (Docker)      │
│  localhost:3000 │◄──►│ localhost:8080  │◄──►│ localhost:5432  │
│     (IDE)       │    │     (IDE)       │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │    Keycloak     │
                       │    (Docker)     │
                       │ localhost:8081  │
                       └─────────────────┘
```

## 🚀 Quick Start

### 1. Start Infrastructure Services

```bash
# Start PostgreSQL and Keycloak in Docker
./run-local.sh
```

This script will:
- Start PostgreSQL and Keycloak containers
- Create `.env.local` files with proper configuration
- Wait for services to be healthy
- Display configuration instructions

### 2. Run Backend (Spring Boot)

#### IntelliJ IDEA
1. Open the `expense-tracker` project
2. Set active profile to `local`:
   - Run Configuration → Environment Variables → `SPRING_PROFILES_ACTIVE=local`
   - Or VM Options: `-Dspring.profiles.active=local`
3. Run `com.expensetracker.PersonalExpenseTrackerApplication`

#### VS Code
1. Open the `expense-tracker` folder
2. Create `.vscode/launch.json`:
```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "type": "java",
            "name": "Launch PersonalExpenseTrackerApplication",
            "request": "launch",
            "mainClass": "com.expensetracker.PersonalExpenseTrackerApplication",
            "projectName": "expense-tracker",
            "env": {
                "SPRING_PROFILES_ACTIVE": "local"
            }
        }
    ]
}
```

#### Command Line
```bash
cd expense-tracker
./gradlew bootRun --args="--spring.profiles.active=local"
```

### 3. Run Frontend (React)

#### VS Code / WebStorm
1. Open `expense-tracker-frontend` folder
2. Install dependencies:
```bash
npm install
```
3. Start development server:
```bash
npm start
```

#### Command Line
```bash
cd expense-tracker-frontend
npm install
npm start
```

## 🔧 Configuration Details

### Environment Variables

The `.env.local` files contain all necessary configuration:

**Backend Configuration:**
- Database: PostgreSQL on localhost:5432
- Keycloak: localhost:8081
- Client Secret: Pre-configured
- CORS: Allows localhost:3000 and localhost:8081

**Frontend Configuration:**
- API Base URL: http://localhost:8080
- Keycloak URL: http://localhost:8081
- OAuth2 Redirect: http://localhost:3000/auth/callback

### Service URLs

| Service | URL | Credentials |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | - |
| Backend API | http://localhost:8080/api | OAuth2 |
| Backend Health | http://localhost:8080/actuator/health | Public |
| Keycloak Admin | http://localhost:8081/admin | admin/admin |
| Keycloak Realm | http://localhost:8081/realms/expense-tracker | - |
| PostgreSQL | localhost:5432 | postgres/password |

### Test User Credentials

- **Username:** demo@expensetracker.com
- **Password:** DemoPassword123!

## 🧪 Testing the Setup

1. **Backend Health Check:**
```bash
curl http://localhost:8080/actuator/health
```

2. **Authentication Flow:**
   - Visit http://localhost:3000
   - Should redirect to Keycloak login
   - Use demo credentials above
   - Should redirect back to application

3. **API Test:**
```bash
# After authentication, test API endpoints
curl http://localhost:8080/api/me
curl http://localhost:8080/api/expenses
```

## 🛑 Stopping Services

```bash
# Stop Docker containers only
./stop-local.sh

# Or manually
docker-compose -f docker-compose.local.yml down
```

Note: Backend and Frontend running in IDE need to be stopped manually.

## 🔍 Troubleshooting

### Common Issues

1. **OAuth2 endpoint returns 404 (Resource not found):**
   - **Issue:** The main `SecurityConfig` excludes the `local` profile with `@Profile("!local")`
   - **Fix:** We've created `LocalSecurityConfig` specifically for local development
   - **Verify:** Restart backend with `local` profile, check logs for "LocalSecurityConfig" activation

2. **Backend fails to connect to PostgreSQL:**
   - Ensure PostgreSQL container is running: `docker ps`
   - Check port 5432 is not used by another service
   - Verify connection: `telnet localhost 5432`

3. **OAuth2 authentication fails:**
   - Check Keycloak is accessible: `curl http://localhost:8081/realms/expense-tracker`
   - Verify client secret matches in both Keycloak and application
   - Check CORS configuration

4. **Frontend can't reach backend:**
   - Verify backend is running on port 8080
   - Check CORS configuration in backend
   - Ensure frontend .env.local has correct API_BASE_URL

5. **Debug OAuth2 Configuration:**
   - Visit: `http://localhost:8080/debug/oauth2-config`
   - This shows the loaded OAuth2 client configuration

### Logs and Debugging

**Backend Logs:** Enable debug logging in `application-local.properties`
```properties
logging.level.com.expensetracker=DEBUG
logging.level.org.springframework.security.oauth2=DEBUG
```

**Frontend Logs:** Check browser console and network tab

**Container Logs:**
```bash
# PostgreSQL logs
docker logs expense-tracker-db-local

# Keycloak logs
docker logs expense-tracker-keycloak-local
```

## 📚 Development Workflow

1. **Database Changes:**
   - Schema changes are auto-applied via `hibernate.ddl-auto=update`
   - For clean database: `./stop-local.sh` → Remove volumes → `./run-local.sh`

2. **Configuration Changes:**
   - Backend: Restart Spring Boot application
   - Frontend: Restart `npm start`
   - Keycloak: Restart containers if realm changes needed

3. **Testing:**
   - Backend: `./gradlew test`
   - Frontend: `npm test`
   - Integration: Use Postman collection provided

## 🔐 Security Notes

- Client secrets are included for local development only
- Database runs with default credentials for development
- OAuth2 is fully functional with encryption
- PII data is encrypted using AES-256-GCM

## 📖 API Documentation

Once backend is running, API endpoints are available at:
- Base URL: http://localhost:8080/api
- Health: http://localhost:8080/actuator/health
- OAuth2 Login: http://localhost:8080/oauth2/authorization/keycloak

Use the provided Postman collection for comprehensive API testing.

---

For full Docker deployment, use `docker-compose -f docker-compose.dev.yml up` instead.