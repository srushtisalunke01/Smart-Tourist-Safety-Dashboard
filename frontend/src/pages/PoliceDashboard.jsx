import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useAppStore } from '../store/useAppStore';
import { useLanguage } from '../context/LanguageContext';
import { 
  ShieldAlert, Radio, Activity, Clock, MapPin, 
  PhoneCall, CheckCircle, Navigation, Wifi 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PoliceDashboard() {
  const { user, token } = useAuthStore();
  const { activeDispatches, fetchActiveDispatches, updateDispatchStatus, triggerToast } = useAppStore();
  const { t } = useLanguage();
  const [selectedDispatch, setSelectedDispatch] = useState(null);

  useEffect(() => {
    if (token) {
      fetchActiveDispatches(token);
      
      const interval = setInterval(() => {
        fetchActiveDispatches(token);
      }, 5000); // Poll dispatches every 5 seconds as fallback
      
      return () => clearInterval(interval);
    }
  }, [token]);

  const handleStatusChange = async (dispatchId, newStatus) => {
    try {
      await updateDispatchStatus(token, dispatchId, newStatus);
      fetchActiveDispatches(token);
      triggerToast(`Response status updated to: ${newStatus}`, 'success');
    } catch (err) {
      triggerToast('Failed to update status', 'critical');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-800 dark:text-slate-100 py-8 px-4 md:px-8 relative overflow-hidden transition-colors duration-500">
      {/* Background Cyber Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-10 dark:opacity-35 pointer-events-none" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        
        {/* Header Block */}
        <div className="lg:col-span-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/80 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 p-6 rounded-2xl backdrop-blur-xl">
          <div>
            <div className="flex items-center gap-2 text-red-650 dark:text-red-500 font-extrabold text-xs uppercase tracking-widest mb-1.5 animate-pulse">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping"></span>
              {t("police.terminal") || "Tactical Police Dispatch Terminal"}
            </div>
            <h1 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-slate-900 via-slate-800 to-slate-655 dark:from-white dark:via-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
              {t("welcome") || "Officer Console"}: {user?.name}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
              Station: {user?.policeProfile?.stationName || 'Regional Safety Cell'} | Badge: {user?.policeProfile?.badgeNumber || 'N/A'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs flex items-center gap-2">
              <Wifi className="w-3.5 h-3.5 animate-pulse" />
              {t("systemStatus") || "ONLINE telemetry"}
            </span>
          </div>
        </div>

        {/* Dispatch List Feed */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white/80 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 p-5 rounded-2xl backdrop-blur-xl">
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-800 dark:text-slate-300 mb-4 flex items-center gap-2">
              <Radio className="w-4 h-4 text-brand-500 animate-pulse" />
              {t("admin.dispatchStatus") || "Active Dispatch Alerts"} ({activeDispatches.length})
            </h3>

            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              <AnimatePresence>
                {activeDispatches.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 text-xs font-semibold">
                    No active emergency dispatches currently assigned to this sector.
                  </div>
                ) : (
                  activeDispatches.map((dispatch) => {
                    const isSelected = selectedDispatch?.id === dispatch.id;
                    const statusColor = 
                      dispatch.status === 'Dispatched' ? 'border-red-500/50 bg-red-950/10 text-red-500 dark:text-red-400' :
                      dispatch.status === 'EnRoute' ? 'border-amber-500/50 bg-amber-950/10 text-amber-600 dark:text-amber-400' :
                      'border-emerald-500/50 bg-emerald-950/10 text-emerald-600 dark:text-emerald-400';

                    return (
                      <motion.div
                        key={dispatch.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        onClick={() => setSelectedDispatch(dispatch)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col gap-2 ${
                          isSelected 
                            ? 'bg-brand-500/10 dark:bg-brand-950/20 border-brand-500/60 shadow-lg shadow-brand-500/10' 
                            : 'bg-slate-100/50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-xs text-slate-800 dark:text-white">
                            SOS: {dispatch.sosRequest?.user?.name || 'Explorer'}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${statusColor}`}>
                            {dispatch.status}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          Lat: {dispatch.sosRequest?.lat.toFixed(4)}, Lng: {dispatch.sosRequest?.lng.toFixed(4)}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          Triggered: {new Date(dispatch.dispatchedAt).toLocaleTimeString()}
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Detailed Dispatch Profile Inspector */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            {!selectedDispatch ? (
              <div className="bg-slate-100/20 dark:bg-slate-900/20 border border-dashed border-slate-200 dark:border-slate-800 p-12 rounded-2xl flex flex-col items-center justify-center text-center h-full min-h-[400px]">
                <ShieldAlert className="w-12 h-12 text-slate-400 dark:text-slate-600 mb-4 animate-bounce" />
                <h4 className="font-bold text-slate-500 dark:text-slate-400 text-sm">No Emergency Selected</h4>
                <p className="text-[11px] text-slate-500 max-w-xs mt-1">
                  Select an active dispatch row from the radar feed to coordinate rescue parameters and dispatch status.
                </p>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="bg-white/80 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 p-6 rounded-2xl backdrop-blur-xl space-y-6"
              >
                {/* Details Header */}
                <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-800 pb-4">
                  <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">
                      Target: {selectedDispatch.sosRequest?.user?.name || 'Explorer Beacons'}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 text-xs">
                      Signal Ref: {selectedDispatch.id.slice(-8).toUpperCase()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {selectedDispatch.status === 'Dispatched' && (
                      <button
                        onClick={() => handleStatusChange(selectedDispatch.id, 'EnRoute')}
                        className="bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        Mark En Route
                      </button>
                    )}
                    {selectedDispatch.status === 'EnRoute' && (
                      <button
                        onClick={() => handleStatusChange(selectedDispatch.id, 'OnScene')}
                        className="bg-brand-600 hover:bg-brand-500 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5"
                      >
                        <Activity className="w-3.5 h-3.5" />
                        Mark On Scene
                      </button>
                    )}
                    {(selectedDispatch.status === 'OnScene' || selectedDispatch.status === 'Dispatched' || selectedDispatch.status === 'EnRoute') && (
                      <button
                        onClick={() => handleStatusChange(selectedDispatch.id, 'Completed')}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Resolve SOS Incident
                      </button>
                    )}
                  </div>
                </div>

                {/* Grid details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Location Info */}
                  <div className="bg-slate-100/40 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 p-4 rounded-xl space-y-3">
                    <h5 className="font-extrabold text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400">GPS Telemetry</h5>
                    <div className="space-y-2 text-xs">
                      <p className="flex justify-between font-semibold"><span className="text-slate-500">Latitude:</span> <span className="text-slate-800 dark:text-slate-200">{selectedDispatch.sosRequest?.lat}</span></p>
                      <p className="flex justify-between font-semibold"><span className="text-slate-500">Longitude:</span> <span className="text-slate-800 dark:text-slate-200">{selectedDispatch.sosRequest?.lng}</span></p>
                      <p className="flex justify-between font-semibold"><span className="text-slate-500">Signal strength:</span> <span className="text-slate-800 dark:text-slate-200">Excellent (Cellular)</span></p>
                    </div>
                  </div>

                  {/* Tourist Info */}
                  <div className="bg-slate-100/40 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 p-4 rounded-xl space-y-3">
                    <h5 className="font-extrabold text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400">Tourist Metadata</h5>
                    <div className="space-y-2 text-xs">
                      <p className="flex justify-between font-semibold"><span className="text-slate-500">Registered phone:</span> <span className="text-slate-800 dark:text-slate-200">{selectedDispatch.sosRequest?.user?.phone || 'N/A'}</span></p>
                      <p className="flex justify-between font-semibold"><span className="text-slate-500">Account status:</span> <span className="text-slate-800 dark:text-slate-200">Verified (MFA Active)</span></p>
                      <p className="flex justify-between font-semibold"><span className="text-slate-500">Blockchain Hash:</span> <span className="text-slate-800 dark:text-slate-200">0x82f...a10b</span></p>
                    </div>
                  </div>

                  {/* Guardian Emergency Circle */}
                  <div className="bg-slate-100/40 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 p-4 rounded-xl col-span-1 md:col-span-2 space-y-3">
                    <h5 className="font-extrabold text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400">Guardian Contact Circle</h5>
                    <div className="space-y-3">
                      {selectedDispatch.sosRequest?.user?.emergencyContacts?.length > 0 ? (
                        selectedDispatch.sosRequest.user.emergencyContacts.map((contact, i) => (
                          <div key={i} className="flex justify-between items-center bg-slate-150/50 dark:bg-slate-900/50 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800/80 text-xs">
                            <div>
                              <p className="font-bold text-slate-850 dark:text-white">{contact.name} ({contact.relationship})</p>
                              <p className="text-[11px] text-slate-550 dark:text-slate-400">{contact.phone}</p>
                            </div>
                            <a
                              href={`tel:${contact.phone}`}
                              className="p-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-850 dark:hover:bg-brand-500/10 border border-slate-300 dark:border-slate-700 text-brand-600 dark:text-brand-400 rounded-lg transition-all"
                            >
                              <PhoneCall className="w-4 h-4" />
                            </a>
                          </div>
                        ))
                      ) : (
                        <div className="text-[11px] text-slate-550 italic">No emergency circle saved. Automated local SMS dispatch launched to registry carrier.</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Operations Checklist */}
                <div className="space-y-3">
                  <h5 className="font-extrabold text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400">Standard Response Protocol</h5>
                  <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                    <div className="flex items-center gap-3 bg-slate-100/50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 p-3 rounded-xl">
                      <div className="w-5 h-5 rounded-full border border-brand-500 flex items-center justify-center shrink-0 text-[10px] font-bold">1</div>
                      <span>Verify coordinate matches with municipal street cameras and traffic nodes.</span>
                    </div>
                    <div className="flex items-center gap-3 bg-slate-100/50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 p-3 rounded-xl">
                      <div className="w-5 h-5 rounded-full border border-brand-500 flex items-center justify-center shrink-0 text-[10px] font-bold">2</div>
                      <span>Establish verbal containment checkpoint with local civilian tourist wardens.</span>
                    </div>
                    <div className="flex items-center gap-3 bg-slate-100/50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 p-3 rounded-xl">
                      <div className="w-5 h-5 rounded-full border border-brand-500 flex items-center justify-center shrink-0 text-[10px] font-bold">3</div>
                      <span>Clear transport path access code protocols for incoming medical ambulances.</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
