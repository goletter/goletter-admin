import { contextBridge, ipcRenderer } from 'electron';

function openDesktopWindow(url?: string) {
  return ipcRenderer.invoke('desktop:open-window', url);
}

contextBridge.exposeInMainWorld('desktop', {
  openWindow: openDesktopWindow,
  platform: process.platform,
});
