const {
  app,
  BrowserWindow,
  dialog,
  ipcMain,
  protocol,
} = require('electron');
const {
  createProtocol,
  installVueDevtools,
} = require('vue-cli-plugin-electron-builder/lib');
const log4js = require('log4js');
const axios = require('axios');
const moment = require('moment');

const ChatSocket = require('./utils/ChatSocket');
const Storage = require('./utils/Storage');
const config = require('./config');

log4js.configure(config.logger);
const logger = log4js.getLogger('main');
const isDevelopment = process.env.NODE_ENV !== 'production';

const httpInstance = axios.create({ baseURL: 'http://localhost:3000' });
const storage = new Storage({
  configName: 'chat-client',
});

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;
let socket;
let loginRequired = true;

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([{ scheme: 'app', privileges: { secure: true, standard: true } }]);

function checkToken() {
  const accessToken = storage.get('accessToken');
  const refToken = storage.get('refreshToken');

  logger.debug('checkToken :', accessToken);

  if (!accessToken) {
    if (refToken) {
      return refreshToken(refToken);
    }

    return Promise.resolve(null);
  }

  return httpInstance.get('/api/auth/check', { headers: { authorization: `Bearer ${accessToken}` } })
    .then(({ data }) => {
      const leftTime = moment(data.info.exp * 1000).diff(moment(), 'seconds');

      logger.debug('token left time...', leftTime, 's');
      return accessToken;
    })
    .catch((error) => {
      // authentication error!
      if (error.response) {
        if (error.response.status === 401) {
          return refreshToken(storage.get('refreshToken'));
        }
        if (error.response.status === 403) {
          logger.debug('token is not valid! remove token and request login-required');

          storage.remove('accessToken');
          storage.remove('refreshToken');

          return null;
        }
      }

      logger.error('Request Error!', error.message);
      throw error;
    });
}

function refreshToken(token) {
  return httpInstance.post('/api/auth/token', { refreshToken: token })
    .then(({ data }) => {
      // 로컬저장소에 토큰 저장
      storage.set('accessToken', data.token);

      logger.debug('token refreshed!', data.token);
      return data.token;
    })
    .catch((error) => {
      // 재발급토큰 비정상 (만료, 불일치 등)
      if (error.response && error.response.status === 401) {
        logger.debug('refresh token is not valid! remove token and request login-required');

        storage.remove('accessToken');
        storage.remove('refreshToken');

        return Promise.resolve(null);
      }

      logger.error('Request Error!', error.message);
      throw error;
    });
}

function appLogin(form) {
  return httpInstance.post('/api/auth/login', { username: form.loginId, password: form.loginPw })
    .then((res) => {
      logger.debug('login successfully!', res.data.token);

      storage.set('accessToken', res.data.token);
      storage.set('refreshToken', res.data.refreshToken);

      socket.connect(res.data.token);

      return res.data.token;
    });
}

function connectSocket(token) {
  socket.connect(token);
  socket.addIpcEmitter('message.receive');
  socket.addIpcEmitter('user.enter');
  socket.on('token.refresh', (data) => {
    logger.debug('token refreshed! change token...', data.token);
    socket.socket.io.opts.query = { token: data.token };
    socket.close();
    socket.connect();
  });
}

function createWindow() {
  checkToken()
    .then((token) => {
      // Create the browser window.
      win = new BrowserWindow({
        width: 1400,
        height: 750,
        minWidth: 700,
        minHeight: 500,
        webPreferences: {
          nodeIntegration: true,
        },
      });

      if (token) {
        loginRequired = false;
        connectSocket(token);
      }

      socket.setBrowserWindow(win);

      if (process.env.WEBPACK_DEV_SERVER_URL) {
        // Load the url of the dev server if in development mode
        win.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
        if (!process.env.IS_TEST) win.webContents.openDevTools();
      } else {
        createProtocol('app');
        // Load the index.html when not in development
        win.loadURL('app://./index.html');
      }

      win.on('closed', () => {
        logger.debug('Window closed');
        win = null;
        socket.setBrowserWindow(null);
      });

      logger.debug('Window created');
    })
    .catch((error) => {
      logger.error('Error occurred during open window!', error.message);
      dialog.showErrorBox('연결 실패', '채팅 서버에 연결할 수 없습니다.');
      process.exit(1);
    });
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow();
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    // Devtools extensions are broken in Electron 6.0.0 and greater
    // See https://github.com/nklayman/vue-cli-plugin-electron-builder/issues/378 for more info
    // Electron will not launch with Devtools extensions installed on Windows 10 with dark mode
    // If you are not using Windows 10 dark mode, you may uncomment these lines
    // In addition, if the linked issue is closed,
    // you can upgrade electron and uncomment these lines
    try {
      await installVueDevtools();
    } catch (e) {
      logger.error('Vue Devtools failed to install:', e.toString());
    }
  }

  // 소켓 생성
  socket = new ChatSocket();

  createWindow();
});

app.on('will-quit', () => {
  logger.info('Application will be quit. closing socket...');
  socket.close();
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit();
      }
    });
  } else {
    process.on('SIGTERM', () => {
      app.quit();
    });
  }
}

ipcMain.on('req.reconnect', () => {
  socket.connect();
});

ipcMain.on('app.login', (e, data) => {
  appLogin(data)
    .then(() => {
      win.webContents.send('app.login.result', { success: true });
    })
    .catch((error) => {
      if (error.response && error.response.status === 403) {
        win.webContents.send('app.login.result', { success: false, message: error.response.data.message });
      } else {
        logger.error('Error occurred during login!', error.message);
      }
    });
});

ipcMain.on('app.login.required', (e) => {
  e.returnValue = loginRequired;
});

ipcMain.on('getConnection', () => {
  if (socket) {
    win.webContents.send('connection', {
      connect: socket.isConnected(),
      retryCount: socket.getRetryCount(),
      maxCount: ChatSocket.getMaxRetryCount(),
    });
  } else {
    win.webContents.send('connection', {
      connect: false,
    });
  }
});

ipcMain.on('message.send', (e, data) => {
  socket.emit('message.send', data);
});
