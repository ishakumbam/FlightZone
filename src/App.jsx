// ============================================================
// FlightZone AI — App Router
// Task 1.12 — src/App.jsx
// All routes defined here. Add new routes as team delivers pages.
// ============================================================
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppShell from './components/AppShell';

// Pages
import LoginPage                  from './pages/LoginPage';
import DashboardPage              from './pages/DashboardPage';
import FlightsPage                from './pages/FlightsPage';
import OptimizationPage           from './pages/OptimizationPage';
import RouteRecommendationsPage   from './pages/RouteRecommendationsPage';
import AlertsPage                 from './pages/AlertsPage';
import AdminPage                  from './pages/AdminPage';
import ContactPage                from './pages/ContactPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* ── Public routes ─────────────────────────────── */}
          <Route path="/login"   element={<LoginPage />} />
          <Route path="/"        element={<Navigate to="/dashboard" replace />} />

          {/* ── Protected routes (require login) ─────────── */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <AppShell><DashboardPage /></AppShell>
            </ProtectedRoute>
          } />

          <Route path="/flights" element={
            <ProtectedRoute>
              <AppShell><FlightsPage /></AppShell>
            </ProtectedRoute>
          } />

          <Route path="/optimization" element={
            <ProtectedRoute>
              <AppShell><OptimizationPage /></AppShell>
            </ProtectedRoute>
          } />

          <Route path="/route-recommendations" element={
            <ProtectedRoute>
              <AppShell><RouteRecommendationsPage /></AppShell>
            </ProtectedRoute>
          } />

          <Route path="/alerts" element={
            <ProtectedRoute>
              <AppShell><AlertsPage /></AppShell>
            </ProtectedRoute>
          } />

          <Route path="/contact" element={
            <ProtectedRoute>
              <AppShell><ContactPage /></AppShell>
            </ProtectedRoute>
          } />

          {/* ── Admin-only route ──────────────────────────── */}
          <Route path="/admin" element={
            <ProtectedRoute role="admin">
              <AppShell><AdminPage /></AppShell>
            </ProtectedRoute>
          } />

          {/* ── 404 fallback ──────────────────────────────── */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
