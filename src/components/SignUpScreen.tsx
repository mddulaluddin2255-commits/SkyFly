import React, { useState } from 'react';
import { Plane, User, Mail, Lock, ArrowLeft, Sparkles, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import { signUpPlayer } from '../services/firebase';
import { UserProfile } from '../types';
import { soundService } from '../services/sound';

interface SignUpScreenProps {
  onSuccess: (profile: UserProfile) => void;
  onNavigateToSignIn: () => void;
  onBackToHome: () => void;
}

export const SignUpScreen: React.FC<SignUpScreenProps> = ({
  onSuccess,
  onNavigateToSignIn,
  onBackToHome,
}) => {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    soundService.playClick();

    if (!displayName.trim()) {
      setErrorMsg('Please enter a pilot callsign/name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const profile = await signUpPlayer(email.trim(), password, displayName.trim());
      soundService.playClaimSuccess();
      onSuccess(profile);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      if (msg.includes('email-already-in-use')) {
        setErrorMsg('An account with this email already exists. Please sign in.');
      } else if (msg.includes('weak-password')) {
        setErrorMsg('Password is too weak. Please use at least 6 characters.');
      } else {
        setErrorMsg(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative z-10 w-full h-full flex flex-col justify-between p-4 sm:p-6 text-white overflow-y-auto select-none">
      {/* Top Bar */}
      <header className="flex items-center justify-between">
        <button
          id="btn-signup-back"
          onClick={onBackToHome}
          className="w-10 h-10 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-all active:scale-95"
          aria-label="Back"
        >
          <ArrowLeft size={18} />
        </button>
        <span className="text-xs font-aviation tracking-widest text-sky-400 uppercase font-bold">
          Pilot Enlistment
        </span>
        <div className="w-10" />
      </header>

      {/* Main Form Box */}
      <div className="my-auto py-4 w-full max-w-sm mx-auto flex flex-col items-center">
        {/* Emblem */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center border border-sky-400/40 shadow-lg shadow-sky-500/20 mb-3">
          <Plane size={32} className="text-white transform -rotate-45" />
        </div>

        <h2 className="text-2xl font-black font-aviation uppercase tracking-wider text-center">
          Create Pilot Account
        </h2>

        {/* Bonus Callout */}
        <div className="mt-2 px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-aviation font-bold flex items-center space-x-1.5 shadow-md shadow-amber-950/20">
          <Sparkles size={14} className="text-amber-400 shrink-0" />
          <span>SIGN UP BONUS: 1,000 FREE VIRTUAL POINTS</span>
        </div>

        {errorMsg && (
          <div className="w-full mt-3 p-3 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-300 text-xs flex items-start space-x-2">
            <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full mt-4 space-y-3">
          <div>
            <label className="block text-[11px] font-aviation text-slate-400 uppercase tracking-wider mb-1">
              Pilot Callsign / Name
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-3.5 text-slate-500" />
              <input
                id="signup-displayName"
                type="text"
                placeholder="e.g. Maverick"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={40}
                required
                className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-950/90 border border-slate-800 focus:border-sky-500 focus:outline-none text-white text-sm placeholder-slate-600 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-aviation text-slate-400 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-3.5 text-slate-500" />
              <input
                id="signup-email"
                type="email"
                placeholder="pilot@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-950/90 border border-slate-800 focus:border-sky-500 focus:outline-none text-white text-sm placeholder-slate-600 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-aviation text-slate-400 uppercase tracking-wider mb-1">
              Password (min 6 chars)
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-3.5 text-slate-500" />
              <input
                id="signup-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
                className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-950/90 border border-slate-800 focus:border-sky-500 focus:outline-none text-white text-sm placeholder-slate-600 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-aviation text-slate-400 uppercase tracking-wider mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-3.5 text-slate-500" />
              <input
                id="signup-confirm-password"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={6}
                required
                className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-950/90 border border-slate-800 focus:border-sky-500 focus:outline-none text-white text-sm placeholder-slate-600 font-medium"
              />
            </div>
          </div>

          <button
            id="btn-submit-signup"
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3.5 px-4 rounded-xl bg-gradient-to-r from-sky-500 via-sky-400 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 text-slate-950 font-black text-sm sm:text-base font-aviation uppercase tracking-wider shadow-lg shadow-sky-500/25 flex items-center justify-center space-x-2 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>INITIALIZING PROFILE...</span>
              </>
            ) : (
              <>
                <ShieldCheck size={18} />
                <span>SIGN UP & GET 1,000 PTS</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-4 text-center">
          <span className="text-xs text-slate-400">Already have a pilot profile? </span>
          <button
            id="btn-nav-to-signin"
            onClick={onNavigateToSignIn}
            className="text-xs font-bold text-sky-400 hover:text-sky-300 underline font-aviation"
          >
            Sign In Here
          </button>
        </div>
      </div>

      {/* Footer disclaimer */}
      <footer className="pt-2 text-center text-[10px] text-slate-500">
        Virtual points arcade system • No real-world monetary value
      </footer>
    </div>
  );
};
