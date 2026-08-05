import { create } from 'zustand';
import { io } from 'socket.io-client';
import api from '../services/api';

export const useAppStore = create((set, get) => ({
  zones: [],
  scams: [],
  hotspots: [],
  alerts: [],
  attractions: [],
  trips: [],
  posts: [],
  activeSOS: [],
  activeDispatches: [],
  toast: null,
  language: localStorage.getItem('language') || 'en',
  socket: null,
  notifications: [],
  offlineCache: [],
  bookmarks: [],
  isChatExpanded: false,

  triggerToast: (message, type = 'info') => {
    set({ toast: { message, type } });
    setTimeout(() => {
      if (get().toast?.message === message) {
        set({ toast: null });
      }
    }, 5000);
  },

  setLanguage: (language) => {
    localStorage.setItem('language', language);
    set({ language });
  },

  setIsChatExpanded: (isChatExpanded) => {
    set({ isChatExpanded });
  },

  initSocket: (userId, role) => {
    // Prevent duplicate connection
    if (get().socket) return;

    const socketUrl = window.location.origin.includes('3000') 
      ? 'http://localhost:5000' 
      : window.location.origin;

    const socket = io(socketUrl);
    set({ socket });

    socket.on('connect', () => {
      console.log('📡 Real-time telemetry feed active.');
      
      // Start pushing simulated/real location coordinates if tourist
      if (role === 'TOURIST' && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((pos) => {
          socket.emit('update_location', {
            userId,
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            status: 'Safe'
          });
        });
      }
    });

    socket.on('new_global_alert', (newAlert) => {
      set(state => ({ alerts: [newAlert, ...state.alerts] }));
      get().triggerToast(`🚨 Critical Alert: ${newAlert.title}`, 'critical');
    });

    socket.on('new_scam_report', (newScam) => {
      set(state => ({ scams: [newScam, ...state.scams] }));
      get().triggerToast(`⚠️ Scam reported nearby: ${newScam.category} at ${newScam.address || 'Tourist Center'}.`, 'warning');
      
      // Refresh hotspots
      api.get('/scams/hotspots')
        .then(res => set({ hotspots: res.data }))
        .catch(err => console.error(err));
    });

    socket.on('sos_alert', (sosReq) => {
      const normalizedRole = role ? role.toUpperCase() : '';
      if (normalizedRole === 'ADMIN' || normalizedRole === 'POLICE' || normalizedRole === 'HOSPITAL' || normalizedRole === 'RESCUE') {
        set(state => ({ activeSOS: [sosReq, ...state.activeSOS] }));
        get().triggerToast(`🚨 EMERGENCY SOS: ${sosReq.user?.name || 'Explorer'} has triggered panic signal!`, 'critical');
        
        // Sound beep alarm in browser
        try {
          const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.value = 880;
          gain.gain.value = 0.45;
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start();
          setTimeout(() => osc.stop(), 1500);
        } catch (e) {
          // Blocked by browser gesture policy
        }
      }
    });

    socket.on('sos_resolved', (resolvedId) => {
      set(state => ({
        activeSOS: state.activeSOS.filter(s => s.id !== resolvedId && s._id !== resolvedId)
      }));
    });

    socket.on('sos_dispatches', (data) => {
      const normalizedRole = role ? role.toUpperCase() : '';
      if (normalizedRole === 'ADMIN') {
        // Update specific SOS dispatches
        set(state => ({
          activeSOS: state.activeSOS.map(s => (s.id === data.sosId || s._id === data.sosId) ? { ...s, dispatches: data.dispatches } : s)
        }));
      }
    });

    socket.on('dispatch_status_update', (updatedDispatch) => {
      const normalizedRole = role ? role.toUpperCase() : '';
      if (normalizedRole === 'POLICE' || normalizedRole === 'HOSPITAL' || normalizedRole === 'RESCUE') {
        set(state => ({
          activeDispatches: state.activeDispatches.map(d => (d.id === updatedDispatch.id || d._id === updatedDispatch._id) ? { ...d, status: updatedDispatch.status } : d)
        }));
      }
    });

    socket.on('community_post_created', (newPost) => {
      set(state => ({ posts: [newPost, ...state.posts] }));
    });

    socket.on('community_post_updated', (updatedPost) => {
      set(state => ({
        posts: state.posts.map(p => p._id === updatedPost._id ? updatedPost : p)
      }));
    });

    socket.on('community_post_deleted', (deletedId) => {
      set(state => ({
        posts: state.posts.filter(p => p._id !== deletedId)
      }));
    });

    socket.on('community_post_liked', ({ postId, likes }) => {
      set(state => ({
        posts: state.posts.map(p => p._id === postId ? { ...p, likes } : p)
      }));
    });

    socket.on('community_post_commented', ({ postId, comments }) => {
      set(state => ({
        posts: state.posts.map(p => p._id === postId ? { ...p, comments } : p)
      }));
    });

    socket.on('new_db_notification', (newNotif) => {
      set(state => ({ notifications: [newNotif, ...state.notifications] }));
      get().triggerToast(`🔔 ${newNotif.title}: ${newNotif.message}`, 'info');
    });

  },

  fetchData: async (token, role) => {
    try {
      const [zonesRes, scamsRes, hotspotsRes, alertsRes, attractionsRes, postsRes] = await Promise.all([
        api.get('/zones'),
        api.get('/scams'),
        api.get('/scams/hotspots'),
        api.get('/alerts'),
        api.get('/attractions'),
        api.get('/community/posts')
      ]);

      set({ 
        zones: zonesRes.data,
        scams: scamsRes.data,
        hotspots: hotspotsRes.data,
        alerts: alertsRes.data,
        attractions: attractionsRes.data,
        posts: postsRes.data
      });

      if (token) {
        const tripsRes = await api.get('/trips');
        set({ trips: tripsRes.data });

        try {
          const notificationsRes = await api.get('/notifications');
          set({ notifications: notificationsRes.data });
        } catch (notifErr) {
          console.error('Failed to fetch notifications', notifErr);
        }

        try {
          const cacheRes = await api.get('/offline-cache');
          set({ offlineCache: cacheRes.data });
        } catch (cacheErr) {
          console.error('Failed to fetch offline cache', cacheErr);
        }

        try {
          const bookmarksRes = await api.get('/bookmarks');
          set({ bookmarks: bookmarksRes.data });
        } catch (bookmarkErr) {
          console.error('Failed to fetch bookmarks', bookmarkErr);
        }

        const normalizedRole = role ? role.toUpperCase() : '';
        if (normalizedRole && normalizedRole !== 'TOURIST') {
          const sosRes = await api.get('/sos/active');
          set({ activeSOS: sosRes.data });
          
          if (normalizedRole !== 'ADMIN') {
            await get().fetchActiveDispatches(token);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching SafeTour database content:', err);
    }
  },

  triggerSOS: async (token, lat, lng) => {
    try {
      const response = await api.post('/sos', { lat, lng });
      get().triggerToast('🚨 SOS broadcasted! Response teams have been dispatched.', 'critical');
      return response.data;
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'SOS trigger failed';
      get().triggerToast(errMsg, 'critical');
      throw new Error(errMsg);
    }
  },

  resolveSOS: async (token, sosId) => {
    try {
      const response = await api.put(`/sos/${sosId}/resolve`);
      set(state => ({ activeSOS: state.activeSOS.filter(s => s.id !== sosId && s._id !== sosId) }));
      get().triggerToast('SOS marked resolved successfully.', 'success');
      return response.data;
    } catch (err) {
      console.error(err);
    }
  },

  submitScamReport: async (token, reportData) => {
    try {
      const response = await api.post('/scams', reportData);
      return response.data;
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Scam submit failed';
      get().triggerToast(errMsg, 'warning');
      throw new Error(errMsg);
    }
  },

  verifyScamReport: async (token, scamId, status) => {
    try {
      const response = await api.put(`/scams/${scamId}/verify`, { status });
      set(state => ({ scams: state.scams.map(s => (s.id === scamId || s._id === scamId) ? response.data : s) }));
      get().triggerToast(`Incident status updated to ${status}`, 'success');
      
      // Re-fetch hotspots
      const hsRes = await api.get('/scams/hotspots');
      set({ hotspots: hsRes.data });
    } catch (err) {
      console.error(err);
    }
  },

  submitAlert: async (token, alertData) => {
    try {
      const response = await api.post('/alerts', alertData);
      set(state => ({ alerts: [response.data, ...state.alerts] }));
      get().triggerToast('Global warning alert broadcasted!', 'success');
      return response.data;
    } catch (err) {
      console.error(err);
    }
  },

  submitSafetyZone: async (token, zoneData) => {
    try {
      const response = await api.post('/zones', zoneData);
      set(state => ({ zones: [...state.zones, response.data] }));
      get().triggerToast('New geo-fence zone created!', 'success');
      return response.data;
    } catch (err) {
      console.error(err);
    }
  },

  generateTripPlan: async (token, plannerDetails) => {
    try {
      const response = await api.post('/trips/generate', plannerDetails);
      set(state => ({ trips: [response.data.trip, ...state.trips] }));
      get().triggerToast('AI trip plan generated successfully!', 'success');
      return response.data;
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'AI generation failed';
      get().triggerToast(errMsg, 'warning');
      throw new Error(errMsg);
    }
  },

  checkInAttraction: async (token, qrCodeToken) => {
    try {
      const response = await api.post('/attractions/checkin', { qrCodeToken });
      return response.data;
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Checkin failed';
      get().triggerToast(errMsg, 'warning');
      throw new Error(errMsg);
    }
  },

  askAIChat: async (message) => {
    try {
      const response = await api.post('/ai/chat', { message });
      return response.data.reply;
    } catch (err) {
      console.error(err);
      return '🤖 AI Offline. Check backend server connections.';
    }
  },

  fetchActiveDispatches: async (token) => {
    try {
      const response = await api.get('/dispatches/active');
      set({ activeDispatches: response.data });
    } catch (err) {
      console.error(err);
    }
  },

  updateDispatchStatus: async (token, dispatchId, status) => {
    try {
      const response = await api.put(`/dispatches/${dispatchId}/status`, { status });
      set(state => ({
        activeDispatches: state.activeDispatches.map(d => (d.id === dispatchId || d._id === dispatchId) ? response.data : d)
      }));
      get().triggerToast(`Incident dispatch status updated to ${status}.`, 'info');
    } catch (err) {
      console.error(err);
    }
  },

  submitCommunityPost: async (token, postData) => {
    try {
      const response = await api.post('/community/posts', postData);
      get().triggerToast('Experience review published successfully!', 'success');
      return response.data;
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to submit review';
      get().triggerToast(errMsg, 'warning');
      throw new Error(errMsg);
    }
  },

  likePost: async (token, postId) => {
    try {
      const response = await api.post(`/community/posts/${postId}/like`);
      return response.data;
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to like post';
      get().triggerToast(errMsg, 'warning');
      throw new Error(errMsg);
    }
  },

  commentOnPost: async (token, postId, text) => {
    try {
      const response = await api.post(`/community/posts/${postId}/comment`, { text });
      return response.data;
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to add comment';
      get().triggerToast(errMsg, 'warning');
      throw new Error(errMsg);
    }
  },

  deleteCommunityPost: async (token, postId) => {
    try {
      const response = await api.delete(`/community/posts/${postId}`);
      get().triggerToast('Review deleted successfully.', 'info');
      return response.data;
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to delete post';
      get().triggerToast(errMsg, 'warning');
      throw new Error(errMsg);
    }
  },

  editCommunityPost: async (token, postId, postData) => {
    try {
      const response = await api.put(`/community/posts/${postId}`, postData);
      get().triggerToast('Review updated successfully.', 'success');
      return response.data;
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to edit post';
      get().triggerToast(errMsg, 'warning');
      throw new Error(errMsg);
    }
  },

  markNotificationAsRead: async (notifId) => {
    try {
      const response = await api.put(`/notifications/${notifId}/read`);
      set(state => ({
        notifications: state.notifications.map(n => n._id === notifId ? response.data : n)
      }));
    } catch (err) {
      console.error('[Notification Store Error]', err);
    }
  },

  markAllNotificationsAsRead: async () => {
    try {
      await api.put('/notifications/read-all');
      set(state => ({
        notifications: state.notifications.map(n => ({ ...n, isRead: true }))
      }));
    } catch (err) {
      console.error('[Notification Store Error]', err);
    }
  },

  downloadOfflineCache: async (token, packageId, packageName, packageSize) => {
    try {
      const response = await api.post('/offline-cache', { packageId, packageName, packageSize });
      set(state => ({
        offlineCache: [...state.offlineCache.filter(c => c.packageId !== packageId), response.data]
      }));
      return response.data;
    } catch (err) {
      console.error('[Offline Cache Store Error]', err);
    }
  },

  clearOfflineCache: async (token, packageId) => {
    try {
      await api.post('/offline-cache/clear', { packageId });
      set(state => ({
        offlineCache: state.offlineCache.filter(c => c.packageId !== packageId)
      }));
    } catch (err) {
      console.error('[Offline Cache Store Error]', err);
    }
  }
}));

export default useAppStore;

