import * as Tone from 'tone';
import { Instrument, AudioLoadState } from './types';
import { SamplerInstrument } from './SamplerInstrument';
import { SynthFallbackInstrument } from './SynthFallbackInstrument';

type AudioStateListener = (state: {
  loadState: AudioLoadState;
  isSuspended: boolean;
  volume: number;
  isMuted: boolean;
  activeInstrumentName: string;
}) => void;

class AudioEngineManager {
  private activeInstrument: Instrument | null = null;
  private loadState: AudioLoadState = 'uninitialized';
  private isSuspended = true;
  private volume = 0.85;
  private isMuted = false;
  private listeners: Set<AudioStateListener> = new Set();
  private isInitializing = false;

  constructor() {
    this.checkContextState();
  }

  public subscribe(listener: AudioStateListener): () => void {
    this.listeners.add(listener);
    this.notify();
    return () => this.listeners.delete(listener);
  }

  private notify() {
    const info = {
      loadState: this.loadState,
      isSuspended: this.isSuspended,
      volume: this.volume,
      isMuted: this.isMuted,
      activeInstrumentName: this.activeInstrument ? this.activeInstrument.name : 'None',
    };
    this.listeners.forEach((cb) => cb(info));
  }

  public checkContextState(): boolean {
    const rawContext = Tone.getContext().rawContext;
    const suspended = rawContext.state !== 'running';
    if (this.isSuspended !== suspended) {
      this.isSuspended = suspended;
      this.notify();
    }
    return !this.isSuspended;
  }

  public async resumeAudioContext(): Promise<void> {
    try {
      if (Tone.context.state !== 'running') {
        await Tone.start();
      }
      this.checkContextState();
    } catch (e) {
      console.warn('Failed to start AudioContext:', e);
    }
  }

  public async initialize(): Promise<void> {
    if (this.isInitializing || this.loadState === 'ready') return;
    this.isInitializing = true;
    this.loadState = 'loading';
    this.notify();

    const sampler = new SamplerInstrument();
    try {
      await sampler.load();
      this.activeInstrument = sampler;
      this.loadState = 'ready';
      this.applySettings();
      this.notify();
    } catch (err) {
      console.warn('Salamander samples failed to load. Switching to soft piano fallback synth:', err);
      sampler.dispose();
      this.activeInstrument = new SynthFallbackInstrument();
      this.loadState = 'fallback_synth';
      this.applySettings();
      this.notify();
    } finally {
      this.isInitializing = false;
      this.checkContextState();
    }
  }

  private applySettings() {
    if (this.activeInstrument) {
      this.activeInstrument.setVolume(this.volume);
      this.activeInstrument.setMute(this.isMuted);
    }
  }

  public noteOn(note: string, velocity = 0.85): void {
    if (this.isSuspended) {
      this.resumeAudioContext();
    }
    if (this.activeInstrument) {
      this.activeInstrument.noteOn(note, velocity);
    }
  }

  public noteOff(note: string): void {
    if (this.activeInstrument) {
      this.activeInstrument.noteOff(note);
    }
  }

  public triggerAttackRelease(
    note: string,
    durationSeconds: number,
    time?: number,
    velocity = 0.85
  ): void {
    if (this.isSuspended) {
      this.resumeAudioContext();
    }
    if (this.activeInstrument && this.activeInstrument.triggerAttackRelease) {
      this.activeInstrument.triggerAttackRelease(note, durationSeconds, time, velocity);
    }
  }

  public setSustain(isSustained: boolean): void {
    if (this.activeInstrument) {
      this.activeInstrument.setSustain(isSustained);
    }
  }

  public releaseAll(): void {
    if (this.activeInstrument) {
      this.activeInstrument.releaseAll();
    }
  }

  public setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.activeInstrument) {
      this.activeInstrument.setVolume(this.volume);
    }
    this.notify();
  }

  public setMute(muted: boolean): void {
    this.isMuted = muted;
    if (this.activeInstrument) {
      this.activeInstrument.setMute(this.isMuted);
    }
    this.notify();
  }

  public getLoadState(): AudioLoadState {
    return this.loadState;
  }

  public getAudioContextTime(): number {
    return Tone.now();
  }

  public getInstrument(): Instrument | null {
    return this.activeInstrument;
  }
}

export const audioEngine = new AudioEngineManager();
