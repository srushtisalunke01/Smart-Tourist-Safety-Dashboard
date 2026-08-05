import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { Compass, Sparkles, MapPin, Calendar, CreditCard, ChevronRight, Leaf, ShieldAlert, CheckSquare, Trash2 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useTheme } from '../context/ThemeContext';

const interestOptions = ['Historical', 'Nature & Scenic', 'Adventure Sports', 'Religious', 'Shopping & Markets', 'Food Exploration'];
const styleOptions = ['Budget Friendly', 'Balanced Comfort', 'Ultra Luxury'];
const groupOptions = ['Solo Traveler', 'Couple / Pair', 'Family Vacation', 'Friends Group'];
const transportOptions = ['Walking & Rickshaw', 'Public Transport (Metro/Bus)', 'Private Cab / Self-Drive'];

const TripPlanner = () => {
  const { generateTripPlan, trips, deleteTrip, triggerToast } = useApp();
  const { t } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [destination, setDestination] = useState('');
  const [budget, setBudget] = useState('10000');
  const [days, setDays] = useState('3');
  const [interests, setInterests] = useState([]);
  const [travelStyle, setTravelStyle] = useState('Balanced Comfort');
  const [groupType, setGroupType] = useState('Solo Traveler');
  const [transportation, setTransportation] = useState('Public Transport (Metro/Bus)');
  
  const [loading, setLoading] = useState(false);
  const [currentPlan, setCurrentPlan] = useState(null);

  const toggleInterest = (interest) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter(i => i !== interest));
    } else {
      setInterests([...interests, interest]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!destination) return triggerToast('Please enter a destination', 'warning');
    
    setLoading(true);
    try {
      const response = await generateTripPlan({
        destination,
        budget: Number(budget),
        days: Number(days),
        interests,
        travelStyle,
        groupType,
        transportation
      });
      setCurrentPlan(response.details || response.trip || response);
      triggerToast('AI Safety itinerary generated!', 'success');
    } catch (err) {
      console.error(err);
      triggerToast('Itinerary engine timeout', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getChartData = () => {
    if (!currentPlan || !currentPlan.budgetBreakdown) return [];
    return Object.entries(currentPlan.budgetBreakdown).map(([key, val]) => ({
      name: key.toUpperCase(),
      value: val
    }));
  };

  const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8 min-h-screen text-slate-800 dark:text-slate-100 transition-colors duration-300">
      
      {/* Title block */}
      <div className="glass border border-slate-200 dark:border-white/10 p-6 rounded-3xl relative overflow-hidden shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="absolute right-0 top-0 w-36 h-36 bg-brand-500/5 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="space-y-1">
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-7 h-7 text-brand-500 animate-spin-slow" />
            AI Smart Trip & Safe Route Planner
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-455 font-medium">
            Generate customized day itineraries, optimize budgets, and assess path safety risks instantly.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left column: Setup Form & History */}
        <div className="lg:col-span-5 space-y-6">
          <form onSubmit={handleSubmit} className="glass border border-slate-200 dark:border-white/10 p-6 rounded-3xl space-y-6 shadow-xl relative w-full">
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5 border-b border-slate-200 dark:border-white/5 pb-2">
              <Compass className="w-4 h-4 text-brand-500" />
              {t("tripPlanner.title")}
            </h3>

          {/* Destination & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">{t("tripPlanner.destination")}</label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 dark:text-slate-550" />
                <input
                  type="text"
                  required
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g. Goa, Jaipur, Delhi"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl pl-10 pr-3 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-500 font-semibold shadow-inner"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">{t("tripPlanner.days")}</label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 dark:text-slate-550" />
                <input
                  type="number"
                  min="1"
                  max="14"
                  required
                  value={days}
                  onChange={(e) => setDays(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl pl-10 pr-3 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-500 font-bold shadow-inner"
                />
              </div>
            </div>
          </div>

          {/* Budget & Style */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">{t("tripPlanner.budget")}</label>
              <div className="relative">
                <CreditCard className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 dark:text-slate-550" />
                <input
                  type="number"
                  min="1000"
                  required
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl pl-10 pr-3 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-500 font-bold shadow-inner"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">{t("settings")}</label>
              <select
                value={travelStyle}
                onChange={(e) => setTravelStyle(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 text-xs py-2.5 px-3 rounded-xl focus:border-brand-500 focus:outline-none font-bold shadow-md cursor-pointer hover:border-brand-400 transition-all"
              >
                {styleOptions.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          </div>

          {/* Group & Transport */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">{t("profileTitle")}</label>
              <select
                value={groupType}
                onChange={(e) => setGroupType(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 text-xs py-2.5 px-3 rounded-xl focus:border-brand-500 focus:outline-none font-bold shadow-md cursor-pointer hover:border-brand-400 transition-all"
              >
                {groupOptions.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">{t("opsTitle")}</label>
              <select
                value={transportation}
                onChange={(e) => setTransportation(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 text-xs py-2.5 px-3 rounded-xl focus:border-brand-500 focus:outline-none font-bold shadow-md cursor-pointer hover:border-brand-400 transition-all"
              >
                {transportOptions.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          </div>

          {/* Interests Category Checklist */}
          <div className="space-y-2">
            <label className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider block">{t("tripPlanner.interests")}</label>
            <div className="grid grid-cols-2 gap-2.5">
              {interestOptions.map((o) => (
                <button
                  type="button"
                  key={o}
                  onClick={() => toggleInterest(o)}
                  className={`px-3 py-2 text-[11px] rounded-xl font-bold border transition-all text-left flex items-center gap-1.5 ${
                    interests.includes(o)
                      ? 'bg-brand-500/10 border-brand-500 text-brand-500'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-650 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {interests.includes(o) ? '● ' : '○ '} {o}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-600 text-white font-extrabold text-xs py-3.5 rounded-xl shadow-lg hover:shadow-brand-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? t("tripPlanner.generating") : t("tripPlanner.generateBtn")}
          </button>
        </form>

        {/* History Panel */}
        {trips && trips.length > 0 && (
          <div className="glass border border-slate-200 dark:border-white/10 p-6 rounded-3xl space-y-4 shadow-xl w-full">
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-white/5 pb-2 flex items-center gap-2">
              📂 Saved Safe Itineraries ({trips.length})
            </h3>
            <div className="space-y-3 max-h-48 overflow-y-auto pr-1 no-scrollbar">
              {trips.map(t => (
                <div key={t._id} className="flex justify-between items-center bg-slate-100/50 dark:bg-white/5 border border-slate-200 dark:border-white/5 p-3 rounded-2xl">
                  <button 
                    type="button"
                    onClick={() => setCurrentPlan(t)}
                    className="text-left font-bold text-xs text-slate-805 dark:text-slate-200 hover:text-brand-500 transition-colors flex-grow cursor-pointer truncate mr-2 bg-transparent border-0"
                  >
                    🗺️ {t.destination} ({t.days} Days)
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteTrip(t._id)}
                    className="p-1.5 text-slate-450 hover:text-red-500 transition-colors cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-4.5 h-4.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

        {/* Right column: Itinerary Display Output */}
        <div className="lg:col-span-7 space-y-6">
          
          {loading && (
            <div className="glass border border-slate-200 dark:border-white/10 p-12 rounded-3xl text-center space-y-4 animate-pulse">
              <div className="w-12 h-12 rounded-full border-4 border-brand-500 border-t-transparent animate-spin mx-auto"></div>
              <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">SafeTour AI Calculating Optimal Itineraries...</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-sm mx-auto">Analyzing safety scores, calculating optimized budget matrices, clustering hotel ratings, and scanning carbon offset guides.</p>
            </div>
          )}

          {!loading && !currentPlan && (
            <div className="glass border border-slate-200 dark:border-white/10 p-12 rounded-3xl text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center mx-auto text-slate-400 text-2xl shadow-inner">🧭</div>
              <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">No Active Travel Guide Selected</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-sm mx-auto">Configure your travel parameters on the left and tap generate. Your guide will load instantly with customized maps and guides.</p>
            </div>
          )}

          {!loading && currentPlan && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Theme & Overview */}
              <div className="glass border border-slate-200 dark:border-white/10 p-6 rounded-3xl space-y-4 relative overflow-hidden">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div>
                    <span className="text-[10px] text-brand-600 dark:text-brand-400 bg-brand-500/10 border border-brand-500/25 px-2.5 py-1 rounded-full font-extrabold uppercase tracking-wide">AI Generated Guide</span>
                    <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-2">{currentPlan.destination}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 italic font-semibold">"{currentPlan.theme}"</p>
                  </div>
                  {/* Eco Carbon Score */}
                  <div className="bg-safe-500/10 border border-safe-500/20 text-safe-600 dark:text-safe-400 p-3 rounded-2xl flex items-center gap-2 font-bold shrink-0 shadow-sm">
                    <Leaf className="w-5 h-5 text-safe-500" />
                    <div>
                      <p className="text-[10px] text-slate-550 dark:text-slate-400">Carbon Offset</p>
                      <p className="text-xs text-slate-900 dark:text-white">{currentPlan.carbonFootprint || '8.5'} / 10</p>
                    </div>
                  </div>
                </div>

                {/* Checklist & Duration Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-white/5 text-xs text-slate-650 dark:text-slate-300 font-medium">
                  <div className="space-y-1.5">
                    <p className="font-black text-slate-800 dark:text-slate-400 flex items-center gap-1 uppercase tracking-wider text-[10px]"><CheckSquare className="w-3.5 h-3.5 text-brand-500" /> Essential Pack Checklist</p>
                    <ul className="grid grid-cols-2 gap-1 text-[10px] text-slate-600 dark:text-slate-350 font-bold list-none">
                      {currentPlan.checklist?.map((item, idx) => <li key={idx}>✓ {item}</li>)}
                    </ul>
                  </div>
                  <div className="space-y-1">
                    <p className="font-black text-slate-800 dark:text-slate-400 flex items-center gap-1 uppercase tracking-wider text-[10px]"><ShieldAlert className="w-3.5 h-3.5 text-brand-500" /> Travel Advisories</p>
                    <p className="text-[10px] leading-relaxed text-slate-500 dark:text-slate-400">Visiting during: {currentPlan.bestVisitingTime}. Estimated transit duration: {currentPlan.estimatedTravelTime}. Check regional map guidelines regularly.</p>
                  </div>
                </div>
              </div>

              {/* Budget Breakdown Chart Display */}
              <div className="glass border border-slate-200 dark:border-white/10 p-6 rounded-3xl shadow-xl grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div>
                  <h4 className="font-extrabold text-xs text-slate-550 dark:text-slate-400 uppercase tracking-widest mb-3">AI Budget Distribution</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                    Optimized for a total budget of <strong className="text-slate-900 dark:text-white">{budget} INR</strong>. Accommodation and local safe transit are pre-allocated for safety assurance.
                  </p>
                  <div className="space-y-2 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                    {getChartData().map((entry, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-slate-100/50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 p-2 rounded-lg">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                          {entry.name}
                        </span>
                        <span className="text-slate-900 dark:text-white font-extrabold">{entry.value} INR</span>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Recharts Pie */}
                <div className="h-56 w-full shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getChartData()}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {getChartData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: isDark ? '#0f172a' : '#ffffff', 
                          borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', 
                          color: isDark ? '#f1f5f9' : '#0f172a',
                          borderRadius: '8px',
                          fontSize: '11px',
                          fontWeight: 'bold'
                        }} 
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Day Timeline */}
              <div className="space-y-4">
                <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 uppercase tracking-wider">Day-Wise Timeline Route</h4>
                <div className="space-y-6">
                  {currentPlan.itinerary?.map((dayPlan) => (
                    <div key={dayPlan.day} className="relative pl-6 border-l-2 border-brand-500/20 space-y-4">
                      {/* Timeline Node */}
                      <span className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-white dark:bg-slate-900 border-2 border-brand-500 flex items-center justify-center text-brand-500 dark:text-brand-400 font-extrabold text-[10px]">
                        {dayPlan.day}
                      </span>

                      <div className="space-y-1">
                        <h5 className="font-extrabold text-sm text-slate-900 dark:text-white">Day {dayPlan.day}: {dayPlan.theme}</h5>
                      </div>

                      {/* Activities Grid */}
                      <div className="grid grid-cols-1 gap-4">
                        {dayPlan.activities?.map((act, idx) => (
                          <div key={idx} className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 rounded-2xl p-4 space-y-2 hover:border-brand-500/10 transition-all shadow-sm">
                            <div className="flex justify-between items-center gap-1">
                              <span className="text-[10px] text-brand-600 dark:text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded font-black">{act.time}</span>
                              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">{act.cost} INR</span>
                            </div>
                            <h6 className="font-bold text-xs text-slate-800 dark:text-slate-100">{act.activity} ({act.location})</h6>
                            <p className="text-[10px] leading-relaxed text-slate-500 dark:text-slate-400 font-semibold">{act.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default TripPlanner;
