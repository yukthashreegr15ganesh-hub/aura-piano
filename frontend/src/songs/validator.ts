import { Song, SongNote, Section } from './types';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validateSong(data: any): ValidationResult {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    return { isValid: false, errors: ['Song data must be a valid JSON object.'] };
  }

  if (!data.id || typeof data.id !== 'string') errors.push('Missing or invalid "id".');
  if (!data.title || typeof data.title !== 'string') errors.push('Missing or invalid "title".');
  if (!data.artist || typeof data.artist !== 'string') errors.push('Missing or invalid "artist".');
  if (!data.bpm || typeof data.bpm !== 'number' || data.bpm < 30 || data.bpm > 300) {
    errors.push('Song "bpm" must be a number between 30 and 300.');
  }

  if (!Array.isArray(data.notes) || data.notes.length === 0) {
    errors.push('Song must have a non-empty array of "notes".');
  } else {
    data.notes.forEach((note: any, idx: number) => {
      if (!note.note || typeof note.note !== 'string') {
        errors.push(`Note at index ${idx} has invalid pitch.`);
      }
      if (typeof note.startBeat !== 'number' || note.startBeat < 0) {
        errors.push(`Note at index ${idx} has invalid startBeat.`);
      }
      if (typeof note.durationBeats !== 'number' || note.durationBeats <= 0) {
        errors.push(`Note at index ${idx} has invalid durationBeats.`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
