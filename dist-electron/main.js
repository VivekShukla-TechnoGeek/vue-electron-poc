import { app as o, BrowserWindow as i } from "electron";
import n from "path";
let e;
o.whenReady().then(() => {
  e = new i({
    width: 1200,
    height: 800,
    resizable: !1,
    icon: n.join(__dirname, "icons/icon.png"),
    webPreferences: {
      nodeIntegration: !0
    },
    show: !1
    // Prevent flickering, we will show it manually
  }), process.env.VITE_DEV_SERVER_URL ? e.loadURL(process.env.VITE_DEV_SERVER_URL) : e.loadFile(n.join(__dirname, "../dist/index.html")), e.once("ready-to-show", () => {
    console.log("🚀 Window is ready, showing it now."), e.show(), e.focus(), e.webContents.openDevTools(), o.dock.show();
  });
});
o.on("activate", () => {
  i.getAllWindows().length === 0 && (e = new i({
    width: 1200,
    height: 800,
    resizable: !1,
    icon: n.join(__dirname, "icons/icon.png"),
    webPreferences: {
      nodeIntegration: !0
    }
  }), e.loadFile(n.join(__dirname, "../dist/index.html")));
});
o.on("window-all-closed", () => {
  process.platform !== "darwin" && o.quit();
});
