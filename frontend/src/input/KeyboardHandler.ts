import { getNoteForComputerKey } from '../songs/keyMap';

export interface KeyboardInputListener {
  onNoteOn: (note: string, velocity: number) => void;
  onNoteOff: (note: string) => void;
  onSustainChange: (isSustained: boolean) => void;
  onAllNotesOff: () => void;
}

export class KeyboardHandler {
  private listener: KeyboardInputListener | null = null;
  private activeKeys: Set<string> = new Set();
  private isSustained = false;
  private isEnabled = true;
  private octaveShift = 0;

  constructor() {
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
  }

  public setOctaveShift(shift: number) {
    this.releaseAll();
    this.octaveShift = Math.max(-2, Math.min(2, shift));
  }

  public getOctaveShift(): number {
    return this.octaveShift;
  }

  public setListener(listener: KeyboardInputListener | null) {
    this.listener = listener;
  }

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    if (!enabled) {
      this.releaseAll();
    }
  }

  public attach() {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    window.addEventListener('blur', this.handleBlur);
  }

  public detach() {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('blur', this.handleBlur);
    this.releaseAll();
  }

  private handleKeyDown(e: KeyboardEvent) {
    // If user is typing in an input or textarea, ignore piano keys
    const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
    if (tag === 'input' || tag === 'textarea' || (e.target as HTMLElement)?.isContentEditable) {
      return;
    }

    // Sustain pedal on Spacebar
    if (e.code === 'Space') {
      e.preventDefault();
      if (!this.isSustained) {
        this.isSustained = true;
        this.listener?.onSustainChange(true);
      }
      return;
    }

    // Ignore browser auto-repeat
    if (e.repeat) return;

    if (!this.isEnabled) return;

    let note = getNoteForComputerKey(e.key);
    if (note && this.octaveShift !== 0) {
      const match = note.match(/^([A-G][#b]?)([0-8])$/);
      if (match) {
        const pitch = match[1];
        const oct = parseInt(match[2], 10) + this.octaveShift;
        note = `${pitch}${Math.max(1, Math.min(8, oct))}`;
      }
    }

    if (note && !this.activeKeys.has(note)) {
      // Don't prevent default on modifier combinations
      if (!e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
      }
      this.activeKeys.add(note);
      // Default computer keyboard velocity
      this.listener?.onNoteOn(note, 0.85);
    }
  }

  private handleKeyUp(e: KeyboardEvent) {
    if (e.code === 'Space') {
      e.preventDefault();
      this.isSustained = false;
      this.listener?.onSustainChange(false);
      return;
    }

    let note = getNoteForComputerKey(e.key);
    if (note && this.octaveShift !== 0) {
      const match = note.match(/^([A-G][#b]?)([0-8])$/);
      if (match) {
        const pitch = match[1];
        const oct = parseInt(match[2], 10) + this.octaveShift;
        note = `${pitch}${Math.max(1, Math.min(8, oct))}`;
      }
    }

    if (note && this.activeKeys.has(note)) {
      this.activeKeys.delete(note);
      this.listener?.onNoteOff(note);
    }
  }

  private handleBlur() {
    this.releaseAll();
  }

  public releaseAll() {
    this.activeKeys.clear();
    this.isSustained = false;
    this.listener?.onSustainChange(false);
    this.listener?.onAllNotesOff();
  }
}
