import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from database import db_manager
from services.seed_data import seed_database
from routers import auth, songs, sessions, leaderboard

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("aura.main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: connect to database & seed bundled songs
    logger.info("Initializing Aura Piano Database...")
    await db_manager.connect()
    db = db_manager.db
    logger.info("Seeding bundled songs into database...")
    await seed_database(db)
    logger.info("Aura Piano Backend successfully initialized and ready.")
    yield
    # Shutdown
    logger.info("Shutting down Aura Piano connections...")
    await db_manager.close()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="Full-stack interactive piano learning platform API",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(songs.router)
app.include_router(sessions.router)
app.include_router(leaderboard.router)

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "database_mode": db_manager.mode,
        "engine": "Aura Concert Grand Core 1.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
