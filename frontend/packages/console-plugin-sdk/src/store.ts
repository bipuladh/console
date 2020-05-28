import * as _ from 'lodash';
import { ConsolePluginManifestJSON } from '../../../dynamic-plugin-prototype/dynamic-plugin-sdk/src/schema/plugin-manifest';
import { Extension, ExtensionWithMetadata, ActivePlugin } from './typings';
import { ExtensionRegistry } from './registry';

export const sanitizeExtension = <T extends Extension>(e: T): T => {
  e.flags = e.flags || {};
  e.flags.required = _.uniq(e.flags.required || []);
  e.flags.disallowed = _.uniq(e.flags.disallowed || []);
  return e;
};

export const augmentExtension = (e: Extension, p: ActivePlugin): ExtensionWithMetadata => {
  return Object.assign(e, { plugin: p.name });
};

export const isExtensionInUse = (e: Extension, flags: FlagsObject): boolean =>
  e.flags.required.every((f) => flags[f] === true) &&
  e.flags.disallowed.every((f) => flags[f] === false);

export const getGatingFlagNames = (extensions: Extension[]): string[] =>
  _.uniq([
    ..._.flatMap(extensions.map((e) => e.flags.required)),
    ..._.flatMap(extensions.map((e) => e.flags.disallowed)),
  ]);

/**
 * Provides access to Console plugin data.
 *
 * In development, this object is exposed as `window.pluginStore` for easier debugging.
 */
export class PluginStore {
  // Extensions contributed by static plugins
  private readonly staticExtensions: ExtensionWithMetadata[];

  // Extensions contributed by dynamic plugins
  private dynamicExtensions: Extension[] = [];

  // TODO(vojtech): legacy, remove
  public readonly registry: ExtensionRegistry;

  private readonly dynamicPlugins = new Map<string, DynamicPlugin>();

  private readonly listeners: (() => void)[] = [];

  public constructor(plugins: ActivePlugin[]) {
    this.staticExtensions = _.flatMap(
      plugins.map((p) =>
        p.extensions.map((e) => Object.freeze(augmentExtension(sanitizeExtension({ ...e }), p))),
      ),
    );
    this.registry = new ExtensionRegistry(plugins);
    this.updateDynamicExtensions = _.debounce(this.updateDynamicExtensions, 1000);
  }

  public getAllExtensions(): Extension[] {
    return [...this.staticExtensions, ...this.dynamicExtensions];
  }

  private updateDynamicExtensions() {
    this.dynamicExtensions = Array.from(this.dynamicPlugins.values()).reduce(
      (acc, plugin) => (plugin.enabled ? [...acc, ...plugin.resolvedExtensions] : acc),
      [] as Extension[],
    );

    this.listeners.forEach((listener) => {
      listener();
    });
  }

  public subscribe(listener: () => void): () => void {
    let isSubscribed = true;
    this.listeners.push(listener);

    return () => {
      if (isSubscribed) {
        isSubscribed = false;
        this.listeners.splice(this.listeners.indexOf(listener), 1);
      }
    };
  }

  public addDynamicPlugin(
    pluginID: string,
    manifest: ConsolePluginManifestJSON,
    resolvedExtensions: Extension[],
  ) {
    if (!this.dynamicPlugins.has(pluginID)) {
      this.dynamicPlugins.set(pluginID, {
        manifest: Object.freeze(manifest),
        resolvedExtensions: resolvedExtensions.map((e) => Object.freeze(sanitizeExtension(e))),
        enabled: false,
      });
    }
  }

  public setDynamicPluginEnabled(pluginID: string, enabled: boolean) {
    if (this.dynamicPlugins.has(pluginID)) {
      const plugin = this.dynamicPlugins.get(pluginID);

      if (plugin.enabled !== enabled) {
        plugin.enabled = enabled;
        this.updateDynamicExtensions();
      }
    }
  }

  public getDynamicPluginMetadata() {
    return Array.from(this.dynamicPlugins.keys()).reduce((acc, pluginID) => {
      acc[pluginID] = _.omit(this.dynamicPlugins.get(pluginID).manifest, 'extensions');
      return acc;
    }, {} as { [pluginID: string]: DynamicPluginMetadata });
  }
}

type FlagsObject = { [key: string]: boolean };

type DynamicPluginManifest = Readonly<ConsolePluginManifestJSON>;

type DynamicPluginMetadata = Omit<DynamicPluginManifest, 'extensions'>;

type DynamicPlugin = {
  manifest: DynamicPluginManifest;
  resolvedExtensions: Extension[];
  enabled: boolean;
};
