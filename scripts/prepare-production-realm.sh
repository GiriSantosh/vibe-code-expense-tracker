#!/bin/bash

# Script to prepare production Keycloak realm export with actual environment variables
# This script replaces placeholder values in realm-export.json with actual production values

set -e

# Check if required environment variables are set
check_env_var() {
    local var_name="$1"
    if [[ -z "${!var_name}" ]]; then
        echo "ERROR: Environment variable '$var_name' is required but not set"
        exit 1
    fi
}

echo "🔐 KEYCLOAK REALM PRODUCTION PREPARATION"
echo "======================================="

# Check all required environment variables
echo "🔍 Checking required environment variables..."
check_env_var "KEYCLOAK_CLIENT_SECRET"
check_env_var "FRONTEND_CLIENT_SECRET"
check_env_var "REACT_APP_API_BASE_URL"
check_env_var "REACT_APP_KEYCLOAK_URL"
check_env_var "REACT_APP_OAUTH2_REDIRECT_URI"

# Define source and target files
SOURCE_FILE="../docker/keycloak/realm-export.json"
TARGET_FILE="../docker/keycloak/realm-export.production.json"

echo "📝 Processing realm export template..."
echo "   Source: $SOURCE_FILE"
echo "   Target: $TARGET_FILE"

# Copy template and replace placeholders
cp "$SOURCE_FILE" "$TARGET_FILE"

# Replace placeholder values with environment variables
sed -i "s|\*\*KEYCLOAK_CLIENT_SECRET\*\*|$KEYCLOAK_CLIENT_SECRET|g" "$TARGET_FILE"
sed -i "s|\*\*FRONTEND_CLIENT_SECRET\*\*|${FRONTEND_CLIENT_SECRET:-frontend-production-secret}|g" "$TARGET_FILE"
sed -i "s|\*\*BACKEND_BASE_URL\*\*|$REACT_APP_API_BASE_URL|g" "$TARGET_FILE"
sed -i "s|\*\*FRONTEND_BASE_URL\*\*|${REACT_APP_OAUTH2_REDIRECT_URI%/auth/callback}|g" "$TARGET_FILE"

echo "✅ Production realm export prepared: $TARGET_FILE"
echo ""
echo "⚠️  IMPORTANT SECURITY REMINDERS:"
echo "   - Never commit realm-export.production.json to version control"
echo "   - Verify all placeholders have been replaced before deployment"
echo "   - Use strong, unique secrets for all production values"
echo ""
echo "🎯 Next steps:"
echo "   1. Review $TARGET_FILE for any remaining placeholders"
echo "   2. Deploy to production using docker-compose.prod.yml"
echo "   3. Verify all OAuth2 flows work with production URLs"