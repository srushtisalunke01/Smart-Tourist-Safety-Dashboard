import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useAppStore } from '../store/useAppStore';
import { useLanguage } from '../context/LanguageContext';
import { 
  Flame, Navigation, Phone, 
  MapPin, Clock, CheckCircle, AlertTriangle, Wind, Info, CloudRain 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function RescueDashboard() {
  const { user, token } = useAuthStore();
  const { activeDispatches, fetchActiveDispatches, updateDispatchStatus, triggerToast } = useAppStore();
  const { t } = useLanguage();
  const [selectedDispatch, setSelectedDispatch] = useState(null);

  // Rescue stats
  const [helicoptersActive, setHelicoptersActive] = useState(1);
  const [missingTracked, setMissingTracked] = useState(2);

  useEffect(() => {
    if (token) {
      fetchActiveDispatches(token);
      
      const interval = setInterval(() => {
        fetchActiveDispatches(token);
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [token]);

  const handleStatusChange = async (dispatchId, newStatus) => {
    try {
      await updateDispatchStatus(token, dispatchId, newStatus);
      fetchActiveDispatches(token);
      triggerToast(`Rescue response status: ${newStatus}`, 'success');
      
      if (newStatus === 'Completed') {
        setMissingTracked(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      triggerToast('Status update failed', 'critical');
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
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500 font-extrabold text-xs uppercase tracking-widest mb-1.5 animate-pulse">
              <Flame className="w-4 h-4 text-amber-500 animate-bounce" />
              {t("rescue.terminal") || "Disaster Search & Rescue Control"}
            </div>
            <h1 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-slate-900 via-slate-800 to-slate-650 dark:from-white dark:via-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
              {t("welcome") || "Rescue Console"}: {user?.rescueProfile?.teamName || user?.name}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
              Specialty: {user?.rescueProfile?.specialty || 'Wilderness Rescue'} | Base Status: READY
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-xl font-black text-amber-600 dark:text-amber-500">{helicoptersActive}</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Helicopters Airborn</div>
            </div>
            <div className="w-px h-8 bg-slate-200 dark:bg-slate-800" />
            <div className="text-right">
              <div className="text-xl font-black text-red-655 dark:text-red-500">{missingTracked}</div>
              <div className="text-[10px] text-slate-550 dark:text-slate-400 font-bold uppercase tracking-wider">Missing Cases Tracked</div>
            </div>
          </div>
        </div>

        {/* Dispatch List Feed */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white/80 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 p-5 rounded-2xl backdrop-blur-xl">
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-800 dark:text-slate-300 mb-4 flex items-center gap-2">
              <Navigation className="w-4 h-4 text-amber-500 animate-spin" />
              {t("admin.dispatchStatus") || "Search & Rescue Dispatches"} ({activeDispatches.length})
            </h3>

            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              <AnimatePresence>
                {activeDispatches.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 text-xs font-semibold">
                    No active search-and-rescue dispatches assigned to this base.
                  </div>
                ) : (
                  activeDispatches.map((dispatch) => {
                    const isSelected = selectedDispatch?.id === dispatch.id;
                    const statusColor = 
                      dispatch.status === 'Dispatched' ? 'border-red-500/50 bg-red-950/10 text-red-550 dark:text-red-400' :
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
                            ? 'bg-amber-500/10 dark:bg-amber-950/20 border-amber-500/60 shadow-lg shadow-amber-500/10' 
                            : 'bg-slate-100/50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-xs text-slate-800 dark:text-white">
                            Target: {dispatch.sosRequest?.user?.name || 'Explorer'}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${statusColor}`}>
                            {dispatch.status}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          Coords: Lat {dispatch.sosRequest?.lat.toFixed(4)}, Lng {dispatch.sosRequest?.lng.toFixed(4)}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          Time Filed: {new Date(dispatch.dispatchedAt).toLocaleTimeString()}
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
                <Flame className="w-12 h-12 text-amber-500 dark:text-slate-600 mb-4 animate-pulse" />
                <h4 className="font-bold text-slate-500 dark:text-slate-400 text-sm">No Search Unit Selected</h4>
                <p className="text-[11px] text-slate-500 max-w-xs mt-1">
                  Select an active search-and-rescue dispatch row from the radar feed to manage personnel coordinates and check region hazards.
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
                      Target: {selectedDispatch.sosRequest?.user?.name || 'Explorer'}
                    </h3>
                    <p className="text-slate-550 dark:text-slate-400 text-xs">
                      Wilderness Rescue Ref: {selectedDispatch.id.slice(-8).toUpperCase()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {selectedDispatch.status === 'Dispatched' && (
                      <button
                        onClick={() => handleStatusChange(selectedDispatch.id, 'EnRoute')}
                        className="bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        Dispatched Teams
                      </button>
                    )}
                    {selectedDispatch.status === 'EnRoute' && (
                      <button
                        onClick={() => handleStatusChange(selectedDispatch.id, 'OnScene')}
                        className="bg-amber-650 hover:bg-amber-600 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5"
                      >
                        <Activity className="w-3.5 h-3.5" />
                        Search Initiated
                      </button>
                    )}
                    {(selectedDispatch.status === 'OnScene' || selectedDispatch.status === 'Dispatched' || selectedDispatch.status === 'EnRoute') && (
                      <button
                        onClick={() => handleStatusChange(selectedDispatch.id, 'Completed')}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Target Recovered
                      </button>
                    )}
                  </div>
                </div>

                {/* Grid details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Location Info */}
                  <div className="bg-slate-100/40 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 p-4 rounded-xl space-y-3">
                    <h5 className="font-extrabold text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400">GPS Target coordinates</h5>
                    <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                      <p className="flex justify-between font-semibold"><span className="text-slate-500">Latitude:</span> <span className="text-slate-800 dark:text-slate-200">{selectedDispatch.sosRequest?.lat}</span></p>
                      <p className="flex justify-between font-semibold"><span className="text-slate-500">Longitude:</span> <span className="text-slate-800 dark:text-slate-200">{selectedDispatch.sosRequest?.lng}</span></p>
                      <p className="flex justify-between font-semibold"><span className="text-slate-500">Altitude check:</span> <span className="text-slate-800 dark:text-slate-200">Flat coastal plain</span></p>
                    </div>
                  </div>

                  {/* Regional Weather Hazard */}
                  <div className="bg-slate-100/40 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 p-4 rounded-xl space-y-3">
                    <h5 className="font-extrabold text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400">Regional Weather advisories</h5>
                    <div className="space-y-2 text-xs text-amber-600 dark:text-amber-400 font-semibold">
                      <p className="flex justify-between"><span className="text-slate-500">Wind velocity:</span> <span><Wind className="w-3.5 h-3.5 inline mr-1 text-slate-405 dark:text-slate-500" /> 22 knots</span></p>
                      <p className="flex justify-between"><span className="text-slate-500">Precipitation:</span> <span><CloudRain className="w-3.5 h-3.5 inline mr-1 text-slate-405 dark:text-slate-500" /> Heavy rain warning</span></p>
                      <p className="flex justify-between text-red-650 dark:text-red-405"><span className="text-slate-500 font-semibold">Hazard status:</span> HIGH TIDE RED ALERT active</p>
                    </div>
                  </div>

                  {/* Emergency contacts list */}
                  <div className="bg-slate-100/40 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 p-4 rounded-xl col-span-1 md:col-span-2 space-y-3">
                    <h5 className="font-extrabold text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400">Guardian Contact Circle</h5>
                    <div className="space-y-3 font-semibold text-slate-700 dark:text-slate-300">
                      {selectedDispatch.sosRequest?.user?.emergencyContacts?.length > 0 ? (
                        selectedDispatch.sosRequest.user.emergencyContacts.map((contact, i) => (
                          <div key={i} className="flex justify-between items-center bg-slate-150/50 dark:bg-slate-900/50 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800/80 text-xs">
                            <div>
                              <p className="font-bold text-slate-850 dark:text-white">{contact.name} ({contact.relationship})</p>
                              <p className="text-[11px] text-slate-550 dark:text-slate-400">{contact.phone}</p>
                            </div>
                            <a
                              href={`tel:${contact.phone}`}
                              className="p-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-850 dark:hover:bg-amber-500/10 border border-slate-300 dark:border-slate-700 text-amber-600 dark:text-amber-400 rounded-lg transition-all"
                            >
                              <Phone className="w-4 h-4" />
                            </a>
                          </div>
                        ))
                      ) : (
                        <div className="text-[11px] text-slate-550 italic">No custom emergency contacts saved. Default alert broadcasted.</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Operations Protocol */}
                <div className="space-y-3 font-semibold text-slate-700 dark:text-slate-300">
                  <h5 className="font-extrabold text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400">Operational checklist</h5>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-3 bg-slate-100/50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 p-3 rounded-xl">
                      <AlertTriangle className="w-4.5 h-4.5 text-amber-500 shrink-0" />
                      <span>Coordinate search grid limits with air force tracking radar.</span>
                    </div>
                    <div className="flex items-center gap-3 bg-slate-100/50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 p-3 rounded-xl">
                      <Info className="w-4.5 h-4.5 text-amber-500 shrink-0" />
                      <span>Confirm emergency survival rations and medical kits are secured.</span>
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
