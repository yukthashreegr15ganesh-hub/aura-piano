import { Song, SongNote, Section } from './types';
import { BUNDLED_SONGS } from './seedSongs';
import { PLAYABLE_NOTES, getMidiNumber, getNoteForComputerKey } from './keyMap';

const MIN_MIDI = 60; // C4
const MAX_MIDI = 88; // E6

function midiToNote(midi: number): string {
  const clamped = Math.max(MIN_MIDI, Math.min(MAX_MIDI, midi));
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const octave = Math.floor(clamped / 12) - 1;
  const pitch = noteNames[clamped % 12];
  return `${pitch}${octave}`;
}

function clampOrTransposeMidi(midi: number): number {
  let m = midi;
  while (m < MIN_MIDI) m += 12;
  while (m > MAX_MIDI) m -= 12;
  return m;
}

/**
 * Parses user-provided notes string like:
 * "C4 D4 E4 G4" or "C4:1.0 D4:0.5 E4:1.5" or "A S D F G H J K"
 */
export function parseUserNotes(text: string): SongNote[] {
  const tokens = text.trim().split(/[\s,;-]+/);
  const notes: SongNote[] = [];
  let currentBeat = 0.0;

  for (const token of tokens) {
    if (!token) continue;

    let noteStr = '';
    let duration = 1.0;

    // Check if token has duration, e.g. "C4:0.5" or "G4=2"
    if (token.includes(':') || token.includes('=')) {
      const parts = token.split(/[:=]/);
      noteStr = parts[0].toUpperCase();
      const parsedDur = parseFloat(parts[1]);
      if (!isNaN(parsedDur) && parsedDur > 0) {
        duration = Math.min(4.0, Math.max(0.25, parsedDur));
      }
    } else {
      noteStr = token.toUpperCase();
    }

    // Check if it's already a pitch like C4, D#5, etc.
    const pitchMatch = noteStr.match(/^([A-G][#b]?)([0-8])$/i);
    if (pitchMatch) {
      let pitch = pitchMatch[1].toUpperCase();
      if (pitch === 'DB') pitch = 'C#';
      if (pitch === 'EB') pitch = 'D#';
      if (pitch === 'GB') pitch = 'F#';
      if (pitch === 'AB') pitch = 'G#';
      if (pitch === 'BB') pitch = 'A#';
      const octave = parseInt(pitchMatch[2], 10);
      const midi = (octave + 1) * 12 + ({
        'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4,
        'F': 5, 'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11
      }[pitch] || 0);

      const targetMidi = clampOrTransposeMidi(midi);
      notes.push({
        note: midiToNote(targetMidi),
        startBeat: currentBeat,
        durationBeats: duration,
        velocity: 0.85
      });
      currentBeat += duration;
      continue;
    }

    // Check if it's a computer keyboard key (A, S, D, F, etc.)
    const mappedNote = getNoteForComputerKey(token.toLowerCase());
    if (mappedNote) {
      notes.push({
        note: mappedNote,
        startBeat: currentBeat,
        durationBeats: duration,
        velocity: 0.85
      });
      currentBeat += duration;
      continue;
    }

    // Check if it's just letter without octave (e.g. "C", "D", "E")
    if (/^[A-G][#b]?$/i.test(noteStr)) {
      let pitch = noteStr.toUpperCase();
      if (pitch === 'DB') pitch = 'C#';
      if (pitch === 'EB') pitch = 'D#';
      if (pitch === 'GB') pitch = 'F#';
      if (pitch === 'AB') pitch = 'G#';
      if (pitch === 'BB') pitch = 'A#';
      const targetNote = `${pitch}4`;
      notes.push({
        note: targetNote,
        startBeat: currentBeat,
        durationBeats: duration,
        velocity: 0.85
      });
      currentBeat += duration;
    }
  }

  return notes;
}

/**
 * Deterministic hash to generate algorithmic arrangement for any song query
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function generateAlgorithmicSong(
  title: string,
  artist: string = 'Dynamic Arrangement',
  genre: string = 'Popular',
  difficulty: 'Beginner' | 'Easy' | 'Intermediate' | 'Advanced' = 'Intermediate'
): Song {
  const seed = hashString(title.toLowerCase().trim());
  const scales = [
    // C Major
    [60, 62, 64, 65, 67, 69, 71, 72, 74, 76, 77, 79],
    // G Major
    [62, 64, 66, 67, 69, 71, 74, 76, 78, 79, 81],
    // A Minor
    [60, 62, 64, 65, 67, 69, 71, 72, 74, 76, 77],
    // D Major / Celtic
    [62, 64, 66, 67, 69, 71, 73, 74, 76, 78, 81]
  ];
  const scale = scales[seed % scales.length];

  const durations = [1.0, 0.5, 0.5, 1.0, 1.5, 0.5, 2.0, 1.0];
  const bpms = [76, 84, 92, 100, 112, 120];
  const bpm = bpms[seed % bpms.length];

  const sections: Section[] = [
    { name: 'Intro Passage', startBeat: 0.0 },
    { name: 'Verse 1 Motif', startBeat: 16.0 },
    { name: 'Building Pre-Chorus', startBeat: 36.0 },
    { name: 'Main Chorus Hook', startBeat: 52.0 },
    { name: 'Bridge & Modulation', startBeat: 72.0 },
    { name: 'Grand Climax & Outro', startBeat: 88.0 }
  ];

  const notes: SongNote[] = [];
  let beat = 0.0;
  let idx = seed % scale.length;
  const fullSongTargetBeats = 96.0; // Complete full piece (24 measures in 4/4)

  for (let step = 0; step < 120; step++) {
    const stepHash = hashString(`${title}-${step}`);
    const dur = durations[stepHash % durations.length];
    
    // Melodic contour
    const stepDiff = ((stepHash % 7) - 3);
    idx = Math.max(0, Math.min(scale.length - 1, idx + stepDiff));
    const midi = scale[idx];

    notes.push({
      note: midiToNote(clampOrTransposeMidi(midi)),
      startBeat: Math.round(beat * 100) / 100,
      durationBeats: dur,
      velocity: 0.8 + ((stepHash % 20) / 100)
    });

    beat += dur;
    if (beat >= fullSongTargetBeats) break;
  }

  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  return {
    id: `dyn-${slug}-${seed.toString(16).slice(0, 6)}`,
    title,
    artist,
    difficulty,
    category: (genre === 'Classical' || genre === 'Traditional' || genre === 'Practice') ? genre : 'Popular',
    bpm,
    timeSignature: '4/4',
    sections,
    notes
  };
}

/**
 * Searches local library or generates dynamic song
 */
export function extractOrSearchClientSong(
  query: string,
  notesInput?: string,
  difficulty?: 'Beginner' | 'Easy' | 'Intermediate' | 'Advanced'
): Song {
  const qClean = query.trim().toLowerCase();

  // If user passed custom notes, construct song directly
  if (notesInput && notesInput.trim().length > 0) {
    const parsedNotes = parseUserNotes(notesInput);
    if (parsedNotes.length > 0) {
      return {
        id: `custom-${Date.now()}`,
        title: query.trim() || 'My Custom Composition',
        artist: 'User Studio',
        difficulty: difficulty || 'Intermediate',
        category: 'Practice',
        bpm: 90,
        timeSignature: '4/4',
        sections: [
          { name: 'Section A', startBeat: 0.0 }
        ],
        notes: parsedNotes
      };
    }
  }

  // Check bundled songs
  const match = BUNDLED_SONGS.find(s =>
    s.title.toLowerCase().includes(qClean) ||
    s.id.toLowerCase().includes(qClean) ||
    s.artist.toLowerCase().includes(qClean)
  );

  if (match) {
    return match;
  }

  // Generate algorithmic arrangement for the requested piece
  return generateAlgorithmicSong(query.trim(), 'Interactive Arrangement', 'Popular', difficulty || 'Intermediate');
}
