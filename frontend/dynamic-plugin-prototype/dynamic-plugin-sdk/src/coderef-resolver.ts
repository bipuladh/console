import * as _ from 'lodash';
import { Extension } from '@console/plugin-sdk/src/typings/base';
import { SupportedExtension } from './schema/console-extensions';
import { RemoteEntryModule, EncodedCodeRef, CodeRef } from './types';

const isEncodedCodeRef = (obj: object): obj is EncodedCodeRef =>
  _.isPlainObject(obj) &&
  _.isEqual(Object.getOwnPropertyNames(obj), ['$codeRef']) &&
  typeof (obj as EncodedCodeRef).$codeRef === 'string';

export const filterCodeRefProperties = (properties: object) =>
  _.pickBy(properties, isEncodedCodeRef) as { [propName: string]: EncodedCodeRef };

/**
 * Parse the `EncodedCodeRef` value into `[moduleName, exportName]` tuple.
 *
 * Returns an empty array if the value doesn't match the expected format.
 */
export const parseEncodedCodeRefValue = (value: string): [string, string] | [] => {
  const match = value.match(/^([^.]+)(?:\.(.+)){0,1}$/);
  return match ? [match[1], match[2] || 'default'] : [];
};

/**
 * Returns the object referenced by the `EncodedCodeRef` or `null` in case of any errors.
 */
const loadReferencedObject = async <TExport = any>(
  ref: EncodedCodeRef,
  entryModule: RemoteEntryModule,
  pluginID: string,
  errorCallback: () => void,
): Promise<TExport> => {
  if (process.env.NODE_ENV !== 'production') {
    console.info(`Loading object '${ref.$codeRef}' of plugin ${pluginID}`);
  }

  const [moduleName, exportName] = parseEncodedCodeRefValue(ref.$codeRef);
  let requestedModule: object;

  try {
    const moduleFactory = await entryModule.get(moduleName);
    requestedModule = moduleFactory();
  } catch (error) {
    console.error(`Failed to load module '${moduleName}' of plugin ${pluginID}`, error);
    errorCallback();
    return null;
  }

  if (!requestedModule[exportName]) {
    console.error(`Missing module export '${moduleName}.${exportName}' of plugin ${pluginID}`);
    errorCallback();
    return null;
  }

  return requestedModule[exportName];
};

/**
 * Returns new `extensions` array, resolving `EncodedCodeRef` values into `CodeRef` functions.
 *
 * _Does not execute `CodeRef` functions to load the referenced objects._
 */
export const resolveEncodedCodeRefs = (
  extensions: SupportedExtension[],
  entryModule: RemoteEntryModule,
  pluginID: string,
  errorCallback: () => void,
): Extension[] => {
  return extensions.map(_.cloneDeep).map((e) => {
    const codeRefProperties = filterCodeRefProperties(e.properties);

    Object.entries(codeRefProperties).forEach(([propName, ref]) => {
      const resolvedCodeRef: CodeRef<any> = async () =>
        await loadReferencedObject(ref, entryModule, pluginID, errorCallback);

      e.properties[propName] = resolvedCodeRef;
    });

    return e;
  });
};
