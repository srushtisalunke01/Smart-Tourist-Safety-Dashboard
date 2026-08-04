import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useLanguage } from '../context/LanguageContext';
import { Shield, Mail, Lock, ShieldCheck } from 'lucide-react';

export default function Login() {
  const { login, loginWithGoogle } = useAuthStore();
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return setError('Please fill in all credentials.');

    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleMock = async () => {
    setLoading(true);
    try {
      const mockGooglePayload = {
        email: 'tourist@safetour.ai',
        name: 'Sarah Jenkins (Google Tourist)',
        googleId: 'g_auth_sih_123456789'
      };
      await loginWithGoogle(mockGooglePayload);
      navigate('/dashboard');
    } catch (err) {
      setError('Google Sign-In failed.');
    } finally {
      setLoading(false);
    }
  };

  const autofillUser = (e, p) => {
    setEmail(e);
    setPassword(p);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 relative overflow-hidden bg-transparent pt-20">

      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md bg-white/85 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 p-8 rounded-3xl relative shadow-2xl backdrop-blur-xl">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-2xl mb-4 shadow-xl">
            <img 
              src="/logo.png" 
              alt="SafeTour Logo" 
              className="w-16 h-16 object-contain rounded-xl" 
            />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">{t("auth.signInTitle")}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t("auth.signInSubtitle")}</p>
        </div>

        {error && (
          <div className="mb-4 bg-red-950/30 border border-red-500/20 text-red-400 p-3.5 rounded-xl text-xs flex items-center gap-2">
            <span className="text-base">⚠️</span>
            <span className="font-semibold">{error}</span>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          <div className="space-y-1.5">
            <label className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">{t("auth.emailLabel")}</label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-white/10 focus:border-brand-500 focus:outline-none rounded-xl pl-11 pr-4 py-3 text-xs text-slate-800 dark:text-slate-200"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">{t("auth.passwordLabel")}</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-white/10 focus:border-brand-500 focus:outline-none rounded-xl pl-11 pr-4 py-3 text-xs text-slate-800 dark:text-slate-200"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-600 text-white font-extrabold text-xs py-3.5 rounded-xl shadow-lg hover:shadow-brand-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? t("auth.generating") : t("auth.btnSignIn")}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6 text-center">
          <hr className="border-slate-200 dark:border-white/5" />
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-slate-900 px-3 text-[10px] text-slate-500 font-bold uppercase tracking-widest">Or</span>
        </div>

        {/* Google Authentication Simulation */}
        <button
          onClick={handleGoogleMock}
          disabled={loading}
          className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-150 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold text-xs py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.2-5.136 4.2a5.49 5.49 0 0 1-5.5-5.5 5.49 5.49 0 0 1 5.5-5.5c1.87 0 3.39.81 4.26 1.625l3.18-3.18C19.5 4.3 16.2 3 12.24 3a10 10 0 0 0-10 10 10 10 0 0 0 10 10c6.04 0 9.8-4.22 9.8-9.8a8.87 8.87 0 0 0-.2-1.93H12.24z" />
          </svg>
          {t("auth.signInWithGoogle")}
        </button>

        {/* Direct Test Accounts */}
        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-white/5 text-left bg-slate-100/50 dark:bg-white/5 rounded-xl p-3 border border-slate-200 dark:border-white/5">
          <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-black tracking-widest mb-2.5 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-500" />
            Quick Demo Accounts (password: password123)
          </p>
          <div className="grid grid-cols-2 gap-2 text-[9px] text-slate-700 dark:text-slate-300">
            <button
              onClick={() => autofillUser('tourist@safetour.ai', 'password123')}
              className="text-left bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/5 p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <p className="font-bold text-slate-800 dark:text-slate-200">Tourist login</p>
              <p className="text-[8px] text-slate-500 dark:text-slate-400 font-medium">tourist@safetour.ai</p>
            </button>
            <button
              onClick={() => autofillUser('police@safetour.ai', 'password123')}
              className="text-left bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/5 p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <p className="font-bold text-slate-800 dark:text-slate-200">Police login</p>
              <p className="text-[8px] text-slate-500 dark:text-slate-400 font-medium">police@safetour.ai</p>
            </button>
            <button
              onClick={() => autofillUser('hospital@safetour.ai', 'password123')}
              className="text-left bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/5 p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <p className="font-bold text-slate-800 dark:text-slate-200">Hospital login</p>
              <p className="text-[8px] text-slate-500 dark:text-slate-400 font-medium">hospital@safetour.ai</p>
            </button>
            <button
              onClick={() => autofillUser('rescue@safetour.ai', 'password123')}
              className="text-left bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/5 p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <p className="font-bold text-slate-800 dark:text-slate-200">Rescue login</p>
              <p className="text-[8px] text-slate-500 dark:text-slate-400 font-medium">rescue@safetour.ai</p>
            </button>
            <button
              onClick={() => autofillUser('admin@safetour.ai', 'password123')}
              className="col-span-2 text-left bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/5 p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <p className="font-bold text-slate-800 dark:text-slate-200">Admin command console login</p>
              <p className="text-[8px] text-slate-500 dark:text-slate-400 font-medium">admin@safetour.ai</p>
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-slate-500 mt-6">
          {t("auth.noAccount").split('?')[0]}?{' '}
          <Link to="/register" className="text-brand-400 hover:text-brand-300 font-semibold underline">
            {t("auth.noAccount").split('?')[1] || "Register"}
          </Link>
        </p>

      </div>
    </div>
  );
}
