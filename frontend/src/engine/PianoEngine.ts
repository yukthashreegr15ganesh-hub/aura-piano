import { audioEngine } from '../audio/AudioEngine';
import { karaokeEngine, KaraokeStyle } from '../audio/KaraokeEngine';
import { InputManager } from '../input/InputManager';
import { TimingClock } from './TimingClock';
import { LearningEngine, SessionResultData, NoteEvaluation } from './LearningEngine';
import { Song, PlayMode } from '../songs/types';

export interface VisualKeyFeedback {
  note: string;
  isActive: boolean;
  isHitSuccess?: boolean;
  isHitMistake?: boolean;
  velocity?: number;
}

export type KeyFeedbackListener = (feedback: VisualKeyFeedback) => void;

export class PianoEngine {
  public inputManager: InputManager;
  public clock: TimingClock;
  public learningEngine: LearningEngine;

  private activePhysicalNotes: Map<string, number> = new Map(); // note -> velocity
  private keyFeedbackListeners: Set<KeyFeedbackListener> = new Set();
  private notePressListeners: Set<(note: string, velocity: number) => void> = new Set();
  private isMuted = false;
  private animFrameId: number | null = null;

  constructor() {
    this.inputManager = new InputManager();
    this.clock = new TimingClock(100, 1.0);
    this.learningEngine = new LearningEngine(this.clock);

    this.setupInputHandling();
  }

  public subscribeKeyFeedback(listener: KeyFeedbackListener): () => void {
    this.keyFeedbackListeners.add(listener);
    return () => this.keyFeedbackListeners.delete(listener);
  }

  public subscribeNotePress(listener: (note: string, velocity: number) => void): () => void {
    this.notePressListeners.add(listener);
    return () => this.notePressListeners.delete(listener);
  }

  private notifyKeyFeedback(feedback: VisualKeyFeedback) {
    this.keyFeedbackListeners.forEach((l) => l(feedback));
  }

  private setupInputHandling() {
    this.inputManager.setListener({
      onUserNoteOn: (note, velocity, _source) => {
        // Track key
        this.activePhysicalNotes.set(note, velocity);
        // Play audio
        audioEngine.noteOn(note, velocity);
        // Feed into learning engine
        const isCorrect = this.learningEngine.handleUserNotePress(note);

        // Notify recording listeners
        this.notePressListeners.forEach((l) => l(note, velocity));

        // Visual feedback
        this.notifyKeyFeedback({
          note,
          isActive: true,
          isHitSuccess: isCorrect,
          isHitMistake: !isCorrect,
          velocity,
        });
      },
      onUserNoteOff: (note, _source) => {
        this.activePhysicalNotes.delete(note);
        audioEngine.noteOff(note);

        this.notifyKeyFeedback({
          note,
          isActive: false,
        });
      },
      onSustainChange: (isSustained) => {
        audioEngine.setSustain(isSustained);
      },
      onAllNotesOff: () => {
        this.activePhysicalNotes.clear();
        audioEngine.releaseAll();
        // Clear all feedback
      },
    });
  }

  public start() {
    this.inputManager.start();
    this.startLoop();
  }

  public stop() {
    this.inputManager.stop();
    this.stopLoop();
    this.clock.stop();
    karaokeEngine.stop();
  }

  private startLoop() {
    if (this.animFrameId !== null) return;
    const loop = () => {
      if (this.clock.getState() === 'playing') {
        const currentBeat = this.clock.getCurrentBeat();
        this.learningEngine.tick(currentBeat);
        karaokeEngine.tick(
          currentBeat,
          this.clock.getSpeed(),
          this.clock.getBpm()
        );
      }
      this.animFrameId = requestAnimationFrame(loop);
    };
    this.animFrameId = requestAnimationFrame(loop);
  }

  private stopLoop() {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  public loadSong(song: Song, mode: PlayMode = 'practice') {
    this.clock.stop();
    this.clock.setBpm(song.bpm);
    const initialSpeed = mode === 'practice' ? 0.75 : 1.0;
    this.clock.setSpeed(initialSpeed);
    this.learningEngine.setSong(song, mode);
    karaokeEngine.setSong(song);
  }

  public setOctaveShift(shift: number) {
    this.inputManager.setOctaveShift(shift);
  }

  public setLooping(loop: boolean) {
    this.learningEngine.setLooping(loop);
  }

  public setKaraokeEnabled(enabled: boolean) {
    karaokeEngine.setEnabled(enabled);
  }

  public setKaraokeMelodyEnabled(enabled: boolean) {
    karaokeEngine.setMelodyEnabled(enabled);
  }

  public setKaraokeMelodyVolume(volume: number) {
    karaokeEngine.setMelodyVolume(volume);
  }

  public setKaraokeVolume(volume: number) {
    karaokeEngine.setVolume(volume);
  }

  public setKaraokeStyle(style: KaraokeStyle) {
    karaokeEngine.setStyle(style);
  }

  public play() {
    this.clock.resume();
  }

  public pause() {
    this.clock.pause();
    karaokeEngine.pause();
  }

  public restart() {
    this.clock.start(0);
    this.learningEngine.reset();
    karaokeEngine.seek(0);
  }

  public seek(beat: number) {
    this.clock.seek(beat);
    karaokeEngine.seek(beat);
  }

  public setSpeed(multiplier: number) {
    this.clock.setSpeed(multiplier);
  }

  public isKeyActive(note: string): boolean {
    return this.activePhysicalNotes.has(note);
  }

  public getActiveKeys(): Map<string, number> {
    return this.activePhysicalNotes;
  }
}

export const pianoEngine = new PianoEngine();
