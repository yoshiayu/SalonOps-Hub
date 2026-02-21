from __future__ import annotations

from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, status

from app.deps import require_roles
from app.repository import repo
from app.schemas import KpiDef, KpiDefCreate, KpiDefUpdate, Role, Store, StoreCreate, StoreType, StoreUpdate

router = APIRouter(prefix="/masters", tags=["masters"])


@router.get("/stores", response_model=list[Store])
def get_stores(
    type: StoreType | None = None,
    area: str | None = None,
    manager: str | None = None,
    business_unit: str | None = None,
):
    return repo.list_stores(type_=type, area=area, manager=manager, business_unit=business_unit)


@router.post("/stores", response_model=Store, status_code=status.HTTP_201_CREATED)
def create_store(
    payload: StoreCreate,
    _=Depends(require_roles(Role.ADMIN, Role.MANAGER)),
):
    store = Store(id=f"store-{uuid4().hex[:8]}", **payload.model_dump())
    return repo.create_store(store)


@router.put("/stores/{store_id}", response_model=Store)
def update_store(
    store_id: str,
    payload: StoreUpdate,
    _=Depends(require_roles(Role.ADMIN, Role.MANAGER)),
):
    patch = payload.model_dump(exclude_none=True)
    if not patch:
        raise HTTPException(status_code=400, detail="no update fields")

    store = repo.update_store(store_id, patch)
    if not store:
        raise HTTPException(status_code=404, detail="store not found")
    return store


@router.get("/kpi-defs", response_model=list[KpiDef])
def get_kpi_defs():
    return repo.list_kpi_defs()


@router.post("/kpi-defs", response_model=KpiDef, status_code=status.HTTP_201_CREATED)
def create_kpi_def(
    payload: KpiDefCreate,
    _=Depends(require_roles(Role.ADMIN, Role.MANAGER)),
):
    model = KpiDef(id=f"kpi-{uuid4().hex[:8]}", **payload.model_dump())
    return repo.create_kpi_def(model)


@router.put("/kpi-defs/{kpi_id}", response_model=KpiDef)
def update_kpi_def(
    kpi_id: str,
    payload: KpiDefUpdate,
    _=Depends(require_roles(Role.ADMIN, Role.MANAGER)),
):
    patch = payload.model_dump(exclude_none=True)
    if not patch:
        raise HTTPException(status_code=400, detail="no update fields")

    kpi = repo.update_kpi_def(kpi_id, patch)
    if not kpi:
        raise HTTPException(status_code=404, detail="kpi not found")
    return kpi
