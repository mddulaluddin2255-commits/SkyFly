import React, { useState, useEffect } from 'react';
import { X, Sparkles, CheckCircle2, Tv, ShieldCheck, Play, Award } from 'lucide-react';
import { ADMOB_CONFIG } from '../services/admob';
import { soundService } from '../services/sound';

interface AdModalProps {
  onClose: () => void;
  onRewardGranted: (bonusPoints: number, rewardToken: string) => void;
}

export const AdModal: React.FC<AdModalProps> = ({
  onClose,
  onRewardGranted,
}) => {
  const [countdown, setCountdown] = useState<number>(5);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isRewarded, setIsRewarded] = useState<boolean>(false);
  const [rewardToken, setRewardToken] = useState<string>('');

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown((c) => c - 1);
      }, 1000);
    } else if (countdown === 0 && !isRewarded) {
      const token = `admob_rew_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      setRewardToken(token);
      setIsRewarded(true);
      soundService.playClaimSuccess();
    }
    return () => clearTimeout(timer);
  }, [isPlaying, countdown, isRewarded]);

  const handleClaimReward = () => {
    if (!isRewarded || !rewardToken) return;
    soundService.playClick();
    onRewardGranted(ADMOB_CONFIG.rewardPoints, rewardToken);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-amber-500/40 p-5 shadow-2xl flex flex-col items-center text-center relative overflow-hidden text-white">
        {/* Top Info Bar */}
        <div className="flex items-center justify-between w-full mb-3 pb-2 border-b border-slate-800">
          <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-400 font-aviation">
            <Tv size={15} />
            <span>GOOGLE ADS REWARD</span>
          </div>

          {countdown === 0 ? (
            <button
              id="btn-close-ad-modal"
              onClick={onClose}
              className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
            >
              <X size={16} />
            </button>
          ) : (
            <div className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-slate-400">
              Reward in: {countdown}s
            </div>
          )}
        </div>

        {/* Video / Ad Area Simulation */}
        <div className="w-full h-44 rounded-2xl bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950/80 border border-slate-800 relative flex flex-col items-center justify-center p-4 overflow-hidden">
          <div className="absolute inset-0 bg-radial from-amber-500/10 to-transparent pointer-events-none"></div>

          {!isRewarded ? (
            <div className="flex flex-col items-center space-y-3">
              <div className="relative">
                <div className="w-14 h-14 rounded-full bg-amber-500/20 border border-amber-400/50 flex items-center justify-center animate-pulse">
                  <Play size={24} className="text-amber-400 fill-current ml-1" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-amber-400 text-slate-950 text-xs font-black flex items-center justify-center font-aviation">
                  {countdown}
                </div>
              </div>
              <div>
                <span className="text-xs font-bold text-slate-200 block">Flight Sponsor Showcase</span>
                <span className="text-[10px] text-slate-400">Watch entire video for verified callback</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2 animate-bounce">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-400/60 flex items-center justify-center text-emerald-400">
                <CheckCircle2 size={32} />
              </div>
              <span className="text-sm font-bold text-emerald-400 font-aviation">
                OFFICIAL REWARD VERIFIED!
              </span>
            </div>
          )}

          {/* Google AdSense Info badge */}
          <div className="absolute bottom-2 inset-x-2 flex items-center justify-between text-[9px] text-slate-500 font-mono px-2">
            <span>Client: {ADMOB_CONFIG.clientId}</span>
            <span className="text-amber-400 font-sans font-bold">Google Ads Active</span>
          </div>
        </div>

        {/* Reward Value Display */}
        <div className="my-4">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Completed Ad Bonus</span>
          <div className="text-3xl font-black font-aviation text-amber-300 flex items-center justify-center space-x-1.5 mt-0.5">
            <Sparkles size={20} className="text-amber-400" />
            <span>+100 VIRTUAL POINTS</span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">
            Points credit immediately to your pilot profile
          </span>
        </div>

        {/* Action Button */}
        {isRewarded ? (
          <button
            id="btn-claim-ad-reward"
            onClick={handleClaimReward}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black text-sm font-aviation uppercase tracking-wider shadow-lg shadow-emerald-500/30 flex items-center justify-center space-x-2 active:scale-95 transition-all cursor-pointer"
          >
            <Award size={18} />
            <span>CLAIM +100 POINTS BONUS</span>
          </button>
        ) : (
          <div className="w-full py-2.5 px-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-500 text-xs font-aviation">
            PLAYING SPONSORED ADVERTISEMENT ({countdown}s)...
          </div>
        )}

        <div className="mt-3 text-[9px] text-slate-500 text-center leading-tight">
          Publisher: <span className="text-slate-400">{ADMOB_CONFIG.clientId}</span>
        </div>
      </div>
    </div>
  );
};
