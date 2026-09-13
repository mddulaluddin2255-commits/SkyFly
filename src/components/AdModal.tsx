import React, { useState, useEffect, useRef } from 'react';
import { X, Sparkles, CheckCircle2, Tv, Play, Award } from 'lucide-react';
import { ADSTERRA_CONFIG, generateRewardToken } from '../services/admob';
import { soundService } from '../services/sound';
import { AdsterraNativeBanner } from './AdsterraNativeBanner';

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
  const claimedRef = useRef(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown((c) => c - 1);
      }, 1000);
    } else if (countdown === 0 && !isRewarded && !claimedRef.current) {
      claimedRef.current = true;
      const token = generateRewardToken();
      setRewardToken(token);
      setIsRewarded(true);
      soundService.playClaimSuccess();
    }
    return () => clearTimeout(timer);
  }, [isPlaying, countdown, isRewarded]);

  const handleClaimReward = () => {
    if (!isRewarded || !rewardToken) return;
    soundService.playClick();
    onRewardGranted(ADSTERRA_CONFIG.rewardPoints, rewardToken);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-amber-500/40 p-5 shadow-2xl flex flex-col items-center text-center relative overflow-hidden text-white max-h-[95vh] overflow-y-auto">
        {/* Top Info Bar */}
        <div className="flex items-center justify-between w-full mb-3 pb-2 border-b border-slate-800">
          <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-400 font-aviation">
            <Tv size={15} />
            <span>ADSTERRA REWARDS</span>
          </div>

          {countdown === 0 || isRewarded ? (
            <button
              id="btn-close-ad-modal"
              onClick={onClose}
              className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer"
            >
              <X size={16} />
            </button>
          ) : (
            <div className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-slate-400">
              Reward in: {countdown}s
            </div>
          )}
        </div>

        {/* Adsterra Native Banner Reward Area */}
        <div className="w-full rounded-2xl bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950/80 border border-slate-800 relative flex flex-col items-center justify-center p-3 overflow-hidden">
          <div className="absolute inset-0 bg-radial from-amber-500/10 to-transparent pointer-events-none"></div>

          {/* Adsterra Native Banner Unit */}
          <AdsterraNativeBanner className="w-full my-1" showBadge={true} />

          {!isRewarded ? (
            <div className="flex items-center space-x-3 mt-2 py-1.5 px-3 rounded-xl bg-slate-900/90 border border-slate-800 w-full">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-400/50 flex items-center justify-center animate-pulse shrink-0">
                <Play size={16} className="text-amber-400 fill-current ml-0.5" />
              </div>
              <div className="text-left">
                <span className="text-xs font-bold text-slate-200 block">Sponsor Showcase</span>
                <span className="text-[10px] text-slate-400">Viewing Adsterra sponsored ad ({countdown}s)</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-2 mt-2 py-1.5 px-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 animate-bounce w-full justify-center">
              <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
              <span className="text-xs font-bold text-emerald-400 font-aviation">
                ADSTERRA REWARD VERIFIED!
              </span>
            </div>
          )}
        </div>

        {/* Reward Value Display */}
        <div className="my-3">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Completed Ad Reward</span>
          <div className="text-3xl font-black font-aviation text-amber-300 flex items-center justify-center space-x-1.5 mt-0.5">
            <Sparkles size={20} className="text-amber-400" />
            <span>+{ADSTERRA_CONFIG.rewardPoints} VIRTUAL POINTS</span>
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
            <span>CLAIM +{ADSTERRA_CONFIG.rewardPoints} POINTS BONUS</span>
          </button>
        ) : (
          <div className="w-full py-2.5 px-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-500 text-xs font-aviation">
            SPONSORED ADVERTISEMENT ({countdown}s)...
          </div>
        )}

        <div className="mt-3 text-[9px] text-slate-500 text-center leading-tight">
          Ad Network: <span className="text-slate-400">Adsterra Native</span>
        </div>
      </div>
    </div>
  );
};
