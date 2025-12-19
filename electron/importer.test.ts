import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import fs from "fs";
import os from "os";
import path from "path";
import db from "./db";
import {
  scanFolder,
  importFolder,
  listBooks,
  getBookImage,
  updateLastPage,
  getBook,
} from "./importer";

let tempRoot: string;
let bookDir: string;

// テスト用の一時ディレクトリ & DB初期化
beforeAll(() => {
  // osのtemp配下に一時フォルダ作成
  tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "manga-test-"));
  bookDir = path.join(tempRoot, "book1");
  fs.mkdirSync(bookDir);

  // ダミー画像ファイルを作成
  fs.writeFileSync(path.join(bookDir, "1.jpg"), Buffer.from("dummy1"));
  fs.writeFileSync(path.join(bookDir, "2.png"), Buffer.from("dummy2"));
  fs.writeFileSync(path.join(bookDir, "10.jpeg"), Buffer.from("dummy10"));
  // 対象外ファイル
  fs.writeFileSync(path.join(bookDir, "notes.txt"), "ignore");
});

afterAll(() => {
  // 一時フォルダ削除
  fs.rmSync(tempRoot, { recursive: true, force: true });
});

// 各テスト前にDBをクリーンにする
beforeEach(() => {
  db.exec("DELETE FROM images; DELETE FROM books;");
});

describe("scanFolder", () => {
  it("throws when folder eos not exist", () => {
    expect(() => scanFolder(path.join(tempRoot, "does-not-exist"))).toThrow();
  });
});
