import React, { useState, useMemo } from 'react';
import { useSongStore } from '../../store/useSongStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { Song, PlayMode } from '../../songs/types';
import { parseUserNotes } from '../../songs/clientSongExtractor';
import { 
  X, 
  Search, 
  Sparkles, 
  Music, 
  Play, 
  FileMusic, 
  Keyboard, 
  Mic, 
  CheckCircle2, 
  Loader2, 
  ArrowRight,
  Sliders,
  Compass
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CURATED_SUGGESTIONS = [
  { title: 'River Flows in You', artist: 'Yiruma', difficulty: 'Intermediate', genre: 'Popular' },
  { title: 'Interstellar Theme', artist: 'Hans Zimmer', difficulty: 'Intermediate', genre: 'Soundtrack' },
  { title: 'Golden Hour', artist: 'JVKE', difficulty: 'Intermediate', genre: 'Popular' },
  { title: 'Moonlight Sonata', artist: 'Ludwig van Beethoven', difficulty: 'Intermediate', genre: 'Classical' },
  { title: "He's a Pirate", artist: 'Pirates of the Caribbean', difficulty: 'Intermediate', genre: 'Soundtrack' },
  { title: 'Clair de Lune', artist: 'Claude Debussy', difficulty: 'Advanced', genre: 'Classical' },
  { title: 'Hallelujah', artist: 'Leonard Cohen', difficulty: 'Easy', genre: 'Popular' },
  { title: 'Fly Me to the Moon', artist: 'Frank Sinatra', difficulty: 'Intermediate', genre: 'Popular' },
  { title: 'Für Elise', artist: 'Ludwig van Beethoven', difficulty: 'Easy', genre: 'Classical' },
  { title: 'Canon in D', artist: 'Johann Pachelbel', difficulty: 'Beginner', genre: 'Classical' },
];

export const SongSearchExtractModal: React.FC = () => {
  const { 
    songs, 
    setSong, 
    extractAndLoadSong, 
    isExtracting, 
    startRecording,
    isRecording,
    restart 
  } = useSongStore();
  
  const { 
    searchModalOpen, 
    setSearchModalOpen, 
    setActiveTab 
  } = useSettingsStore();

  const [activeSubTab, setActiveSubTab] = useState<'search' | 'notes' | 'record'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'Beginner' | 'Easy' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [selectedGenre, setSelectedGenre] = useState('Popular');
  
  // Custom Notes state
  const [customTitle, setCustomTitle] = useState('');
  const [notesInput, setNotesInput] = useState('');
  const [extractStatus, setExtractStatus] = useState<string | null>(null);

  // Filter existing library songs
  const filteredExisting = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return songs.filter(s => 
      s.title.toLowerCase().includes(q) || 
      s.artist.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q)
    );
  }, [songs, searchQuery]);

  // Analyzed notes count for custom notation
  const parsedCustomNotes = useMemo(() => {
    if (!notesInput.trim()) return [];
    return parseUserNotes(notesInput);
  }, [notesInput]);

  if (!searchModalOpen) return null;

  const handleClose = () => {
    setSearchModalOpen(false);
    setExtractStatus(null);
  };

  const handlePlayExistingSong = (song: Song, mode: PlayMode = 'learn') => {
    setSong(song, mode);
    handleClose();
    setActiveTab('studio');
    setTimeout(() => restart(), 150);
  };

  const handleExtractSong = async (queryTitle: string) => {
    if (!queryTitle.trim() || isExtracting) return;
    
    setExtractStatus('Searching repertoire and harmonics...');
    try {
      setTimeout(() => setExtractStatus('Arranging full multi-section composition with dynamic progression...'), 350);
      setTimeout(() => setExtractStatus('Arranging note durations and visual piano roll...'), 700);

      const song = await extractAndLoadSong(queryTitle.trim(), {
        genre: selectedGenre,
        difficulty: selectedDifficulty,
        mode: 'learn',
      });

      setExtractStatus('Ready! Launching interactive concert stage...');
      setTimeout(() => {
        handleClose();
        setActiveTab('studio');
        restart();
      }, 450);
    } catch (err: any) {
      setExtractStatus(null);
      alert(`Could not extract song: ${err?.message || 'Please try another title'}`);
    }
  };

  const handleCreateFromNotes = async () => {
    if (parsedCustomNotes.length === 0 || isExtracting) return;
    const title = customTitle.trim() || 'Custom Piano Melody';
    
    setExtractStatus('Compiling custom notes into playable song...');
    try {
      await extractAndLoadSong(title, {
        genre: selectedGenre,
        difficulty: selectedDifficulty,
        notes_input: notesInput,
        mode: 'learn',
      });

      handleClose();
      setActiveTab('studio');
      setTimeout(() => restart(), 150);
    } catch (err: any) {
      setExtractStatus(null);
      alert(`Could not compile notes: ${err?.message}`);
    }
  };

  const handleStartLiveRecording = () => {
    handleClose();
    setActiveTab('studio');
    startRecording();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-3xl bg-[#0c0e14] border border-amber-400/25 rounded-3xl shadow-[0_0_60px_rgba(0,0,0,0.9),0_0_40px_rgba(212,175,55,0.12)] overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="relative px-6 py-5 border-b border-white/[0.07] bg-gradient-to-r from-amber-500/10 via-transparent to-transparent flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400/30 to-amber-600/10 border border-amber-400/30 flex items-center justify-center text-amber-300 shadow-[0_0_15px_rgba(212,175,55,0.2)]">
                <Compass className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h2 className="text-lg font-serif font-bold text-white tracking-wide flex items-center gap-2">
                  Song Discovery & Dynamic Arranger
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-amber-400/15 text-amber-300 border border-amber-400/25">
                    Live
                  </span>
                </h2>
                <p className="text-xs text-gray-400">
                  Search any song, extract playable melodies, or create custom notation to learn instantly.
                </p>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/[0.06] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Sub-Tabs: Search & Extract | Paste Custom Notes | Live Recording */}
          <div className="flex items-center gap-2 px-6 pt-4 border-b border-white/[0.05] bg-[#090b10]">
            <button
              onClick={() => setActiveSubTab('search')}
              className={`px-4 py-2.5 rounded-t-xl text-xs font-medium flex items-center gap-2 border-b-2 transition-all ${
                activeSubTab === 'search'
                  ? 'border-amber-400 text-amber-300 bg-white/[0.04]'
                  : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-white/[0.02]'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Search & Extract Any Song</span>
            </button>

            <button
              onClick={() => setActiveSubTab('notes')}
              className={`px-4 py-2.5 rounded-t-xl text-xs font-medium flex items-center gap-2 border-b-2 transition-all ${
                activeSubTab === 'notes'
                  ? 'border-amber-400 text-amber-300 bg-white/[0.04]'
                  : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-white/[0.02]'
              }`}
            >
              <Keyboard className="w-4 h-4" />
              <span>Paste Notes / Letters</span>
            </button>

            <button
              onClick={() => setActiveSubTab('record')}
              className={`px-4 py-2.5 rounded-t-xl text-xs font-medium flex items-center gap-2 border-b-2 transition-all ${
                activeSubTab === 'record'
                  ? 'border-amber-400 text-amber-300 bg-white/[0.04]'
                  : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-white/[0.02]'
              }`}
            >
              <Mic className="w-4 h-4" />
              <span>Record Live Piano</span>
            </button>
          </div>

          {/* Modal Body Container */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* TAB 1: SEARCH & EXTRACT */}
            {activeSubTab === 'search' && (
              <div className="space-y-6">
                {/* Search Input Bar */}
                <div className="relative">
                  <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Type ANY song title, artist, or movie theme (e.g. River Flows in You, Interstellar, Golden Hour)..."
                    className="w-full bg-[#121520] border border-amber-400/30 focus:border-amber-400 rounded-2xl pl-12 pr-28 py-3.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-400/20 transition-all shadow-inner"
                    autoFocus
                  />

                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-24 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 text-xs px-2 py-1"
                    >
                      Clear
                    </button>
                  )}

                  <button
                    onClick={() => handleExtractSong(searchQuery)}
                    disabled={!searchQuery.trim() || isExtracting}
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 disabled:opacity-40 text-black font-semibold text-xs transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(212,175,55,0.25)]"
                  >
                    {isExtracting ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5" />
                    )}
                    <span>Extract</span>
                  </button>
                </div>

                {/* Extraction In-Progress Banner */}
                {extractStatus && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3 text-amber-200"
                  >
                    <Loader2 className="w-5 h-5 animate-spin text-amber-400 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs font-medium">{extractStatus}</p>
                      <p className="text-[10px] text-amber-300/70 mt-0.5">
                        Arranging complete interactive melody with multi-octave range & dynamic progression...
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Dynamic Extract Action Card (Shown when query is typed) */}
                {searchQuery.trim() && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/15 via-[#131622] to-[#0d0f16] border border-amber-400/40 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-semibold">
                            Dynamic Arranger
                          </span>
                        </div>
                        <h4 className="text-sm font-semibold text-white">
                          Extract & Arrange &ldquo;{searchQuery}&rdquo;
                        </h4>
                        <p className="text-[11px] text-gray-400">
                          Generates full multi-section piano roll arrangements with unlimited duration and octave flexibility.
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleExtractSong(searchQuery)}
                      disabled={isExtracting}
                      className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)] whitespace-nowrap active:scale-95"
                    >
                      {isExtracting ? (
                        <Loader2 className="w-4 h-4 animate-spin text-black" />
                      ) : (
                        <Play className="w-4 h-4 fill-black" />
                      )}
                      <span>Learn &ldquo;{searchQuery}&rdquo; Now</span>
                    </button>
                  </motion.div>
                )}

                {/* Library Matches if any */}
                {filteredExisting.length > 0 && (
                  <div>
                    <h3 className="text-xs font-mono uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-2">
                      <Music className="w-3.5 h-3.5 text-amber-400" />
                      <span>Existing Matches in Studio Library ({filteredExisting.length})</span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {filteredExisting.slice(0, 6).map((song) => (
                        <div
                          key={song.id}
                          onClick={() => handlePlayExistingSong(song, 'learn')}
                          className="p-3.5 rounded-xl bg-[#12141e] border border-white/[0.07] hover:border-amber-400/40 hover:bg-[#161a26] cursor-pointer transition-all flex items-center justify-between group"
                        >
                          <div className="truncate mr-2">
                            <h4 className="text-xs font-semibold text-white group-hover:text-amber-200 transition-colors truncate">
                              {song.title}
                            </h4>
                            <p className="text-[11px] text-gray-400 truncate">
                              {song.artist} • <span className="font-mono text-amber-400/80">{song.difficulty}</span>
                            </p>
                          </div>
                          <div className="w-7 h-7 rounded-full bg-amber-400/20 text-amber-300 group-hover:bg-amber-400 group-hover:text-black flex items-center justify-center transition-all flex-shrink-0">
                            <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Curated Recommendations Repertoire */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-mono uppercase tracking-wider text-gray-400 flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Instant Repertoire Highlights</span>
                    </h3>
                    <span className="text-[11px] text-gray-500">1-click extract & learn</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {CURATED_SUGGESTIONS.map((item) => (
                      <button
                        key={item.title}
                        onClick={() => {
                          setSearchQuery(item.title);
                          handleExtractSong(item.title);
                        }}
                        disabled={isExtracting}
                        className="px-3 py-1.5 rounded-xl bg-[#12141f] hover:bg-amber-400/15 border border-white/[0.08] hover:border-amber-400/40 text-xs text-gray-300 hover:text-amber-200 transition-all flex items-center gap-2 group active:scale-95"
                      >
                        <span className="font-medium">{item.title}</span>
                        <span className="text-[10px] text-gray-500 font-mono group-hover:text-amber-400/70">
                          {item.artist}
                        </span>
                        <ArrowRight className="w-3 h-3 text-gray-500 group-hover:text-amber-300 transition-transform group-hover:translate-x-0.5" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: PASTE NOTES / CUSTOM COMPOSER */}
            {activeSubTab === 'notes' && (
              <div className="space-y-5">
                <div className="p-4 rounded-2xl bg-[#11131c] border border-white/[0.06] text-xs text-gray-300 space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 font-semibold">
                    <Keyboard className="w-4 h-4" />
                    <span>How to Paste Notes or Keyboard Letters</span>
                  </div>
                  <p className="text-gray-400 leading-relaxed text-[11px]">
                    You can paste standard note pitches (e.g. <span className="font-mono text-amber-300">C4 D4 E4 G4 A4 C5</span>) or computer keyboard keys (e.g. <span className="font-mono text-amber-300">A S D F G H J K</span>). 
                    Custom durations can be specified with colon notation (e.g. <span className="font-mono text-amber-300">C4:1 D4:0.5 E4:2</span>). All pieces support full octave shifting (-8va / +8va) and continuous loop practice.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase text-gray-400 mb-1.5">
                      Piece / Melody Title
                    </label>
                    <input
                      type="text"
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                      placeholder="My Custom Composition"
                      className="w-full bg-[#121520] border border-white/[0.08] focus:border-amber-400 rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-gray-400 mb-1.5">
                      Difficulty Level
                    </label>
                    <select
                      value={selectedDifficulty}
                      onChange={(e) => setSelectedDifficulty(e.target.value as any)}
                      className="w-full bg-[#121520] border border-white/[0.08] focus:border-amber-400 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Easy">Easy</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-mono uppercase text-gray-400">
                      Notes / Key Letters Sequence
                    </label>
                    <span className="text-[11px] font-mono text-amber-400">
                      {parsedCustomNotes.length} notes recognized
                    </span>
                  </div>
                  <textarea
                    rows={4}
                    value={notesInput}
                    onChange={(e) => setNotesInput(e.target.value)}
                    placeholder="Example: C4 D4 E4 F4 G4 A4 B4 C5 B4 A4 G4 F4 E4 D4 C4  OR  A S D F G H J K"
                    className="w-full bg-[#121520] border border-white/[0.08] focus:border-amber-400 rounded-2xl p-4 text-xs font-mono text-amber-200 placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-amber-400/20"
                  />
                </div>

                {/* Quick notation templates */}
                <div className="flex items-center gap-2 flex-wrap text-[11px]">
                  <span className="text-gray-500 font-mono">Quick templates:</span>
                  <button
                    onClick={() => {
                      setCustomTitle('C Major Arpeggio Study');
                      setNotesInput('C4 E4 G4 C5 E5 G5 E5 C5 G4 E4 C4');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-gray-300 hover:text-white"
                  >
                    Arpeggio Drill
                  </button>
                  <button
                    onClick={() => {
                      setCustomTitle('Ode to Joy Motif');
                      setNotesInput('E4 E4 F4 G4 G4 F4 E4 D4 C4 C4 D4 E4 E4 D4 D4');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-gray-300 hover:text-white"
                  >
                    Ode to Joy
                  </button>
                  <button
                    onClick={() => {
                      setCustomTitle('Keyboard Row Melody');
                      setNotesInput('A W S E D F T G Y H U J K');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-gray-300 hover:text-white"
                  >
                    Row Keys (A–K)
                  </button>
                </div>

                {/* Create & Launch Button */}
                <button
                  onClick={handleCreateFromNotes}
                  disabled={parsedCustomNotes.length === 0 || isExtracting}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 disabled:opacity-40 text-black font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(212,175,55,0.25)]"
                >
                  {isExtracting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4 fill-black" />
                  )}
                  <span>Compile into Lesson & Start Learning ({parsedCustomNotes.length} notes)</span>
                </button>
              </div>
            )}

            {/* TAB 3: RECORD LIVE PIANO */}
            {activeSubTab === 'record' && (
              <div className="space-y-6 text-center py-4">
                <div className="w-16 h-16 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 mx-auto shadow-[0_0_25px_rgba(239,68,68,0.2)]">
                  <Mic className="w-8 h-8" />
                </div>

                <div className="max-w-md mx-auto space-y-2">
                  <h3 className="text-base font-semibold text-white">
                    Live Concert Recording Studio
                  </h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Perform freely on the concert piano using your computer keyboard or MIDI controller. 
                    Every note, strike timing, and duration will be quantized and transcribed into an interactive lesson you can learn and practice anytime.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleStartLiveRecording}
                    className="px-6 py-3 rounded-2xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white font-semibold text-xs transition-all shadow-[0_0_25px_rgba(239,68,68,0.3)] flex items-center justify-center gap-2 mx-auto active:scale-95"
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
                    <span>Open Concert Stage & Start Recording</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer Telemetry */}
          <div className="px-6 py-3.5 border-t border-white/[0.05] bg-[#08090d] flex items-center justify-between text-[11px] text-gray-500">
            <span className="font-mono">Full Dynamic Repertoire • Unlimited Song Duration • Multi-Octave Range</span>
            <span className="text-gray-400">Zero latency client audio synthesis</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
