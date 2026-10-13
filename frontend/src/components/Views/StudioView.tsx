import React, { useState } from 'react';
import { HUD } from '../CinematicStudio/HUD';
import { PianoRollCanvas } from '../CinematicStudio/PianoRollCanvas';
import { PianoKeyboard } from '../CinematicStudio/PianoKeyboard';
import { LearnGuideOverlay } from '../CinematicStudio/LearnGuideOverlay';
import { KaraokeLyricsDisplay } from '../CinematicStudio/KaraokeLyricsDisplay';
import { useSongStore } from '../../store/useSongStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { Song } from '../../songs/types';
import { SongStartModal } from '../Modals/SongStartModal';
import { Play, Sparkles, ChevronRight, Gauge, Clock, Music, Search, Mic, Square } from 'lucide-react';
import { motion } from 'framer-motion';

export const StudioView: React.FC = () => {
  const { 
    currentSong, 
    songs, 
    mode, 
    isRecording, 
    recordedNotes, 
    stopAndSaveRecording, 
    cancelRecording 
  } = useSongStore();
  const { setActiveTab, setSearchModalOpen } = useSettingsStore();
  const [selectedSongModal, setSelectedSongModal] = useState<Song | null>(null);
  const [recordingPrompt, setRecordingPrompt] = useState(false);
  const [sessionTitle, setSessionTitle] = useState('');

  const featuredSongs = songs.slice(0, 4);

  // Generative geometric colors for music artwork
  const getArtworkAccent = (idx: number) => {
    const accents = [
      'from-amber-600/30 to-yellow-900/10 border-amber-500/20 text-amber-400',
      'from-blue-600/25 to-indigo-950/10 border-blue-500/20 text-blue-300',
      'from-emerald-600/25 to-teal-950/10 border-emerald-500/20 text-emerald-300',
      'from-purple-600/25 to-violet-950/10 border-purple-500/20 text-purple-300',
    ];
    return accents[idx % accents.length];
  };

  return (
    <div className="w-full min-h-[calc(100vh-65px)] flex flex-col justify-between items-center px-4 sm:px-8 py-5 relative z-10">
      <LearnGuideOverlay />

      {/* Hero Session Control & Telemetry Bar */}
      <HUD />

      {/* Real-time Karaoke Backing Track & Lyrics Ribbon */}
      <KaraokeLyricsDisplay />

      {/* The Hero Stage: Canvas Piano Roll + Grand Piano */}
      <div className="w-full max-w-6xl flex flex-col items-center justify-center my-1">
        {mode !== 'free_play' ? (
          <PianoRollCanvas />
        ) : (
          <div className="w-full max-w-6xl h-44 sm:h-52 flex flex-col items-center justify-center text-center p-6 bg-[#0c0e14]/50 rounded-t-2xl border-t border-x border-white/[0.04]">
            <div className="w-10 h-10 rounded-full bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 mb-2">
              <Music className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-serif font-bold text-gray-100">
              Free Play Studio
            </h2>
            <p className="text-xs text-gray-400 max-w-md mt-1 leading-relaxed">
              Unrestricted concert stage. Play freely using computer keyboard keys (<span className="font-mono text-amber-300">A–K, O–L</span>), mouse velocity dynamics, or a connected hardware MIDI controller.
            </p>
          </div>
        )}

        {/* Grand Piano Keyboard */}
        <PianoKeyboard />

        {/* Live Recording Control Strip (when active) */}
        {isRecording && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-6xl mt-3 p-4 rounded-2xl bg-gradient-to-r from-red-950/60 via-[#140b0f] to-[#0d0e14] border border-red-500/40 shadow-[0_0_30px_rgba(239,68,68,0.2)] flex flex-col sm:flex-row items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <span className="w-3.5 h-3.5 rounded-full bg-red-500 animate-ping flex-shrink-0" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono uppercase tracking-widest text-red-400 font-bold">
                    Recording Live Piano
                  </span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-red-500/20 text-red-300">
                    {recordedNotes.length} notes captured
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Play keys freely on your keyboard (A–K, O–L) or mouse. Struck notes are timed and recorded.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {recordingPrompt ? (
                <div className="flex items-center gap-2 w-full">
                  <input
                    type="text"
                    value={sessionTitle}
                    onChange={(e) => setSessionTitle(e.target.value)}
                    placeholder="Enter piece title..."
                    className="bg-black/60 border border-white/20 rounded-xl px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-400"
                    autoFocus
                  />
                  <button
                    onClick={async () => {
                      await stopAndSaveRecording(sessionTitle || 'My Live Piano Piece');
                      setRecordingPrompt(false);
                      setSessionTitle('');
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-red-500 hover:bg-red-400 text-white font-semibold text-xs transition-all whitespace-nowrap"
                  >
                    Save & Learn
                  </button>
                  <button
                    onClick={() => setRecordingPrompt(false)}
                    className="px-2 py-1.5 text-xs text-gray-400 hover:text-white"
                  >
                    Back
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => setRecordingPrompt(true)}
                    disabled={recordedNotes.length === 0}
                    className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-red-500 hover:bg-red-400 disabled:opacity-40 text-white font-semibold text-xs transition-all flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <Square className="w-3.5 h-3.5 fill-current" />
                    <span>Finish & Save Recording</span>
                  </button>
                  <button
                    onClick={cancelRecording}
                    className="px-3 py-2 text-xs text-gray-400 hover:text-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Dynamic Song Discovery & Extractor Hero Bar */}
      <div className="w-full max-w-6xl mt-4 mb-2 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-[#10131d] to-amber-500/5 border border-amber-400/20 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-300 flex-shrink-0 shadow-[0_0_15px_rgba(212,175,55,0.2)]">
            <Sparkles className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-semibold text-white flex items-center gap-2">
              <span>Extract & Learn ANY Song</span>
              <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/20">
                Dynamic
              </span>
            </h4>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Search any piece (e.g. River Flows in You, Interstellar, Golden Hour, Moonlight Sonata) or paste notes to learn complete songs.
            </p>
          </div>
        </div>
        <button
          onClick={() => setSearchModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-semibold text-xs transition-all shadow-[0_0_15px_rgba(212,175,55,0.25)] flex items-center gap-2 whitespace-nowrap active:scale-95 self-stretch sm:self-auto justify-center"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Search / Extract Songs</span>
        </button>
      </div>

      {/* Featured Repertoire Shelf */}
      <div className="w-full max-w-6xl mt-4 pt-4 border-t border-white/[0.06]">
        <div className="flex items-center justify-between mb-4 px-1">
          <div>
            <h3 className="text-sm font-semibold tracking-wide uppercase text-gray-200">
              Featured Repertoire
            </h3>
            <p className="text-xs text-gray-500">Curated pieces ready for learning and performance</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSearchModalOpen(true)}
              className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium transition-colors"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Discover More</span>
            </button>
            <button
              onClick={() => setActiveTab('songs')}
              className="text-xs text-gray-400 hover:text-gray-200 flex items-center gap-1 font-medium transition-colors"
            >
              <span>Full Library</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Music Album Artwork Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featuredSongs.map((s, idx) => {
            const isCurrent = currentSong?.id === s.id;
            const lastBeat = s.notes.length > 0 ? s.notes[s.notes.length - 1].startBeat + 2 : 16;
            const durationSec = Math.round(lastBeat / (s.bpm / 60));
            const mins = Math.floor(durationSec / 60);
            const secs = durationSec % 60;
            const durationStr = `${mins}:${secs < 10 ? '0' : ''}${secs}`;

            return (
              <motion.div
                key={s.id}
                whileHover={{ y: -3 }}
                transition={{ duration: 0.16 }}
                onClick={() => setSelectedSongModal(s)}
                className={`rounded-2xl border p-4 cursor-pointer transition-all relative overflow-hidden group bg-[#0f1118]/80 backdrop-blur-md ${
                  isCurrent
                    ? 'border-amber-400/50 shadow-[0_0_25px_rgba(212,175,55,0.18)]'
                    : 'border-white/[0.06] hover:border-amber-400/30 hover:bg-[#131620]'
                }`}
              >
                {/* Artwork Area */}
                <div className={`w-full h-28 rounded-xl mb-3 bg-gradient-to-br ${getArtworkAccent(idx)} p-3 flex flex-col justify-between relative overflow-hidden`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/60 text-white/90">
                      {s.difficulty}
                    </span>
                    <span className="text-[10px] font-mono text-white/70">
                      {s.bpm} BPM
                    </span>
                  </div>

                  {/* Play circle trigger */}
                  <div className="w-8 h-8 rounded-full bg-amber-400 text-black flex items-center justify-center self-end opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all shadow-md">
                    <Play className="w-4 h-4 fill-black ml-0.5" />
                  </div>
                </div>

                {/* Piece Meta */}
                <h4 className="text-sm font-semibold text-white truncate group-hover:text-amber-200 transition-colors">
                  {s.title}
                </h4>
                <p className="text-xs text-gray-400 truncate mt-0.5">
                  {s.artist}
                </p>

                <div className="flex items-center justify-between text-[11px] text-gray-500 mt-3 pt-2.5 border-t border-white/[0.05]">
                  <span>{durationStr} duration</span>
                  <span className="font-mono text-gray-400">{s.notes.length} notes</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Song Setup / Launch Modal */}
      <SongStartModal
        song={selectedSongModal}
        isOpen={!!selectedSongModal}
        onClose={() => setSelectedSongModal(null)}
      />
    </div>
  );
};
