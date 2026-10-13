import * as Tone from 'tone';
import { Song, SongNote, ChordVoicing, LyricItem } from '../songs/types';
import { getSongAccompanimentChords } from './chordHarmonizer';
import { audioEngine } from './AudioEngine';

export type KaraokeStyle = 'cinematic' | 'acoustic' | 'ambient' | 'piano_duet';

export interface KaraokeState {
  isEnabled: boolean;
  volume: number;
  melodyVolume: number;
  isMelodyEnabled: boolean;
  style: KaraokeStyle;
  activeChord: ChordVoicing | null;
  activeLyric: LyricItem | null;
  currentSongTitle: string;
}

export type KaraokeListener = (state: KaraokeState) => void;

export class KaraokeEngine {
  private isEnabled = true;
  private volume = 0.65;
  private melodyVolume = 0.85;
  private isMelodyEnabled = true;
  private style: KaraokeStyle = 'cinematic';

  private masterGain: Tone.Gain;
  private chordFilter: Tone.Filter;
  private chordChorus: Tone.Chorus;
  private chordSynth: Tone.PolySynth;
  private bassSynth: Tone.MonoSynth;
  private rhythmSynth: Tone.NoiseSynth;

  private currentSong: Song | null = null;
  private chords: ChordVoicing[] = [];
  private lyrics: LyricItem[] = [];

  private lastScheduledBeat = -1;
  private lastScheduledNoteBeat = -1;
  private activeChord: ChordVoicing | null = null;
  private activeLyric: LyricItem | null = null;
  private listeners: Set<KaraokeListener> = new Set();

  constructor() {
    // Dedicated master gain connected to Tone Destination
    this.masterGain = new Tone.Gain(this.volume).toDestination();

    // Chorus effect for lush ensemble width
    this.chordChorus = new Tone.Chorus(2.2, 3.5, 0.35).connect(this.masterGain);
    this.chordChorus.start();

    // Warm lowpass filter to sit pleasantly behind the lead piano
    this.chordFilter = new Tone.Filter(1600, 'lowpass').connect(this.chordChorus);

    // Polyphonic chord synth
    this.chordSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle8' },
      envelope: {
        attack: 0.08,
        decay: 0.6,
        sustain: 0.65,
        release: 1.2
      }
    }).connect(this.chordFilter);

    // Deep bass synth
    this.bassSynth = new Tone.MonoSynth({
      oscillator: { type: 'triangle' },
      envelope: {
        attack: 0.04,
        decay: 0.5,
        sustain: 0.5,
        release: 0.9
      },
      filterEnvelope: {
        attack: 0.02,
        decay: 0.3,
        sustain: 0.2,
        release: 0.5,
        baseFrequency: 70,
        octaves: 2.2
      }
    }).connect(this.masterGain);

    // Subtle rhythmic shaker / hi-hat
    this.rhythmSynth = new Tone.NoiseSynth({
      noise: { type: 'pink' },
      envelope: {
        attack: 0.005,
        decay: 0.04,
        sustain: 0
      }
    }).connect(this.masterGain);

    this.applyStylePresets();
  }

  public subscribe(listener: KaraokeListener): () => void {
    this.listeners.add(listener);
    this.notify();
    return () => this.listeners.delete(listener);
  }

  private notify() {
    const state: KaraokeState = {
      isEnabled: this.isEnabled,
      volume: this.volume,
      melodyVolume: this.melodyVolume,
      isMelodyEnabled: this.isMelodyEnabled,
      style: this.style,
      activeChord: this.activeChord,
      activeLyric: this.activeLyric,
      currentSongTitle: this.currentSong ? this.currentSong.title : ''
    };
    this.listeners.forEach((l) => l(state));
  }

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    if (!enabled) {
      this.releaseAll();
    }
    this.notify();
  }

  public setMelodyEnabled(enabled: boolean) {
    this.isMelodyEnabled = enabled;
    this.notify();
  }

  public setMelodyVolume(volume: number) {
    this.melodyVolume = Math.max(0, Math.min(1, volume));
    this.notify();
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    this.masterGain.gain.rampTo(this.isEnabled ? this.volume : 0, 0.05);
    this.notify();
  }

  public setStyle(style: KaraokeStyle) {
    this.style = style;
    this.applyStylePresets();
    this.notify();
  }

  private applyStylePresets() {
    switch (this.style) {
      case 'cinematic':
        this.chordFilter.frequency.value = 1600;
        this.chordChorus.wet.value = 0.45;
        this.bassSynth.volume.value = -3;
        this.rhythmSynth.volume.value = -18;
        break;
      case 'acoustic':
        this.chordFilter.frequency.value = 2400;
        this.chordChorus.wet.value = 0.15;
        this.bassSynth.volume.value = -4;
        this.rhythmSynth.volume.value = -15;
        break;
      case 'ambient':
        this.chordFilter.frequency.value = 1100;
        this.chordChorus.wet.value = 0.7;
        this.bassSynth.volume.value = -2;
        this.rhythmSynth.volume.value = -28;
        break;
      case 'piano_duet':
        this.chordFilter.frequency.value = 3200;
        this.chordChorus.wet.value = 0.05;
        this.bassSynth.volume.value = -5;
        this.rhythmSynth.volume.value = -32;
        break;
    }
  }

  public setSong(song: Song) {
    this.releaseAll();
    this.currentSong = song;
    this.chords = getSongAccompanimentChords(song);
    this.lyrics = song.lyrics || [];
    this.lastScheduledBeat = -0.5;
    this.lastScheduledNoteBeat = -0.5;
    this.activeChord = null;
    this.activeLyric = null;
    this.notify();
  }

  public tick(currentBeat: number, speedMultiplier: number, bpm: number) {
    if (!this.isEnabled || !this.currentSong) return;

    // Lookahead window: schedule chords and melody up to 0.4 beats ahead
    const lookaheadBeats = 0.4;
    const windowEnd = currentBeat + lookaheadBeats;

    // 1. Schedule the song's actual melody notes on the concert grand piano
    if (this.isMelodyEnabled && this.currentSong.notes) {
      for (const note of this.currentSong.notes) {
        if (note.startBeat > this.lastScheduledNoteBeat && note.startBeat <= windowEnd) {
          this.scheduleSongNote(note, currentBeat, speedMultiplier, bpm);
        }
      }
    }
    this.lastScheduledNoteBeat = windowEnd;

    // 2. Schedule accompaniment chords
    if (this.chords.length > 0) {
      for (const chord of this.chords) {
        if (chord.beat > this.lastScheduledBeat && chord.beat <= windowEnd) {
          this.scheduleChord(chord, currentBeat, speedMultiplier, bpm);
        }
      }
    }

    // 3. Schedule subtle rhythm pulse on integer beats
    const beatInt = Math.floor(currentBeat);
    if (beatInt > this.lastScheduledBeat && beatInt <= windowEnd) {
      this.scheduleRhythmPulse(beatInt, currentBeat, speedMultiplier, bpm);
    }

    this.lastScheduledBeat = windowEnd;

    // Update active chord
    const active = this.chords.find(
      (c) => currentBeat >= c.beat && currentBeat < c.beat + c.durationBeats
    );
    let chordChanged = false;
    if (active !== this.activeChord) {
      this.activeChord = active || null;
      chordChanged = true;
    }

    // Update active lyric
    let lyricChanged = false;
    if (this.lyrics.length > 0) {
      const lyric = this.lyrics
        .filter((l) => l.beat <= currentBeat)
        .sort((a, b) => b.beat - a.beat)[0];
      if (lyric && lyric !== this.activeLyric) {
        this.activeLyric = lyric;
        lyricChanged = true;
      }
    }

    if (chordChanged || lyricChanged) {
      this.notify();
    }
  }

  private scheduleSongNote(
    note: SongNote,
    currentBeat: number,
    speedMultiplier: number,
    bpm: number
  ) {
    try {
      const timeNow = Tone.now();
      const secondsPerBeat = (60 / bpm) / Math.max(0.1, speedMultiplier);
      const delaySecs = Math.max(0, (note.startBeat - currentBeat) * secondsPerBeat);
      const audioStartTime = timeNow + delaySecs;
      const audioDuration = Math.max(0.12, (note.durationBeats * secondsPerBeat) * 0.95);
      const velocity = Math.max(0.1, Math.min(1.0, (note.velocity || 0.85) * this.melodyVolume));

      audioEngine.triggerAttackRelease(note.note, audioDuration, audioStartTime, velocity);
    } catch (e) {
      console.warn('Error scheduling song melody note:', e);
    }
  }

  private scheduleChord(
    chord: ChordVoicing,
    currentBeat: number,
    speedMultiplier: number,
    bpm: number
  ) {
    try {
      const timeNow = Tone.now();
      const secondsPerBeat = (60 / bpm) / Math.max(0.1, speedMultiplier);
      const delaySecs = Math.max(0, (chord.beat - currentBeat) * secondsPerBeat);
      const audioStartTime = timeNow + delaySecs;
      const audioDuration = Math.max(0.2, (chord.durationBeats * secondsPerBeat) * 0.95);

      // Trigger chord harmony voices
      if (chord.notes && chord.notes.length > 0) {
        this.chordSynth.triggerAttackRelease(
          chord.notes,
          audioDuration,
          audioStartTime,
          0.65
        );
      }

      // Trigger root bass
      if (chord.bass) {
        this.bassSynth.triggerAttackRelease(
          chord.bass,
          audioDuration,
          audioStartTime,
          0.75
        );
      }
    } catch (e) {
      console.warn('Karaoke scheduling error:', e);
    }
  }

  private scheduleRhythmPulse(
    beat: number,
    currentBeat: number,
    speedMultiplier: number,
    bpm: number
  ) {
    if (this.style === 'ambient') return; // ambient has no rhythm clicks
    try {
      const timeNow = Tone.now();
      const secondsPerBeat = (60 / bpm) / Math.max(0.1, speedMultiplier);
      const delaySecs = Math.max(0, (beat - currentBeat) * secondsPerBeat);
      const audioStartTime = timeNow + delaySecs;
      
      // Softer tick on offbeats, slightly firmer on measure start (beat % 4 === 0)
      const isDownbeat = beat % 4 === 0;
      const vel = isDownbeat ? 0.35 : 0.18;
      this.rhythmSynth.triggerAttackRelease(0.03, audioStartTime, vel);
    } catch {
      // Audio buffer safety
    }
  }

  public playStepChord(beat: number, bpm = 100) {
    if (!this.isEnabled || !this.currentSong || this.chords.length === 0) return;
    const chord = this.chords.find(
      (c) => beat >= c.beat && beat < c.beat + c.durationBeats
    ) || this.chords[0];

    if (!chord) return;
    this.activeChord = chord;

    // Update active lyric for this beat
    if (this.lyrics.length > 0) {
      const lyric = this.lyrics
        .filter((l) => l.beat <= beat)
        .sort((a, b) => b.beat - a.beat)[0];
      if (lyric) {
        this.activeLyric = lyric;
      }
    }

    this.notify();

    try {
      this.releaseAll();
      const timeNow = Tone.now();
      const secondsPerBeat = 60 / bpm;
      const audioDuration = Math.max(1.5, chord.durationBeats * secondsPerBeat);

      if (chord.notes && chord.notes.length > 0) {
        this.chordSynth.triggerAttackRelease(
          chord.notes,
          audioDuration,
          timeNow,
          0.65
        );
      }
      if (chord.bass) {
        this.bassSynth.triggerAttackRelease(
          chord.bass,
          audioDuration,
          timeNow,
          0.75
        );
      }

      // Also trigger the song's actual melody notes for this step
      if (this.isMelodyEnabled && this.currentSong && this.currentSong.notes) {
        const currentNotes = this.currentSong.notes.filter(
          (n) => Math.abs(n.startBeat - beat) < 0.35
        );
        for (const note of currentNotes) {
          const secondsPerBeat = 60 / bpm;
          const dur = Math.max(0.2, (note.durationBeats || 1.0) * secondsPerBeat);
          const vel = Math.max(0.1, Math.min(1.0, (note.velocity || 0.85) * this.melodyVolume));
          audioEngine.triggerAttackRelease(note.note, dur, undefined, vel);
        }
      }
    } catch {
      // Audio safety
    }
  }

  public seek(beat: number) {
    this.releaseAll();
    this.lastScheduledBeat = beat - 0.2;
    this.lastScheduledNoteBeat = beat - 0.2;
    this.activeChord = this.chords.find(
      (c) => beat >= c.beat && beat < c.beat + c.durationBeats
    ) || null;
    this.notify();
  }

  public pause() {
    this.releaseAll();
  }

  public stop() {
    this.releaseAll();
    this.lastScheduledBeat = -0.5;
    this.lastScheduledNoteBeat = -0.5;
    this.activeChord = null;
    this.activeLyric = null;
    this.notify();
  }

  public releaseAll() {
    try {
      this.chordSynth.releaseAll();
      this.bassSynth.triggerRelease();
    } catch {
      // Ignored
    }
  }

  public getActiveChord(): ChordVoicing | null {
    return this.activeChord;
  }

  public getActiveLyric(): LyricItem | null {
    return this.activeLyric;
  }
}

export const karaokeEngine = new KaraokeEngine();
