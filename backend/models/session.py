from pydantic import BaseModel, Field
from typing import Dict, Optional, List, Any
from datetime import datetime

class SessionCreate(BaseModel):
    song_id: str
    song_title: str
    mode: str = Field(..., description="learn | practice | performance | free_play")
    speed: float = Field(1.0, ge=0.25, le=2.0)
    accuracy: float = Field(..., ge=0.0, le=100.0)
    correct: int = Field(..., ge=0)
    wrong: int = Field(..., ge=0)
    timing_accuracy: float = Field(..., ge=0.0, le=100.0, description="Timing accuracy percentage or score")
    best_streak: int = Field(..., ge=0)
    duration_seconds: int = Field(0, ge=0)
    mistakes_by_note: Dict[str, int] = Field(default_factory=dict)
    mistakes_by_section: Dict[str, int] = Field(default_factory=dict)
    practice_recommendation: Optional[str] = None

class SessionOut(BaseModel):
    id: str
    user_id: Optional[str] = None
    username: Optional[str] = None
    song_id: str
    song_title: str
    mode: str
    speed: float
    accuracy: float
    correct: int
    wrong: int
    timing_accuracy: float
    best_streak: int
    duration_seconds: int
    mistakes_by_note: Dict[str, int]
    mistakes_by_section: Dict[str, int]
    practice_recommendation: Optional[str]
    created_at: datetime

class ProgressSummary(BaseModel):
    total_practice_time_seconds: int
    daily_streak: int
    total_notes_played: int
    accuracy_average: float
    best_performances: List[Dict[str, Any]]
    recent_sessions: List[SessionOut]
