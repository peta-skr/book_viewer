"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.importFolder = void 0;
exports.scanFolder = scanFolder;
exports.listBooks = listBooks;
exports.getBookImagePayload = getBookImagePayload;
exports.updateLastPage = updateLastPage;
exports.getBook = getBook;
exports.getBookThumbnail = getBookThumbnail;
exports.renameBook = renameBook;
exports.removeBook = removeBook;
exports.findBookByFolderPath = findBookByFolderPath;
exports.overwriteBookByFolderPath = overwriteBookByFolderPath;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const db_1 = __importDefault(require("./db"));
const lib_1 = require("./lib");
const SUPPORTED = [".jpeg", ".jpg", ".png"];
// フォルダ内の画像ファイルを探す
function scanFolder(folderPath) {
    if (!fs_1.default.existsSync(folderPath)) {
        throw new Error("フォルダが存在しません：" + folderPath);
    }
    const files = fs_1.default
        .readdirSync(folderPath)
        .filter((f) => SUPPORTED.includes(path_1.default.extname(f).toLowerCase()))
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
        .map((f) => path_1.default.join(folderPath, f));
    if (files.length === 0)
        throw new Error("画像が見つかりません: " + folderPath);
    return files;
}
// booksとimagesへの登録処理
exports.importFolder = db_1.default.transaction((absPath, title) => {
    const files = scanFolder(absPath);
    const cover = files[0];
    // booksの登録
    const insertBooks = db_1.default.prepare(`
    INSERT INTO books (title, folder_path, cover_path ,page_count, last_page_index, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(folder_path) DO UPDATE SET
      title=excluded.title,
      cover_path=excluded.cover_path,
      page_count=excluded.page_count
    `);
    const { lastInsertRowid } = insertBooks.run(title, absPath, cover, files.length, 0, Date.now());
    // bookIDの取得
    const bookId = Number(lastInsertRowid) ||
        db_1.default.prepare("SELECT id FROM books WHERE folder_path=?").get(absPath).id;
    // imagesの登録
    const insertImages = db_1.default.prepare(`
      INSERT INTO images (book_id, image_path, page_order)
      VALUES (?, ?, ?)
  `);
    // 既存のものは削除
    db_1.default.prepare("DELETE FROM images WHERE book_id=?").run(bookId);
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
async function listBooks() {
    let rows = db_1.default
        .prepare(`SELECT id, title, page_count, last_page_index, cover_path, folder_path, created_at
    FROM books
    ORDER BY id DESC`)
        .all();
    return rows.map((r) => ({
        id: r.id,
        title: r.title,
        pageCount: r.page_count,
        lastPageIndex: r.last_page_index,
        coverPath: r.cover_path,
        folderPath: r.folder_path,
        mimeType: (0, lib_1.guessMimeType)(r.cover_path),
        createdAt: r.created_at,
    }));
}
// 特定の本の画像を取得
async function getBookImagePayload(bookId, pageIndex) {
    let row = db_1.default
        .prepare(`SELECT * FROM images WHERE book_id = :bookId AND page_order = :pageOrder`)
        .get({ bookId: bookId, pageOrder: pageIndex });
    const info = {
        id: row.id,
        bookId: row.book_id,
        imagePath: row.image_path, // そのまま
        pageOrder: row.page_order,
        mimeType: (0, lib_1.guessMimeType)(row.image_path),
    };
    const buf = await fs_1.default.promises.readFile(info.imagePath);
    return { info, bytes: new Uint8Array(buf) };
}
function updateLastPage(bookId, pageIndex) {
    const stmt = db_1.default.prepare(`UPDATE books SET last_page_index = ? WHERE id = ?`);
    stmt.run(pageIndex, bookId);
}
function getBook(bookId) {
    const stmt = db_1.default.prepare(`SELECT * FROM books WHERE id = ?`);
    return stmt.get(bookId);
}
// 本のカバー取得
async function getBookThumbnail(bookId) {
    const row = db_1.default
        .prepare(`SELECT cover_path FROM books WHERE id = ?`)
        .get(bookId);
    if (!row?.cover_path)
        return null;
    try {
        const buf = await fs_1.default.promises.readFile(row.cover_path);
        return new Uint8Array(buf);
    }
    catch {
        return null;
    }
}
// 本のタイトル編集
function renameBook(bookId, title) {
    const stmt = db_1.default.prepare(`UPDATE books SET title = ? WHERE id = ?`);
    const info = stmt.run(title, bookId);
    return info.changes === 1; // 0なら該当なし、1なら更新できた
}
// 本の削除
function removeBook(bookId) {
    const stmt = db_1.default.prepare(`DELETE FROM books WHERE id = ?`);
    const info = stmt.run(bookId);
    return info.changes === 1; // 0なら該当なし、1なら更新できた
}
// 既存チェック
function findBookByFolderPath(folderPath) {
    const row = db_1.default
        .prepare(`SELECT id, title, folder_path, cover_path, page_count, last_page_index, created_at
              FROM books WHERE folder_path = ?`)
        .get(folderPath);
    return row ?? null;
}
// 上書き
function overwriteBookByFolderPath(folderPath, title) {
    const files = scanFolder(folderPath);
    const cover = files[0];
    const info = db_1.default
        .prepare(`SELECT id FROM books WHERE folder_path = ?`)
        .get(folderPath);
    if (!info)
        return { ok: false, reason: "NOT_FOUND" };
    const result = db_1.default
        .prepare(`
    UPDATE books
    SET title = ?, cover_path = ?, page_count = ?, last_page_index = 0
    WHERE folder_path = ?
  `)
        .run(title, cover, files.length, folderPath);
    return { ok: result.changes === 1, bookId: String(info.id) };
}
