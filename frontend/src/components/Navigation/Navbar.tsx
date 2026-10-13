import React from 'react';
import { useSettingsStore, ActiveNavTab } from '../../store/useSettingsStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useSongStore } from '../../store/useSongStore';
import { useAudioStore } from '../../store/useAudioStore';
import { Music, BookOpen, Sparkles, Target, Keyboard, Volume2, VolumeX, User, LogIn, CloudOff, Search } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { activeTab, setActiveTab, showKeyLabels, toggleKeyLabels, setKeyboardGuideOpen, setSearchModalOpen } = useSettingsStore();
  const { user, isAuthenticated, isOffline, openAuthModal } = useAuthStore();
  const { setMode } = useSongStore();
  const { volume, isMuted, setVolume, toggleMute } = useAudioStore();

  const handleNavClick = (tab: ActiveNavTab) => {
    setActiveTab(tab);
    if (tab === 'learn') {
      setMode('learn');
    } else if (tab === 'practice') {
      setMode('practice');
    }
  };

  return (
    <header className="w-full z-40 bg-[#08090d]/80 backdrop-blur-xl border-b border-white/[0.06] sticky top-0 px-6 lg:px-12 py-3 flex items-center justify-between transition-all">
      {/* Brand Logo */}
      <div 
        onClick={() => handleNavClick('studio')}
        className="flex items-center gap-3 cursor-pointer group"
      >
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400/90 to-yellow-600/90 flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.25)] group-hover:shadow-[0_0_25px_rgba(212,175,55,0.4)] transition-all">
          <span className="font-serif font-black text-black text-base tracking-tighter">A</span>
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold tracking-wider text-gray-100 group-hover:text-amber-200 transition-colors">
              AURA
            </span>
            <span className="text-[10px] tracking-[0.22em] text-amber-400/90 font-medium uppercase">
              PIANO
            </span>
          </div>
          <span className="text-[9px] text-gray-500 font-mono tracking-widest uppercase">Concert Studio</span>
        </div>
      </div>

      {/* Center Navigation Links */}
      <nav className="hidden md:flex items-center gap-1 bg-[#101218]/70 px-2 py-1 rounded-full border border-white/[0.05] shadow-inner">
        <button
          onClick={() => handleNavClick('studio')}
          className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
            activeTab === 'studio'
              ? 'bg-amber-400/15 text-amber-300 font-semibold shadow-sm'
              : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.03]'
          }`}
        >
          <Music className="w-3.5 h-3.5" />
          <span>Studio</span>
        </button>

        <button
          onClick={() => handleNavClick('songs')}
          className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
            activeTab === 'songs'
              ? 'bg-amber-400/15 text-amber-300 font-semibold shadow-sm'
              : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.03]'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Songs</span>
        </button>

        <button
          onClick={() => handleNavClick('learn')}
          className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
            activeTab === 'learn'
              ? 'bg-amber-400/15 text-amber-300 font-semibold shadow-sm'
              : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.03]'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Learn</span>
        </button>

        <button
          onClick={() => handleNavClick('practice')}
          className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
            activeTab === 'practice'
              ? 'bg-amber-400/15 text-amber-300 font-semibold shadow-sm'
              : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.03]'
          }`}
        >
          <Target className="w-3.5 h-3.5" />
          <span>Practice</span>
        </button>
      </nav>

      {/* Right Controls: Search, Keyboard Guide, Volume, Profile */}
      <div className="flex items-center gap-2.5">
        {/* Quick Search & Extract Button */}
        <button
          onClick={() => setSearchModalOpen(true)}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] hover:bg-amber-400/10 border border-white/[0.08] hover:border-amber-400/30 text-xs text-gray-300 hover:text-amber-200 transition-all shadow-inner group"
          title="Search or extract any song"
        >
          <Search className="w-3.5 h-3.5 text-gray-400 group-hover:text-amber-300 transition-colors" />
          <span className="hidden sm:inline text-[11px] font-medium">Search / Extract</span>
          <kbd className="hidden lg:inline text-[9px] font-mono px-1.5 py-0.5 rounded bg-black/50 text-amber-300/80 border border-amber-400/20">
            Any Song
          </kbd>
        </button>

        {/* Offline Badge */}
        {isOffline && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] font-medium">
            <CloudOff className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Offline Mode</span>
          </div>
        )}

        {/* Keyboard Map Trigger */}
        <button
          onClick={() => setKeyboardGuideOpen(true)}
          className="p-2 text-gray-400 hover:text-amber-300 rounded-lg hover:bg-white/[0.04] transition-colors flex items-center gap-1.5 text-xs"
          title="Keyboard key mapping"
        >
          <Keyboard className="w-4 h-4" />
          <span className="hidden sm:inline text-[11px]">Map</span>
        </button>

        {/* Key Labels Toggle */}
        <button
          onClick={toggleKeyLabels}
          className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all border ${
            showKeyLabels
              ? 'bg-amber-400/15 border-amber-400/30 text-amber-300'
              : 'bg-black/30 border-white/[0.06] text-gray-400 hover:text-gray-300'
          }`}
          title="Toggle note pitch and computer keyboard labels"
        >
          {showKeyLabels ? 'Keys: On' : 'Keys: Off'}
        </button>

        {/* Volume quick bar */}
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#12141a] border border-white/[0.06]">
          <button
            onClick={toggleMute}
            className="text-gray-400 hover:text-amber-300 transition-colors"
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-3.5 h-3.5 text-red-400" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-amber-400/80" />
            )}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-14 accent-amber-400 h-1 bg-gray-700 rounded-lg cursor-pointer"
          />
        </div>

        {/* Auth / Profile */}
        {isAuthenticated && user ? (
          <button
            onClick={() => setActiveTab('profile')}
            className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/25 text-amber-300 text-xs font-medium hover:bg-amber-400/20 transition-all"
          >
            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 text-black flex items-center justify-center text-[10px] font-bold">
              {user.username.slice(0, 1).toUpperCase()}
            </div>
            <span className="truncate max-w-[90px]">{user.username}</span>
          </button>
        ) : (
          <button
            onClick={() => openAuthModal('login')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-semibold text-xs transition-all shadow-[0_0_15px_rgba(212,175,55,0.25)] active:scale-95"
          >
            <LogIn className="w-3.5 h-3.5 fill-black" />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
};
