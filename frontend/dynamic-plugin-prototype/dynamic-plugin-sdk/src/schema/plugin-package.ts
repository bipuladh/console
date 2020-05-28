import * as readPkg from 'read-pkg';
import * as semver from 'semver';
import * as _ from 'lodash';
import { SchemaValidator } from '../validation/SchemaValidator';
import { ValidationResult } from '../validation/ValidationResult';

/**
 * Console plugin metadata in `package.json` file.
 */
export type ConsolePluginMetadata = {
  /** User-friendly plugin name. */
  displayName?: string;
  /** User-friendly plugin description. */
  description?: string;
  /** Specific modules exposed through the plugin's remote entry. */
  exposedModules?: { [moduleName: string]: string };
  /** Plugin API and other plugins required for this plugin to work. */
  dependencies: {
    '@console/pluginAPI': string;
    [pluginName: string]: string;
  };
};

/**
 * Schema of Console plugin's `package.json` file.
 */
export type ConsolePackageJSON = readPkg.PackageJson & {
  /** Console plugin specific metadata. */
  consolePlugin: ConsolePluginMetadata;
};

export const validatePackageFile = (obj: ConsolePackageJSON): ValidationResult => {
  const validator = new SchemaValidator('package.json');
  validator.result.assertThat(!!semver.valid(obj.version), 'version must be semver compliant');

  if (obj.consolePlugin) {
    validator.validate('plugin-metadata.json', obj.consolePlugin, 'consolePlugin');

    if (_.isPlainObject(obj.consolePlugin.dependencies)) {
      Object.entries(obj.consolePlugin.dependencies).forEach(([pluginName, versionRange]) => {
        validator.result.assertThat(
          !!semver.validRange(versionRange),
          `consolePlugin.dependencies['${pluginName}'] version range is not valid`,
        );
      });
    }
  } else {
    validator.result.addError('consolePlugin object is missing');
  }

  return validator.result;
};
