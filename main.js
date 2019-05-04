const {app, BrowserWindow, Menu, ipcMain, protocol} = require('electron');
const log = require('electron-log');
const {autoUpdater} = require('electron-updater');

let mainWindow = {};
autoUpdater.logger = log;
autoUpdater.requestHeaders = {
  "PRIVATE_TOKEN": "AxshFXC7nExHkC2zNkBw",
  authorization: ''
};
autoUpdater.autoDownload =true;
autoUpdater.setFeedURL({
  provider: "generic",
  // url: "http://<your_host>:9000/"
  url: "https://gitlab.com/SychDan/electrontest/-/jobs/artifacts/master/download/dist?job=job_build"
});
autoUpdater.logger.transports.file.level = "info";

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  });

  mainWindow.webContents.openDevTools();
  mainWindow.loadURL(`file://${__dirname}/index.html#v${app.getVersion()}`);

  mainWindow.on('closed', function () {
    log.info("Приложение завершено")
    mainWindow = null
  })
}

function sendStatusToWindow(text) {
  log.info(text);
  mainWindow.webContents.send('message', text)
}

app.on('window-all-closed', function () {

  if (process.platform !== 'darwin') app.quit()
})

autoUpdater.on('checking-for-update', () => {
  log.info('Проверка обновления');
  sendStatusToWindow('Проверка обновления...');
})
autoUpdater.on('update-available', (ev, info) => {
  log.info('Обновление доступно');
  sendStatusToWindow('Обновление доступно.');
})
autoUpdater.on('update-not-available', (ev, info) => {
  log.info('Обновление не доступно');
  sendStatusToWindow('Обновление не доступно.');
})
autoUpdater.on('error', (ev, err) => {
  sendStatusToWindow('Ошибка во время автообновления.');
})
autoUpdater.on('download-progress', (ev, progressObj) => {
  sendStatusToWindow('Загрузка обновления...');
})
autoUpdater.on('update-downloaded', (ev, info) => {
  sendStatusToWindow('Обновление загружено; оно будет установлено в через 5 секунд');
});

autoUpdater.on('update-downloaded', (ev, info) => {
  // Ожидание 5 секунд прежде чем начать установку
  // Если не нужно, то можно сразу вызвать autoUpdater.quitAndInstall()
  setTimeout(function() {
    autoUpdater.quitAndInstall();
  }, 5000)
})

app.on('ready', function() {
  createWindow();
  autoUpdater.checkForUpdates()
});


// const {app, BrowserWindow} = require("electron");
// const updater = require("electron-updater");
// const autoUpdater = updater.autoUpdater;
//
// let mainWindow = {};
//
// ///////////////////
// // Auto upadater //
// ///////////////////
// autoUpdater.requestHeaders = { "PRIVATE-TOKEN": "AxshFXC7nExHkC2zNkBw" };
// autoUpdater.autoDownload = true;
//
// autoUpdater.setFeedURL({
//   provider: "generic",
//   url: "https://gitlab.com/sychdan/electrontest/-/jobs/artifacts/master/raw/dist?job=build"
// });
//
// autoUpdater.on('checking-for-update', function () {
//   sendStatusToWindow('Checking for update...');
// });
//
// autoUpdater.on('update-available', function (info) {
//   sendStatusToWindow('Update available.');
// });
//
// autoUpdater.on('update-not-available', function (info) {
//   sendStatusToWindow('Update not available.');
// });
//
// autoUpdater.on('error', function (err) {
//   sendStatusToWindow('Error in auto-updater.');
// });
//
// autoUpdater.on('download-progress', function (progressObj) {
//   let log_message = "Download speed: " + progressObj.bytesPerSecond;
//   log_message = log_message + ' - Downloaded ' + parseInt(progressObj.percent) + '%';
//   log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
//   sendStatusToWindow(log_message);
// });
//
// autoUpdater.on('update-downloaded', function (info) {
//   sendStatusToWindow('Update downloaded; will install in 1 seconds');
// });
//
// autoUpdater.on('update-downloaded', function (info) {
//   setTimeout(function () {
//     autoUpdater.quitAndInstall();
//   }, 1000);
// });
//
// app.on('ready', function() {
//   createWindow();
//   autoUpdater.checkForUpdates()
// });
//
// autoUpdater.checkForUpdates();
//
// function sendStatusToWindow(message) {
//   console.log(message);
//   mainWindow.webContents.send('message', text)
// }
//
// function createWindow () {
//     mainWindow = new BrowserWindow({
//         width: 800,
//         height: 600,
//         webPreferences: {
//             nodeIntegration: true
//         }
//     });
//
//     mainWindow.webContents.openDevTools();
//   mainWindow.loadURL(`file://${__dirname}/index.html#v${app.getVersion()}`);
//
//   mainWindow.on('closed', function () {
//     mainWindow = null
//   })
// }
