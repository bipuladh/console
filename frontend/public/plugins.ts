/* eslint-disable no-undef */

import { Store } from 'redux';
import { RootState } from '@console/internal/redux';
import { ActivePlugin, PluginStore } from '@console/plugin-sdk';
import { initSubscriptionService } from '@console/plugin-sdk/src/subscribeToExtensions';
import {
  fetchPluginManifest,
  loadDynamicPlugin,
  registerPluginEntryCallback,
} from '@console/plugin-sdk/src/dynamic-plugins';

// TODO(vojtech): legacy, remove along with `registry` export
export * from '@console/plugin-sdk';

// The '@console/active-plugins' module is generated during a webpack build,
// so we use dynamic require() instead of the usual static import statement.
const activePlugins =
  process.env.NODE_ENV !== 'test'
    ? (require('@console/active-plugins').default as ActivePlugin[])
    : [];

if (process.env.NODE_ENV !== 'test') {
  // eslint-disable-next-line no-console
  console.info(`Active plugins: [${activePlugins.map((p) => p.name).join(', ')}]`);
}

export const pluginStore = new PluginStore(activePlugins);
export const registry = pluginStore.registry;

export const initConsolePlugins = (reduxStore: Store<RootState>) => {
  initSubscriptionService(pluginStore, reduxStore);
  registerPluginEntryCallback(pluginStore);
};

if (process.env.NODE_ENV !== 'production') {
  // Expose Console plugin store for debugging
  window.pluginStore = pluginStore;

  // Expose function to load plugins directly from URLs
  window.loadPluginFromURL = async (baseURL: string) => {
    const manifest = await fetchPluginManifest(baseURL);
    loadDynamicPlugin(baseURL, manifest);
  };
}
