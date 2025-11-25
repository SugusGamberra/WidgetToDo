require('dotenv').config();
const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('path');
const fs = require('fs');
const Store = require('electron-store');
// ARCARAJO SE PUDO!!! quito el q lo guarde local, yuosss que gustazo!!! y todo por el require T_T lloro d felicidad cuyonsss
// const { getTasks, toggleTask, addTask, deleteTask } = require('./services/localTaskService');
const { getTasks, toggleTask, addTask, deleteTask } = require('./services/notionService');

app.disableHardwareAcceleration();
const logPath = path.join(app.getPath('userData'), 'log.txt');

function logError(error) {
    const message = `[${new Date().toISOString()}] ERROR: ${error.stack || error}\n`;
    fs.appendFileSync(logPath, message);
}

process.on('uncaughtException', (error) => {
    logError(error);
});

const store = new Store();
let mainWindow;

function createWindow() {
    try {
        const primaryDisplay = screen.getPrimaryDisplay();
        const { width } = primaryDisplay.workAreaSize;
        const defaultX = width - 400 - 20;
        
        const bounds = store.get('bounds', {
            x: defaultX,
            y: 20,
            width: 400,
            height: 600
        });

        mainWindow = new BrowserWindow({
            x: bounds.x,
            y: bounds.y,
            width: 400,
            height: 600,
            frame: false,
            transparent: true,
            alwaysOnTop: false,
            resizable: false,
            skipTaskbar: true,
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
    }
}

app.setLoginItemSettings({
    openAtLogin: true,
    path: app.getPath('exe')
});

// IPC Handlers
ipcMain.handle('get-tasks', async () => { return getTasks(); });
ipcMain.handle('toggle-task', async (event, taskId) => { return toggleTask(taskId); });
ipcMain.handle('add-task', async (event, title, subject) => { return addTask(title, subject); });
ipcMain.handle('delete-task', async (event, taskId) => { return deleteTask(taskId); });
ipcMain.handle('get-subjects', async () => { return getSubjectsList(); });

app.whenReady().then(() => {
    createWindow();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});