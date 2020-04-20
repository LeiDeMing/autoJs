// Modules to control application life and create native browser window
const {
  BrowserWindow,
  Menu,
  MenuItem,
  ipcMain,
  dialog,
  app
} = require('electron')
const path = require('path')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow
function createWindow() {

  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      devTools: true
    }
  })

  mainWindow.webContents.openDevTools()
  mainWindow.loadURL(path.join('file://', __dirname, '/index.html'))

  ipcMain.on('open-chandao-dialog', (event, dialogOptions) => {
    dialog.showMessageBox(dialogOptions)
  })

  mainWindow.on('closed', function () {
    mainWindow = null
  })
}

app.setAppUserModelId('com.myapp.id')

app.on('ready', createWindow)

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  if (mainWindow === null) createWindow()
})

