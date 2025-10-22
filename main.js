const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

// Disable GPU hardware acceleration to fix GPU process errors
app.disableHardwareAcceleration();

// Add command line switches for better compatibility
app.commandLine.appendSwitch('disable-gpu');
app.commandLine.appendSwitch('disable-software-rasterizer');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 800,
        minHeight: 600,
        icon: path.join(__dirname, 'icon.ico'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            webSecurity: true,
            offscreen: false
        },
        backgroundColor: '#f4f1ea',
        title: 'E-Paper Ebook Reader'
    });

    // Load the index.html file
    mainWindow.loadFile('index.html');

    // Create application menu
    const template = [
        {
            label: 'File',
            submenu: [
                {
                    label: 'Open PDF',
                    accelerator: 'CmdOrCtrl+O',
                    click: () => {
                        mainWindow.webContents.executeJavaScript('document.getElementById("fileInput").click();');
                    }
                },
                { type: 'separator' },
                {
                    label: 'Exit',
                    accelerator: 'CmdOrCtrl+Q',
                    click: () => {
                        app.quit();
                    }
                }
            ]
        },
        {
            label: 'View',
            submenu: [
                {
                    label: 'Settings',
                    accelerator: 'CmdOrCtrl+,',
                    click: () => {
                        mainWindow.webContents.executeJavaScript('document.getElementById("settingsBtn").click();');
                    }
                },
                {
                    label: 'Fullscreen',
                    accelerator: 'F11',
                    click: () => {
                        mainWindow.setFullScreen(!mainWindow.isFullScreen());
                    }
                },
                { type: 'separator' },
                { role: 'reload' },
                { role: 'toggleDevTools' }
            ]
        },
        {
            label: 'Navigation',
            submenu: [
                {
                    label: 'Previous Page',
                    accelerator: 'Left',
                    click: () => {
                        mainWindow.webContents.executeJavaScript('document.getElementById("prevBtn").click();');
                    }
                },
                {
                    label: 'Next Page',
                    accelerator: 'Right',
                    click: () => {
                        mainWindow.webContents.executeJavaScript('document.getElementById("nextBtn").click();');
                    }
                }
            ]
        },
        {
            label: 'Help',
            submenu: [
                {
                    label: 'About',
                    click: () => {
                        const { dialog } = require('electron');
                        dialog.showMessageBox(mainWindow, {
                            type: 'info',
                            title: 'About E-Paper Ebook Reader',
                            message: 'E-Paper Ebook Reader v1.0.0',
                            detail: 'A beautiful PDF reader with customizable themes and eye-friendly reading experience.'
                        });
                    }
                }
            ]
        }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);

    // Open DevTools in development (optional - remove in production)
    // mainWindow.webContents.openDevTools();

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// This method will be called when Electron has finished initialization
app.whenReady().then(createWindow);

// Quit when all windows are closed
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
