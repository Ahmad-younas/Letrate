import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredPermissions?: string[];
  requiredRoles?: string[];
}

export const ProtectedRoute = ({
  children,
  requiredPermissions = [],
  requiredRoles = []
}: ProtectedRouteProps) => {
  const { isAuthenticated, hasPermission, hasRole } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const hasRequiredPermissions = requiredPermissions.length === 0 || 
    requiredPermissions.every(permission => hasPermission(permission));

  const hasRequiredRoles = requiredRoles.length === 0 || 
    requiredRoles.some(role => hasRole(role));

  if (!hasRequiredPermissions || !hasRequiredRoles) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}; 