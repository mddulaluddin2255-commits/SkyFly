import React from 'react';
import { 
  Volume2, 
  VolumeX, 
  ArrowLeft, 
  Zap, 
  Shield, 
  Sparkles, 
  LogOut, 
  Coins, 
  Trophy, 
  User, 
  Play, 
  AlertTriangle 
} from 'lucide-react';
import { FlightRound, UserProfile } from '../types';

interface GameHUDProps {
  round: FlightRound;
  profile: UserProfile;
  currentScore: number;
  highScore: number;
  soundEnabled: boolean;
  onStartFlight: () => void;
  onClaimScore: () => void;
  onAbortFlight: () => void;
  onToggleSound: () => void;
  onOpenAdModal: () => void;
  onOpenSignUp?: () => void;
  onSignOut: () => void;
  insufficientPointsPrompt: boolean;
  onDismissInsufficientPoints: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  round,
  profile,
  currentScore,
  highScore,
  soundEnabled,
  onStartFlight,
  onClaimScore,
  onAbortFlight,
  onToggleSound,
  onOpenAdModal,
  onOpenSignUp,
  onSignOut,
  insufficientPointsPrompt,
  onDismissInsufficientPoints,
}) => {
  const currentMultiplier = round.currentMultiplier;
  const potentialScore = Math.floor(currentMultiplier * 10);
  const isIdle = round.status === 'idle';
  const isFlying = round.status === 'flying';
  const isCrashed = round.status === 'crashed';
  const isClaimed = round.status === 'claimed';

  // Dynamic Flight Status tag
  let statusText = 'READY FOR TAKEOFF';
  let statusColor = 'text-sky-400 border-sky-500/40 bg-sky-950/40';
  if (isFlying) {
    if (currentMultiplier < 2.0) {
      statusText = 'ASCENDING';
      statusColor = 'text-sky-400 border-sky-500/50 bg-sky-950/60';
    } else if (currentMultiplier < 5.0) {
      statusText = 'HIGH ALTITUDE';
      statusColor = 'text-indigo-400 border-indigo-500/50 bg-indigo-950/60';
    } else if (currentMultiplier < 15.0) {
      statusText = 'STRATOSPHERE';
      statusColor = 'text-purple-400 border-purple-500/50 bg-purple-950/60';
    } else {
      statusText = 'HYPERSONIC FLIGHT';
      statusColor = 'text-rose-400 border-rose-500/50 bg-rose-950/60 animate-pulse';
    }
  } else if (isCrashed) {
    statusText = 'CRASHED';
    statusColor = 'text-red-500 border-red-500/50 bg-red-950/80';
  } else if (isClaimed) {
    statusText = 'SCORE CLAIMED';
    statusColor = 'text-emerald-400 border-emerald-500/50 bg-emerald-950/80';
  }

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 sm:p-5 select-none z-10 overflow-hidden">
      {/* Top Header Bar */}
      <header className="flex items-center justify-between w-full pointer-events-auto space-x-1.5">
        {/* Back / Hangar button */}
        <button
          id="btn-hud-back"
          onClick={onAbortFlight}
          className="w-9 h-9 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700/60 flex items-center justify-center text-slate-300 hover:text-white transition-all active:scale-95 shrink-0"
          aria-label="Back to Hangar"
        >
          <ArrowLeft size={16} />
        </button>

        {/* Player Name & Virtual Points Pill (PROMINENT) */}
        <div className="flex items-center space-x-2 bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-slate-800 shadow-lg">
          <div className="flex items-center space-x-1.5 text-xs text-slate-200">
            <User size={13} className="text-sky-400" />
            <span id="hud-player-name" className="font-aviation font-bold max-w-[90px] sm:max-w-[120px] truncate">
              {profile.displayName || 'Pilot'}
            </span>
          </div>

          <span className="text-slate-600">|</span>

          {/* Current Virtual Points */}
          <div id="hud-virtual-points" className="flex items-center space-x-1 font-aviation font-black text-xs text-amber-300">
            <Coins size={13} className="text-amber-400 fill-current" />
            <span>{profile.virtualPoints.toLocaleString()} PTS</span>
          </div>
        </div>

        {/* Right Controls: Sound & Sign Out */}
        <div className="flex items-center space-x-1.5">
          {/* Sound Toggle */}
          <button
            id="btn-hud-sound"
            onClick={onToggleSound}
            className="w-9 h-9 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700/60 flex items-center justify-center text-slate-300 hover:text-white transition-all active:scale-95"
            aria-label="Toggle Sound"
          >
            {soundEnabled ? <Volume2 size={16} className="text-sky-400" /> : <VolumeX size={16} className="text-slate-500" />}
          </button>

          {/* Sign Out Button */}
          <button
            id="btn-hud-signout"
            onClick={onSignOut}
            className="w-9 h-9 rounded-xl bg-rose-950/40 backdrop-blur-md border border-rose-800/60 flex items-center justify-center text-rose-400 hover:text-rose-200 transition-all active:scale-95"
            aria-label="Sign Out"
            title="Sign Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* Flight Telemetry Status Bar */}
      <div className="flex items-center justify-between w-full pointer-events-auto px-1 pt-1">
        {/* Flight Status Pill */}
        <div className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider font-aviation flex items-center space-x-1.5 ${statusColor}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping"></span>
          <span>{statusText}</span>
        </div>

        {/* High Score Badge */}
        <div className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-slate-900/80 border border-amber-500/30 text-[10px] font-aviation text-amber-300">
          <Trophy size={11} className="text-amber-400" />
          <span>BEST: {highScore}</span>
        </div>
      </div>

      {/* Center Flight Multiplier Display */}
      <div className="flex flex-col items-center justify-center my-auto text-center pointer-events-none">
        <div className="relative">
          <div
            id="multiplier-display"
            className={`font-aviation font-black tracking-tight text-6xl sm:text-7xl md:text-8xl drop-shadow-2xl transition-all duration-75 ${
              isCrashed
                ? 'text-red-500 scale-95'
                : isClaimed
                ? 'text-emerald-400'
                : currentMultiplier > 10
                ? 'text-amber-300 animate-pulse'
                : 'text-sky-300'
            }`}
          >
            {currentMultiplier.toFixed(2)}x
          </div>

          {/* Potential Score Subtext */}
          {isFlying && (
            <div className="mt-1 flex items-center justify-center space-x-1 text-emerald-400 font-aviation text-sm sm:text-base font-bold tracking-wider animate-bounce">
              <Zap size={14} className="fill-current" />
              <span>SCORE: +{potentialScore} PTS</span>
            </div>
          )}

          {isClaimed && (
            <div className="mt-1 text-emerald-300 font-aviation text-base font-bold tracking-widest uppercase">
              Claimed at {round.claimedMultiplier?.toFixed(2)}x (+{round.earnedScore} PTS)
            </div>
          )}

          {isCrashed && (
            <div className="mt-1 text-red-400 font-aviation text-base font-bold tracking-widest uppercase">
              Crashed at {round.crashMultiplier.toFixed(2)}x
            </div>
          )}

          {isIdle && (
            <div className="mt-1 text-sky-400 font-aviation text-xs font-bold tracking-widest uppercase">
              Ascends 1.00x - 50.00x • Claim before crash!
            </div>
          )}
        </div>

        {/* Flight Cockpit Altimeter / Telemetry */}
        <div className="flex items-center space-x-3 mt-4 bg-slate-950/70 backdrop-blur-md px-4 py-1 rounded-full border border-slate-800 text-[11px] font-aviation text-slate-400">
          <span>ALT: <strong className="text-slate-200">FL{Math.floor(currentMultiplier * 100)}</strong></span>
          <span className="text-slate-600">|</span>
          <span>SPD: <strong className="text-slate-200">M {Math.min(0.8 + currentMultiplier * 0.25, 4.5).toFixed(2)}</strong></span>
          <span className="text-slate-600">|</span>
          <span>SCORE: <strong className="text-sky-400">+{potentialScore}</strong></span>
        </div>
      </div>

      {/* Insufficient Points Alert Overlay */}
      {insufficientPointsPrompt && (
        <div className="pointer-events-auto mx-auto w-full max-w-xs mb-2 p-3 rounded-2xl bg-rose-950/95 border-2 border-rose-500/80 text-white shadow-2xl flex flex-col items-center text-center animate-bounce">
          <div className="flex items-center space-x-1.5 text-rose-300 font-aviation font-bold text-xs">
            <AlertTriangle size={16} />
            <span>NOT ENOUGH POINTS (20 REQUIRED)</span>
          </div>
          <p className="text-[11px] text-slate-200 mt-1">
            {profile.uid === 'guest_pilot'
              ? 'Sign up to claim 1,000 free bonus points, or watch an ad for +100 points!'
              : 'Not enough points. Watch a rewarded ad to earn +100 points.'}
          </p>
          <div className="flex flex-col space-y-1.5 mt-2.5 w-full">
            {profile.uid === 'guest_pilot' && onOpenSignUp && (
              <button
                id="btn-insufficient-signup"
                onClick={onOpenSignUp}
                className="w-full py-2 px-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs font-aviation uppercase tracking-wider shadow-md active:scale-95"
              >
                SIGN UP (+1,000 FREE PTS)
              </button>
            )}
            <div className="flex items-center space-x-2 w-full">
              <button
                id="btn-insufficient-watch-ad"
                onClick={onOpenAdModal}
                className="flex-1 py-2 px-2 rounded-xl bg-slate-900 border border-amber-400/60 text-amber-300 font-bold text-xs font-aviation uppercase tracking-wider shadow-md active:scale-95"
              >
                WATCH AD +100 PTS
              </button>
              <button
                id="btn-insufficient-dismiss"
                onClick={onDismissInsufficientPoints}
                className="py-2 px-3 rounded-xl bg-slate-800 text-slate-300 text-xs font-aviation active:scale-95"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Controls Area */}
      <footer className="w-full max-w-sm mx-auto pointer-events-auto pb-2 sm:pb-4 space-y-2">
        {/* When in Ready/Idle or Crashed/Claimed state: START FLIGHT Button */}
        {(isIdle || isCrashed || isClaimed) && (
          <button
            id="btn-hud-start-flight"
            onClick={onStartFlight}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-sky-500 via-sky-400 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 active:scale-95 text-slate-950 font-black text-xl sm:text-2xl font-aviation tracking-wider uppercase shadow-2xl shadow-sky-500/40 border-t-2 border-white/50 flex items-center justify-center space-x-2.5 transition-all cursor-pointer"
          >
            <Play size={22} className="fill-current" />
            <span>START FLIGHT (-10 PTS)</span>
          </button>
        )}

        {/* When in Active Flight: CLAIM SCORE Button */}
        {isFlying && (
          <button
            id="btn-claim-score"
            onClick={onClaimScore}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400 hover:from-emerald-400 hover:to-teal-300 active:scale-95 text-slate-950 font-black text-xl sm:text-2xl font-aviation tracking-wider uppercase shadow-2xl shadow-emerald-500/40 border-t-2 border-white/60 flex flex-col items-center justify-center transition-all cursor-pointer animate-pulse"
          >
            <div className="flex items-center space-x-2">
              <Shield size={22} className="fill-current" />
              <span>CLAIM SCORE</span>
            </div>
            <span className="text-xs font-bold tracking-widest text-emerald-950/90 font-sans mt-0.5">
              SECURE +{potentialScore} POINTS NOW
            </span>
          </button>
        )}

        {/* WATCH AD +100 POINTS Button (Always accessible on HUD) */}
        <button
          id="btn-hud-watch-ad"
          onClick={onOpenAdModal}
          className="w-full py-2.5 px-4 rounded-xl bg-slate-950/90 border border-amber-500/50 hover:border-amber-400 text-amber-300 font-bold text-xs tracking-wider uppercase flex items-center justify-center space-x-2 transition-all active:scale-95 shadow-md shadow-amber-950/30 cursor-pointer"
        >
          <Sparkles size={14} className="text-amber-400 animate-spin" />
          <span>WATCH AD +100 POINTS</span>
        </button>

        {/* HUD Sub-stats bar */}
        <div className="flex items-center justify-between px-2 text-[11px] font-aviation text-slate-400">
          <div>
            SCORE: <span className="font-bold text-sky-400">{currentScore}</span>
          </div>
          <div>
            POINTS: <span className="font-bold text-amber-400">{profile.virtualPoints}</span>
          </div>
          <div>
            HIGH SCORE: <span className="font-bold text-indigo-300">{highScore}</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
