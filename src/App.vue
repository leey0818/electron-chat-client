<template>
  <v-app class="fill-height">
    <v-slide-y-transition>
      <v-system-bar
        v-if="!isConnected"
        color="red"
        height="40"
        fixed
        dark
      >
        <i class="fa fa-comment-slash mr-1"></i>
        <span>채팅 서버와 연결이 끊겼습니다. 재접속 시도 중...</span>
      </v-system-bar>
    </v-slide-y-transition>

    <!-- sidebar -->
    <v-row no-gutters>
      <chat-sidebar></chat-sidebar>
      <v-col class="fill-height">
        <chat-room></chat-room>
      </v-col>
    </v-row>
  </v-app>
</template>

<script>
import ChatSidebar from './components/ChatSidebar.vue';
import ChatRoom from './components/ChatRoom.vue';

export default {
  name: 'App',
  components: {
    ChatSidebar,
    ChatRoom,
  },
  data: () => ({
    isConnected: true,
  }),
};
</script>

<style>
html, body {
  width: 100%;
  height: 100%;
}
.mnh-100 {
  min-height: 100%;
}
</style>
