#!/bin/bash

# Personal Expense Tracker - Stop Local Development Services

echo "🛑 Stopping Personal Expense Tracker - Local Development Services"
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

# Stop Docker containers
print_status "Stopping Docker containers (PostgreSQL and Keycloak)..."
docker-compose -f docker-compose.local.yml down

# Remove volumes if requested
read -p "Do you want to remove database volumes? (y/N): " remove_volumes
if [[ $remove_volumes =~ ^[Yy]$ ]]; then
    print_status "Removing volumes..."
    docker-compose -f docker-compose.local.yml down -v
    print_warning "Database data has been removed. You'll start with a fresh database next time."
else
    print_status "Database volumes preserved."
fi

# Clean up any remaining containers
print_status "Cleaning up any orphaned containers..."
docker-compose -f docker-compose.local.yml down --remove-orphans

print_success "🎉 Local development services stopped!"
print_status "Backend and Frontend (if running locally) need to be stopped manually from your IDE."