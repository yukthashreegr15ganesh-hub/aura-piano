from pydantic import BaseModel, Field, field_validator
from typing import List, Optional, Union
from datetime import datetime

VALID_NOTE_PATTERN = r"^[A-G][#b]?[1-7]$"

class Section(BaseModel):
    name: str = Field(..., min_length=1, max_length=64)
    startBeat: float = Field(..., ge=0.0)

class SongNote(BaseModel):
    note: str = Field(..., description="Note in scientific pitch notation, e.g. C4, D#4, F5")
    startBeat: float = Field(..., ge=0.0)
    durationBeats: float = Field(..., gt=0.0)
    velocity: Optional[float] = Field(0.8, ge=0.0, le=1.0)

    @field_validator("note")
    @classmethod
    def validate_note_pitch(cls, v: str) -> str:
        import re
        if not re.match(VALID_NOTE_PATTERN, v):
            raise ValueError(f"Invalid scientific pitch format: {v}")
        return v

class LyricItem(BaseModel):
    beat: float
    text: str

class ChordVoicing(BaseModel):
    beat: float
    durationBeats: float
    name: str
    notes: List[str]
    bass: str

class Song(BaseModel):
    id: str
    title: str = Field(..., min_length=1, max_length=120)
    artist: str = Field(..., min_length=1, max_length=120)
    difficulty: str = Field(..., description="Beginner | Easy | Intermediate | Advanced")
    category: str = Field(..., description="Classical | Popular | Practice | Traditional | Soundtrack")
    bpm: int = Field(..., ge=30, le=280)
    timeSignature: Union[str, List[int]] = "4/4"
    sections: List[Section] = Field(default_factory=list)
    notes: List[SongNote] = Field(..., min_length=1)
    lyrics: Optional[List[LyricItem]] = None
    chords: Optional[List[ChordVoicing]] = None
    is_private: bool = False
    user_id: Optional[str] = None
    created_at: Optional[datetime] = None

    @field_validator("difficulty")
    @classmethod
    def validate_diff(cls, v: str) -> str:
        valid = {"Beginner", "Easy", "Intermediate", "Advanced"}
        if v not in valid:
            return "Intermediate"
        return v

class SongFilter(BaseModel):
    category: Optional[str] = None
    difficulty: Optional[str] = None
    search: Optional[str] = None

class ExtractSongRequest(BaseModel):
    query: str = Field(..., min_length=1, description="Song title, melody prompt, or composer to extract")
    genre: Optional[str] = "Popular"
    difficulty: Optional[str] = "Intermediate"
    notes_input: Optional[str] = None

class CreateCustomSongRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=120)
    artist: Optional[str] = "My Piano Recording"
    difficulty: Optional[str] = "Easy"
    category: Optional[str] = "Practice"
    bpm: Optional[int] = 90
    notes: List[SongNote] = Field(..., min_length=1)
    sections: Optional[List[Section]] = None
