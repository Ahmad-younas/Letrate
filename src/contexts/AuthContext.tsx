import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "@/utils/api";
import { parseToken } from "@/utils/token";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  permissions: string[];
  tenantId?: string;
  token: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (role: string) => boolean;
  hasPermission: (permission: string) => boolean;
  getTokenExpirationTime: () => string;
  isTokenValid: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to format time difference
const formatTimeDifference = (expirationTime: number, currentTime: number): string => {
  const diffMs = expirationTime - currentTime;
  
  if (diffMs <= 0) {
    return "Expired";
  }
  
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  
  if (diffDay > 0) {
    return `${diffDay} day${diffDay > 1 ? 's' : ''} remaining`;
  } else if (diffHour > 0) {
    return `${diffHour} hour${diffHour > 1 ? 's' : ''} remaining`;
  } else if (diffMin > 0) {
    return `${diffMin} minute${diffMin > 1 ? 's' : ''} remaining`;
  } else {
    return `${diffSec} second${diffSec > 1 ? 's' : ''} remaining`;
  }
};

// Helper function to check if token is still valid
const isTokenValid = (token: string): boolean => {
  try {
    const tokenData = parseToken(token);
    if (!tokenData || !tokenData.exp) {
      console.log("Token data or expiration time is missing");
      return false;
    }
    
    const expirationTime = tokenData.exp * 1000; // Convert to milliseconds
    const currentTime = Date.now();
    
    // Add detailed logging
    // console.log("Token validation check:");
    // console.log("Expiration timestamp:", tokenData.exp);
    // console.log("Expiration time (ms):", expirationTime);
    // console.log("Expiration date:", new Date(expirationTime).toLocaleString());
    // console.log("Current time (ms):", currentTime);
    // console.log("Current date:", new Date(currentTime).toLocaleString());
    // console.log("Time difference (ms):", expirationTime - currentTime);
    // console.log("Time difference (hours):", (expirationTime - currentTime) / (1000 * 60 * 60));
    
    // Check if token is valid
    const isValid = expirationTime > currentTime;
    console.log("Token is valid:", isValid);
    
    return isValid;
  } catch (error) {
    console.error("Error checking token validity:", error);
    return false;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Rehydrate auth state on app load
  useEffect(() => {
    console.log("Rehydrate auth state on app load useEffect called");
    const rehydrateAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setIsLoading(false);
          return;
        }

        // Check if token is expired
        const tokenData = parseToken(token);
        
        const expirationTime = tokenData?.exp ? tokenData.exp * 1000 : 0;
        const currentTime = Date.now();
        const timeRemaining = formatTimeDifference(expirationTime, currentTime);
        
        console.log("Token expiration:", new Date(expirationTime).toLocaleString());
        console.log("Time remaining:", timeRemaining);
        
        // Check if token is valid using the isTokenValid function
        if (!isTokenValid(token)) {
          console.log("Token is expired, clearing it");
          // Token is expired, clear it
          localStorage.removeItem("token");
          setIsLoading(false);
          return;
        }

        // Token is valid, use token data directly without fetching user info
        if (tokenData) {
          console.log("Using token data directly for authentication");
          setUser({
            id: tokenData.sub || "unknown",
            email: tokenData.email || "unknown",
            firstName: tokenData.firstName || "unknown",
            lastName: tokenData.lastName || "unknown",
            roles: tokenData.roles || [],
            permissions: tokenData.permissions || [],
            tenantId: tokenData.tenantId,
            token
          });
        } else {
          console.log("Token data is missing, clearing token");
          localStorage.removeItem("token");
        }
      } catch (error) {
        console.error("Error rehydrating auth state:", error);
        localStorage.removeItem("token");
      } finally {
        setIsLoading(false);
      }
    };

    rehydrateAuth();
  }, []);

  // Set up token expiration check
  useEffect(() => {
    console.log("Set up token expiration check useEffect called");
    if (!user) return;

    const tokenData = parseToken(user.token);
    if (!tokenData || !tokenData.exp) return;

    const expirationTime = tokenData.exp * 1000;
    const now = Date.now();
    const timeUntilExpiration = expirationTime - now;

    console.log("timeUntilExpiration", timeUntilExpiration)
    console.log("expirationTime", expirationTime)
    // Log token expiration time
    console.log("Token will expire at:", new Date(expirationTime).toLocaleString());
    console.log("Time until expiration:", formatTimeDifference(expirationTime, now));

    // If token is already expired, logout
    if (timeUntilExpiration <= 0) {
      logout();
      return;
    }

    // Set up a timer to logout when token expires
    const timer = setTimeout(() => {
      logout();
    }, timeUntilExpiration);

    return () => clearTimeout(timer);
  }, [user]);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post("/api/auth/login", { email, password });
      
      console.log("login response", response);

      if (response.status == 200) {
        const token = response?.data?.token;
        localStorage.setItem("token", token);
        
        const tokenData = parseToken(token);
        if (!tokenData) {
          throw new Error("Invalid token format");
        }
        
        // Log token expiration time
        const expirationTime = tokenData.exp ? tokenData.exp * 1000 : 0;
        console.log("Token will expire at:", new Date(expirationTime).toLocaleString());
        console.log("Time until expiration:", formatTimeDifference(expirationTime, Date.now()));
        
        console.log("response.data", response.data);
        setUser({
          id: response.data.userId,
          email: response.data.email,
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          roles: tokenData.roles || [],
          permissions: tokenData.permissions || [],
          tenantId: tokenData.tenantId,
          token
        });
      } else {
        throw new Error(response.message || "Login failed");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      throw new Error(error.message || "Login failed. Please try again.");
    }
  };

  const logout = async () => {
    try {
      // Only attempt to call logout API if we have a token
      if (user?.token) {
        await api.post("/api/auth/logout", {}, user.token);
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Always clear local state and storage regardless of API call success
      localStorage.removeItem("token");
      setUser(null);
    }
  };

  const hasRole = (role: string): boolean => {
    return user?.roles.includes(role) || false;
  };

  const hasPermission = (permission: string): boolean => {
    return user?.permissions.includes(permission) || false;
  };

  const getTokenExpirationTime = (): string => {
    if (!user) return "Not logged in";
    
    const tokenData = parseToken(user.token);
    if (!tokenData || !tokenData.exp) return "Unknown";
    
    const expirationTime = tokenData.exp * 1000;
    return formatTimeDifference(expirationTime, Date.now());
  };

  const checkTokenValidity = (): boolean => {
    if (!user) return false;
    return isTokenValid(user.token);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        hasRole,
        hasPermission,
        getTokenExpirationTime,
        isTokenValid: checkTokenValidity
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}; 