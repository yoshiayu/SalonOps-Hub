from __future__ import annotations

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health() -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_import_sales_validation_error() -> None:
    bad_csv = "store_code,date,revenue,customers\nTKY-001,2026-02-01,-100,12\n"
    response = client.post(
        "/imports/sales",
        files={"file": ("sales.csv", bad_csv.encode("utf-8"), "text/csv")},
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "failed"
    assert len(payload["errors"]) == 1
    assert payload["errors"][0]["column"] == "revenue"


def test_kpi_summary() -> None:
    response = client.get(
        "/kpi/summary",
        params={
            "scope": "company",
            "period": "monthly",
            "from_date": "2026-02-01",
            "to_date": "2026-02-21",
        },
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["scope"] == "company"
    assert payload["total_revenue"] > 0


def test_rbac_forbidden_for_store_create() -> None:
    response = client.post(
        "/masters/stores",
        headers={"x-role": "Viewer"},
        json={
            "code": "FUK-004",
            "name": "Fukuoka",
            "type": "FC",
            "area": "Kyushu",
            "manager": "Ito",
            "business_unit": "Salon",
        },
    )
    assert response.status_code == 403


def test_report_generate_and_send() -> None:
    generate = client.post(
        "/reports/generate",
        headers={"x-role": "Manager"},
        json={
            "scope": "company",
            "period": "weekly",
            "from_date": "2026-02-01",
            "to_date": "2026-02-07",
            "recipients": ["ops@salonops.example.com"],
        },
    )
    assert generate.status_code == 201
    report_id = generate.json()["id"]

    send = client.post(f"/reports/{report_id}/send", headers={"x-role": "Manager"})
    assert send.status_code == 200
    assert send.json()["status"] == "sent"
