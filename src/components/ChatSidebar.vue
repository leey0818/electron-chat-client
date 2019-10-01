<template>
  <div>
    <v-list-item>
      <v-list-item-avatar class="mr-3" color="grey" size="38">
        <i class="fa fa-user"></i>
      </v-list-item-avatar>
      <v-list-item-content>
        <v-list-item-title class="pt-1 subtitle-1">leey0818</v-list-item-title>
        <v-list-item-subtitle class="status s-online">online</v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>

    <v-divider></v-divider>

    <v-text-field
      class="pa-3"
      background-color="#696c75"
      placeholder="Search name..."
      hide-details
      solo
      flat
    ></v-text-field>
  </div>
</template>

<script>
export default {
  // TODO
};
</script>

<style scoped>
.status {
  position: relative;
  padding-left: 10px;
}
.status:after {
    width: 6px;
    height: 6px;
    position: absolute;
    top: 5px;
    left: 0;
    content: ' ';
    border-radius: 50%;
}
.status.s-online:after {
    background-color: #62bf6e;
}
</style>
