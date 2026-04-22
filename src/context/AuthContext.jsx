// ============================================================
// FlightZone AI — Auth Context
// Task 1.1 — src/context/AuthContext.jsx
// Provides: user, token, login(), logout(), isAuthenticated
// ============================================================
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const TOKEN_KEY = 'fz_token';
const USER_KEY  = 'fz_user';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user,  setUser]  = useState(() => {
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Keep localStorage in sync with state
  useEffect(() => {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  }, [user]);

  /** Call after a successful /api/auth/login response */
  function login(tokenValue, userData) {
    setToken(tokenValue);
    setUser(userData);
  }

  /** Clear session — called on logout or 401 */
  function logout() {
    setToken(null);
    setUser(null);
  }

  const isAuthenticated = Boolean(token && user);

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
