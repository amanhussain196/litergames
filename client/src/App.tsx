import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SocketProvider } from './context/SocketContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import './index.css';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

function App() {
  return (
    <SocketProvider>
      <AuthProvider>
        <Router>
          <div className="app-container">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </SocketProvider>
  );
}

export default App;
