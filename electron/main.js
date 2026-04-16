const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

function createWindow() {
  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    title: 'LEXICIDE',
    resizable: false,
    fullscreenable: false,
    useContentSize: true, // Ensures the 1280x720 is the drawing area
    backgroundColor: '#0a0a0f',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  Menu.setApplicationMenu(null);

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    // mainWindow.webContents.openDevTools(); // Optional: open dev tools in dev mode
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist-vite/index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
