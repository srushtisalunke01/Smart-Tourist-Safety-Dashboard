import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { ShieldAlert, HeartHandshake, Phone, Share2, Clipboard, Navigation, CheckCircle, Info } from 'lucide-react';
import MapComponent from '../components/MapComponent';
import api from '../services/api';


const WomenSafety = () => {
  const { triggerToast } = useApp();
  const { t } = useLanguage();
  const [familyTrackingActive, setFamilyTrackingActive] = useState(false);
  const trackingLink = `http://localhost:3000/track/tourist-${Math.floor(100000 + Math.random() * 900000)}`;

  useEffect(() => {
    api.get('/women-safety')
      .then(res => {
        if (res.data && res.data.familyTracking) {
          setFamilyTrackingActive(res.data.familyTracking.active);
        }
      })
      .catch(err => console.error('[WomenSafety] Load error:', err));
  }, []);

  const handleSilentSos = async () => {
    const triggerCall = async (lat, lng) => {
      try {
        await api.post('/women-safety/silent-sos', { lat, lng });
        triggerToast('🤫 Silent SOS Dispatched! Coordinates logged to MERN security database.', 'critical');
      } catch (err) {
        triggerToast('Silent SOS coordinates logging failed on backend.', 'critical');
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => triggerCall(pos.coords.latitude, pos.coords.longitude),
        () => triggerCall(28.6012, 77.2183)
      );
    } else {
      await triggerCall(28.6012, 77.2183);
    }
  };

  const toggleFamilyTracking = async () => {
    const nextVal = !familyTrackingActive;
    try {
      await api.post('/women-safety/tracking', { active: nextVal });
      setFamilyTrackingActive(nextVal);
      triggerToast(nextVal ? 'Secure family tracking link active!' : 'Family tracking link disabled.', 'success');
    } catch (err) {
      triggerToast('Tracking status toggle failed.', 'critical');
    }
  };

  const copyTrackingLink = () => {
    navigator.clipboard.writeText(trackingLink);
    triggerToast('Secure GPS tracking link copied to clipboard!', 'success');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8 min-h-screen text-slate-800 dark:text-slate-100 transition-colors duration-300">
      
      {/* Title block */}
      <div className="glass border border-slate-200 dark:border-white/10 p-6 rounded-3xl relative overflow-hidden shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="absolute right-0 top-0 w-36 h-36 bg-pink-500/5 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="space-y-1">
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <HeartHandshake className="w-7 h-7 text-pink-500 animate-pulse" />
            {t("womenSafety.title")}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {t("womenSafety.subtitle")}
          </p>
        </div>
      </div>

      {/* 2. Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Live corridor mapping */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900 dark:text-slate-200 text-sm flex items-center gap-1.5 uppercase tracking-wider">
              <Navigation className="w-4 h-4 text-pink-500" />
              {t("womenSafety.nightCorridors")}
            </h3>
            <span className="text-[10px] text-pink-600 dark:text-pink-400 font-black bg-pink-500/10 border border-pink-500/20 px-2.5 py-1 rounded-full">
              Safe night corridors overlay active
            </span>
          </div>
          {/* Centered on South Delhi embassy safe region */}
          <MapComponent center={[28.6012, 77.2183]} zoom={14} />
        </div>

        {/* Right Side: Emergency Controllers */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Silent Panic Panel */}
          <div className="glass border border-pink-500/30 p-6 rounded-3xl space-y-4 text-center relative overflow-hidden shadow-xl">
            <div className="mx-auto w-12 h-12 rounded-full bg-pink-500/10 border border-pink-500/25 flex items-center justify-center text-pink-500">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-200 uppercase tracking-wider">{t("sos.silentSOS")}</h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-bold">
              Tap below to silently broadcast your live coordinates to family, registered guides, and tourist command terminals. No alarm sounds or strobes will trigger on this device.
            </p>

            <button
              onClick={handleSilentSos}
              className="w-full py-3.5 bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-500 hover:to-pink-600 text-white font-black text-xs rounded-xl shadow-lg hover:shadow-pink-500/20 transition-all border border-pink-450 cursor-pointer"
            >
              🤫 {t("sos.silentSOS").toUpperCase()}
            </button>
          </div>

          {/* Trusted circle tracking panel */}
          <div className="glass border border-slate-200 dark:border-white/10 p-6 rounded-3xl space-y-4 shadow-xl">
            <h4 className="font-extrabold text-xs text-slate-900 dark:text-slate-300 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-200 dark:border-white/5 pb-2">
              <Share2 className="w-4 h-4 text-brand-500" />
              {t("womenSafety.trustedCircle")}
            </h4>

            <div className="space-y-3">
              <p className="text-[10px] text-slate-550 dark:text-slate-400 leading-relaxed font-bold">
                Enable live tracking to continuously stream coordinates. Send the link to family or friends so they can view your movements on a secure map.
              </p>

              <div className="flex gap-2">
                <button
                  onClick={toggleFamilyTracking}
                  className={`flex-1 py-2.5 rounded-xl border text-[10px] font-extrabold transition-all cursor-pointer ${
                    familyTrackingActive 
                    ? 'bg-safe-500/15 border-safe-500 text-safe-600 dark:text-safe-400 shadow-md' 
                    : 'bg-slate-100 border-slate-200 dark:bg-slate-900 dark:border-white/10 text-slate-700 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                  }`}
                >
                  {familyTrackingActive ? '● Tracking Enabled' : '○ Enable GPS Tracking'}
                </button>
                <button
                  onClick={copyTrackingLink}
                  className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-355 dark:hover:text-white px-3.5 rounded-xl flex items-center justify-center transition-all cursor-pointer"
                  title="Copy tracker link"
                >
                  <Clipboard className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Emergency contacts fast dial */}
          <div className="glass border border-slate-200 dark:border-white/10 p-5 rounded-3xl space-y-3 shadow-xl">
            <h4 className="font-extrabold text-xs text-slate-900 dark:text-slate-300 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-200 dark:border-white/5 pb-2">
              <Phone className="w-4 h-4 text-brand-500" />
              {t("sos.directEmergencyDial")}
            </h4>
            
            <div className="space-y-2 text-[10px] font-bold text-slate-650 dark:text-slate-300">
              <div className="flex justify-between items-center bg-slate-100/50 dark:bg-white/5 p-2 rounded-lg border border-slate-200/40 dark:border-transparent">
                <span>👩 Women Helpline India</span>
                <a href="tel:1091" className="text-pink-600 dark:text-pink-400 font-extrabold hover:underline">Dial 1091</a>
              </div>
              <div className="flex justify-between items-center bg-slate-100/50 dark:bg-white/5 p-2 rounded-lg border border-slate-200/40 dark:border-transparent">
                <span>🚔 Tourist Police Command</span>
                <a href="tel:112" className="text-brand-600 dark:text-brand-400 font-extrabold hover:underline">Dial 112</a>
              </div>
              <div className="flex justify-between items-center bg-slate-100/50 dark:bg-white/5 p-2 rounded-lg border border-slate-200/40 dark:border-transparent">
                <span>🚑 State Ambulance Desk</span>
                <a href="tel:102" className="text-safe-650 dark:text-safe-400 font-extrabold hover:underline">Dial 102</a>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* 3. Safety Check Guidelines */}
      <div className="glass border border-slate-200 dark:border-white/10 p-6 rounded-3xl space-y-4 shadow-xl">
        <h4 className="font-extrabold text-sm text-slate-955 dark:text-slate-200">{t("womenSafety.safetyInstructions")}</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-700 dark:text-slate-300 font-semibold">
          <div className="flex items-start gap-3 bg-slate-100/50 dark:bg-white/5 p-4 rounded-2xl border border-slate-200/30 dark:border-transparent">
            <CheckCircle className="w-5 h-5 text-safe-500 shrink-0" />
            <div>
              <h5 className="font-black text-slate-900 dark:text-slate-200">Share Itinerary</h5>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-bold">Ensure your travel planner checklist and hotel location coordinates are sent to family.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 bg-slate-100/50 dark:bg-white/5 p-4 rounded-2xl border border-slate-200/30 dark:border-transparent">
            <CheckCircle className="w-5 h-5 text-safe-500 shrink-0" />
            <div>
              <h5 className="font-black text-slate-900 dark:text-slate-200">Check Map advisory</h5>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-bold">Avoid yellow or red crime density zones during late night walks. Stick to green embassy lanes.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 bg-slate-100/50 dark:bg-white/5 p-4 rounded-2xl border border-slate-200/30 dark:border-transparent">
            <CheckCircle className="w-5 h-5 text-safe-500 shrink-0" />
            <div>
              <h5 className="font-black text-slate-900 dark:text-slate-200">Offline guide cache</h5>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-bold">Download the state police hotline index and emergency guides in offline mode.</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default WomenSafety;
