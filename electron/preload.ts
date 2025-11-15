import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("mangata", {
  ping: () => "pong",
  pickFolder: () => ipcRenderer.invoke("pick-folder"),
  addFolder: (absPath: string) => ipcRenderer.invoke("add-folder", absPath),
  listFolder: () => ipcRenderer.invoke("list-folder"),
  loadImage: (filePath: string) => ipcRenderer.invoke("load-image", filePath),
});
