from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid
import re

from database import get_db
from models.song import Song, ExtractSongRequest, CreateCustomSongRequest
from services.auth_service import get_optional_user
from services.midi_parser import parse_midi_file
from services.song_extractor import extract_or_search_song

router = APIRouter(prefix="/api/songs", tags=["songs"])

@router.get("", response_model=List[Song])
async def list_songs(
    category: Optional[str] = Query(None),
    difficulty: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    user: Optional[Dict[str, Any]] = Depends(get_optional_user)
):
    db = get_db()
    query: Dict[str, Any] = {}
    if category and category != "All":
        query["category"] = category
    if difficulty and difficulty != "All":
        query["difficulty"] = difficulty

    user_id = user["id"] if user else None
    
    songs = await db["songs"].find(query).to_list(length=200)
    
    results = []
    search_lower = search.lower().strip() if search else None

    for s in songs:
        is_private = s.get("is_private", False)
        owner_id = s.get("user_id")
        
        # Privacy check
        if is_private and (not user_id or owner_id != user_id):
            continue

        # Search check
        if search_lower:
            title_match = search_lower in s.get("title", "").lower()
            artist_match = search_lower in s.get("artist", "").lower()
            if not (title_match or artist_match):
                continue

        results.append(Song(**s))
            
    return results

@router.get("/{song_id}", response_model=Song)
async def get_song(song_id: str, user: Optional[Dict[str, Any]] = Depends(get_optional_user)):
    db = get_db()
    song_doc = await db["songs"].find_one({"id": song_id})
    if not song_doc:
        raise HTTPException(status_code=404, detail="Unable to load this song.")

    if song_doc.get("is_private"):
        if not user or user["id"] != song_doc.get("user_id"):
            raise HTTPException(status_code=403, detail="Access denied to private song.")

    return Song(**song_doc)

@router.post("/extract", response_model=Song)
async def extract_song(
    req: ExtractSongRequest,
    user: Optional[Dict[str, Any]] = Depends(get_optional_user)
):
    """
    Dynamically extracts, transcribes, or arranges any requested song title
    or melody notes into a playable piano lesson strictly within C4-E6.
    """
    db = get_db()
    query_clean = req.query.strip()
    if not query_clean:
        raise HTTPException(status_code=400, detail="Song title or query cannot be empty.")

    # Check if a song with a very similar title already exists in DB
    existing = await db["songs"].find_one({
        "title": {"$regex": f"^{re.escape(query_clean)}$", "$options": "i"}
    })
    if existing:
        return Song(**existing)

    # Perform melody extraction / arrangement
    try:
        song_data = extract_or_search_song(
            query=query_clean,
            genre=req.genre,
            difficulty=req.difficulty,
            notes_input=req.notes_input
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Melody extraction failed: {str(e)}")

    song_id = song_data.get("id") or f"ext-{uuid.uuid4().hex[:8]}"
    song_dict = {
        "id": song_id,
        "title": song_data["title"],
        "artist": song_data["artist"],
        "difficulty": song_data.get("difficulty", req.difficulty or "Intermediate"),
        "category": song_data.get("category", req.genre or "Popular"),
        "bpm": song_data.get("bpm", 88),
        "timeSignature": song_data.get("timeSignature", "4/4"),
        "sections": song_data.get("sections", [{"name": "Main Theme", "startBeat": 0.0}]),
        "notes": song_data["notes"],
        "is_private": False,
        "user_id": user["id"] if user else None,
        "created_at": datetime.utcnow().isoformat()
    }

    try:
        validated = Song(**song_dict)
    except Exception as err:
        raise HTTPException(status_code=422, detail=f"Generated song validation error: {err}")

    # Upsert into database
    await db["songs"].update_one(
        {"id": song_id},
        {"$set": song_dict},
        upsert=True
    )

    return validated

@router.post("/create", response_model=Song)
async def create_custom_song(
    req: CreateCustomSongRequest,
    user: Optional[Dict[str, Any]] = Depends(get_optional_user)
):
    """
    Saves a song recorded or composed live by the user on the keyboard.
    """
    db = get_db()
    song_id = f"custom-{uuid.uuid4().hex[:8]}"
    
    sections = req.sections or [{"name": "Live Performance", "startBeat": 0.0}]
    
    song_dict = {
        "id": song_id,
        "title": req.title.strip(),
        "artist": req.artist or (user["username"] if user else "Live Composer"),
        "difficulty": req.difficulty or "Easy",
        "category": req.category or "Practice",
        "bpm": req.bpm or 90,
        "timeSignature": "4/4",
        "sections": [s.model_dump() for s in sections],
        "notes": [n.model_dump() for n in req.notes],
        "is_private": False,
        "user_id": user["id"] if user else None,
        "created_at": datetime.utcnow().isoformat()
    }

    try:
        validated = Song(**song_dict)
    except Exception as err:
        raise HTTPException(status_code=422, detail=f"Invalid custom song data: {err}")

    await db["songs"].insert_one(song_dict)
    return validated

@router.post("/import", response_model=Song)
async def import_midi(
    file: UploadFile = File(...),
    user: Optional[Dict[str, Any]] = Depends(get_optional_user)
):
    """
    Frictionless MIDI file import: parses melody track, clamps to C4-E6,
    and returns a ready-to-learn piano piece for any user or guest!
    """
    if not file.filename.lower().endswith(('.mid', '.midi')):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload a standard MIDI (.mid/.midi) file.")

    content = await file.read()
    if len(content) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="MIDI file size exceeds 5MB limit.")

    try:
        parsed_data = parse_midi_file(content, filename=file.filename)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse MIDI file: {str(e)}")

    song_id = f"midi-{uuid.uuid4().hex[:8]}"
    song_dict = {
        "id": song_id,
        "title": parsed_data["title"],
        "artist": parsed_data["artist"],
        "difficulty": parsed_data["difficulty"],
        "category": parsed_data["category"],
        "bpm": parsed_data["bpm"],
        "timeSignature": parsed_data["timeSignature"],
        "sections": parsed_data["sections"],
        "notes": parsed_data["notes"],
        "is_private": False if not user else True,
        "user_id": user["id"] if user else None,
        "created_at": datetime.utcnow().isoformat()
    }

    try:
        validated_song = Song(**song_dict)
    except Exception as err:
        raise HTTPException(status_code=422, detail=f"Generated song structure was invalid: {err}")

    db = get_db()
    await db["songs"].insert_one(song_dict)
    return validated_song

def re_escape(s: str) -> str:
    import re
    return re.escape(s)
