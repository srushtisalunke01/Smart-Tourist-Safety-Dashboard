import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useAppStore } from '../store/useAppStore';
import { translations } from '../locales/translations';
import { Shield, Menu, X, Sun, Moon, LogOut, HeartHandshake, Bell, CheckSquare } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead } = useAppStore();
  const { theme, toggleTheme } = useTheme();
  const { lang: language, setLang: setLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();
  
  const dropdownRef = React.useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);
  
  const navRef = React.useRef(null);

  useEffect(() => {
    const updateNavbarHeight = () => {
      if (navRef.current) {
        document.documentElement.style.setProperty('--navbar-height', `${navRef.current.offsetHeight}px`);
      }
    };
    
    updateNavbarHeight();
    window.addEventListener('resize', updateNavbarHeight);

    let observer;
    if (navRef.current && typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(() => {
        updateNavbarHeight();
      });
      observer.observe(navRef.current);
    }

    return () => {
      window.removeEventListener('resize', updateNavbarHeight);
      if (observer) {
        observer.disconnect();
      }
    };
  }, [isOpen]); // Also re-measure when mobile drawer open state changes

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  const getDashboardPath = () => {
    return '/dashboard';
  };

  return (
    <nav ref={navRef} className="fixed top-0 z-50 w-full border-b border-slate-200/80 dark:border-white/5 px-4 md:px-8 py-3 bg-white/95 dark:bg-slate-950/70 dark:text-slate-100 text-slate-800 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <img 
            src="/logo.png" 
            alt="SafeTour Logo" 
            className="w-10 h-10 object-contain rounded-lg shadow-md group-hover:scale-105 transition-transform" 
          />
          <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:via-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
            SafeTour <span className="text-brand-500 font-bold">AI</span>
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-slate-600 hover:text-brand-600 dark:text-slate-350 dark:hover:text-white transition-colors text-xs font-black uppercase tracking-wider">{t("navbar.home")}</Link>
          
          {user && (
            <>
              <Link to={getDashboardPath()} className="text-slate-600 hover:text-brand-600 dark:text-slate-350 dark:hover:text-white transition-colors text-xs font-black uppercase tracking-wider">{t("navbar.dashboard")}</Link>
              {user.role === 'TOURIST' && (
                <>
                  <Link to="/planner" className="text-slate-600 hover:text-brand-600 dark:text-slate-350 dark:hover:text-white transition-colors text-xs font-black uppercase tracking-wider">{t("navbar.tripPlanner")}</Link>
                  <Link to="/scam-radar" className="text-slate-600 hover:text-brand-600 dark:text-slate-350 dark:hover:text-white transition-colors text-xs font-black uppercase tracking-wider">{t("navbar.scamRadar")}</Link>
                  <Link to="/women-safety" className="text-slate-600 hover:text-brand-600 dark:text-slate-350 dark:hover:text-white transition-colors text-xs font-black uppercase tracking-wider flex items-center gap-1">
                    <HeartHandshake className="w-4 h-4 text-pink-500 animate-pulse" />
                    {t("navbar.womenSafety")}
                  </Link>
                  <Link to="/community" className="text-slate-600 hover:text-brand-600 dark:text-slate-350 dark:hover:text-white transition-colors text-xs font-black uppercase tracking-wider">{t("navbar.community")}</Link>
                  <Link to="/offline" className="text-slate-600 hover:text-brand-600 dark:text-slate-350 dark:hover:text-white transition-colors text-xs font-black uppercase tracking-wider">{t("navbar.offlineMode")}</Link>
                </>
              )}
            </>
          )}
        </div>

        {/* Right side actions */}
        <div className="hidden md:flex items-center gap-4">
          
          {/* Global Language Selector Dropdown */}
          <select 
            value={language} 
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-slate-100 hover:bg-slate-200 dark:bg-white/5 border border-slate-200 dark:border-white/10 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 rounded-xl px-2.5 py-2 text-xs font-extrabold outline-none cursor-pointer transition-all"
          >
            <option value="en" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold">🇺🇸 EN</option>
            <option value="hi" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold">🇮🇳 HI</option>
            <option value="mr" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold">🇮🇳 MR</option>
            <option value="as" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold">🇮🇳 AS</option>
          </select>
          
          {/* Theme Switcher Button */}
          <button 
            onClick={toggleTheme}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:border dark:border-white/10 dark:hover:bg-white/10 transition-all text-brand-500"
            title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-brand-500" /> : <Moon className="w-4 h-4 text-brand-650" />}
          </button>

          {/* Notifications Bell Dropdown */}
          {user && (
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:border dark:border-white/10 dark:hover:bg-white/10 transition-all text-slate-600 dark:text-slate-350 hover:text-brand-500 dark:hover:text-white relative"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {notifications && notifications.filter(n => !n.isRead).length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-slate-950 animate-pulse"></span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl p-4 z-50 backdrop-blur-xl space-y-3">
                  <div className="flex justify-between items-center border-b border-slate-100 dark:border-white/5 pb-2">
                    <h4 className="font-extrabold text-[10px] uppercase tracking-wider text-slate-800 dark:text-slate-200">Notifications</h4>
                    {notifications && notifications.filter(n => !n.isRead).length > 0 && (
                      <button 
                        onClick={() => markAllNotificationsAsRead()}
                        className="text-[9px] text-brand-500 hover:text-brand-400 font-extrabold flex items-center gap-1 uppercase tracking-wider"
                      >
                        <CheckSquare className="w-3 h-3" /> Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                    {!notifications || notifications.length === 0 ? (
                      <p className="text-[10px] text-slate-500 text-center py-4 italic font-medium">No notifications yet.</p>
                    ) : (
                      notifications.map(notif => (
                        <div 
                          key={notif._id || notif.id} 
                          onClick={() => !notif.isRead && markNotificationAsRead(notif._id || notif.id)}
                          className={`p-2.5 rounded-xl border text-[11px] leading-relaxed transition-all cursor-pointer ${
                            notif.isRead 
                              ? 'bg-slate-50/50 dark:bg-slate-950/20 border-slate-100 dark:border-white/5 text-slate-500' 
                              : 'bg-brand-500/5 dark:bg-brand-500/10 border-brand-500/10 dark:border-brand-500/20 text-slate-800 dark:text-slate-200 font-semibold'
                          }`}
                        >
                          <div className="flex justify-between items-start gap-1">
                            <span className="font-extrabold text-xs">{notif.title}</span>
                            {!notif.isRead && <span className="w-1.5 h-1.5 bg-brand-500 rounded-full shrink-0 mt-1"></span>}
                          </div>
                          <p className="text-[10px] text-slate-550 dark:text-slate-400 mt-0.5">{notif.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Auth Button */}
          {user ? (
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-[10px] text-slate-400 font-bold uppercase">{t("welcome")}</p>
                <p className="text-xs dark:text-slate-200 text-slate-800 font-black max-w-[120px] truncate">{user.name}</p>
              </div>
              <button onClick={handleLogout} className="bg-slate-100 hover:bg-red-500/10 hover:text-red-500 border border-transparent dark:bg-white/5 dark:border-white/10 dark:hover:bg-red-900/20 dark:hover:border-red-500 dark:hover:text-red-500 p-2.5 rounded-xl transition-all" title={t("logout")}>
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link to="/login" className="bg-gradient-to-r from-brand-600 to-brand-500 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl hover:shadow-lg hover:shadow-brand-500/20 transition-all uppercase tracking-wider">
              {t("login")}
            </Link>
          )}
        </div>

        {/* Mobile menu triggers */}
        <div className="flex items-center gap-2 md:hidden">
          
          <select 
            value={language} 
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 rounded-xl px-2 py-1.5 text-[11px] font-bold outline-none cursor-pointer transition-all"
          >
            <option value="en" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold">🇺🇸 EN</option>
            <option value="hi" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold">🇮🇳 HI</option>
            <option value="mr" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold">🇮🇳 MR</option>
            <option value="as" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold">🇮🇳 AS</option>
          </select>
          
          <button 
            onClick={toggleTheme}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-transparent dark:border-white/10 text-brand-500"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-brand-500" /> : <Moon className="w-4 h-4 text-brand-600" />}
          </button>
          
          <button onClick={() => setIsOpen(!isOpen)} className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white p-2 rounded-lg bg-slate-100 dark:bg-white/5 border border-transparent dark:border-white/10">
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden mt-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 flex flex-col gap-3 text-slate-800 dark:text-slate-200 shadow-xl">
          <Link to="/" onClick={() => setIsOpen(false)} className="hover:text-brand-600 hover:bg-slate-50 dark:hover:bg-white/5 px-3 py-2 rounded-lg transition-all text-xs font-black uppercase tracking-wider">{t("navbar.home")}</Link>
          
          {user && (
            <>
              <Link to={getDashboardPath()} onClick={() => setIsOpen(false)} className="hover:text-brand-600 hover:bg-slate-50 dark:hover:bg-white/5 px-3 py-2 rounded-lg transition-all text-xs font-black uppercase tracking-wider">{t("navbar.dashboard")}</Link>
              {user.role === 'TOURIST' && (
                <>
                  <Link to="/planner" onClick={() => setIsOpen(false)} className="hover:text-brand-600 hover:bg-slate-50 dark:hover:bg-white/5 px-3 py-2 rounded-lg transition-all text-xs font-black uppercase tracking-wider">{t("navbar.tripPlanner")}</Link>
                  <Link to="/scam-radar" onClick={() => setIsOpen(false)} className="hover:text-brand-600 hover:bg-slate-50 dark:hover:bg-white/5 px-3 py-2 rounded-lg transition-all text-xs font-black uppercase tracking-wider">{t("navbar.scamRadar")}</Link>
                  <Link to="/women-safety" onClick={() => setIsOpen(false)} className="hover:text-brand-600 hover:bg-slate-50 dark:hover:bg-white/5 px-3 py-2 rounded-lg transition-all text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                    <HeartHandshake className="w-4 h-4 text-pink-500 animate-pulse" />
                    {t("navbar.womenSafety")}
                  </Link>
                  <Link to="/community" onClick={() => setIsOpen(false)} className="hover:text-brand-600 hover:bg-slate-50 dark:hover:bg-white/5 px-3 py-2 rounded-lg transition-all text-xs font-black uppercase tracking-wider">{t("navbar.community")}</Link>
                  <Link to="/offline" onClick={() => setIsOpen(false)} className="hover:text-brand-600 hover:bg-slate-50 dark:hover:bg-white/5 px-3 py-2 rounded-lg transition-all text-xs font-black uppercase tracking-wider">{t("navbar.offlineMode")}</Link>
                </>
              )}
            </>
          )}
 
          <hr className="border-slate-200 dark:border-white/5 my-1" />
 
          {user ? (
            <div className="flex items-center justify-between px-3 py-2 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5">
              <div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">{t("welcome")}</p>
                <p className="text-xs font-black text-slate-800 dark:text-slate-200">{user.name}</p>
              </div>
              <button onClick={handleLogout} className="bg-red-500/10 border border-red-500/20 text-red-500 px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 font-black uppercase tracking-wider">
                <LogOut className="w-3.5 h-3.5" />
                {t("logout")}
              </button>
            </div>
          ) : (
            <Link to="/login" onClick={() => setIsOpen(false)} className="bg-gradient-to-r from-brand-600 to-brand-500 text-white font-extrabold text-center py-2.5 rounded-xl block text-xs uppercase tracking-wider">
              {t("login")}
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
