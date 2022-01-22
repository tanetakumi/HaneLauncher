const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
  // レンダラー → メイン
  nyan: async (data) => await ipcRenderer.invoke('nyan', data),
  wan:  async (data) => await ipcRenderer.invoke('wan', data),
  quit:  async () => await ipcRenderer.invoke('quit'),

  // メイン → レンダラー
  on: (channel, callback) => ipcRenderer.on(channel, (event, argv)=>callback(event, argv))
  }
)