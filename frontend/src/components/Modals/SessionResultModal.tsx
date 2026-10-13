import React, { useEffect } from 'react';
import { useEngineStore } from '../../store/useEngineStore';
import { useSongStore } from '../../store/useSongStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Flame, RotateCcw, ArrowRight, Award, Compass, X } from 'lucide-react';
import confetti from 'canvas-confetti';

export const SessionResultModal: React.FC = () => {
  const { sessionResult, showResultModal, closeResultModal } = useEngineStore();
  const { restart } = useSongStore();
  const { setActiveTab } = useSettingsStore();

  useEffect(() => {
    if (showResultModal && sessionResult && sessionResult.accuracy >= 85) {
      try {
        confetti({
          particleCount: 75,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#d4af37', '#f59e0b', '#fef08a'],
        });
      } catch (_) {}
    }
  }, [showResultModal, sessionResult]);

  if (!showResultModal || !sessionResult) return null;

  const handlePlayAgain = () => {
    closeResultModal();
    restart();
  };

  const handleLibrary = () => {
    closeResultModal();
    setActiveTab('songs');
  };

  const handleLeaderboard = () => {
    closeResultModal();
    setActiveTab('leaderboard');
  };

  const topMistakeNotes = Object.entries(sessionResult.mistakesByNote)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="w-full max-w-lg bg-[#0e1017] border border-white/[0.08] rounded-2xl p-6 sm:p-8 shadow-[0_30px_90px_rgba(0,0,0,0.95)] relative overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={closeResultModal}
            className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/[0.04] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Golden Header Badge */}
          <div className="text-center mb-6">
            <div className="inline-flex p-3 rounded-2xl bg-amber-400/10 border border-amber-400/25 text-amber-400 shadow-[0_0_20px_rgba(212,175,55,0.2)] mb-3">
              <Trophy className="w-8 h-8" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
              Session Completed
            </h2>
            <p className="text-xs text-amber-300/90 mt-1 font-medium">
              {sessionResult.songTitle} • <span className="uppercase font-mono">{sessionResult.mode}</span>
            </p>
          </div>

          {/* Primary Accuracy Telemetry Block */}
          <div className="bg-[#08090d] border border-white/[0.05] rounded-2xl p-5 mb-5 text-center relative overflow-hidden">
            <div className="text-5xl font-mono font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-300">
              {sessionResult.accuracy}%
            </div>
            <div className="text-[10px] uppercase font-mono tracking-widest text-gray-500 mt-1 font-semibold">
              Note Accuracy Rating
            </div>

            {/* Sub-metrics */}
            <div className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t border-white/[0.04] text-center text-xs font-mono">
              <div>
                <div className="text-gray-500 text-[9px] uppercase">Correct</div>
                <div className="font-bold text-emerald-400 mt-0.5">{sessionResult.correct}</div>
              </div>
              <div>
                <div className="text-gray-500 text-[9px] uppercase">Missed</div>
                <div className="font-bold text-red-400 mt-0.5">{sessionResult.wrong}</div>
              </div>
              <div>
                <div className="text-gray-500 text-[9px] uppercase">Timing</div>
                <div className="font-bold text-amber-300 mt-0.5">{sessionResult.timingAccuracy}%</div>
              </div>
              <div>
                <div className="text-gray-500 text-[9px] uppercase">Streak</div>
                <div className="font-bold text-amber-400 mt-0.5 flex items-center justify-center gap-0.5">
                  <Flame className="w-3 h-3 fill-amber-400" />
                  <span>{sessionResult.bestStreak}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Genuine Mistake Analysis & Drill Recommendation */}
          <div className="bg-gradient-to-br from-[#12141c] to-[#090b0e] border border-amber-400/20 rounded-xl p-4 mb-6 shadow-inner">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400 mb-2 font-mono">
              <Compass className="w-4 h-4 text-amber-400" />
              <span>Tailored Practice Recommendation</span>
            </div>
            
            <p className="text-xs text-gray-300 leading-relaxed font-sans">
              {sessionResult.practiceRecommendation}
            </p>

            {topMistakeNotes.length > 0 && (
              <div className="mt-3 pt-3 border-t border-white/[0.04] flex items-center gap-2 text-[11px] text-gray-400 flex-wrap">
                <span className="text-[10px] uppercase font-mono text-gray-500 font-semibold">Slip-ups:</span>
                {topMistakeNotes.map(([note, count]) => (
                  <span key={note} className="px-2 py-0.5 rounded bg-red-950/60 border border-red-800/40 text-red-300 font-mono text-[10px]">
                    {note} ({count}x)
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5">
            <button
              onClick={handlePlayAgain}
              className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-semibold text-xs shadow-[0_0_20px_rgba(212,175,55,0.25)] flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <RotateCcw className="w-4 h-4 fill-black" />
              <span>Play Again</span>
            </button>

            <button
              onClick={handleLeaderboard}
              className="w-full sm:flex-1 py-3 px-4 rounded-xl border border-white/[0.08] hover:border-amber-400/40 bg-white/[0.04] text-gray-200 hover:text-white font-medium text-xs flex items-center justify-center gap-2 transition-all"
            >
              <Award className="w-4 h-4 text-amber-400" />
              <span>Leaderboard</span>
            </button>

            <button
              onClick={handleLibrary}
              className="w-full sm:w-auto py-3 px-4 rounded-xl border border-white/[0.08] text-gray-400 hover:text-white hover:bg-white/[0.04] font-medium text-xs transition-all flex items-center justify-center gap-1"
            >
              <span>Library</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
