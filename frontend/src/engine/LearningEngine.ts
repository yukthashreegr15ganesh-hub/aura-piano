import { Song, SongNote, PlayMode, Section } from '../songs/types';
import { TimingClock } from './TimingClock';
import { getComputerKeyForNote } from '../songs/keyMap';
import { karaokeEngine } from '../audio/KaraokeEngine';

export interface NoteEvaluation {
  noteIndex: number;
  note: string;
  expectedBeat: number;
  hitBeat: number;
  offsetMs: number;
  status: 'perfect' | 'good' | 'miss';
}

export interface SessionResultData {
  songId: string;
  songTitle: string;
  mode: PlayMode;
  speed: number;
  accuracy: number;
  correct: number;
  wrong: number;
  timingAccuracy: number;
  bestStreak: number;
  durationSeconds: number;
  mistakesByNote: Record<string, number>;
  mistakesBySection: Record<string, number>;
  practiceRecommendation: string;
}

export interface LearningEngineListener {
  onScoreUpdate: (stats: {
    accuracy: number;
    correct: number;
    wrong: number;
    streak: number;
    bestStreak: number;
    totalNotes: number;
    currentSection: string;
  }) => void;
  onNextKeyHint: (hint: { note: string; computerKey: string; sectionName: string } | null) => void;
  onNoteJudged: (evaluation: NoteEvaluation) => void;
  onSessionComplete: (result: SessionResultData) => void;
}

export class LearningEngine {
  private song: Song | null = null;
  private mode: PlayMode = 'free_play';
  private clock: TimingClock;
  private listener: LearningEngineListener | null = null;

  // State
  private currentNoteIndex = 0;
  private correctCount = 0;
  private wrongCount = 0;
  private currentStreak = 0;
  private bestStreak = 0;
  private timingOffsetsMs: number[] = [];
  private mistakesByNote: Record<string, number> = {};
  private mistakesBySection: Record<string, number> = {};
  private judgedNotes: Set<number> = new Set();
  private sessionStartTime = 0;
  private isCompleted = false;
  private isLooping = false;

  constructor(clock: TimingClock) {
    this.clock = clock;
  }

  public setLooping(loop: boolean) {
    this.isLooping = loop;
  }

  public setListener(listener: LearningEngineListener) {
    this.listener = listener;
  }

  public setSong(song: Song, mode: PlayMode = 'practice') {
    this.song = song;
    this.mode = mode;
    this.reset();
  }

  public setMode(mode: PlayMode) {
    this.mode = mode;
    this.reset();
  }

  public reset() {
    this.currentNoteIndex = 0;
    this.correctCount = 0;
    this.wrongCount = 0;
    this.currentStreak = 0;
    this.bestStreak = 0;
    this.timingOffsetsMs = [];
    this.mistakesByNote = {};
    this.mistakesBySection = {};
    this.judgedNotes.clear();
    this.sessionStartTime = Date.now();
    this.isCompleted = false;

    this.updateScoreUI();
    this.updateNextKeyHint();
  }

  public getCurrentSectionName(beat: number): string {
    if (!this.song || !this.song.sections || this.song.sections.length === 0) return 'Main Theme';
    let current = this.song.sections[0].name;
    for (const sec of this.song.sections) {
      if (beat >= sec.startBeat) {
        current = sec.name;
      }
    }
    return current;
  }

  private updateNextKeyHint() {
    if (!this.song || this.song.notes.length === 0) {
      this.listener?.onNextKeyHint(null);
      return;
    }

    if (this.currentNoteIndex < this.song.notes.length) {
      const nextNote = this.song.notes[this.currentNoteIndex];
      const computerKey = getComputerKeyForNote(nextNote.note);
      const sectionName = this.getCurrentSectionName(nextNote.startBeat);
      this.listener?.onNextKeyHint({
        note: nextNote.note,
        computerKey,
        sectionName,
      });
    } else {
      this.listener?.onNextKeyHint(null);
    }
  }

  private updateScoreUI() {
    const totalAttempted = this.correctCount + this.wrongCount;
    const accuracy = totalAttempted > 0 ? Math.round((this.correctCount / totalAttempted) * 100) : 100;
    const currentBeat = this.clock.getCurrentBeat();

    this.listener?.onScoreUpdate({
      accuracy,
      correct: this.correctCount,
      wrong: this.wrongCount,
      streak: this.currentStreak,
      bestStreak: this.bestStreak,
      totalNotes: this.song ? this.song.notes.length : 0,
      currentSection: this.getCurrentSectionName(currentBeat),
    });
  }

  /**
   * Called on every animation frame during playback to check for missed notes or song finish
   */
  public tick(currentBeat: number) {
    if (!this.song || this.isCompleted) return;

    const notes = this.song.notes;

    // Check for missed notes in Performance and Practice mode
    if (this.mode === 'performance' || this.mode === 'practice') {
      const gracePeriodBeats = 1.0; // Notes older than 1 beat without user hit are missed
      for (let i = 0; i < notes.length; i++) {
        if (!this.judgedNotes.has(i) && currentBeat > notes[i].startBeat + gracePeriodBeats) {
          this.judgedNotes.add(i);
          this.wrongCount++;
          this.currentStreak = 0;

          const n = notes[i].note;
          this.mistakesByNote[n] = (this.mistakesByNote[n] || 0) + 1;
          const section = this.getCurrentSectionName(notes[i].startBeat);
          this.mistakesBySection[section] = (this.mistakesBySection[section] || 0) + 1;

          this.listener?.onNoteJudged({
            noteIndex: i,
            note: n,
            expectedBeat: notes[i].startBeat,
            hitBeat: currentBeat,
            offsetMs: 300,
            status: 'miss',
          });

          if (i >= this.currentNoteIndex) {
            this.currentNoteIndex = i + 1;
            this.updateNextKeyHint();
          }
          this.updateScoreUI();
        }
      }
    }

    // Check for song completion
    if (notes.length > 0) {
      const lastNote = notes[notes.length - 1];
      const endBeat = lastNote.startBeat + lastNote.durationBeats + 1.5;
      if (currentBeat >= endBeat && (this.currentNoteIndex >= notes.length || this.judgedNotes.size >= notes.length)) {
        if (this.isLooping) {
          // Loop seamlessly for continuous practice without stopping
          this.currentNoteIndex = 0;
          this.judgedNotes.clear();
          this.clock.seek(0);
          this.updateNextKeyHint();
        } else {
          this.finishSession();
        }
      }
    }
  }

  /**
   * Called when user presses a note (via keyboard, mouse, or MIDI)
   */
  public handleUserNotePress(pressedNote: string): boolean {
    if (!this.song || this.isCompleted) return true;

    const notes = this.song.notes;
    const currentBeat = this.clock.getCurrentBeat();

    // Mode 1: Learn Mode - waits for the key
    if (this.mode === 'learn') {
      if (this.currentNoteIndex >= notes.length) {
        if (this.isLooping) {
          this.currentNoteIndex = 0;
          this.clock.seek(0);
          this.updateNextKeyHint();
        }
        return true;
      }

      const expected = notes[this.currentNoteIndex];
      const exactMatch = pressedNote.toUpperCase() === expected.note.toUpperCase();
      const pitchMatch = pressedNote.replace(/\d+/, '').toUpperCase() === expected.note.replace(/\d+/, '').toUpperCase();

      if (exactMatch || pitchMatch) {
        // Correct! Advance
        this.correctCount++;
        this.currentStreak++;
        if (this.currentStreak > this.bestStreak) this.bestStreak = this.currentStreak;

        this.listener?.onNoteJudged({
          noteIndex: this.currentNoteIndex,
          note: pressedNote,
          expectedBeat: expected.startBeat,
          hitBeat: currentBeat,
          offsetMs: 0,
          status: 'perfect',
        });

        this.currentNoteIndex++;
        this.updateNextKeyHint();
        this.updateScoreUI();

        // Advance song clock smoothly to the next note's position & play song backing chord
        if (this.currentNoteIndex < notes.length) {
          const nextBeat = notes[this.currentNoteIndex].startBeat;
          this.clock.seek(nextBeat);
          if (this.song) {
            karaokeEngine.playStepChord(nextBeat, this.song.bpm);
          }
        } else {
          if (this.isLooping) {
            this.currentNoteIndex = 0;
            this.clock.seek(0);
            this.updateNextKeyHint();
            if (this.song) {
              karaokeEngine.playStepChord(0, this.song.bpm);
            }
          } else {
            this.finishSession();
          }
        }
        return true;
      } else {
        // Wrong note pressed in learn mode
        this.wrongCount++;
        this.currentStreak = 0;
        this.mistakesByNote[expected.note] = (this.mistakesByNote[expected.note] || 0) + 1;
        const section = this.getCurrentSectionName(expected.startBeat);
        this.mistakesBySection[section] = (this.mistakesBySection[section] || 0) + 1;

        this.listener?.onNoteJudged({
          noteIndex: this.currentNoteIndex,
          note: pressedNote,
          expectedBeat: expected.startBeat,
          hitBeat: currentBeat,
          offsetMs: 0,
          status: 'miss',
        });

        this.updateScoreUI();
        return false;
      }
    }

    // Mode 2: Performance or Practice
    if (this.mode === 'performance' || this.mode === 'practice') {
      // Find candidate note near currentBeat
      const bpm = this.song.bpm;
      const speed = this.clock.getSpeed();
      let bestCandidateIdx = -1;
      let minOffsetSec = Infinity;

      // Look at upcoming or slightly past unjudged notes
      for (let i = 0; i < notes.length; i++) {
        if (this.judgedNotes.has(i)) continue;
        const noteObj = notes[i];
        if (noteObj.note === pressedNote) {
          const beatDiff = Math.abs(currentBeat - noteObj.startBeat);
          const timeDiffSec = (beatDiff / (bpm / 60)) / speed;
          // Valid window: up to 350ms offset
          if (timeDiffSec < 0.35 && timeDiffSec < minOffsetSec) {
            minOffsetSec = timeDiffSec;
            bestCandidateIdx = i;
          }
        }
      }

      if (bestCandidateIdx !== -1) {
        const offsetMs = Math.round(minOffsetSec * 1000);
        this.timingOffsetsMs.push(offsetMs);
        this.judgedNotes.add(bestCandidateIdx);

        let rating: 'perfect' | 'good' | 'miss' = 'miss';
        if (offsetMs <= 80) {
          rating = 'perfect';
          this.correctCount++;
          this.currentStreak++;
        } else if (offsetMs <= 180) {
          rating = 'good';
          this.correctCount++;
          this.currentStreak++;
        } else {
          rating = 'miss';
          this.wrongCount++;
          this.currentStreak = 0;
          this.mistakesByNote[pressedNote] = (this.mistakesByNote[pressedNote] || 0) + 1;
          const section = this.getCurrentSectionName(notes[bestCandidateIdx].startBeat);
          this.mistakesBySection[section] = (this.mistakesBySection[section] || 0) + 1;
        }

        if (this.currentStreak > this.bestStreak) this.bestStreak = this.currentStreak;

        this.listener?.onNoteJudged({
          noteIndex: bestCandidateIdx,
          note: pressedNote,
          expectedBeat: notes[bestCandidateIdx].startBeat,
          hitBeat: currentBeat,
          offsetMs,
          status: rating,
        });

        if (bestCandidateIdx >= this.currentNoteIndex) {
          this.currentNoteIndex = bestCandidateIdx + 1;
          this.updateNextKeyHint();
        }

        this.updateScoreUI();
        return true;
      } else {
        // Errant strike that doesn't correspond to any note in the window
        this.wrongCount++;
        this.currentStreak = 0;
        const section = this.getCurrentSectionName(currentBeat);
        this.mistakesBySection[section] = (this.mistakesBySection[section] || 0) + 1;
        this.updateScoreUI();
        return false;
      }
    }

    return true;
  }

  public finishSession() {
    if (this.isCompleted) return;
    this.isCompleted = true;
    this.clock.pause();

    const total = this.correctCount + this.wrongCount;
    const accuracy = total > 0 ? Math.round((this.correctCount / total) * 100) : 100;
    
    // Average timing accuracy
    let timingAccuracy = 95;
    if (this.timingOffsetsMs.length > 0) {
      const avgOffset = this.timingOffsetsMs.reduce((a, b) => a + b, 0) / this.timingOffsetsMs.length;
      timingAccuracy = Math.max(0, Math.min(100, Math.round(100 - avgOffset * 0.4)));
    }

    const durationSeconds = Math.max(1, Math.round((Date.now() - this.sessionStartTime) / 1000));
    const recommendation = this.generateRecommendation();

    const result: SessionResultData = {
      songId: this.song ? this.song.id : 'unknown',
      songTitle: this.song ? this.song.title : 'Free Play',
      mode: this.mode,
      speed: this.clock.getSpeed(),
      accuracy,
      correct: this.correctCount,
      wrong: this.wrongCount,
      timingAccuracy,
      bestStreak: this.bestStreak,
      durationSeconds,
      mistakesByNote: { ...this.mistakesByNote },
      mistakesBySection: { ...this.mistakesBySection },
      practiceRecommendation: recommendation,
    };

    this.listener?.onSessionComplete(result);
  }

  private generateRecommendation(): string {
    const noteEntries = Object.entries(this.mistakesByNote);
    const sectionEntries = Object.entries(this.mistakesBySection);

    if (noteEntries.length === 0 && sectionEntries.length === 0) {
      return "Flawless performance! You played with exceptional precision and rhythm. Try stepping up to Performance Mode or increasing speed to 125%.";
    }

    noteEntries.sort((a, b) => b[1] - a[1]);
    sectionEntries.sort((a, b) => b[1] - a[1]);

    const worstNote = noteEntries.length > 0 ? noteEntries[0][0] : null;
    const worstNoteCount = noteEntries.length > 0 ? noteEntries[0][1] : 0;
    const worstSection = sectionEntries.length > 0 ? sectionEntries[0][0] : null;
    const worstSectionCount = sectionEntries.length > 0 ? sectionEntries[0][1] : 0;

    let rec = "";
    if (worstSection && worstSectionCount > 1) {
      rec += `You encountered the most friction in '${worstSection}' (${worstSectionCount} slip-ups). `;
    }
    if (worstNote && worstNoteCount > 1) {
      rec += `Specifically, '${worstNote}' was missed ${worstNoteCount} times. `;
    }

    if (this.clock.getSpeed() > 0.75) {
      rec += "Recommendation: Practice this section at 75% speed in Learn mode to build muscle memory before speeding back up.";
    } else {
      rec += "Recommendation: Use Learn mode with Key Labels enabled to solidify your finger positioning.";
    }

    return rec;
  }
}
