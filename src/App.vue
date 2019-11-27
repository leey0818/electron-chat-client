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

    <v-overlay
      v-model="dialog"
      absolute
      color="#fafafa"
      opacity="1"
    >
      <v-card :loading="loading" width="480" light>
        <v-card-title>환영합니다!</v-card-title>
        <v-card-subtitle>이용을 위해서는 로그인이 필요합니다.</v-card-subtitle>
        <v-card-text>
          <v-text-field
            v-model="form.loginId"
            :error="!!errorMessage"
            required
          >
            <template v-slot:label>
              <i class="fa fa-user"></i> Username
            </template>
          </v-text-field>
          <v-text-field
            type="password"
            v-model="form.loginPw"
            :error-messages="errorMessage"
            @keyup.enter.exact="login"
            required
          >
            <template v-slot:label>
              <i class="fa fa-lock"></i> Password
            </template>
          </v-text-field>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="login">Login</v-btn>
        </v-card-actions>
      </v-card>
    </v-overlay>
  </v-app>
</template>

<script>
import { ipcRenderer } from 'electron';
import { mapState } from 'vuex';
import ChatSidebar from './components/ChatSidebar.vue';
import ChatRoom from './components/ChatRoom.vue';

export default {
  name: 'App',
  components: {
    ChatSidebar,
    ChatRoom,
  },
  data() {
    return {
      dialog: true,
      loading: false,
      errorMessage: '',
      form: {
        loginId: '',
        loginPw: '',
      },
    };
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
    login() {
      this.loading = true;
      this.errorMessage = '';

      ipcRenderer.send('app.login', this.form);
      ipcRenderer.once('app.login.result', (e, result) => {
        this.loading = false;

        if (result.success) {
          this.dialog = false;
        } else {
          this.errorMessage = result.message;
        }
      });
    },
  },
  created() {
    this.dialog = ipcRenderer.sendSync('app.login.required');
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
