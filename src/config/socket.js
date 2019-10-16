export default {
  url: 'http://localhost:3000',
  options: {
    reconnectionAttempts: 5,
    transports: ['websocket'],
    forceNew: false,
    query: {
      token: 'qwer1234!@',
    },
  },
};
