// src/hooks/usePermissions.js
import { useAuth } from '../contexts/AuthContext';

export const usePermissions = () => {
  const { user } = useAuth();

  const permissions = {
    // Gestion des utilisateurs
    canManageUsers: user?.role === 'Admin',
    
    // Gestion des campagnes
    canCreateCampaigns: ['Admin', 'Manager'].includes(user?.role),
    canViewCampaigns: ['Admin', 'Manager'].includes(user?.role),
    
    // Analytics
    canViewAnalytics: ['Admin', 'Manager', 'Analyste'].includes(user?.role),
    canExportReports: ['Admin', 'Manager'].includes(user?.role),
    
    // Formations
    canManageLearning: ['Admin', 'Manager', 'Analyste'].includes(user?.role),
    canCreateLearning: ['Admin', 'Manager'].includes(user?.role),
    
    // Pages spécifiques
    canAccessDashboard: ['Admin', 'Manager', 'Analyste'].includes(user?.role),
    canViewTraining: ['Admin', 'Manager', 'Analyste', 'Cible'].includes(user?.role),
  };

  return permissions;
};