import { createContext, useContext, useState, ReactNode } from 'react';
import { parseToken } from '@/utils/token';

interface AuthUser {
  userId: string;
  tenantId: string;
  email: string;
  firstName: string;
  lastName: string;
  userType: string;
  roles: string[];
  permissions: string[];
  token: string;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);


export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const savedToken = localStorage.getItem('auth_token');
    if (savedToken) {
      try {
        const tokenData = parseToken(savedToken);
        if (!tokenData) return null;
        return {
          userId: tokenData.userId,
          tenantId: tokenData.tenantId,
          email: tokenData.sub,
          firstName: tokenData.firstName || '',
          lastName: tokenData.lastName || '',
          userType: tokenData.userType,
          roles: tokenData.roles || [],
          permissions: tokenData.permissions || [],
          token: savedToken
        };
      } catch (error) {
        localStorage.removeItem('auth_token');
        return null;
      }
    }
    return null;
  });

  const login = (token: string) => {
    localStorage.setItem('auth_token', token);
    try {
      const tokenData = parseToken(token);
      console.log("Token Data:", tokenData);
      if (!tokenData) return;
      setUser({
        userId: tokenData.userId,
        tenantId: tokenData.tenantId,
        email: tokenData.sub,
        firstName: tokenData.firstName || '',
        lastName: tokenData.lastName || '',
        userType: tokenData.userType,
        roles: tokenData.roles || [],
        permissions: tokenData.permissions || [],
        token
      });
    } catch (error) {
      console.error('Error parsing token:', error);
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
  };

  const hasPermission = (permission: string): boolean => {
    return user?.permissions.includes(permission) || false;
  };

  const hasRole = (role: string): boolean => {
    return user?.roles.includes(role) || false;
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isAuthenticated: !!user,
      hasPermission,
      hasRole
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 