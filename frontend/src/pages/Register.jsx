import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useLanguage } from '../context/LanguageContext';
import { Shield, User, Mail, Lock, UserCheck } from 'lucide-react';

export default function Register() {
  const { register, loginWithGoogle } = useAuthStore();
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('TOURIST');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Role-specific states
  const [badgeNumber, setBadgeNumber] = useState('');
  const [stationName, setStationName] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [hospitalAddress, setHospitalAddress] = useState('');
  const [teamName, setTeamName] = useState('');
  const [specialty, setSpecialty] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) return setError('Please fill in all registration fields.');

    setError('');
    setLoading(true);

    // Prepare extra info fields
    let extraInfo = {};
    if (role === 'POLICE') {
      extraInfo = { badgeNumber, stationName };
    } else if (role === 'HOSPITAL') {
      extraInfo = { hospitalName, address: hospitalAddress };
    } else if (role === 'RESCUE') {
      extraInfo = { teamName, specialty };
    }

    try {
      await register(name, email, password, role, extraInfo);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed. Try again.');
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
      setError('Google Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 relative overflow-hidden bg-transparent pt-8 pb-8">
      
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md bg-white/85 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 p-8 rounded-3xl relative shadow-2xl backdrop-blur-xl animate-scaleIn">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-brand-500/10 border border-brand-500/20 text-brand-500 rounded-2xl mb-4">
            <Shield className="w-6 h-6 animate-pulse" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">{t("auth.signUpTitle")}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t("auth.signUpSubtitle")}</p>
        </div>

        {error && (
          <div className="mb-4 bg-red-950/30 border border-red-500/20 text-red-400 p-3.5 rounded-xl text-xs flex items-center gap-2">
            <span className="text-base">⚠️</span>
            <span className="font-semibold">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">{t("auth.nameLabel")}</label>
            <div className="relative">
              <User className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-white/10 focus:border-brand-500 focus:outline-none rounded-xl pl-11 pr-4 py-3 text-xs text-slate-800 dark:text-slate-200"
              />
            </div>
          </div>

          {/* Email Address */}
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

          {/* Password */}
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

          {/* Role Dropdown Selector */}
          <div className="space-y-1.5">
            <label className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">{t("auth.roleLabel")}</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-950/85 border border-slate-200 dark:border-white/10 focus:border-brand-500 focus:outline-none rounded-xl px-4 py-3 text-xs text-slate-800 dark:text-slate-200 font-semibold"
            >
              <option value="TOURIST" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold">Tourist / Traveler</option>
              <option value="POLICE" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold">Police Officer</option>
              <option value="HOSPITAL" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold">Hospital emergency cell</option>
              <option value="RESCUE" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold">NDRF Rescue Team</option>
              <option value="ADMIN" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold">Govt Administrator</option>
            </select>
          </div>

          {/* Role-Specific Fields */}
          {role === 'POLICE' && (
            <div className="space-y-3 p-3 bg-slate-100/50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/5">
              <p className="text-[10px] text-brand-500 dark:text-brand-400 font-black uppercase tracking-wider">Police Officer details</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <input
                  type="text"
                  placeholder="Badge Number"
                  value={badgeNumber}
                  onChange={(e) => setBadgeNumber(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200"
                />
                <input
                  type="text"
                  placeholder="Station Name"
                  value={stationName}
                  onChange={(e) => setStationName(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200"
                />
              </div>
            </div>
          )}

          {role === 'HOSPITAL' && (
            <div className="space-y-3 p-3 bg-slate-100/50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/5">
              <p className="text-[10px] text-rose-500 dark:text-rose-400 font-black uppercase tracking-wider">Hospital facility details</p>
              <div className="grid grid-cols-1 gap-2 text-xs">
                <input
                  type="text"
                  placeholder="Hospital Name"
                  value={hospitalName}
                  onChange={(e) => setHospitalName(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200"
                />
                <input
                  type="text"
                  placeholder="Hospital Address"
                  value={hospitalAddress}
                  onChange={(e) => setHospitalAddress(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200"
                />
              </div>
            </div>
          )}

          {role === 'RESCUE' && (
            <div className="space-y-3 p-3 bg-slate-100/50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/5">
              <p className="text-[10px] text-amber-600 dark:text-amber-400 font-black uppercase tracking-wider">Rescue base details</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <input
                  type="text"
                  placeholder="Rescue Team Name"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200"
                />
                <input
                  type="text"
                  placeholder="Specialty (e.g. Flood)"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-600 text-white font-extrabold text-xs py-3.5 rounded-xl shadow-lg hover:shadow-brand-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? t("auth.generating") : t("auth.btnSignUp")}
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
            <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.2-5.136 4.2a5.49 5.49 0 0 1-5.5-5.5 5.49 5.49 0 0 1 5.5-5.5c1.87 0 3.39.81 4.26 1.625l3.18-3.18C19.5 4.3 16.2 3 12.24 3a10 10 0 0 0-10 10 10 10 0 0 0 10 10c6.04 0 9.8-4.22 9.8-9.8a8.87 8.87 0 0 0-.2-1.93H12.24z"/>
          </svg>
          {t("auth.signInWithGoogle")}
        </button>

        {/* Footer */}
        <p className="text-center text-[11px] text-slate-500 mt-6">
          {t("auth.alreadyHaveAccount").split('?')[0]}?{' '}
          <Link to="/login" className="text-brand-400 hover:text-brand-300 font-semibold underline">
            {t("auth.alreadyHaveAccount").split('?')[1] || "Sign In"}
          </Link>
        </p>

      </div>
    </div>
  );
}
