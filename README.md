# ElectronTest
For SberTech

**Шаг 1**
Сначала необходимо создать папку с названием вашего проекта.
Затем зайти в папку и создать файл package.json со следующим содержимым:
```
{
  "name": "ElectronTest",
  "version": "1.0.0",
  "description": "A minimal Electron application",
  "main": "main.js",
  "private": true,
  "scripts": { // их можно запускать через npm <название_скрипта>
    "dist": "electron-builder",
    "start": "electron .",
    "publish": "build -p always"
  },
  "repository": "gitlab:SychDan/ElectronTest",
  "author": {
    "name": "Sychev Daniil",
    "email": "sych.daniil@yandex.ru"
  },
  "dependencies": {
    "electron-is-dev": "^1.1.0",
    "electron-log": "^3.0.5",
    "electron-simple-updater": "^1.5.0",
    "electron-updater": "^4.0.6"
  },
  "devDependencies": {
    "electron": "^4.1.4",
    "electron-builder": "^20.39.0"
  },
  "build": {
    "appId": "com.gitlab.sychdan.ElectironTest",
    "mac": {
      "category": "development",
      "target": [
        "zip",
        "dmg"
      ]
    },
    "win": {
      "target": [
        "nsis" // Создает exe файл для инсталяции
      ],
      "verifyUpdateCodeSignature": false,
    },
    "linux": {
      "category": "Utility",
      "target": [
        "deb",
        "snap",
        "tar.gz",
        "appImage" // создает appImage файл для запуска приложения
      ]
    },
    "publish": [
      {
        "provider": "generic",
        "url": "https://gitlab.com"
      }
    ]
  }
}
```
Затем необходимо ввести команду 'npm install' для загрузки зависимостей.
Если версия npm 5 и выше, то автоматически создастся package-lock.json
В противном случае можно обойтись и без него, но это может вызвать некоторые проблемы в будущем.
Для создания файла блокировки можно использовать 'npm srinkwrap'

Затем необходимо ввести команду 'npm run publish' (Этот скрипт прописан в package.json)
Эта команда создаст папку dist для создания необходимых образов и инсталяторов.


**Шаг 2**
Нужно созать файл main.js, который будет отвечать за работу приложения
```
// Modules to control application life and create native browser window
const {app, BrowserWindow, Menu, ipcMain, protocol} = require('electron');
const isDev = require('electron-is-dev');
const log = require('electron-log');
const {autoUpdater} = require('electron-updater');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow = {};
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = "info";
autoUpdater.requestHeaders = {"PRIVATE_TOKEN": "hMo3GxCcjYxJi4jszNJT"};
autoUpdater.autoDownload =true;
autoUpdater.setFeedURL({
  provider: "generic",
  url: "https://gitlab.com/ElectrionTest-/jobs/artifacts/master/raw/dist?job=build"
});

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    log.info("Приложение завершено")
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

function sendStatusToWindow(text) {
  log.info(text);
  mainWindow.webContents.send('message', text)
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
// app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  // if (mainWindow === null) createWindow()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

autoUpdater.on('checking-for-update', () => {
  log.info('Checking for update');
  sendStatusToWindow('Checking for update...');
})
autoUpdater.on('update-available', (ev, info) => {
  sendStatusToWindow('Update available.');
})
autoUpdater.on('update-not-available', (ev, info) => {
  sendStatusToWindow('Update not available.');
})
autoUpdater.on('error', (ev, err) => {
  sendStatusToWindow('Ошибка во время автообновления.');
})
autoUpdater.on('download-progress', (ev, progressObj) => {
  sendStatusToWindow('Download progress...');
})
autoUpdater.on('update-downloaded', (ev, info) => {
  sendStatusToWindow('Update downloaded; will install in 5 seconds');
});

autoUpdater.on('update-downloaded', (ev, info) => {
  // Wait 5 seconds, then quit and install
  // In your application, you don't need to wait 5 seconds.
  // You could call autoUpdater.quitAndInstall(); immediately
  setTimeout(function() {
    autoUpdater.quitAndInstall();
  }, 5000)
})

app.on('ready', function() {
  if (!isDev) {
    autoUpdater.checkForUpdates();
  }
  createWindow();
  autoUpdater.checkForUpdates()
  // createDefaultWindow();
});
```

**Шаг 3**
Теперь необходимо создать файл index.html для отображения приложения.
```
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>Hello World!</title>
  </head>
  <body>
    <h1>Hello World!</h1>

    We are using Node.js <script>document.write(process.versions.node)</script>,
    Chromium <script>document.write(process.versions.chrome)</script>,
    and Electron <script>document.write(process.versions.electron)</script>.
    <div id="messages" style="color: red;"></div>
    <script>

      // Listen for messages
      const {ipcRenderer} = require('electron'); // ipcRender служит для связи js кода в main.js и html
      ipcRenderer.on('message', function(event, text) {
        console.log('Message from updater: ', text);
        var container = document.getElementById('messages');
        var message = document.createElement('div');
        message.innerHTML = text;
        container.appendChild(message);
      })
    </script>
  </body>
</html>
```
Затем вбить в терминале команду 'npm start' (скрипт прописан в package.json) и приложение запустится

P.S.
В данной верисии приложения будет выскакивать оибка при автообновлении из-за того, что не получается авторизоваться через токен (curl работает). В последующей версии баг будет исправлен.



