// ============================================================
// FlightZone AI — Protected Route
// Task 1.3 — src/components/ProtectedRoute.jsx
// Redirects to /login if the user is not authenticated.
// Optionally restricts by role: <ProtectedRoute role="admin">
// ============================================================
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, role }) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Preserve intended destination so we can redirect back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (role && user?.role !== role) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
