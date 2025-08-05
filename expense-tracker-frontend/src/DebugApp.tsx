import React from 'react';
import HealthCheck from './components/HealthCheck';
import config from './config/env';

// Simplified debug version of App for troubleshooting
const DebugApp: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Personal Expense Tracker - Debug Mode
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <HealthCheck />
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Configuration</h3>
            <div className="space-y-2 text-sm">
              <div><strong>Node Environment:</strong> {process.env.NODE_ENV}</div>
              <div><strong>React Version:</strong> {React.version}</div>
              <div><strong>API Base URL:</strong> {config.API_BASE_URL}</div>
              <div><strong>Keycloak URL:</strong> {config.KEYCLOAK_URL}</div>
              <div><strong>Keycloak Realm:</strong> {config.KEYCLOAK_REALM}</div>
              <div><strong>Client ID:</strong> {config.KEYCLOAK_CLIENT_ID}</div>
              <div><strong>Redirect URI:</strong> {config.OAUTH2_REDIRECT_URI}</div>
              <div><strong>PII Masking:</strong> {config.ENABLE_PII_MASKING ? 'Enabled' : 'Disabled'}</div>
              <div><strong>Session Timeout:</strong> {config.SESSION_TIMEOUT}s</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Quick Tests</h3>
            <div className="space-y-3">
              <button 
                onClick={() => {
                  fetch(`${config.API_BASE_URL}/actuator/health`)
                    .then(r => r.json())
                    .then(data => alert(JSON.stringify(data, null, 2)))
                    .catch(e => alert(`Backend Error: ${e.message}`));
                }}
                className="block w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Test Backend Connection
              </button>
              
              <button 
                onClick={() => {
                  fetch(`${config.KEYCLOAK_URL}/health/ready`)
                    .then(r => r.text())
                    .then(data => alert(`Keycloak: ${data}`))
                    .catch(e => alert(`Keycloak Error: ${e.message}`));
                }}
                className="block w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Test Keycloak Connection
              </button>

              <button 
                onClick={() => {
                  const info = {
                    userAgent: navigator.userAgent,
                    platform: navigator.platform,
                    language: navigator.language,
                    cookieEnabled: navigator.cookieEnabled,
                    onLine: navigator.onLine,
                    localStorage: typeof Storage !== 'undefined',
                    sessionStorage: typeof Storage !== 'undefined',
                    location: window.location.href
                  };
                  alert(JSON.stringify(info, null, 2));
                }}
                className="block w-full bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
              >
                Show Browser Info
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Development Tools</h3>
            <div className="space-y-3">
              <button 
                onClick={() => console.log('Environment:', process.env)}
                className="block w-full bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Log Environment to Console
              </button>
              
              <button 
                onClick={() => {
                  localStorage.clear();
                  sessionStorage.clear();
                  alert('Storage cleared!');
                }}
                className="block w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Clear Storage
              </button>

              <button 
                onClick={() => window.location.reload()}
                className="block w-full bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <strong>Debug Mode:</strong> This is a simplified version for troubleshooting. 
          Once everything is working, we'll switch back to the full application.
        </div>
      </div>
    </div>
  );
};

export default DebugApp;