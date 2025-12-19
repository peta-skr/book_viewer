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
exports.importFolder = db_1.default.transaction((absPath) => {
    const files = scanFolder(absPath);
    const title = path_1.default.basename(absPath);
    const cover = files[0];
    // booksの登録
    const insertBooks = db_1.default.prepare(`
    INSERT INTO books (title, folder_path, cover_path ,page_count, last_page_index)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(folder_path) DO UPDATE SET
      title=excluded.title,
      cover_path=excluded.cover_path,
      page_count=excluded.page_count
    `);
    const { lastInsertRowid } = insertBooks.run(title, absPath, cover, files.length, 0);
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
// 一覧表示取得
async function listBooks() {
    let books = db_1.default
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
    });
    books = await Promise.all(books.map(async (book) => {
        const buf = await fs_1.default.promises.readFile(book.coverPath);
        // 拡張子から MIME を判定
        const ext = path_1.default.extname(book.coverPath).toLowerCase();
        const mime = ext === ".png"
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
    }));
    return books;
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
