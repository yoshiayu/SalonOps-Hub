# 運用手順 (Dockerなし)

## 定例運用
1. 店舗/部門の入力責任者が締め時間までにSheetsへ入力。
2. CSVまたはSheets同期で `/imports` から取込実行。
3. `/dashboard` でKPI差分・異常を確認。
4. `/reports` で週次/月次レポートを生成・配信。
5. `/audit` で操作履歴を確認。

## 権限運用
1. 入社/異動時にロール（Admin/Manager/Staff/Viewer）を設定。
2. 退職時は即日剥奪。
3. 月1回、不要権限を棚卸し。

## 障害時手順
1. `http://127.0.0.1:8000/health` と `http://localhost:3000` を確認。
2. API障害時はSheets + Looker Studioのバックアップ導線で可視化継続。
3. 復旧後に未処理CSVを再実行。
4. 影響範囲と再発防止を監査ログに記録。
