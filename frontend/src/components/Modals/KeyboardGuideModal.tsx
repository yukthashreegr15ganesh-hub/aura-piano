import React from 'react';
import { useSettingsStore } from '../../store/useSettingsStore';
import { ALL_PIANO_KEYS } from '../../songs/keyMap';
import { X, Keyboard, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const KeyboardGuideModal: React.FC = () => {
  const { keyboardGuideOpen, setKeyboardGuideOpen, showKeyLabels, toggleKeyLabels } = useSettingsStore();

  if (!keyboardGuideOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.94 }}
          className="w-full max-w-2xl bg-studio-surface border border-studio-borderHighlight rounded-2xl p-6 sm:p-8 shadow-2xl relative"
        >
          {/* Close */}
          <button
            onClick={() => setKeyboardGuideOpen(false)}
            className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-gold-500/10 border border-gold-500/30 text-gold-400">
              <Keyboard className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold text-white">
                Computer Keyboard Guide
              </h2>
              <p className="text-xs text-gray-400">
                Play 2 full octaves (C4 to E6) naturally with standard computer keys.
              </p>
            </div>
          </div>

          {/* Two-octave visual layout table */}
          <div className="space-y-4 mb-6">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gold-400 mb-2">
                First Octave (C4 – C5)
              </h4>
              <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5 text-center text-xs">
                {ALL_PIANO_KEYS.slice(0, 12).map((k) => (
                  <div
                    key={k.note}
                    className={`p-2 rounded-lg border ${
                      k.isBlack
                        ? 'bg-neutral-900 border-neutral-700 text-gold-300'
                        : 'bg-neutral-800/80 border-neutral-600 text-white'
                    }`}
                  >
                    <div className="font-mono font-bold text-sm text-gold-400">{k.keyboardDisplay}</div>
                    <div className="text-[10px] text-gray-400 mt-0.5">{k.note}</div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gold-400 mb-2">
                Second Octave & Treble Extension (C#5 – E6)
              </h4>
              <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5 text-center text-xs">
                {ALL_PIANO_KEYS.slice(12).map((k) => (
                  <div
                    key={k.note}
                    className={`p-2 rounded-lg border ${
                      k.isBlack
                        ? 'bg-neutral-900 border-neutral-700 text-gold-300'
                        : 'bg-neutral-800/80 border-neutral-600 text-white'
                    }`}
                  >
                    <div className="font-mono font-bold text-sm text-gold-400">{k.keyboardDisplay}</div>
                    <div className="text-[10px] text-gray-400 mt-0.5">{k.note}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Special controls: Spacebar sustain, velocity, octave shift, loop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-start gap-3">
                <div className="px-2.5 py-1 bg-neutral-800 rounded font-mono font-bold text-gold-300 text-xs border border-neutral-600 mt-0.5">
                  SPACEBAR
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-200">Acoustic Sustain Pedal</div>
                  <div className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">
                    Hold Space to let notes ring out and resonate until released.
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-start gap-3">
                <div className="p-1.5 bg-neutral-800 rounded text-gold-400 border border-neutral-600 mt-0.5 font-mono text-xs font-bold">
                  -8va / +8va
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-200">Octave Shifting</div>
                  <div className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">
                    Shift keyboard pitch up or down to play basslines or high treble across the full piano.
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-start gap-3">
                <div className="p-1.5 bg-neutral-800 rounded text-gold-400 border border-neutral-600 mt-0.5">
                  <Volume2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-200">Velocity Dynamics</div>
                  <div className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">
                    Mouse or touch click: tap top of key for soft touch, bottom for fortissimo.
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-start gap-3">
                <div className="p-1.5 bg-neutral-800 rounded text-amber-400 border border-neutral-600 mt-0.5 font-mono text-xs font-bold">
                  LOOP
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-200">Continuous Practice Mode</div>
                  <div className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">
                    Loop toggle in HUD repeats the song endlessly with no interruptions or session limits.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <button
              onClick={toggleKeyLabels}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                showKeyLabels ? 'bg-gold-500/20 text-gold-300 border-gold-500/40' : 'text-gray-400 border-white/10'
              }`}
            >
              {showKeyLabels ? 'Key Labels: Enabled' : 'Key Labels: Hidden'}
            </button>

            <button
              onClick={() => setKeyboardGuideOpen(false)}
              className="px-5 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-black font-semibold text-xs transition-all shadow-gold-glow"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
