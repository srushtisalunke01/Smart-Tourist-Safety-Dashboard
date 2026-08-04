import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { useAuthStore } from '../store/useAuthStore';
import { useLanguage } from '../context/LanguageContext';
import { ShieldAlert, Volume2, VolumeX, EyeOff, Lightbulb, PhoneCall, AlertTriangle, X } from 'lucide-react';

export default function SOSWidget() {
  const { token, user } = useAuthStore();
  const { triggerSOS, triggerToast } = useAppStore();
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [sirenActive, setSirenActive] = useState(false);
  const [strobeActive, setStrobeActive] = useState(false);
  const [audioOscillator, setAudioOscillator] = useState(null);

  // Strobe effect: Toggle body class to blink background
  useEffect(() => {
    let interval;
    if (strobeActive) {
      interval = setInterval(() => {
        document.body.classList.toggle('bg-red-900');
        document.body.classList.toggle('bg-slate-950');
      }, 100);
    } else {
      document.body.classList.remove('bg-red-900');
      document.body.classList.add('bg-slate-950');
    }
    return () => {
      clearInterval(interval);
      document.body.classList.remove('bg-red-900');
      document.body.classList.add('bg-slate-950');
    };
  }, [strobeActive]);

  // Audio Siren generator using Web Audio API
  const toggleSiren = () => {
    if (sirenActive) {
      if (audioOscillator) {
        audioOscillator.stop();
        audioOscillator.disconnect();
      }
      setSirenActive(false);
      setAudioOscillator(null);
    } else {
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        
        const modulator = ctx.createOscillator();
        const modulatorGain = ctx.createGain();
        modulator.frequency.value = 2.5;
        modulatorGain.gain.value = 250;

        modulator.connect(modulatorGain);
        modulatorGain.connect(osc.frequency);
        
        gain.gain.setValueAtTime(0.6, ctx.currentTime);
        osc.connect(gain);
        gain.connect(ctx.destination);

        modulator.start();
        osc.start();

        setAudioOscillator(osc);
        setSirenActive(true);
      } catch (err) {
        console.warn('Audio siren blocked by browser gesture requirements.');
      }
    }
  };

  const handleSosTrigger = async (silent = false) => {
    if (!user) return triggerToast('Please login to activate SOS', 'warning');
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          await triggerSOS(token, position.coords.latitude, position.coords.longitude);
        },
        async () => {
          await triggerSOS(token, 26.9124, 75.7873);
        }
      );
    } else {
      await triggerSOS(token, 26.9124, 75.7873);
    }

    if (!silent) {
      setStrobeActive(true);
      if (!sirenActive) toggleSiren();
    }
  };

  const closePanel = () => {
    if (audioOscillator) {
      audioOscillator.stop();
      audioOscillator.disconnect();
    }
    setSirenActive(false);
    setStrobeActive(false);
    setIsOpen(false);
  };

  return (
    <>
      <div className="pointer-events-auto z-[100001]">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-red-650 to-red-500 text-white font-extrabold text-sm px-6 py-4 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all border border-red-400 whitespace-nowrap"
        >
          <ShieldAlert className="w-5 h-5 animate-bounce" />
          <span>{t("womenSafety.triggerSOS") || "Active SOS Panic"}</span>
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-[99999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 pointer-events-auto">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-red-500/30 p-6 rounded-3xl text-center relative shadow-2xl animate-scaleIn">
            
            <button onClick={closePanel} className="absolute top-4 right-4 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white p-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5">
              <X className="w-4 h-4" />
            </button>

            <div className="mx-auto w-16 h-16 rounded-full bg-red-500/10 border-2 border-red-500 flex items-center justify-center text-red-500 mb-4 animate-pulse">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">{t("sos.emergencyPortal")}</h3>
            <p className="text-xs text-slate-600 dark:text-slate-355 mb-6 leading-relaxed">
              {t("sos.portalSubtitle")}
            </p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <button
                onClick={() => handleSosTrigger(false)}
                className="col-span-2 py-4 bg-gradient-to-r from-red-650 to-red-500 hover:from-red-500 hover:to-red-600 rounded-2xl font-black text-sm text-white shadow-xl hover:shadow-red-500/25 transition-all border border-red-400 flex items-center justify-center gap-2"
              >
                <AlertTriangle className="w-5 h-5 animate-bounce" />
                <span>{t("sos.loudPanic")}</span>
              </button>

              <button
                onClick={() => handleSosTrigger(true)}
                className="py-3 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-350 dark:hover:text-white rounded-xl border border-slate-200 dark:border-white/10 font-bold text-xs flex items-center justify-center gap-2 transition-all"
              >
                <EyeOff className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                <span>{t("sos.silentSOS")}</span>
              </button>

              <button
                onClick={toggleSiren}
                className={`py-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                  sirenActive 
                  ? 'bg-red-500/10 border-red-500 text-red-655 dark:text-red-400 shadow-lg' 
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:border-white/10 text-slate-750 dark:text-slate-300 dark:hover:bg-white/10'
                }`}
              >
                {sirenActive ? <VolumeX className="w-4 h-4 text-red-500" /> : <Volume2 className="w-4 h-4 text-slate-500 dark:text-slate-450" />}
                <span>{t("sos.acousticSiren")}</span>
              </button>

              <button
                onClick={() => setStrobeActive(!strobeActive)}
                className={`col-span-2 py-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                  strobeActive 
                  ? 'bg-amber-500/10 border-amber-500 text-amber-655 dark:text-amber-400 shadow-lg' 
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:border-white/10 text-slate-750 dark:text-slate-300 dark:hover:bg-white/10'
                }`}
              >
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <span>{t("sos.strobeBeacon")}</span>
              </button>
            </div>

            <div className="border-t border-slate-200 dark:border-white/5 pt-4 text-left">
              <h4 className="font-bold text-xs text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">{t("sos.directEmergencyDial")}</h4>
              <div className="grid grid-cols-2 gap-3">
                <a href="tel:112" className="flex items-center gap-2 p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-955 dark:hover:bg-slate-850 rounded-xl border border-slate-200 dark:border-white/5 text-slate-850 dark:text-slate-200 text-xs transition-all font-semibold">
                  <PhoneCall className="w-3.5 h-3.5 text-brand-500" />
                  National Help (112)
                </a>
                <a href="tel:1091" className="flex items-center gap-2 p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-955 dark:hover:bg-slate-850 rounded-xl border border-slate-200 dark:border-white/5 text-slate-850 dark:text-slate-200 text-xs transition-all font-semibold">
                  <PhoneCall className="w-3.5 h-3.5 text-pink-650 dark:text-pink-400" />
                  Women Helpline (1091)
                </a>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
