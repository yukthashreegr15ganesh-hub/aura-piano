import { KeyboardHandler } from './KeyboardHandler';
import { MidiHandler } from './MidiHandler';

export interface UnifiedInputListener {
  onUserNoteOn: (note: string, velocity: number, source: 'keyboard' | 'mouse' | 'touch' | 'midi') => void;
  onUserNoteOff: (note: string, source: 'keyboard' | 'mouse' | 'touch' | 'midi') => void;
  onSustainChange: (isSustained: boolean) => void;
  onAllNotesOff: () => void;
}

export class InputManager {
  private keyboardHandler: KeyboardHandler;
  private midiHandler: MidiHandler;
  private listener: UnifiedInputListener | null = null;
  private mouseActiveNotes: Set<string> = new Set();

  constructor() {
    this.keyboardHandler = new KeyboardHandler();
    this.midiHandler = new MidiHandler();

    this.keyboardHandler.setListener({
      onNoteOn: (note, vel) => this.listener?.onUserNoteOn(note, vel, 'keyboard'),
      onNoteOff: (note) => this.listener?.onUserNoteOff(note, 'keyboard'),
      onSustainChange: (sustained) => this.listener?.onSustainChange(sustained),
      onAllNotesOff: () => this.listener?.onAllNotesOff(),
    });

    this.midiHandler.setListener({
      onNoteOn: (note, vel) => this.listener?.onUserNoteOn(note, vel, 'midi'),
      onNoteOff: (note) => this.listener?.onUserNoteOff(note, 'midi'),
      onSustainChange: (sustained) => this.listener?.onSustainChange(sustained),
      onDeviceStatus: (_connected, _name) => {},
    });
  }

  public setListener(listener: UnifiedInputListener) {
    this.listener = listener;
  }

  public setOctaveShift(shift: number) {
    this.keyboardHandler.setOctaveShift(shift);
  }

  public start() {
    this.keyboardHandler.attach();
    this.midiHandler.initialize();
  }

  public stop() {
    this.keyboardHandler.detach();
    this.midiHandler.detach();
  }

  public triggerKeyNoteOn(note: string, velocity = 0.85, isTouch = false) {
    this.mouseActiveNotes.add(note);
    this.listener?.onUserNoteOn(note, velocity, isTouch ? 'touch' : 'mouse');
  }

  public triggerKeyNoteOff(note: string, isTouch = false) {
    if (this.mouseActiveNotes.has(note)) {
      this.mouseActiveNotes.delete(note);
      this.listener?.onUserNoteOff(note, isTouch ? 'touch' : 'mouse');
    }
  }

  public releaseAll() {
    this.mouseActiveNotes.clear();
    this.keyboardHandler.releaseAll();
    this.listener?.onAllNotesOff();
  }
}
