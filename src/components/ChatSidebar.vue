<template>
  <v-list
    color="#434753"
    class="br0"
    height="100%"
    width="30%"
    min-width="240"
    max-width="300"
    dark
    dense
  >
    <v-list-item class="mb-2">
      <v-list-item-avatar class="mr-4" color="grey" size="38">
        <i class="fa fa-user-alt"></i>
      </v-list-item-avatar>
      <v-list-item-content>
        <v-list-item-title class="pt-1 subtitle-1">{{ userName }}</v-list-item-title>
        <v-list-item-subtitle
          class="status"
          :class="`s-${state}`"
        >{{ state }}</v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>

    <v-tabs
      v-model="tab"
      background-color="#434753"
      dark
      grow
    >
      <v-tab :ripple="false">Friends</v-tab>
      <v-tab :ripple="false">Rooms</v-tab>

      <v-tab-item :transition="false" :reverse-transition="false">
        <v-list class="br0" color="#434753" dark>
          <v-list-item>
            <v-text-field
              label="Search"
              tile
              dense
              full-width
              hide-details
            ></v-text-field>
          </v-list-item>

          <v-divider></v-divider>
          <v-list-item
            v-for="user in users"
            :key="user.id"
            link
          >
            <v-list-item-avatar class="mr-3" color="grey" size="38">
              <i class="fa fa-user-alt"></i>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title class="pt-1 subtitle-1">{{ user.name }}</v-list-item-title>
              <v-list-item-subtitle
                :class="`status s-${user.state}`"
              >{{ user.state }}</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-tab-item>
      <v-tab-item :transition="false" :reverse-transition="false">
        <v-list class="br0" color="#434753" dark>
          <v-list-item link>
            <v-list-item-content>
              <v-list-item-title>첫번째 방</v-list-item-title>
              <v-list-item-subtitle>nickname 외 2명</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-tab-item>
    </v-tabs>
  </v-list>
</template>

<script>
import { mapState } from 'vuex';

export default {
  data() {
    return {
      tab: 0,
      users: [
        { id: 0, name: 'leey0818', state: 'online' },
        { id: 1, name: 'Beans', state: 'offline' },
        { id: 2, name: 'Beans', state: 'I\'m busy!' },
      ],
    };
  },
  computed: {
    ...mapState({
      userId: state => state.user.id,
      userName: state => state.user.nickname,
      state: state => (state.socket.connected ? 'online' : 'offline'),
    }),
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
.status.s-typing:after {
  background-color: #e4bd4a;
}
</style>
