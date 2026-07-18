import type {
  BrowserWindowConstructorOptions,
  IpcMainInvokeEvent,
  MenuItemConstructorOptions,
} from 'electron';
import type { IncomingMessage, ServerResponse } from 'node:http';

import { app, BrowserWindow, ipcMain, Menu, shell } from 'electron';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const desktopApiTarget =
  process.env.ELECTRON_API_TARGET ?? 'https://floletic.test.geekdance.cn/api';
const devServerUrl =
  process.env.ELECTRON_DEV_SERVER_URL ?? 'http://127.0.0.1:5173/admin';
const gotSingleInstanceLock = app.requestSingleInstanceLock();
let desktopServerUrl: string | undefined;

if (!gotSingleInstanceLock) {
  app.quit();
}

function getWebEntry() {
  return path.join(process.resourcesPath, 'web/index.html');
}

function getWebRoot() {
  return path.join(process.resourcesPath, 'web');
}

function getMimeType(filePath: string) {
  const mimeTypes: Record<string, string> = {
    '.css': 'text/css; charset=utf-8',
    '.html': 'text/html; charset=utf-8',
    '.ico': 'image/x-icon',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
  };

  return mimeTypes[path.extname(filePath)] ?? 'application/octet-stream';
}

function readRequestBody(req: IncomingMessage) {
  if (req.method === 'GET' || req.method === 'HEAD') {
    return undefined;
  }

  return new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });
    req.on('end', () => {
      resolve(Buffer.concat(chunks));
    });
    req.on('error', reject);
  });
}

async function proxyApiRequest(req: IncomingMessage, res: ServerResponse) {
  try {
    const requestUrl = new URL(req.url ?? '/', 'http://127.0.0.1');
    const apiBase = new URL(
      desktopApiTarget.endsWith('/') ? desktopApiTarget : `${desktopApiTarget}/`,
    );
    const apiPath = requestUrl.pathname.replace(/^\/api\/?/, '');
    const targetUrl = new URL(`${apiPath}${requestUrl.search}`, apiBase);
    const headers = new Headers();

    for (const [key, value] of Object.entries(req.headers)) {
      const lowerKey = key.toLowerCase();
      if (
        value === undefined ||
        ['connection', 'content-length', 'host'].includes(lowerKey)
      ) {
        continue;
      }

      if (Array.isArray(value)) {
        for (const item of value) {
          headers.append(key, item);
        }
      } else {
        headers.set(key, value);
      }
    }

    const response = await fetch(targetUrl, {
      body: await readRequestBody(req),
      headers,
      method: req.method,
    });
    const responseBody = Buffer.from(await response.arrayBuffer());

    res.statusCode = response.status;
    response.headers.forEach((value, key) => {
      if (!['content-encoding', 'content-length'].includes(key.toLowerCase())) {
        res.setHeader(key, value);
      }
    });
    res.end(responseBody);
  } catch (error) {
    res.statusCode = 502;
    res.setHeader('content-type', 'application/json; charset=utf-8');
    res.end(
      JSON.stringify({
        message: error instanceof Error ? error.message : 'API proxy failed',
      }),
    );
  }
}

async function serveStaticFile(req: IncomingMessage, res: ServerResponse) {
  const webRoot = getWebRoot();
  const requestUrl = new URL(req.url ?? '/', 'http://127.0.0.1');
  const safePath = path
    .normalize(decodeURIComponent(requestUrl.pathname))
    .replace(/^(\.\.[/\\])+/, '');
  const requestedFile =
    safePath === '/' ? getWebEntry() : path.join(webRoot, safePath);

  try {
    const fileStat = await stat(requestedFile);
    if (!fileStat.isFile()) {
      throw new Error('Not a file');
    }

    res.setHeader('content-type', getMimeType(requestedFile));
    createReadStream(requestedFile).pipe(res);
  } catch {
    res.setHeader('content-type', getMimeType(getWebEntry()));
    createReadStream(getWebEntry()).pipe(res);
  }
}

function startDesktopServer() {
  if (desktopServerUrl) {
    return Promise.resolve(desktopServerUrl);
  }

  const server = createServer((req, res) => {
    if (req.url?.startsWith('/api')) {
      void proxyApiRequest(req, res);
      return;
    }

    void serveStaticFile(req, res);
  });

  return new Promise<string>((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      if (typeof address === 'object' && address) {
        desktopServerUrl = `http://127.0.0.1:${address.port}`;
        resolve(desktopServerUrl);
      } else {
        reject(new Error('Failed to start desktop server'));
      }
    });
  });
}

function getWindowOptions(): BrowserWindowConstructorOptions {
  return {
    height: 900,
    minHeight: 720,
    minWidth: 1024,
    show: false,
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'hidden',
    title: 'Goletter Admin',
    trafficLightPosition: { x: 14, y: 18 },
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(dirname, 'preload.js'),
      sandbox: false,
    },
    width: 1440,
  };
}

async function getAppUrl(url?: string) {
  const baseUrl = app.isPackaged ? await startDesktopServer() : devServerUrl;

  if (!url) {
    return baseUrl;
  }

  if (url.startsWith('#')) {
    return `${baseUrl}${url}`;
  }

  return new URL(url, baseUrl).toString();
}

function isInternalAppUrl(url: string) {
  if (url === 'about:blank') {
    return true;
  }

  try {
    const targetUrl = new URL(url);
    const appUrls = [devServerUrl, desktopServerUrl].filter(Boolean) as string[];

    return appUrls.some((appUrl) => {
      return new URL(appUrl).origin === targetUrl.origin;
    });
  } catch {
    return url.startsWith('/') || url.startsWith('#');
  }
}

function injectDesktopNewWindowButton(win: BrowserWindow) {
  win.webContents.on('did-finish-load', () => {
    void win.webContents.insertCSS(`
      html,
      body {
        height: 100vh !important;
        overflow: hidden !important;
        padding: 0 !important;
        width: 100vw !important;
      }

      body {
        position: relative !important;
      }

      #app {
        bottom: 0 !important;
        display: block !important;
        height: 100% !important;
        left: 0 !important;
        overflow-x: hidden !important;
        overflow-y: auto !important;
        position: absolute !important;
        right: 0 !important;
        top: 0 !important;
        transform: translateZ(0) !important;
        width: 100% !important;
      }

      [data-desktop-tab-panels] {
        bottom: 0 !important;
        box-sizing: border-box !important;
        height: calc(100vh - 56px) !important;
        left: 0 !important;
        overflow: hidden !important;
        position: fixed !important;
        right: 0 !important;
        top: 56px !important;
        width: 100vw !important;
        z-index: 1 !important;
      }

      [data-desktop-tab-frame] {
        border: 0 !important;
        bottom: 0 !important;
        box-sizing: border-box !important;
        display: block !important;
        height: 100% !important;
        left: 0 !important;
        overflow-x: hidden !important;
        overflow-y: auto !important;
        position: absolute !important;
        right: 0 !important;
        top: 0 !important;
        width: 100% !important;
      }

      [data-desktop-browser-bar] {
        -webkit-app-region: drag;
        align-items: end;
        background: #b7eef7;
        box-sizing: border-box;
        display: flex;
        gap: 2px;
        height: 56px;
        left: 0;
        padding: 18px 12px 0 86px;
        position: fixed;
        right: 0;
        top: 0;
        user-select: none;
        z-index: 2147483647;
      }

      [data-desktop-browser-tab] {
        -webkit-app-region: no-drag;
        align-items: center;
        background: transparent;
        border-radius: 12px 12px 0 0;
        box-sizing: border-box;
        color: #202124;
        display: inline-flex;
        gap: 9px;
        font: 13px/1.2 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        height: 37px;
        max-width: 260px;
        min-width: 220px;
        padding: 0 34px 0 13px;
        position: relative;
      }

      [data-desktop-browser-tab][data-active="true"] {
        background: #ffffff;
      }

      [data-desktop-browser-tab]::before,
      [data-desktop-browser-tab]::after {
        bottom: 0;
        content: "";
        height: 12px;
        position: absolute;
        width: 12px;
      }

      [data-desktop-browser-tab]::before {
        background: radial-gradient(circle at 0 0, transparent 12px, #ffffff 13px);
        left: -12px;
        opacity: 0;
      }

      [data-desktop-browser-tab]::after {
        background: radial-gradient(circle at 100% 0, transparent 12px, #ffffff 13px);
        right: -12px;
        opacity: 0;
      }

      [data-desktop-browser-tab][data-active="true"]::before,
      [data-desktop-browser-tab][data-active="true"]::after {
        opacity: 1;
      }

      [data-desktop-browser-tab]:not([data-active="true"]):hover {
        background: rgba(255, 255, 255, 0.38);
      }

      [data-desktop-browser-tab-icon] {
        flex: 0 0 16px;
        height: 16px;
        object-fit: contain;
        width: 16px;
      }

      [data-desktop-browser-tab-title] {
        flex: 1;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      [data-desktop-browser-tab-close] {
        align-items: center;
        border-radius: 999px;
        color: #5f6368;
        display: inline-flex;
        height: 18px;
        justify-content: center;
        font-size: 18px;
        position: absolute;
        right: 9px;
        top: 9px;
        width: 18px;
      }

      [data-desktop-browser-tab-close]:hover {
        background: rgba(60, 64, 67, 0.08);
      }

      [data-desktop-new-window-button] {
        -webkit-app-region: no-drag;
        align-items: center !important;
        align-self: start !important;
        background: transparent !important;
        border: 0 !important;
        border-radius: 8px !important;
        color: #202124 !important;
        cursor: pointer !important;
        display: inline-flex !important;
        flex: 0 0 34px !important;
        height: 34px !important;
        justify-content: center !important;
        margin: 0 10px 0 4px !important;
        padding: 0 !important;
        pointer-events: auto !important;
        position: static !important;
        width: 34px !important;
        z-index: 2147483647 !important;
      }

      [data-desktop-new-window-button]:hover {
        background: rgba(60, 64, 67, 0.08) !important;
      }

      [data-desktop-new-window-button] svg {
        height: 18px !important;
        pointer-events: none !important;
        width: 18px !important;
      }

      [data-desktop-new-window-button][data-floating="true"] {
        background: rgba(255, 255, 255, 0.95) !important;
        border: 1px solid rgba(15, 23, 42, 0.18) !important;
        box-shadow: 0 4px 12px rgba(15, 23, 42, 0.16) !important;
        position: fixed !important;
        right: 14px !important;
        top: 10px !important;
      }
    `);

    void win.webContents.executeJavaScript(`
      (() => {
        if (document.querySelector('[data-desktop-browser-bar]')) {
          return;
        }

        const bar = document.createElement('div');
        bar.dataset.desktopBrowserBar = 'true';

        const panels = document.createElement('div');
        panels.dataset.desktopTabPanels = 'true';
        panels.style.cssText = [
          'bottom: 0',
          'height: calc(100vh - 56px)',
          'left: 0',
          'overflow: hidden',
          'position: fixed',
          'right: 0',
          'top: 56px',
          'width: 100vw',
          'z-index: 1',
        ].join(';');

        let tabIndex = 0;

        function layoutPanels() {
          const width = Math.max(window.innerWidth, 1);
          const height = Math.max(window.innerHeight - 56, 1);

          Object.assign(panels.style, {
            bottom: '0px',
            height: height + 'px',
            left: '0px',
            overflow: 'hidden',
            position: 'fixed',
            right: '0px',
            top: '56px',
            width: width + 'px',
            zIndex: '1',
          });

          for (const panel of panels.querySelectorAll('[data-desktop-tab-panel]')) {
            if (!(panel instanceof HTMLElement)) {
              continue;
            }

            Object.assign(panel.style, {
              bottom: '0px',
              height: height + 'px',
              left: '0px',
              overflowX: 'hidden',
              overflowY: 'auto',
              position: 'absolute',
              right: '0px',
              top: '0px',
              width: width + 'px',
            });

            if (panel instanceof HTMLIFrameElement) {
              panel.setAttribute('height', String(height));
              panel.setAttribute('width', String(width));
            }
          }
        }

        function getPanelTitle(panel, fallbackTitle) {
          try {
            if (panel instanceof HTMLIFrameElement) {
              return panel.contentDocument?.title || fallbackTitle;
            }

            return document.title || fallbackTitle;
          } catch {
            return fallbackTitle;
          }
        }

        function updateTabTitle(tab, panel) {
          const titleElement = tab.querySelector('[data-desktop-browser-tab-title]');
          if (!(titleElement instanceof HTMLElement)) {
            return;
          }

          const fallbackTitle = tab.dataset.fallbackTitle || 'Goletter Admin';
          titleElement.textContent = getPanelTitle(panel, fallbackTitle);
        }

        function setActiveTab(activeTab) {
          for (const item of bar.querySelectorAll('[data-desktop-browser-tab]')) {
            const isActive = item === activeTab;
            item.dataset.active = String(isActive);

            const panelId = item.getAttribute('data-panel-id');
            const panel = panelId && document.querySelector(
              '[data-desktop-tab-panel="' + panelId + '"]',
            );
            if (panel instanceof HTMLElement) {
              panel.style.display = '';
              panel.style.pointerEvents = isActive ? 'auto' : 'none';
              panel.style.visibility = isActive ? 'visible' : 'hidden';
              panel.style.zIndex = isActive ? '2' : '1';
              layoutPanels();
              if (isActive) {
                updateTabTitle(item, panel);
              }
            }
          }
        }

        function syncTabTitle(tab, panel, fallbackTitle) {
          const updateTitle = () => {
            updateTabTitle(tab, panel);
          };

          updateTitle();

          if (panel instanceof HTMLIFrameElement) {
            panel.addEventListener('load', () => {
              updateTitle();
              try {
                const titleNode = panel.contentDocument?.querySelector('title');
                if (titleNode) {
                  new MutationObserver(updateTitle).observe(titleNode, {
                    childList: true,
                    characterData: true,
                    subtree: true,
                  });
                }
              } catch {
                updateTitle();
              }
            });
            window.setInterval(updateTitle, 1000);
            return;
          }

          const titleNode = document.querySelector('title');
          if (titleNode) {
            new MutationObserver(updateTitle).observe(titleNode, {
              childList: true,
              characterData: true,
              subtree: true,
            });
          }
        }

        function createTab(titleText, panel) {
          const panelId = 'desktop-tab-' + ++tabIndex;
          panel.dataset.desktopTabPanel = panelId;
          panel.style.display = '';
          panel.style.pointerEvents = 'auto';
          panel.style.visibility = 'visible';
          panel.style.zIndex = '2';
          layoutPanels();

          const tab = document.createElement('div');
          tab.dataset.desktopBrowserTab = 'true';
          tab.dataset.active = 'true';
          tab.dataset.fallbackTitle = titleText;
          tab.dataset.panelId = panelId;

          const icon = document.createElement('img');
          icon.dataset.desktopBrowserTabIcon = 'true';
          icon.alt = '';
          icon.src = new URL('./static/images/logo.png', window.location.href).toString();

          const title = document.createElement('span');
          title.dataset.desktopBrowserTabTitle = 'true';
          title.textContent = titleText;

          const close = document.createElement('span');
          close.dataset.desktopBrowserTabClose = 'true';
          close.textContent = '×';
          close.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            if (bar.querySelectorAll('[data-desktop-browser-tab]').length <= 1) {
              return;
            }

            const nextTab =
              tab.previousElementSibling?.matches('[data-desktop-browser-tab]') &&
              tab.previousElementSibling ||
              tab.nextElementSibling?.matches('[data-desktop-browser-tab]') &&
              tab.nextElementSibling;
            tab.remove();
            panel.remove();
            if (nextTab instanceof HTMLElement) {
              setActiveTab(nextTab);
            }
          });

          tab.addEventListener('click', () => {
            setActiveTab(tab);
          });

          tab.append(icon, title, close);
          syncTabTitle(tab, panel, titleText);
          setActiveTab(tab);
          return tab;
        }

        const button = document.createElement('button');
        button.dataset.desktopNewWindowButton = 'true';
        button.setAttribute('aria-label', '打开新窗口');
        button.type = 'button';
        button.title = '打开新窗口';
        button.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5c.41 0 .75.34.75.75v5.5h5.5a.75.75 0 0 1 0 1.5h-5.5v5.5a.75.75 0 0 1-1.5 0v-5.5h-5.5a.75.75 0 0 1 0-1.5h5.5v-5.5c0-.41.34-.75.75-.75Z" fill="currentColor"/></svg>';
        button.addEventListener('click', async (event) => {
          event.preventDefault();
          event.stopPropagation();

          const frame = document.createElement('iframe');
          frame.dataset.desktopTabFrame = 'true';
          frame.style.cssText = [
            'border: 0',
            'bottom: 0',
            'display: block',
            'height: 1px',
            'left: 0',
            'position: absolute',
            'right: 0',
            'top: 0',
            'width: 1px',
          ].join(';');
          frame.setAttribute('src', button.dataset.nextUrl || window.location.href);
          panels.append(frame);
          layoutPanels();

          bar.insertBefore(createTab('新标签页', frame), button);
        });

        const appPanel = document.querySelector('#app');
        if (!appPanel) {
          return;
        }

        panels.append(appPanel);
        document.body.append(panels);
        bar.append(createTab(document.title || 'Goletter Admin', appPanel), button);
        document.body.prepend(bar);
        layoutPanels();
        window.addEventListener('resize', layoutPanels);
      })();
    `);
  });
}

async function createWindow(url?: string) {
  const win = new BrowserWindow(getWindowOptions());

  win.once('ready-to-show', () => {
    win.show();
  });

  injectDesktopNewWindowButton(win);

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (isInternalAppUrl(url)) {
      void win.webContents.executeJavaScript(`
        (() => {
          const button = document.querySelector('[data-desktop-new-window-button]');
          if (!(button instanceof HTMLElement)) {
            return;
          }

          button.dataset.nextUrl = ${JSON.stringify(url)};
          button.click();
          delete button.dataset.nextUrl;
        })();
      `);
      return { action: 'deny' };
    }

    void shell.openExternal(url);
    return { action: 'deny' };
  });

  await win.loadURL(await getAppUrl(url));

  if (!app.isPackaged) {
    win.webContents.openDevTools({ mode: 'detach' });
  }
}

function setupApplicationMenu() {
  const template: MenuItemConstructorOptions[] = [
    {
      label: app.name,
      submenu: [
        {
          accelerator: 'CommandOrControl+N',
          click: () => {
            const focusedWindow = BrowserWindow.getFocusedWindow();
            void focusedWindow?.webContents.executeJavaScript(
              `document.querySelector('[data-desktop-new-window-button]')?.click();`,
            );
          },
          label: 'New Tab',
        },
        { type: 'separator' },
        { role: 'quit' },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' },
      ],
    },
    {
      label: 'Window',
      submenu: [{ role: 'minimize' }, { role: 'close' }],
    },
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

app.on('second-instance', () => {
  void createWindow();
});

ipcMain.handle('desktop:open-window', async (event: IpcMainInvokeEvent) => {
  await event.sender.executeJavaScript(
    `document.querySelector('[data-desktop-new-window-button]')?.click();`,
  );
});

app.whenReady().then(async () => {
  setupApplicationMenu();
  await createWindow();

  app.on('activate', async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      await createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
