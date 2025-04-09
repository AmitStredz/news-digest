import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { NhostClient, NhostProvider } from '@nhost/react';
import { NhostApolloProvider } from '@nhost/react-apollo';
import ProtectedRoute from './providers/ProtectedRoutes';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
// import Dashboard from './pages/dashboard';
import DashboardPage from './pages/DashboardPage';
import Todos from './pages/todo';
// import AppRoutes from './routes';

// Initialize Nhost client
const nhost = new NhostClient({
  subdomain: "fglrgnpgtyzshqcnrjke",
  region: "ap-south-1"
});

function App() {
  return (
    <NhostProvider nhost={nhost}>
      <NhostApolloProvider nhost={nhost}>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/dashboard" />} />
            {/* <Route path="*" element={} /> */}
          </Routes>
        </Router>
      </NhostApolloProvider>
    </NhostProvider>
  );
}

export default App;
