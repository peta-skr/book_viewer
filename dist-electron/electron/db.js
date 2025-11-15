"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const dataDir = node_path_1.default.join(process.cwd(), "data");
node_fs_1.default.mkdirSync(dataDir, { recursive: true });
const db = new better_sqlite3_1.default(node_path_1.default.join(dataDir, "library.sqlite3"));
db.pragma("journal_mode = WAL");
db.exec(`
CREATE TABLE IF NOT EXISTS books (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    folder_path TEXT NOT NULL UNIQUE,
    cover_path TEXT NOT NULL,
    page_count INTEGER NOT NULL,
    last_page_index INTEGER NOT NULL DEFAULT 0
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
exports.default = db;
