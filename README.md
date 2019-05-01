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
const {app, BrowserWindow, Menu, ipcMain, protocol} = require('electron');
const log = require('electron-log');
const {autoUpdater} = require('electron-updater');

let mainWindow = {};
autoUpdater.logger = log;
autoUpdater.requestHeaders = {"PRIVATE_TOKEN": "4c1e59a8bcc4e04b6d30e55720bd82052acbf508"};
autoUpdater.autoDownload =true;
autoUpdater.setFeedURL({
  provider: "generic",
  url: "http://<your_host>:9000/"
  // url: "https://gitlab.com/SychDan/electriontest-/jobs/artifacts/master/download/dist?job=build"
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

    <!-- All of the Node.js APIs are available in this renderer process. -->
    Current version: <span id="version">V</span>
    <div id="messages" style="color: red;"></div>
    <script>
      let version = window.location.hash.substring(1);
      document.getElementById("version").innerText = version;
      // Listen for messages
      const {ipcRenderer} = require('electron');
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

**Шаг 4**
Клонировать [сервер обновлений](https://www.github.com/sychdan/server) и запустить его (можно на другой машине, только необходимо правильно указать ip адрес).<br>
В приложении обновить версию продукта (в package.json) и вбить команду nmp dist (скрипт есть в package.json)<br>
Затем все файлы оканчивающиеся на *.yml, *.yaml, *.exe скопировать на сервер в папку src/resources
<br>
В проекте понизить версию обратно и снова вбить npm dist.
<br>
Затем запустить приложение и наблюдать, как происходит автообновление.<br>
P.S. Приложение не будет обнновляться, если версия на сервере ниже текщей.

