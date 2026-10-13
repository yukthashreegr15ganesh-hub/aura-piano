import { create } from 'zustand';
import { pianoEngine } from '../engine/PianoEngine';
import { SessionResultData, NoteEvaluation } from '../engine/LearningEngine';
import { api } from '../api/client';

interface EngineStoreState {
  accuracy: number;
  correct: number;
  wrong: number;
  streak: number;
  bestStreak: number;
  totalNotes: number;
  currentSection: string;
  nextKeyHint: { note: string; computerKey: string; sectionName: string } | null;
  lastEvaluation: NoteEvaluation | null;
  sessionResult: SessionResultData | null;
  showResultModal: boolean;

  closeResultModal: () => void;
  resetStats: () => void;
}

export const useEngineStore = create<EngineStoreState>((set) => {
  // Connect learning engine listener
  pianoEngine.learningEngine.setListener({
    onScoreUpdate: (stats) => {
      set({
        accuracy: stats.accuracy,
        correct: stats.correct,
        wrong: stats.wrong,
        streak: stats.streak,
        bestStreak: stats.bestStreak,
        totalNotes: stats.totalNotes,
        currentSection: stats.currentSection,
      });
    },

    onNextKeyHint: (hint) => {
      set({ nextKeyHint: hint });
    },

    onNoteJudged: (evaluation) => {
      set({ lastEvaluation: evaluation });
    },

    onSessionComplete: (result) => {
      set({
        sessionResult: result,
        showResultModal: true,
      });

      // Automatically post to API or localStorage
      api.recordSession({
        song_id: result.songId,
        song_title: result.songTitle,
        mode: result.mode,
        speed: result.speed,
        accuracy: result.accuracy,
        correct: result.correct,
        wrong: result.wrong,
        timing_accuracy: result.timingAccuracy,
        best_streak: result.bestStreak,
        duration_seconds: result.durationSeconds,
        mistakes_by_note: result.mistakesByNote,
        mistakes_by_section: result.mistakesBySection,
        practice_recommendation: result.practiceRecommendation,
      }).catch((e) => console.warn('Session save notice:', e));
    },
  });

  return {
    accuracy: 100,
    correct: 0,
    wrong: 0,
    streak: 0,
    bestStreak: 0,
    totalNotes: 0,
    currentSection: 'Introduction',
    nextKeyHint: null,
    lastEvaluation: null,
    sessionResult: null,
    showResultModal: false,

    closeResultModal: () => set({ showResultModal: false }),
    resetStats: () => {
      pianoEngine.learningEngine.reset();
    },
  };
});
