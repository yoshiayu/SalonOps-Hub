from __future__ import annotations

from fastapi import APIRouter, File, HTTPException, UploadFile

from app.repository import repo
from app.schemas import ImportError, ImportJob
from app.services import validate_sales_csv

router = APIRouter(prefix="/imports", tags=["imports"])


@router.post("/sales", response_model=ImportJob)
async def import_sales(file: UploadFile = File(...)):
    content = await file.read()
    try:
        decoded = content.decode("utf-8")
    except UnicodeDecodeError as exc:
        raise HTTPException(status_code=400, detail="utf-8 encoded csv is required") from exc

    total_rows, valid_rows, errors = validate_sales_csv(decoded)
    return repo.create_import_job(
        file_name=file.filename or "upload.csv",
        total_rows=total_rows,
        valid_rows=valid_rows,
        errors=errors,
    )


@router.get("/{import_id}", response_model=ImportJob)
def get_import(import_id: str):
    result = repo.get_import_job(import_id)
    if not result:
        raise HTTPException(status_code=404, detail="import not found")
    return result


@router.get("/{import_id}/errors", response_model=list[ImportError])
def get_import_errors(import_id: str):
    result = repo.get_import_job(import_id)
    if not result:
        raise HTTPException(status_code=404, detail="import not found")
    return result.errors
