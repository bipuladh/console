import * as webpack from 'webpack';
import { ConsolePluginMetadata } from '../types';

class ConsoleAssetPlugin {
  constructor(private readonly options: PluginOptions) {}

  apply(compiler: webpack.Compiler) {
    compiler.hooks.emit.tap('ConsoleAssetPlugin', (compilation) => {
      const metadata = JSON.stringify(this.options, null, 2);

      // @ts-ignore-next-line
      compilation.emitAsset('plugin-metadata.json', {
        source: () => metadata,
        size: () => metadata.length,
      });
    });
  }
}

type PluginOptions = ConsolePluginMetadata;

export default ConsoleAssetPlugin;
