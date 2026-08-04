import React, { useState, useEffect, useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { useAuthStore } from '../store/useAuthStore';
import { 
  ShieldAlert, Users, AlertOctagon, Megaphone, 
  CheckCircle, Play, Sparkles, Shield, 
  Compass, Radio, Zap, Activity, Cpu, ArrowRight, Bell, AlertCircle, Navigation, MapPin
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import Admin3DMap from '../components/Admin3DMap';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

// Upward Counting Animation Component
function AnimatedCounter({ value }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseInt(value) || 0;
    if (end === 0) {
      setDisplayValue(0);
      return;
    }
    const duration = 1200;
    const increment = end / (duration / 16);
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{displayValue.toLocaleString()}</span>;
}

export default function AdminDashboard() {
  const { token, user } = useAuthStore();
  const { 
    scams, activeSOS, resolveSOS, verifyScamReport, 
    submitAlert, submitSafetyZone, triggerToast, zones, language 
  } = useAppStore();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const [isBooting, setIsBooting] = useState(true);
  const [isIntroActive, setIsIntroActive] = useState(false);
  const [viewMode, setViewMode] = useState('3d'); 
  const [selectedTourist, setSelectedTourist] = useState(null);
  const [cameraResetSignal, setCameraResetSignal] = useState(false);

  const [dronesActive] = useState(4);
  const [policeDispatches] = useState(3);

  // Broadcast alert form state variables
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMsg, setAlertMsg] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('warning');
  const [alertCategory, setAlertCategory] = useState('Weather');

  // Geofence forms state variables
  const [zoneName, setZoneName] = useState('');
  const [zoneLat, setZoneLat] = useState('');
  const [zoneLng, setZoneLng] = useState('');
  const [zoneRadius, setZoneRadius] = useState('1000');
  const [zoneScore, setZoneScore] = useState('80');
  const [zoneCrime, setZoneCrime] = useState('Low');
  const [zoneCrowd, setZoneCrowd] = useState('Moderate');
  const { t } = useLanguage();

  // Boot sequence simulation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsBooting(false);
      setIsIntroActive(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Real-time tourist dataset
  const touristsData = useMemo(() => {
    const list = [
      { id: 'T101', name: 'Arjun Sharma', status: 'safe', lat: 28.6012, lng: 77.2183, phone: '+91 98210 12345', relationship: 'Sister - +91 98210 54321', safetyScore: 92, age: 24, country: 'India', battery: 88, signal: 4, route: 'Lodhi Gardens -> Khan Market', group: 'India Group A' },
      { id: 'T102', name: 'Sarah Jenkins', status: 'warning', lat: 15.5553, lng: 73.7535, phone: '+44 7911 223344', relationship: 'Friend - +44 7911 556677', safetyScore: 62, age: 29, country: 'United Kingdom', battery: 52, signal: 3, route: 'Anjuna Beach -> Vagator Fort', group: 'West Goa Tour' },
      { id: 'T103', name: 'Amit Das', status: 'sos', lat: 26.9124, lng: 75.7873, phone: '+91 91234 56789', relationship: 'Father - +91 98888 77777', safetyScore: 24, age: 31, country: 'India', battery: 15, signal: 1, route: 'Hawa Mahal -> Amber Palace', group: 'Jaipur Solo Trek' }
    ];

    activeSOS.forEach((sos) => {
      const name = sos.user?.name || `Explorer Beacon #${sos.id.slice(-4)}`;
      if (!list.some(l => l.name === name)) {
        list.push({
          id: sos.id,
          name: name,
          status: 'sos',
          lat: sos.lat || 28.5245,
          lng: sos.lng || 77.1855,
          phone: sos.user?.phone || 'N/A',
          relationship: 'Emergency Circle',
          safetyScore: 32,
          age: 26,
          country: 'Explorer',
          battery: 18,
          signal: 2,
          route: 'Live GPS SOS telemetry coordinates',
          group: 'N/A'
        });
      }
    });

    return list;
  }, [activeSOS]);

  // Integrated incident alerts list feed
  const alertFeed = useMemo(() => {
    const list = [
      { id: 'sos-1', touristId: 'T103', type: 'danger', msg: 'SOS Alert: Amit Das - Panic Button Activated', location: 'Jaipur Sector 4', confidence: 99, time: '2 mins ago' },
      { id: 'warn-1', touristId: 'T102', type: 'warning', msg: 'AI Radar: Sarah Jenkins departed safe geo-perimeter', location: 'Anjuna Beach Cliff', confidence: 88, time: '5 mins ago' }
    ];

    activeSOS.forEach(sos => {
      const name = sos.user?.name || 'Explorer Beacons';
      list.unshift({
        id: sos.id,
        touristId: sos.id,
        type: 'danger',
        msg: `🚨 EMERGENCY ALARM: ${name} triggered cellular panic indicator.`,
        location: `Lat: ${sos.lat?.toFixed(4)}, Lng: ${sos.lng?.toFixed(4)}`,
        confidence: 97,
        time: 'Just now'
      });
    });

    scams.filter(s => s.status === 'Reported').forEach((scam, i) => {
      list.push({
        id: scam.id || `scam-${i}`,
        touristId: 'scam',
        type: 'warning',
        msg: `⚠️ Scam reported: ${scam.description.slice(0, 40)}...`,
        location: scam.address || 'Unknown Region',
        confidence: 76,
        time: '10 mins ago'
      });
    });

    return list;
  }, [activeSOS, scams]);

  const handleSendAlert = async (e) => {
    e.preventDefault();
    if (!alertTitle || !alertMsg) return triggerToast('Form inputs required', 'warning');
    try {
      await submitAlert(token, { title: alertTitle, message: alertMsg, severity: alertSeverity, category: alertCategory });
      setAlertTitle('');
      setAlertMsg('');
      triggerToast('Emergency broadcast alert triggered!', 'success');
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateZone = async (e) => {
    e.preventDefault();
    if (!zoneName || !zoneLat || !zoneLng) return triggerToast('Please enter latitude & longitude', 'warning');
    try {
      await submitSafetyZone(token, {
        name: zoneName,
        lat: Number(zoneLat),
        lng: Number(zoneLng),
        radius: Number(zoneRadius),
        safetyScore: Number(zoneScore),
        crimeIndex: zoneCrime,
        crowdDensity: zoneCrowd
      });
      setZoneName('');
      setZoneLat('');
      setZoneLng('');
      triggerToast('Geo-fence sector logged!', 'success');
    } catch (err) {
      console.error(err);
    }
  };

  const chartData = [
    { name: 'Mon', Crimes: 4, SOS: 1, Scams: 8 },
    { name: 'Tue', Crimes: 3, SOS: 2, Scams: 10 },
    { name: 'Wed', Crimes: 6, SOS: 0, Scams: 7 },
    { name: 'Thu', Crimes: 8, SOS: 3, Scams: 12 },
    { name: 'Fri', Crimes: 5, SOS: 5, Scams: 15 },
    { name: 'Sat', Crimes: 10, SOS: 4, Scams: 18 },
    { name: 'Sun', Crimes: 7, SOS: activeSOS.length, Scams: scams.length }
  ];

  if (isBooting) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#02050a] flex flex-col items-center justify-center text-center p-6 relative overflow-hidden transition-colors duration-500">
        <div className="absolute w-[500px] h-[500px] bg-brand-500/10 rounded-full blur-[140px] animate-pulse"></div>
        <div className="space-y-6 relative z-10">
          <Cpu className="w-16 h-16 text-brand-500 animate-spin mx-auto" />
          <div className="space-y-2">
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-widest uppercase">SafeTour AI Mainframe</h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Syncing GIS Telemetry & Incident Databases...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${viewMode === '3d' ? 'bg-transparent' : 'bg-slate-50 dark:bg-[#02050a]'} text-slate-800 dark:text-slate-100 py-8 px-4 md:px-8 relative overflow-hidden transition-colors duration-500`}>
      
      {/* 3D Map Viewport Overlay */}
      {viewMode === '3d' && (
        <div className="absolute inset-0 z-0 w-full h-full">
          <Admin3DMap 
            tourists={touristsData}
            selectedTourist={selectedTourist}
            setSelectedTourist={setSelectedTourist}
            resetSignal={cameraResetSignal}
            onResetDone={() => setCameraResetSignal(false)}
            zones={zones}
          />
        </div>
      )}

      {/* Main Console overlays */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10 pointer-events-none">
        
        {/* TOP BAR */}
        <div className="lg:col-span-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/85 dark:bg-slate-900/70 border border-slate-200 dark:border-white/5 p-5 rounded-2xl backdrop-blur-xl pointer-events-auto">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-brand-500 dark:text-brand-400 font-extrabold text-xs uppercase tracking-widest">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              {t.systemStatus}
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">{t.opsTitle}</h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setViewMode(viewMode === '3d' ? 'ops' : '3d')}
              className="bg-brand-600 hover:bg-brand-500 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-2"
            >
              <Compass className="w-4 h-4" />
              {viewMode === '3d' ? t.btnSwitchOps : t.btnSwitch3d}
            </button>
            {viewMode === '3d' && (
              <button
                onClick={() => {
                  setSelectedTourist(null);
                  setCameraResetSignal(true);
                }}
                className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-350 dark:border-white/5 font-bold text-xs px-4 py-2.5 rounded-xl transition-all"
              >
                {t.btnReset}
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Sidebar Overlays */}
        {viewMode === '3d' ? (
          <>
            {/* Live Feed Sidebar Left */}
            <div className="lg:col-span-4 space-y-6 pointer-events-auto">
              <div className="bg-white/85 dark:bg-slate-900/80 border border-slate-200 dark:border-white/5 p-5 rounded-2xl backdrop-blur-xl shadow-2xl space-y-4">
                <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <Radio className="w-4 h-4 text-brand-500 animate-pulse" />
                  {t.liveAlerts}
                </h3>
                
                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                  <AnimatePresence>
                    {alertFeed.map((alert) => (
                      <motion.div
                        key={alert.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        onClick={() => {
                          const tourist = touristsData.find(t => t.id === alert.touristId);
                          if (tourist) setSelectedTourist(tourist);
                        }}
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          alert.type === 'danger'
                            ? 'bg-red-950/20 border-red-500/20 text-red-500 dark:text-red-400 hover:bg-red-950/30'
                            : 'bg-amber-950/20 border-amber-500/20 text-amber-600 dark:text-amber-400 hover:bg-amber-950/30'
                        }`}
                      >
                        <p className="font-semibold text-xs leading-relaxed">{alert.msg}</p>
                        <div className="flex justify-between items-center mt-2 text-[10px] text-slate-500 dark:text-slate-400">
                          <span>{alert.location}</span>
                          <span>Confidence: {alert.confidence}%</span>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Profile Inspector Sidebar Right */}
            <div className="lg:col-span-8 pointer-events-auto flex flex-col justify-end">
              <AnimatePresence mode="wait">
                {selectedTourist && (
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 30 }}
                    className="bg-white/85 dark:bg-slate-900/80 border border-slate-200 dark:border-white/5 p-6 rounded-2xl backdrop-blur-xl shadow-2xl space-y-4 max-w-2xl ml-auto w-full"
                  >
                    <div className="flex justify-between items-start border-b border-slate-200 dark:border-white/5 pb-3">
                      <div>
                        <h3 className="text-lg font-black text-slate-900 dark:text-white">{selectedTourist.name}</h3>
                        <p className="text-[10px] text-slate-550 dark:text-slate-400">{selectedTourist.country} | Age: {selectedTourist.age}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${
                        selectedTourist.status === 'sos' ? 'bg-red-950/20 border-red-500/30 text-red-500 dark:text-red-400' :
                        selectedTourist.status === 'warning' ? 'bg-amber-950/20 border-amber-500/30 text-amber-605 dark:text-amber-400' :
                        'bg-emerald-950/20 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                      }`}>
                        {selectedTourist.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase font-black">{t.phoneLabel}</p>
                        <p className="font-semibold text-slate-800 dark:text-slate-200">{selectedTourist.phone}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase font-black">{t.contactLabel}</p>
                        <p className="font-semibold text-slate-800 dark:text-slate-200">{selectedTourist.relationship}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-[10px] text-slate-500 uppercase font-black">Current Route</p>
                        <p className="font-semibold text-slate-800 dark:text-slate-200">{selectedTourist.route}</p>
                      </div>
                    </div>

                    <div className="flex gap-2.5 pt-2">
                      {selectedTourist.status === 'sos' && (
                        <>
                          <button
                            onClick={async () => {
                              try {
                                await resolveSOS(token, selectedTourist.id);
                                setSelectedTourist(null);
                              } catch (err) {
                                console.error(err);
                              }
                            }}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs py-3 rounded-xl transition-all shadow-md"
                          >
                            Resolve Alert Beacon
                          </button>
                          <a
                            href={`tel:${selectedTourist.phone}`}
                            className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-350 dark:border-white/5 font-bold text-xs px-4 py-3 rounded-xl transition-all"
                          >
                            Call Tourist
                          </a>
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        ) : (
          /* FULL OPERATION BOARD CONSOLE VIEW (RECHARTS + FORMS) */
          <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6 pointer-events-auto">
            
            {/* Stats grid row */}
            <div className="md:col-span-3 grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white/85 dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 p-4 rounded-xl backdrop-blur-xl">
                <p className="text-[10px] text-slate-550 dark:text-slate-400 uppercase font-black tracking-wider">{t.activeVisitors}</p>
                <div className="text-2xl font-black text-brand-500 mt-1">
                  <AnimatedCounter value={12500} />
                </div>
              </div>
              <div className="bg-white/85 dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 p-4 rounded-xl backdrop-blur-xl">
                <p className="text-[10px] text-slate-550 dark:text-slate-400 uppercase font-black tracking-wider">{t.sosSignals}</p>
                <div className="text-2xl font-black text-red-500 mt-1">
                  <AnimatedCounter value={activeSOS.length} />
                </div>
              </div>
              <div className="bg-white/85 dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 p-4 rounded-xl backdrop-blur-xl">
                <p className="text-[10px] text-slate-550 dark:text-slate-400 uppercase font-black tracking-wider">Active Drones</p>
                <div className="text-2xl font-black text-blue-500 dark:text-blue-400 mt-1">
                  <AnimatedCounter value={dronesActive} />
                </div>
              </div>
              <div className="bg-white/85 dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 p-4 rounded-xl backdrop-blur-xl">
                <p className="text-[10px] text-slate-555 dark:text-slate-400 uppercase font-black tracking-wider">Police Dispatches</p>
                <div className="text-2xl font-black text-amber-600 dark:text-amber-500 mt-1">
                  <AnimatedCounter value={policeDispatches} />
                </div>
              </div>
            </div>

            {/* Visual Analytics Chart */}
            <div className="md:col-span-2 bg-white/85 dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 p-5 rounded-2xl backdrop-blur-xl">
              <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-800 dark:text-slate-300 mb-4">Historical Incident Index</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorSOS" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1e293b' : '#e2e8f0'} />
                    <XAxis dataKey="name" stroke={isDark ? '#64748b' : '#475569'} fontSize={10} />
                    <YAxis stroke={isDark ? '#64748b' : '#475569'} fontSize={10} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: isDark ? '#0f172a' : '#ffffff', 
                        borderColor: isDark ? '#334155' : '#cbd5e1',
                        color: isDark ? '#f1f5f9' : '#0f172a',
                        borderRadius: '8px',
                        fontSize: '11px',
                        fontWeight: 'bold'
                      }} 
                    />
                    <Area type="monotone" dataKey="SOS" stroke="#ef4444" fillOpacity={1} fill="url(#colorSOS)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Forms section right */}
            <div className="bg-white/85 dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 p-5 rounded-2xl backdrop-blur-xl space-y-6">
              
              {/* Broadcast Alert */}
              <form onSubmit={handleSendAlert} className="space-y-3">
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-red-650 dark:text-red-400 flex items-center gap-1.5">
                  <Megaphone className="w-4.5 h-4.5" />
                  Broadcast Regional warning
                </h4>
                <input
                  type="text"
                  placeholder="Warning Title"
                  value={alertTitle}
                  onChange={(e) => setAlertTitle(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200"
                />
                <textarea
                  placeholder="Warning Advisory details..."
                  rows={2}
                  value={alertMsg}
                  onChange={(e) => setAlertMsg(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200"
                ></textarea>
                <button
                  type="submit"
                  className="w-full bg-red-650 hover:bg-red-600 text-white font-extrabold text-[11px] py-2 rounded-xl"
                >
                  Broadcast Security Alert
                </button>
              </form>

              {/* Define Geofence */}
              <form onSubmit={handleCreateZone} className="space-y-3 pt-4 border-t border-slate-200 dark:border-white/5">
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-brand-600 dark:text-brand-400 flex items-center gap-1.5">
                  <Navigation className="w-4.5 h-4.5" />
                  Draw Geofenced safety zone
                </h4>
                <input
                  type="text"
                  placeholder="Zone Name"
                  value={zoneName}
                  onChange={(e) => setZoneName(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Latitude"
                    value={zoneLat}
                    onChange={(e) => setZoneLat(e.target.value)}
                    className="bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-[11px] text-slate-800 dark:text-slate-200"
                  />
                  <input
                    type="text"
                    placeholder="Longitude"
                    value={zoneLng}
                    onChange={(e) => setZoneLng(e.target.value)}
                    className="bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-[11px] text-slate-800 dark:text-slate-200"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-brand-600 hover:bg-brand-500 text-white font-extrabold text-[11px] py-2 rounded-xl"
                >
                  Establish Geofence Zone
                </button>
              </form>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
