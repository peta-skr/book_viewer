import fs from "fs";
import path from "path";
import db from "./db";
import type { BookInfo, ImageInfo } from "../types/book";

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
export const importFolder = db.transaction((absPath: string) => {
  const files = scanFolder(absPath);
  const title = path.basename(absPath);
  const cover = files[0];

  // booksの登録
  const insertBooks = db.prepare(`
    INSERT INTO books (title, folder_path, cover_path ,page_count, last_page_index)
    VALUES (?, ?, ?, ?, ?)
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
    0
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

// 一覧表示取得
export async function listBooks() {
  let books = db
    .prepare(`SELECT * FROM books`)
    .all()
    .map((row) => {
      return {
        id: row.id,
        title: row.title,
        pageCount: row.page_count,
        lastPageIndex: row.last_page_index,
        coverPath: row.cover_path,
        folderPath: row.folder_path,
      };
    }) as BookInfo[];

  books = await Promise.all(
    books.map(async (book) => {
      const buf = await fs.promises.readFile(book.coverPath);

      // 拡張子から MIME を判定
      const ext = path.extname(book.coverPath).toLowerCase();
      const mime =
        ext === ".png"
          ? "image/png"
          : ext === ".webp"
          ? "image/webp"
          : "image/jpeg"; // デフォルト jpeg

      const base64 = buf.toString("base64");
      const dataUrl = `data:${mime};base64,${base64}`;

      return {
        ...book,
        coverPath: dataUrl, // ← Data URL に置き換える
      };
    })
  );

  return books;
}

// 特定の本の画像を取得
export async function getBookImage(bookId: string) {
  let books = db
    .prepare(`SELECT * FROM images WHERE book_id = :bookId ORDER BY page_order`)
    .all({ bookId: bookId })
    .map((row) => {
      return {
        id: row.id,
        bookId: row.book_id,
        imagePath: row.image_path,
        pageOrder: row.page_order,
      };
    }) as ImageInfo[];

  books = await Promise.all(
    books.map(async (book) => {
      const buf = await fs.promises.readFile(book.imagePath);

      // 拡張子から MIME を判定
      const ext = path.extname(book.imagePath).toLowerCase();
      const mime =
        ext === ".png"
          ? "image/png"
          : ext === ".webp"
          ? "image/webp"
          : "image/jpeg"; // デフォルト jpeg

      const base64 = buf.toString("base64");
      const dataUrl = `data:${mime};base64,${base64}`;

      return {
        ...book,
        imagePath: dataUrl, // ← Data URL に置き換える
      };
    })
  );

  return books;
}

export function updateLastPage(bookId: number, pageIndex: number) {
  const stmt = db.prepare(`UPDATE books SET last_page_index = ? WHERE id = ?`);
  stmt.run(pageIndex, bookId);
}

export function getBook(bookId: number) {
  const stmt = db.prepare(`SELECT * FROM books WHERE id = ?`);
  return stmt.get(bookId);
}
