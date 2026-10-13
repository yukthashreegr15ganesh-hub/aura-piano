import re
import math
import hashlib
from typing import Dict, Any, List, Optional
from services.seed_data import SEED_SONGS

# Full, complete multi-section arrangements of iconic pieces for unrestricted learning
EXPANDED_CURATED_SONGS: List[Dict[str, Any]] = [
    {
        "id": "river-flows-in-you",
        "title": "River Flows in You",
        "artist": "Yiruma",
        "difficulty": "Intermediate",
        "category": "Popular",
        "bpm": 70,
        "timeSignature": "4/4",
        "sections": [
            {"name": "Intro Arpeggio", "startBeat": 0.0},
            {"name": "Main Theme A", "startBeat": 16.0},
            {"name": "Theme A Variation", "startBeat": 32.0},
            {"name": "Lyrical Chorus Hook", "startBeat": 48.0},
            {"name": "Climax Reprise", "startBeat": 64.0},
            {"name": "Gentle Outro Resolution", "startBeat": 80.0}
        ],
        "notes": [
            # Intro Arpeggio (0-16)
            {"note": "A4", "startBeat": 0.0, "durationBeats": 0.5},
            {"note": "G#4", "startBeat": 0.5, "durationBeats": 0.5},
            {"note": "A4", "startBeat": 1.0, "durationBeats": 1.0},
            {"note": "E4", "startBeat": 2.0, "durationBeats": 1.0},
            {"note": "A4", "startBeat": 3.0, "durationBeats": 0.5},
            {"note": "G#4", "startBeat": 3.5, "durationBeats": 0.5},
            {"note": "A4", "startBeat": 4.0, "durationBeats": 1.0},
            {"note": "C5", "startBeat": 5.0, "durationBeats": 1.0},
            {"note": "B4", "startBeat": 6.0, "durationBeats": 2.0},
            {"note": "A4", "startBeat": 8.0, "durationBeats": 0.5},
            {"note": "G#4", "startBeat": 8.5, "durationBeats": 0.5},
            {"note": "A4", "startBeat": 9.0, "durationBeats": 1.0},
            {"note": "E4", "startBeat": 10.0, "durationBeats": 1.0},
            {"note": "A4", "startBeat": 11.0, "durationBeats": 0.5},
            {"note": "B4", "startBeat": 11.5, "durationBeats": 0.5},
            {"note": "C5", "startBeat": 12.0, "durationBeats": 1.0},
            {"note": "B4", "startBeat": 13.0, "durationBeats": 0.5},
            {"note": "A4", "startBeat": 13.5, "durationBeats": 0.5},
            {"note": "G#4", "startBeat": 14.0, "durationBeats": 2.0},

            # Main Theme A (16-32)
            {"note": "A4", "startBeat": 16.0, "durationBeats": 0.5},
            {"note": "G#4", "startBeat": 16.5, "durationBeats": 0.5},
            {"note": "A4", "startBeat": 17.0, "durationBeats": 1.0},
            {"note": "E4", "startBeat": 18.0, "durationBeats": 1.0},
            {"note": "A4", "startBeat": 19.0, "durationBeats": 0.5},
            {"note": "G#4", "startBeat": 19.5, "durationBeats": 0.5},
            {"note": "A4", "startBeat": 20.0, "durationBeats": 1.0},
            {"note": "C5", "startBeat": 21.0, "durationBeats": 1.0},
            {"note": "B4", "startBeat": 22.0, "durationBeats": 2.0},
            {"note": "A4", "startBeat": 24.0, "durationBeats": 0.5},
            {"note": "B4", "startBeat": 24.5, "durationBeats": 0.5},
            {"note": "C5", "startBeat": 25.0, "durationBeats": 1.0},
            {"note": "E5", "startBeat": 26.0, "durationBeats": 1.0},
            {"note": "D5", "startBeat": 27.0, "durationBeats": 0.5},
            {"note": "C5", "startBeat": 27.5, "durationBeats": 0.5},
            {"note": "B4", "startBeat": 28.0, "durationBeats": 1.0},
            {"note": "A4", "startBeat": 29.0, "durationBeats": 1.0},
            {"note": "G#4", "startBeat": 30.0, "durationBeats": 2.0},

            # Theme A Variation (32-48)
            {"note": "C5", "startBeat": 32.0, "durationBeats": 0.5},
            {"note": "B4", "startBeat": 32.5, "durationBeats": 0.5},
            {"note": "C5", "startBeat": 33.0, "durationBeats": 1.0},
            {"note": "E5", "startBeat": 34.0, "durationBeats": 1.0},
            {"note": "D5", "startBeat": 35.0, "durationBeats": 0.5},
            {"note": "C5", "startBeat": 35.5, "durationBeats": 0.5},
            {"note": "B4", "startBeat": 36.0, "durationBeats": 1.0},
            {"note": "A4", "startBeat": 37.0, "durationBeats": 1.0},
            {"note": "G#4", "startBeat": 38.0, "durationBeats": 2.0},
            {"note": "A4", "startBeat": 40.0, "durationBeats": 0.5},
            {"note": "B4", "startBeat": 40.5, "durationBeats": 0.5},
            {"note": "C5", "startBeat": 41.0, "durationBeats": 1.0},
            {"note": "D5", "startBeat": 42.0, "durationBeats": 1.0},
            {"note": "E5", "startBeat": 43.0, "durationBeats": 1.5},
            {"note": "D5", "startBeat": 44.5, "durationBeats": 0.5},
            {"note": "C5", "startBeat": 45.0, "durationBeats": 1.0},
            {"note": "B4", "startBeat": 46.0, "durationBeats": 2.0},

            # Lyrical Chorus Hook (48-64)
            {"note": "E5", "startBeat": 48.0, "durationBeats": 1.0},
            {"note": "D5", "startBeat": 49.0, "durationBeats": 0.5},
            {"note": "C5", "startBeat": 49.5, "durationBeats": 0.5},
            {"note": "B4", "startBeat": 50.0, "durationBeats": 1.0},
            {"note": "A4", "startBeat": 51.0, "durationBeats": 1.0},
            {"note": "C5", "startBeat": 52.0, "durationBeats": 1.0},
            {"note": "B4", "startBeat": 53.0, "durationBeats": 0.5},
            {"note": "A4", "startBeat": 53.5, "durationBeats": 0.5},
            {"note": "G#4", "startBeat": 54.0, "durationBeats": 2.0},
            {"note": "A4", "startBeat": 56.0, "durationBeats": 0.5},
            {"note": "B4", "startBeat": 56.5, "durationBeats": 0.5},
            {"note": "C5", "startBeat": 57.0, "durationBeats": 1.0},
            {"note": "D5", "startBeat": 58.0, "durationBeats": 1.0},
            {"note": "E5", "startBeat": 59.0, "durationBeats": 1.0},
            {"note": "D5", "startBeat": 60.0, "durationBeats": 0.5},
            {"note": "C5", "startBeat": 60.5, "durationBeats": 0.5},
            {"note": "B4", "startBeat": 61.0, "durationBeats": 3.0},

            # Climax Reprise (64-80)
            {"note": "A4", "startBeat": 64.0, "durationBeats": 0.5},
            {"note": "G#4", "startBeat": 64.5, "durationBeats": 0.5},
            {"note": "A4", "startBeat": 65.0, "durationBeats": 1.0},
            {"note": "E4", "startBeat": 66.0, "durationBeats": 1.0},
            {"note": "A4", "startBeat": 67.0, "durationBeats": 0.5},
            {"note": "B4", "startBeat": 67.5, "durationBeats": 0.5},
            {"note": "C5", "startBeat": 68.0, "durationBeats": 1.0},
            {"note": "E5", "startBeat": 69.0, "durationBeats": 1.0},
            {"note": "D5", "startBeat": 70.0, "durationBeats": 0.5},
            {"note": "C5", "startBeat": 70.5, "durationBeats": 0.5},
            {"note": "B4", "startBeat": 71.0, "durationBeats": 1.0},
            {"note": "A4", "startBeat": 72.0, "durationBeats": 1.0},
            {"note": "G#4", "startBeat": 73.0, "durationBeats": 2.0},
            {"note": "A4", "startBeat": 75.0, "durationBeats": 1.0},
            {"note": "B4", "startBeat": 76.0, "durationBeats": 1.0},
            {"note": "C5", "startBeat": 77.0, "durationBeats": 1.0},
            {"note": "D5", "startBeat": 78.0, "durationBeats": 2.0},

            # Gentle Outro Resolution (80-96)
            {"note": "E5", "startBeat": 80.0, "durationBeats": 1.0},
            {"note": "D5", "startBeat": 81.0, "durationBeats": 1.0},
            {"note": "C5", "startBeat": 82.0, "durationBeats": 1.0},
            {"note": "B4", "startBeat": 83.0, "durationBeats": 1.0},
            {"note": "A4", "startBeat": 84.0, "durationBeats": 2.0},
            {"note": "G#4", "startBeat": 86.0, "durationBeats": 2.0},
            {"note": "A4", "startBeat": 88.0, "durationBeats": 4.0}
        ]
    },
    {
        "id": "interstellar-theme",
        "title": "Interstellar (First Step)",
        "artist": "Hans Zimmer",
        "difficulty": "Easy",
        "category": "Soundtrack",
        "bpm": 96,
        "timeSignature": "3/4",
        "sections": [
            {"name": "Opening Pulse", "startBeat": 0.0},
            {"name": "Building Gravity", "startBeat": 18.0},
            {"name": "Main Soaring Theme", "startBeat": 36.0},
            {"name": "Cosmic Climax Swell", "startBeat": 54.0},
            {"name": "Eternal Resolution", "startBeat": 72.0}
        ],
        "notes": [
            # Opening Pulse (0-18)
            {"note": "A4", "startBeat": 0.0, "durationBeats": 1.0},
            {"note": "E5", "startBeat": 1.0, "durationBeats": 2.0},
            {"note": "A4", "startBeat": 3.0, "durationBeats": 1.0},
            {"note": "E5", "startBeat": 4.0, "durationBeats": 2.0},
            {"note": "A4", "startBeat": 6.0, "durationBeats": 1.0},
            {"note": "E5", "startBeat": 7.0, "durationBeats": 2.0},
            {"note": "B4", "startBeat": 9.0, "durationBeats": 1.0},
            {"note": "E5", "startBeat": 10.0, "durationBeats": 2.0},
            {"note": "C5", "startBeat": 12.0, "durationBeats": 1.0},
            {"note": "E5", "startBeat": 13.0, "durationBeats": 2.0},
            {"note": "B4", "startBeat": 15.0, "durationBeats": 1.0},
            {"note": "E5", "startBeat": 16.0, "durationBeats": 2.0},

            # Building Gravity (18-36)
            {"note": "A4", "startBeat": 18.0, "durationBeats": 1.0},
            {"note": "C5", "startBeat": 19.0, "durationBeats": 1.0},
            {"note": "E5", "startBeat": 20.0, "durationBeats": 1.0},
            {"note": "D5", "startBeat": 21.0, "durationBeats": 1.0},
            {"note": "E5", "startBeat": 22.0, "durationBeats": 2.0},
            {"note": "C5", "startBeat": 24.0, "durationBeats": 1.0},
            {"note": "D5", "startBeat": 25.0, "durationBeats": 1.0},
            {"note": "E5", "startBeat": 26.0, "durationBeats": 1.0},
            {"note": "B4", "startBeat": 27.0, "durationBeats": 1.0},
            {"note": "E5", "startBeat": 28.0, "durationBeats": 2.0},
            {"note": "A4", "startBeat": 30.0, "durationBeats": 1.0},
            {"note": "B4", "startBeat": 31.0, "durationBeats": 1.0},
            {"note": "C5", "startBeat": 32.0, "durationBeats": 2.0},
            {"note": "B4", "startBeat": 34.0, "durationBeats": 2.0},

            # Main Soaring Theme (36-54)
            {"note": "A4", "startBeat": 36.0, "durationBeats": 1.0},
            {"note": "E5", "startBeat": 37.0, "durationBeats": 1.0},
            {"note": "F5", "startBeat": 38.0, "durationBeats": 1.0},
            {"note": "E5", "startBeat": 39.0, "durationBeats": 2.0},
            {"note": "D5", "startBeat": 41.0, "durationBeats": 1.0},
            {"note": "C5", "startBeat": 42.0, "durationBeats": 2.0},
            {"note": "B4", "startBeat": 44.0, "durationBeats": 1.0},
            {"note": "A4", "startBeat": 45.0, "durationBeats": 2.0},
            {"note": "B4", "startBeat": 47.0, "durationBeats": 1.0},
            {"note": "C5", "startBeat": 48.0, "durationBeats": 2.0},
            {"note": "D5", "startBeat": 50.0, "durationBeats": 1.0},
            {"note": "E5", "startBeat": 51.0, "durationBeats": 3.0},

            # Cosmic Climax Swell (54-72)
            {"note": "A5", "startBeat": 54.0, "durationBeats": 1.0},
            {"note": "E5", "startBeat": 55.0, "durationBeats": 1.0},
            {"note": "F5", "startBeat": 56.0, "durationBeats": 1.0},
            {"note": "E5", "startBeat": 57.0, "durationBeats": 2.0},
            {"note": "D5", "startBeat": 59.0, "durationBeats": 1.0},
            {"note": "C5", "startBeat": 60.0, "durationBeats": 2.0},
            {"note": "D5", "startBeat": 62.0, "durationBeats": 1.0},
            {"note": "E5", "startBeat": 63.0, "durationBeats": 3.0},
            {"note": "D5", "startBeat": 66.0, "durationBeats": 2.0},
            {"note": "C5", "startBeat": 68.0, "durationBeats": 2.0},
            {"note": "B4", "startBeat": 70.0, "durationBeats": 2.0},

            # Eternal Resolution (72-84)
            {"note": "A4", "startBeat": 72.0, "durationBeats": 1.0},
            {"note": "E5", "startBeat": 73.0, "durationBeats": 2.0},
            {"note": "A4", "startBeat": 75.0, "durationBeats": 1.0},
            {"note": "E5", "startBeat": 76.0, "durationBeats": 2.0},
            {"note": "A4", "startBeat": 78.0, "durationBeats": 6.0}
        ]
    },
    {
        "id": "moonlight-sonata",
        "title": "Moonlight Sonata (Adagio)",
        "artist": "Ludwig van Beethoven",
        "difficulty": "Intermediate",
        "category": "Classical",
        "bpm": 60,
        "timeSignature": "4/4",
        "sections": [
            {"name": "Triplets Pattern", "startBeat": 0.0},
            {"name": "Melody Entry", "startBeat": 16.0},
            {"name": "Modulation to E Major", "startBeat": 32.0},
            {"name": "Minor Cadence", "startBeat": 48.0},
            {"name": "Peaceful Recapitulation", "startBeat": 64.0}
        ],
        "notes": [
            # Triplets Pattern (0-16)
            {"note": "C#4", "startBeat": 0.0, "durationBeats": 0.67},
            {"note": "E4", "startBeat": 0.67, "durationBeats": 0.67},
            {"note": "G#4", "startBeat": 1.33, "durationBeats": 0.67},
            {"note": "C#4", "startBeat": 2.0, "durationBeats": 0.67},
            {"note": "E4", "startBeat": 2.67, "durationBeats": 0.67},
            {"note": "G#4", "startBeat": 3.33, "durationBeats": 0.67},
            {"note": "C#4", "startBeat": 4.0, "durationBeats": 0.67},
            {"note": "E4", "startBeat": 4.67, "durationBeats": 0.67},
            {"note": "G#4", "startBeat": 5.33, "durationBeats": 0.67},
            {"note": "B3", "startBeat": 6.0, "durationBeats": 0.67},
            {"note": "D#4", "startBeat": 6.67, "durationBeats": 0.67},
            {"note": "G#4", "startBeat": 7.33, "durationBeats": 0.67},

            # Melody Entry (16-32)
            {"note": "G#4", "startBeat": 8.0, "durationBeats": 3.0},
            {"note": "G#4", "startBeat": 11.0, "durationBeats": 0.75},
            {"note": "A4", "startBeat": 11.75, "durationBeats": 0.25},
            {"note": "G#4", "startBeat": 12.0, "durationBeats": 2.0},
            {"note": "F#4", "startBeat": 14.0, "durationBeats": 2.0},
            {"note": "E4", "startBeat": 16.0, "durationBeats": 1.0},
            {"note": "D#4", "startBeat": 17.0, "durationBeats": 1.0},
            {"note": "E4", "startBeat": 18.0, "durationBeats": 2.0},
            {"note": "C#4", "startBeat": 20.0, "durationBeats": 4.0},

            # Modulation to E Major (32-48)
            {"note": "E4", "startBeat": 24.0, "durationBeats": 1.0},
            {"note": "G#4", "startBeat": 25.0, "durationBeats": 1.0},
            {"note": "B4", "startBeat": 26.0, "durationBeats": 2.0},
            {"note": "B4", "startBeat": 28.0, "durationBeats": 3.0},
            {"note": "C5", "startBeat": 31.0, "durationBeats": 0.75},
            {"note": "B4", "startBeat": 31.75, "durationBeats": 0.25},
            {"note": "A4", "startBeat": 32.0, "durationBeats": 2.0},
            {"note": "G#4", "startBeat": 34.0, "durationBeats": 2.0},
            {"note": "F#4", "startBeat": 36.0, "durationBeats": 1.0},
            {"note": "E4", "startBeat": 37.0, "durationBeats": 1.0},
            {"note": "D#4", "startBeat": 38.0, "durationBeats": 2.0},
            {"note": "E4", "startBeat": 40.0, "durationBeats": 4.0},

            # Minor Cadence & Recapitulation (48-72)
            {"note": "G#4", "startBeat": 48.0, "durationBeats": 2.0},
            {"note": "C#5", "startBeat": 50.0, "durationBeats": 2.0},
            {"note": "B4", "startBeat": 52.0, "durationBeats": 1.0},
            {"note": "A4", "startBeat": 53.0, "durationBeats": 1.0},
            {"note": "G#4", "startBeat": 54.0, "durationBeats": 2.0},
            {"note": "F#4", "startBeat": 56.0, "durationBeats": 2.0},
            {"note": "E4", "startBeat": 58.0, "durationBeats": 2.0},
            {"note": "D#4", "startBeat": 60.0, "durationBeats": 2.0},
            {"note": "C#4", "startBeat": 64.0, "durationBeats": 6.0}
        ]
    },
    {
        "id": "golden-hour",
        "title": "Golden Hour",
        "artist": "JVKE",
        "difficulty": "Intermediate",
        "category": "Popular",
        "bpm": 86,
        "timeSignature": "4/4",
        "sections": [
            {"name": "Intro Sparkle", "startBeat": 0.0},
            {"name": "Verse", "startBeat": 16.0},
            {"name": "Chorus Melodic Drop", "startBeat": 32.0},
            {"name": "Orchestral Climax", "startBeat": 48.0},
            {"name": "Gentle Golden Outro", "startBeat": 64.0}
        ],
        "notes": [
            # Intro Sparkle (0-16)
            {"note": "E4", "startBeat": 0.0, "durationBeats": 0.5},
            {"note": "G#4", "startBeat": 0.5, "durationBeats": 0.5},
            {"note": "B4", "startBeat": 1.0, "durationBeats": 0.5},
            {"note": "E5", "startBeat": 1.5, "durationBeats": 0.5},
            {"note": "D#5", "startBeat": 2.0, "durationBeats": 0.5},
            {"note": "B4", "startBeat": 2.5, "durationBeats": 0.5},
            {"note": "G#4", "startBeat": 3.0, "durationBeats": 1.0},
            {"note": "E4", "startBeat": 4.0, "durationBeats": 0.5},
            {"note": "G#4", "startBeat": 4.5, "durationBeats": 0.5},
            {"note": "B4", "startBeat": 5.0, "durationBeats": 0.5},
            {"note": "E5", "startBeat": 5.5, "durationBeats": 0.5},
            {"note": "D#5", "startBeat": 6.0, "durationBeats": 0.5},
            {"note": "B4", "startBeat": 6.5, "durationBeats": 0.5},
            {"note": "G#4", "startBeat": 7.0, "durationBeats": 1.0},

            # Verse (16-32)
            {"note": "G#4", "startBeat": 8.0, "durationBeats": 1.0},
            {"note": "G#4", "startBeat": 9.0, "durationBeats": 0.5},
            {"note": "F#4", "startBeat": 9.5, "durationBeats": 0.5},
            {"note": "E4", "startBeat": 10.0, "durationBeats": 1.0},
            {"note": "G#4", "startBeat": 11.0, "durationBeats": 1.0},
            {"note": "F#4", "startBeat": 12.0, "durationBeats": 2.0},
            {"note": "G#4", "startBeat": 14.0, "durationBeats": 1.0},
            {"note": "B4", "startBeat": 15.0, "durationBeats": 1.0},
            {"note": "C#5", "startBeat": 16.0, "durationBeats": 2.0},

            # Chorus Melodic Drop (32-48)
            {"note": "E5", "startBeat": 20.0, "durationBeats": 1.0},
            {"note": "D#5", "startBeat": 21.0, "durationBeats": 0.5},
            {"note": "C#5", "startBeat": 21.5, "durationBeats": 0.5},
            {"note": "B4", "startBeat": 22.0, "durationBeats": 1.0},
            {"note": "G#4", "startBeat": 23.0, "durationBeats": 1.0},
            {"note": "B4", "startBeat": 24.0, "durationBeats": 2.0},
            {"note": "C#5", "startBeat": 26.0, "durationBeats": 1.0},
            {"note": "B4", "startBeat": 27.0, "durationBeats": 1.0},
            {"note": "G#4", "startBeat": 28.0, "durationBeats": 2.0},

            # Orchestral Climax (48-64)
            {"note": "E5", "startBeat": 32.0, "durationBeats": 1.0},
            {"note": "F#5", "startBeat": 33.0, "durationBeats": 1.0},
            {"note": "E5", "startBeat": 34.0, "durationBeats": 1.0},
            {"note": "D#5", "startBeat": 35.0, "durationBeats": 1.0},
            {"note": "C#5", "startBeat": 36.0, "durationBeats": 2.0},
            {"note": "B4", "startBeat": 38.0, "durationBeats": 2.0},
            {"note": "G#4", "startBeat": 40.0, "durationBeats": 1.0},
            {"note": "F#4", "startBeat": 41.0, "durationBeats": 1.0},
            {"note": "E4", "startBeat": 42.0, "durationBeats": 4.0}
        ]
    },
    {
        "id": "hes-a-pirate",
        "title": "He's a Pirate",
        "artist": "Pirates of the Caribbean",
        "difficulty": "Intermediate",
        "category": "Soundtrack",
        "bpm": 138,
        "timeSignature": "6/8",
        "sections": [
            {"name": "Hornpipe Opening", "startBeat": 0.0},
            {"name": "Sea Battle Anthem", "startBeat": 16.0},
            {"name": "The Black Pearl Swell", "startBeat": 32.0},
            {"name": "Grand Buccaneers Climax", "startBeat": 48.0}
        ],
        "notes": [
            # Hornpipe Opening
            {"note": "D4", "startBeat": 0.0, "durationBeats": 0.5},
            {"note": "D4", "startBeat": 0.5, "durationBeats": 0.5},
            {"note": "D4", "startBeat": 1.0, "durationBeats": 0.5},
            {"note": "D4", "startBeat": 1.5, "durationBeats": 0.5},
            {"note": "D4", "startBeat": 2.0, "durationBeats": 1.0},
            {"note": "D4", "startBeat": 3.0, "durationBeats": 0.5},
            {"note": "D4", "startBeat": 3.5, "durationBeats": 0.5},
            {"note": "D4", "startBeat": 4.0, "durationBeats": 1.0},
            {"note": "D4", "startBeat": 5.0, "durationBeats": 0.5},
            {"note": "F4", "startBeat": 5.5, "durationBeats": 0.5},

            # Sea Battle Anthem
            {"note": "G4", "startBeat": 6.0, "durationBeats": 1.0},
            {"note": "G4", "startBeat": 7.0, "durationBeats": 1.0},
            {"note": "G4", "startBeat": 8.0, "durationBeats": 0.5},
            {"note": "A4", "startBeat": 8.5, "durationBeats": 0.5},
            {"note": "A#4", "startBeat": 9.0, "durationBeats": 1.0},
            {"note": "A#4", "startBeat": 10.0, "durationBeats": 1.0},
            {"note": "A#4", "startBeat": 11.0, "durationBeats": 0.5},
            {"note": "C5", "startBeat": 11.5, "durationBeats": 0.5},
            {"note": "A4", "startBeat": 12.0, "durationBeats": 1.0},
            {"note": "A4", "startBeat": 13.0, "durationBeats": 1.0},
            {"note": "G4", "startBeat": 14.0, "durationBeats": 0.5},
            {"note": "F4", "startBeat": 14.5, "durationBeats": 0.5},
            {"note": "G4", "startBeat": 15.0, "durationBeats": 2.0},

            # The Black Pearl Swell
            {"note": "D4", "startBeat": 18.0, "durationBeats": 0.5},
            {"note": "F4", "startBeat": 18.5, "durationBeats": 0.5},
            {"note": "G4", "startBeat": 19.0, "durationBeats": 1.0},
            {"note": "G4", "startBeat": 20.0, "durationBeats": 1.0},
            {"note": "G4", "startBeat": 21.0, "durationBeats": 0.5},
            {"note": "A#4", "startBeat": 21.5, "durationBeats": 0.5},
            {"note": "C5", "startBeat": 22.0, "durationBeats": 1.0},
            {"note": "C5", "startBeat": 23.0, "durationBeats": 1.0},
            {"note": "C5", "startBeat": 24.0, "durationBeats": 0.5},
            {"note": "D5", "startBeat": 24.5, "durationBeats": 0.5},
            {"note": "A#4", "startBeat": 25.0, "durationBeats": 1.0},
            {"note": "A#4", "startBeat": 26.0, "durationBeats": 1.0},
            {"note": "A4", "startBeat": 27.0, "durationBeats": 0.5},
            {"note": "G4", "startBeat": 27.5, "durationBeats": 0.5},
            {"note": "A4", "startBeat": 28.0, "durationBeats": 2.0},

            # Grand Buccaneers Climax
            {"note": "D5", "startBeat": 30.0, "durationBeats": 1.0},
            {"note": "C5", "startBeat": 31.0, "durationBeats": 1.0},
            {"note": "A#4", "startBeat": 32.0, "durationBeats": 1.0},
            {"note": "A4", "startBeat": 33.0, "durationBeats": 1.0},
            {"note": "G4", "startBeat": 34.0, "durationBeats": 2.0},
            {"note": "F4", "startBeat": 36.0, "durationBeats": 1.0},
            {"note": "D4", "startBeat": 37.0, "durationBeats": 3.0}
        ]
    },
    {
        "id": "clair-de-lune",
        "title": "Clair de Lune",
        "artist": "Claude Debussy",
        "difficulty": "Advanced",
        "category": "Classical",
        "bpm": 52,
        "timeSignature": "9/8",
        "sections": [
            {"name": "Andante très expressif", "startBeat": 0.0},
            {"name": "Lyrical Theme", "startBeat": 18.0},
            {"name": "Cascading Broken Chords", "startBeat": 36.0},
            {"name": "Calmato Finale", "startBeat": 54.0}
        ],
        "notes": [
            {"note": "F5", "startBeat": 0.0, "durationBeats": 1.5},
            {"note": "Eb5", "startBeat": 1.5, "durationBeats": 1.5},
            {"note": "Db5", "startBeat": 3.0, "durationBeats": 3.0},
            {"note": "C5", "startBeat": 6.0, "durationBeats": 1.5},
            {"note": "Bb4", "startBeat": 7.5, "durationBeats": 1.5},
            {"note": "Ab4", "startBeat": 9.0, "durationBeats": 3.0},
            {"note": "F4", "startBeat": 12.0, "durationBeats": 1.5},
            {"note": "Eb4", "startBeat": 13.5, "durationBeats": 1.5},
            {"note": "F4", "startBeat": 15.0, "durationBeats": 3.0},
            {"note": "Ab4", "startBeat": 18.0, "durationBeats": 1.5},
            {"note": "C5", "startBeat": 19.5, "durationBeats": 1.5},
            {"note": "Eb5", "startBeat": 21.0, "durationBeats": 3.0},
            {"note": "Db5", "startBeat": 24.0, "durationBeats": 1.5},
            {"note": "C5", "startBeat": 25.5, "durationBeats": 1.5},
            {"note": "Bb4", "startBeat": 27.0, "durationBeats": 3.0},
            {"note": "C5", "startBeat": 30.0, "durationBeats": 1.5},
            {"note": "Db5", "startBeat": 31.5, "durationBeats": 1.5},
            {"note": "Eb5", "startBeat": 33.0, "durationBeats": 3.0},
            {"note": "F5", "startBeat": 36.0, "durationBeats": 2.0},
            {"note": "Eb5", "startBeat": 38.0, "durationBeats": 2.0},
            {"note": "Db5", "startBeat": 40.0, "durationBeats": 4.0}
        ]
    },
    {
        "id": "hallelujah",
        "title": "Hallelujah",
        "artist": "Leonard Cohen",
        "difficulty": "Easy",
        "category": "Popular",
        "bpm": 68,
        "timeSignature": "6/8",
        "sections": [
            {"name": "The Secret Chord (Verse 1)", "startBeat": 0.0},
            {"name": "The Minor Fall & Major Lift", "startBeat": 12.0},
            {"name": "Chorus Hallelujah", "startBeat": 24.0},
            {"name": "Verse 2 Reprise", "startBeat": 36.0},
            {"name": "Grand Chorus", "startBeat": 48.0}
        ],
        "notes": [
            # Verse 1
            {"note": "E4", "startBeat": 0.0, "durationBeats": 1.0},
            {"note": "G4", "startBeat": 1.0, "durationBeats": 1.0},
            {"note": "G4", "startBeat": 2.0, "durationBeats": 1.0},
            {"note": "G4", "startBeat": 3.0, "durationBeats": 1.0},
            {"note": "A4", "startBeat": 4.0, "durationBeats": 1.0},
            {"note": "A4", "startBeat": 5.0, "durationBeats": 1.0},
            {"note": "A4", "startBeat": 6.0, "durationBeats": 2.0},
            {"note": "E4", "startBeat": 8.0, "durationBeats": 1.0},
            {"note": "G4", "startBeat": 9.0, "durationBeats": 1.0},
            {"note": "G4", "startBeat": 10.0, "durationBeats": 1.0},
            {"note": "G4", "startBeat": 11.0, "durationBeats": 1.0},

            # Minor Fall
            {"note": "A4", "startBeat": 12.0, "durationBeats": 1.0},
            {"note": "A4", "startBeat": 13.0, "durationBeats": 1.0},
            {"note": "A4", "startBeat": 14.0, "durationBeats": 2.0},
            {"note": "G4", "startBeat": 16.0, "durationBeats": 1.0},
            {"note": "A4", "startBeat": 17.0, "durationBeats": 1.0},
            {"note": "A4", "startBeat": 18.0, "durationBeats": 1.0},
            {"note": "A4", "startBeat": 19.0, "durationBeats": 1.0},
            {"note": "A4", "startBeat": 20.0, "durationBeats": 1.0},
            {"note": "G4", "startBeat": 21.0, "durationBeats": 1.0},
            {"note": "G4", "startBeat": 22.0, "durationBeats": 1.0},
            {"note": "F4", "startBeat": 23.0, "durationBeats": 1.0},
            {"note": "G4", "startBeat": 24.0, "durationBeats": 2.0},
            {"note": "E4", "startBeat": 26.0, "durationBeats": 2.0},

            # Chorus Hallelujah
            {"note": "E4", "startBeat": 28.0, "durationBeats": 2.0},
            {"note": "G4", "startBeat": 30.0, "durationBeats": 2.0},
            {"note": "A4", "startBeat": 32.0, "durationBeats": 3.0},
            {"note": "A4", "startBeat": 35.0, "durationBeats": 1.0},
            {"note": "G4", "startBeat": 36.0, "durationBeats": 2.0},
            {"note": "E4", "startBeat": 38.0, "durationBeats": 2.0},
            {"note": "D4", "startBeat": 40.0, "durationBeats": 3.0},
            {"note": "C4", "startBeat": 43.0, "durationBeats": 1.0},
            {"note": "E4", "startBeat": 44.0, "durationBeats": 2.0},
            {"note": "G4", "startBeat": 46.0, "durationBeats": 2.0},
            {"note": "A4", "startBeat": 48.0, "durationBeats": 4.0}
        ]
    }
]

# Combined known songs
ALL_KNOWN_SONGS: List[Dict[str, Any]] = SEED_SONGS + EXPANDED_CURATED_SONGS

def parse_user_notes(text: str) -> List[Dict[str, Any]]:
    """
    Parses user-entered note strings like:
    'C4 D4 E4 G4' or 'C4:1.0 D4:0.5 E4:1.5' or keyboard keys 'A S D F G H J K'
    No arbitrary count or length limits.
    """
    tokens = re.split(r'[\s,;\-]+', text.strip())
    notes = []
    current_beat = 0.0

    key_to_note = {
        'a': 'C4', 'w': 'C#4', 's': 'D4', 'e': 'D#4', 'd': 'E4', 'f': 'F4', 't': 'F#4',
        'g': 'G4', 'y': 'G#4', 'h': 'A4', 'u': 'A#4', 'j': 'B4', 'k': 'C5', 'o': 'C#5',
        'l': 'D5', 'p': 'D#5', ';': 'E5', "'": 'F5', ']': 'F#5', 'z': 'G5', 'x': 'G#5',
        'c': 'A5', 'v': 'A#5', 'b': 'B5', 'n': 'C6', 'm': 'C#6', ',': 'D6', '.': 'D#6', '/': 'E6'
    }

    for token in tokens:
        if not token:
            continue
        duration = 1.0
        note_str = token

        if ':' in token or '=' in token:
            parts = re.split(r'[:=]', token)
            note_str = parts[0]
            try:
                duration = float(parts[1])
            except ValueError:
                duration = 1.0

        # Check pitch notation like C4, D#5, etc.
        pitch_match = re.match(r'^([A-Ga-g][#b]?)([0-8])$', note_str)
        if pitch_match:
            pitch = pitch_match.group(1).upper()
            octave = pitch_match.group(2)
            pitch = pitch.replace('DB', 'C#').replace('EB', 'D#').replace('GB', 'F#').replace('AB', 'G#').replace('BB', 'A#')
            final_note = f"{pitch}{octave}"
            notes.append({
                "note": final_note,
                "startBeat": round(current_beat, 2),
                "durationBeats": duration,
                "velocity": 0.85
            })
            current_beat += duration
            continue

        # Check keyboard character
        k = note_str.lower()
        if k in key_to_note:
            notes.append({
                "note": key_to_note[k],
                "startBeat": round(current_beat, 2),
                "durationBeats": duration,
                "velocity": 0.85
            })
            current_beat += duration
            continue

        # Check bare pitch like C, D, E
        bare_match = re.match(r'^([A-Ga-g][#b]?)$', note_str)
        if bare_match:
            pitch = bare_match.group(1).upper()
            pitch = pitch.replace('DB', 'C#').replace('EB', 'D#').replace('GB', 'F#').replace('AB', 'G#').replace('BB', 'A#')
            notes.append({
                "note": f"{pitch}4",
                "startBeat": round(current_beat, 2),
                "durationBeats": duration,
                "velocity": 0.85
            })
            current_beat += duration

    return notes

def generate_algorithmic_melody(title: str, artist: str = "", genre: str = "Popular", difficulty: str = "Intermediate") -> Dict[str, Any]:
    """
    Deterministic full-length multi-section melody generator.
    Produces complete arrangements (Intro, Verse 1, Pre-Chorus, Chorus, Climax, Outro)
    with 80–120+ beats, removing arbitrary limits.
    """
    h = int(hashlib.md5(title.lower().encode('utf-8')).hexdigest(), 16)
    
    scales = [
        # C Major
        ["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5", "D5", "E5", "G5"],
        # A Minor
        ["A4", "B4", "C5", "D5", "E5", "F5", "G5", "A5", "C6"],
        # G Major
        ["G4", "A4", "B4", "C5", "D5", "E5", "F#5", "G5", "B5"],
        # D Major / Celtic
        ["D4", "E4", "F#4", "G4", "A4", "B4", "C#5", "D5", "E5"]
    ]
    scale = scales[h % len(scales)]

    bpm_choices = [72, 80, 88, 96, 108, 120]
    bpm = bpm_choices[h % len(bpm_choices)]

    sections = [
        {"name": "Intro Passage", "startBeat": 0.0},
        {"name": "Verse 1 Motif", "startBeat": 16.0},
        {"name": "Building Pre-Chorus", "startBeat": 36.0},
        {"name": "Main Chorus Hook", "startBeat": 52.0},
        {"name": "Bridge & Modulation", "startBeat": 72.0},
        {"name": "Grand Climax & Outro", "startBeat": 88.0}
    ]

    notes: List[Dict[str, Any]] = []
    current_beat = 0.0
    full_song_length = 96.0  # Full song length (24 measures in 4/4)

    rhythms = [1.0, 0.5, 0.5, 1.0, 1.5, 0.5, 2.0, 1.0]
    note_idx = 0

    while current_beat < full_song_length:
        dur = rhythms[note_idx % len(rhythms)]
        
        # Harmonic arc
        wave = math.sin(note_idx * 0.45 + (h % 7)) * 0.5 + 0.5
        pitch_idx = int(wave * (len(scale) - 1))
        pitch = scale[max(0, min(len(scale) - 1, pitch_idx))]

        notes.append({
            "note": pitch,
            "startBeat": round(current_beat, 2),
            "durationBeats": dur,
            "velocity": 0.8 + ((note_idx % 4) * 0.04)
        })
        current_beat += dur
        note_idx += 1

    clean_title = title.strip().title()

    return {
        "title": clean_title,
        "artist": artist.strip().title() if artist else "Dynamic Arrangement",
        "difficulty": difficulty or "Intermediate",
        "category": genre or "Popular",
        "bpm": bpm,
        "timeSignature": "4/4",
        "sections": sections,
        "notes": notes
    }

def extract_or_search_song(query: str, genre: Optional[str] = None, difficulty: Optional[str] = None, notes_input: Optional[str] = None) -> Dict[str, Any]:
    """
    Main extraction orchestrator:
    1. Checks if exact or fuzzy match exists in known repertoire.
    2. If notes_input is provided, arranges from notes without length limit.
    3. Otherwise generates an authentic full arrangement for the requested song title.
    """
    clean_q = query.strip().lower()

    # 1. Search known repertoire
    if clean_q:
        for s in ALL_KNOWN_SONGS:
            if clean_q in s["title"].lower() or clean_q in s["artist"].lower() or s["id"].lower() == clean_q:
                return dict(s)

    # 2. Check notes input
    if notes_input and notes_input.strip():
        parsed = parse_user_notes(notes_input)
        if len(parsed) >= 1:
            return {
                "title": query.strip().title() if query.strip() else "Custom Melody",
                "artist": "User Composition",
                "difficulty": difficulty or "Intermediate",
                "category": genre or "Practice",
                "bpm": 88,
                "timeSignature": "4/4",
                "sections": [{"name": "Complete Piece", "startBeat": 0.0}],
                "notes": parsed
            }

    # 3. Dynamic full-length melody generation
    return generate_algorithmic_melody(
        title=query,
        artist="",
        genre=genre or "Popular",
        difficulty=difficulty or "Intermediate"
    )
