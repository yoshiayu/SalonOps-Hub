from __future__ import annotations

import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import audit, auth, imports, kpi, masters, reports

app = FastAPI(
    title="SalonOps Hub API",
    description="業務標準化・KPI可視化・レポート自動化 API",
    version="0.1.0",
)

allowed_origins = os.getenv("API_ALLOWED_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in allowed_origins],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


app.include_router(auth.router)
app.include_router(masters.router)
app.include_router(imports.router)
app.include_router(kpi.router)
app.include_router(reports.router)
app.include_router(audit.router)
