import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useApp } from '../context/AppContext';
import { Download, CheckSquare, Phone, BookOpen, AlertTriangle, ShieldAlert } from 'lucide-react';

const offlineGuides = [
  { id: 'goa', name: 'Goa Coastal Guide', size: '2.4 MB' },
  { id: 'delhi', name: 'Delhi Metro Transit Route', size: '4.1 MB' },
  { id: 'jaipur', name: 'Jaipur Fort walking trails', size: '1.8 MB' }
];

const OfflineDashboard = () => {
  const { t } = useLanguage();
  const { offlineCache, downloadOfflineCache, clearOfflineCache, triggerToast } = useApp();
  
  const downloaded = (offlineCache || [])
    .filter(c => c.status === 'downloaded')
    .map(c => c.packageId);

  const [downloading, setDownloading] = useState({});

  const handleDownload = (id) => {
    if (downloaded.includes(id)) return;

    setDownloading(prev => ({ ...prev, [id]: 0 }));

    const guide = offlineGuides.find(g => g.id === id) || { name: 'Offline Guide', size: '2.0 MB' };

    // Simulate progress bar increments
    let progress = 0;
    const interval = setInterval(async () => {
      progress += 10;
      setDownloading(prev => ({ ...prev, [id]: progress }));
      
      if (progress >= 100) {
        clearInterval(interval);
        setDownloading(prev => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
        
        try {
          await downloadOfflineCache(id, guide.name, guide.size);
          triggerToast('Offline packet cached securely in MongoDB database!', 'success');
        } catch (err) {
          triggerToast('Failed to save offline package cache', 'error');
        }
      }
    }, 150);
  };

  const handleRemove = async (id) => {
    try {
      await clearOfflineCache(id);
      triggerToast('Offline cache cleared from MongoDB.', 'info');
    } catch (err) {
      triggerToast('Failed to clear cache', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8 min-h-screen text-slate-800 dark:text-slate-100 transition-colors duration-500">
      
      {/* 1. Header Banner */}
      <div className="glass border border-slate-200 dark:border-white/10 p-6 rounded-3xl relative overflow-hidden shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="absolute right-0 top-0 w-36 h-36 bg-brand-500/5 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="space-y-1">
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-7 h-7 text-brand-500 animate-pulse-slow" />
            {t("offline.title")}
          </h2>
          <p className="text-xs text-slate-550 dark:text-slate-400 font-medium">
            {t("offline.subtitle")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Cache managers */}
        <div className="lg:col-span-6 space-y-6">
          <div className="glass border border-slate-200 dark:border-white/10 p-6 rounded-3xl space-y-4 shadow-xl">
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 uppercase tracking-widest border-b border-slate-200 dark:border-white/5 pb-2 flex items-center gap-1.5">
              <Download className="w-4 h-4 text-brand-500" />
              {t("offline.resources")}
            </h3>
            
            <div className="space-y-3">
              {offlineGuides.map((guide) => (
                <div key={guide.id} className="bg-slate-100/50 dark:bg-white/5 border border-slate-200 dark:border-white/5 p-4 rounded-2xl flex items-center justify-between gap-4">
                  <div>
                    <h5 className="font-bold text-xs text-slate-800 dark:text-slate-200">{guide.name}</h5>
                    <p className="text-[10px] text-slate-550 dark:text-slate-400">{t("size") || "Packet Size"}: {guide.size}</p>
                  </div>
                  
                  <div>
                    {downloading[guide.id] !== undefined ? (
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-slate-200 dark:bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-350 dark:border-white/15">
                          <div className="bg-brand-500 h-full transition-all duration-150" style={{ width: `${downloading[guide.id]}%` }}></div>
                        </div>
                        <span className="text-[9px] font-extrabold text-brand-500 dark:text-brand-400">{downloading[guide.id]}%</span>
                      </div>
                    ) : downloaded.includes(guide.id) ? (
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-emerald-600 dark:text-safe-500 font-bold">{t("offline.cached") || "✓ Cached Offline"}</span>
                        <button onClick={() => handleRemove(guide.id)} className="text-[9px] text-slate-500 hover:text-danger-600 dark:hover:text-danger-500 underline font-semibold transition-colors">{t("dashboards.removeContact") || "Clear"}</button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleDownload(guide.id)}
                        className="bg-brand-600 hover:bg-brand-500 text-white font-bold text-[10px] px-3.5 py-1.5 rounded-xl flex items-center gap-1 transition-all"
                      >
                        <Download className="w-3.5 h-3.5" /> {t("download") || "Download"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Emergency Dial Direct List */}
          <div className="glass border border-slate-200 dark:border-white/10 p-6 rounded-3xl space-y-4 shadow-xl">
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 uppercase tracking-widest border-b border-slate-200 dark:border-white/5 pb-2 flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-brand-500" />
              {t("offline.contacts")}
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <div className="bg-slate-100/50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 p-3 rounded-2xl flex justify-between items-center">
                <div>
                  <p className="text-[9px] text-slate-550 dark:text-slate-400 uppercase tracking-wide">National Safety</p>
                  <p className="text-slate-800 dark:text-slate-200">📞 112</p>
                </div>
                <span className="text-[9px] bg-brand-500/10 text-brand-500 dark:text-brand-400 px-2 py-0.5 rounded border border-brand-500/25 uppercase font-bold">24 Hours</span>
              </div>
              <div className="bg-slate-100/50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 p-3 rounded-2xl flex justify-between items-center">
                <div>
                  <p className="text-[9px] text-slate-550 dark:text-slate-400 uppercase tracking-wide">Women Helpline</p>
                  <p className="text-pink-650 dark:text-pink-400">📞 1091</p>
                </div>
                <span className="text-[9px] bg-pink-500/10 text-pink-600 dark:text-pink-400 px-2 py-0.5 rounded border border-pink-500/25 uppercase font-bold">24 Hours</span>
              </div>
              <div className="bg-slate-100/50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 p-3 rounded-2xl flex justify-between items-center">
                <div>
                  <p className="text-[9px] text-slate-550 dark:text-slate-400 uppercase tracking-wide">Disaster Management</p>
                  <p className="text-caution-650 dark:text-caution-400">📞 1078</p>
                </div>
                <span className="text-[9px] bg-caution-500/10 text-caution-650 dark:text-caution-400 px-2 py-0.5 rounded border border-caution-500/25 uppercase font-bold">Toll Free</span>
              </div>
              <div className="bg-slate-100/50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 p-3 rounded-2xl flex justify-between items-center">
                <div>
                  <p className="text-[9px] text-slate-550 dark:text-slate-400 uppercase tracking-wide">Tourist Helpline</p>
                  <p className="text-safe-655 dark:text-safe-400">📞 1363</p>
                </div>
                <span className="text-[9px] bg-safe-500/10 text-safe-650 dark:text-safe-400 px-2 py-0.5 rounded border border-safe-500/25 uppercase font-bold">Multilingual</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: First aid & instructions */}
        <div className="lg:col-span-6 space-y-6">
          <div className="glass border border-slate-200 dark:border-white/10 p-6 rounded-3xl space-y-4 shadow-xl">
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 uppercase tracking-widest border-b border-slate-200 dark:border-white/5 pb-2 flex items-center gap-1.5 text-red-650 dark:text-danger-500">
              <ShieldAlert className="w-4.5 h-4.5 text-red-650 dark:text-danger-500" />
              {t("offline.checklist")}
            </h3>
            
            <div className="space-y-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <div className="bg-slate-100/50 dark:bg-white/5 p-4 rounded-2xl space-y-1 border border-slate-200 dark:border-white/5">
                <h5 className="text-slate-900 dark:text-white font-bold flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4 text-brand-500" />
                  Dealing with potential scammers
                </h5>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                  Do not follow guides recommending private jewelry/handicraft shops. Double check transport fair meters on official boards. Verify guides' government credentials tags.
                </p>
              </div>

              <div className="bg-slate-100/50 dark:bg-white/5 p-4 rounded-2xl space-y-1 border border-slate-200 dark:border-white/5">
                <h5 className="text-slate-900 dark:text-white font-bold flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4 text-brand-500" />
                  Heat stroke first response
                </h5>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                  Move the individual to a cool shade area. Give them cool water if conscious. Avoid heavy clothing. Apply cool damp towels to forehead and neck immediately.
                </p>
              </div>

              <div className="bg-slate-100/50 dark:bg-white/5 p-4 rounded-2xl space-y-1 border border-slate-200 dark:border-white/5">
                <h5 className="text-slate-900 dark:text-white font-bold flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4 text-brand-500" />
                  Accident / Wound dressing
                </h5>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                  Apply direct firm pressure on the wound with clean dressings to halt bleeding. Rinse minor scrapes with clean water. Elevate injured limbs.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default OfflineDashboard;
