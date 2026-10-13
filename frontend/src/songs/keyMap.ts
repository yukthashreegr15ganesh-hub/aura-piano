export interface KeyInfo {
  note: string;
  isBlack: boolean;
  computerKey: string;
  keyboardDisplay: string;
  midi: number;
}

// 29-note playable range from C4 to E6
export const PLAYABLE_NOTES: string[] = [
  'C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4', 'B4',
  'C5', 'C#5', 'D5', 'D#5', 'E5', 'F5', 'F#5', 'G5', 'G#5', 'A5', 'A#5', 'B5',
  'C6', 'C#6', 'D6', 'D#6', 'E6'
];

// Mapping according to specifications:
// A W S E D F T G Y H U J K = C4 C#4 D4 D#4 E4 F4 F#4 G4 G#4 A4 A#4 B4 C5
// Continuing O L P ; ' ...
const NOTE_TO_KEY_DATA: Record<string, { key: string; display: string }> = {
  'C4':  { key: 'a', display: 'A' },
  'C#4': { key: 'w', display: 'W' },
  'D4':  { key: 's', display: 'S' },
  'D#4': { key: 'e', display: 'E' },
  'E4':  { key: 'd', display: 'D' },
  'F4':  { key: 'f', display: 'F' },
  'F#4': { key: 't', display: 'T' },
  'G4':  { key: 'g', display: 'G' },
  'G#4': { key: 'y', display: 'Y' },
  'A4':  { key: 'h', display: 'H' },
  'A#4': { key: 'u', display: 'U' },
  'B4':  { key: 'j', display: 'J' },
  'C5':  { key: 'k', display: 'K' },
  'C#5': { key: 'o', display: 'O' },
  'D5':  { key: 'l', display: 'L' },
  'D#5': { key: 'p', display: 'P' },
  'E5':  { key: ';', display: ';' },
  'F5':  { key: "'", display: "'" },
  'F#5': { key: ']', display: ']' },
  'G5':  { key: 'z', display: 'Z' },
  'G#5': { key: 'x', display: 'X' },
  'A5':  { key: 'c', display: 'C' },
  'A#5': { key: 'v', display: 'V' },
  'B5':  { key: 'b', display: 'B' },
  'C6':  { key: 'n', display: 'N' },
  'C#6': { key: 'm', display: 'M' },
  'D6':  { key: ',', display: ',' },
  'D#6': { key: '.', display: '.' },
  'E6':  { key: '/', display: '/' },
};

// Reverse lookup: key -> note
const KEY_TO_NOTE_MAP: Record<string, string> = {};
Object.entries(NOTE_TO_KEY_DATA).forEach(([note, { key }]) => {
  KEY_TO_NOTE_MAP[key.toLowerCase()] = note;
});

// Also support uppercase variants and alternative keys
KEY_TO_NOTE_MAP['1'] = 'C4';
KEY_TO_NOTE_MAP['2'] = 'D4';
KEY_TO_NOTE_MAP['3'] = 'E4';
KEY_TO_NOTE_MAP['4'] = 'F4';
KEY_TO_NOTE_MAP['5'] = 'G4';
KEY_TO_NOTE_MAP['6'] = 'A4';
KEY_TO_NOTE_MAP['7'] = 'B4';
KEY_TO_NOTE_MAP['8'] = 'C5';

export function isBlackKey(note: string): boolean {
  return note.includes('#') || note.includes('b');
}

export function getMidiNumber(note: string): number {
  const pitchMap: Record<string, number> = {
    'C': 0, 'C#': 1, 'Db': 1,
    'D': 2, 'D#': 3, 'Eb': 3,
    'E': 4,
    'F': 5, 'F#': 6, 'Gb': 6,
    'G': 7, 'G#': 8, 'Ab': 8,
    'A': 9, 'A#': 10, 'Bb': 10,
    'B': 11
  };
  const match = note.match(/^([A-G][#b]?)([0-8])$/);
  if (!match) return 60;
  const pitch = match[1];
  const octave = parseInt(match[2], 10);
  return (octave + 1) * 12 + (pitchMap[pitch] || 0);
}

export function getComputerKeyForNote(note: string): string {
  // Normalize enharmonics (e.g. Db -> C#)
  const normalized = note.replace('Db', 'C#').replace('Eb', 'D#').replace('Gb', 'F#').replace('Ab', 'G#').replace('Bb', 'A#');
  return NOTE_TO_KEY_DATA[normalized]?.display || '';
}

export function getNoteForComputerKey(key: string): string | null {
  return KEY_TO_NOTE_MAP[key.toLowerCase()] || null;
}

export const ALL_PIANO_KEYS: KeyInfo[] = PLAYABLE_NOTES.map((note) => {
  const data = NOTE_TO_KEY_DATA[note] || { key: '', display: '' };
  return {
    note,
    isBlack: isBlackKey(note),
    computerKey: data.key,
    keyboardDisplay: data.display,
    midi: getMidiNumber(note),
  };
});
