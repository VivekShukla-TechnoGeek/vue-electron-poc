import { app, BrowserWindow } from "electron";
import { fileURLToPath } from "url";
import path, { dirname } from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
let mainWindow;
const waitForViteServer = () => {
  return new Promise((resolve) => {
    const interval = setInterval(() => {
      fetch(process.env.VITE_DEV_SERVER_URL).then(() => {
        clearInterval(interval);
        resolve();
      }).catch(() => console.log("🔄 Waiting for Vite Dev Server..."));
    }, 1e3);
  });
};
const createMainWindow = async () => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    resizable: true,
    icon: path.join(__dirname, "icons/icon.png"),
    webPreferences: {
      nodeIntegration: true
    },
    show: false
    // Prevent flickering
  });
  if (process.env.VITE_DEV_SERVER_URL) {
    console.log("⏳ Waiting for Vite Dev Server...");
    await waitForViteServer();
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }
  mainWindow.once("ready-to-show", () => {
    console.log("🚀 Window is ready, showing it now.");
    mainWindow.show();
    mainWindow.focus();
    mainWindow.webContents.openDevTools();
    const platform = process.platform;
    if (platform === "darwin") {
      if (app.dock && typeof app.dock.show === "function") {
        app.dock.show();
      }
      console.log("App running on macOS");
    } else if (platform === "win32") {
      app.setAppUserModelId("com.yourcompany.yourapp");
      console.log("App running on Windows");
    } else if (platform === "linux") {
      console.log("App running on Linux");
    } else {
      console.warn(`Unsupported OS platform: ${platform}`);
    }
  });
  mainWindow.webContents.session.webRequest.onHeadersReceived(
    (details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          "Content-Security-Policy": [
            "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
          ]
        }
      });
    }
  );
};
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  console.log(app);
} else {
  app.whenReady().then(() => {
    createMainWindow();
    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createMainWindow();
      }
    });
  });
  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      app.quit();
    }
  });
}
