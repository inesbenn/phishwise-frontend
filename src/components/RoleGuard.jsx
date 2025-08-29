// src/components/RoleGuard.jsx
import { useAuth } from '../contexts/AuthContext';

const RoleGuard = ({ 
  children, 
  requiredRoles = [], 
  fallback = null,
  showFallback = true 
}) => {
  const { user } = useAuth();

  if (!user || !requiredRoles.includes(user.role)) {
    return showFallback ? fallback : null;
  }

  return children;
};

export default RoleGuard;