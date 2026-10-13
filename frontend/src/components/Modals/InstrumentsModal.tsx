import React from 'react';
import { useSettingsStore } from '../../store/useSettingsStore';
import { X, Check, Lock, Music } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const InstrumentsModal: React.FC = () => {
  const { instrumentsModalOpen, setInstrumentsModalOpen } = useSettingsStore();

  if (!instrumentsModalOpen) return null;

  const instruments = [
    {
      id: 'grand-piano',
      name: 'Salamander Concert Grand',
      desc: 'Authentic Yamaha C5 sampled in a concert hall with sparse 16-bit dynamics.',
      status: 'active',
      badge: 'Active Instrument',
    },
    {
      id: 'harpsichord',
      name: 'Flemish Double Harpsichord',
      desc: 'Crisp plucked Baroque strings with authentic natural release mechanics.',
      status: 'disabled',
      badge: 'Coming soon',
    },
    {
      id: 'rhodes',
      name: 'Rhodes Stage 73 Electric Piano',
      desc: 'Warm vintage tine bell tones driven through analog tube preamps.',
      status: 'disabled',
      badge: 'Coming soon',
    },
    {
      id: 'celeste',
      name: 'Concert Celesta & Glockenspiel',
      desc: 'Ethereal struck steel plates for orchestral film scoring.',
      status: 'disabled',
      badge: 'Coming soon',
    },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.94 }}
          className="w-full max-w-lg bg-studio-surface border border-studio-borderHighlight rounded-2xl p-6 sm:p-8 shadow-2xl relative"
        >
          {/* Close */}
          <button
            onClick={() => setInstrumentsModalOpen(false)}
            className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Title */}
          <div className="mb-6">
            <h2 className="text-2xl font-serif font-bold text-white flex items-center gap-2.5">
              <Music className="w-6 h-6 text-gold-400" />
              <span>Studio Instrument Rack</span>
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Version 1 is calibrated exclusively for Acoustic Concert Grand. Additional studio models are in mastering.
            </p>
          </div>

          {/* Instrument List */}
          <div className="space-y-3 mb-6">
            {instruments.map((inst) => {
              const isActive = inst.status === 'active';
              return (
                <div
                  key={inst.id}
                  className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-4 ${
                    isActive
                      ? 'bg-gold-500/10 border-gold-500/40 shadow-gold-glow'
                      : 'bg-black/30 border-white/5 opacity-60'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-semibold ${isActive ? 'text-gold-200' : 'text-gray-300'}`}>
                        {inst.name}
                      </span>
                      <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded-full font-semibold border ${
                        isActive
                          ? 'bg-gold-500/20 text-gold-300 border-gold-500/40'
                          : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                      }`}>
                        {inst.badge}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                      {inst.desc}
                    </p>
                  </div>

                  <div className="shrink-0 mt-1">
                    {isActive ? (
                      <div className="w-6 h-6 rounded-full bg-gold-400 text-black flex items-center justify-center">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-neutral-800 text-neutral-500 flex items-center justify-center">
                        <Lock className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => setInstrumentsModalOpen(false)}
            className="w-full py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-black font-semibold text-xs shadow-gold-glow transition-all"
          >
            Continue with Concert Grand
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
