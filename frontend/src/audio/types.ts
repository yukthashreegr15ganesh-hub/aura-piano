export interface Instrument {
  id: string;
  name: string;
  isReady: boolean;
  noteOn(note: string, velocity?: number): void;
  noteOff(note: string): void;
  triggerAttackRelease?(note: string, durationSeconds: number, time?: number, velocity?: number): void;
  releaseAll(): void;
  setVolume(volume: number): void; // 0.0 to 1.0
  setMute(isMuted: boolean): void;
  setSustain(isSustained: boolean): void;
  dispose(): void;
}

export type AudioLoadState = 'uninitialized' | 'loading' | 'ready' | 'fallback_synth' | 'error';
