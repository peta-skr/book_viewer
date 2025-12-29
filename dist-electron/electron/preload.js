"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld("mangata", {
    ping: () => "pong",
    pickFolder: () => electron_1.ipcRenderer.invoke("pick-folder"),
    addFolder: (absPath, title) => electron_1.ipcRenderer.invoke("add-folder", absPath, title),
    listFolder: () => electron_1.ipcRenderer.invoke("list-folder"),
    loadImage: (filePath) => electron_1.ipcRenderer.invoke("load-image", filePath),
    loadBook: (bookId, pageIndex) => electron_1.ipcRenderer.invoke("load-book", bookId, pageIndex),
    updateLastPage: (bookId, pageIndex) => electron_1.ipcRenderer.invoke("update-last-page", bookId, pageIndex),
    loadThumbnail: (bookId) => electron_1.ipcRenderer.invoke("load-thumbnail", bookId),
});
