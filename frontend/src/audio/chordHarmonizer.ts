import { Song, ChordVoicing } from '../songs/types';

// Standard piano chord voicings (notes in octaves 2-3, bass in octave 1-2)
export const CHORD_LIBRARY: Record<string, { notes: string[]; bass: string }> = {
  // Major triads & 7ths
  C: { notes: ['C3', 'E3', 'G3'], bass: 'C2' },
  Cmaj7: { notes: ['C3', 'E3', 'G3', 'B3'], bass: 'C2' },
  D: { notes: ['D3', 'F#3', 'A3'], bass: 'D2' },
  Dmaj7: { notes: ['D3', 'F#3', 'A3', 'C#4'], bass: 'D2' },
  E: { notes: ['E3', 'G#3', 'B3'], bass: 'E2' },
  F: { notes: ['F2', 'A2', 'C3', 'E3'], bass: 'F1' },
  Fmaj7: { notes: ['F2', 'A2', 'C3', 'E3'], bass: 'F1' },
  G: { notes: ['G2', 'B2', 'D3'], bass: 'G1' },
  G7: { notes: ['G2', 'B2', 'D3', 'F3'], bass: 'G1' },
  A: { notes: ['A2', 'C#3', 'E3'], bass: 'A1' },
  Amaj7: { notes: ['A2', 'C#3', 'E3', 'G#3'], bass: 'A1' },
  B: { notes: ['B2', 'D#3', 'F#3'], bass: 'B1' },
  Bb: { notes: ['A#2', 'D3', 'F3'], bass: 'A#1' },
  Eb: { notes: ['D#3', 'G3', 'A#3'], bass: 'D#2' },
  Ab: { notes: ['G#2', 'C3', 'D#3'], bass: 'G#1' },
  Db: { notes: ['C#3', 'F3', 'G#3'], bass: 'C#2' },
  Gb: { notes: ['F#2', 'A#2', 'C#3'], bass: 'F#1' },
  'F#': { notes: ['F#2', 'A#2', 'C#3'], bass: 'F#1' },
  'C#': { notes: ['C#3', 'F3', 'G#3'], bass: 'C#2' },
  'G#': { notes: ['G#2', 'C3', 'D#3'], bass: 'G#1' },

  // Minor triads & 7ths
  Am: { notes: ['A2', 'C3', 'E3'], bass: 'A1' },
  Am7: { notes: ['A2', 'C3', 'E3', 'G3'], bass: 'A1' },
  Bm: { notes: ['B2', 'D3', 'F#3'], bass: 'B1' },
  Bm7: { notes: ['B2', 'D3', 'F#3', 'A3'], bass: 'B1' },
  Cm: { notes: ['C3', 'D#3', 'G3'], bass: 'C2' },
  Dm: { notes: ['D3', 'F3', 'A3'], bass: 'D2' },
  Dm7: { notes: ['D3', 'F3', 'A3', 'C4'], bass: 'D2' },
  Em: { notes: ['E2', 'G2', 'B2', 'E3'], bass: 'E1' },
  Em7: { notes: ['E2', 'G2', 'B2', 'D3'], bass: 'E1' },
  Fm: { notes: ['F2', 'G#2', 'C3'], bass: 'F1' },
  Gm: { notes: ['G2', 'A#2', 'D3'], bass: 'G1' },
  'F#m': { notes: ['F#2', 'A2', 'C#3'], bass: 'F#1' },
  'F#m7': { notes: ['F#2', 'A2', 'C#3', 'E3'], bass: 'F#1' },
  'C#m': { notes: ['C#3', 'E3', 'G#3'], bass: 'C#2' },
  'C#m7': { notes: ['C#3', 'E3', 'G#3', 'B3'], bass: 'C#2' },
  'G#m': { notes: ['G#2', 'B2', 'D#3'], bass: 'G#1' },
  'D#m': { notes: ['D#3', 'F#3', 'A#3'], bass: 'D#2' },
  Bbm: { notes: ['A#2', 'C#3', 'F3'], bass: 'A#1' },
  Ebm: { notes: ['D#3', 'F#3', 'A#3'], bass: 'D#2' }
};

// Authentic chord progression maps for all standard pieces
export const REPERTOIRE_PROGRESSIONS: {
  patterns: string[]; // matching substrings in id or title
  chords: string[];
  measureBeats: number;
}[] = [
  {
    patterns: ['river-flows-in-you', 'river flows in you', 'yiruma'],
    chords: ['F#m', 'D', 'A', 'E', 'F#m', 'D', 'A', 'E', 'D', 'E', 'C#m', 'F#m', 'Bm', 'E', 'A', 'A'],
    measureBeats: 4.0
  },
  {
    patterns: ['interstellar', 'interstellar-theme', 'first step', 'hans zimmer'],
    chords: ['Am', 'F', 'C', 'G', 'Dm', 'Am', 'F', 'G', 'Am', 'F', 'C', 'G'],
    measureBeats: 4.0
  },
  {
    patterns: ['golden-hour', 'golden hour', 'jvke'],
    chords: ['G', 'Bm', 'Em', 'C', 'G', 'Bm', 'Em', 'C'],
    measureBeats: 4.0
  },
  {
    patterns: ['moonlight-sonata', 'moonlight sonata', 'adagio sostenuto'],
    chords: ['C#m', 'B', 'A', 'G#m', 'C#m', 'A', 'F#m', 'G#', 'C#m'],
    measureBeats: 4.0
  },
  {
    patterns: ['canon-in-d', 'canon in d', 'pachelbel'],
    chords: ['D', 'A', 'Bm', 'F#m', 'G', 'D', 'G', 'A'],
    measureBeats: 4.0
  },
  {
    patterns: ['hes-a-pirate', "he's a pirate", 'pirates of the caribbean', 'black pearl'],
    chords: ['Dm', 'Bb', 'C', 'Dm', 'Dm', 'Bb', 'F', 'A', 'Dm', 'Bb', 'C', 'Dm'],
    measureBeats: 4.0
  },
  {
    patterns: ['clair-de-lune', 'clair de lune', 'debussy'],
    chords: ['Db', 'Ab', 'Bbm', 'Gb', 'Db', 'Ebm', 'Ab', 'Db'],
    measureBeats: 4.0
  },
  {
    patterns: ['hallelujah', 'leonard cohen'],
    chords: ['C', 'Am', 'C', 'Am', 'F', 'G', 'C', 'G', 'C', 'F', 'G', 'Am', 'F', 'G', 'E', 'Am'],
    measureBeats: 4.0
  },
  {
    patterns: ['twinkle-twinkle', 'twinkle, twinkle', 'twinkle'],
    chords: ['C', 'C', 'G', 'G', 'Am', 'Am', 'G', 'G', 'F', 'F', 'C', 'C', 'G', 'G', 'C', 'C'],
    measureBeats: 4.0
  },
  {
    patterns: ['mary-had-a-little-lamb', 'mary had a little lamb'],
    chords: ['C', 'G', 'C', 'G', 'C', 'G', 'C', 'C'],
    measureBeats: 4.0
  },
  {
    patterns: ['ode-to-joy', 'ode to joy', 'symphony no. 9'],
    chords: ['C', 'G', 'C', 'G', 'C', 'G', 'C', 'G', 'G', 'C', 'G', 'C'],
    measureBeats: 4.0
  },
  {
    patterns: ['happy-birthday', 'happy birthday'],
    chords: ['C', 'G', 'G', 'C', 'C', 'F', 'C', 'G', 'C'],
    measureBeats: 3.0
  },
  {
    patterns: ['amazing-grace', 'amazing grace'],
    chords: ['C', 'C', 'F', 'C', 'C', 'Am', 'G', 'G', 'C', 'C', 'F', 'C', 'Am', 'G', 'C', 'C'],
    measureBeats: 3.0
  },
  {
    patterns: ['c-major-scale', 'c major scale'],
    chords: ['C', 'F', 'G', 'C', 'Am', 'Dm', 'G', 'C'],
    measureBeats: 4.0
  },
  {
    patterns: ['fur-elise', 'für elise', 'fur elise'],
    chords: ['Am', 'E', 'Am', 'E', 'Am', 'C', 'G', 'C', 'Am', 'E', 'Am'],
    measureBeats: 3.0
  },
  {
    patterns: ['fly-me-to-the-moon', 'fly me to the moon', 'sinatra'],
    chords: ['Am', 'Dm', 'G', 'C', 'F', 'Bm', 'E', 'Am'],
    measureBeats: 4.0
  },
  {
    patterns: ['game-of-thrones', 'game of thrones'],
    chords: ['Cm', 'Gm', 'Bb', 'Cm', 'Fm', 'Cm', 'Gm', 'Cm'],
    measureBeats: 4.0
  },
  {
    patterns: ['viva-la-vida', 'viva la vida', 'coldplay'],
    chords: ['Db', 'Eb', 'Ab', 'Fm', 'Db', 'Eb', 'Ab', 'Fm'],
    measureBeats: 4.0
  },
  {
    patterns: ['gurenge', 'demon slayer'],
    chords: ['Em', 'C', 'D', 'G', 'Em', 'C', 'D', 'B'],
    measureBeats: 4.0
  },
  {
    patterns: ['sun-sathiya', 'sun sathiya'],
    chords: ['Am', 'F', 'G', 'Em', 'F', 'Dm', 'G', 'Am'],
    measureBeats: 4.0
  },
  {
    patterns: ['someone-like-you', 'someone like you', 'adele'],
    chords: ['A', 'C#m', 'F#m', 'D', 'A', 'C#m', 'F#m', 'D'],
    measureBeats: 4.0
  },
  {
    patterns: ['shape-of-you', 'shape of you'],
    chords: ['C#m', 'F#m', 'A', 'B', 'C#m', 'F#m', 'A', 'B'],
    measureBeats: 4.0
  },
  {
    patterns: ['perfect', 'ed sheeran'],
    chords: ['G', 'Em', 'C', 'D', 'G', 'Em', 'C', 'D'],
    measureBeats: 4.0
  },
  {
    patterns: ['faded', 'alan walker'],
    chords: ['D#m', 'B', 'F#', 'C#', 'D#m', 'B', 'F#', 'C#'],
    measureBeats: 4.0
  },
  {
    patterns: ['believer', 'imagine dragons'],
    chords: ['Bbm', 'Gb', 'Db', 'Ab', 'Bbm', 'Gb', 'Db', 'Ab'],
    measureBeats: 4.0
  },
  {
    patterns: ['despacito'],
    chords: ['Bm', 'G', 'D', 'A', 'Bm', 'G', 'D', 'A'],
    measureBeats: 4.0
  },
  {
    patterns: ['all-of-me', 'all of me', 'john legend'],
    chords: ['Fm', 'Db', 'Ab', 'Eb', 'Fm', 'Db', 'Ab', 'Eb'],
    measureBeats: 4.0
  },
  {
    patterns: ['let-it-go', 'let it go', 'frozen'],
    chords: ['Em', 'C', 'D', 'Am', 'Em', 'C', 'D', 'G'],
    measureBeats: 4.0
  },
  {
    patterns: ['memories', 'maroon 5'],
    chords: ['B', 'F#', 'G#m', 'D#m', 'E', 'B', 'E', 'F#'],
    measureBeats: 4.0
  },
  {
    patterns: ['stay', 'the kid laroi'],
    chords: ['C', 'Em', 'D', 'G', 'C', 'Em', 'D', 'G'],
    measureBeats: 4.0
  },
  {
    patterns: ['bad-guy', 'bad guy', 'billie eilish'],
    chords: ['Gm', 'C', 'D', 'Gm', 'Gm', 'C', 'D', 'Gm'],
    measureBeats: 4.0
  },
  {
    patterns: ['dance-monkey', 'dance monkey'],
    chords: ['F#m', 'D', 'E', 'C#m', 'F#m', 'D', 'E', 'C#m'],
    measureBeats: 4.0
  },
  {
    patterns: ['counting-stars', 'counting stars', 'onerepublic'],
    chords: ['Am', 'C', 'G', 'F', 'Am', 'C', 'G', 'F'],
    measureBeats: 4.0
  },
  {
    patterns: ['see-you-again', 'see you again'],
    chords: ['Bb', 'Gm', 'Eb', 'Bb', 'Bb', 'Gm', 'Eb', 'Bb'],
    measureBeats: 4.0
  },
  {
    patterns: ['senorita', 'señorita'],
    chords: ['Am', 'C', 'F', 'Em', 'G', 'Am', 'C', 'F'],
    measureBeats: 4.0
  }
];

// Diatonic scales and their harmonic triads for key-aware generation
const DIATONIC_KEYS: {
  keyName: string;
  notes: string[];
  chords: string[];
  restingCycle: string[];
}[] = [
  {
    keyName: 'C Major / A Minor',
    notes: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
    chords: ['C', 'Dm', 'Em', 'F', 'G', 'Am'],
    restingCycle: ['C', 'G', 'Am', 'F', 'Dm', 'G']
  },
  {
    keyName: 'G Major / E Minor',
    notes: ['G', 'A', 'B', 'C', 'D', 'E', 'F#'],
    chords: ['G', 'Am', 'Bm', 'C', 'D', 'Em'],
    restingCycle: ['G', 'D', 'Em', 'C', 'Am', 'D']
  },
  {
    keyName: 'D Major / B Minor',
    notes: ['D', 'E', 'F#', 'G', 'A', 'B', 'C#'],
    chords: ['D', 'Em', 'F#m', 'G', 'A', 'Bm'],
    restingCycle: ['D', 'A', 'Bm', 'G', 'Em', 'A']
  },
  {
    keyName: 'A Major / F# Minor',
    notes: ['A', 'B', 'C#', 'D', 'E', 'F#', 'G#'],
    chords: ['A', 'Bm', 'C#m', 'D', 'E', 'F#m'],
    restingCycle: ['F#m', 'D', 'A', 'E', 'Bm', 'E']
  },
  {
    keyName: 'E Major / C# Minor',
    notes: ['E', 'F#', 'G#', 'A', 'B', 'C#', 'D#'],
    chords: ['E', 'F#m', 'G#m', 'A', 'B', 'C#m'],
    restingCycle: ['C#m', 'A', 'E', 'B', 'F#m', 'B']
  },
  {
    keyName: 'F Major / D Minor',
    notes: ['F', 'G', 'A', 'Bb', 'C', 'D', 'E'],
    chords: ['F', 'Gm', 'Am', 'Bb', 'C', 'Dm'],
    restingCycle: ['Dm', 'Bb', 'F', 'C', 'Gm', 'C']
  },
  {
    keyName: 'Bb Major / G Minor',
    notes: ['Bb', 'C', 'D', 'Eb', 'F', 'G', 'A'],
    chords: ['Bb', 'Cm', 'Dm', 'Eb', 'F', 'Gm'],
    restingCycle: ['Bb', 'F', 'Gm', 'Eb', 'Cm', 'F']
  },
  {
    keyName: 'Eb Major / C Minor',
    notes: ['Eb', 'F', 'G', 'Ab', 'Bb', 'C', 'D'],
    chords: ['Eb', 'Fm', 'Gm', 'Ab', 'Bb', 'Cm'],
    restingCycle: ['Cm', 'Ab', 'Eb', 'Bb', 'Fm', 'Bb']
  },
  {
    keyName: 'Ab Major / F Minor',
    notes: ['Ab', 'Bb', 'C', 'Db', 'Eb', 'F', 'G'],
    chords: ['Ab', 'Bbm', 'Cm', 'Db', 'Eb', 'Fm'],
    restingCycle: ['Db', 'Eb', 'Ab', 'Fm', 'Bbm', 'Eb']
  },
  {
    keyName: 'Db Major / Bb Minor',
    notes: ['Db', 'Eb', 'F', 'Gb', 'Ab', 'Bb', 'C'],
    chords: ['Db', 'Ebm', 'Fm', 'Gb', 'Ab', 'Bbm'],
    restingCycle: ['Db', 'Ab', 'Bbm', 'Gb', 'Ebm', 'Ab']
  }
];

function normalizePitch(noteWithOctave: string): string {
  const pitch = noteWithOctave.replace(/\d+/, '').toUpperCase();
  if (pitch === 'DB') return 'C#';
  if (pitch === 'EB') return 'D#';
  if (pitch === 'GB') return 'F#';
  if (pitch === 'AB') return 'G#';
  if (pitch === 'BB') return 'A#';
  return pitch;
}

/**
 * Detects the musical key of a song from its actual note pitches
 */
function detectSongKey(song: Song) {
  if (!song.notes || song.notes.length === 0) {
    return DIATONIC_KEYS[0];
  }

  const pitchCounts: Record<string, number> = {};
  song.notes.forEach((n) => {
    const pc = normalizePitch(n.note);
    pitchCounts[pc] = (pitchCounts[pc] || 0) + 1;
  });

  let bestKey = DIATONIC_KEYS[0];
  let highestScore = -1;

  for (const k of DIATONIC_KEYS) {
    let score = 0;
    k.notes.forEach((scaleNote) => {
      const norm = normalizePitch(scaleNote);
      if (pitchCounts[norm]) {
        score += pitchCounts[norm];
      }
    });
    if (score > highestScore) {
      highestScore = score;
      bestKey = k;
    }
  }

  return bestKey;
}

/**
 * Generates key-matched harmonic progression based on the song's actual key and note pitches
 */
function harmonizeByKey(song: Song): ChordVoicing[] {
  if (!song.notes || song.notes.length === 0) return [];

  const detectedKey = detectSongKey(song);
  const lastNote = song.notes[song.notes.length - 1];
  const totalBeats = lastNote.startBeat + lastNote.durationBeats + 4.0;
  const windowSize = 4.0;
  const voicings: ChordVoicing[] = [];

  for (let b = 0; b < totalBeats; b += windowSize) {
    const endBeat = b + windowSize;
    const windowNotes = song.notes.filter(
      (n) => n.startBeat >= b && n.startBeat < endBeat
    );

    let chosenChord = detectedKey.restingCycle[0];

    if (windowNotes.length > 0) {
      const windowPitches: Record<string, number> = {};
      windowNotes.forEach((n) => {
        const pc = normalizePitch(n.note);
        windowPitches[pc] = (windowPitches[pc] || 0) + 1;
      });

      let bestScore = -1;
      for (const chordName of detectedKey.chords) {
        const chordDef = CHORD_LIBRARY[chordName];
        if (!chordDef) continue;
        let score = 0;
        chordDef.notes.forEach((cn) => {
          const cpc = normalizePitch(cn);
          if (windowPitches[cpc]) {
            score += windowPitches[cpc];
          }
        });
        if (score > bestScore) {
          bestScore = score;
          chosenChord = chordName;
        }
      }
    } else {
      const cycleIdx = Math.floor(b / windowSize) % detectedKey.restingCycle.length;
      chosenChord = detectedKey.restingCycle[cycleIdx];
    }

    const chordDef = CHORD_LIBRARY[chosenChord] || CHORD_LIBRARY['C'];
    voicings.push({
      beat: b,
      durationBeats: windowSize,
      name: chosenChord,
      notes: chordDef.notes,
      bass: chordDef.bass
    });
  }

  return voicings;
}

/**
 * Returns accompaniment chord voicings strictly corresponding to the target song.
 */
export function getSongAccompanimentChords(song: Song): ChordVoicing[] {
  // 1. If the song already defines hand-authored chords, use them directly
  if (song.chords && song.chords.length > 0) {
    return song.chords;
  }

  // 2. Check repertoire table matching title or ID
  const songQuery = `${song.id} ${song.title} ${song.artist}`.toLowerCase();
  const matchedEntry = REPERTOIRE_PROGRESSIONS.find((entry) =>
    entry.patterns.some((pattern) => songQuery.includes(pattern.toLowerCase()))
  );

  if (matchedEntry) {
    const lastNote = song.notes[song.notes.length - 1];
    const totalBeats = lastNote ? lastNote.startBeat + lastNote.durationBeats + 4.0 : 96.0;
    const voicings: ChordVoicing[] = [];
    const measureBeats = matchedEntry.measureBeats || 4.0;
    let chordIdx = 0;

    for (let b = 0; b < totalBeats; b += measureBeats) {
      const chordName = matchedEntry.chords[chordIdx % matchedEntry.chords.length];
      const chordDef = CHORD_LIBRARY[chordName] || CHORD_LIBRARY['C'];
      voicings.push({
        beat: b,
        durationBeats: measureBeats,
        name: chordName,
        notes: chordDef.notes,
        bass: chordDef.bass
      });
      chordIdx++;
    }
    return voicings;
  }

  // 3. Otherwise, analyze the song's actual notes and harmonize in its exact detected key!
  return harmonizeByKey(song);
}
