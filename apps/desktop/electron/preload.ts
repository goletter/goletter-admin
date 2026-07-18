import { contextBridge, ipcRenderer } from 'electron';

function createNewWindowButton() {
  if (document.querySelector('[data-desktop-new-window-button]')) {
    return;
  }

  const button = document.createElement('button');
  button.dataset.desktopNewWindowButton = 'true';
  button.type = 'button';
  button.title = '打开新窗口';
  button.textContent = '+';
  button.style.cssText = [
    'position: fixed',
    'right: 14px',
    'top: 10px',
    'z-index: 2147483647',
    'width: 30px',
    'height: 30px',
    'border: 1px solid rgba(15, 23, 42, 0.16)',
    'border-radius: 6px',
    'background: rgba(255, 255, 255, 0.92)',
    'box-shadow: 0 4px 12px rgba(15, 23, 42, 0.12)',
    'color: #0f172a',
    'cursor: pointer',
    'font: 600 20px/26px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  ].join(';');

  button.addEventListener('mouseenter', () => {
    button.style.background = '#ffffff';
  });
  button.addEventListener('mouseleave', () => {
    button.style.background = 'rgba(255, 255, 255, 0.92)';
  });
  button.addEventListener('click', () => {
    void ipcRenderer.invoke('desktop:open-window');
  });

  document.body.append(button);
}

window.addEventListener('DOMContentLoaded', createNewWindowButton);

contextBridge.exposeInMainWorld('desktop', {
  openWindow: (url?: string) => ipcRenderer.invoke('desktop:open-window', url),
  platform: process.platform,
});
