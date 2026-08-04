import React, { createContext, useContext } from 'react';
import { useAuthStore } from '../store/useAuthStore';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const store = useAuthStore();
  
  // Expose store fields under context naming convention
  const value = {
    ...store,
    user: store.user ? {
      ...store.user,
      // Adapt uppercase roles to lowercase for old UI components
      role: store.user.role.toLowerCase()
    } : null
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
