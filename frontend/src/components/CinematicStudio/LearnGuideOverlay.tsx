import React from 'react';
import { useEngineStore } from '../../store/useEngineStore';
import { useSongStore } from '../../store/useSongStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, AlertCircle } from 'lucide-react';

export const LearnGuideOverlay: React.FC = () => {
  const { mode } = useSongStore();
  const { nextKeyHint, lastEvaluation } = useEngineStore();

  if (mode !== 'learn' || !nextKeyHint) return null;

  const isMistake = lastEvaluation?.status === 'miss';

  return (
    <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
      <AnimatePresence mode="wait">
        <motion.div
          key={nextKeyHint.note}
          initial={{ opacity: 0, y: -8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.95 }}
          className={`backdrop-blur-md px-5 py-2.5 rounded-xl border flex items-center gap-3.5 shadow-2xl transition-colors ${
            isMistake
              ? 'bg-red-950/80 border-red-500/50 shadow-red-500/20'
              : 'bg-studio-panel/90 border-studio-borderHighlight shadow-amber-glow'
          }`}
        >
          {/* Key cap visual */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] uppercase tracking-wider text-gray-400 font-medium">
              Next Note:
            </span>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-b from-neutral-700 to-neutral-900 border border-neutral-600 flex items-center justify-center font-mono font-bold text-gold-300 text-sm shadow-inner">
              {nextKeyHint.computerKey || '?'}
            </div>
            <span className="font-serif text-sm font-semibold text-gold-200">
              ({nextKeyHint.note})
            </span>
          </div>

          <div className="h-4 w-[1px] bg-white/10" />

          {/* Prompt text */}
          <div className="text-xs flex items-center gap-1.5">
            {isMistake ? (
              <>
                <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                <span className="text-red-300 font-medium">
                  Wrong key! Press <strong className="text-white font-mono">[{nextKeyHint.computerKey}]</strong> to advance
                </span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-gold-400" />
                <span className="text-gray-300">
                  Waiting for key <strong className="text-gold-300 font-mono">[{nextKeyHint.computerKey}]</strong>
                </span>
              </>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
