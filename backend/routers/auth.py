import time
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Request
from pydantic import BaseModel
from datetime import datetime
from database import get_db
from models.user import UserCreate, UserLogin, UserOut, Token
from services.auth_service import verify_password, get_password_hash, create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])

# Lightweight in-memory rate limiter for auth routes
ip_requests: Dict[str, List[float]] = {}
RATE_LIMIT_WINDOW = 60  # seconds
RATE_LIMIT_MAX = 15     # max requests per window

def check_rate_limit(request: Request):
    client_ip = request.client.host if request.client else "unknown"
    now = time.time()
    timestamps = ip_requests.get(client_ip, [])
    # purge old
    timestamps = [t for t in timestamps if now - t < RATE_LIMIT_WINDOW]
    if len(timestamps) >= RATE_LIMIT_MAX:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many authentication attempts. Please wait 60 seconds."
        )
    timestamps.append(now)
    ip_requests[client_ip] = timestamps

class AuthWithMergeRequest(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    email_or_username: Optional[str] = None
    password: str
    guest_sessions: Optional[List[Dict[str, Any]]] = None

@router.post("/register", response_model=Token)
async def register(req: AuthWithMergeRequest, request: Request):
    check_rate_limit(request)
    db = get_db()
    
    if not req.username or not req.email or not req.password:
        raise HTTPException(status_code=400, detail="Username, email and password are required")

    # Check duplicate
    existing = await db["users"].find_one({
        "$or": [{"email": req.email.lower()}, {"username": req.username}]
    })
    if existing:
        raise HTTPException(status_code=400, detail="Username or email is already registered")

    user_doc = {
        "username": req.username,
        "email": req.email.lower(),
        "hashed_password": get_password_hash(req.password),
        "created_at": datetime.utcnow().isoformat(),
        "total_practice_time_seconds": 0,
        "daily_streak": 1,
        "last_active_date": datetime.utcnow().date().isoformat()
    }
    
    res = await db["users"].insert_one(user_doc)
    user_id = str(res.inserted_id)

    # Merge guest sessions if provided!
    if req.guest_sessions:
        for s in req.guest_sessions:
            s["user_id"] = user_id
            s["username"] = req.username
            if "_id" in s:
                del s["_id"]
            if "created_at" not in s:
                s["created_at"] = datetime.utcnow().isoformat()
            await db["sessions"].insert_one(s)
            user_doc["total_practice_time_seconds"] += s.get("duration_seconds", 0)
        
        await db["users"].update_one(
            {"_id": user_id},
            {"$set": {"total_practice_time_seconds": user_doc["total_practice_time_seconds"]}}
        )

    user_out = UserOut(
        id=user_id,
        username=user_doc["username"],
        email=user_doc["email"],
        created_at=datetime.fromisoformat(user_doc["created_at"]),
        total_practice_time_seconds=user_doc["total_practice_time_seconds"],
        daily_streak=user_doc["daily_streak"],
        last_active_date=user_doc["last_active_date"]
    )
    token = create_access_token({"sub": user_id, "username": user_out.username})
    return Token(access_token=token, token_type="bearer", user=user_out)

@router.post("/login", response_model=Token)
async def login(req: AuthWithMergeRequest, request: Request):
    check_rate_limit(request)
    db = get_db()
    identifier = req.email_or_username or req.email or req.username
    if not identifier or not req.password:
        raise HTTPException(status_code=400, detail="Missing login credentials")

    user = await db["users"].find_one({
        "$or": [{"email": identifier.lower()}, {"username": identifier}]
    })
    if not user or not verify_password(req.password, user.get("hashed_password", "")):
        raise HTTPException(status_code=401, detail="Invalid username/email or password")

    user_id = str(user["_id"])

    # Update streak
    today_str = datetime.utcnow().date().isoformat()
    last_active = user.get("last_active_date")
    current_streak = user.get("daily_streak", 1)
    if last_active != today_str:
        if last_active:
            last_date = datetime.fromisoformat(last_active).date()
            diff_days = (datetime.utcnow().date() - last_date).days
            if diff_days == 1:
                current_streak += 1
            elif diff_days > 1:
                current_streak = 1
        else:
            current_streak = 1
        await db["users"].update_one(
            {"_id": user_id},
            {"$set": {"last_active_date": today_str, "daily_streak": current_streak}}
        )
        user["daily_streak"] = current_streak

    # Merge guest sessions if user has offline guest sessions
    if req.guest_sessions:
        added_practice = 0
        for s in req.guest_sessions:
            s["user_id"] = user_id
            s["username"] = user["username"]
            if "_id" in s:
                del s["_id"]
            if "created_at" not in s:
                s["created_at"] = datetime.utcnow().isoformat()
            await db["sessions"].insert_one(s)
            added_practice += s.get("duration_seconds", 0)
        
        new_total = user.get("total_practice_time_seconds", 0) + added_practice
        await db["users"].update_one(
            {"_id": user_id},
            {"$set": {"total_practice_time_seconds": new_total}}
        )
        user["total_practice_time_seconds"] = new_total

    created_at_dt = datetime.fromisoformat(user["created_at"]) if isinstance(user["created_at"], str) else user["created_at"]
    user_out = UserOut(
        id=user_id,
        username=user["username"],
        email=user["email"],
        created_at=created_at_dt,
        total_practice_time_seconds=user.get("total_practice_time_seconds", 0),
        daily_streak=user.get("daily_streak", 1),
        last_active_date=user.get("last_active_date")
    )
    token = create_access_token({"sub": user_id, "username": user_out.username})
    return Token(access_token=token, token_type="bearer", user=user_out)

@router.get("/me", response_model=UserOut)
async def get_me(user: Dict[str, Any] = Depends(get_current_user)):
    created_at_dt = datetime.fromisoformat(user["created_at"]) if isinstance(user["created_at"], str) else user["created_at"]
    return UserOut(
        id=str(user["_id"]),
        username=user["username"],
        email=user["email"],
        created_at=created_at_dt,
        total_practice_time_seconds=user.get("total_practice_time_seconds", 0),
        daily_streak=user.get("daily_streak", 1),
        last_active_date=user.get("last_active_date")
    )
