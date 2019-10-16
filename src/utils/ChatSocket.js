import io from 'socket.io-client';
import config from '../config/socket';

let instance;

export default class ChatSocket {
  constructor(window) {
    if (instance && window === this.window) return instance;

    // 소켓이 이미 연결되어 있다면, 종료 후 재연결
    if (this.isConnected()) this.close();

    this.window = window;
    this.socket = io(config.url, config.options);
    this.retryCount = -1;

    this.socket.on('connect', () => {
      console.log(`connected! ${this.socket.id}`);
      this.id = this.socket.id;
      this.sendWindowMessage('connection', { connect: true });
    });
    this.socket.on('reconnecting', (retry) => {
      console.log(`reconnecting... ${retry}`);
      this.retryCount = retry;
      this.sendWindowMessage('connection', { connect: false, retryCount: retry });
    });
    this.socket.on('reconnect_attempt', (retry) => {
      this.retryCount = retry;
      this.sendWindowMessage('connection', { connect: false, retryCount: retry });
    });
    this.socket.on('reconnect_failed', () => {
      console.log('reconect failed!');
      this.retryCount = -1;
      this.sendWindowMessage('connection', { connect: false, retryCount: -1 });
    });

    this.socket.on('ping', () => console.log('send ping!'));
    this.socket.on('pong', latency => console.log(`received pong! ${latency}ms`));

    instance = this;
  }

  isConnected() {
    return this.socket && this.socket.connected;
  }

  getRetryCount() {
    return this.retryCount;
  }

  static getMaxRetryCount() {
    return config.options.reconnectionAttempts;
  }

  /**
   * Renderer 프로세스로 메세지를 전송합니다.
   * @param {string} eventName 이벤트명
   * @param {any} data 보낼 데이터
   */
  sendWindowMessage(eventName, data) {
    this.window.webContents.send(eventName, data);
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

  emit(event, ...args) {
    this.socket.emit(event, ...args);
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
