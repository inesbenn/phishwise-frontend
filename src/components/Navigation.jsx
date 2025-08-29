// src/components/Navigation.jsx
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../hooks/usePermissions';

const Navigation = () => {
  const { user, logout } = useAuth();
  const permissions = usePermissions();

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/home',
      icon: 'Home',
      show: permissions.canAccessDashboard
    },
    {
      name: 'Utilisateurs',
      href: '/users',
      icon: 'Users',
      show: permissions.canManageUsers
    },
    {
      name: 'Campagnes',
      href: '/campaign-wizard',
      icon: 'Target',
      show: permissions.canCreateCampaigns
    },
    {
      name: 'Analytics',
      href: '/analytics',
      icon: 'BarChart',
      show: permissions.canViewAnalytics
    },
    {
      name: 'Formations',
      href: '/learning-pages',
      icon: 'BookOpen',
      show: permissions.canManageLearning
    }
  ].filter(item => item.show);

  return (
    <nav className="bg-slate-800 p-4">
      <div className="flex items-center justify-between">
        <div className="flex space-x-4">
          {navigationItems.map(item => (
            <a key={item.name} href={item.href} className="text-white hover:text-cyan-400">
              {item.name}
            </a>
          ))}
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-white">{user?.firstName} ({user?.role})</span>
          <button onClick={logout} className="text-red-400 hover:text-red-300">
            Déconnexion
          </button>
        </div>
      </div>
    </nav>
  );
};