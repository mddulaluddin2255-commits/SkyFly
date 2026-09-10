import React, { useState } from 'react';
import { Plane, Mail, Lock, ArrowLeft, LogIn, AlertCircle, Loader2, UserCheck } from 'lucide-react';
import { signInPlayer, getGuestProfile } from '../services/firebase';
import { UserProfile } from '../types';
import { soundService } from '../services/sound';

interface SignInScreenProps {
  onSuccess: (profile: UserProfile) => void;
  onNavigateToSignUp: () => void;
  onBackToHome: () => void;
}

export const SignInScreen: React.FC<SignInScreenProps> = ({
  onSuccess,
  onNavigateToSignUp,
  onBackToHome,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    soundService.playClick();

    if (!email.trim() || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const profile = await signInPlayer(email.trim(), password);
      soundService.playClaimSuccess();
      onSuccess(profile);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Sign in failed. Please check credentials.';
      if (msg.includes('user-not-found') || msg.includes('invalid-credential') || msg.includes('wrong-password')) {
        setErrorMsg('Invalid email or password. Please verify or create a new account.');
      } else {
        setErrorMsg(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGuestQuickStart = () => {
    soundService.playClick();
    const guest = getGuestProfile();
    onSuccess(guest);
  };

  return (
    <div className="relative z-10 w-full h-full flex flex-col justify-between p-4 sm:p-6 text-white overflow-y-auto select-none">
      {/* Top Bar */}
      <header className="flex items-center justify-between">
        <button
          id="btn-signin-back"
          onClick={onBackToHome}
          className="w-10 h-10 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-all active:scale-95"
          aria-label="Back"
        >
          <ArrowLeft size={18} />
        </button>
        <span className="text-xs font-aviation tracking-widest text-sky-400 uppercase font-bold">
          Pilot Authentication
        </span>
        <div className="w-10" />
      </header>

      {/* Main Content */}
      <div className="my-auto py-4 w-full max-w-sm mx-auto flex flex-col items-center">
        {/* Emblem */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center border border-sky-400/40 shadow-lg shadow-sky-500/20 mb-3">
          <Plane size={32} className="text-white transform -rotate-45" />
        </div>

        <h2 className="text-2xl font-black font-aviation uppercase tracking-wider text-center">
          Pilot Sign In
        </h2>
        <p className="text-xs text-slate-400 mt-1 text-center">
          Access your cloud profile and virtual point balance
        </p>

        {errorMsg && (
          <div className="w-full mt-3 p-3 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-300 text-xs flex items-start space-x-2">
            <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full mt-4 space-y-3">
          <div>
            <label className="block text-[11px] font-aviation text-slate-400 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-3.5 text-slate-500" />
              <input
                id="signin-email"
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
              Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-3.5 text-slate-500" />
              <input
                id="signin-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-950/90 border border-slate-800 focus:border-sky-500 focus:outline-none text-white text-sm placeholder-slate-600 font-medium"
              />
            </div>
          </div>

          <button
            id="btn-submit-signin"
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3.5 px-4 rounded-xl bg-gradient-to-r from-sky-500 via-sky-400 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 text-slate-950 font-black text-sm sm:text-base font-aviation uppercase tracking-wider shadow-lg shadow-sky-500/25 flex items-center justify-center space-x-2 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>SIGNING IN...</span>
              </>
            ) : (
              <>
                <LogIn size={18} />
                <span>SIGN IN TO COCKPIT</span>
              </>
            )}
          </button>
        </form>

        {/* Guest quick flight button */}
        <button
          id="btn-signin-guest"
          type="button"
          onClick={handleGuestQuickStart}
          className="w-full mt-3 py-2.5 px-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-aviation font-bold uppercase tracking-wider flex items-center justify-center space-x-2 active:scale-95 transition-all"
        >
          <UserCheck size={15} className="text-sky-400" />
          <span>Continue As Guest Pilot</span>
        </button>

        <div className="mt-4 text-center">
          <span className="text-xs text-slate-400">Need a pilot account? </span>
          <button
            id="btn-nav-to-signup"
            onClick={onNavigateToSignUp}
            className="text-xs font-bold text-sky-400 hover:text-sky-300 underline font-aviation"
          >
            Sign Up (+1,000 Pts)
          </button>
        </div>
      </div>

      <footer className="pt-2 text-center text-[10px] text-slate-500">
        Virtual points arcade system • No real-world monetary value
      </footer>
    </div>
  );
};
