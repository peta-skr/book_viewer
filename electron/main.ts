// electron/main.ts
import { app, BrowserWindow, dialog, ipcMain } from "electron";
import path from "node:path";
import {
  findBookByFolderPath,
  getBookImagePayload,
  getBookThumbnail,
  importFolder,
  listBooks,
  overwriteBookByFolderPath,
  removeBook,
  renameBook,
  scanFolder,
  updateLastPage,
} from "./importer";
import fs from "node:fs/promises";

let win: BrowserWindow | null = null;

function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // devはVite、prodはビルド済みファイルを読む
  if (process.env.NODE_ENV !== "production") {
    win.loadURL("http://localhost:5173");
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, "../dist/index.html"));
  }
}

ipcMain.handle("pick-folder", async () => {
  // エクスプローラを開く
  const result = await dialog.showOpenDialog(win!, {
    title: "フォルダを選択",
    properties: ["openDirectory"],
  });

  return result.filePaths[0];
});

ipcMain.handle("add-folder", async (_event, absPath: string, title: string) => {
  return importFolder(absPath, title);
});

ipcMain.handle("list-folder", async () => {
  return listBooks();
});

ipcMain.handle("load-image", async (_event, filePath: string) => {
  const buf = await fs.readFile(filePath);
  const ext = path.extname(filePath).toLowerCase();

  const mime =
    ext === ".png"
      ? "image/png"
      : ext === ".webp"
      ? "image/webp"
      : "image/jpeg"; // 雑に判定

  return `data:${mime};base64;${buf.toString("base64")}`;
});

ipcMain.handle(
  "load-book",
  async (_event, bookId: string, pageIndex: number) => {
    return getBookImagePayload(bookId, pageIndex);
  }
);

ipcMain.handle(
  "update-last-page",
  (_event, bookId: number, pageIndex: number) => {
    updateLastPage(bookId, pageIndex);
  }
);

ipcMain.handle("load-thumbnail", async (_event, bookId: string) => {
  return getBookThumbnail(bookId);
});

ipcMain.handle("rename-book", (_event, bookId: string, title: string) => {
  const ok = renameBook(bookId, title);
  return ok;
});

ipcMain.handle("remove-book", (_event, bookId: string) => {
  const ok = removeBook(bookId);
  return ok;
});

ipcMain.handle("exist-book", (_event, folderPath: string) => {
  const result = findBookByFolderPath(folderPath);
  return result;
});

ipcMain.handle("overwrite-book", (_event, absPath: string, title: string) => {
  const result = overwriteBookByFolderPath(absPath, title);
  return result;
});

app.whenReady().then(createWindow);
