import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useAppStore } from '../store/useAppStore';
import { useLanguage } from '../context/LanguageContext';
import { 
  HeartPulse, Activity, Navigation, Phone, 
  MapPin, Clock, PlusCircle, CheckCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function HospitalDashboard() {
  const { user, token } = useAuthStore();
  const { activeDispatches, fetchActiveDispatches, updateDispatchStatus, triggerToast } = useAppStore();
  const { t } = useLanguage();
  const [selectedDispatch, setSelectedDispatch] = useState(null);

  // Hospital capacity mock values
  const [bedsAvailable, setBedsAvailable] = useState(12);
  const [ambulancesActive, setAmbulancesActive] = useState(3);

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
      triggerToast(`Ambulance dispatch status: ${newStatus}`, 'success');
      
      // Shift beds mock value if completed
      if (newStatus === 'Completed') {
        setBedsAvailable(prev => Math.max(0, prev - 1));
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
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-500 font-extrabold text-xs uppercase tracking-widest mb-1.5 animate-pulse">
              <HeartPulse className="w-4 h-4 text-rose-650 dark:text-rose-500 animate-bounce" />
              {t("hospital.terminal") || "Hospital Emergency Command"}
            </div>
            <h1 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-slate-900 via-slate-800 to-slate-655 dark:from-white dark:via-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
              {t("welcome") || "Medical Console"}: {user?.hospitalProfile?.hospitalName || user?.name}
            </h1>
            <p className="text-slate-550 dark:text-slate-400 text-xs mt-1">
              Address: {user?.hospitalProfile?.address || 'Regional Medical Hub'} | Emergency Contact: {user?.hospitalProfile?.contactNumber || 'N/A'}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-xl font-black text-rose-600 dark:text-rose-500">{bedsAvailable}</div>
              <div className="text-[10px] text-slate-550 dark:text-slate-400 font-bold uppercase tracking-wider">ICU Beds Available</div>
            </div>
            <div className="w-px h-8 bg-slate-200 dark:bg-slate-800" />
            <div className="text-right">
              <div className="text-xl font-black text-blue-600 dark:text-blue-400">{ambulancesActive}</div>
              <div className="text-[10px] text-slate-550 dark:text-slate-400 font-bold uppercase tracking-wider">Active Rescues</div>
            </div>
          </div>
        </div>

        {/* Dispatch List Feed */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white/80 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 p-5 rounded-2xl backdrop-blur-xl">
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-800 dark:text-slate-300 mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-rose-500 animate-pulse" />
              {t("admin.dispatchStatus") || "Active Dispatch Alerts"} ({activeDispatches.length})
            </h3>

            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              <AnimatePresence>
                {activeDispatches.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 text-xs font-semibold">
                    No active emergency ambulance dispatches in this sector.
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
                            ? 'bg-rose-500/10 dark:bg-rose-950/20 border-rose-500/60 shadow-lg shadow-rose-500/10' 
                            : 'bg-slate-100/50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-xs text-slate-800 dark:text-white">
                            Patient: {dispatch.sosRequest?.user?.name || 'Explorer'}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${statusColor}`}>
                            {dispatch.status}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          Location: Lat {dispatch.sosRequest?.lat.toFixed(4)}, Lng {dispatch.sosRequest?.lng.toFixed(4)}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          Requested: {new Date(dispatch.dispatchedAt).toLocaleTimeString()}
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
                <HeartPulse className="w-12 h-12 text-rose-500 dark:text-slate-600 mb-4 animate-pulse" />
                <h4 className="font-bold text-slate-500 dark:text-slate-400 text-sm">No Ambulance Selected</h4>
                <p className="text-[11px] text-slate-500 max-w-xs mt-1">
                  Select a live ambulance request card from the radar feed to manage medical dispatches and track incoming casualties.
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
                      Patient: {selectedDispatch.sosRequest?.user?.name || 'Explorer'}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 text-xs">
                      Medical Dispatch Ref: {selectedDispatch.id.slice(-8).toUpperCase()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {selectedDispatch.status === 'Dispatched' && (
                      <button
                        onClick={() => handleStatusChange(selectedDispatch.id, 'EnRoute')}
                        className="bg-amber-650 hover:bg-amber-600 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        Dispatched
                      </button>
                    )}
                    {selectedDispatch.status === 'EnRoute' && (
                      <button
                        onClick={() => handleStatusChange(selectedDispatch.id, 'OnScene')}
                        className="bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5"
                      >
                        <Activity className="w-3.5 h-3.5" />
                        Arrived On Scene
                      </button>
                    )}
                    {(selectedDispatch.status === 'OnScene' || selectedDispatch.status === 'Dispatched' || selectedDispatch.status === 'EnRoute') && (
                      <button
                        onClick={() => handleStatusChange(selectedDispatch.id, 'Completed')}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Patient Admitted
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
                      <p className="flex justify-between font-semibold"><span className="text-slate-500">Estimated distance:</span> <span className="text-slate-800 dark:text-slate-200">2.4 km (4 mins)</span></p>
                    </div>
                  </div>

                  {/* Patient medical tags */}
                  <div className="bg-slate-100/40 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 p-4 rounded-xl space-y-3">
                    <h5 className="font-extrabold text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400">Emergency Circle details</h5>
                    <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                      <p className="flex justify-between font-semibold"><span className="text-slate-500">Primary phone:</span> <span className="text-slate-800 dark:text-slate-200">{selectedDispatch.sosRequest?.user?.phone || 'N/A'}</span></p>
                      <p className="flex justify-between font-semibold"><span className="text-slate-500">Medical tag:</span> <span className="text-slate-800 dark:text-slate-200">DIABETIC TYPE II / ALLERGIC PENICILLIN</span></p>
                      <p className="flex justify-between font-semibold"><span className="text-slate-500">Identity token:</span> <span className="text-slate-800 dark:text-slate-200 font-bold text-brand-600 dark:text-brand-400">Blockchain ID verified</span></p>
                    </div>
                  </div>

                  {/* Emergency contacts list */}
                  <div className="bg-slate-100/40 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 p-4 rounded-xl col-span-1 md:col-span-2 space-y-3">
                    <h5 className="font-extrabold text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400">Guardian Contacts (SOS notified)</h5>
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
                              className="p-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-850 dark:hover:bg-rose-500/10 border border-slate-300 dark:border-slate-700 text-rose-600 dark:text-rose-400 rounded-lg transition-all"
                            >
                              <Phone className="w-4 h-4" />
                            </a>
                          </div>
                        ))
                      ) : (
                        <div className="text-[11px] text-slate-550 italic">No custom emergency contacts saved. Default alert pushed to regional carrier registry.</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Medical Emergency Protocol */}
                <div className="space-y-3">
                  <h5 className="font-extrabold text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400">Admission Instructions</h5>
                  <div className="space-y-2 text-xs text-slate-750 dark:text-slate-300">
                    <div className="flex items-center gap-3 bg-slate-100/50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 p-3 rounded-xl">
                      <PlusCircle className="w-4.5 h-4.5 text-rose-550 dark:text-rose-500 shrink-0" />
                      <span>Prepare ICU Trauma bay with blood types O-Negative matching basic records.</span>
                    </div>
                    <div className="flex items-center gap-3 bg-slate-100/50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 p-3 rounded-xl">
                      <PlusCircle className="w-4.5 h-4.5 text-rose-550 dark:text-rose-500 shrink-0" />
                      <span>Ensure cellular telemedicine stream is synced with ambulance paramedics en route.</span>
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
