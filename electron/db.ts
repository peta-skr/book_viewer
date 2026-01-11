import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

const dataDir = path.join(process.cwd(), "data");
fs.mkdirSync(dataDir, { recursive: true });
const db = new Database(path.join(dataDir, "library.sqlite3"));
db.pragma("journal_mode = WAL");
db.exec(`
CREATE TABLE IF NOT EXISTS books (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    folder_path TEXT NOT NULL UNIQUE,
    cover_path TEXT NOT NULL,
    page_count INTEGER NOT NULL,
    last_page_index INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s','now') * 1000)
);
CREATE TABLE IF NOT EXISTS images (
  id INTEGER PRIMARY KEY,
  book_id INTEGER NOT NULL,
  image_path TEXT NOT NULL,
  page_order INTEGER NOT NULL,
  FOREIGN KEY(book_id) REFERENCES books(id) ON DELETE CASCADE,
  UNIQUE(book_id, page_order)
);
CREATE INDEX IF NOT EXISTS idx_images_book_id ON images(book_id);
`);

export default db;
