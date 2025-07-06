import React, { createContext, useContext } from 'react';
import { useSelector } from 'react-redux';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const authState = useSelector((state) => state.auth);

  return (
    <AuthContext.Provider value={authState}>
      {children}
    </AuthContext.Provider>
  );
}; 