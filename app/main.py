from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.routes.prescription_routes import router as prescription_router
from app.routes.hospital_routes import router as hospital_router

import os

# Ensure uploads directory exists
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

app = FastAPI(
    title="Digital Prescription System",
    description="AI-powered digital prescription generation system with multi-institution support",
    version="1.1.0"
)

# ✅ CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Static File Serving (IMPORTANT for logo display)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# ✅ Routers
app.include_router(
    prescription_router,
    prefix="/prescription",
    tags=["Prescriptions"]
)

app.include_router(
    hospital_router,
    prefix="/hospital",
    tags=["Hospitals"]
)

# ✅ Root Endpoint
@app.get("/")
def home():
    return {
        "message": "Digital Prescription System Running",
        "status": "success",
        "modules": ["prescription", "hospital"]
    }

# ✅ Health Check (for deployment / monitoring)
@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "prescription-api",
        "version": "1.1.0"
    }

# ✅ Debug Endpoint (VERY USEFUL for testing)
@app.get("/debug")
def debug():
    return {
        "uploads_folder_exists": os.path.exists(UPLOAD_DIR),
        "files_in_uploads": os.listdir(UPLOAD_DIR)
    }