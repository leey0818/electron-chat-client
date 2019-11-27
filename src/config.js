const isDebug = process.env.NODE_ENV !== 'production';

module.exports = {
  logger: {
    appenders: {
      console: {
        type: 'stdout',
      },
    },
    categories: {
      default: {
        appenders: ['console'],
        level: isDebug ? 'debug' : 'info',
      },
    },
  },
  socket: {
    url: 'http://localhost:3000',
    options: {
      reconnectionAttempts: 10,
      transports: ['websocket'],
      forceNew: false,
    },
  },
};
