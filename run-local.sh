#!/bin/bash

# Personal Expense Tracker - Local Development Setup
# This script starts only PostgreSQL and Keycloak in Docker containers
# Backend and Frontend should be run locally via IDE

set -e

echo "🚀 Starting Personal Expense Tracker - Local Development Mode"
echo "📋 This will start PostgreSQL and Keycloak in Docker containers"
echo "💻 Backend and Frontend should be run locally via your IDE"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    print_error "docker-compose is not installed. Please install docker-compose and try again."
    exit 1
fi

# Create .env.local file if it doesn't exist
if [ ! -f ".env.local" ]; then
    print_status "Creating .env.local file..."
    cat > .env.local << EOF
# Local Development Environment Variables
# These are used when running backend and frontend locally

# Database Configuration (connects to Docker PostgreSQL)
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/expense_tracker
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=password
SPRING_DATASOURCE_DRIVER_CLASS_NAME=org.postgresql.Driver

# OAuth2 Configuration (connects to Docker Keycloak)
SPRING_SECURITY_OAUTH2_CLIENT_PROVIDER_KEYCLOAK_AUTHORIZATION_URI=http://localhost:8081/realms/expense-tracker/protocol/openid-connect/auth
SPRING_SECURITY_OAUTH2_CLIENT_PROVIDER_KEYCLOAK_TOKEN_URI=http://localhost:8081/realms/expense-tracker/protocol/openid-connect/token
SPRING_SECURITY_OAUTH2_CLIENT_PROVIDER_KEYCLOAK_USER_INFO_URI=http://localhost:8081/realms/expense-tracker/protocol/openid-connect/userinfo
SPRING_SECURITY_OAUTH2_CLIENT_PROVIDER_KEYCLOAK_JWK_SET_URI=http://localhost:8081/realms/expense-tracker/protocol/openid-connect/certs

# Security Configuration
KEYCLOAK_CLIENT_SECRET=6kcwPFNSwgztS4rn3cSuK6aHWt44YkaG
ENCRYPTION_MASTER_KEY=defaultKey123456789012345678901234

# Keycloak Admin Configuration (required for session termination)
KEYCLOAK_ADMIN_USERNAME=admin
KEYCLOAK_ADMIN_PASSWORD=admin

# CORS Configuration
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8081

# Frontend Environment Variables
REACT_APP_API_BASE_URL=http://localhost:8080
REACT_APP_KEYCLOAK_URL=http://localhost:8081
REACT_APP_KEYCLOAK_REALM=expense-tracker
REACT_APP_KEYCLOAK_CLIENT_ID=expense-tracker-frontend
REACT_APP_OAUTH2_REDIRECT_URI=http://localhost:3000/auth/callback
REACT_APP_ENABLE_PII_MASKING=true
REACT_APP_SESSION_TIMEOUT=1800
REACT_APP_DEBUG=true
EOF
    print_success "Created .env.local file with default configuration"
fi

# Stop any existing containers
print_status "Stopping any existing containers..."
docker-compose -f docker-compose.local.yml down --remove-orphans 2>/dev/null || true

# Start the containers
print_status "Starting PostgreSQL and Keycloak containers..."
docker-compose -f docker-compose.local.yml up -d

# Wait for services to be healthy
print_status "Waiting for services to be ready..."

# Wait for PostgreSQL
print_status "Waiting for PostgreSQL to be ready..."
timeout=60
counter=0
while [ $counter -lt $timeout ]; do
    if docker-compose -f docker-compose.local.yml exec -T postgres pg_isready -U postgres -d expense_tracker > /dev/null 2>&1; then
        print_success "PostgreSQL is ready!"
        break
    fi
    sleep 2
    counter=$((counter + 2))
    if [ $counter -eq $timeout ]; then
        print_error "PostgreSQL failed to start within $timeout seconds"
        exit 1
    fi
done

# Wait for Keycloak
print_status "Waiting for Keycloak to be ready..."
timeout=120
counter=0
while [ $counter -lt $timeout ]; do
    if curl -f http://localhost:8081/realms/expense-tracker > /dev/null 2>&1; then
        print_success "Keycloak is ready!"
        break
    fi
    sleep 5
    counter=$((counter + 5))
    if [ $counter -eq $timeout ]; then
        print_error "Keycloak failed to start within $timeout seconds"
        exit 1
    fi
done

echo ""
print_success "🎉 Local development environment is ready!"
echo ""
echo "📊 Service Status:"
echo "  ✅ PostgreSQL: http://localhost:5432"
echo "  ✅ Keycloak Admin: http://localhost:8081/admin (admin/admin)"
echo "  ✅ Keycloak Realm: http://localhost:8081/realms/expense-tracker"
echo ""
echo "🔧 Next Steps:"
echo "  1. Run Backend (Spring Boot) from your IDE:"
echo "     - Set active profile to 'local'"
echo "     - Main class: com.expensetracker.PersonalExpenseTrackerApplication"
echo "     - Backend will be available at: http://localhost:8080"
echo ""
echo "  2. Run Frontend (React) from your IDE or terminal:"
echo "     - cd expense-tracker-frontend"
echo "     - npm start"
echo "     - Frontend will be available at: http://localhost:3000"
echo ""
echo "🔐 Test Credentials:"
echo "  - Username: demo@expensetracker.com"
echo "  - Password: DemoPassword123!"
echo ""
echo "📚 API Documentation:"
echo "  - Health Check: http://localhost:8080/actuator/health"
echo "  - API Base URL: http://localhost:8080/api"
echo "  - OAuth2 Login: http://localhost:8080/oauth2/authorization/keycloak"
echo ""
echo "🛑 To stop services:"
echo "  ./stop-local.sh"
echo "  or"
echo "  docker-compose -f docker-compose.local.yml down"
echo ""

# Display container status
print_status "Container Status:"
docker-compose -f docker-compose.local.yml ps

echo ""
echo "📋 IDE Configuration Instructions:"
echo ""
echo "📱 Backend (IntelliJ IDEA / VS Code):"
echo "  - Profile: local"
echo "  - Environment Variables: Source from .env.local"
echo "  - VM Options: -Dspring.profiles.active=local"
echo ""
echo "🎨 Frontend (VS Code / WebStorm):"
echo "  - Environment Variables: Source from .env.local"
echo "  - Start command: npm start"
echo "  - Development server: http://localhost:3000"