import React, { useState } from 'react';
import { useSongStore } from '../../store/useSongStore';
import { Mic2, Music, Volume2, VolumeX, Sliders, ChevronDown, ChevronUp, Play, Pause } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const KaraokeLyricsDisplay: React.FC = () => {
  const {
    currentSong,
    isKaraokeEnabled,
    karaokeVolume,
    melodyVolume,
    isMelodyEnabled,
    karaokeStyle,
    showKaraokeLyrics,
    activeKaraokeChord,
    activeKaraokeLyric,
    playbackState,
    play,
    pause,
    playKaraoke,
    toggleKaraoke,
    setKaraokeVolume,
    setMelodyVolume,
    setMelodyEnabled,
    setKaraokeStyle,
    toggleKaraokeLyrics,
  } = useSongStore();

  const [showSettingsPopover, setShowSettingsPopover] = useState(false);

  if (!currentSong) return null;

  const hasLyrics = currentSong.lyrics && currentSong.lyrics.length > 0;

  return (
    <div className="w-full max-w-6xl my-2 relative z-20">
      <div className="bg-[#0b0d13]/90 backdrop-blur-xl border border-amber-400/25 rounded-2xl p-3.5 sm:p-4 shadow-[0_0_30px_rgba(0,0,0,0.8),0_0_20px_rgba(212,175,55,0.08)] flex flex-col gap-2.5 transition-all">
        {/* Top Strip: Karaoke Mode Badge, Active Chord, & Quick Settings */}
        <div className="flex items-center justify-between gap-3">
          {/* Left: Karaoke Badge & Active Chord */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={toggleKaraoke}
              title={isKaraokeEnabled ? "Karaoke Backing: Active" : "Karaoke Backing: Muted"}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all border ${
                isKaraokeEnabled
                  ? 'bg-amber-400/20 text-amber-300 border-amber-400/50 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                  : 'bg-white/[0.04] text-gray-400 border-white/[0.08] hover:text-white'
              }`}
            >
              <Mic2 className="w-3.5 h-3.5" />
              <span>{isKaraokeEnabled ? 'Karaoke: Active' : 'Karaoke: Off'}</span>
              <span className={`w-2 h-2 rounded-full ${isKaraokeEnabled ? 'bg-amber-400 animate-pulse' : 'bg-gray-500'}`} />
            </button>

            {/* Instant Play / Pause Song */}
            <button
              onClick={() => {
                if (playbackState === 'playing') {
                  pause();
                } else {
                  playKaraoke();
                }
              }}
              title={playbackState === 'playing' ? "Pause Song" : `Play "${currentSong.title}" with accompaniment`}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95 ${
                playbackState === 'playing'
                  ? 'bg-amber-400 text-black hover:bg-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                  : 'bg-gradient-to-r from-amber-400 to-amber-500 text-black hover:from-amber-300 hover:to-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
              }`}
            >
              {playbackState === 'playing' ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-black" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-black" />
                  <span>Play Song</span>
                </>
              )}
            </button>

            {/* Glowing Active Chord Display */}
            {isKaraokeEnabled && activeKaraokeChord && (
              <motion.div
                key={activeKaraokeChord.name}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-400/15 border border-amber-400/40 text-amber-300 shadow-sm"
              >
                <Music className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-mono font-bold text-sm text-white tracking-wide">
                  {activeKaraokeChord.name}
                </span>
                <span className="text-[10px] font-mono text-amber-300/80">
                  ({activeKaraokeChord.bass})
                </span>
              </motion.div>
            )}

            {isKaraokeEnabled && (
              <span className="text-[11px] text-gray-400 font-mono hidden lg:inline truncate max-w-[240px]">
                • {currentSong.title}
              </span>
            )}

            {isKaraokeEnabled && !activeKaraokeChord && (
              <div className="text-[11px] font-mono text-gray-500 italic hidden sm:inline">
                Awaiting chord downbeat...
              </div>
            )}
          </div>

          {/* Right: Style Selector & Popover Trigger */}
          <div className="flex items-center gap-2">
            {/* Quick volume slider */}
            {isKaraokeEnabled && (
              <div className="hidden sm:flex items-center gap-2 bg-[#08090d] px-3 py-1 rounded-xl border border-white/[0.06]">
                <button
                  onClick={() => setKaraokeVolume(karaokeVolume > 0 ? 0 : 0.65)}
                  className="text-gray-400 hover:text-amber-300 transition-colors"
                >
                  {karaokeVolume === 0 ? (
                    <VolumeX className="w-3.5 h-3.5 text-red-400" />
                  ) : (
                    <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={karaokeVolume}
                  onChange={(e) => setKaraokeVolume(parseFloat(e.target.value))}
                  className="w-16 accent-amber-400 h-1 bg-gray-700 rounded cursor-pointer"
                  title={`Backing track volume: ${Math.round(karaokeVolume * 100)}%`}
                />
                <span className="text-[10px] font-mono text-gray-400 w-7">
                  {Math.round(karaokeVolume * 100)}%
                </span>
              </div>
            )}

            {/* Settings Dropdown Button */}
            <button
              onClick={() => setShowSettingsPopover(!showSettingsPopover)}
              className="p-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-gray-400 hover:text-white border border-white/[0.06] transition-colors flex items-center gap-1 text-xs"
              title="Karaoke backing arrangement settings"
            >
              <Sliders className="w-3.5 h-3.5" />
              {showSettingsPopover ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>
        </div>

        {/* Settings Popover Drawer */}
        <AnimatePresence>
          {showSettingsPopover && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="pt-2 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-3 text-xs overflow-hidden"
            >
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-[11px] uppercase font-mono">Arrangement Style:</span>
                {(['cinematic', 'acoustic', 'ambient', 'piano_duet'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setKaraokeStyle(st)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] capitalize font-medium transition-all ${
                      karaokeStyle === st
                        ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40 font-semibold'
                        : 'text-gray-400 hover:text-gray-200 bg-white/[0.02]'
                    }`}
                  >
                    {st.replace('_', ' ')}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3">
                {/* Piano Melody Guide Volume & Toggle */}
                <div className="flex items-center gap-2 bg-[#08090d] px-2.5 py-1 rounded-xl border border-white/[0.06]">
                  <button
                    onClick={() => setMelodyEnabled(!isMelodyEnabled)}
                    className={`text-[11px] font-mono px-2 py-0.5 rounded transition-colors ${
                      isMelodyEnabled
                        ? 'bg-amber-400/20 text-amber-300 font-semibold'
                        : 'text-gray-500 hover:text-gray-300'
                    }`}
                    title="Toggle song melody guide audio"
                  >
                    Piano Melody: {isMelodyEnabled ? 'ON' : 'OFF'}
                  </button>
                  {isMelodyEnabled && (
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={melodyVolume}
                      onChange={(e) => setMelodyVolume(parseFloat(e.target.value))}
                      className="w-16 accent-amber-400 h-1 bg-gray-700 rounded cursor-pointer"
                      title={`Melody guide volume: ${Math.round(melodyVolume * 100)}%`}
                    />
                  )}
                </div>

                <button
                  onClick={toggleKaraokeLyrics}
                  className="text-[11px] text-amber-400 hover:text-amber-300 underline"
                >
                  {showKaraokeLyrics ? 'Hide Lyric Prompts' : 'Show Lyric Prompts'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Lyrics Sing-Along Ribbon */}
        {showKaraokeLyrics && (
          <div className="pt-1.5 border-t border-white/[0.04] text-center">
            {activeKaraokeLyric ? (
              <motion.div
                key={activeKaraokeLyric.text}
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-center gap-2"
              >
                <span className="text-[10px] uppercase font-mono tracking-widest text-amber-400/80 font-bold">
                  Karaoke Sing-Along:
                </span>
                <span className="text-sm sm:text-base font-serif font-bold text-white tracking-wide drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]">
                  &ldquo;{activeKaraokeLyric.text}&rdquo;
                </span>
              </motion.div>
            ) : hasLyrics ? (
              <div className="text-xs text-gray-500 italic">
                Get ready to sing... lyrics will appear on cue.
              </div>
            ) : (
              <div className="text-[11px] text-gray-400 flex items-center justify-center gap-2 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span>Synchronized {karaokeStyle.replace('_', ' ')} orchestral backing playing behind your keys</span>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
