// ============================================================
// FlightZone AI — Axios Instance
// Task 1.2 — src/api.js
// Pre-configured axios with base URL + JWT interceptor.
// Import { api } everywhere instead of raw axios.
// ============================================================
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor: attach JWT ───────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('fz_token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor: handle 401 globally ─────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear stale session; the ProtectedRoute will redirect to /login
      localStorage.removeItem('fz_token');
      localStorage.removeItem('fz_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
