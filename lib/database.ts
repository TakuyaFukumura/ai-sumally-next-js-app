import Database from 'better-sqlite3';
import {join} from 'path';
import fs from 'fs';

// データベースファイルのパス
const dbPath = join(process.cwd(), 'data', 'app.db');

// データベースインスタンス
let db: Database.Database | null = null;

interface SummaryRow {
    id: number;
    original_text: string;
    summary_text: string;
    instruction: string | null;
    model: string;
    created_at: string;
    updated_at: string;
}

export interface Summary {
    id: number;
    originalText: string;
    summaryText: string;
    instruction: string | null;
    model: string;
    createdAt: string;
    updatedAt: string;
}

interface CreateSummaryInput {
    originalText: string;
    summaryText: string;
    instruction?: string | null;
    model: string;
}

interface UpdateSummaryInput {
    summaryText: string;
    instruction?: string | null;
    model: string;
}

function toIsoString(value: string): string {
    const trimmed = value.trim();
    const parsedValue = new Date(trimmed);
    if (!Number.isNaN(parsedValue.getTime()) && (trimmed.includes('T') || trimmed.endsWith('Z'))) {
        return parsedValue.toISOString();
    }

    const normalized = trimmed.includes(' ') ? trimmed.replace(/ /g, 'T') : trimmed;
    const withTimezone = normalized.endsWith('Z') ? normalized : `${normalized}Z`;
    const parsedNormalizedValue = new Date(withTimezone);

    if (Number.isNaN(parsedNormalizedValue.getTime())) {
        return value;
    }

    return parsedNormalizedValue.toISOString();
}

function mapSummaryRow(row: SummaryRow): Summary {
    return {
        id: row.id,
        originalText: row.original_text,
        summaryText: row.summary_text,
        instruction: row.instruction,
        model: row.model,
        createdAt: toIsoString(row.created_at),
        updatedAt: toIsoString(row.updated_at),
    };
}

/**
 * データベース接続を取得する
 */
export function getDatabase(): Database.Database {
    if (!db) {
        // データベースディレクトリが存在しない場合は作成
        const dataDir = join(process.cwd(), 'data');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, {recursive: true});
        }

        db = new Database(dbPath);

        // テーブルが存在しない場合は作成
        db.exec(`
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

        db.exec(`
      CREATE TABLE IF NOT EXISTS summaries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        original_text TEXT NOT NULL,
        summary_text TEXT NOT NULL,
        instruction TEXT,
        model TEXT NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

        // 初期データが存在しない場合は挿入
        const count = db.prepare('SELECT COUNT(*) as count FROM messages').get() as { count: number };
        if (count.count === 0) {
            db.prepare('INSERT INTO messages (content) VALUES (?)').run('Hello, world.');
        }
    }

    return db;
}

/**
 * メッセージを取得する
 */
export function getMessage(): string {
    const database = getDatabase();
    const result = database.prepare('SELECT content FROM messages ORDER BY created_at DESC LIMIT 1').get() as {
        content: string
    } | undefined;
    return result?.content || 'Hello, world.';
}

export function listSummaries(): Summary[] {
    const database = getDatabase();
    const rows = database.prepare(`
      SELECT id, original_text, summary_text, instruction, model, created_at, updated_at
      FROM summaries
      ORDER BY updated_at DESC, id DESC
    `).all() as SummaryRow[];

    return rows.map(mapSummaryRow);
}

export function getSummaryById(id: number): Summary | undefined {
    const database = getDatabase();
    const row = database.prepare(`
      SELECT id, original_text, summary_text, instruction, model, created_at, updated_at
      FROM summaries
      WHERE id = ?
    `).get(id) as SummaryRow | undefined;

    return row ? mapSummaryRow(row) : undefined;
}

export function createSummary({originalText, summaryText, instruction = null, model}: CreateSummaryInput): Summary {
    const database = getDatabase();
    const result = database.prepare(
        'INSERT INTO summaries (original_text, summary_text, instruction, model) VALUES (?, ?, ?, ?)'
    ).run(originalText, summaryText, instruction, model);

    const summary = getSummaryById(result.lastInsertRowid as number);
    if (!summary) {
        throw new Error('要約の保存に失敗しました');
    }

    return summary;
}

export function updateSummaryById(id: number, {summaryText, instruction = null, model}: UpdateSummaryInput): Summary | undefined {
    const database = getDatabase();
    const result = database.prepare(`
      UPDATE summaries
      SET summary_text = ?, instruction = ?, model = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(summaryText, instruction, model, id);

    if (result.changes === 0) {
        return undefined;
    }

    return getSummaryById(id);
}
