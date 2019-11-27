const io = require('socket.io-client');
const log4js = require('log4js');
const config = require('../config').socket;

const logger = log4js.getLogger('socket');

class ChatSocket {
  constructor(opts) {
    this.opts = Object.assign({}, config.options, opts);
    this.retryCount = -1;
  }

  static getMaxRetryCount() {
    return config.options.reconnectionAttempts;
  }

  isConnected() {
    return this.socket && this.socket.connected;
  }

  getRetryCount() {
    return this.retryCount;
  }

  connect(token) {
    if (this.isConnected()) return;

    this.socket = io(config.url, Object.assign(this.opts, { query: { token } }));
    this.socket.on('connect', () => {
      logger.debug('connected!', this.socket.id);
      this.id = this.socket.id;
      this.sendWindowMessage('connection', { connect: true });
    });
    this.socket.emit('connect_error', () => {
      logger.debug('socket disconnected.');
      this.sendWindowMessage('connection', { connect: false, retryCount: -1 });
    });
    this.socket.on('disconnect', (reason) => {
      logger.debug('socket disconnected.');

      if (reason === 'io server disconnect') {
        this.connect();
      }
    });
    this.socket.on('error', (err) => {
      logger.warn(err);

      // socket close
      // this.close();

      if (err === 'invalid token') {
        console.log('invalid token error!');
      }

      this.sendWindowMessage('connection', { connect: false, retryCount: -1 });
    });
    this.socket.on('reconnecting', (retry) => {
      logger.debug('reconnecting...', retry);
      this.retryCount = retry;
      this.sendWindowMessage('connection', { connect: false, retryCount: retry });
    });
    this.socket.on('reconnect_attempt', (retry) => {
      this.retryCount = retry;
      this.sendWindowMessage('connection', { connect: false, retryCount: retry });
    });
    this.socket.on('reconnect_failed', () => {
      logger.debug('reconnect failed!');
      this.retryCount = -1;
      this.sendWindowMessage('connection', { connect: false, retryCount: -1 });
    });

    this.socket.on('ping', () => logger.debug('send ping!'));
    this.socket.on('pong', latency => logger.debug(`received pong! ${latency}ms`));

    // this.sendWindowMessage('connection', {
    //   connect: this.isConnected(),
    //   retryCount: this.getRetryCount(),
    //   maxCount: config.options.reconnectionAttempts,
    // });
  }

  /**
   * 소켓서버로부터 받은 이벤트를 Renderer 프로세스로 emit합니다.
   * @param {string} eventName 이벤트명
   */
  addIpcEmitter(eventName) {
    this.socket.on(eventName, (data) => {
      this.sendWindowMessage(eventName, data);
    });
  }

  /**
   * Renderer 프로세스로 메세지를 전송합니다.
   * Window가 닫힌 상태에서는 메시지를 전송하지 않습니다.
   * @param {string} eventName 이벤트명
   * @param {any} data 보낼 데이터
   */
  sendWindowMessage(eventName, data) {
    if (!this.window) return;

    this.window.webContents.send(eventName, data);
  }

  setBrowserWindow(window) {
    this.window = window;
  }

  on(event, fn) {
    this.socket.on(event, fn);
  }

  emit(event, data) {
    this.socket.emit(event, data);
  }

  close() {
    if (this.isConnected()) {
      this.socket.close();
      this.socket = null;
    }

    return !this.isConnected();
  }
}

module.exports = ChatSocket;
