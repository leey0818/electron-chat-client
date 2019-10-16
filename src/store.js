import Vue from 'vue';
import Vuex from 'vuex';

const { ipcRenderer } = require('electron');

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    user: {
      id: null,
      nickname: 'leey0818',
    },
    socket: {
      connected: true,
      retryCount: -1,
      maxCount: 0,
    },
  },
  mutations: {
    setSocketConnectState(state, isConnected) {
      state.socket.connected = isConnected;
    },
    setSocketRetryCount(state, retry) {
      state.socket.retryCount = retry;
    },
    setSocketMaxCount(state, max) {
      state.socket.maxCount = max;
    },
  },
  actions: {

  },
});

ipcRenderer.send('getConnection');
ipcRenderer.on('connection', (e, { connect, retryCount, maxCount }) => {
  if (connect !== undefined) store.commit('setSocketConnectState', connect);
  if (retryCount !== undefined) store.commit('setSocketRetryCount', retryCount);
  if (maxCount !== undefined) store.commit('setSocketMaxCount', maxCount);
});

export default store;
