import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import DebugApp from './DebugApp';
import LocalApp from './LocalApp';

// Determine which app to use
const isLocalMode = process.env.REACT_APP_LOCAL_MODE === 'true';
const isDebugMode = process.env.REACT_APP_DEBUG === 'true';

console.log('Environment check:', {
  REACT_APP_LOCAL_MODE: process.env.REACT_APP_LOCAL_MODE,
  REACT_APP_DEBUG: process.env.REACT_APP_DEBUG,
  isLocalMode,
  isDebugMode
});

const getAppComponent = () => {
  // Force main App for now to troubleshoot
  console.log('Environment values:', { isLocalMode, isDebugMode });
  console.log('Forcing main App to load');
  return App;
  
  // Original logic (commented out for troubleshooting)
  // if (isLocalMode) {
  //   console.log('Loading LocalApp');
  //   return LocalApp;
  // }
  // if (isDebugMode) {
  //   console.log('Loading DebugApp');
  //   return DebugApp;
  // }
  // console.log('Loading main App');
  // return App;
};

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

// Error boundary for catching startup issues
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App startup error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg">
            <h1 className="text-xl font-bold text-red-600 mb-4">Application Error</h1>
            <p className="text-gray-700 mb-4">
              The application failed to start. This might be due to:
            </p>
            <ul className="list-disc pl-5 text-sm text-gray-600 mb-4">
              <li>Missing environment variables</li>
              <li>Backend/Keycloak not accessible</li>
              <li>Build configuration issues</li>
            </ul>
            <div className="bg-gray-100 p-3 rounded text-xs font-mono">
              {this.state.error?.message}
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const AppComponent = getAppComponent();

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <AppComponent />
    </ErrorBoundary>
  </React.StrictMode>
);