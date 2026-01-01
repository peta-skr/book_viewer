"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// electron/main.ts
const electron_1 = require("electron");
const node_path_1 = __importDefault(require("node:path"));
const importer_1 = require("./importer");
const promises_1 = __importDefault(require("node:fs/promises"));
let win = null;
function createWindow() {
    win = new electron_1.BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: node_path_1.default.join(__dirname, "preload.js"),
        },
    });
    // devはVite、prodはビルド済みファイルを読む
    if (process.env.NODE_ENV !== "production") {
        win.loadURL("http://localhost:5173");
        win.webContents.openDevTools();
    }
    else {
        win.loadFile(node_path_1.default.join(__dirname, "../dist/index.html"));
    }
}
electron_1.ipcMain.handle("pick-folder", async () => {
    // エクスプローラを開く
    const result = await electron_1.dialog.showOpenDialog(win, {
        title: "フォルダを選択",
        properties: ["openDirectory"],
    });
    return result.filePaths[0];
});
electron_1.ipcMain.handle("add-folder", async (_event, absPath, title) => {
    return (0, importer_1.importFolder)(absPath, title);
});
electron_1.ipcMain.handle("list-folder", async () => {
    return (0, importer_1.listBooks)();
});
electron_1.ipcMain.handle("load-image", async (_event, filePath) => {
    const buf = await promises_1.default.readFile(filePath);
    const ext = node_path_1.default.extname(filePath).toLowerCase();
    const mime = ext === ".png"
        ? "image/png"
        : ext === ".webp"
            ? "image/webp"
            : "image/jpeg"; // 雑に判定
    return `data:${mime};base64;${buf.toString("base64")}`;
});
electron_1.ipcMain.handle("load-book", async (_event, bookId, pageIndex) => {
    return (0, importer_1.getBookImagePayload)(bookId, pageIndex);
});
electron_1.ipcMain.handle("update-last-page", (_event, bookId, pageIndex) => {
    (0, importer_1.updateLastPage)(bookId, pageIndex);
});
electron_1.ipcMain.handle("load-thumbnail", async (_event, bookId) => {
    return (0, importer_1.getBookThumbnail)(bookId);
});
electron_1.ipcMain.handle("rename-book", (_event, bookId, title) => {
    const ok = (0, importer_1.renameBook)(bookId, title);
    return ok;
});
electron_1.ipcMain.handle("remove-book", (_event, bookId) => {
    const ok = (0, importer_1.removeBook)(bookId);
    return ok;
});
electron_1.ipcMain.handle("exist-book", (_event, folderPath) => {
    const result = (0, importer_1.findBookByFolderPath)(folderPath);
    return result;
});
electron_1.ipcMain.handle("overwrite-book", (_event, absPath, title) => {
    const result = (0, importer_1.overwriteBookByFolderPath)(absPath, title);
    return result;
});
electron_1.app.whenReady().then(createWindow);
