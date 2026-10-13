export interface Section {
  name: string;
  startBeat: number;
}

export interface SongNote {
  note: string;
  startBeat: number;
  durationBeats: number;
  velocity?: number;
}

export interface ChordVoicing {
  beat: number;
  durationBeats: number;
  name: string; // e.g. "Am", "F", "C", "G"
  notes: string[]; // e.g. ["A2", "C3", "E3"]
  bass: string; // e.g. "A1"
}

export interface LyricItem {
  beat: number;
  text: string;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  difficulty: 'Beginner' | 'Easy' | 'Intermediate' | 'Advanced';
  category: 'Classical' | 'Popular' | 'Practice' | 'Traditional' | 'Soundtrack';
  bpm: number;
  timeSignature: string | number[];
  sections: Section[];
  notes: SongNote[];
  lyrics?: LyricItem[];
  chords?: ChordVoicing[];
  is_private?: boolean;
  user_id?: string;
}

export type PlayMode = 'free_play' | 'learn' | 'practice' | 'performance';

export interface PerformanceJudgement {
  rating: 'perfect' | 'good' | 'miss';
  offsetMs: number;
  note: string;
  beat: number;
}
