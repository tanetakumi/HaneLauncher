const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const ejse          = require('ejs-electron')

function createWindow () {
  const win = new BrowserWindow({
    width: 980,
    height: 552,
    frame: false,
    icon: getPlatformIcon('images/SealCircle'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preloader.js')
    },
    backgroundColor: '#171614'
  })

  win.webContents.openDevTools();

  win.removeMenu()

  win.loadURL(`file://${__dirname}/app.ejs`)
  
  // 1秒置きに背景画像を変更
  setInterval(()=>{
    const rnd = (Math.floor(Math.random() * 10) % 8) + 1
    win.webContents.send('bgimage', rnd)
  }, 5000)

  win.on('close', () => console.log('BrowserWindow.close'))
  win.on('closed', () => console.log('BrowserWindow.closed'))


}

function createMenu() {

  if (process.platform === 'darwin') {
      // Extend default included application menu to continue support for quit keyboard shortcut
      let applicationSubMenu = {
          label: 'Application',
          submenu: [{
              label: 'About Application',
              selector: 'orderFrontStandardAboutPanel:'
          }, {
              type: 'separator'
          }, {
              label: 'Quit',
              accelerator: 'Command+Q',
              click: () => {
                  app.quit()
              }
          }]
      }

      // New edit menu adds support for text-editing keyboard shortcuts
      let editSubMenu = {
          label: 'Edit',
          submenu: [{
              label: 'Undo',
              accelerator: 'CmdOrCtrl+Z',
              selector: 'undo:'
          }, {
              label: 'Redo',
              accelerator: 'Shift+CmdOrCtrl+Z',
              selector: 'redo:'
          }, {
              type: 'separator'
          }, {
              label: 'Cut',
              accelerator: 'CmdOrCtrl+X',
              selector: 'cut:'
          }, {
              label: 'Copy',
              accelerator: 'CmdOrCtrl+C',
              selector: 'copy:'
          }, {
              label: 'Paste',
              accelerator: 'CmdOrCtrl+V',
              selector: 'paste:'
          }, {
              label: 'Select All',
              accelerator: 'CmdOrCtrl+A',
              selector: 'selectAll:'
          }]
      }

      // Bundle submenus into a single template and build a menu object with it
      let menuTemplate = [applicationSubMenu, editSubMenu]
      let menuObject = Menu.buildFromTemplate(menuTemplate)

      // Assign it to the application
      Menu.setApplicationMenu(menuObject)
  }
}

//Iconのパスの取得
function getPlatformIcon(filename) {
  let ext
  switch (process.platform) {
      case 'win32':
          ext = 'ico'
          break
      case 'darwin':
      case 'linux':
      default:
          ext = 'png'
          break
  }
  return path.join(__dirname, 'app', 'assets', 'images', `${filename}.${ext}`)
}

app.on('ready', ()=>{
    createWindow()
    createMenu()
})

app.on('window-all-closed', () => {
  console.log('window-all-closed')
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

//----------------------------------------
// IPC通信
//----------------------------------------
// 語尾に "にゃん" を付けて返す
ipcMain.handle('nyan', (event, data) => {
  return(`${data}にゃん`)
})

// 語尾に "わん" を付けて返す
ipcMain.handle('wan', (event, data) => {
  return(`${data}わん`)
})

// 終了処理
ipcMain.handle('quit', (event) => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})


let MSALoginWindow = null

// Open the Microsoft Account Login window
ipcMain.on('openMSALoginWindow', (ipcEvent, args) => {
    if (MSALoginWindow != null) {
        ipcEvent.reply('MSALoginWindowReply', 'error', 'AlreadyOpenException')
        return
    }
    MSALoginWindow = new BrowserWindow({
        title: 'Microsoft Login',
        backgroundColor: '#222222',
        width: 520,
        height: 600,
        frame: true,
        icon: getPlatformIcon('SealCircle')
    })

    MSALoginWindow.on('closed', () => {

        MSALoginWindow = null
    })

    MSALoginWindow.on('close', event => {
        ipcEvent.reply('MSALoginWindowReply', 'error', 'AuthNotFinished')

    })

    MSALoginWindow.webContents.on('did-navigate', (event, uri, responseCode, statusText) => {
        if (uri.startsWith(redirectUriPrefix)) {
            let querys = uri.substring(redirectUriPrefix.length).split('#', 1).toString().split('&')
            let queryMap = new Map()

            querys.forEach(query => {
                let arr = query.split('=')
                queryMap.set(arr[0], decodeURI(arr[1]))
            })

            ipcEvent.reply('MSALoginWindowReply', queryMap)

            MSALoginWindow.close()
            MSALoginWindow = null
        }
    })

    MSALoginWindow.removeMenu()
    console.log(clientID)
    MSALoginWindow.loadURL('https://login.microsoftonline.com/consumers/oauth2/v2.0/authorize?prompt=consent&client_id=' + clientID + '&response_type=code&scope=XboxLive.signin%20offline_access&redirect_uri=https://login.microsoftonline.com/common/oauth2/nativeclient')
})


let MSALogoutWindow = null

ipcMain.on('openMSALogoutWindow', (ipcEvent, args) => {
  if (MSALogoutWindow == null) {
      MSALogoutWindow = new BrowserWindow({
          title: 'Microsoft Logout',
          backgroundColor: '#222222',
          width: 520,
          height: 600,
          frame: true,
          icon: getPlatformIcon('SealCircle')
      })
      MSALogoutWindow.loadURL('https://login.microsoftonline.com/common/oauth2/v2.0/logout')
      MSALogoutWindow.webContents.on('did-navigate', (e) => {
          setTimeout(() => {
              ipcEvent.reply('MSALogoutWindowReply')
          }, 5000)

      })
      MSALogoutWindow.on('closed', () => {

          MSALogoutWindow = null
      })
  }
})