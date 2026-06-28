import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import firebase_config to initialize Firebase on startup
import firebase_config

# ── ROUTER IMPORTS ──
from routes.auth import router as auth_router
from routes.classify import router as classify_router
from routes.print_jobs import router as print_router

app = FastAPI(
    title="OUSPMS API",
    description="Smart Printer Monitoring System - Open University of Sri Lanka",
    version="1.0.0"
)

# CORS Middleware - allows your React frontend to connect to this backend
origins = [
    os.getenv("FRONTEND_URL", "http://localhost:3000"),
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root endpoint
@app.get("/")
def root():
    return {
        "status": "running",
        "app": "OUSPMS API",
        "message": "Welcome to Open University Smart Printer Monitoring System"
    }

# ── REGISTER ROUTERS ──
app.include_router(auth_router, prefix="/auth", tags=["Authentication"])
app.include_router(classify_router, prefix="/classify", tags=["AI Classification"])
app.include_router(print_router, prefix="/print", tags=["Print Jobs"])