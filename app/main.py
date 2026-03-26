from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.routes.prescription_routes import router as prescription_router
from app.routes.hospital_routes import router as hospital_router
import os

# =========================
# CONFIG
# =========================
UPLOAD_DIR = "uploads"
BASE_URL = os.getenv("BASE_URL", "http://localhost:8000")

ALLOWED_ORIGINS = [
    origin.strip() for origin in os.getenv(
        "ALLOWED_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173"
    ).split(",")
]

ENV = os.getenv("ENV", "development")

os.makedirs(UPLOAD_DIR, exist_ok=True)

app = FastAPI(
    title="Digital Prescription System",
    description="AI-powered digital prescription generation system with multi-institution support",
    version="1.1.0"
)

# =========================
# CORS
# =========================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if ENV == "development" else ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# STATIC FILES
# =========================
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# =========================
# ROUTERS (🔥 FIXED PREFIX)
# =========================
app.include_router(
    prescription_router,
    prefix="/prescription",   # ✅ FIXED
    tags=["Prescriptions"]
)

app.include_router(
    hospital_router,
    prefix="/hospital",
    tags=["Hospitals"]
)

# =========================
# ROOT
# =========================
@app.get("/")
def home():
    return {
        "message": "Digital Prescription System Running",
        "status": "success",
        "base_url": BASE_URL
    }

# =========================
# HEALTH CHECK
# =========================
@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "prescription-api",
        "version": "1.1.0"
    }

# =========================
# DEBUG
# =========================
@app.get("/debug")
def debug():
    if ENV != "development":
        return {"message": "Debug disabled in production"}

    return {
        "allowed_origins": ALLOWED_ORIGINS,
        "uploads_folder_exists": os.path.exists(UPLOAD_DIR),
        "files_in_uploads": os.listdir(UPLOAD_DIR),
        "base_url": BASE_URL
    }