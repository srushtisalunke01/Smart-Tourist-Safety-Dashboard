import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useAppStore } from '../store/useAppStore';
import { Award, Compass, ShieldAlert, Cpu, BarChart2, Users, MapPin, Sparkles, ChevronUp, ChevronDown, Check } from 'lucide-react';

export default function JudgeDemoDock() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { triggerToast } = useAppStore();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleQuickLogin = async (email, password, label) => {
    try {
      await login(email, password);
      triggerToast(`Switched identity to ${label}`, 'success');
    } catch (err) {
      triggerToast(`Demo login error: ${err.message}`, 'error');
    }
  };

  return (
    <div className="fixed bottom-4 left-4 z-[99999] pointer-events-auto">
      <div className="glass border border-brand-500/40 rounded-2xl shadow-2xl overflow-hidden max-w-xs transition-all duration-300 bg-slate-900/90 text-white backdrop-blur-xl">
        
        {/* Dock Header Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-4 py-2.5 flex items-center justify-between gap-2 bg-gradient-to-r from-brand-600/30 to-brand-500/20 hover:from-brand-600/50 hover:to-brand-500/40 text-xs font-black uppercase tracking-wider transition-all border-b border-brand-500/20 cursor-pointer"
        >
          <span className="flex items-center gap-1.5 text-brand-400">
            <Award className="w-4 h-4 text-brand-400 animate-pulse" />
            Hackathon Judge Presentation
          </span>
          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>

        {/* Expanded Panel */}
        {isExpanded && (
          <div className="p-3 space-y-3 text-[11px] animate-fadeIn">
            
            {/* Quick Persona Selector */}
            <div className="space-y-1.5">
              <span className="text-[9px] uppercase tracking-widest text-slate-400 font-extrabold block">1. Identity Switcher</span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => handleQuickLogin('tourist@safetour.ai', 'tourist123', 'Tourist Demo')}
                  className="px-2 py-1.5 bg-brand-500/20 hover:bg-brand-500/40 border border-brand-500/30 rounded-lg text-slate-200 font-bold transition-all text-[10px]"
                >
                  👤 Tourist Demo
                </button>
                <button
                  onClick={() => handleQuickLogin('admin@safetour.ai', 'admin123', 'Admin Command')}
                  className="px-2 py-1.5 bg-purple-500/20 hover:bg-purple-500/40 border border-purple-500/30 rounded-lg text-slate-200 font-bold transition-all text-[10px]"
                >
                  🛡️ Admin Command
                </button>
              </div>
            </div>

            {/* Feature Demo Jump Grid */}
            <div className="space-y-1.5">
              <span className="text-[9px] uppercase tracking-widest text-slate-400 font-extrabold block">2. Feature Highlights</span>
              <div className="grid grid-cols-2 gap-1.5 font-bold">
                <button
                  onClick={() => { navigate('/planner'); setIsExpanded(false); }}
                  className="flex items-center gap-1 p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-slate-200 transition-all"
                >
                  <Compass className="w-3 h-3 text-brand-400" />
                  AI Trip Planner
                </button>

                <button
                  onClick={() => { navigate('/scam-radar'); setIsExpanded(false); }}
                  className="flex items-center gap-1 p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-slate-200 transition-all"
                >
                  <MapPin className="w-3 h-3 text-amber-400" />
                  Scam Radar
                </button>

                <button
                  onClick={() => { navigate('/women-safety'); setIsExpanded(false); }}
                  className="flex items-center gap-1 p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-slate-200 transition-all"
                >
                  <ShieldAlert className="w-3 h-3 text-pink-400" />
                  Women Safety
                </button>

                <button
                  onClick={() => { navigate('/community'); setIsExpanded(false); }}
                  className="flex items-center gap-1 p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-slate-200 transition-all"
                >
                  <Users className="w-3 h-3 text-emerald-400" />
                  Community
                </button>

                <button
                  onClick={() => { navigate('/dashboard'); setIsExpanded(false); }}
                  className="col-span-2 flex items-center justify-center gap-1 p-1.5 bg-brand-500/20 hover:bg-brand-500/30 border border-brand-500/30 rounded-lg text-brand-300 transition-all text-xs"
                >
                  <BarChart2 className="w-3.5 h-3.5 text-brand-400" />
                  Live Command Console & Analytics
                </button>
              </div>
            </div>

            {/* Hackathon Specs Badge */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[9px] text-slate-400">
              <span className="flex items-center gap-1 font-bold text-safe-400"><Check className="w-3 h-3 text-safe-400" /> PWA & Offline Ready</span>
              <span className="font-extrabold text-brand-400">100% Verified</span>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
