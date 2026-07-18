import type {
  BrowserWindowConstructorOptions,
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
    title: 'Goletter Admin',
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

async function createWindow(url?: string) {
  const win = new BrowserWindow(getWindowOptions());

  win.once('ready-to-show', () => {
    win.show();
  });

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (isInternalAppUrl(url)) {
      void createWindow(url);
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
            void createWindow();
          },
          label: 'New Window',
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

ipcMain.handle('desktop:open-window', async (_event, url?: string) => {
  await createWindow(url);
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
