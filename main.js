const {app, BrowserWindow, Menu, ipcMain, protocol} = require('electron');
const log = require('electron-log');
const {autoUpdater} = require('electron-updater');
const ipc = require('electron').ipcMain;

let flag = true;

// https://github.com/kahlil/electron-communication-example

let mainWindow = {};
autoUpdater.logger = log;
autoUpdater.requestHeaders = {
  "PRIVATE_TOKEN": "<TOKEN>",
  authorization: ''
};
autoUpdater.autoDownload =true;
autoUpdater.setFeedURL({
  provider: "generic",
  // url: "http://<your_host>:9000/"
  url: "https://gitlab.com/sychdan/electrontest/-/jobs/artifacts/master/raw/dist?job=job_build"
});
autoUpdater.logger.transports.file.level = "info";

ipc.on('reply', (event, message) => {
  console.log(event, message);
  mainWindow.webContents.send('messageFromMain', `This is the message from the second window: ${message}`);
})

let dialogWindow = {};

function createDialogWindow() {
  dialogWindow = new BrowserWindow({
    width:600,
    height:400
  })

  dialogWindow.loadURL(`file://${__dirname}/dialog.html`);
}

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  });

  if (flag) setTimeout(createDialogWindow, 1000);

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
  if (flag) {
    createWindow();
  } else {
    createWindow();
  }
  // autoUpdater.checkForUpdates()
});

