import React, { createContext, useContext, useCallback } from 'react';
import { toast } from 'react-toastify';

const NotificationContext = createContext(null);

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const showNotification = useCallback((message, options = {}) => {
    const { type = 'info', ...rest } = options;
    
    // Default toast configuration
    const config = {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      ...rest,
    };

    // Fire the toast
    toast[type](message, config);
  }, []);

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
    </NotificationContext.Provider>
  );
}; 