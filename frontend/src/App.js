import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import NotesListPage from './pages/NotesListPage';
import UsersManagementPage from './pages/UsersManagementPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AuditLogsPage from './pages/AuditLogsPage';
import StudentsListPage from './pages/StudentsListPage';
import ProfilePage from './pages/ProfilePage';
import PVPage from './pages/PVPage';
import PointFocalPage from './pages/PointFocalPage';
import './App.css';
// ...existing code...
          <Route
            path="/point-focal"
            element={
              <ProtectedRoute requiredRoles={["point_focal"]}>
                <PointFocalPage />
              </ProtectedRoute>
            }
          />


function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Route publique */}
          <Route path="/login" element={<LoginPage />} />

          {/* Routes protégées */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/notes"
            element={
              <ProtectedRoute>
                <NotesListPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/users"
            element={
              <ProtectedRoute requiredRoles={['admin', 'adjoint_admin']}>
                <UsersManagementPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/audit-logs"
            element={
              <ProtectedRoute requiredRoles={['admin', 'adjoint_admin']}>
                <AuditLogsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/students"
            element={
              <ProtectedRoute requiredRoles={['admin', 'adjoint_admin']}>
                <StudentsListPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute requiredRoles={['admin']}>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/pvs"
            element={
              <ProtectedRoute requiredRoles={['agent', 'vice_doyen']}>
                <PVPage />
              </ProtectedRoute>
            }
          />

          {/* Redirections */}
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
