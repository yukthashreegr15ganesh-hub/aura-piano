from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid

from database import get_db
from models.session import SessionCreate, SessionOut, ProgressSummary
from services.auth_service import get_optional_user, get_current_user

router = APIRouter(prefix="/api", tags=["sessions"])

@router.post("/sessions", response_model=SessionOut)
async def record_session(
    data: SessionCreate,
    user: Optional[Dict[str, Any]] = Depends(get_optional_user)
):
    db = get_db()
    session_id = str(uuid.uuid4())
    user_id = user["id"] if user else None
    username = user["username"] if user else "Guest Pianist"

    session_doc = {
        "_id": session_id,
        "id": session_id,
        "user_id": user_id,
        "username": username,
        "song_id": data.song_id,
        "song_title": data.song_title,
        "mode": data.mode,
        "speed": data.speed,
        "accuracy": data.accuracy,
        "correct": data.correct,
        "wrong": data.wrong,
        "timing_accuracy": data.timing_accuracy,
        "best_streak": data.best_streak,
        "duration_seconds": data.duration_seconds,
        "mistakes_by_note": data.mistakes_by_note,
        "mistakes_by_section": data.mistakes_by_section,
        "practice_recommendation": data.practice_recommendation,
        "created_at": datetime.utcnow().isoformat()
    }

    await db["sessions"].insert_one(session_doc)

    # If logged in user, update stats in user profile
    if user_id:
        await db["users"].update_one(
            {"_id": user_id},
            {"$inc": {"total_practice_time_seconds": data.duration_seconds}}
        )

    return SessionOut(
        id=session_id,
        user_id=user_id,
        username=username,
        song_id=data.song_id,
        song_title=data.song_title,
        mode=data.mode,
        speed=data.speed,
        accuracy=data.accuracy,
        correct=data.correct,
        wrong=data.wrong,
        timing_accuracy=data.timing_accuracy,
        best_streak=data.best_streak,
        duration_seconds=data.duration_seconds,
        mistakes_by_note=data.mistakes_by_note,
        mistakes_by_section=data.mistakes_by_section,
        practice_recommendation=data.practice_recommendation,
        created_at=datetime.fromisoformat(session_doc["created_at"])
    )

@router.get("/progress", response_model=ProgressSummary)
async def get_progress(user: Optional[Dict[str, Any]] = Depends(get_optional_user)):
    db = get_db()
    user_id = user["id"] if user else None

    # Fetch sessions for this user or all guest sessions if not logged in
    query = {"user_id": user_id} if user_id else {"user_id": None}
    cursor = db["sessions"].find(query).sort("created_at", -1)
    sessions_list = await cursor.to_list(length=100)

    total_practice = 0
    total_notes_played = 0
    accuracy_sum = 0.0
    best_map: Dict[str, Dict[str, Any]] = {}
    converted_sessions: List[SessionOut] = []

    for s in sessions_list:
        total_practice += s.get("duration_seconds", 0)
        total_notes_played += s.get("correct", 0) + s.get("wrong", 0)
        acc = s.get("accuracy", 0.0)
        accuracy_sum += acc

        # Best per song + mode
        key = f"{s.get('song_id')}_{s.get('mode')}"
        if key not in best_map or acc > best_map[key].get("accuracy", 0):
            best_map[key] = {
                "song_id": s.get("song_id"),
                "song_title": s.get("song_title"),
                "mode": s.get("mode"),
                "accuracy": acc,
                "timing_accuracy": s.get("timing_accuracy", 0),
                "best_streak": s.get("best_streak", 0),
                "created_at": s.get("created_at")
            }

        created_dt = datetime.fromisoformat(s["created_at"]) if isinstance(s.get("created_at"), str) else s.get("created_at") or datetime.utcnow()
        converted_sessions.append(
            SessionOut(
                id=str(s.get("_id", s.get("id"))),
                user_id=s.get("user_id"),
                username=s.get("username", "Guest"),
                song_id=s.get("song_id", ""),
                song_title=s.get("song_title", ""),
                mode=s.get("mode", ""),
                speed=s.get("speed", 1.0),
                accuracy=s.get("accuracy", 0.0),
                correct=s.get("correct", 0),
                wrong=s.get("wrong", 0),
                timing_accuracy=s.get("timing_accuracy", 0.0),
                best_streak=s.get("best_streak", 0),
                duration_seconds=s.get("duration_seconds", 0),
                mistakes_by_note=s.get("mistakes_by_note", {}),
                mistakes_by_section=s.get("mistakes_by_section", {}),
                practice_recommendation=s.get("practice_recommendation"),
                created_at=created_dt
            )
        )

    avg_acc = round(accuracy_sum / max(1, len(sessions_list)), 1)
    daily_streak = user.get("daily_streak", 1) if user else 1
    if user:
        total_practice = max(total_practice, user.get("total_practice_time_seconds", 0))

    return ProgressSummary(
        total_practice_time_seconds=total_practice,
        daily_streak=daily_streak,
        total_notes_played=total_notes_played,
        accuracy_average=avg_acc,
        best_performances=list(best_map.values()),
        recent_sessions=converted_sessions[:15]
    )
