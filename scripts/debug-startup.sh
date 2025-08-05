#!/bin/bash

# Debug startup script for Personal Expense Tracker
echo "🔍 Personal Expense Tracker - Debug Startup"
echo "=========================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

echo "✅ Docker is running"

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose is not installed"
    exit 1
fi

echo "✅ docker-compose is available"

# Clean up any existing containers
echo "🧹 Cleaning up existing containers..."
docker-compose -f docker-compose.dev.yml down --remove-orphans

# Check if volumes need cleanup
echo "📦 Checking volumes..."
docker volume ls | grep personalexpensetracker

# Start services one by one for better debugging
echo "🚀 Starting PostgreSQL..."
docker-compose -f docker-compose.dev.yml up -d postgres

echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 10

echo "🔐 Starting Keycloak..."
docker-compose -f docker-compose.dev.yml up -d keycloak

echo "⏳ Waiting for Keycloak to be ready..."
sleep 20

echo "🔨 Starting Backend..."
docker-compose -f docker-compose.dev.yml up -d backend

echo "⏳ Waiting for Backend to be ready..."
sleep 15

echo "🎨 Starting Frontend..."
docker-compose -f docker-compose.dev.yml up -d frontend

echo "📊 Service Status:"
docker-compose -f docker-compose.dev.yml ps

echo ""
echo "📋 View logs with:"
echo "  docker-compose -f docker-compose.dev.yml logs [service_name]"
echo ""
echo "🌐 Access URLs:"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:8080"
echo "  Keycloak: http://localhost:8081"
echo ""
echo "👤 Demo credentials:"
echo "  Username: demo@expensetracker.com"
echo "  Password: DemoPassword123!"