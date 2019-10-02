<template>
  <div class="d-flex flex-column fill-height">
    <div class="flex-grow-1 overflow-auto">
      <div class="d-flex flex-column justify-end mnh-100 pa-2">
        <template v-for="(message, index) in messages">
          <div class="d-flex flex-row-reverse mb-2 msgbox" :key="index">
            <pre class="content">{{ message[0] }}</pre>
            <span class="time">{{ toTimeText(message[1]) }}</span>
          </div>
        </template>
      </div>
    </div>
    <div>
      <v-textarea
        v-model.trim="text"
        append-icon="fa-paper-plane"
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
      if (this.text !== '') {
        console.log(this.text);
        this.messages.push([this.text, new Date().getTime()]);
        this.text = '';
      }
    },
    toTimeText(timestamp) {
      return moment(timestamp).fromNow();
    },
  },
};
</script>

<style scoped>
.status {
  height: 60px;
  background-color: #666;
}
.msgbox > .content {
  padding: 4px 8px;
  min-width: 35%;
  max-width: 60%;
  background-color: #ccc;
  border-radius: 2px;
  word-break: break-all;
}
.msgbox > .time {
  margin-left: 6px;
  margin-right: 6px;
  color: #6f6f6f;
  font-size: .7rem;
  align-self: flex-end;
}
</style>
