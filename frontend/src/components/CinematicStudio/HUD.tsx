import React from 'react';
import { useSongStore } from '../../store/useSongStore';
import { useEngineStore } from '../../store/useEngineStore';
import { useAudioStore } from '../../store/useAudioStore';
import { PlayMode } from '../../songs/types';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Flame, Activity, Disc3, Sparkles, Target, Award, Music2, Repeat, Mic2 } from 'lucide-react';

const SPEED_OPTIONS = [0.5, 0.75, 1.0, 1.25];
const MODE_BUTTONS: { id: PlayMode; label: string; icon: any }[] = [
  { id: 'learn', label: 'Learn', icon: Sparkles },
  { id: 'practice', label: 'Practice', icon: Target },
  { id: 'performance', label: 'Performance', icon: Award },
  { id: 'free_play', label: 'Free Play', icon: Music2 },
];

export const HUD: React.FC = () => {
  const { 
    currentSong, 
    mode, 
    setMode, 
    speed, 
    playbackState, 
    play, 
    pause, 
    restart, 
    setSpeed,
    isLooping,
    toggleLooping,
    octaveShift,
    shiftOctave,
    isKaraokeEnabled,
    toggleKaraoke,
    activeKaraokeChord,
  } = useSongStore();
  const { accuracy, correct, wrong, streak, totalNotes, currentSection } = useEngineStore();
  const { volume, isMuted, setVolume, toggleMute } = useAudioStore();

  const isPlaying = playbackState === 'playing';
  const notesPlayed = correct + wrong;
  const progressPercent = totalNotes > 0 ? Math.min(100, Math.round((correct / totalNotes) * 100)) : 0;

  // Approximate duration calculation
  const lastBeat = currentSong?.notes.length ? currentSong.notes[currentSong.notes.length - 1].startBeat + 2 : 16;
  const bpm = currentSong?.bpm || 100;
  const totalSecs = Math.round(lastBeat / (bpm / 60));
  const currentSecs = Math.min(totalSecs, Math.round((progressPercent / 100) * totalSecs));
  
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="w-full max-w-6xl mx-auto mb-3 z-20">
      {/* Hero Session Card */}
      <div className="bg-[#101218]/90 backdrop-blur-xl border border-white/[0.07] rounded-2xl p-5 sm:p-6 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.85)] flex flex-col gap-4">
        
        {/* Top: Song Title & Mode Selector */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-amber-400 font-semibold">
                CURRENT SESSION
              </span>
              <span className="text-gray-600">•</span>
              <span className="text-xs text-gray-400 font-medium">{currentSection}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
              {currentSong ? currentSong.title : 'Free Play Concert Grand'}
            </h1>

            <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
              <span>{currentSong?.artist || 'Improvisation'}</span>
              <span>•</span>
              <span className="px-2 py-0.5 rounded-full bg-white/[0.05] text-amber-300 font-mono text-[10px]">
                {currentSong?.difficulty || 'Unrestricted'}
              </span>
              <span>•</span>
              <span className="font-mono text-gray-300">{bpm} BPM</span>
            </div>
          </div>

          {/* Mode Selector Tabs */}
          <div className="flex items-center gap-1.5 bg-[#0a0b0f] p-1.5 rounded-xl border border-white/[0.06] self-start lg:self-auto">
            {MODE_BUTTONS.map((m) => {
              const Icon = m.icon;
              const isActive = mode === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-black font-semibold shadow-[0_0_15px_rgba(245,158,11,0.35)]'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.03]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Middle: Performance Telemetry (Progress, Accuracy, Streak, Notes) */}
        {mode !== 'free_play' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-white/[0.06]">
            {/* Progress */}
            <div className="bg-[#0b0d12] p-3 rounded-xl border border-white/[0.04]">
              <span className="text-[10px] uppercase font-mono tracking-wider text-gray-500 block">
                Progress
              </span>
              <div className="flex items-baseline gap-1 mt-0.5 font-mono">
                <span className="text-base font-bold text-gray-200">{formatTime(currentSecs)}</span>
                <span className="text-xs text-gray-500">/ {formatTime(totalSecs)}</span>
              </div>
            </div>

            {/* Accuracy */}
            <div className="bg-[#0b0d12] p-3 rounded-xl border border-white/[0.04]">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-mono tracking-wider text-gray-500">
                  Accuracy
                </span>
                <Activity className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="text-base font-mono font-bold text-amber-300 mt-0.5">
                {accuracy}%
              </div>
            </div>

            {/* Streak */}
            <div className="bg-[#0b0d12] p-3 rounded-xl border border-white/[0.04]">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-mono tracking-wider text-gray-500">
                  Streak
                </span>
                <Flame className={`w-3.5 h-3.5 ${streak > 0 ? 'text-amber-400 fill-amber-400' : 'text-gray-600'}`} />
              </div>
              <div className="text-base font-mono font-bold text-amber-400 mt-0.5">
                {streak} <span className="text-xs text-gray-500 font-normal">notes</span>
              </div>
            </div>

            {/* Notes Struck */}
            <div className="bg-[#0b0d12] p-3 rounded-xl border border-white/[0.04]">
              <span className="text-[10px] uppercase font-mono tracking-wider text-gray-500 block">
                Notes
              </span>
              <div className="flex items-baseline gap-1 mt-0.5 font-mono">
                <span className="text-base font-bold text-emerald-400">{correct}</span>
                <span className="text-xs text-gray-500">/ {totalNotes}</span>
              </div>
            </div>
          </div>
        )}

        {/* Bottom: Transport Controls & Speed Multiplier */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/[0.06]">
          {/* Playback Transport Buttons */}
          <div className="flex items-center gap-2">
            {mode !== 'free_play' && (
              <>
                <button
                  onClick={restart}
                  title="Restart piece from beginning"
                  className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-gray-300 hover:text-white transition-all active:scale-95 border border-white/[0.04]"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                {/* Continuous Loop Practice Button */}
                <button
                  onClick={toggleLooping}
                  title={isLooping ? "Continuous Loop Practice: Enabled (unlimited learning without stopping)" : "Loop: Disabled"}
                  className={`px-3 py-2 rounded-xl text-xs font-medium transition-all active:scale-95 border flex items-center gap-1.5 ${
                    isLooping
                      ? 'bg-amber-400/20 text-amber-300 border-amber-400/50 shadow-sm font-semibold'
                      : 'bg-white/[0.04] text-gray-400 border-white/[0.06] hover:text-white'
                  }`}
                >
                  <Repeat className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{isLooping ? 'Loop: On' : 'Loop: Off'}</span>
                </button>

                {/* Karaoke Backing Track Button */}
                <button
                  onClick={toggleKaraoke}
                  title={isKaraokeEnabled ? "Karaoke Backing: Active (synthesizes accompaniment chords and bass behind piano)" : "Karaoke Backing: Off"}
                  className={`px-3 py-2 rounded-xl text-xs font-medium transition-all active:scale-95 border flex items-center gap-1.5 ${
                    isKaraokeEnabled
                      ? 'bg-amber-400/20 text-amber-300 border-amber-400/50 shadow-sm font-semibold'
                      : 'bg-white/[0.04] text-gray-400 border-white/[0.06] hover:text-white'
                  }`}
                >
                  <Mic2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{isKaraokeEnabled ? 'Karaoke: On' : 'Karaoke: Off'}</span>
                </button>

                {/* Live Chord Indicator in HUD */}
                {isKaraokeEnabled && activeKaraokeChord && (
                  <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-mono font-bold">
                    <span>{activeKaraokeChord.name}</span>
                  </div>
                )}

                <button
                  onClick={isPlaying ? pause : play}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-semibold text-xs transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] active:scale-95 flex items-center gap-2"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-4 h-4 fill-black" />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-black" />
                      <span>Start Session</span>
                    </>
                  )}
                </button>
              </>
            )}
          </div>

          {/* Octave Shift Control */}
          <div className="flex items-center gap-1 bg-[#0a0b0f] p-1 rounded-xl border border-white/[0.05]">
            <button
              onClick={() => shiftOctave(-1)}
              disabled={octaveShift <= -2}
              title="Shift 1 octave down"
              className="px-2 py-1 rounded text-xs text-gray-400 hover:text-white disabled:opacity-30 transition-colors"
            >
              -8va
            </button>
            <span className="text-[10px] font-mono text-amber-300 px-1 font-semibold">
              {octaveShift === 0 ? 'Oct 0' : octaveShift > 0 ? `+${octaveShift} Oct` : `${octaveShift} Oct`}
            </span>
            <button
              onClick={() => shiftOctave(1)}
              disabled={octaveShift >= 2}
              title="Shift 1 octave up"
              className="px-2 py-1 rounded text-xs text-gray-400 hover:text-white disabled:opacity-30 transition-colors"
            >
              +8va
            </button>
          </div>

          {/* Speed Multiplier (50% / 75% / 100% / 125%) */}
          {mode !== 'free_play' && (
            <div className="flex items-center gap-1.5 bg-[#0a0b0f] p-1 rounded-xl border border-white/[0.05]">
              <span className="text-[10px] uppercase font-mono text-gray-500 px-2 font-medium">Speed</span>
              {SPEED_OPTIONS.map((spd) => (
                <button
                  key={spd}
                  onClick={() => setSpeed(spd)}
                  className={`px-2.5 py-1 rounded-lg font-mono text-xs transition-all ${
                    speed === spd
                      ? 'bg-amber-400/20 text-amber-300 font-bold border border-amber-400/40 shadow-sm'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {Math.round(spd * 100)}%
                </button>
              ))}
            </div>
          )}

          {/* Volume quick bar */}
          <div className="flex items-center gap-2 bg-[#0a0b0f] px-3 py-1.5 rounded-xl border border-white/[0.05]">
            <button
              onClick={toggleMute}
              className="text-gray-400 hover:text-amber-300 transition-colors"
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-red-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-amber-400/80" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-20 accent-amber-400 h-1 bg-gray-700 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* Progress Bar Line */}
        {mode !== 'free_play' && (
          <div className="w-full h-1 bg-black/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}

      </div>
    </div>
  );
};
