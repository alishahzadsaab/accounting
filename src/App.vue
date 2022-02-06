<template>
  <div id="q-app">
    <frappe-desk v-if="showDesk" :sidebarConfig="sidebarConfig">
      <router-view />
    </frappe-desk>
    <router-view v-else name="setup" />
    <frappe-modal ref="modal" :show="modalVisible" v-bind="modalOptions" @close-modal="modalVisible = false"/>
  </div>
</template>

<script>
import Vue from 'vue';

// vue components
import NotFound from 'frappejs/ui/components/NotFound';
import FeatherIcon from 'frappejs/ui/components/FeatherIcon';
import FrappeControl from 'frappejs/ui/components/controls/FrappeControl';
import Button from 'frappejs/ui/components/Button';
import Indicator from 'frappejs/ui/components/Indicator';
import modalPlugin from 'frappejs/ui/plugins/modal';
import registerReportMethods from '../reports';

// frappejs imports
import io from 'socket.io-client';
import frappe from 'frappejs';
import HTTPClient from 'frappejs/backends/http';
import Observable from 'frappejs/utils/observable';
import common from 'frappejs/common';
import coreModels from 'frappejs/models';
import models from '../models';
import { _ } from 'frappejs/utils';

import Desk from 'frappejs/ui/components/Desk';
import Modal from 'frappejs/ui/components/Modal';
import sidebarConfig from './sidebarConfig';


frappe.init();
frappe.registerLibs(common);
frappe.registerModels(coreModels);
frappe.registerModels(models);
const server = 'localhost:8000';
frappe.fetch = window.fetch.bind();
frappe.db = new HTTPClient({ server });
const socket = io.connect(`http://${server}`);
frappe.db.bindSocketClient(socket);
frappe.registerModels(models);
frappe.docs = new Observable();
frappe.getSingle('SystemSettings');
registerReportMethods();

window.frappe = frappe;

frappe.getSingle('AccountingSettings')
  // .then(accountingSettings => {
  //   if (accountingSettings.companyName) {
  //     router.push('/list/ToDo');
  //   } else {
  //     router.push('/setup-wizard');
  //   }
  // });

Vue.component('not-found', NotFound);
Vue.component('feather-icon', FeatherIcon);
Vue.component('frappe-control', FrappeControl);
Vue.component('f-button', Button);
Vue.component('indicator', Indicator);

Vue.use(modalPlugin);

Vue.mixin({
  methods: {
    // global translation function in every component
    _(...args) {
      return _(...args);
    }
  }
});

export default {
  name: 'App',
  data() {
    return {
      showDesk: true,
      sidebarConfig
    }
  },
  components: {
    FrappeDesk: Desk,
    FrappeModal: Modal
  },
  async beforeRouteUpdate(to, from, next) {
    const accountingSettings = await frappe.getSingle('AccountingSettings');
    if (accountingSettings.companyName) {
      this.showDesk = true;
    } else {
      this.showDesk = true;
    }
  }
}
</script>

<style lang="scss">
@import "~bootstrap/scss/bootstrap";
@import '~frappe-datatable/dist/frappe-datatable';

html {
  font-size: 14px;
}

</style>
