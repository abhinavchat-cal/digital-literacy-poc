import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/admin/Dashboard';
import Institutes from './pages/admin/Institutes';
import Courses from './pages/admin/Courses';
import Users from './pages/admin/Users';
import TrainerDashboard from './pages/trainer/Dashboard';
import Subjects from './pages/trainer/Subjects';
import Exams from './pages/trainer/Exams';
import Candidates from './pages/trainer/Candidates';
import CandidateDashboard from './pages/candidate/Dashboard';
import Exam from './pages/candidate/Exam';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Admin routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/institutes"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Institutes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/courses"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Courses />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Users />
            </ProtectedRoute>
          }
        />

        {/* Trainer routes */}
        <Route
          path="/trainer"
          element={
            <ProtectedRoute allowedRoles={['trainer']}>
              <TrainerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trainer/subjects"
          element={
            <ProtectedRoute allowedRoles={['trainer']}>
              <Subjects />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trainer/exams"
          element={
            <ProtectedRoute allowedRoles={['trainer']}>
              <Exams />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trainer/candidates"
          element={
            <ProtectedRoute allowedRoles={['trainer']}>
              <Candidates />
            </ProtectedRoute>
          }
        />

        {/* Candidate routes */}
        <Route
          path="/candidate"
          element={
            <ProtectedRoute allowedRoles={['candidate']}>
              <CandidateDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/candidate/exam/:examId"
          element={
            <ProtectedRoute allowedRoles={['candidate']}>
              <Exam />
            </ProtectedRoute>
          }
        />

        {/* Default route */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  );
};

export default App; 