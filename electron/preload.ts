import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("mangata", {
  ping: () => "pong",
  pickFolder: () => ipcRenderer.invoke("pick-folder"),
  addFolder: (absPath: string) => ipcRenderer.invoke("add-folder", absPath),
  listFolder: () => ipcRenderer.invoke("list-folder"),
  loadImage: (filePath: string) => ipcRenderer.invoke("load-image", filePath),
  loadBook: (bookId: string, pageIndex: number) =>
    ipcRenderer.invoke("load-book", bookId, pageIndex),
  updateLastPage: (bookId: string, pageIndex: number) =>
    ipcRenderer.invoke("update-last-page", bookId, pageIndex),
  loadThumbnail: (bookId: string) =>
    ipcRenderer.invoke("load-thumbnail", bookId),
});
