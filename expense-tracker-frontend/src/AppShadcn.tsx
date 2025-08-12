import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PrivateRoute } from './components/PrivateRoute';
import ShadcnDashboardLayout from './components/ShadcnDashboardLayout';
import { Dashboard } from './components/Dashboard';
import { ExpenseManagement } from './components/ExpenseManagement';
import { UserProfile } from './components/UserProfile';
import LoginPage from './components/auth/LoginPage';
import SignupPage from './components/auth/SignupPage';
import './App.css';

function App() {
  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Authentication Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            
            {/* Private Application Routes */}
            <Route path="/" element={
              <PrivateRoute>
                <ShadcnDashboardLayout />
              </PrivateRoute>
            }>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="expenses" element={<ExpenseManagement />} />
              <Route path="analytics" element={<Dashboard />} />
              <Route path="profile" element={<UserProfile />} />
              <Route path="settings" element={<UserProfile />} />
            </Route>
            
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </div>
  );
}

export default App;