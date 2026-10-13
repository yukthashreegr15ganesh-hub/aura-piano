import React, { useEffect } from 'react';
import { useSettingsStore } from './store/useSettingsStore';
import { useAudioStore } from './store/useAudioStore';
import { useSongStore } from './store/useSongStore';
import { useAuthStore } from './store/useAuthStore';
import { pianoEngine } from './engine/PianoEngine';

import { ConcertHallBackdrop } from './components/CinematicStudio/ConcertHallBackdrop';
import { Navbar } from './components/Navigation/Navbar';
import { AudioSuspendedBanner } from './components/Navigation/AudioSuspendedBanner';

import { StudioView } from './components/Views/StudioView';
import { LibraryView } from './components/Views/LibraryView';
import { ProfileView } from './components/Views/ProfileView';
import { LeaderboardView } from './components/Views/LeaderboardView';
import { SettingsView } from './components/Views/SettingsView';

import { SessionResultModal } from './components/Modals/SessionResultModal';
import { MidiImportModal } from './components/Modals/MidiImportModal';
import { KeyboardGuideModal } from './components/Modals/KeyboardGuideModal';
import { InstrumentsModal } from './components/Modals/InstrumentsModal';
import { AuthModal } from './components/Modals/AuthModal';
import { SongSearchExtractModal } from './components/Modals/SongSearchExtractModal';

export const App: React.FC = () => {
  const { activeTab } = useSettingsStore();
  const { initAudio } = useAudioStore();
  const { fetchSongs } = useSongStore();
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    // 1. Initialize Piano & Input Engines
    pianoEngine.start();

    // 2. Load initial song so karaoke accompaniment matches current song immediately
    const initialSong = useSongStore.getState().currentSong;
    if (initialSong) {
      pianoEngine.loadSong(initialSong, useSongStore.getState().mode);
    }

    // 3. Load Samples & Sound Engine
    initAudio();

    // 3. Fetch songs from backend (with automatic bundled fallback)
    fetchSongs();

    // 4. Verify existing auth session
    checkAuth();

    // 5. Connect piano note press to live recording engine
    const unsubNotePress = pianoEngine.subscribeNotePress((note) => {
      const songStore = useSongStore.getState();
      if (songStore.isRecording) {
        songStore.recordNote(note, 1.0);
      }
    });

    return () => {
      unsubNotePress();
      pianoEngine.stop();
    };
  }, []);

  return (
    <div className="min-h-screen bg-studio-black text-gray-100 flex flex-col relative overflow-x-hidden selection:bg-gold-500/30 selection:text-gold-200">
      {/* Cinematic Concert Hall Backdrop */}
      <ConcertHallBackdrop />

      {/* Audio Context Suspended / Loading Notification Banner */}
      <AudioSuspendedBanner />

      {/* Top Navigation */}
      <Navbar />

      {/* Main View Router */}
      <main className="flex-1 w-full relative z-10">
        {activeTab === 'studio' && <StudioView />}
        {activeTab === 'songs' && <LibraryView />}
        {activeTab === 'learn' && <StudioView />}
        {activeTab === 'practice' && <StudioView />}
        {activeTab === 'profile' && <ProfileView />}
        {activeTab === 'leaderboard' && <LeaderboardView />}
        {activeTab === 'settings' && <SettingsView />}
      </main>

      {/* Global Modals */}
      <SongSearchExtractModal />
      <SessionResultModal />
      <MidiImportModal />
      <KeyboardGuideModal />
      <InstrumentsModal />
      <AuthModal />
    </div>
  );
};

export default App;
