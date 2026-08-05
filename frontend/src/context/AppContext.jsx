import React, { createContext, useContext, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { useAuthStore } from '../store/useAuthStore';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const store = useAppStore();
  const { token, user } = useAuthStore();

  useEffect(() => {
    if (token && user) {
      store.initSocket(user.id, user.role);
      store.fetchData(token, user.role);
    }
  }, [token, user]);

  const value = {
    ...store,
    triggerSOS: (lat, lng) => store.triggerSOS(token, lat, lng),
    resolveSOS: (sosId) => store.resolveSOS(token, sosId),
    submitScamReport: (reportData) => store.submitScamReport(token, reportData),
    verifyScamReport: (scamId, status) => store.verifyScamReport(token, scamId, status),
    submitAlert: (alertData) => store.submitAlert(token, alertData),
    submitSafetyZone: (zoneData) => store.submitSafetyZone(token, zoneData),
    generateTripPlan: (plannerDetails) => store.generateTripPlan(token, plannerDetails),
    checkInAttraction: (qrCodeToken) => store.checkInAttraction(token, qrCodeToken),
    askAIChat: (message) => store.askAIChat(message),
    submitCommunityPost: (postData) => store.submitCommunityPost(token, postData),
    likePost: (postId) => store.likePost(token, postId),
    commentOnPost: (postId, text) => store.commentOnPost(token, postId, text),
    deleteCommunityPost: (postId) => store.deleteCommunityPost(token, postId),
    editCommunityPost: (postId, postData) => store.editCommunityPost(token, postId, postData),
    downloadOfflineCache: (packageId, packageName, packageSize) => store.downloadOfflineCache(token, packageId, packageName, packageSize),
    clearOfflineCache: (packageId) => store.clearOfflineCache(token, packageId),
    refreshData: () => store.fetchData(token, user?.role)
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
