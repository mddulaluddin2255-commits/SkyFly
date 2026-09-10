import React from 'react';
import { User, LogOut, ArrowLeft, Trophy, Plane, ShieldCheck, Sparkles, Coins, Award, CheckCircle } from 'lucide-react';
import { UserProfile } from '../types';
import { signOutPlayer } from '../services/firebase';
import { soundService } from '../services/sound';

interface ProfileScreenProps {
  profile: UserProfile;
  onSignOut: () => void;
  onOpenAdModal: () => void;
  onBackToHome: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  profile,
  onSignOut,
  onOpenAdModal,
  onBackToHome,
}) => {
  const handleSignOut = async () => {
    soundService.playClick();
    await signOutPlayer();
    onSignOut();
  };

  const isGuest = profile.uid === 'guest_pilot';

  return (
    <div className="relative z-10 w-full h-full flex flex-col justify-between p-4 sm:p-6 text-white overflow-y-auto select-none">
      {/* Top Bar */}
      <header className="flex items-center justify-between pb-2 border-b border-slate-800/80">
        <button
          id="btn-profile-back"
          onClick={onBackToHome}
          className="w-10 h-10 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-all active:scale-95"
          aria-label="Back"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Pilot Dossier</span>
          <h2 className="text-base font-black font-aviation uppercase tracking-wider text-slate-100">
            Player Profile
          </h2>
        </div>
        <button
          id="btn-profile-signout-top"
          onClick={handleSignOut}
          className="w-10 h-10 rounded-xl bg-rose-950/40 border border-rose-800/50 flex items-center justify-center text-rose-400 hover:text-rose-200 transition-all active:scale-95"
          title="Sign Out"
        >
          <LogOut size={16} />
        </button>
      </header>

      {/* Main Profile Info */}
      <div className="my-auto py-3 w-full max-w-sm mx-auto flex flex-col items-center space-y-4">
        {/* Pilot Avatar & Badge */}
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-slate-800 to-sky-900 border-2 border-sky-400/50 flex items-center justify-center shadow-xl shadow-sky-950/60">
              <User size={40} className="text-sky-300" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-500 border-2 border-slate-950 flex items-center justify-center">
              <ShieldCheck size={14} className="text-slate-950" />
            </div>
          </div>
          <h3 className="text-xl font-black font-aviation uppercase tracking-wider mt-2">
            {profile.displayName || 'Ace Pilot'}
          </h3>
          <span className="text-xs text-slate-400">
            {isGuest ? 'Guest Pilot (Local Profile)' : profile.email}
          </span>
        </div>

        {/* Prominent Points Card */}
        <div className="w-full rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-amber-500/40 p-4 shadow-xl flex flex-col items-center relative overflow-hidden">
          <div className="absolute top-2 right-2 text-amber-500/10 pointer-events-none">
            <Coins size={60} />
          </div>
          <span className="text-[11px] font-bold text-amber-400 uppercase tracking-widest flex items-center space-x-1.5">
            <Coins size={14} className="text-amber-400" />
            <span>Virtual Points Balance</span>
          </span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span
              id="profile-virtual-points"
              className="text-4xl sm:text-5xl font-black font-aviation text-amber-300 drop-shadow-md"
            >
              {profile.virtualPoints.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-amber-500/80 font-aviation">PTS</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1">
            10 points required per flight • Virtual currency only
          </span>

          {/* Quick Ad recharge button */}
          <button
            id="btn-profile-watch-ad"
            onClick={onOpenAdModal}
            className="mt-3 w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs font-aviation uppercase tracking-wider flex items-center justify-center space-x-1.5 active:scale-95 transition-all shadow-md shadow-amber-500/20 cursor-pointer"
          >
            <Sparkles size={14} />
            <span>WATCH AD +100 POINTS</span>
          </button>
        </div>

        {/* Flight Career Stats Grid */}
        <div className="w-full grid grid-cols-2 gap-2.5">
          <div className="rounded-xl bg-slate-950/80 border border-slate-800 p-3 flex flex-col items-center">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider flex items-center space-x-1">
              <Trophy size={12} className="text-amber-400" />
              <span>Personal Best</span>
            </span>
            <span className="text-xl font-black font-aviation text-amber-300 mt-0.5">
              {profile.highScore || 0}
            </span>
            <span className="text-[9px] text-slate-500">PTS</span>
          </div>

          <div className="rounded-xl bg-slate-950/80 border border-slate-800 p-3 flex flex-col items-center">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider flex items-center space-x-1">
              <Plane size={12} className="text-sky-400" />
              <span>Total Flights</span>
            </span>
            <span className="text-xl font-black font-aviation text-sky-400 mt-0.5">
              {profile.totalFlights || 0}
            </span>
            <span className="text-[9px] text-slate-500">SORTIES</span>
          </div>

          <div className="rounded-xl bg-slate-950/80 border border-slate-800 p-3 flex flex-col items-center">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider flex items-center space-x-1">
              <CheckCircle size={12} className="text-emerald-400" />
              <span>Claims Secured</span>
            </span>
            <span className="text-xl font-black font-aviation text-emerald-400 mt-0.5">
              {profile.successfulClaims || 0}
            </span>
            <span className="text-[9px] text-slate-500">SUCCESSFUL</span>
          </div>

          <div className="rounded-xl bg-slate-950/80 border border-slate-800 p-3 flex flex-col items-center">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider flex items-center space-x-1">
              <Award size={12} className="text-indigo-400" />
              <span>Total Earned</span>
            </span>
            <span className="text-xl font-black font-aviation text-indigo-300 mt-0.5">
              {profile.totalEarnedScore || 0}
            </span>
            <span className="text-[9px] text-slate-500">POINTS</span>
          </div>
        </div>

        {/* Sign Out Button */}
        <button
          id="btn-profile-signout"
          onClick={handleSignOut}
          className="w-full py-3 px-4 rounded-xl bg-rose-950/40 border border-rose-800/60 hover:bg-rose-900/50 text-rose-300 font-bold text-xs font-aviation uppercase tracking-wider flex items-center justify-center space-x-2 active:scale-95 transition-all cursor-pointer"
        >
          <LogOut size={16} />
          <span>SIGN OUT OF ACCOUNT</span>
        </button>
      </div>

      {/* Footer */}
      <footer className="pt-2 text-center text-[10px] text-slate-500">
        All points are virtual game points with zero real-world value.
      </footer>
    </div>
  );
};
