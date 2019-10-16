<template>
  <div class="d-flex flex-column fill-height">
    <div class="flex-shrink-0">
      <v-slide-y-transition>
        <slot name="notify"></slot>
      </v-slide-y-transition>
    </div>
    <div class="flex-grow-1 overflow-auto">
      <div class="d-flex flex-column justify-end mnh-100 pa-2" ref="messageWrap">
        <template v-for="(message, index) in messages">
          <template v-if="message.system">
            <div class="h-line" :key="index"><span>{{ message.text }}</span></div>
          </template>
          <template v-else>
            <div
              class="d-flex mb-2 msgbox"
              :class="`${message.self ? 'flex-row-reverse text-right' : 'flex-row'}`"
              :key="index"
            >
              <pre class="content">{{ message.text }}</pre>
              <span class="time">{{ toTimeText(message.time) }}</span>
            </div>
          </template>
        </template>
      </div>
    </div>
    <div>
      <v-textarea
        v-model="text"
        append-icon="fa-paper-plane"
        class="br0"
        maxlength="10000"
        placeholder="Input text here~"
        rows="3"
        @click:append="sendText"
        @keypress.enter.exact.prevent="sendText"
        hide-details
        no-resize
        solo
      ></v-textarea>
    </div>
  </div>
</template>

<script>
import { ipcRenderer } from 'electron';
import moment from 'moment';

moment.locale('ko');

export default {
  data() {
    return {
      text: '',
      messages: [],
    };
  },
  methods: {
    sendText() {
      const text = this.text.trim().replace(/(\n){3,}/g, '\n\n');
      if (text !== '') {
        ipcRenderer.send('message.send', { message: text });

        this.messages.push({
          self: true,
          time: new Date().getTime(),
          text,
        });

        this.text = '';
        this.$nextTick(() => {
          this.$refs.messageWrap.parentElement.scrollTop = this.$refs.messageWrap.scrollHeight;
        });
      }
    },
    toTimeText(timestamp) {
      return moment(timestamp).format('A hh:mm');
    },
    onReceivedMessage(e, { message }) {
      console.log('message received!');
      this.messages.push({
        self: false,
        time: new Date().getTime(),
        text: message,
      });
      this.$nextTick(() => {
        this.$refs.messageWrap.parentElement.scrollTop = this.$refs.messageWrap.scrollHeight;
      });
    },
    onUserEnter(e, { message }) {
      this.messages.push({
        system: true,
        text: message,
      });
      this.$nextTick(() => {
        this.$refs.messageWrap.parentElement.scrollTop = this.$refs.messageWrap.scrollHeight;
      });
    },
  },
  created() {
    ipcRenderer.on('message.receive', this.onReceivedMessage);
    ipcRenderer.on('user.enter', this.onUserEnter);
  },
};
</script>

<style scoped>
.status {
  height: 60px;
  background-color: #666;
}
.msgbox > .content {
  padding: 6px 8px;
  min-width: 35%;
  max-width: 60%;
  background-color: #ccc;
  border-radius: 2px;
  word-break: break-word;
  word-wrap: break-word;
  white-space: pre-wrap;
  font-size: .84rem;
  font-family: 'Nanum Gothic';
}
.msgbox > .time {
  margin-left: 6px;
  margin-right: 6px;
  color: #6f6f6f;
  font-size: .64rem;
  align-self: flex-end;
  font-family: 'Nanum Gothic';
}
.h-line {
  margin: 10px 0;
  color: #6f6f6f;
  border-bottom: 1px solid #cecece;
  line-height: .1rem;
  text-align: center;
  font-size: .8rem;
}
.h-line > span {
  background-color: #fafafa;
  padding: 0 8px;
}
</style>
