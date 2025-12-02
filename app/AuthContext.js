'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    if (typeof window !== 'undefined') { // Check if running on client-side
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const decoded = jwtDecode(token);
          return { id: decoded.id, email: decoded.email, plan: decoded.plan, is_admin: decoded.is_admin };
        } catch (error) {
          console.error("Failed to decode token on initialization:", error);
          localStorage.removeItem('token');
        }
      }
    }
    return null;
  });
  const [loading, setLoading] = useState(false); // Set to false initially as user is already initialized or null

  // No more useEffect for initial token loading as it's handled in useState initialization

  const login = (token) => {
    localStorage.setItem('token', token);
    try {
        const decoded = jwtDecode(token);
        setUser({ id: decoded.id, email: decoded.email, plan: decoded.plan, is_admin: decoded.is_admin });
    } catch (error) {
        console.error("Failed to decode token on login:", error);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}