# 🎹 Aura Piano — Concert Grand Interactive Learning Studio

[![Google Cloud Deployed](https://img.shields.io/badge/Google%20Cloud-Deployed%20Live-4285F4?style=flat&logo=googlecloud&logoColor=white)](https://aura-piano-studio.web.app)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live%20Demo-amber?style=flat&logo=github)](https://yukthashreegr15ganesh-hub.github.io/aura-piano/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> ☁️ **Google Cloud Live URL:** [https://aura-piano-studio.web.app](https://aura-piano-studio.web.app)  
> 🌐 **Alternative Firebase Mirror:** [https://aura-piano-studio.firebaseapp.com](https://aura-piano-studio.firebaseapp.com)  
> 🐙 **GitHub Pages Deployment:** [https://yukthashreegr15ganesh-hub.github.io/aura-piano/](https://yukthashreegr15ganesh-hub.github.io/aura-piano/)  
> 📂 **GitHub Repository:** [https://github.com/yukthashreegr15ganesh-hub/aura-piano](https://github.com/yukthashreegr15ganesh-hub/aura-piano)

A full-stack, production-grade interactive piano learning studio featuring falling notes, an ultra-low-latency Yamaha C5 Salamander Concert Grand audio engine, synchronized real-time karaoke accompaniment & melody guide, tailored practice analytics, and MIDI import.

---

## 🌟 Key Highlights & Capabilities

### 1. 🎵 Client-Side Ultra-Low-Latency Audio Engine
- **Tone.js Sampler** loaded with multi-velocity Yamaha C5 Salamander Concert Grand samples.
- Seamless automatic fallback to a warm polyphonic synthesizer if offline.
- Natural damper **sustain pedal on Spacebar** (holds ringing strings authentically).
- Dynamic touch velocity: keyboard key strikes default to 0.85; mouse and touch calculate vertical key strike position (pianissimo at key top, fortissimo at key lip).
- Microsecond Web Audio timing: `Tone.now()` clock drives audio scheduling, falling canvas notes, and key triggers in complete synchronization.

### 2. 🎤 Real-Time Karaoke Accompaniment & Song Melody
- **Synchronized Song Melody & Backing**: Plays the authentic melody and rich harmonic chords/bass for the chosen song (e.g. *River Flows in You*, *Interstellar*, *Golden Hour*, *Moonlight Sonata*, *Canon in D*, *He's a Pirate*, *Clair de Lune*, *Viva La Vida*, *Hallelujah*, etc.).
- **Dynamic Key Harmonizer**: Auto-detects tonal keys across 10 diatonic scale profiles for newly extracted or uploaded songs.
- **4 Arrangement Styles**:
  - *Cinematic* (rich orchestral chorus & sub-bass)
  - *Acoustic* (bright, intimate wooden warmth)
  - *Ambient* (ethereal spacious reverb & soft pads)
  - *Piano Duet* (natural companion acoustic piano register)
- **Karaoke Lyrics Ribbon**: Real-time syllable and lyric prompt ribbon for vocal sing-alongs.

### 3. 🔍 Dynamic Song Extraction & Unrestricted Learning
- **Dynamic Song Search**: Extract and generate complete piano arrangements with chords for any piece or artist on demand.
- **Continuous Looping & Octave Shifting**: Loop complex phrases continuously, and transpose -2 to +2 octaves with dedicated controls.
- **Interactive Repertoire Library**: Browse classical, pop, cinema, jazz, anime, and practice exercises with difficulty filters.

### 4. 🎨 Cinematic Concert Hall Visual Design
- 3D perspective concert stage with glossy black lacquer fallboard, golden brass nameplate inlay, and crimson red felt cloth buffer.
- Canvas-based 60fps piano roll with falling bronze/gold glass bars, luminous target baseline, and spark particles on key impact.
- Realistic ivory and ebony keys with physical depress depth, ambient shadow compression, and warm spotlight illumination.

### 5. 🎹 Full 2-Octave Keyboard & MIDI Support
- **Keyboard Map (C4 to E6)**:
  - First octave: `A W S E D F T G Y H U J K` (C4 through C5)
  - Extended octave: `O L P ; ' ] Z X C V B N M , . /` (C#5 through E6)
- **Web MIDI API**: Plug and play hardware MIDI keyboard controllers with velocity sensitivity and CC64 sustain pedal support.

### 6. 🏆 Four Adaptive Musical Modes
- **Free Play**: Unrestricted virtuoso practice with dynamic ambient visual response.
- **Learn**: Pauses and waits for the exact key; gentle cues guide you without ever stopping or penalizing you.
- **Practice**: Continuous falling notes at adjustable tempo (50%, 75%, 100%, 125%).
- **Performance**: Millisecond timing judgment (*Perfect* < 80ms, *Good* < 180ms, *Miss*) with streak scoring.

### 7. 📊 Real Mistake Analytics & Tailored Feedback
- Identifies exact tricky bars, slip-up notes, and weak sections to formulate authentic practice drills.
- Confetti celebration bursts upon achieving mastery (>= 85% accuracy).

### 8. ⚡ FastAPI + Database Backend
- Seeded with 8 foundational classical repertoire songs.
- Server-side song schema validation and private song uploads.
- JWT authentication (`/api/auth/register`, `/api/auth/login`, `/api/auth/me`) with seamless offline guest synchronization.
- Custom MIDI file parser (`POST /api/songs/import`) using `mido`.

---

## 🛠️ Architecture & Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4, Framer Motion, Zustand, Tone.js |
| **Audio** | Web Audio API, Tone.js Sampler (Salamander Concert Grand), Tone.PolySynth, Tone.MonoSynth |
| **Graphics** | HTML5 Canvas (60 FPS requestAnimationFrame), CSS 3D Transforms, Canvas Confetti |
| **Backend** | Python 3.10+, FastAPI, Uvicorn, Pydantic, Mido (MIDI parsing), JSON / SQLite / MongoDB |
| **Deployment** | GitHub Pages (CI/CD via GitHub Actions), Vercel compatible |

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js 18+ (tested on Node 20 / 22 / 25)
- Python 3.10+

### 1. Clone the Repository
```bash
git clone https://github.com/yukthashreegr15ganesh-hub/aura-piano.git
cd aura-piano
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Backend Setup (Optional for cloud sync & MIDI import)
```bash
cd ../backend
pip install -r requirements.txt
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
Interactive API documentation will be available at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).

---

## 🌐 Live Deployment

The frontend runs 100% client-side with zero external latency on note strikes:
- **Production URL**: [https://yukthashreegr15ganesh-hub.github.io/aura-piano/](https://yukthashreegr15ganesh-hub.github.io/aura-piano/)
- Automated CI/CD workflow builds and deploys on every push to the `main` branch.

---

## 📄 License
This project is open-source and licensed under the [MIT License](LICENSE).
