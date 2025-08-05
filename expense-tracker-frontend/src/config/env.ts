// Environment configuration validation and defaults
export const config = {
  // API Configuration
  API_BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080',
  
  // Keycloak Configuration
  KEYCLOAK_URL: process.env.REACT_APP_KEYCLOAK_URL || 'http://localhost:8081',
  KEYCLOAK_REALM: process.env.REACT_APP_KEYCLOAK_REALM || 'expense-tracker',
  KEYCLOAK_CLIENT_ID: process.env.REACT_APP_KEYCLOAK_CLIENT_ID || 'expense-tracker-frontend',
  
  // OAuth2 Configuration
  OAUTH2_REDIRECT_URI: process.env.REACT_APP_OAUTH2_REDIRECT_URI || 'http://localhost:3000/auth/callback',
  
  // App Configuration
  ENABLE_PII_MASKING: process.env.REACT_APP_ENABLE_PII_MASKING === 'true',
  SESSION_TIMEOUT: parseInt(process.env.REACT_APP_SESSION_TIMEOUT || '1800', 10),
  
  // Development flags
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
};

// Validate required environment variables
const validateConfig = () => {
  const required = [
    'API_BASE_URL',
    'KEYCLOAK_URL', 
    'KEYCLOAK_REALM',
    'KEYCLOAK_CLIENT_ID'
  ];
  
  const missing = required.filter(key => !config[key as keyof typeof config]);
  
  if (missing.length > 0) {
    console.warn('Missing environment variables:', missing);
    console.warn('Using default values. For production, please set these variables.');
  }
  
  console.log('App configuration:', {
    ...config,
    // Don't log sensitive information in production
    ...(config.IS_PRODUCTION ? {} : { env: process.env })
  });
};

// Run validation
validateConfig();

export default config;