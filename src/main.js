require('dotenv').config();

const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('path');
const fs = require('fs');
const Store = require('electron-store');
const pug = require('pug');

const { getTasks, toggleTask, addTask, deleteTask, getSubjectsList } = require('./services/notionService');

app.disableHardwareAcceleration();

const store = new Store();
let mainWindow;

// gestion inteligente del env
let envPath;
if (app.isPackaged) {
    envPath = path.join(app.getPath('userData'), '.env');
} else {
    envPath = path.join(__dirname, '../.env');
}
require('dotenv').config({ path: envPath });

const logPath = path.join(app.getPath('userData'), 'log.txt');
function logError(error) {
    try {
        const message = `[${new Date().toISOString()}] ERROR: ${error.stack || error}\n`;
        fs.appendFileSync(logPath, message);
    } catch (e) { console.error("No se pudo escribir log:", e); }
}

process.on('uncaughtException', (error) => {
    logError(error);
});

// para verlo con el npm start
function createWindow() {
    try {
        if (!app.isPackaged) {
            console.log("Compilando diseño PUG a HTML...");
            const compiledFunction = pug.compileFile(path.join(__dirname, 'renderer/index.pug'));
            const html = compiledFunction();
            fs.writeFileSync(path.join(__dirname, 'renderer/index.html'), html);
        }

        const primaryDisplay = screen.getPrimaryDisplay();
        const { width } = primaryDisplay.workAreaSize;
        const widgetWidth = 500;
        const widgetHeight = 700;
        const defaultX = width - widgetWidth - 20;
        
        const bounds = store.get('bounds', {
            x: defaultX,
            y: 20,
            width: widgetWidth,
            height: widgetHeight
        });

        mainWindow = new BrowserWindow({
            x: bounds.x,
            y: bounds.y,
            width: widgetWidth,
            height: widgetHeight,
            frame: false,
            transparent: true,
            alwaysOnTop: false,
            resizable: false,
            skipTaskbar: true,
            icon: path.join(__dirname, '../build/icon.png'),
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false
            }
        });

        const indexPath = path.join(__dirname, 'renderer/index.html');
        mainWindow.loadFile(indexPath);

        mainWindow.on('moved', () => {
            if (mainWindow) store.set('bounds', mainWindow.getBounds());
        });
        
        mainWindow.on('close', () => {
            if (mainWindow) store.set('bounds', mainWindow.getBounds());
        });

    } catch (error) {
        logError(error);
        console.error(error);
    }
}

app.setLoginItemSettings({
    openAtLogin: true,
    path: app.getPath('exe')
});

// IPC handlers
ipcMain.handle('get-tasks', async () => { return getTasks(); });
ipcMain.handle('toggle-task', async (event, taskId) => { return toggleTask(taskId); });
ipcMain.handle('add-task', async (event, title, subject) => { return addTask(title, subject); });
ipcMain.handle('delete-task', async (event, taskId) => { return deleteTask(taskId); });
ipcMain.handle('get-subjects', async () => { return getSubjectsList(); });

// AJUSTES
ipcMain.handle('save-settings', async (event, settings) => {
    store.set('userSettings', settings);
    return true;
});
ipcMain.handle('get-settings', async () => {
    return store.get('userSettings') || null;
});

// BOTON CERRAR
ipcMain.on('close-app', () => {
    if (mainWindow) mainWindow.close();
});

app.whenReady().then(() => {
    createWindow();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});