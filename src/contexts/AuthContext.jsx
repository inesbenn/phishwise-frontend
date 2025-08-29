// src/contexts/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import client from '../api/client';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      // Vérifier le token et récupérer les infos utilisateur
      const response = await client.get('/auth/me');
      setUser(response.data.user);
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('accessToken');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const { data } = await client.post('/auth/login', { email, password });
      localStorage.setItem('accessToken', data.accessToken);
      
      // Récupérer les infos utilisateur après connexion
      const userResponse = await client.get('/auth/me');
      setUser(userResponse.data.user);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Erreur de connexion' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    setUser(null);
  };

  const hasRole = (role) => {
    return user?.role === role;
  };

  const hasAnyRole = (roles) => {
    return roles.includes(user?.role);
  };

  const canAccessRoute = (route) => {
    const permissions = {
      // Pages accessibles selon les rôles
      '/': ['Admin', 'Manager', 'Analyste', 'Cible'], // Login pour tous
      '/home': ['Admin', 'Manager', 'Analyste'],
      '/users': ['Admin'], // Seuls les admins gèrent les utilisateurs
      '/campaign-wizard': ['Admin', 'Manager'],
      '/learning-pages': ['Admin', 'Manager', 'Analyste'],
      '/analytics': ['Admin', 'Manager', 'Analyste'],
      '/training/:campaignId': ['Admin', 'Manager', 'Analyste', 'Cible'],
    };

    const allowedRoles = permissions[route] || [];
    return allowedRoles.includes(user?.role);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    hasRole,
    hasAnyRole,
    canAccessRoute,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};