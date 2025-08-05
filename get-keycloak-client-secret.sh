#!/bin/bash

echo "🔍 Getting Keycloak client secret..."

# Get admin access token
echo "Getting admin token..."
ADMIN_TOKEN=$(curl -s -X POST "http://localhost:8081/realms/master/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password" \
  -d "client_id=admin-cli" \
  -d "username=admin" \
  -d "password=admin" | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

if [ -z "$ADMIN_TOKEN" ]; then
  echo "❌ Failed to get admin token"
  exit 1
fi

echo "✅ Got admin token"

# Get client list
echo "Getting client information..."
curl -s -X GET "http://localhost:8081/admin/realms/expense-tracker/clients" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" | \
  jq -r '.[] | select(.clientId=="expense-tracker-backend") | {id: .id, clientId: .clientId, secret: .secret}'