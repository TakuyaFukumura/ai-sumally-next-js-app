# Changelog

このプロジェクトのすべての変更はこのファイルに記録されます。

フォーマットは [Keep a Changelog](https://keepachangelog.com/ja/1.0.0/) に基づいており、
このプロジェクトは [Semantic Versioning](https://semver.org/lang/ja/) に従っています。

## [Unreleased]

### 変更

- なし

## [0.2.0] - 2026-08-08

### 追加

- Ollama連携による要約生成機能（`/api/summaries`）
- 要約履歴取得機能（`/api/summaries`）
- 要約再生成機能（`/api/summaries/[id]`）
- 要約履歴表示と再生成UIを含むメイン画面
- `summaries`テーブルと関連データアクセス関数
- `OLLAMA_BASE_URL` / `OLLAMA_MODEL` の環境変数サンプル

### 変更

- アプリメタデータとREADMEを要約アプリ内容へ更新

## [0.1.0] - 2026-08-08

### 追加

- 初期リリース
