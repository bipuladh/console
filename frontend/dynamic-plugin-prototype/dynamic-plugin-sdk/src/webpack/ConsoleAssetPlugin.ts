import * as webpack from 'webpack';
import * as path from 'path';
import { ConsolePackageJSON } from '../schema/plugin-package';
import {
  ConsoleExtensionsJSON,
  extensionsFile,
  validateExtensionsFile,
} from '../schema/console-extensions';
import { ConsolePluginManifestJSON, pluginManifestFile } from '../schema/plugin-manifest';
import { ExtensionValidator } from '../validation/ExtensionValidator';

const emitJSON = (compilation: webpack.Compilation, filename: string, data: any) => {
  const source = JSON.stringify(data, null, 2);

  // @ts-ignore-next-line
  compilation.emitAsset(filename, {
    source: () => source,
    size: () => source.length,
  });
};

export class ConsoleAssetPlugin {
  private readonly manifest: ConsolePluginManifestJSON;

  constructor(private readonly pkg: ConsolePackageJSON) {
    const ext = require<ConsoleExtensionsJSON>(path.resolve(process.cwd(), extensionsFile));
    validateExtensionsFile(ext).reportToConsole(true);

    this.manifest = {
      name: pkg.name,
      version: pkg.version,
      displayName: pkg.consolePlugin.displayName,
      description: pkg.consolePlugin.description,
      dependencies: pkg.consolePlugin.dependencies,
      extensions: ext.data,
    };
  }

  apply(compiler: webpack.Compiler) {
    let success = true;

    compiler.hooks.afterCompile.tap(ConsoleAssetPlugin.name, (compilation) => {
      const result = new ExtensionValidator(extensionsFile).validate(
        compilation,
        this.manifest.extensions,
        this.pkg.consolePlugin.exposedModules || {},
      );
      if (result.hasErrors()) {
        // @ts-ignore-next-line
        compilation.errors.push(new Error(result.formatErrors()));
        success = false;
      }
    });

    compiler.hooks.emit.tap(ConsoleAssetPlugin.name, (compilation) => {
      emitJSON(compilation, pluginManifestFile, this.manifest);
    });

    compiler.hooks.shouldEmit.tap(ConsoleAssetPlugin.name, () => success);
  }
}
