const logLevel = process.env.NODE_ENV !== 'production' ? 'debug' : 'info';

export default {
  appenders: {
    console: {
      type: 'stdout',
    },
  },
  categories: {
    default: {
      appenders: ['console'],
      level: logLevel,
    },
  },
};
