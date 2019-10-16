<template>
  <v-app class="fill-height ff-ng">
    <v-row no-gutters>
      <!-- sidebar -->
      <chat-sidebar></chat-sidebar>

      <!-- chat room -->
      <v-col class="fill-height">
        <chat-room>
          <template v-slot:notify>
            <v-system-bar
              v-if="!$store.state.socket.connected"
              color="red"
              height="40"
              dark
            >
              <i class="fa fa-comment-slash mr-1"></i>
              <span v-if="retryCount >= 0">
                채팅 서버와 연결이 끊겼습니다. 재접속 시도 중...({{ retryCount }}/{{ maxCount }})
              </span>
              <span v-else>
                채팅 서버와 연결이 끊겼습니다. <a class="text-link" @click="requestReconnect">재접속 요청</a>
              </span>
            </v-system-bar>
          </template>
        </chat-room>
      </v-col>
    </v-row>
  </v-app>
</template>

<script>
import { mapState } from 'vuex';
import ChatSidebar from './components/ChatSidebar.vue';
import ChatRoom from './components/ChatRoom.vue';

const { ipcRenderer } = require('electron');

export default {
  name: 'App',
  components: {
    ChatSidebar,
    ChatRoom,
  },
  computed: {
    ...mapState({
      retryCount: state => state.socket.retryCount,
      maxCount: state => state.socket.maxCount,
    }),
  },
  methods: {
    requestReconnect() {
      this.$store.commit('setSocketRetryCount', 0);
      ipcRenderer.send('req.reconnect');
    },
  },
};
</script>

<style>
@font-face {
  font-family: 'Nanum Gothic';
  font-weight: normal;
  src: local('NanumGothic'),
    url('./assets/fonts/NanumGothic-Regular.ttf') format('truetype');
}
@font-face {
  font-family: 'Nanum Gothic';
  font-weight: bold;
  src: local('NanumGothicBold'),
    url('./assets/fonts/NanumGothic-Bold.ttf') format('truetype');
}
html, body {
  width: 100%;
  height: 100%;
  font-family: 'Nanum Gothic';
}
.mnh-100 {
  min-height: 100%;
}
.text-link {
  color: inherit !important;
  text-decoration: underline;
}
.br0 {
  border-radius: 0 !important;
}
</style>
