import React, { useState, useEffect } from 'react';
import { X, Trophy, Medal, Cloud, HardDrive, User, RefreshCw } from 'lucide-react';
import { ScoreRecord } from '../types';
import { getLocalScoreHistory, fetchTopCloudScores } from '../services/firebase';

interface LeaderboardModalProps {
  onClose: () => void;
  pilotName: string;
  onUpdatePilotName: (name: string) => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  onClose,
  pilotName,
  onUpdatePilotName,
}) => {
  const [tab, setTab] = useState<'local' | 'cloud'>('local');
  const [localScores, setLocalScores] = useState<ScoreRecord[]>([]);
  const [cloudScores, setCloudScores] = useState<ScoreRecord[]>([]);
  const [loadingCloud, setLoadingCloud] = useState<boolean>(false);
  const [editingName, setEditingName] = useState<string>(pilotName);
  const [isSavedName, setIsSavedName] = useState<boolean>(false);

  useEffect(() => {
    setLocalScores(getLocalScoreHistory());
  }, []);

  const loadCloud = async () => {
    setLoadingCloud(true);
    try {
      const list = await fetchTopCloudScores();
      setCloudScores(list);
    } catch {
      // offline fallback
    } finally {
      setLoadingCloud(false);
    }
  };

  useEffect(() => {
    if (tab === 'cloud') {
      loadCloud();
    }
  }, [tab]);

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingName.trim()) {
      onUpdatePilotName(editingName.trim());
      setIsSavedName(true);
      setTimeout(() => setIsSavedName(false), 2000);
    }
  };

  const scoresToDisplay = tab === 'local' ? localScores : cloudScores;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-5 shadow-2xl flex flex-col max-h-[85vh] text-white">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Trophy className="text-amber-400" size={20} />
            <h2 className="text-lg font-black font-aviation uppercase tracking-wider">Flight Leaderboard</h2>
          </div>
          <button
            id="btn-close-leaderboard"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Pilot Name Bar */}
        <form onSubmit={handleSaveName} className="flex items-center space-x-2 my-3 p-2 bg-slate-950 rounded-xl border border-slate-800">
          <User size={16} className="text-sky-400 ml-1" />
          <input
            id="input-pilot-callsign"
            type="text"
            value={editingName}
            onChange={(e) => setEditingName(e.target.value)}
            placeholder="Pilot Callsign (e.g. Maverick)"
            maxLength={18}
            className="bg-transparent text-xs sm:text-sm font-semibold text-white focus:outline-none flex-1 px-1"
          />
          <button
            type="submit"
            className="px-3 py-1 bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold font-aviation rounded-lg transition-colors cursor-pointer"
          >
            {isSavedName ? 'SAVED' : 'SET CALLSIGN'}
          </button>
        </form>

        {/* Tabs: Local vs Cloud */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <button
            id="tab-local-scores"
            onClick={() => setTab('local')}
            className={`py-2 rounded-xl text-xs font-bold font-aviation flex items-center justify-center space-x-1.5 transition-all ${
              tab === 'local'
                ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40'
                : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            <HardDrive size={13} />
            <span>LOCAL LOGBOOK</span>
          </button>

          <button
            id="tab-cloud-scores"
            onClick={() => setTab('cloud')}
            className={`py-2 rounded-xl text-xs font-bold font-aviation flex items-center justify-center space-x-1.5 transition-all ${
              tab === 'cloud'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            <Cloud size={13} />
            <span>FIREBASE CLOUD</span>
          </button>
        </div>

        {/* Scores List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[220px]">
          {loadingCloud ? (
            <div className="flex flex-col items-center justify-center h-48 text-slate-500 space-y-2">
              <RefreshCw size={22} className="animate-spin text-sky-400" />
              <span className="text-xs font-aviation">CONNECTING TO CLOUD LOGBOOK...</span>
            </div>
          ) : scoresToDisplay.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-slate-500 text-center p-4">
              <Trophy size={28} className="text-slate-600 mb-2" />
              <p className="text-xs font-semibold">No recorded flights yet.</p>
              <p className="text-[11px] text-slate-600 mt-1">Start a flight and claim points before the crash!</p>
            </div>
          ) : (
            scoresToDisplay.map((rec, index) => (
              <div
                key={rec.id || index}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center text-xs font-black font-aviation">
                    {index === 0 ? (
                      <Medal size={14} className="text-amber-400" />
                    ) : index === 1 ? (
                      <Medal size={14} className="text-slate-300" />
                    ) : index === 2 ? (
                      <Medal size={14} className="text-amber-700" />
                    ) : (
                      <span className="text-slate-400">#{index + 1}</span>
                    )}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-200 block truncate max-w-[130px]">
                      {rec.pilotName || 'Ace Pilot'}
                    </span>
                    <span className="text-[10px] text-slate-500 font-aviation">
                      {rec.multiplier.toFixed(2)}x Multiplier
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm font-black font-aviation text-sky-400 block">
                    +{rec.score} <span className="text-[10px] text-slate-500">PTS</span>
                  </span>
                  <span className="text-[9px] text-slate-600">
                    {new Date(rec.timestamp).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Note */}
        <div className="mt-3 pt-2 border-t border-slate-800/80 text-center">
          <span className="text-[10px] text-slate-500">
            Firebase Web SDK: sky-fly-de6b5 • Safe client-only sync
          </span>
        </div>
      </div>
    </div>
  );
};
