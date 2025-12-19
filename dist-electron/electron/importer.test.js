"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const fs_1 = __importDefault(require("fs"));
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
const db_1 = __importDefault(require("./db"));
const importer_1 = require("./importer");
let tempRoot;
let bookDir;
// テスト用の一時ディレクトリ & DB初期化
(0, vitest_1.beforeAll)(() => {
    // osのtemp配下に一時フォルダ作成
    tempRoot = fs_1.default.mkdtempSync(path_1.default.join(os_1.default.tmpdir(), "manga-test-"));
    bookDir = path_1.default.join(tempRoot, "book1");
    fs_1.default.mkdirSync(bookDir);
    // ダミー画像ファイルを作成
    fs_1.default.writeFileSync(path_1.default.join(bookDir, "1.jpg"), Buffer.from("dummy1"));
    fs_1.default.writeFileSync(path_1.default.join(bookDir, "2.png"), Buffer.from("dummy2"));
    fs_1.default.writeFileSync(path_1.default.join(bookDir, "10.jpeg"), Buffer.from("dummy10"));
    // 対象外ファイル
    fs_1.default.writeFileSync(path_1.default.join(bookDir, "notes.txt"), "ignore");
});
(0, vitest_1.afterAll)(() => {
    // 一時フォルダ削除
    fs_1.default.rmSync(tempRoot, { recursive: true, force: true });
});
// 各テスト前にDBをクリーンにする
(0, vitest_1.beforeEach)(() => {
    db_1.default.exec("DELETE FROM images; DELETE FROM books;");
});
(0, vitest_1.describe)("scanFolder", () => {
    (0, vitest_1.it)("throws when folder eos not exist", () => {
        (0, vitest_1.expect)(() => (0, importer_1.scanFolder)(path_1.default.join(tempRoot, "does-not-exist"))).toThrow();
    });
});
