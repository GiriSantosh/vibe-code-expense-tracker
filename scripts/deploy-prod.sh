#!/bin/bash

# Personal Expense Tracker - Production Deployment Script
# This script deploys the application in production mode with optimizations

set -e  # Exit on any error

echo "🚀 Starting Personal Expense Tracker Production Deployment..."

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

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker and try again."
        exit 1
    fi

    if ! docker info &> /dev/null; then
        print_error "Docker daemon is not running. Please start Docker and try again."
        exit 1
    fi

    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        print_error "Docker Compose is not available. Please install Docker Compose and try again."
        exit 1
    fi
    
    print_success "Prerequisites check passed"
}

# Validate environment configuration
validate_environment() {
    print_status "Validating environment configuration..."
    
    if [ ! -f .env ]; then
        print_error ".env file not found. Please create it from .env.example and configure all values."
        exit 1
    fi
    
    # Source environment variables
    set -a
    source .env
    set +a
    
    # Check critical environment variables
    local missing_vars=()
    
    [ -z "$ENCRYPTION_MASTER_KEY" ] && missing_vars+=("ENCRYPTION_MASTER_KEY")
    [ -z "$KEYCLOAK_CLIENT_SECRET" ] && missing_vars+=("KEYCLOAK_CLIENT_SECRET")
    [ -z "$DB_PASSWORD" ] && missing_vars+=("DB_PASSWORD")
    [ -z "$KEYCLOAK_ADMIN_PASSWORD" ] && missing_vars+=("KEYCLOAK_ADMIN_PASSWORD")
    
    if [ ${#missing_vars[@]} -ne 0 ]; then
        print_error "Missing required environment variables: ${missing_vars[*]}"
        print_error "Please configure all required variables in .env file"
        exit 1
    fi
    
    # Validate encryption key length (must be 32 characters for AES-256)
    if [ ${#ENCRYPTION_MASTER_KEY} -ne 32 ]; then
        print_error "ENCRYPTION_MASTER_KEY must be exactly 32 characters for AES-256 encryption"
        exit 1
    fi
    
    # Check for default passwords
    if [ "$DB_PASSWORD" = "password" ] || [ "$KEYCLOAK_ADMIN_PASSWORD" = "admin" ]; then
        print_warning "Default passwords detected. Consider using stronger passwords in production."
    fi
    
    print_success "Environment validation passed"
}

# Security checks
security_checks() {
    print_status "Performing security checks..."
    
    # Check if we're using HTTPS URLs in production
    if [[ "$REACT_APP_API_BASE_URL" == http://* ]] || [[ "$REACT_APP_KEYCLOAK_URL" == http://* ]]; then
        print_warning "HTTP URLs detected. Consider using HTTPS in production for better security."
    fi
    
    # Check CORS configuration
    if [[ "$CORS_ALLOWED_ORIGINS" == *"localhost"* ]]; then
        print_warning "Localhost origins detected in CORS configuration. Update for production domains."
    fi
    
    print_success "Security checks completed"
}

# Backup existing data
backup_data() {
    print_status "Creating backup of existing data..."
    
    local backup_dir="backups/$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$backup_dir"
    
    # Backup database if container exists
    if docker-compose -f docker-compose.prod.yml ps postgres &>/dev/null; then
        print_status "Backing up database..."
        docker-compose -f docker-compose.prod.yml exec -T postgres pg_dump -U postgres expense_tracker > "$backup_dir/database_backup.sql" 2>/dev/null || print_warning "Database backup failed or no existing database"
    fi
    
    # Backup environment file
    cp .env "$backup_dir/env_backup" 2>/dev/null || true
    
    print_success "Backup created in $backup_dir"
}

# Deploy production services
deploy_production() {
    print_status "Deploying production services..."
    
    # Stop existing services
    print_status "Stopping existing services..."
    docker-compose -f docker-compose.prod.yml down 2>/dev/null || true
    
    # Pull latest base images
    print_status "Pulling latest base images..."
    docker-compose -f docker-compose.prod.yml pull postgres keycloak
    
    # Build application images
    print_status "Building optimized production images..."
    docker-compose -f docker-compose.prod.yml build --no-cache
    
    # Start services with resource limits
    print_status "Starting production services..."
    docker-compose -f docker-compose.prod.yml up -d
    
    print_success "Production services deployed"
}

# Health monitoring
monitor_health() {
    print_status "Monitoring service health..."
    
    local max_attempts=60  # Increased for production
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        print_status "Health check attempt $attempt/$max_attempts..."
        
        local healthy_services=0
        local total_services=4
        
        # Check PostgreSQL
        if docker-compose -f docker-compose.prod.yml exec -T postgres pg_isready -U postgres -d expense_tracker &>/dev/null; then
            ((healthy_services++))
        fi
        
        # Check Keycloak
        if docker-compose -f docker-compose.prod.yml exec -T keycloak curl -f http://localhost:8080/health/ready &>/dev/null; then
            ((healthy_services++))
        fi
        
        # Check Backend
        if curl -f http://localhost:8080/actuator/health &>/dev/null; then
            ((healthy_services++))
        fi
        
        # Check Frontend
        if curl -f http://localhost:3000 &>/dev/null; then
            ((healthy_services++))
        fi
        
        print_status "Healthy services: $healthy_services/$total_services"
        
        if [ $healthy_services -eq $total_services ]; then
            print_success "All services are healthy"
            break
        fi
        
        if [ $attempt -eq $max_attempts ]; then
            print_error "Some services failed to become healthy"
            print_status "Service status:"
            docker-compose -f docker-compose.prod.yml ps
            print_status "Recent logs:"
            docker-compose -f docker-compose.prod.yml logs --tail=50
            exit 1
        fi
        
        sleep 15
        ((attempt++))
    done
}

# Performance optimization
optimize_performance() {
    print_status "Applying performance optimizations..."
    
    # Set Docker daemon settings for production
    print_status "Optimizing Docker settings..."
    
    # Cleanup unused Docker resources
    docker system prune -f --volumes 2>/dev/null || true
    docker image prune -f 2>/dev/null || true
    
    print_success "Performance optimizations applied"
}

# Display production information
show_production_info() {
    print_success "🎉 Production deployment completed successfully!"
    echo ""
    echo "📋 Production Service Information:"
    echo "=================================="
    echo "🌐 Frontend Application: http://localhost:3000"
    echo "🔧 Backend API: http://localhost:8080"
    echo "🔐 Keycloak Admin: http://localhost:8081"
    echo "📊 Database: localhost:5432"
    echo ""
    echo "📊 Resource Usage:"
    docker-compose -f docker-compose.prod.yml ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"
    echo ""
    echo "🔍 Health Endpoints:"
    echo "- Backend Health: http://localhost:8080/actuator/health"
    echo "- Keycloak Health: http://localhost:8081/health/ready"
    echo ""
    echo "📚 Management Commands:"
    echo "- View logs: docker-compose -f docker-compose.prod.yml logs -f [service]"
    echo "- Monitor resources: docker stats"
    echo "- Scale services: docker-compose -f docker-compose.prod.yml up -d --scale backend=2"
    echo "- Stop services: docker-compose -f docker-compose.prod.yml down"
    echo ""
    echo "🔐 Security Reminders:"
    echo "- Regularly update Docker images"
    echo "- Monitor logs for security events"
    echo "- Backup database regularly"
    echo "- Use HTTPS in production"
    echo ""
    print_warning "Monitor service logs and metrics regularly in production!"
}

# Main deployment flow
main() {
    echo "Personal Expense Tracker - Production Deployment"
    echo "================================================"
    echo ""
    
    check_prerequisites
    validate_environment
    security_checks
    backup_data
    deploy_production
    monitor_health
    optimize_performance
    show_production_info
    
    print_success "Production deployment completed successfully! 🚀"
    print_status "Application is ready for production use."
}

# Run main function
main "$@"