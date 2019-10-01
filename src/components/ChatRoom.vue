<template>
  <div class="d-flex flex-column fill-height">
    <div>header</div>
    <div class="flex-grow-1">content</div>
    <div>
      <v-text-field
        v-model="text"
        append-icon="fa-paper-plane"
        placeholder="Input text here~"
        @click:append="sendText"
        @keyup.enter="sendText"
        hide-details
        solo
      ></v-text-field>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      text: '',
    };
  },
  methods: {
    sendText() {
      console.log(this.text);
      this.text = '';
    },
  },
};
</script>

<style>

</style>
