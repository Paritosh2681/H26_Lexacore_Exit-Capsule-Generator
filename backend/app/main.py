import os
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.database import init_db
from app.routes.scan import router as scan_router
from app.routes.dependencies import router as dep_router
from app.routes.verification import router as ver_router
from app.routes.approval import router as app_router
from app.routes.planner import router as plan_router
from app.routes.capsule import router as cap_router
from app.routes.post_verification import router as post_ver_router
from app.routes.settings_route import router as settings_router
from app.routes.auth_github import router as github_router

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield

app = FastAPI(
    title="Exit Capsule Generator API",
    description="AI-Powered Python Dependency Resilience and Migration Planning Tool",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for local development with frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(scan_router)
app.include_router(dep_router)
app.include_router(ver_router)
app.include_router(app_router)
app.include_router(plan_router)
app.include_router(cap_router)
app.include_router(post_ver_router)
app.include_router(settings_router)
app.include_router(github_router)

# Serve frontend build if present
frontend_dist = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"
if frontend_dist.exists():
    app.mount("/", StaticFiles(directory=str(frontend_dist), html=True), name="frontend")
