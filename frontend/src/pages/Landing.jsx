import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { useLanguage } from '../context/LanguageContext';
import MapComponent from '../components/MapComponent';
import { Sparkles, AlertTriangle, Eye, Compass, Landmark, CheckCircle, Users, ArrowRight, BookOpen } from 'lucide-react';

export default function Landing() {
  const { activeSOS, zones, scams } = useAppStore();
  const { t } = useLanguage();
  const [stats, setStats] = useState({ tourists: 0, sosResolved: 0, activeZones: 0 });

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => {
        const tourists = prev.tourists < 12500 ? prev.tourists + 125 : 12500;
        const sosResolved = prev.sosResolved < 1840 ? prev.sosResolved + 20 : 1840;
        const activeZones = prev.activeZones < 450 ? prev.activeZones + 5 : 450;
        
        if (tourists === 12500 && sosResolved === 1840 && activeZones === 450) {
          clearInterval(interval);
        }
        return { tourists, sosResolved, activeZones };
      });
    }, 30);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-transparent dark:bg-transparent text-slate-800 dark:text-slate-100 overflow-x-hidden transition-colors duration-300">
      
      {/* 1. Hero Section */}
      <section className="relative pt-8 pb-24 md:pt-16 md:pb-36 px-4 md:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] md:w-[600px] h-[350px] md:h-[600px] bg-brand-500/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/25 text-brand-500 dark:text-brand-400 font-extrabold text-[11px] uppercase tracking-widest mb-6 animate-bounce">
          <Sparkles className="w-3.5 h-3.5" />
          {t("landing.tag")}
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-tight tracking-tight max-w-5xl mb-6 bg-gradient-to-b from-slate-900 to-slate-700 dark:from-white dark:via-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
          {t.heroTitle}
        </h1>

        <p className="text-slate-500 dark:text-slate-400 text-sm md:text-lg max-w-3xl leading-relaxed mb-10 font-semibold">
          {t.heroSubtitle}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 w-full max-w-md">
          <Link to="/register" className="w-full sm:w-auto bg-gradient-to-r from-brand-600 to-brand-500 text-white font-extrabold text-sm px-8 py-4 rounded-2xl hover:shadow-lg hover:shadow-brand-500/20 hover:scale-105 transition-all text-center flex items-center justify-center gap-2">
            {t.getStarted}
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a href="#how-it-works" className="w-full sm:w-auto bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 font-bold text-sm px-8 py-4 rounded-2xl transition-all text-center">
            {t.watchDemo}
          </a>
        </div>

        {/* Counter Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-4xl pt-6 border-t border-slate-200 dark:border-white/5">
          <div className="glass bg-slate-50 border border-slate-200 dark:bg-slate-900/45 dark:border-white/5 p-5 rounded-2xl">
            <h3 className="text-3xl font-extrabold text-brand-500 mb-1">{(stats.tourists).toLocaleString()}+</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">{t.activeVisitors}</p>
          </div>
          <div className="glass bg-slate-50 border border-slate-200 dark:bg-slate-900/45 dark:border-white/5 p-5 rounded-2xl">
            <h3 className="text-3xl font-extrabold text-emerald-600 dark:text-safe-500 mb-1">{(stats.sosResolved + activeSOS.length).toLocaleString()}+</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">{t.sosSignals}</p>
          </div>
          <div className="glass bg-slate-50 border border-slate-200 dark:bg-slate-900/45 dark:border-white/5 p-5 rounded-2xl">
            <h3 className="text-3xl font-extrabold text-amber-600 dark:text-caution-500 mb-1">{stats.activeZones + zones.length}+</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">{t.monitoredRegions}</p>
          </div>
        </div>
      </section>

      {/* 2. Interactive Map Preview Section */}
      <section className="py-16 md:py-24 bg-slate-50 dark:bg-slate-900/35 border-y border-slate-200 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-safe-400 font-extrabold text-[10px] uppercase tracking-wider">
              <Compass className="w-3.5 h-3.5" />
              {t("landing.gisMapping")}
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight">
              {t("landing.gisTitle")}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed font-semibold">
              {t("landing.gisDesc")}
            </p>
            <div className="space-y-3 font-semibold text-xs text-slate-700 dark:text-slate-350">
              <div className="flex items-center gap-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl p-3">
                <CheckCircle className="w-4.5 h-4.5 text-emerald-500" />
                <span>{t("landing.gisBullet1")}</span>
              </div>
              <div className="flex items-center gap-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl p-3">
                <CheckCircle className="w-4.5 h-4.5 text-emerald-500" />
                <span>{t("landing.gisBullet2")}</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <MapComponent />
          </div>

        </div>
      </section>

      {/* 3. Features & AI Capabilities */}
      <section className="py-20 md:py-28 max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center space-y-4 mb-16">
          <span className="text-xs text-brand-500 font-black uppercase tracking-widest">{t("landing.pillar")}</span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white">{t("landing.defenseTitle")}</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base max-w-2xl mx-auto font-semibold">
            {t("landing.defenseDesc")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="glass bg-slate-50 border border-slate-200 dark:bg-slate-900/45 dark:border-white/5 p-6 rounded-2xl hover:border-brand-500/30 transition-all space-y-4 group">
            <div className="p-3 bg-brand-500/10 border border-brand-500/20 text-brand-500 rounded-xl w-fit group-hover:scale-110 transition-transform">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{t.tripPlanner}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
              {t("tripPlanner.subtitle")}
            </p>
          </div>

          <div className="glass bg-slate-50 border border-slate-200 dark:bg-slate-900/45 dark:border-white/5 p-6 rounded-2xl hover:border-brand-500/30 transition-all space-y-4 group">
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl w-fit group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{t("landing.emergencySOS")}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
              {t("landing.emergencySOSDesc")}
            </p>
          </div>

          <div className="glass bg-slate-50 border border-slate-200 dark:bg-slate-900/45 dark:border-white/5 p-6 rounded-2xl hover:border-brand-500/30 transition-all space-y-4 group">
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-600 rounded-xl w-fit group-hover:scale-110 transition-transform">
              <Eye className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{t.scamRadar}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
              {t("dashboards.scamReporting")}
            </p>
          </div>

          <div className="glass bg-slate-50 border border-slate-200 dark:bg-slate-900/45 dark:border-white/5 p-6 rounded-2xl hover:border-brand-500/30 transition-all space-y-4 group">
            <div className="p-3 bg-pink-500/10 border border-pink-500/20 text-pink-500 rounded-xl w-fit group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{t.womenSafety}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
              {t("womenSafety.subtitle")}
            </p>
          </div>

          <div className="glass bg-slate-50 border border-slate-200 dark:bg-slate-900/45 dark:border-white/5 p-6 rounded-2xl hover:border-brand-500/30 transition-all space-y-4 group">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 rounded-xl w-fit group-hover:scale-110 transition-transform">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{t.offlineMode}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
              {t("offline.subtitle")}
            </p>
          </div>

          <div className="glass bg-slate-50 border border-slate-200 dark:bg-slate-900/45 dark:border-white/5 p-6 rounded-2xl hover:border-brand-500/30 transition-all space-y-4 group">
            <div className="p-3 bg-brand-500/10 border border-brand-500/20 text-brand-500 rounded-xl w-fit group-hover:scale-110 transition-transform">
              <Landmark className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{t("landing.smartCity")}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
              {t("landing.smartCityDesc")}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
