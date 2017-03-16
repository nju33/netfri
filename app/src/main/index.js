'use strict'

import fs from 'fs';
import path from 'path';
import {app, BrowserWindow, protocol, ipcMain} from 'electron'
import notifier from 'node-notifier';
import createMenu from './create-menu';

let mainWindow = null;
let error = false;
let config = null;
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:${require('../../../config').port}`
  : `file://${__dirname}/index.html`

try {
  const configPath = `${app.getPath('home')}/.netfri.json`;
  fs.accessSync(configPath, fs.constants.F_OK);
  config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
} catch (err) {
  notifier.notify({
    title: 'Netfri',
    message: '`~/.netfri.json` does not exist or something is wrong',
    timeout: 8,
    icon: path.join(
      __dirname,
      '../../images/notify.png'
    ),
  }, () => {
    app.quit();
  });
  error = true;
}

if (!config.widevineCDMPath || !config.widevineCDMVersion) {
  notifier.notify({
    title: 'Netfri',
    message: '`~/.netfri.json` is wrong. Please check once again.',
    timeout: 8,
    icon: path.join(
      __dirname,
      '../../images/notify.png'
    ),
  }, () => {
    app.quit();
  });
  error = true;
}

app.commandLine.appendSwitch('widevine-cdm-path', config.widevineCDMPath);
app.commandLine.appendSwitch('widevine-cdm-version', config.widevineCDMVersion);

function createWindow () {
  if (error) {
    return;
  }

  protocol.registerHttpProtocol('netfri', (req, cb) => {
    const videoId = req.url.slice(9);
    mainWindow.webContents.send('load-video-url', {videoId});
  });

  createMenu();

  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 600,
    width: 800,
    titleBarStyle: 'hidden-inset',
    transparent: true
  })

  mainWindow.loadURL(winURL)

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  mainWindow.on('leave-full-screen', () => {
    mainWindow.webContents.send('leave-full-screen');
  });

  mainWindow.on('enter-full-screen', () => {
    mainWindow.webContents.send('enter-full-screen');
  });

  // eslint-disable-next-line no-console
  console.log('mainWindow opened')
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

ipcMain.on('on-always-on-top:req', ({sender}) => {
  mainWindow.setAlwaysOnTop(true);
  sender.send('on-always-on-top:res');
});

ipcMain.on('off-always-on-top:req', ({sender}) => {
  mainWindow.setAlwaysOnTop(false);
  sender.send('off-always-on-top:res');
});
