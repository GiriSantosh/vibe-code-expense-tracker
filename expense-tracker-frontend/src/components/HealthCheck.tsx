import React, { useState, useEffect } from 'react';
import config from '../config/env';

interface HealthStatus {
  frontend: 'healthy' | 'error';
  backend: 'healthy' | 'error' | 'checking';
  keycloak: 'healthy' | 'error' | 'checking';
}

const HealthCheck: React.FC = () => {
  const [status, setStatus] = useState<HealthStatus>({
    frontend: 'healthy',
    backend: 'checking',
    keycloak: 'checking'
  });

  useEffect(() => {
    checkBackendHealth();
    checkKeycloakHealth();
  }, []);

  const checkBackendHealth = async () => {
    try {
      const response = await fetch(`${config.API_BASE_URL}/actuator/health`);
      if (response.ok) {
        setStatus(prev => ({ ...prev, backend: 'healthy' }));
      } else {
        setStatus(prev => ({ ...prev, backend: 'error' }));
      }
    } catch (error) {
      console.error('Backend health check failed:', error);
      setStatus(prev => ({ ...prev, backend: 'error' }));
    }
  };

  const checkKeycloakHealth = async () => {
    try {
      const response = await fetch(`${config.KEYCLOAK_URL}/realms/expense-tracker`);
      if (response.ok) {
        setStatus(prev => ({ ...prev, keycloak: 'healthy' }));
      } else {
        setStatus(prev => ({ ...prev, keycloak: 'error' }));
      }
    } catch (error) {
      console.error('Keycloak health check failed:', error);
      setStatus(prev => ({ ...prev, keycloak: 'error' }));
    }
  };

  const getStatusColor = (serviceStatus: string) => {
    switch (serviceStatus) {
      case 'healthy': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'checking': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (serviceStatus: string) => {
    switch (serviceStatus) {
      case 'healthy': return '✅';
      case 'error': return '❌';
      case 'checking': return '⏳';
      default: return '❓';
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">System Health Check</h3>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span>Frontend:</span>
          <span className={`flex items-center ${getStatusColor(status.frontend)}`}>
            {getStatusIcon(status.frontend)} {status.frontend}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span>Backend:</span>
          <span className={`flex items-center ${getStatusColor(status.backend)}`}>
            {getStatusIcon(status.backend)} {status.backend}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span>Keycloak:</span>
          <span className={`flex items-center ${getStatusColor(status.keycloak)}`}>
            {getStatusIcon(status.keycloak)} {status.keycloak}
          </span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t text-sm text-gray-600">
        <div><strong>API Base URL:</strong> {config.API_BASE_URL}</div>
        <div><strong>Keycloak URL:</strong> {config.KEYCLOAK_URL}</div>
        <div><strong>Environment:</strong> {process.env.NODE_ENV}</div>
      </div>

      <div className="mt-4">
        <button 
          onClick={() => window.location.reload()} 
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Refresh Health Check
        </button>
      </div>
    </div>
  );
};

export default HealthCheck;