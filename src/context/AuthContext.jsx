import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, logoutUser } from '../api/authApi';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState(null);

  useEffect(() => {
    // Check if user is logged in on app start
    const storedUser = localStorage.getItem('currentUser');
    const storedToken = localStorage.getItem('jwt_token');
    if (storedUser && storedToken) {
      setCurrentUser(JSON.parse(storedUser));
      setToken(storedToken);
      setIsAuthenticated(true);
    }
  }, []);

  const login = async ({ username, password }) => {
    const response = await loginUser({ username, password });
    // Extract token and user info from the nested 'data' field
    const token = response.token;
    const userData = response.data;
    const normalizedRole = userData.role ? userData.role.toLowerCase() : '';
    setToken(token);
    setCurrentUser({ username: userData.username, role: normalizedRole });
    setIsAuthenticated(true);
    localStorage.setItem('currentUser', JSON.stringify({ username: userData.username, role: normalizedRole }));
    localStorage.setItem('jwt_token', token);
    return response;
  };

  const logout = async () => {
    if (token) {
      try {
        await logoutUser(token);
      } catch (err) {
        // Optionally handle logout error (e.g., token already invalid)
      }
    }
    setCurrentUser(null);
    setIsAuthenticated(false);
    setToken(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('jwt_token');
  };

  const isAdmin = () => {
    return currentUser?.role === 'admin' || currentUser?.role === 'Admin';
  };

  const isUser = () => {
    return currentUser?.role === 'user' || currentUser?.role === 'User';
  };

  const value = {
    currentUser,
    isAuthenticated,
    token,
    login,
    logout,
    isAdmin,
    isUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 