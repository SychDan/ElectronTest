const path = require('path');
const ipc = require('electron').ipcRenderer;
const BrowserWindow = require('electron').remote.BrowserWindow;
const openSecondWindowButton = document.getElementById('open-second-window');

const sendMessageButton = document.getElementById('send-message');

sendMessageButton.addEventListener('click', event => {
    ipc.send('reply', `Send message from second window to renderer via main.`);
    window.close();
});
