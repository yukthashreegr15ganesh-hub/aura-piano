import React, { useState } from 'react';
import { useSongStore } from '../../store/useSongStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { PlayMode, Song } from '../../songs/types';
import { X, Play, Sparkles, Target, Award, Clock, Music2, Gauge } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface SongStartModalProps {
  song?: Song | null;
  isOpen?: boolean;
  onClose?: () => void;
}

export const SongStartModal: React.FC<SongStartModalProps> = ({ song: propSong, isOpen: propIsOpen, onClose: propOnClose }) => {
  const { currentSong, setSong, restart } = useSongStore();
  const { setActiveTab, songStartModalOpen, setSongStartModalOpen } = useSettingsStore();
  const [selectedMode, setSelectedMode] = useState<PlayMode>('practice');

  const isOpen = propIsOpen !== undefined ? propIsOpen : songStartModalOpen;
  const song = propSong || currentSong;

  if (!isOpen || !song) return null;

  const handleClose = () => {
    if (propOnClose) propOnClose();
    setSongStartModalOpen(false);
  };

  const lastBeat = song.notes.length > 0 ? song.notes[song.notes.length - 1].startBeat + 2 : 16;
  const estimatedSeconds = Math.round((lastBeat / (song.bpm / 60)));
  const minutes = Math.floor(estimatedSeconds / 60);
  const seconds = estimatedSeconds % 60;
  const durationText = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  const handleStart = () => {
    setSong(song, selectedMode);
    handleClose();
    setActiveTab('studio');
    if (selectedMode !== 'free_play') {
      setTimeout(() => restart(), 150);
    }
  };

  const modeOptions: { id: PlayMode; title: string; desc: string; icon: any }[] = [
    {
      id: 'learn',
      title: 'Learn Mode',
      desc: 'Step-by-step guidance. Pauses and waits for you to strike the correct key.',
      icon: Sparkles,
    },
    {
      id: 'practice',
      title: 'Practice Mode',
      desc: 'Continuous play at 75% speed. Follow falling notes without blocking.',
      icon: Target,
    },
    {
      id: 'performance',
      title: 'Performance Mode',
      desc: 'Full tempo challenge. Judged by timing windows and logged to leaderboard.',
      icon: Award,
    },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.94 }}
          className="w-full max-w-lg bg-[#0e1017] border border-white/[0.08] rounded-2xl p-6 sm:p-7 shadow-[0_25px_70px_rgba(0,0,0,0.9)] relative"
        >
          {/* Close */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/[0.04] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="mb-5">
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-amber-400 font-semibold">
              {song.category} • {song.difficulty}
            </span>
            <h2 className="text-2xl font-serif font-bold text-white mt-1">
              {song.title}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">{song.artist}</p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3 mb-6 bg-[#08090d] p-3.5 rounded-xl border border-white/[0.04] text-center">
            <div>
              <div className="text-[10px] text-gray-500 uppercase flex items-center justify-center gap-1 font-mono">
                <Gauge className="w-3.5 h-3.5 text-amber-400" />
                <span>Tempo</span>
              </div>
              <div className="text-sm font-semibold font-mono text-gray-200 mt-0.5">{song.bpm} BPM</div>
            </div>

            <div>
              <div className="text-[10px] text-gray-500 uppercase flex items-center justify-center gap-1 font-mono">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Duration</span>
              </div>
              <div className="text-sm font-semibold font-mono text-gray-200 mt-0.5">{durationText}</div>
            </div>

            <div>
              <div className="text-[10px] text-gray-500 uppercase flex items-center justify-center gap-1 font-mono">
                <Music2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Notes</span>
              </div>
              <div className="text-sm font-semibold font-mono text-gray-200 mt-0.5">{song.notes.length}</div>
            </div>
          </div>

          {/* Mode Selector */}
          <div className="mb-6">
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
              Select Experience
            </label>
            <div className="space-y-2.5">
              {modeOptions.map((opt) => {
                const Icon = opt.icon;
                const isSelected = selectedMode === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => setSelectedMode(opt.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3.5 ${
                      isSelected
                        ? 'bg-amber-400/10 border-amber-400/40 shadow-sm'
                        : 'bg-[#0a0b10] border-white/[0.04] hover:border-white/[0.1]'
                    }`}
                  >
                    <div className={`p-2 rounded-lg mt-0.5 ${
                      isSelected ? 'bg-amber-400 text-black' : 'bg-white/[0.04] text-gray-400'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-semibold ${isSelected ? 'text-amber-300' : 'text-gray-200'}`}>
                          {opt.title}
                        </span>
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                        {opt.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleClose}
              className="flex-1 py-2.5 px-4 rounded-xl border border-white/[0.08] text-gray-400 hover:text-white hover:bg-white/[0.04] text-xs font-medium transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleStart}
              className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-semibold text-xs shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-black" />
              <span>Begin Session</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
