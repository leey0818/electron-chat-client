export default {
  url: 'http://localhost:3000',
  options: {
    reconnectionAttempts: 10,
    transports: ['websocket'],
    forceNew: false,
    query: {
      token: 'qwer1234!@',
    },
  },
};
