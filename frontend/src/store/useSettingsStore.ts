import { create } from 'zustand';

export type ActiveNavTab = 'studio' | 'songs' | 'learn' | 'practice' | 'profile' | 'leaderboard' | 'settings';

interface SettingsStoreState {
  activeTab: ActiveNavTab;
  showKeyLabels: boolean;
  reducedMotion: boolean;
  particleEffects: boolean;
  keyboardGuideOpen: boolean;
  instrumentsModalOpen: boolean;
  midiImportModalOpen: boolean;
  songStartModalOpen: boolean;
  searchModalOpen: boolean;

  setActiveTab: (tab: ActiveNavTab) => void;
  toggleKeyLabels: () => void;
  setShowKeyLabels: (show: boolean) => void;
  toggleReducedMotion: () => void;
  toggleParticleEffects: () => void;
  setKeyboardGuideOpen: (open: boolean) => void;
  setInstrumentsModalOpen: (open: boolean) => void;
  setMidiImportModalOpen: (open: boolean) => void;
  setSongStartModalOpen: (open: boolean) => void;
  setSearchModalOpen: (open: boolean) => void;
}

export const useSettingsStore = create<SettingsStoreState>((set) => {
  const prefersReduced = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  return {
    activeTab: 'studio',
    showKeyLabels: true,
    reducedMotion: prefersReduced,
    particleEffects: true,
    keyboardGuideOpen: false,
    instrumentsModalOpen: false,
    midiImportModalOpen: false,
    songStartModalOpen: false,
    searchModalOpen: false,

    setActiveTab: (tab: ActiveNavTab) => set({ activeTab: tab }),
    toggleKeyLabels: () => set((state) => ({ showKeyLabels: !state.showKeyLabels })),
    setShowKeyLabels: (show: boolean) => set({ showKeyLabels: show }),
    toggleReducedMotion: () => set((state) => ({ reducedMotion: !state.reducedMotion })),
    toggleParticleEffects: () => set((state) => ({ particleEffects: !state.particleEffects })),
    setKeyboardGuideOpen: (open: boolean) => set({ keyboardGuideOpen: open }),
    setInstrumentsModalOpen: (open: boolean) => set({ instrumentsModalOpen: open }),
    setMidiImportModalOpen: (open: boolean) => set({ midiImportModalOpen: open }),
    setSongStartModalOpen: (open: boolean) => set({ songStartModalOpen: open }),
    setSearchModalOpen: (open: boolean) => set({ searchModalOpen: open }),
  };
});
