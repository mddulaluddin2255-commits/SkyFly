import React from 'react';
import { Play, Trophy, Settings, Volume2, VolumeX, Sparkles, User, Award, Coins, LogIn, Plane } from 'lucide-react';
import { GameSettings, UserProfile } from '../types';

interface HomeScreenProps {
  profile: UserProfile;
  settings: GameSettings;
  onStartFlight: () => void;
  onOpenLeaderboard: () => void;
  onOpenSettings: () => void;
  onOpenProfile: () => void;
  onOpenSignIn: () => void;
  onOpenSignUp: () => void;
  onOpenAdModal: () => void;
  onToggleSound: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  profile,
  settings,
  onStartFlight,
  onOpenLeaderboard,
  onOpenSettings,
  onOpenProfile,
  onOpenSignIn,
  onOpenSignUp,
  onOpenAdModal,
  onToggleSound,
}) => {
  const isGuest = profile.uid === 'guest_pilot';

  return (
    <div className="flex flex-col h-full justify-between p-4 sm:p-6 text-white select-none overflow-y-auto">
      {/* Top Bar */}
      <header className="flex items-center justify-between pt-1">
        <div className="flex items-center space-x-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20 border border-sky-400/30">
            <span className="font-bold text-lg font-aviation tracking-tighter">SF</span>
          </div>
          <div>
            <span className="text-[10px] font-semibold tracking-wider text-sky-400 uppercase">Aviation Arcade</span>
            <h1 className="text-xl font-black tracking-wider uppercase font-aviation leading-none">SkyFly</h1>
          </div>
        </div>

        {/* User Account Pill & Controls */}
        <div className="flex items-center space-x-1.5">
          {/* Pilot Account Pill */}
          {isGuest ? (
            <div className="flex items-center space-x-1">
              <button
                id="btn-home-signup-top"
                onClick={onOpenSignUp}
                className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs font-aviation uppercase tracking-wider shadow-md shadow-amber-500/20 active:scale-95 cursor-pointer"
              >
                <Sparkles size={13} className="text-slate-950" />
                <span>+1,000 PTS</span>
              </button>
              <button
                id="btn-home-signin"
                onClick={onOpenSignIn}
                className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700/60 hover:border-sky-500/60 transition-all text-xs active:scale-95"
              >
                <LogIn size={13} className="text-sky-400" />
                <span className="font-aviation font-bold text-slate-300">Sign In</span>
              </button>
            </div>
          ) : (
            <button
              id="btn-home-profile"
              onClick={onOpenProfile}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700/60 hover:border-sky-500/60 transition-all text-xs active:scale-95"
            >
              <User size={14} className="text-sky-400" />
              <span className="font-aviation font-bold text-slate-200 max-w-[80px] truncate">
                {profile.displayName || 'Pilot'}
              </span>
            </button>
          )}

          <button
            id="btn-sound-toggle"
            onClick={onToggleSound}
            className="w-9 h-9 rounded-xl bg-slate-900/80 border border-slate-700/60 flex items-center justify-center text-slate-300 hover:text-white hover:border-sky-500 transition-all active:scale-95"
            aria-label="Toggle Sound"
          >
            {settings.soundEnabled ? <Volume2 size={16} className="text-sky-400" /> : <VolumeX size={16} className="text-slate-500" />}
          </button>

          <button
            id="btn-settings"
            onClick={onOpenSettings}
            className="w-9 h-9 rounded-xl bg-slate-900/80 border border-slate-700/60 flex items-center justify-center text-slate-300 hover:text-white hover:border-sky-500 transition-all active:scale-95"
            aria-label="Open Settings"
          >
            <Settings size={16} />
          </button>
        </div>
      </header>

      {/* Main Center Content */}
      <div className="flex flex-col items-center my-auto text-center px-2 py-3">
        {/* Airplane Emblem Graphic */}
        <div className="relative mb-5">
          <div className="absolute inset-0 bg-sky-500/20 rounded-full blur-2xl animate-pulse"></div>
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-b from-slate-800 to-slate-950 border-2 border-sky-500/40 p-4 flex flex-col items-center justify-center shadow-2xl shadow-sky-950/80">
            {/* Supersonic Jet SVG Icon */}
            <svg viewBox="0 0 64 64" className="w-16 h-16 text-sky-400 drop-shadow-[0_0_12px_rgba(56,189,248,0.6)]">
              <path
                d="M32 4 L38 22 L58 36 L40 37 L34 52 L32 60 L30 52 L24 37 L6 36 L26 22 Z"
                fill="currentColor"
              />
              <path
                d="M32 10 L35 24 L48 35 L33 35 L32 50 L31 35 L16 35 L29 24 Z"
                fill="#ffffff"
                opacity="0.75"
              />
            </svg>
            <span className="text-[10px] font-bold text-sky-300 tracking-widest mt-1.5 uppercase font-aviation">
              Mach 3.5
            </span>
          </div>

          <div className="absolute -bottom-2 inset-x-0 mx-auto w-max px-2.5 py-0.5 rounded-full bg-slate-950 border border-sky-500/40 text-[10px] font-bold font-aviation text-sky-300 shadow-md">
            1.00x - 50.00x
          </div>
        </div>

        {/* Prominent Points & High Score Dashboard */}
        <div className="grid grid-cols-2 gap-3 w-full max-w-xs mb-4">
          {/* Virtual Points Card */}
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-500/40 rounded-2xl p-3 flex flex-col items-center relative overflow-hidden shadow-lg shadow-amber-950/20">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-1">
              <Coins size={12} className="text-amber-400" />
              <span>Virtual Points</span>
            </span>
            <span id="home-virtual-points" className="text-2xl sm:text-3xl font-black font-aviation text-amber-300 mt-0.5">
              {profile.virtualPoints.toLocaleString()}
            </span>
            <span className="text-[9px] text-amber-500/80 font-semibold font-aviation">
              COST: 10 PTS / FLIGHT
            </span>
          </div>

          {/* High Score Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 flex flex-col items-center relative overflow-hidden">
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider flex items-center space-x-1">
              <Trophy size={12} className="text-amber-400" />
              <span>High Score</span>
            </span>
            <span className="text-2xl sm:text-3xl font-black font-aviation text-sky-300 mt-0.5">
              {profile.highScore || 0}
            </span>
            <span className="text-[9px] text-slate-500">POINTS</span>
          </div>
        </div>

        {/* Guest Sign Up Bonus Callout Banner */}
        {isGuest && (
          <button
            id="btn-guest-signup-banner"
            onClick={onOpenSignUp}
            className="w-full max-w-xs mb-3 p-3 rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/10 border-2 border-amber-400/60 hover:border-amber-400 flex items-center justify-between text-left transition-all active:scale-95 shadow-lg shadow-amber-950/40 cursor-pointer group"
          >
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/30 border border-amber-400/80 flex items-center justify-center text-amber-300">
                <Sparkles size={18} className="animate-spin" />
              </div>
              <div>
                <div className="text-xs font-black font-aviation uppercase text-amber-300 tracking-wider">
                  Sign Up & Get 1,000 Points!
                </div>
                <div className="text-[10px] text-slate-300">
                  Register free pilot account for 1,000 pts bonus
                </div>
              </div>
            </div>
            <span className="text-xs font-black font-aviation text-slate-950 bg-amber-400 px-2.5 py-1 rounded-lg uppercase tracking-wider group-hover:bg-amber-300">
              Claim
            </span>
          </button>
        )}

        {/* Start Flight Primary Action */}
        <button
          id="btn-start-flight"
          onClick={onStartFlight}
          className="w-full max-w-xs py-4 px-6 rounded-2xl bg-gradient-to-r from-sky-500 via-sky-400 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 text-slate-950 font-black text-xl font-aviation tracking-wider uppercase shadow-xl shadow-sky-500/30 flex items-center justify-center space-x-3 transition-all transform active:scale-95 border-t border-white/40 cursor-pointer"
        >
          <Play size={24} className="fill-current" />
          <span>START FLIGHT (-10 PTS)</span>
        </button>

        {/* WATCH AD +100 POINTS Button */}
        <button
          id="btn-watch-ad-bonus"
          onClick={onOpenAdModal}
          className="w-full max-w-xs mt-3 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-500/20 to-yellow-500/10 border-2 border-amber-500/60 hover:border-amber-400 text-amber-300 font-black text-xs sm:text-sm font-aviation tracking-wider uppercase flex items-center justify-center space-x-2 transition-all active:scale-95 shadow-lg shadow-amber-950/30 cursor-pointer"
        >
          <Sparkles size={16} className="text-amber-400 animate-spin" />
          <span>WATCH AD +100 POINTS</span>
        </button>

        {profile.virtualPoints < 10 && (
          <div className="w-full max-w-xs mt-2.5 p-2.5 rounded-xl bg-rose-950/80 border border-rose-500/60 text-center">
            <p className="text-xs text-rose-300 font-aviation font-bold">
              ⚠️ Not enough points (10 required).
            </p>
            <p className="text-[11px] text-slate-300 mt-0.5">
              {isGuest
                ? 'Sign up to claim 1,000 free bonus points or watch an ad for +100!'
                : 'Watch a quick ad to recharge +100 virtual points!'}
            </p>
          </div>
        )}
      </div>

      {/* Bottom Controls & Navigation */}
      <footer className="flex flex-col items-center w-full max-w-xs mx-auto space-y-2.5 pb-1">
        <div className="grid grid-cols-2 gap-2 w-full">
          <button
            id="btn-leaderboard"
            onClick={onOpenLeaderboard}
            className="py-2.5 px-3 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 flex items-center justify-center space-x-1.5 text-xs font-semibold text-slate-300 active:scale-95 cursor-pointer"
          >
            <Award size={15} className="text-amber-400" />
            <span>Top Scores</span>
          </button>

          <button
            id="btn-footer-profile"
            onClick={isGuest ? onOpenSignIn : onOpenProfile}
            className="py-2.5 px-3 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 flex items-center justify-center space-x-1.5 text-xs font-semibold text-slate-300 active:scale-95 cursor-pointer"
          >
            <User size={15} className="text-sky-400" />
            <span>{isGuest ? 'Sign In / Up' : 'Pilot Profile'}</span>
          </button>
        </div>

        <p className="text-[10px] text-slate-500 tracking-wide text-center">
          Pure Score-Based Arcade • No Real Money • Multiplier 1.00x - 50.00x
        </p>
      </footer>
    </div>
  );
};
