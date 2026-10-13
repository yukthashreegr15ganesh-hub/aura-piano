import * as Tone from 'tone';

export type ClockState = 'stopped' | 'playing' | 'paused';

export class TimingClock {
  private state: ClockState = 'stopped';
  private bpm: number = 100;
  private speedMultiplier: number = 1.0;
  private startAudioTime: number = 0;
  private startBeatOffset: number = 0;
  private pausedBeat: number = 0;

  constructor(bpm = 100, speedMultiplier = 1.0) {
    this.bpm = bpm;
    this.speedMultiplier = speedMultiplier;
  }

  public setBpm(bpm: number) {
    if (this.state === 'playing') {
      const currentBeat = this.getCurrentBeat();
      this.bpm = bpm;
      this.startAudioTime = Tone.now();
      this.startBeatOffset = currentBeat;
    } else {
      this.bpm = bpm;
    }
  }

  public setSpeed(multiplier: number) {
    if (this.state === 'playing') {
      const currentBeat = this.getCurrentBeat();
      this.speedMultiplier = multiplier;
      this.startAudioTime = Tone.now();
      this.startBeatOffset = currentBeat;
    } else {
      this.speedMultiplier = multiplier;
    }
  }

  public start(startBeat = 0) {
    this.startAudioTime = Tone.now();
    this.startBeatOffset = startBeat;
    this.pausedBeat = startBeat;
    this.state = 'playing';
  }

  public pause() {
    if (this.state === 'playing') {
      this.pausedBeat = this.getCurrentBeat();
      this.state = 'paused';
    }
  }

  public resume() {
    if (this.state === 'paused') {
      this.startAudioTime = Tone.now();
      this.startBeatOffset = this.pausedBeat;
      this.state = 'playing';
    }
  }

  public stop() {
    this.state = 'stopped';
    this.pausedBeat = 0;
    this.startBeatOffset = 0;
  }

  public seek(beat: number) {
    const clampedBeat = Math.max(0, beat);
    if (this.state === 'playing') {
      this.startAudioTime = Tone.now();
      this.startBeatOffset = clampedBeat;
    } else {
      this.pausedBeat = clampedBeat;
    }
  }

  public getCurrentBeat(): number {
    if (this.state === 'playing') {
      const now = Tone.now();
      const elapsedSeconds = Math.max(0, now - this.startAudioTime);
      const beatsElapsed = elapsedSeconds * (this.bpm / 60) * this.speedMultiplier;
      return this.startBeatOffset + beatsElapsed;
    }
    return this.pausedBeat;
  }

  public beatsToSeconds(beats: number): number {
    return (beats / (this.bpm / 60)) / this.speedMultiplier;
  }

  public secondsToBeats(seconds: number): number {
    return seconds * (this.bpm / 60) * this.speedMultiplier;
  }

  public getState(): ClockState {
    return this.state;
  }

  public getSpeed(): number {
    return this.speedMultiplier;
  }

  public getBpm(): number {
    return this.bpm;
  }
}
