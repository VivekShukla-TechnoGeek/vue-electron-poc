import { app, BrowserWindow } from "electron";
import { fileURLToPath } from "url";
import { dirname } from "path";
import path from "path";

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
    resizable: true,
    icon: path.join(__dirname, "icons/icon.png"),
    webPreferences: {
      nodeIntegration: true,
    },
    show: false, // Prevent flickering
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    console.log("⏳ Waiting for Vite Dev Server...");
    await waitForViteServer(); // Wait until Vite is ready
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }

  // ✅ Show the window only when ready
  mainWindow.once("ready-to-show", () => {
    console.log("🚀 Window is ready, showing it now.");
    mainWindow.show();
    mainWindow.focus();
    mainWindow.webContents.openDevTools(); // ✅ Open DevTools for debugging (optional)
    // if (process.platform === "darwin") {
    //   app.dock.show(); // ✅ Fixes hidden window issue on macOS
    // }
    const platform = process.platform;

    // 🌐 OS-specific logic
    if (platform === "darwin") {
      // macOS: Ensure dock icon is visible
      if (app.dock && typeof app.dock.show === "function") {
        app.dock.show();
      }
      console.log("App running on macOS");
    } else if (platform === "win32") {
      // Windows: Set App User Model ID for notifications/taskbar
      app.setAppUserModelId("com.yourcompany.yourapp");
      console.log("App running on Windows");
    } else if (platform === "linux") {
      // Linux-specific logic (if needed)
      console.log("App running on Linux");
    } else {
      console.warn(`Unsupported OS platform: ${platform}`);
    }
  });

  // ✅ Security Fix: Set Content Security Policy (Avoids "unsafe-eval" warning)
  mainWindow.webContents.session.webRequest.onHeadersReceived(
    (details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          "Content-Security-Policy": [
            "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'",
          ],
        },
      });
    }
  );
};

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  console.log(app);
  //app.quit();
} else {
// ✅ App Ready
app.whenReady().then(() => {
  
  createMainWindow();

  // Ensure app opens when clicking the dock icon (macOS)
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

// ✅ Fix: Quit app properly when all windows are closed (Except on macOS)
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

}