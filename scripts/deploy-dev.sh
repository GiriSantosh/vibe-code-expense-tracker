#!/bin/bash

# Personal Expense Tracker - Development Deployment Script
# This script sets up the complete development environment using Docker

set -e  # Exit on any error

echo "🚀 Starting Personal Expense Tracker Development Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

# Check if Docker is installed and running
check_docker() {
    print_status "Checking Docker installation..."
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker and try again."
        exit 1
    fi

    if ! docker info &> /dev/null; then
        print_error "Docker daemon is not running. Please start Docker and try again."
        exit 1
    fi

    print_success "Docker is installed and running"
}

# Check if Docker Compose is available
check_docker_compose() {
    print_status "Checking Docker Compose..."
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        print_error "Docker Compose is not available. Please install Docker Compose and try again."
        exit 1
    fi
    print_success "Docker Compose is available"
}

# Create environment file if it doesn't exist
setup_environment() {
    print_status "Setting up environment configuration..."
    
    if [ ! -f .env ]; then
        print_warning ".env file not found. Creating from template..."
        cp .env.example .env
        print_warning "Please edit .env file with your actual configuration values"
        print_warning "Especially update ENCRYPTION_MASTER_KEY and KEYCLOAK_CLIENT_SECRET"
    else
        print_success "Environment file found"
    fi
}

# Clean up existing containers and volumes
cleanup() {
    print_status "Cleaning up existing containers and volumes..."
    
    # Stop and remove containers
    docker-compose -f docker-compose.dev.yml down --remove-orphans 2>/dev/null || true
    
    # Remove dangling images
    docker image prune -f 2>/dev/null || true
    
    print_success "Cleanup completed"
}

# Build and start services
deploy() {
    print_status "Building and starting services..."
    
    # Build images
    print_status "Building Docker images..."
    docker-compose -f docker-compose.dev.yml build --no-cache
    
    # Start services
    print_status "Starting services..."
    docker-compose -f docker-compose.dev.yml up -d
    
    print_success "Services started successfully"
}

# Wait for services to be healthy
wait_for_services() {
    print_status "Waiting for services to become healthy..."
    
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        print_status "Health check attempt $attempt/$max_attempts..."
        
        # Check PostgreSQL
        if docker-compose -f docker-compose.dev.yml exec -T postgres pg_isready -U postgres -d expense_tracker &>/dev/null; then
            print_success "PostgreSQL is ready"
            break
        fi
        
        if [ $attempt -eq $max_attempts ]; then
            print_error "Services failed to become healthy within expected time"
            print_status "Checking service logs..."
            docker-compose -f docker-compose.dev.yml logs
            exit 1
        fi
        
        sleep 10
        ((attempt++))
    done
}

# Display service URLs and access information
show_access_info() {
    print_success "🎉 Deployment completed successfully!"
    echo ""
    echo "📋 Service Access Information:"
    echo "================================"
    echo "🌐 Frontend Application: http://localhost:3000"
    echo "🔧 Backend API: http://localhost:8080"
    echo "🔐 Keycloak Admin: http://localhost:8081"
    echo "📊 Database: localhost:5432"
    echo ""
    echo "🔑 Default Credentials:"
    echo "- Keycloak Admin: admin / admin"
    echo "- Demo User: demo@expensetracker.com / DemoPassword123!"
    echo "- Database: postgres / password"
    echo ""
    echo "📚 Useful Commands:"
    echo "- View logs: docker-compose -f docker-compose.dev.yml logs -f"
    echo "- Stop services: docker-compose -f docker-compose.dev.yml down"
    echo "- Restart services: docker-compose -f docker-compose.dev.yml restart"
    echo ""
    print_warning "Please change default passwords in production!"
}

# Main deployment flow
main() {
    echo "Personal Expense Tracker - Development Deployment"
    echo "=================================================="
    echo ""
    
    check_docker
    check_docker_compose
    setup_environment
    cleanup
    deploy
    wait_for_services
    show_access_info
    
    print_success "Development environment is ready! 🚀"
}

# Run main function
main "$@"