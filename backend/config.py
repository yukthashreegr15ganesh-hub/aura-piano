import os
from pydantic import BaseModel

class Settings(BaseModel):
    PROJECT_NAME: str = "Aura Piano API"
    MONGODB_URL: str = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    DATABASE_NAME: str = os.getenv("DATABASE_NAME", "aura_piano")
    JWT_SECRET: str = os.getenv("JWT_SECRET", "aura_piano_concert_grand_secret_key_88_keys")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 30  # 30 days
    DATA_DIR: str = os.path.join(os.path.dirname(__file__), "data")

settings = Settings()
