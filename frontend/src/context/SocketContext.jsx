import React, { createContext, useContext } from 'react';
import { useAppStore } from '../store/useAppStore';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { socket } = useAppStore();

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
