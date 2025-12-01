import React from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

interface ProtectedRouteProps {
  children: React.ReactElement;
  allowedRoles: string[];
}

interface DecodedToken {
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'?: string;
  exp?: number;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('accessToken');

  // Check if user is authenticated
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    // Decode and validate token
    const decoded: DecodedToken = jwtDecode(token);
    
    // Check if token is expired
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      return <Navigate to="/login" replace />;
    }

    // Get user role from token
    const userRole = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']?.toLowerCase();

    // Check if user has permission to access this route
    // Note: API will also validate this, but we check here for immediate feedback
    if (!userRole || !allowedRoles.map(r => r.toLowerCase()).includes(userRole)) {
      return <Navigate to="/unauthorized" replace />;
    }

    // User is authenticated and authorized
    // API calls will handle additional authorization checks
    return children;

  } catch (error) {
    console.error('Token validation error:', error);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;
