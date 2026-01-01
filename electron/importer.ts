import fs from "fs";
import path from "path";
import db from "./db";
import type {
  BookInfo,
  BookPayload,
  ImageInfo,
  ImagePayload,
} from "../types/book";
import { guessMimeType } from "./lib";

const SUPPORTED = [".jpeg", ".jpg", ".png"];

type InsertResult = {
  changes: number;
  lastInsertRowid: number;
};

// フォルダ内の画像ファイルを探す
export function scanFolder(folderPath: string) {
  if (!fs.existsSync(folderPath)) {
    throw new Error("フォルダが存在しません：" + folderPath);
  }

  const files = fs
    .readdirSync(folderPath)
    .filter((f) => SUPPORTED.includes(path.extname(f).toLowerCase()))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .map((f) => path.join(folderPath, f));

  if (files.length === 0)
    throw new Error("画像が見つかりません: " + folderPath);

  return files;
}

// booksとimagesへの登録処理
export const importFolder = db.transaction((absPath: string, title: string) => {
  const files = scanFolder(absPath);
  const cover = files[0];

  // booksの登録
  const insertBooks = db.prepare(`
    INSERT INTO books (title, folder_path, cover_path ,page_count, last_page_index, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(folder_path) DO UPDATE SET
      title=excluded.title,
      cover_path=excluded.cover_path,
      page_count=excluded.page_count
    `);

  const { lastInsertRowid } = insertBooks.run(
    title,
    absPath,
    cover,
    files.length,
    0,
    Date.now()
  );

  // bookIDの取得
  const bookId =
    Number(lastInsertRowid) ||
    db.prepare("SELECT id FROM books WHERE folder_path=?").get(absPath).id;

  // imagesの登録
  const insertImages = db.prepare(`
      INSERT INTO images (book_id, image_path, page_order)
      VALUES (?, ?, ?)
  `);

  // 既存のものは削除
  db.prepare("DELETE FROM images WHERE book_id=?").run(bookId);

  for (let i = 0; i < files.length; i++) {
    insertImages.run(bookId, files[i], i);
  }

  return { bookId, title, pageCount: files.length };
});

// // 一覧表示取得
// export async function listBooks() {
//   let books = db
//     .prepare(`SELECT * FROM books`)
//     .all()
//     .map((row) => {
//       return {
//         id: row.id,
//         title: row.title,
//         pageCount: row.page_count,
//         lastPageIndex: row.last_page_index,
//         coverPath: row.cover_path,
//         folderPath: row.folder_path,
//       };
//     }) as BookInfo[];

//   books = await Promise.all(
//     books.map(async (book) => {
//       const buf = await fs.promises.readFile(book.coverPath);

//       // 拡張子から MIME を判定
//       const ext = path.extname(book.coverPath).toLowerCase();
//       const mime =
//         ext === ".png"
//           ? "image/png"
//           : ext === ".webp"
//           ? "image/webp"
//           : "image/jpeg"; // デフォルト jpeg

//       const base64 = buf.toString("base64");
//       const dataUrl = `data:${mime};base64,${base64}`;

//       return {
//         ...book,
//         coverPath: dataUrl, // ← Data URL に置き換える
//       };
//     })
//   );

//   return books;
// }

// 一覧表示取得
export async function listBooks(): Promise<BookInfo[]> {
  let rows = db
    .prepare(
      `SELECT id, title, page_count, last_page_index, cover_path, folder_path, created_at
    FROM books
    ORDER BY id DESC`
    )
    .all();

  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    pageCount: r.page_count,
    lastPageIndex: r.last_page_index,
    coverPath: r.cover_path,
    folderPath: r.folder_path,
    mimeType: guessMimeType(r.cover_path),
    createdAt: r.created_at,
  }));
}

// 特定の本の画像を取得
export async function getBookImagePayload(
  bookId: string,
  pageIndex: number
): Promise<ImagePayload> {
  let row = db
    .prepare(
      `SELECT * FROM images WHERE book_id = :bookId AND page_order = :pageOrder`
    )
    .get({ bookId: bookId, pageOrder: pageIndex });

  const info: ImageInfo = {
    id: row.id,
    bookId: row.book_id,
    imagePath: row.image_path, // そのまま
    pageOrder: row.page_order,
    mimeType: guessMimeType(row.image_path),
  };

  const buf = await fs.promises.readFile(info.imagePath);

  return { info, bytes: new Uint8Array(buf) };
}

export function updateLastPage(bookId: number, pageIndex: number) {
  const stmt = db.prepare(`UPDATE books SET last_page_index = ? WHERE id = ?`);
  stmt.run(pageIndex, bookId);
}

export function getBook(bookId: number) {
  const stmt = db.prepare(`SELECT * FROM books WHERE id = ?`);
  return stmt.get(bookId);
}

// 本のカバー取得
export async function getBookThumbnail(
  bookId: string
): Promise<Uint8Array | null> {
  const row = db
    .prepare(`SELECT cover_path FROM books WHERE id = ?`)
    .get(bookId);

  if (!row?.cover_path) return null;

  try {
    const buf = await fs.promises.readFile(row.cover_path);
    return new Uint8Array(buf);
  } catch {
    return null;
  }
}

// 本のタイトル編集
export function renameBook(bookId: string, title: string): boolean {
  const stmt = db.prepare(`UPDATE books SET title = ? WHERE id = ?`);
  const info = stmt.run(title, bookId);

  return info.changes === 1; // 0なら該当なし、1なら更新できた
}

// 本の削除
export function removeBook(bookId: string): boolean {
  const stmt = db.prepare(`DELETE FROM books WHERE id = ?`);
  const info = stmt.run(bookId);

  return info.changes === 1; // 0なら該当なし、1なら更新できた
}

// 既存チェック
export function findBookByFolderPath(folderPath: string) {
  const row = db
    .prepare(
      `SELECT id, title, folder_path, cover_path, page_count, last_page_index, created_at
              FROM books WHERE folder_path = ?`
    )
    .get(folderPath);

  return row ?? null;
}

// 上書き
export function overwriteBookByFolderPath(folderPath: string, title: string) {
  const files = scanFolder(folderPath);
  const cover = files[0];
  const info = db
    .prepare(`SELECT id FROM books WHERE folder_path = ?`)
    .get(folderPath);
  if (!info) return { ok: false as const, reason: "NOT_FOUND" as const };

  const result = db
    .prepare(
      `
    UPDATE books
    SET title = ?, cover_path = ?, page_count = ?, last_page_index = 0
    WHERE folder_path = ?
  `
    )
    .run(title, cover, files.length, folderPath);

  return { ok: result.changes === 1, bookId: String(info.id) };
}
