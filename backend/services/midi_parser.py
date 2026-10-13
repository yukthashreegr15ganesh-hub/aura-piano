import io
import mido
from typing import Dict, Any, List, Tuple
import re

PITCH_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
MIN_MIDI = 60  # C4
MAX_MIDI = 88  # E6

def midi_to_note_name(midi_num: int) -> str:
    octave = (midi_num // 12) - 1
    pitch = PITCH_NAMES[midi_num % 12]
    return f"{pitch}{octave}"

def parse_midi_file(file_bytes: bytes, filename: str = "imported_song.mid") -> Dict[str, Any]:
    """
    Parses a MIDI byte buffer, extracts melody notes, clamps/shifts to C4-E6 range,
    and returns a structured song dict matching the Song schema.
    """
    try:
        mid = mido.MidiFile(file=io.BytesIO(file_bytes))
    except Exception as e:
        raise ValueError(f"Invalid MIDI file: {str(e)}")

    ticks_per_beat = mid.ticks_per_beat or 480
    tempo = 500000  # Default 120 BPM (500000 microseconds per beat)
    bpm = 120

    # Look for tempo meta messages
    for track in mid.tracks:
        for msg in track:
            if msg.type == 'set_tempo':
                tempo = msg.tempo
                bpm = int(round(mido.tempo2bpm(tempo)))
                break

    # Extract all note events across tracks or identify the melody track
    best_track_notes: List[Dict[str, Any]] = []
    
    # Process tracks to find the best melody candidate
    for track_idx, track in enumerate(mid.tracks):
        curr_tick = 0
        active_notes: Dict[int, Tuple[int, float]] = {}  # note_num -> (start_tick, velocity)
        track_notes: List[Dict[str, Any]] = []

        for msg in track:
            curr_tick += msg.time
            if msg.type == 'note_on' and msg.velocity > 0:
                active_notes[msg.note] = (curr_tick, msg.velocity / 127.0)
            elif (msg.type == 'note_off') or (msg.type == 'note_on' and msg.velocity == 0):
                if msg.note in active_notes:
                    start_tick, vel = active_notes.pop(msg.note)
                    duration_ticks = max(int(ticks_per_beat * 0.25), curr_tick - start_tick)
                    track_notes.append({
                        "midi_note": msg.note,
                        "start_tick": start_tick,
                        "duration_ticks": duration_ticks,
                        "velocity": round(vel, 2)
                    })

        # Close any lingering notes
        for note_num, (start_tick, vel) in active_notes.items():
            duration_ticks = int(ticks_per_beat * 0.5)
            track_notes.append({
                "midi_note": note_num,
                "start_tick": start_tick,
                "duration_ticks": duration_ticks,
                "velocity": round(vel, 2)
            })

        if len(track_notes) > len(best_track_notes):
            best_track_notes = track_notes

    if not best_track_notes:
        raise ValueError("No playable note data found in the MIDI file.")

    # Sort notes by start_tick
    best_track_notes.sort(key=lambda n: n["start_tick"])

    # Determine optimal octave transposition to fit within [MIN_MIDI, MAX_MIDI] (60 to 88)
    median_note = sorted([n["midi_note"] for n in best_track_notes])[len(best_track_notes) // 2]
    target_center = 74  # D5 is center of C4-E6 range
    octave_shift = round((target_center - median_note) / 12.0) * 12

    processed_notes = []
    min_beat = float("inf")

    for n in best_track_notes:
        shifted_note = n["midi_note"] + octave_shift
        # Clamp to bounds
        clamped_note = max(MIN_MIDI, min(MAX_MIDI, shifted_note))
        note_name = midi_to_note_name(clamped_note)
        start_beat = round(n["start_tick"] / ticks_per_beat, 2)
        duration_beats = max(0.25, round(n["duration_ticks"] / ticks_per_beat, 2))

        processed_notes.append({
            "note": note_name,
            "startBeat": start_beat,
            "durationBeats": duration_beats,
            "velocity": n["velocity"]
        })

    # Normalize so first note starts at beat 0 or 1
    if processed_notes:
        first_beat = processed_notes[0]["startBeat"]
        if first_beat > 0:
            for p in processed_notes:
                p["startBeat"] = round(p["startBeat"] - first_beat, 2)

    # Filter out duplicate notes at exact same beat
    deduped = []
    seen = set()
    for p in processed_notes:
        key = (p["startBeat"], p["note"])
        if key not in seen:
            seen.add(key)
            deduped.append(p)
    processed_notes = deduped

    # Auto-generate sections based on length
    total_beats = processed_notes[-1]["startBeat"] + processed_notes[-1]["durationBeats"] if processed_notes else 16
    sections = []
    section_interval = 16.0 if total_beats > 32 else 8.0
    num_sections = int(total_beats // section_interval) + 1
    section_names = ["Theme Intro", "Melody Part A", "Melody Part B", "Bridge / Variation", "Climax", "Outro"]

    for i in range(num_sections):
        start_b = i * section_interval
        if start_b < total_beats:
            name = section_names[i] if i < len(section_names) else f"Movement {i+1}"
            sections.append({"name": name, "startBeat": start_b})

    # Clean title from filename
    title_clean = re.sub(r'[_.-]+', ' ', filename.replace('.mid', '').replace('.midi', '')).strip().title()

    return {
        "title": title_clean or "Imported Melody",
        "artist": "MIDI Import",
        "difficulty": "Intermediate" if len(processed_notes) > 40 else "Easy",
        "category": "Popular",
        "bpm": max(50, min(220, bpm)),
        "timeSignature": "4/4",
        "sections": sections,
        "notes": processed_notes
    }
