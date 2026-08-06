import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useAppStore } from '../store/useAppStore';
import { useLanguage } from '../context/LanguageContext';
import { Shield, KeyRound, ArrowRight, RefreshCw, Mail, CheckCircle2, AlertCircle } from 'lucide-react';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const emailParam = searchParams.get('email') || '';
  const navigate = useNavigate();
  const { verifyOtp, resendOtp, loading, error } = useAuthStore();
  const { triggerToast } = useAppStore();
  const { t } = useLanguage();

  const [email, setEmail] = useState(emailParam);
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef([]);

  // 5:00 Expiry Countdown Timer
  const [expirySeconds, setExpirySeconds] = useState(300);
  
  // 60s Resend Cooldown Timer
  const [resendCooldown, setResendCooldown] = useState(60);

  useEffect(() => {
    const timer = setInterval(() => {
      setExpirySeconds(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleInputChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otpValues];
    newOtp[index] = value.slice(-1);
    setOtpValues(newOtp);

    // Move to next input box
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setOtpValues(digits);
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fullOtp = otpValues.join('');
    if (fullOtp.length !== 6) {
      return triggerToast('Please enter the complete 6-digit verification code.', 'warning');
    }

    try {
      await verifyOtp(email, fullOtp);
      triggerToast('Email verified successfully! Welcome to SafeTour AI.', 'success');
      navigate('/dashboard');
    } catch (err) {
      triggerToast(err.message || 'OTP verification failed', 'error');
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    try {
      await resendOtp(email);
      triggerToast('A new 6-digit verification code has been sent to your email.', 'info');
      setResendCooldown(60);
      setExpirySeconds(300);
      setOtpValues(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err) {
      triggerToast(err.message || 'Failed to resend OTP', 'error');
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md glass border border-slate-200 dark:border-white/10 p-8 rounded-3xl shadow-2xl space-y-6 relative overflow-hidden bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-slate-100">
        
        {/* Decorative Background Blur */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-brand-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="text-center space-y-2">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-500 mb-2 shadow-inner">
            <KeyRound className="w-7 h-7 animate-pulse" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Verify Your Account</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            We emailed a 6-digit verification security code to:
          </p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-500/10 border border-brand-500/20 rounded-full text-xs font-black text-brand-600 dark:text-brand-400">
            <Mail className="w-3.5 h-3.5" />
            <span>{email || 'your email'}</span>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-600 dark:text-red-400 text-xs font-semibold text-center flex items-center justify-center gap-1.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* 6 Individual Box OTP Inputs */}
          <div className="flex justify-between gap-2" onPaste={handlePaste}>
            {otpValues.map((val, idx) => (
              <input
                key={idx}
                ref={el => inputRefs.current[idx] = el}
                type="text"
                inputMode="numeric"
                maxLength="1"
                value={val}
                onChange={e => handleInputChange(idx, e.target.value)}
                onKeyDown={e => handleKeyDown(idx, e)}
                className="w-12 h-14 text-center text-xl font-black rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-white/10 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 outline-none text-slate-900 dark:text-white shadow-inner transition-all"
                autoFocus={idx === 0}
              />
            ))}
          </div>

          {/* Expiry Countdown */}
          <div className="flex justify-between items-center text-xs font-bold text-slate-500 dark:text-slate-400 px-1">
            <span>Code Expiration:</span>
            <span className={`font-mono font-extrabold ${expirySeconds < 60 ? 'text-red-500 animate-pulse' : 'text-brand-500'}`}>
              ⏱️ {formatTime(expirySeconds)}
            </span>
          </div>

          <button
            type="submit"
            disabled={loading || otpValues.join('').length !== 6 || expirySeconds === 0}
            className="w-full bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-600 text-white font-extrabold py-3.5 rounded-xl shadow-lg hover:shadow-brand-500/25 transition-all disabled:opacity-40 flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider text-xs"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <span>Verify Security Code</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Resend Action */}
        <div className="border-t border-slate-200 dark:border-white/5 pt-4 text-center space-y-2">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Didn't receive the code?
          </p>
          <button
            type="button"
            onClick={handleResend}
            disabled={resendCooldown > 0}
            className="inline-flex items-center gap-1.5 text-xs font-black text-brand-600 dark:text-brand-400 hover:underline disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${resendCooldown > 0 ? 'animate-spin' : ''}`} />
            {resendCooldown > 0 ? `Resend Code in ${resendCooldown}s` : 'Resend Code Now'}
          </button>
        </div>

        <div className="text-center pt-2">
          <Link to="/register" className="text-[11px] text-slate-400 hover:text-slate-200 font-semibold underline">
            ← Change email or return to sign up
          </Link>
        </div>

      </div>
    </div>
  );
}
