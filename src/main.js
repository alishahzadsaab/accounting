import { ipcRenderer } from 'electron';
import esaint from 'esaint';
import Vue from 'vue';
import models from '../models';
import App from './App';
import FeatherIcon from './components/FeatherIcon';
import { getErrorHandled, handleError } from './errorHandling';
import { IPC_CHANNELS, IPC_MESSAGES } from './messages';
import router from './router';
import { outsideClickDirective } from './ui';
import { showToast, stringifyCircular } from './utils';

(async () => {
  esaint.isServer = true;
  esaint.isElectron = true;
  esaint.initializeAndRegister(models);
  esaint.fetch = window.fetch.bind();

  ipcRenderer.send = getErrorHandled(ipcRenderer.send);
  ipcRenderer.invoke = getErrorHandled(ipcRenderer.invoke);

  esaint.events.on('reload-main-window', () => {
    ipcRenderer.send(IPC_MESSAGES.RELOAD_MAIN_WINDOW);
  });

  window.esaint = esaint;
  window.esaint.store = {};

  registerIpcRendererListeners();

  Vue.config.productionTip = false;
  Vue.component('feather-icon', FeatherIcon);
  Vue.directive('on-outside-click', outsideClickDirective);
  Vue.mixin({
    computed: {
      esaint() {
        return esaint;
      },
      platform() {
        return {
          win32: 'Windows',
          darwin: 'Mac',
          linux: 'Linux',
        }[process.platform];
      },
    },
    methods: {
      t: esaint.t,
      T: esaint.T,
    },
  });

  Vue.config.errorHandler = (err, vm, info) => {
    const more = {
      info,
    };

    if (vm) {
      const { fullPath, params } = vm.$route;
      more.fullPath = fullPath;
      more.params = stringifyCircular(params ?? {});
      more.data = stringifyCircular(vm.$data ?? {}, true, true);
      more.props = stringifyCircular(vm.$props ?? {}, true, true);
    }

    handleError(false, err, more);
    console.error(err, vm, info);
  };

  window.onerror = (message, source, lineno, colno, error) => {
    error = error ?? new Error('triggered in window.onerror');
    handleError(true, error, { message, source, lineno, colno });
  };

  process.on('unhandledRejection', (error) => {
    handleError(true, error);
  });

  process.on('uncaughtException', (error) => {
    handleError(true, error, () => process.exit(1));
  });

  /* eslint-disable no-new */
  new Vue({
    el: '#app',
    router,
    components: {
      App,
    },
    template: '<App/>',
  });
})();

function registerIpcRendererListeners() {
  ipcRenderer.on(IPC_CHANNELS.STORE_ON_WINDOW, (event, message) => {
    Object.assign(window.esaint.store, message);
  });

  ipcRenderer.on(IPC_CHANNELS.CHECKING_FOR_UPDATE, (_) => {
    showToast({ message: esaint.t`Checking for updates` });
  });

  ipcRenderer.on(IPC_CHANNELS.UPDATE_AVAILABLE, (_, version) => {
    const message = version
      ? esaint.t`Version ${version} available`
      : esaint.t`New version available`;
    const action = () => {
      ipcRenderer.send(IPC_MESSAGES.DOWNLOAD_UPDATE);
    };

    showToast({
      message,
      action,
      actionText: esaint.t`Download Update`,
      duration: 10000,
      type: 'success',
    });
  });

  ipcRenderer.on(IPC_CHANNELS.UPDATE_NOT_AVAILABLE, (_) => {
    showToast({ message: esaint.t`No updates available` });
  });

  ipcRenderer.on(IPC_CHANNELS.UPDATE_DOWNLOADED, (_) => {
    const action = () => {
      ipcRenderer.send(IPC_MESSAGES.INSTALL_UPDATE);
    };
    showToast({
      message: esaint.t`Update downloaded`,
      action,
      actionText: esaint.t`Install Update`,
      duration: 10000,
      type: 'success',
    });
  });

  ipcRenderer.on(IPC_CHANNELS.UPDATE_ERROR, (_, error) => {
    error.name = 'Updation Error';
    handleError(true, error);
  });
}
