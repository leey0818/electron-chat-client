<template>
  <v-app>
    <v-slide-y-transition>
      <v-system-bar
        v-if="!isConnected"
        color="red"
        style="z-index:9"
        height="40"
        fixed
        dark
      >
        <i class="fa fa-comment-slash mr-1"></i>
        <span>채팅 서버와 연결이 끊겼습니다. 재접속 시도 중...</span>
      </v-system-bar>
    </v-slide-y-transition>

    <!-- sidebar -->
    <v-navigation-drawer color="#434753" app dark permanent>
      <chat-sidebar></chat-sidebar>
    </v-navigation-drawer>

    <!-- room -->
    <v-content>
      <chat-room></chat-room>
    </v-content>
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
