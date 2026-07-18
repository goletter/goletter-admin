import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('desktop', {
  openWindow: (url?: string) => ipcRenderer.invoke('desktop:open-window', url),
  platform: process.platform,
});
