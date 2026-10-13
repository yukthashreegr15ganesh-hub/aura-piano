import { create } from 'zustand';
import { Song, PlayMode, SongNote } from '../songs/types';
import { BUNDLED_SONGS } from '../songs/seedSongs';
import { pianoEngine } from '../engine/PianoEngine';
import { api } from '../api/client';
import { karaokeEngine, KaraokeStyle } from '../audio/KaraokeEngine';

interface SongStoreState {
  currentSong: Song | null;
  songs: Song[];
  mode: PlayMode;
  speed: number;
  playbackState: 'playing' | 'paused' | 'stopped';
  isLoadingSongs: boolean;
  isExtracting: boolean;
  selectedCategory: string;
  selectedDifficulty: string;
  searchQuery: string;

  isRecording: boolean;
  recordingStartTime: number | null;
  recordedNotes: SongNote[];

  // Continuous Learning & Range Flexibility
  isLooping: boolean;
  octaveShift: number; // -2 to +2
  toggleLooping: () => void;
  shiftOctave: (delta: number) => void;
  setOctaveShift: (shift: number) => void;

  // Real-time Karaoke Backing Track & Lyrics
  isKaraokeEnabled: boolean;
  karaokeVolume: number;
  melodyVolume: number;
  isMelodyEnabled: boolean;
  karaokeStyle: 'cinematic' | 'acoustic' | 'ambient' | 'piano_duet';
  showKaraokeLyrics: boolean;
  activeKaraokeChord: import('../songs/types').ChordVoicing | null;
  activeKaraokeLyric: import('../songs/types').LyricItem | null;
  toggleKaraoke: () => void;
  playKaraoke: () => void;
  setKaraokeVolume: (volume: number) => void;
  setMelodyVolume: (volume: number) => void;
  setMelodyEnabled: (enabled: boolean) => void;
  setKaraokeStyle: (style: 'cinematic' | 'acoustic' | 'ambient' | 'piano_duet') => void;
  toggleKaraokeLyrics: () => void;

  setSong: (song: Song, mode?: PlayMode) => void;
  setMode: (mode: PlayMode) => void;
  setSpeed: (speed: number) => void;
  play: () => void;
  pause: () => void;
  restart: () => void;
  seek: (beat: number) => void;
  fetchSongs: (category?: string, difficulty?: string, search?: string) => Promise<void>;
  setSelectedCategory: (category: string) => void;
  setSelectedDifficulty: (difficulty: string) => void;
  setSearchQuery: (query: string) => void;
  
  // Dynamic extraction & learning
  extractAndLoadSong: (
    query: string,
    options?: {
      genre?: string;
      difficulty?: 'Beginner' | 'Easy' | 'Intermediate' | 'Advanced';
      notes_input?: string;
      mode?: PlayMode;
    }
  ) => Promise<Song>;
  addCustomSong: (song: Song, mode?: PlayMode) => void;

  // Recording actions
  startRecording: () => void;
  recordNote: (note: string, durationBeats: number) => void;
  stopAndSaveRecording: (title?: string) => Promise<Song | null>;
  cancelRecording: () => void;
}

export const useSongStore = create<SongStoreState>((set, get) => ({
  currentSong: BUNDLED_SONGS[0], // Default to C Major Scale
  songs: BUNDLED_SONGS,
  mode: 'free_play',
  speed: 1.0,
  playbackState: 'stopped',
  isLoadingSongs: false,
  isExtracting: false,
  selectedCategory: 'All',
  selectedDifficulty: 'All',
  searchQuery: '',

  isRecording: false,
  recordingStartTime: null,
  recordedNotes: [],

  isLooping: false,
  octaveShift: 0,

  toggleLooping: () => {
    const next = !get().isLooping;
    pianoEngine.setLooping(next);
    set({ isLooping: next });
  },

  shiftOctave: (delta: number) => {
    const next = Math.max(-2, Math.min(2, get().octaveShift + delta));
    pianoEngine.setOctaveShift(next);
    set({ octaveShift: next });
  },

  setOctaveShift: (shift: number) => {
    const next = Math.max(-2, Math.min(2, shift));
    pianoEngine.setOctaveShift(next);
    set({ octaveShift: next });
  },

  // Karaoke backing track state
  isKaraokeEnabled: true,
  karaokeVolume: 0.65,
  melodyVolume: 0.85,
  isMelodyEnabled: true,
  karaokeStyle: 'cinematic',
  showKaraokeLyrics: true,
  activeKaraokeChord: null,
  activeKaraokeLyric: null,

  toggleKaraoke: () => {
    const next = !get().isKaraokeEnabled;
    pianoEngine.setKaraokeEnabled(next);
    set({ isKaraokeEnabled: next });
    // If enabling karaoke and song is not playing, start playing immediately
    if (next && get().playbackState !== 'playing') {
      get().play();
    }
  },

  playKaraoke: () => {
    pianoEngine.setKaraokeEnabled(true);
    set({ isKaraokeEnabled: true });
    get().play();
  },

  setKaraokeVolume: (volume: number) => {
    pianoEngine.setKaraokeVolume(volume);
    set({ karaokeVolume: volume });
  },

  setMelodyVolume: (volume: number) => {
    pianoEngine.setKaraokeMelodyVolume(volume);
    set({ melodyVolume: volume });
  },

  setMelodyEnabled: (enabled: boolean) => {
    pianoEngine.setKaraokeMelodyEnabled(enabled);
    set({ isMelodyEnabled: enabled });
  },

  setKaraokeStyle: (style: KaraokeStyle) => {
    pianoEngine.setKaraokeStyle(style);
    set({ karaokeStyle: style });
  },

  toggleKaraokeLyrics: () => {
    set({ showKaraokeLyrics: !get().showKaraokeLyrics });
  },

  setSong: (song: Song, mode: PlayMode = 'practice') => {
    const defaultSpeed = mode === 'practice' ? 0.75 : 1.0;
    pianoEngine.loadSong(song, mode);
    set({
      currentSong: song,
      mode,
      speed: defaultSpeed,
      playbackState: 'stopped',
    });
  },

  setMode: (mode: PlayMode) => {
    const current = get().currentSong;
    if (current) {
      pianoEngine.loadSong(current, mode);
    }
    set({ mode });
  },

  setSpeed: (speed: number) => {
    pianoEngine.setSpeed(speed);
    set({ speed });
  },

  play: () => {
    pianoEngine.play();
    set({ playbackState: 'playing' });
  },

  pause: () => {
    pianoEngine.pause();
    set({ playbackState: 'paused' });
  },

  restart: () => {
    pianoEngine.restart();
    set({ playbackState: 'playing' });
  },

  seek: (beat: number) => {
    pianoEngine.seek(beat);
  },

  setSelectedCategory: (category: string) => {
    set({ selectedCategory: category });
    get().fetchSongs(category, get().selectedDifficulty, get().searchQuery);
  },

  setSelectedDifficulty: (difficulty: string) => {
    set({ selectedDifficulty: difficulty });
    get().fetchSongs(get().selectedCategory, difficulty, get().searchQuery);
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
    get().fetchSongs(get().selectedCategory, get().selectedDifficulty, query);
  },

  fetchSongs: async (category?: string, difficulty?: string, search?: string) => {
    set({ isLoadingSongs: true });
    try {
      const list = await api.getSongs(category, difficulty, search);
      set({ songs: list.length > 0 ? list : BUNDLED_SONGS, isLoadingSongs: false });
    } catch (err) {
      set({ songs: BUNDLED_SONGS, isLoadingSongs: false });
    }
  },

  extractAndLoadSong: async (query: string, options = {}) => {
    set({ isExtracting: true });
    try {
      const targetMode: PlayMode = options.mode || 'learn';
      const extractedSong = await api.extractSong({
        query,
        genre: options.genre,
        difficulty: options.difficulty,
        notes_input: options.notes_input,
      });

      // Update songs list with the new song if not already present
      const currentList = get().songs;
      const exists = currentList.some(s => s.id === extractedSong.id);
      const updatedList = exists ? currentList : [extractedSong, ...currentList];

      // Load into engine immediately
      const defaultSpeed = targetMode === 'practice' ? 0.75 : 1.0;
      pianoEngine.loadSong(extractedSong, targetMode);

      set({
        songs: updatedList,
        currentSong: extractedSong,
        mode: targetMode,
        speed: defaultSpeed,
        playbackState: 'stopped',
        isExtracting: false,
      });

      return extractedSong;
    } catch (error) {
      set({ isExtracting: false });
      throw error;
    }
  },

  addCustomSong: (song: Song, mode: PlayMode = 'learn') => {
    const currentList = get().songs;
    const exists = currentList.some(s => s.id === song.id);
    const updatedList = exists ? currentList : [song, ...currentList];
    pianoEngine.loadSong(song, mode);
    set({
      songs: updatedList,
      currentSong: song,
      mode,
      playbackState: 'stopped',
    });
  },

  startRecording: () => {
    set({
      isRecording: true,
      recordingStartTime: Date.now(),
      recordedNotes: [],
    });
  },

  recordNote: (note: string, durationBeats: number = 1.0) => {
    const { isRecording, recordingStartTime, recordedNotes } = get();
    if (!isRecording || !recordingStartTime) return;

    // Calculate beat relative to start (assume 90 BPM: 1 beat = 666.6ms)
    const elapsedMs = Date.now() - recordingStartTime;
    const startBeat = Math.max(0, Math.round((elapsedMs / 666.6) * 2) / 2); // Quantize to eighth notes (0.5 beats)

    const newNote: SongNote = {
      note,
      startBeat,
      durationBeats: Math.max(0.5, Math.round(durationBeats * 2) / 2),
      velocity: 0.85,
    };

    set({ recordedNotes: [...recordedNotes, newNote] });
  },

  stopAndSaveRecording: async (title = 'My Recorded Session') => {
    const { recordedNotes } = get();
    set({ isRecording: false, recordingStartTime: null });

    if (recordedNotes.length === 0) return null;

    try {
      const customSong = await api.createCustomSong({
        title,
        artist: 'User Studio',
        difficulty: 'Intermediate',
        category: 'Practice',
        bpm: 90,
        notes: recordedNotes,
        sections: [{ name: 'Recorded Performance', startBeat: 0.0 }],
      });

      get().addCustomSong(customSong, 'learn');
      return customSong;
    } catch (e) {
      console.error('Failed to save recorded song:', e);
      return null;
    }
  },

  cancelRecording: () => {
    set({ isRecording: false, recordingStartTime: null, recordedNotes: [] });
  },
}));

// Synchronize store with real-time karaoke engine state
karaokeEngine.subscribe((state) => {
  useSongStore.setState({
    activeKaraokeChord: state.activeChord,
    activeKaraokeLyric: state.activeLyric,
    isKaraokeEnabled: state.isEnabled,
    karaokeVolume: state.volume,
    melodyVolume: state.melodyVolume,
    isMelodyEnabled: state.isMelodyEnabled,
    karaokeStyle: state.style
  });
});

