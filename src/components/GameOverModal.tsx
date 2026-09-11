import React from 'react';
import { RotateCcw, Home, Sparkles, Trophy, Flame, CheckCircle, Coins, ArrowRight } from 'lucide-react';
import { FlightRound, UserProfile } from '../types';

interface GameOverModalProps {
  round: FlightRound;
  profile: UserProfile;
  isNewHighScore: boolean;
  highScore: number;
  currentScore: number;
  onRestartFlight: () => void;
  onGoHome: () => void;
  onOpenAdModal: () => void;
  onOpenSignUp?: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  round,
  profile,
  isNewHighScore,
  highScore,
  currentScore,
  onRestartFlight,
  onGoHome,
  onOpenAdModal,
  onOpenSignUp,
}) => {
  const isCrashed = round.status === 'crashed';
  const isClaimed = round.status === 'claimed';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-sm rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 p-5 sm:p-6 shadow-2xl shadow-black/80 flex flex-col items-center text-center relative overflow-hidden text-white">
        {/* Glow backdrop */}
        <div
          className={`absolute -top-12 inset-x-0 h-32 blur-3xl opacity-30 pointer-events-none ${
            isClaimed ? 'bg-emerald-500' : 'bg-rose-500'
          }`}
        />

        {/* Status Icon */}
        <div className="relative mb-3">
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center border ${
              isClaimed
                ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-400 shadow-lg shadow-emerald-500/20'
                : 'bg-rose-950/60 border-rose-500/50 text-rose-500 shadow-lg shadow-rose-500/20'
            }`}
          >
            {isClaimed ? <CheckCircle size={32} /> : <Flame size={34} className="animate-bounce" />}
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-black font-aviation uppercase tracking-wide">
          {isClaimed ? 'Score Secured!' : 'Flight Crashed!'}
        </h2>

        {/* Multiplier Tag */}
        <p className="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-wider">
          {isClaimed ? (
            <>Claimed at <span className="text-emerald-400 font-bold font-aviation">{round.claimedMultiplier?.toFixed(2)}x</span> (Crashed at {round.crashMultiplier.toFixed(2)}x)</>
          ) : (
            <>Airplane exploded at <span className="text-rose-500 font-bold font-aviation">{round.crashMultiplier.toFixed(2)}x</span></>
          )}
        </p>

        {/* Points Summary Card */}
        <div className="w-full bg-slate-950/80 rounded-2xl border border-slate-800/80 p-4 my-3 flex flex-col items-center">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-widest">
            {isClaimed ? 'Score Earned' : 'Flight Outcome'}
          </span>
          <div className="flex items-baseline space-x-1 mt-1">
            <span
              className={`text-4xl font-black font-aviation ${
                isClaimed ? 'text-emerald-400' : 'text-slate-500'
              }`}
            >
              {isClaimed ? `+${round.earnedScore}` : '+0'}
            </span>
            <span className="text-xs font-bold text-slate-500">PTS</span>
          </div>

          {/* New High Score Alert */}
          {isNewHighScore && (
            <div className="mt-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-black font-aviation flex items-center space-x-1 animate-pulse">
              <Trophy size={13} className="text-amber-400" />
              <span>NEW PERSONAL BEST!</span>
            </div>
          )}

          {/* Balance & High Score Bar */}
          <div className="w-full grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-800/80 text-xs font-aviation">
            <div className="text-left flex flex-col">
              <span className="text-slate-500 text-[10px] uppercase">Point Balance</span>
              <span className="font-bold text-amber-400 flex items-center space-x-1 mt-0.5">
                <Coins size={12} className="text-amber-400" />
                <span>{profile.virtualPoints.toLocaleString()} PTS</span>
              </span>
            </div>
            <div className="text-right flex flex-col items-end">
              <span className="text-slate-500 text-[10px] uppercase">High Score</span>
              <span className="font-bold text-sky-400 mt-0.5">{highScore} PTS</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="w-full flex flex-col space-y-2">
          {/* Restart / Start Flight Button */}
          <button
            id="btn-modal-restart"
            onClick={onRestartFlight}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-sky-500 via-sky-400 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 text-slate-950 font-black text-base sm:text-lg font-aviation uppercase tracking-wider shadow-lg shadow-sky-500/25 flex items-center justify-center space-x-2 active:scale-95 transition-all cursor-pointer"
          >
            <RotateCcw size={18} />
            <span>START FLIGHT (-10 PTS)</span>
          </button>

          {/* Watch Ad for +100 Points */}
          <button
            id="btn-modal-ad-bonus"
            onClick={onOpenAdModal}
            className="w-full py-2.5 px-3 rounded-xl bg-slate-900 border border-amber-500/50 hover:border-amber-400 text-amber-300 font-bold text-xs font-aviation tracking-wider uppercase flex items-center justify-center space-x-2 active:scale-95 transition-all cursor-pointer"
          >
            <Sparkles size={14} className="text-amber-400 animate-spin" />
            <span>WATCH AD +100 POINTS</span>
          </button>

          {/* Guest Sign Up Bonus Callout */}
          {profile.uid === 'guest_pilot' && onOpenSignUp && (
            <button
              id="btn-modal-signup"
              onClick={onOpenSignUp}
              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs font-aviation uppercase tracking-wider flex items-center justify-center space-x-1.5 active:scale-95 transition-all shadow-md shadow-amber-500/20 cursor-pointer"
            >
              <Sparkles size={14} className="text-slate-950" />
              <span>SIGN UP & GET 1,000 FREE PTS</span>
            </button>
          )}

          {/* Go to Home */}
          <button
            id="btn-modal-home"
            onClick={onGoHome}
            className="w-full py-2 px-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 text-xs font-semibold flex items-center justify-center space-x-1.5 active:scale-95 transition-all"
          >
            <Home size={14} />
            <span>Return to Hangar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
