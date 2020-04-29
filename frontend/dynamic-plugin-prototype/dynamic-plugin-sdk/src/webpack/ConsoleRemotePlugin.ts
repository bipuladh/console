import * as webpack from 'webpack';
import ConsoleAssetPlugin from './ConsoleAssetPlugin';
import { sharedVendorModules } from '../shared-modules';
import { ConsolePluginMetadata } from '../types';

const remoteEntryLibraryType = 'window';

class ConsoleRemotePlugin {
  constructor(private readonly options: PluginOptions) {}

  apply(compiler: webpack.Compiler) {
    if (!compiler.options.output.enabledLibraryTypes.includes(remoteEntryLibraryType)) {
      compiler.options.output.enabledLibraryTypes.push(remoteEntryLibraryType);
    }

    compiler.hooks.afterPlugins.tap('ConsoleRemotePlugin', () => {
      new webpack.container.ContainerPlugin({
        name: this.options.metadata.name,
        library: { type: remoteEntryLibraryType, name: this.options.metadata.name },
        filename: this.options.metadata.entry,
        exposes: this.options.exposes,
        overridables: sharedVendorModules,
      }).apply(compiler);
      new ConsoleAssetPlugin(this.options.metadata).apply(compiler);
    });
  }
}

type PluginOptions = {
  /** Console plugin metadata. */
  metadata: ConsolePluginMetadata;
  /** Specific modules exposed through the remote entry. */
  exposes: { [moduleName: string]: string };
};

export default ConsoleRemotePlugin;
