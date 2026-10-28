import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.routers import auth, profile
from app.routers import catalog, playback, subscription, admin
from app.routers import watchlist
from app.routers import ratings
from app.init_db import auto_init_and_seed


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Automatically ensure tables exist and seed demo users/content on server start
    auto_init_and_seed()
    yield


app = FastAPI(
    title="StreamHub API",
    description="Backend API for the StreamHub streaming platform",
    version="1.0.0",
    lifespan=lifespan,
)

# Allow the React + Vite frontend to communicate with the backend from any local dev port
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:5175",
        "http://127.0.0.1:5175",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files directory for uploaded media
static_dir = os.path.join(os.path.dirname(__file__), "static")
os.makedirs(static_dir, exist_ok=True)
app.mount("/static", StaticFiles(directory=static_dir), name="static")

# Register application routers
app.include_router(auth.router)
app.include_router(profile.router)
app.include_router(catalog.router)
app.include_router(playback.router)
app.include_router(subscription.router)
app.include_router(admin.router)
app.include_router(watchlist.router)
app.include_router(ratings.router)


@app.get("/")
def root():
    return {"message": "StreamHub API is running"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}
