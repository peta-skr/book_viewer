import { contextBridge } from "electron";

contextBridge.exposeInMainWorld("mangata", {
  ping: () => "pong",
});
