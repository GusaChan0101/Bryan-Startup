'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        // Aqui você pode querer buscar os dados mais recentes do usuário da sua API
        // em vez de confiar apenas no token.
        // Por simplicidade, estamos usando os dados do token decodificado.
        setUser({ id: decoded.id, email: decoded.email, plan: decoded.plan, is_admin: decoded.is_admin });
      } catch (error) {
        console.error("Failed to decode token:", error);
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

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