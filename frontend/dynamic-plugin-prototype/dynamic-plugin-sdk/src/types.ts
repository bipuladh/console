export type ConsolePluginMetadata = {
  /** Plugin name, e.g. `example-plugin` or `@kubevirt/console`. */
  name: string;
  /** Plugin version, e.g. `1.0.0` or `1.2.3-release.4`. */
  version: string;
  /** Remote (webpack container) entry filename, e.g. `plugin-entry.js`. */
  entry: string;
};
