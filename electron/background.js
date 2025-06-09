import { app, BrowserWindow } from 'electron';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';

// Define __dirname manually for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let mainWindow;

// ✅ Function to wait for Vite Dev Server (Prevents "ERR_CONNECTION_REFUSED")
const waitForViteServer = () => {
  return new Promise((resolve) => {
    const interval = setInterval(() => {
      fetch(process.env.VITE_DEV_SERVER_URL)
        .then(() => {
          clearInterval(interval);
          resolve();
        })
        .catch(() => console.log("🔄 Waiting for Vite Dev Server..."));
    }, 1000); // Check every second
  });
};

// ✅ Create Window Function (Reused for macOS Dock Relaunch)
const createMainWindow = async () => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    resizable: false,
    icon: path.join(__dirname, 'icons/icon.png'),
    webPreferences: {
      nodeIntegration: true
    },
    show: false, // Prevent flickering
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    console.log("⏳ Waiting for Vite Dev Server...");
    await waitForViteServer(); // Wait until Vite is ready
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // ✅ Show the window only when ready
  mainWindow.once('ready-to-show', () => {
    console.log("🚀 Window is ready, showing it now.");
    mainWindow.show();
    mainWindow.focus();
    mainWindow.webContents.openDevTools(); // ✅ Open DevTools for debugging (optional)
    if (process.platform === 'darwin') {
      app.dock.show(); // ✅ Fixes hidden window issue on macOS
    }
  });

  // ✅ Security Fix: Set Content Security Policy (Avoids "unsafe-eval" warning)
  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        "Content-Security-Policy": ["default-src 'self'; script-src 'self' 'unsafe-inline'"]
      }
    });
  });
};

// ✅ App Ready
app.whenReady().then(() => {
  createMainWindow();

  // Ensure app opens when clicking the dock icon (macOS)
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

// ✅ Fix: Quit app properly when all windows are closed (Except on macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
