import urllib.request
import urllib.parse
import json
import io
import mido
import time

BASE_URL = "http://127.0.0.1:8000/api"

def test_api():
    print("=== 1. Testing Health ===")
    req = urllib.request.urlopen(f"{BASE_URL}/health")
    health = json.loads(req.read().decode())
    print("Health response:", health)
    assert health["status"] == "healthy"

    print("\n=== 2. Testing Song Retrieval & Filtering ===")
    req = urllib.request.urlopen(f"{BASE_URL}/songs")
    all_songs = json.loads(req.read().decode())
    print(f"Total bundled songs retrieved: {len(all_songs)}")
    assert len(all_songs) == 8, f"Expected 8 songs, got {len(all_songs)}"

    # Filter Classical
    req = urllib.request.urlopen(f"{BASE_URL}/songs?category=Classical")
    classical = json.loads(req.read().decode())
    print(f"Classical songs count: {len(classical)}")
    assert len(classical) >= 3

    # Specific song
    req = urllib.request.urlopen(f"{BASE_URL}/songs/c-major-scale")
    c_scale = json.loads(req.read().decode())
    assert c_scale["id"] == "c-major-scale"
    print("Fetched 'c-major-scale' successfully!")

    print("\n=== 3. Testing Guest Session Recording ===")
    session_payload = {
        "song_id": "c-major-scale",
        "song_title": "C Major Scale Mastery",
        "mode": "performance",
        "speed": 1.0,
        "accuracy": 92.5,
        "correct": 14,
        "wrong": 1,
        "timing_accuracy": 94.0,
        "best_streak": 11,
        "duration_seconds": 25,
        "mistakes_by_note": {"B4": 1},
        "mistakes_by_section": {"Ascending Scale": 1},
        "practice_recommendation": "Great work! Focus on clean transition to B4."
    }
    data_bytes = json.dumps(session_payload).encode('utf-8')
    post_req = urllib.request.Request(
        f"{BASE_URL}/sessions",
        data=data_bytes,
        headers={"Content-Type": "application/json"}
    )
    res = urllib.request.urlopen(post_req)
    guest_session = json.loads(res.read().decode())
    print("Recorded guest session ID:", guest_session["id"])
    assert guest_session["accuracy"] == 92.5

    print("\n=== 4. Testing User Registration & Merging Guest Sessions ===")
    uname = f"chopin_{int(time.time())}"
    user_payload = {
        "username": uname,
        "email": f"{uname}@concert.org",
        "password": "secret_piano_key_123",
        "guest_sessions": [session_payload]
    }
    reg_bytes = json.dumps(user_payload).encode('utf-8')
    reg_req = urllib.request.Request(
        f"{BASE_URL}/auth/register",
        data=reg_bytes,
        headers={"Content-Type": "application/json"}
    )
    reg_res = urllib.request.urlopen(reg_req)
    auth_data = json.loads(reg_res.read().decode())
    token = auth_data["access_token"]
    user = auth_data["user"]
    print("Registered user:", user["username"], "ID:", user["id"])
    print("JWT Token acquired:", token[:24] + "...")

    print("\n=== 5. Testing /auth/me with JWT ===")
    me_req = urllib.request.Request(
        f"{BASE_URL}/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    me_res = urllib.request.urlopen(me_req)
    me_data = json.loads(me_res.read().decode())
    print("/auth/me verified user:", me_data["username"])
    assert me_data["username"] == uname

    print("\n=== 6. Testing Progress Summary ===")
    prog_req = urllib.request.Request(
        f"{BASE_URL}/progress",
        headers={"Authorization": f"Bearer {token}"}
    )
    prog_res = urllib.request.urlopen(prog_req)
    prog_data = json.loads(prog_res.read().decode())
    print("Progress data: total practice seconds =", prog_data["total_practice_time_seconds"])
    assert prog_data["total_practice_time_seconds"] >= 25
    assert len(prog_data["recent_sessions"]) >= 1

    print("\n=== 7. Testing Leaderboard ===")
    lb_req = urllib.request.urlopen(f"{BASE_URL}/leaderboard/c-major-scale?mode=performance")
    lb_data = json.loads(lb_req.read().decode())
    print(f"Leaderboard entries for 'c-major-scale': {len(lb_data)}")
    assert len(lb_data) >= 1

    print("\n=== 8. Testing MIDI File Creation and POST /songs/import ===")
    mid = mido.MidiFile(ticks_per_beat=480)
    track = mido.MidiTrack()
    mid.tracks.append(track)
    track.append(mido.MetaMessage('set_tempo', tempo=mido.bpm2tempo(110)))
    
    notes_to_add = [60, 64, 67, 72, 67, 64, 60]
    for n in notes_to_add:
        track.append(mido.Message('note_on', note=n, velocity=90, time=0))
        track.append(mido.Message('note_off', note=n, velocity=0, time=480))

    midi_bytes_io = io.BytesIO()
    mid.save(file=midi_bytes_io)
    midi_content = midi_bytes_io.getvalue()

    boundary = "----AuraPianoBoundary12345"
    body = (
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="file"; filename="nocturne_custom.mid"\r\n'
        f"Content-Type: audio/midi\r\n\r\n"
    ).encode('utf-8') + midi_content + f"\r\n--{boundary}--\r\n".encode('utf-8')

    import_req = urllib.request.Request(
        f"{BASE_URL}/songs/import",
        data=body,
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": f"multipart/form-data; boundary={boundary}"
        }
    )
    import_res = urllib.request.urlopen(import_req)
    imported_song = json.loads(import_res.read().decode())
    print("Imported Song result:")
    print(f" - Title: {imported_song['title']}")
    print(f" - BPM: {imported_song['bpm']}")
    print(f" - Total notes parsed & clamped: {len(imported_song['notes'])}")
    assert len(imported_song['notes']) == 7
    assert imported_song["is_private"] == True

    print("\n>>> ALL 8 BACKEND AND WORKFLOW TESTS PASSED PERFECTLY! <<<")

if __name__ == "__main__":
    test_api()
