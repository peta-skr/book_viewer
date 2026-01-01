import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("mangata", {
  ping: () => "pong",
  pickFolder: () => ipcRenderer.invoke("pick-folder"),
  addFolder: (absPath: string, title: string) =>
    ipcRenderer.invoke("add-folder", absPath, title),
  listFolder: () => ipcRenderer.invoke("list-folder"),
  loadImage: (filePath: string) => ipcRenderer.invoke("load-image", filePath),
  loadBook: (bookId: string, pageIndex: number) =>
    ipcRenderer.invoke("load-book", bookId, pageIndex),
  updateLastPage: (bookId: string, pageIndex: number) =>
    ipcRenderer.invoke("update-last-page", bookId, pageIndex),
  loadThumbnail: (bookId: string) =>
    ipcRenderer.invoke("load-thumbnail", bookId),
  renameBook: (bookId: string, title: string) =>
    ipcRenderer.invoke("rename-book", bookId, title),
  removeBook: (bookId: string) => ipcRenderer.invoke("remove-book", bookId),
  existBook: (folderPath: string) =>
    ipcRenderer.invoke("exist-book", folderPath),
  overwriteBook: (folderPath: string, title: string) =>
    ipcRenderer.invoke("overwrite-book", folderPath, title),
});
