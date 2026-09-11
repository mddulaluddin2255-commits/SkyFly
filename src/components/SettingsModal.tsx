import React from 'react';
import { X, Volume2, ShieldCheck, Smartphone, HelpCircle, Check, Coins } from 'lucide-react';
import { GameSettings } from '../types';
import { ADMOB_CONFIG } from '../services/admob';

interface SettingsModalProps {
  settings: GameSettings;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-5 shadow-2xl flex flex-col max-h-[90vh] text-white overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <h2 className="text-base sm:text-lg font-black font-aviation uppercase tracking-wider">Flight Settings & Rules</h2>
          </div>
          <button
            id="btn-close-settings"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto space-y-4 py-3 pr-1 text-xs">
          {/* Audio & Haptics Section */}
          <div className="space-y-2">
            <h3 className="text-[11px] font-bold text-sky-400 uppercase tracking-wider font-aviation">
              Audio & Feedback
            </h3>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="flex items-center space-x-2.5">
                <Volume2 size={18} className="text-slate-400" />
                <div>
                  <span className="font-semibold block text-slate-200">Sound Effects</span>
                  <span className="text-[10px] text-slate-500">Explosion, claim chimes, clicks</span>
                </div>
              </div>
              <button
                id="toggle-sound-effects"
                onClick={() => onUpdateSettings({ soundEnabled: !settings.soundEnabled })}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  settings.soundEnabled ? 'bg-sky-500' : 'bg-slate-800'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-0.5 ${
                    settings.soundEnabled ? 'left-5.5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="flex items-center space-x-2.5">
                <Smartphone size={18} className="text-slate-400" />
                <div>
                  <span className="font-semibold block text-slate-200">Jet Engine Audio</span>
                  <span className="text-[10px] text-slate-500">Turbine sound scaling with flight multiplier</span>
                </div>
              </div>
              <button
                id="toggle-engine-sound"
                onClick={() => onUpdateSettings({ engineSoundEnabled: !settings.engineSoundEnabled })}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  settings.engineSoundEnabled ? 'bg-sky-500' : 'bg-slate-800'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-0.5 ${
                    settings.engineSoundEnabled ? 'left-5.5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="flex items-center space-x-2.5">
                <Smartphone size={18} className="text-slate-400" />
                <div>
                  <span className="font-semibold block text-slate-200">Haptics & Vibration</span>
                  <span className="text-[10px] text-slate-500">Tactile pulse on crash explosion & claim</span>
                </div>
              </div>
              <button
                id="toggle-haptics"
                onClick={() => onUpdateSettings({ hapticsEnabled: !settings.hapticsEnabled })}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  settings.hapticsEnabled ? 'bg-sky-500' : 'bg-slate-800'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-0.5 ${
                    settings.hapticsEnabled ? 'left-5.5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Gameplay Rules & Points System */}
          <div className="space-y-2">
            <h3 className="text-[11px] font-bold text-amber-400 uppercase tracking-wider font-aviation flex items-center space-x-1.5">
              <Coins size={14} />
              <span>Virtual Points & Flight Rules</span>
            </h3>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-slate-300">
              <div className="flex items-start space-x-2">
                <Check size={14} className="text-emerald-400 mt-0.5 shrink-0" />
                <span><strong>Starting Balance:</strong> Guest pilots start with 0 points. Sign up for a free pilot account to claim 1,000 Free Virtual Points!</span>
              </div>
              <div className="flex items-start space-x-2">
                <Check size={14} className="text-emerald-400 mt-0.5 shrink-0" />
                <span><strong>Flight Cost:</strong> Deducts exactly 20 points only when flight actually starts.</span>
              </div>
              <div className="flex items-start space-x-2">
                <Check size={14} className="text-emerald-400 mt-0.5 shrink-0" />
                <span><strong>Claim Score:</strong> Convert multiplier to virtual points (e.g. 5.50x = 55 points).</span>
              </div>
              <div className="flex items-start space-x-2">
                <Check size={14} className="text-emerald-400 mt-0.5 shrink-0" />
                <span><strong>Crash Point:</strong> Hidden random multiplier from 1.00x up to 50.00x each flight.</span>
              </div>
              <div className="flex items-start space-x-2">
                <Check size={14} className="text-emerald-400 mt-0.5 shrink-0" />
                <span><strong>Rewarded Ad Bonus:</strong> Complete a rewarded video ad to receive +100 virtual points.</span>
              </div>
            </div>
          </div>

          {/* Google Ads & AdSense Config Info */}
          <div className="space-y-2">
            <h3 className="text-[11px] font-bold text-sky-400 uppercase tracking-wider font-aviation flex items-center space-x-1.5">
              <ShieldCheck size={14} />
              <span>Google Ads & AdSense Integration</span>
            </h3>
            <div className="p-3 rounded-xl bg-slate-950 border border-sky-500/30 text-slate-400 space-y-1.5 font-mono text-[10px]">
              <div>
                <span className="text-slate-500 block">Google Client / Publisher ID:</span>
                <span className="text-amber-300 select-all">{ADMOB_CONFIG.clientId}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Script Status:</span>
                <span className="text-emerald-400 font-sans font-semibold">Active in HTML Head</span>
              </div>
              <p className="text-slate-500 font-sans text-[10px] pt-1">
                Integrated with Google AdSense (ca-pub-5378392556030394) and server-side single-use reward verification awarding +100 virtual points per completed view.
              </p>
            </div>
          </div>

          {/* Pure Virtual Points Policy */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[10px] text-slate-500 text-center leading-relaxed">
            SkyFly is strictly an arcade game using virtual game points. Points have no real-world value. No real-money gambling, deposits, betting, or withdrawals.
          </div>
        </div>
      </div>
    </div>
  );
};
