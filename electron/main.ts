// electron/main.ts
import { app, BrowserWindow, dialog, ipcMain } from "electron";
import path from "node:path";
import { importFolder, listBooks, scanFolder } from "./importer";
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

ipcMain.handle("add-folder", async (_event, absPath: string) => {
  return importFolder(absPath);
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

app.whenReady().then(createWindow);
