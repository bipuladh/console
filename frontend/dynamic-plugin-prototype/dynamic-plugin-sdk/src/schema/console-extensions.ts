import { SchemaValidator } from '../validation/SchemaValidator';
import { ValidationResult } from '../validation/ValidationResult';
import { FeatureFlag, ModelFeatureFlag } from '../extensions/feature-flags';

export type SupportedExtension = FeatureFlag | ModelFeatureFlag;

/**
 * Schema of Console plugin's `console-extensions.json` file.
 */
export type ConsoleExtensionsJSON = {
  /** Reference to JSON schema. */
  $schema?: string;
  /** List of extensions contributed by the plugin. */
  data: SupportedExtension[];
};

export const extensionsFile = 'console-extensions.json';

export const validateExtensionsFile = (obj: ConsoleExtensionsJSON): ValidationResult => {
  return new SchemaValidator(extensionsFile).validate(extensionsFile, obj);
};
