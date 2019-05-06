# ElectronTest
For SberTech

## **Шаг 1**
Сначала необходимо создать папку с названием вашего проекта.
Затем зайти в папку и создать файл package.json со следующим содержимым:
```
{
  "name": "ElectronTest",
  "version": "0.0.0",
  "main": "main.js",
  "description": "A minimal Electron application with update via server and public repo in gitlab",
  "author": {
    "name": "Sychev Daniil",
    "email": "sych.daniil@yandex.ru"
  },
  "scripts": { // их можно запускать через npm <название_скрипта>
    "start": "electron .",
    "pack": "node_modules/.bin/electron-builder --dir",
    "build": "node_modules/.bin/electron-builder --win",
    "postinstall": "",
    "install": "node-gyp install",
    "publish": "build -p always"
  },
  "build": {
    "appId": "com.gitlab.sychdan.ElectironTest",
    "publish": [
      {
        "provider": "generic",
        "url": "https://gitlab.com"
      }
    ],
    "win": {
      "target": [
        "nsis" // Создает exe файл для инсталяции
      ],
      "verifyUpdateCodeSignature": false
    },
    "mac": {
      "category": "development",
      "identity": "",
      "target": [
        "dmg"
      ]
    },
    "linux": {
      "target": [
        "AppImage" // создает appImage файл для запуска приложения
      ]
    }
  },
  "dependencies": {
    "electron-updater": "^4.0.6",
    "electron-log": "^3.0.5"
  },
  "devDependencies": {
    "electron": "4.0.8",
    "electron-builder": "^20.39.0"
  }
}
```
Затем необходимо ввести команду 'npm install' для загрузки зависимостей.
Если версия npm 5 и выше, то автоматически создастся package-lock.json
В противном случае можно обойтись и без него, но это может вызвать некоторые проблемы в будущем.
Для создания файла блокировки можно использовать 'npm srinkwrap'

Затем необходимо ввести команду 'npm run publish' (Этот скрипт прописан в package.json)
Эта команда создаст папку dist для создания необходимых образов и инсталяторов.


## **Шаг 2**
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

## **Шаг 3**
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

## **Шаг 4**
Клонировать [сервер обновлений](https://www.github.com/sychdan/server) и запустить его (можно на другой машине, только необходимо правильно указать ip адрес).<br>
В приложении обновить версию продукта (в package.json) и вбить команду nmp dist (скрипт есть в package.json)<br>
Затем все файлы оканчивающиеся на *.yml, *.yaml, *.exe скопировать на сервер в папку src/resources
<br>
В проекте понизить версию обратно и снова вбить npm dist.
<br>
Затем запустить приложение и наблюдать, как происходит автообновление.<br>
P.S. Приложение не будет обнновляться, если версия на сервере ниже текущей.

## **Шаг 5: Обновление через gitlab**
В первую очередь необходимо создать **публичный** репозиторий в gitlab.
Далее нам необходимо создать файл gitlab-ci.yml:
```
variables:
  VERSION_ID: '1.0.$CI_PIPELINE_ID' // Генерация новой версии: берется id pipeline

stages: // Перечисление этапов CI
  - build 

job_build: // Название job
  image: electronuserland/electron-builder:wine // Docker-образ. Взят публичный, чтобы не создавать свой.
  stage: build //Этап 
  artifacts: // Артефакты
    paths:
      - $CI_PROJECT_DIR/dist/*.*
  script: // Действия при запуске данного этапа
    - sed "s/0.0.0/${VERSION_ID}/g" package.json > _package.json && mv _package.json package.json
    - npm install && npm run build

```
Файл gitlab-ci.yml позволяет запускать тесты, предварительные настройки окружения при пуше коммита в репозиторий.
<br>
Далее необходимо прописать путь до артефактов. Для этого замените в файле main.js строчку
```
   url: "http://<your_host>:9000/"
```
На
```
url: "https://gitlab.com/<Onwer>/<repo>/-/jobs/artifacts/master/raw/dist?job=job_build"
```
Где Owner - владелец репозитория, repo - сам репозиторий, master - ветка, job_build - название job, которое выполняется при коммите проекта и который описан в gilab-ci.
<br>
raw позволяет осуществить автообновление. Есть и другие параметры - browse (можно в браузере получить доступ к папке с файлами обновления), 
download (позволяет скачивать прямо в браузере и с консоли при помощи команды curl)
<br>
Также необходимо добавить параметры в заголовок запроса:
```
autoUpdater.requestHeaders = {
     "PRIVATE_TOKEN": "<токен>", 
     authorization: '' // Этот параметр позволяет избавиться от кэширования, если он не нужен при автообновлении.
   };
   autoUpdater.autoDownload =true;
```
<br>
После этого можно закоммитить изменения и запушить в репозиторий в gitlab.
<br>
Прежде чем начать обновление, убедитесь, что job завершился. Помотреть это можно в списке всех работ:
 https://www.giltab/owner/repo/-/jobs
 <br>
 Обратите внимание, что в файле gitlab-ci запускается скрипт build из package.json, который запускает сборку проекта в среде windows.
 Для других ОС требуются другие параметры.
