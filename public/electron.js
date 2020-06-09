const electron = require("electron");
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");
const isDev = require("electron-is-dev");

const backendJarPath = isDev
  ? path.join(__dirname, "../backend/build/libs/kafkaui-0.0.1-all.jar")
  : path.join(process.resourcesPath, "kafkaui-0.0.1-all.jar");

if (!fs.existsSync(backendJarPath)) {
  throw new Error(`Backend JAR file not found from ${backendJarPath}`);
}

try {
  const backend = spawn("java", ["-jar", backendJarPath]);
  const errorLog = [];
  const normalLog = [];

  backend.stdout.on("data", (data) => {
    console.log(data.toString());
    normalLog.push(data.toString());
  });

  backend.stderr.on("data", (data) => {
    console.error(data.toString());
    errorLog.push(data.toString());
  });

  backend.on("close", (code) => {
    console.error("Backend closed with code " + code);
    throw new Error(
      "Java processi for Kafka connection exited with error code " +
        code +
        ":\n" +
        errorLog.join("\n")
    );
  });

  process.on("exit", () => {
    backend.kill();
  });
} catch (e) {
  console.error(e);
  throw new Error("Failed to start backend Java process for Kafka connection");
}

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 680,
    webPreferences: { nodeIntegration: true },
  });

  mainWindow.loadURL(
    isDev
      ? "http://localhost:3000"
      : `file://${path.join(__dirname, "../build/index.html")}`
  );

  if (isDev) {
    // Open the DevTools.
    //BrowserWindow.addDevToolsExtension('<location to your react chrome extension>');
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on("closed", () => (mainWindow = null));
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});
