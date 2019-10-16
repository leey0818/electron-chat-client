import io from 'socket.io-client';
import log4js from 'log4js';
import config from '../config/socket';

const logger = log4js.getLogger('socket');

let instance;

export default class ChatSocket {
  constructor() {
    if (instance) return instance;

    this.socket = io(config.url, config.options);
    this.retryCount = -1;

    this.socket.on('connect', () => {
      logger.debug('connected!', this.socket.id);
      this.id = this.socket.id;
      this.sendWindowMessage('connection', { connect: true });
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

    instance = this;
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

  emit(event, data) {
    this.socket.emit(event, data);
  }

  connect() {
    if (this.socket.disconnected) {
      this.socket.connect();
    }
  }

  close() {
    this.socket.close();

    return this.socket.disconnected;
  }
}
