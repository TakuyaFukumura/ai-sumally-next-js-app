# ai-sumally-next-js-app

OllamaとSQLiteを使ってローカルで動作するAI要約アプリです。

## 主な機能

- 原文入力から要約生成（`POST /api/summaries`）
- 要約履歴の一覧表示（`GET /api/summaries`）
- 任意指示付きの要約再生成（`PUT /api/summaries/:id`）
- ライト/ダークモード切り替え

## 技術スタック

- Next.js (App Router) / React / TypeScript
- SQLite (`better-sqlite3`)
- Ollama（ローカル）
- Jest / React Testing Library

## 前提条件

- Node.js 20.x以上
- Ollamaがローカルで起動済みであること

## セットアップ

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

ブラウザで `http://localhost:3000` を開いて利用できます。

### Ollamaモデル準備例

```bash
ollama serve
ollama pull llama3
```

## 環境変数

| 変数名 | デフォルト値 | 説明 |
| --- | --- | --- |
| `OLLAMA_BASE_URL` | `http://localhost:11434` | Ollamaの接続先 |
| `OLLAMA_MODEL` | `llama3` | 要約に使うモデル名 |

## 開発コマンド

```bash
npm run lint
npm test
npm run build
```

## データベース

起動時に `data/app.db` が作成され、以下のテーブルを使用します。

- `messages`（既存）
- `summaries`
  - `id`, `original_text`, `summary_text`, `instruction`, `model`, `created_at`, `updated_at`
