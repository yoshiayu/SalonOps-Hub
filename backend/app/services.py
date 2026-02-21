from __future__ import annotations

import csv
from io import StringIO

from app.schemas import ImportError


def validate_sales_csv(content: str) -> tuple[int, int, list[ImportError]]:
    reader = csv.DictReader(StringIO(content))
    required = {"store_code", "date", "revenue", "customers"}
    if not reader.fieldnames:
        return 0, 0, [
            ImportError(
                row=1,
                column="header",
                reason="CSVヘッダが存在しません。",
                fix="テンプレートのヘッダ行を付与してください。",
            )
        ]

    normalized_headers = {name.strip().lower() for name in reader.fieldnames}
    if not required.issubset(normalized_headers):
        missing = sorted(required - normalized_headers)
        return 0, 0, [
            ImportError(
                row=1,
                column="header",
                reason=f"必須列不足: {','.join(missing)}",
                fix="テンプレート列名に合わせてください。",
            )
        ]

    errors: list[ImportError] = []
    seen: set[str] = set()
    valid_rows = 0
    total_rows = 0

    for idx, row in enumerate(reader, start=2):
        total_rows += 1
        store_code = (row.get("store_code") or "").strip()
        date_value = (row.get("date") or "").strip()
        revenue_raw = (row.get("revenue") or "").strip()
        customers_raw = (row.get("customers") or "").strip()

        if not store_code or not date_value or not revenue_raw or not customers_raw:
            errors.append(
                ImportError(
                    row=idx,
                    column="required",
                    reason="必須項目が不足しています。",
                    fix="store_code/date/revenue/customers を入力してください。",
                )
            )
            continue

        key = f"{store_code}-{date_value}"
        if key in seen:
            errors.append(
                ImportError(
                    row=idx,
                    column="store_code,date",
                    reason="重複データです。",
                    fix="同一店舗・同一日の行を1つにしてください。",
                )
            )
            continue
        seen.add(key)

        try:
            revenue = float(revenue_raw)
            customers = int(customers_raw)
        except ValueError:
            errors.append(
                ImportError(
                    row=idx,
                    column="revenue/customers",
                    reason="型不正です。",
                    fix="revenue は数値、customers は整数で入力してください。",
                )
            )
            continue

        if revenue < 0:
            errors.append(
                ImportError(
                    row=idx,
                    column="revenue",
                    reason="売上が負数です。",
                    fix="返金処理は別列で管理し、売上は0以上にしてください。",
                )
            )
            continue

        if revenue > 50_000_000:
            errors.append(
                ImportError(
                    row=idx,
                    column="revenue",
                    reason="売上が範囲上限を超えています。",
                    fix="桁・通貨単位を確認してください。",
                )
            )
            continue

        if customers < 0:
            errors.append(
                ImportError(
                    row=idx,
                    column="customers",
                    reason="客数が負数です。",
                    fix="0以上を入力してください。",
                )
            )
            continue

        valid_rows += 1

    return total_rows, valid_rows, errors
