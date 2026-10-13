export interface MidiInputListener {
  onNoteOn: (note: string, velocity: number) => void;
  onNoteOff: (note: string) => void;
  onSustainChange: (isSustained: boolean) => void;
  onDeviceStatus: (connected: boolean, deviceName?: string) => void;
}

const PITCH_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

function midiToNote(midiNumber: number): string {
  const octave = Math.floor(midiNumber / 12) - 1;
  const pitch = PITCH_NAMES[midiNumber % 12];
  return `${pitch}${octave}`;
}

export class MidiHandler {
  private midiAccess: any = null;
  private listener: MidiInputListener | null = null;
  public isSupported = false;
  public isConnected = false;
  public deviceName: string | null = null;

  constructor() {
    this.isSupported = typeof navigator !== 'undefined' && 'requestMIDIAccess' in navigator;
  }

  public setListener(listener: MidiInputListener | null) {
    this.listener = listener;
  }

  public async initialize(): Promise<boolean> {
    if (!this.isSupported) {
      this.listener?.onDeviceStatus(false);
      return false;
    }

    try {
      // @ts-ignore
      this.midiAccess = await navigator.requestMIDIAccess({ sysex: false });
      this.setupInputs();

      this.midiAccess.onstatechange = () => {
        this.setupInputs();
      };
      return true;
    } catch (err) {
      console.info('MIDI access not granted or unavailable:', err);
      this.listener?.onDeviceStatus(false);
      return false;
    }
  }

  private setupInputs() {
    if (!this.midiAccess) return;
    let found = false;
    let firstName = '';

    const inputs = this.midiAccess.inputs.values();
    for (const input of inputs) {
      found = true;
      firstName = input.name || 'MIDI Controller';
      input.onmidimessage = (event: any) => this.handleMidiMessage(event);
    }

    this.isConnected = found;
    this.deviceName = found ? firstName : null;
    this.listener?.onDeviceStatus(found, firstName);
  }

  private handleMidiMessage(event: any) {
    if (!event.data || event.data.length < 2) return;
    const [statusByte, data1, data2] = event.data;
    const command = statusByte >> 4;
    const velocity = (data2 || 0) / 127.0;
    const note = midiToNote(data1);

    // Note On (0x9)
    if (command === 0x9) {
      if (data2 > 0) {
        this.listener?.onNoteOn(note, Math.max(0.1, velocity));
      } else {
        this.listener?.onNoteOff(note);
      }
    }
    // Note Off (0x8)
    else if (command === 0x8) {
      this.listener?.onNoteOff(note);
    }
    // Control Change (0xB) - Sustain Pedal CC 64
    else if (command === 0xB && data1 === 64) {
      const isSustained = data2 >= 64;
      this.listener?.onSustainChange(isSustained);
    }
  }

  public detach() {
    if (this.midiAccess) {
      const inputs = this.midiAccess.inputs.values();
      for (const input of inputs) {
        input.onmidimessage = null;
      }
      this.midiAccess.onstatechange = null;
    }
  }
}
