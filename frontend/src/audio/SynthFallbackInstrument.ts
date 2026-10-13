import * as Tone from 'tone';
import { Instrument } from './types';

export class SynthFallbackInstrument implements Instrument {
  id = 'soft-piano-synth';
  name = 'Harmonic Studio Synth (Fallback)';
  isReady = true;

  private synth: Tone.PolySynth;
  private volumeNode: Tone.Volume;
  private isMuted = false;
  private currentVolume = 0.85;
  private isSustainActive = false;
  private heldNotes: Set<string> = new Set();
  private sustainedNotes: Set<string> = new Set();

  constructor() {
    this.volumeNode = new Tone.Volume(Tone.gainToDb(this.currentVolume)).toDestination();

    // High quality warm polyphonic synth modeled after electric/acoustic piano tone
    this.synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: {
        type: 'triangle8',
      },
      envelope: {
        attack: 0.005,
        decay: 1.6,
        sustain: 0.15,
        release: 1.4,
      },
    }).connect(this.volumeNode);
  }

  noteOn(note: string, velocity = 0.8): void {
    this.heldNotes.add(note);
    this.sustainedNotes.delete(note);
    const clampedVelocity = Math.max(0.1, Math.min(1.0, velocity));
    try {
      this.synth.triggerAttack(note, Tone.now(), clampedVelocity);
    } catch (e) {
      console.warn(`Synth noteOn error for ${note}:`, e);
    }
  }

  noteOff(note: string): void {
    this.heldNotes.delete(note);
    if (this.isSustainActive) {
      this.sustainedNotes.add(note);
    } else {
      try {
        this.synth.triggerRelease([note], Tone.now());
      } catch (e) {
        console.warn(`Synth noteOff error for ${note}:`, e);
      }
    }
  }

  triggerAttackRelease(note: string, durationSeconds: number, time?: number, velocity = 0.8): void {
    const clampedVelocity = Math.max(0.1, Math.min(1.0, velocity));
    const schedTime = time !== undefined ? time : Tone.now();
    try {
      this.synth.triggerAttackRelease(note, Math.max(0.05, durationSeconds), schedTime, clampedVelocity);
    } catch (e) {
      console.warn(`SynthFallback triggerAttackRelease error for ${note}:`, e);
    }
  }

  setSustain(isSustained: boolean): void {
    this.isSustainActive = isSustained;
    if (!isSustained && this.sustainedNotes.size > 0) {
      const toRelease = Array.from(this.sustainedNotes).filter(n => !this.heldNotes.has(n));
      if (toRelease.length > 0) {
        try {
          this.synth.triggerRelease(toRelease, Tone.now());
        } catch (e) {
          console.warn('Synth release sustained notes error:', e);
        }
      }
      this.sustainedNotes.clear();
    }
  }

  releaseAll(): void {
    this.heldNotes.clear();
    this.sustainedNotes.clear();
    try {
      this.synth.releaseAll();
    } catch (e) {
      console.warn('Synth releaseAll error:', e);
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
    this.synth.dispose();
    this.volumeNode.dispose();
  }
}
