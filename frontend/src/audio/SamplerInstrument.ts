import * as Tone from 'tone';
import { Instrument } from './types';

// Sparse set of Salamander Grand Piano samples
const SALAMANDER_SAMPLE_MAP: Record<string, string> = {
  A0: 'A0.mp3',
  C1: 'C1.mp3',
  'D#1': 'Ds1.mp3',
  'F#1': 'Fs1.mp3',
  A1: 'A1.mp3',
  C2: 'C2.mp3',
  'D#2': 'Ds2.mp3',
  'F#2': 'Fs2.mp3',
  A2: 'A2.mp3',
  C3: 'C3.mp3',
  'D#3': 'Ds3.mp3',
  'F#3': 'Fs3.mp3',
  A3: 'A3.mp3',
  C4: 'C4.mp3',
  'D#4': 'Ds4.mp3',
  'F#4': 'Fs4.mp3',
  A4: 'A4.mp3',
  C5: 'C5.mp3',
  'D#5': 'Ds5.mp3',
  'F#5': 'Fs5.mp3',
  A5: 'A5.mp3',
  C6: 'C6.mp3',
  'D#6': 'Ds6.mp3',
  'F#6': 'Fs6.mp3',
  A6: 'A6.mp3',
  C7: 'C7.mp3',
  'D#7': 'Ds7.mp3',
  'F#7': 'Fs7.mp3',
  A7: 'A7.mp3',
  C8: 'C8.mp3',
};

const SALAMANDER_BASE_URL = 'https://cdn.jsdelivr.net/gh/Tonejs/audio@master/salamander/';

export class SamplerInstrument implements Instrument {
  id = 'acoustic-grand';
  name = 'Salamander Concert Grand Piano';
  isReady = false;

  private sampler: Tone.Sampler | null = null;
  private volumeNode: Tone.Volume;
  private isMuted = false;
  private currentVolume = 0.85;
  private isSustainActive = false;
  
  // Track currently pressed keys vs keys sustained by pedal
  private heldNotes: Set<string> = new Set();
  private sustainedNotes: Set<string> = new Set();

  constructor() {
    this.volumeNode = new Tone.Volume(Tone.gainToDb(this.currentVolume)).toDestination();
  }

  async load(onProgress?: (progress: number) => void): Promise<void> {
    return new Promise((resolve, reject) => {
      // Set timeout in case network blocks or fails
      const timeout = setTimeout(() => {
        if (!this.isReady) {
          reject(new Error('Sample loading timed out'));
        }
      }, 15000);

      try {
        this.sampler = new Tone.Sampler({
          urls: SALAMANDER_SAMPLE_MAP,
          baseUrl: SALAMANDER_BASE_URL,
          onload: () => {
            clearTimeout(timeout);
            this.isReady = true;
            resolve();
          },
          onerror: (err) => {
            clearTimeout(timeout);
            reject(err);
          },
        }).connect(this.volumeNode);
      } catch (err) {
        clearTimeout(timeout);
        reject(err);
      }
    });
  }

  noteOn(note: string, velocity = 0.8): void {
    if (!this.sampler || !this.isReady) return;
    this.heldNotes.add(note);
    // If note was sustained, remove it so it's fresh
    this.sustainedNotes.delete(note);
    
    const clampedVelocity = Math.max(0.1, Math.min(1.0, velocity));
    try {
      this.sampler.triggerAttack(note, Tone.now(), clampedVelocity);
    } catch (e) {
      console.warn(`Sampler noteOn error for ${note}:`, e);
    }
  }

  noteOff(note: string): void {
    if (!this.sampler || !this.isReady) return;
    this.heldNotes.delete(note);

    if (this.isSustainActive) {
      // Pedal is held down: keep note ringing
      this.sustainedNotes.add(note);
    } else {
      // Damp note naturally
      try {
        this.sampler.triggerRelease(note, Tone.now());
      } catch (e) {
        console.warn(`Sampler noteOff error for ${note}:`, e);
      }
    }
  }

  triggerAttackRelease(note: string, durationSeconds: number, time?: number, velocity = 0.8): void {
    if (!this.sampler || !this.isReady) return;
    const clampedVelocity = Math.max(0.1, Math.min(1.0, velocity));
    const schedTime = time !== undefined ? time : Tone.now();
    try {
      this.sampler.triggerAttackRelease(note, Math.max(0.05, durationSeconds), schedTime, clampedVelocity);
    } catch (e) {
      console.warn(`Sampler triggerAttackRelease error for ${note}:`, e);
    }
  }

  setSustain(isSustained: boolean): void {
    this.isSustainActive = isSustained;
    if (!isSustained && this.sustainedNotes.size > 0 && this.sampler && this.isReady) {
      // Release notes that were sustained and are no longer physically held
      const toRelease = Array.from(this.sustainedNotes).filter(n => !this.heldNotes.has(n));
      if (toRelease.length > 0) {
        try {
          this.sampler.triggerRelease(toRelease, Tone.now());
        } catch (e) {
          console.warn('Sampler release sustained notes error:', e);
        }
      }
      this.sustainedNotes.clear();
    }
  }

  releaseAll(): void {
    this.heldNotes.clear();
    this.sustainedNotes.clear();
    if (this.sampler && this.isReady) {
      try {
        this.sampler.releaseAll(Tone.now());
      } catch (e) {
        console.warn('Sampler releaseAll error:', e);
      }
    }
  }

  setVolume(volume: number): void {
    this.currentVolume = Math.max(0, Math.min(1, volume));
    if (!this.isMuted) {
      this.volumeNode.volume.value = Tone.gainToDb(Math.max(0.0001, this.currentVolume));
    }
  }

  setMute(isMuted: boolean): void {
    this.isMuted = isMuted;
    this.volumeNode.mute = isMuted;
  }

  dispose(): void {
    this.releaseAll();
    if (this.sampler) {
      this.sampler.dispose();
      this.sampler = null;
    }
    this.volumeNode.dispose();
  }
}
