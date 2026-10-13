import { create } from 'zustand';
import { AudioLoadState } from '../audio/types';
import { audioEngine } from '../audio/AudioEngine';

interface AudioState {
  loadState: AudioLoadState;
  isSuspended: boolean;
  volume: number;
  isMuted: boolean;
  activeInstrumentName: string;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  resumeAudio: () => Promise<void>;
  initAudio: () => Promise<void>;
}

export const useAudioStore = create<AudioState>((set, get) => {
  // Listen to engine updates
  audioEngine.subscribe((engineState) => {
    set({
      loadState: engineState.loadState,
      isSuspended: engineState.isSuspended,
      volume: engineState.volume,
      isMuted: engineState.isMuted,
      activeInstrumentName: engineState.activeInstrumentName,
    });
  });

  return {
    loadState: audioEngine.getLoadState(),
    isSuspended: true,
    volume: 0.85,
    isMuted: false,
    activeInstrumentName: 'Concert Grand',

    setVolume: (vol: number) => {
      audioEngine.setVolume(vol);
      set({ volume: vol });
    },

    toggleMute: () => {
      const newMuted = !get().isMuted;
      audioEngine.setMute(newMuted);
      set({ isMuted: newMuted });
    },

    resumeAudio: async () => {
      await audioEngine.resumeAudioContext();
      set({ isSuspended: false });
    },

    initAudio: async () => {
      await audioEngine.initialize();
    },
  };
});
