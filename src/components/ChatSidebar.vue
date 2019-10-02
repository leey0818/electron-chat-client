<template>
  <v-list
    color="#434753"
    height="100%"
    width="30%"
    min-width="240"
    max-width="300"
    dark
    dense
    nav
  >
    <v-list-item>
      <v-list-item-avatar class="mr-3" color="grey" size="38">
        <i class="fa fa-user"></i>
      </v-list-item-avatar>
      <v-list-item-content>
        <v-list-item-title class="pt-1 subtitle-1">leey0818</v-list-item-title>
        <v-list-item-subtitle class="status s-online">online</v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
    <v-list-item>
      <v-text-field dense hide-details>
        <template v-slot:label><i class="fa fa-users"></i> Friends</template>
      </v-text-field>
    </v-list-item>

    <v-list-item
      v-for="user in users"
      :key="user.id"
      link
    >
      <v-list-item-avatar class="mr-3" color="grey" size="38">
        <i class="fa fa-user"></i>
      </v-list-item-avatar>
      <v-list-item-content>
        <v-list-item-title class="pt-1 subtitle-1">{{ user.name }}</v-list-item-title>
        <v-list-item-subtitle
          :class="`status s-${user.state}`"
        >{{ user.state }}</v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
  </v-list>
</template>

<script>
export default {
  data() {
    return {
      users: [
        { id: 0, name: 'leey0818', state: 'online' },
        { id: 1, name: 'Beans', state: 'offline' },
      ],
    };
  },
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
.status.s-offline:after {
  background-color: #e63b3b;
}
</style>
