from fastapi import APIRouter, Query
from typing import List, Dict, Any, Optional
from database import get_db

router = APIRouter(prefix="/api/leaderboard", tags=["leaderboard"])

@router.get("/{song_id}")
async def get_song_leaderboard(
    song_id: str,
    mode: str = Query("performance")
) -> List[Dict[str, Any]]:
    db = get_db()
    
    # Query sessions for this song & mode
    cursor = db["sessions"].find({"song_id": song_id, "mode": mode})
    all_sessions = await cursor.to_list(length=200)

    # Deduplicate by user so each user holds their highest personal score
    user_best: Dict[str, Dict[str, Any]] = {}
    for s in all_sessions:
        uname = s.get("username") or "Guest Pianist"
        uid = s.get("user_id") or f"guest-{s.get('_id')}"
        acc = s.get("accuracy", 0.0)
        timing = s.get("timing_accuracy", 0.0)
        
        score_tuple = (acc, timing, s.get("best_streak", 0))
        if uid not in user_best or score_tuple > user_best[uid]["score_tuple"]:
            user_best[uid] = {
                "score_tuple": score_tuple,
                "entry": {
                    "id": str(s.get("_id", s.get("id"))),
                    "username": uname,
                    "accuracy": acc,
                    "timing_accuracy": timing,
                    "best_streak": s.get("best_streak", 0),
                    "speed": s.get("speed", 1.0),
                    "created_at": s.get("created_at")
                }
            }

    # Sort entries by accuracy desc, timing_accuracy desc
    sorted_entries = sorted(
        [item["entry"] for item in user_best.values()],
        key=lambda x: (x["accuracy"], x["timing_accuracy"], x["best_streak"]),
        reverse=True
    )

    # Attach rank
    ranked = []
    for rank, entry in enumerate(sorted_entries[:20], start=1):
        entry["rank"] = rank
        ranked.append(entry)

    return ranked
