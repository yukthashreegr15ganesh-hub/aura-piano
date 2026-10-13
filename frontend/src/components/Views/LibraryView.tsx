import React, { useState } from 'react';
import { useSongStore } from '../../store/useSongStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useAuthStore } from '../../store/useAuthStore';
import { SongStartModal } from '../Modals/SongStartModal';
import { Song } from '../../songs/types';
import { Search, PlusCircle, Play, Music, Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const CATEGORY_TABS = ['All Pieces', 'Classical', 'Popular', 'Practice', 'Traditional'];
const DIFFICULTY_FILTERS = ['All Levels', 'Beginner', 'Easy', 'Intermediate', 'Advanced'];

export const LibraryView: React.FC = () => {
  const { songs, extractAndLoadSong, isExtracting, restart } = useSongStore();
  const { setMidiImportModalOpen, setSearchModalOpen, setActiveTab } = useSettingsStore();
  const { isAuthenticated, openAuthModal } = useAuthStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCat, setSelectedCat] = useState('All Pieces');
  const [selectedDiff, setSelectedDiff] = useState('All Levels');
  const [activeModalSong, setActiveModalSong] = useState<Song | null>(null);

  // Filter songs
  const filteredSongs = songs.filter((s) => {
    const matchesSearch =
      s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.artist.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat =
      selectedCat === 'All Pieces' || s.category.toLowerCase() === selectedCat.toLowerCase();
    const matchesDiff =
      selectedDiff === 'All Levels' || s.difficulty.toLowerCase() === selectedDiff.toLowerCase();
    return matchesSearch && matchesCat && matchesDiff;
  });

  const handleImportClick = () => {
    if (!isAuthenticated) {
      openAuthModal('login');
    } else {
      setMidiImportModalOpen(true);
    }
  };

  const handleQuickExtract = async () => {
    if (!searchTerm.trim() || isExtracting) return;
    try {
      await extractAndLoadSong(searchTerm.trim(), { mode: 'learn' });
      setActiveTab('studio');
      setTimeout(() => restart(), 150);
    } catch (err: any) {
      alert(`Could not extract song: ${err?.message || 'Error occurred'}`);
    }
  };

  // Curated abstract musical gradients for artwork simulation
  const getArtworkTheme = (idx: number, category: string) => {
    const themes = [
      {
        bg: 'from-amber-700/30 via-yellow-900/20 to-[#0e1017]',
        accent: 'text-amber-400',
        glyph: '♪',
      },
      {
        bg: 'from-blue-700/25 via-indigo-950/20 to-[#0e1017]',
        accent: 'text-blue-300',
        glyph: '𝄞',
      },
      {
        bg: 'from-emerald-700/25 via-teal-950/20 to-[#0e1017]',
        accent: 'text-emerald-300',
        glyph: '𝄢',
      },
      {
        bg: 'from-purple-700/25 via-violet-950/20 to-[#0e1017]',
        accent: 'text-purple-300',
        glyph: '𝄡',
      },
    ];
    return themes[idx % themes.length];
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-6 lg:px-8 py-8 relative z-10">
      {/* Header with Title and Import Action */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-8">
        <div>
          <span className="text-xs font-mono uppercase tracking-[0.2em] text-amber-400 font-semibold">
            Repertoire & Method Books
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight mt-1">
            Music Library
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1 max-w-lg leading-relaxed">
            Curated classical pieces, technical scale drills, and timeless melodies engineered for visual interactive learning.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto flex-wrap">
          <button
            onClick={() => setSearchModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] hover:border-amber-400/30 text-white font-medium text-xs transition-all flex items-center gap-2 shadow-sm active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Extract Any Song</span>
          </button>

          <button
            onClick={handleImportClick}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-semibold text-xs transition-all shadow-[0_0_20px_rgba(212,175,55,0.25)] flex items-center gap-2 active:scale-95"
          >
            <PlusCircle className="w-4 h-4 fill-black text-amber-400" />
            <span>Import Custom MIDI</span>
          </button>
        </div>
      </div>

      {/* Search & Category Filter Navigation */}
      <div className="bg-[#101218]/90 backdrop-blur-xl border border-white/[0.07] rounded-2xl p-5 mb-8 shadow-xl flex flex-col gap-4">
        {/* Search Bar */}
        <div className="relative w-full">
          <Search className="w-4 h-4 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search piece title, composer, or artist (e.g. River Flows in You, Interstellar, Golden Hour)..."
            className="w-full bg-[#090b0f] border border-white/[0.07] rounded-xl pl-11 pr-24 py-2.5 text-xs sm:text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-400/60 transition-colors"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 text-xs px-2 py-1"
            >
              Clear
            </button>
          )}
        </div>

        {/* Dynamic Extract Callout if search is typed */}
        {searchTerm.trim() && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-gradient-to-r from-amber-500/15 via-[#141724] to-[#0d0f16] border border-amber-400/30"
          >
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span className="text-xs text-white">
                Want to learn <span className="font-semibold text-amber-300">&ldquo;{searchTerm}&rdquo;</span> on piano right now?
              </span>
            </div>
            <button
              onClick={handleQuickExtract}
              disabled={isExtracting}
              className="px-4 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-black text-xs font-semibold flex items-center justify-center gap-2 transition-all self-end sm:self-auto shadow-sm active:scale-95"
            >
              {isExtracting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-black" />
              )}
              <span>Extract & Learn &ldquo;{searchTerm}&rdquo;</span>
            </button>
          </motion.div>
        )}

        {/* Filter Pills */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-white/[0.05]">
          {/* Categories */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {CATEGORY_TABS.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                  selectedCat === cat
                    ? 'bg-amber-400/15 text-amber-300 font-semibold border border-amber-400/30 shadow-sm'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.03]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Difficulty Filter */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {DIFFICULTY_FILTERS.map((diff) => (
              <button
                key={diff}
                onClick={() => setSelectedDiff(diff)}
                className={`px-3 py-1 rounded-lg text-[11px] font-medium transition-all ${
                  selectedDiff === diff
                    ? 'bg-white/10 text-white font-semibold border border-white/20'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Album-Cover Music Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredSongs.map((song, idx) => {
          const lastBeat =
            song.notes.length > 0 ? song.notes[song.notes.length - 1].startBeat + 2 : 16;
          const durationSec = Math.round(lastBeat / (song.bpm / 60));
          const mins = Math.floor(durationSec / 60);
          const secs = durationSec % 60;
          const durationStr = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
          const theme = getArtworkTheme(idx, song.category);

          return (
            <motion.div
              key={song.id}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.16 }}
              onClick={() => setActiveModalSong(song)}
              className="rounded-2xl border border-white/[0.06] bg-[#0e1017]/90 backdrop-blur-md p-4 shadow-xl cursor-pointer relative overflow-hidden group hover:border-amber-400/40 hover:bg-[#12141e] transition-all"
            >
              {/* Album Artwork Cover with Generative Abstract Musical Element */}
              <div
                className={`w-full h-40 rounded-xl mb-3.5 bg-gradient-to-br ${theme.bg} p-3.5 flex flex-col justify-between relative overflow-hidden border border-white/[0.04]`}
              >
                {/* Subtle Background Watermark Glyph */}
                <span className="absolute -right-2 -bottom-6 text-7xl font-serif text-white/[0.04] pointer-events-none select-none">
                  {theme.glyph}
                </span>

                <div className="flex items-center justify-between z-10">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-black/60 text-amber-300 border border-amber-400/20">
                    {song.difficulty}
                  </span>
                  <span className="text-[10px] font-mono text-white/70">
                    {song.bpm} BPM
                  </span>
                </div>

                <div className="flex items-end justify-between z-10">
                  <span className="text-[11px] font-mono text-gray-400 bg-black/40 px-2 py-0.5 rounded">
                    {durationStr}
                  </span>

                  <div className="w-9 h-9 rounded-full bg-amber-400 text-black flex items-center justify-center shadow-lg opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all">
                    <Play className="w-4 h-4 fill-black ml-0.5" />
                  </div>
                </div>
              </div>

              {/* Title & Metadata */}
              <h3 className="text-sm font-semibold text-white group-hover:text-amber-200 transition-colors truncate">
                {song.title}
              </h3>
              <p className="text-xs text-gray-400 truncate mt-0.5">{song.artist}</p>

              {/* Details & Notes */}
              <div className="flex items-center justify-between text-[11px] text-gray-500 mt-3 pt-2.5 border-t border-white/[0.05]">
                <span className="capitalize">{song.category}</span>
                <span className="font-mono text-gray-400">{song.notes.length} notes</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {filteredSongs.length === 0 && (
        <div className="text-center py-16 px-6 bg-[#101218] rounded-2xl border border-white/[0.06] flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-amber-400/10 border border-amber-400/25 flex items-center justify-center text-amber-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="max-w-md">
            <h3 className="text-sm font-semibold text-white">No exact match in current library</h3>
            <p className="text-xs text-gray-400 mt-1">
              {searchTerm 
                ? `Don't worry! Aura's dynamic arranger can extract and arrange "${searchTerm}" into an interactive piano lesson right now.`
                : 'Discover thousands of songs or import custom MIDI files to learn on the concert piano.'}
            </p>
          </div>
          {searchTerm ? (
            <button
              onClick={handleQuickExtract}
              disabled={isExtracting}
              className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-semibold text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(212,175,55,0.25)] active:scale-95 transition-all"
            >
              {isExtracting ? (
                <Loader2 className="w-4 h-4 animate-spin text-black" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              <span>Extract & Learn &ldquo;{searchTerm}&rdquo; Now</span>
            </button>
          ) : (
            <button
              onClick={() => setSearchModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-semibold text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(212,175,55,0.25)] active:scale-95 transition-all"
            >
              <Search className="w-4 h-4" />
              <span>Open Song Discovery & Extractor</span>
            </button>
          )}
        </div>
      )}

      {/* Song Setup / Launch Modal */}
      <SongStartModal
        song={activeModalSong}
        isOpen={!!activeModalSong}
        onClose={() => setActiveModalSong(null)}
      />
    </div>
  );
};
