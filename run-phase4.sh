#!/bin/bash

# Phase 4 - Custom Authentication UI Quick Start Script

set -e

echo "🚀 Personal Expense Tracker - Phase 4 Setup"
echo "=========================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running. Please start Docker Desktop and try again."
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Error: docker-compose not found. Please install Docker Compose."
    exit 1
fi

echo "✅ Docker is running"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
# Phase 4 Environment Configuration
DB_PASSWORD=postgres123
KEYCLOAK_ADMIN_USERNAME=admin
KEYCLOAK_ADMIN_PASSWORD=admin123
KEYCLOAK_CLIENT_SECRET=your-keycloak-client-secret-here
ENCRYPTION_MASTER_KEY=your-32-character-encryption-key-12345
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8081
KEYCLOAK_EXTERNAL_URL=http://localhost:8081
EOF
    echo "✅ Created .env file with default values"
else
    echo "✅ Using existing .env file"
fi

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose.dev.yml down > /dev/null 2>&1 || true

# Build images
echo "🔨 Building Docker images (this may take a few minutes)..."
if docker-compose -f docker-compose.dev.yml build --no-cache; then
    echo "✅ Docker images built successfully"
else
    echo "❌ Error: Failed to build Docker images"
    exit 1
fi

# Start services
echo "🚀 Starting services..."
if docker-compose -f docker-compose.dev.yml up -d; then
    echo "✅ All services started successfully"
else
    echo "❌ Error: Failed to start services"
    exit 1
fi

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check service health
echo "🔍 Checking service health..."

# Check PostgreSQL
if docker-compose -f docker-compose.dev.yml exec -T postgres pg_isready -U postgres > /dev/null 2>&1; then
    echo "✅ PostgreSQL is ready"
else
    echo "⚠️  PostgreSQL not ready yet (will start automatically)"
fi

# Check backend health
if curl -f http://localhost:8080/actuator/health > /dev/null 2>&1; then
    echo "✅ Backend is ready"
else
    echo "⏳ Backend starting up (may take up to 2 minutes)..."
fi

# Check frontend
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend is ready"
else
    echo "⏳ Frontend starting up..."
fi

echo ""
echo "🎉 Phase 4 Setup Complete!"
echo "========================="
echo ""
echo "🌐 Application URLs:"
echo "   • Frontend (Material-UI): http://localhost:3000"
echo "   • Login Page:             http://localhost:3000/login"
echo "   • Signup Page:            http://localhost:3000/signup"
echo "   • Backend API:            http://localhost:8080"
echo "   • Keycloak Admin:         http://localhost:8081/admin"
echo ""
echo "👤 Test Credentials:"
echo "   • Demo User: demo@expensetracker.com / DemoPassword123!"
echo "   • Keycloak Admin: admin / admin123"
echo ""
echo "🔧 Useful Commands:"
echo "   • View logs:     docker-compose -f docker-compose.dev.yml logs -f"
echo "   • Stop services: docker-compose -f docker-compose.dev.yml down"
echo "   • Restart:       docker-compose -f docker-compose.dev.yml restart"
echo ""
echo "📖 For detailed setup instructions, see PHASE4_DOCKER_SETUP.md"
echo ""

# Show running containers
echo "📦 Running containers:"
docker-compose -f docker-compose.dev.yml ps

echo ""
echo "✨ Ready to test Phase 4 Custom Authentication!"
echo "   Try creating a new account at http://localhost:3000/signup"