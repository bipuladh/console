import * as React from 'react';

export enum ScriptStatus {
  Loading = 'Loading',
  Ready = 'Ready',
  Failed = 'Failed',
}

/**
 * React hook that loads a dynamic script via `script` tag injection.
 */
export const useDynamicScript = (url: string) => {
  const [status, setStatus] = React.useState(ScriptStatus.Loading);

  React.useEffect(() => {
    const element = document.createElement('script');

    element.src = url;
    element.type = 'text/javascript';
    element.async = true;

    element.onload = () => {
      setStatus(ScriptStatus.Ready);
    };

    element.onerror = () => {
      setStatus(ScriptStatus.Failed);
    };

    document.head.appendChild(element);

    return () => {
      document.head.removeChild(element);
    };
  }, [url]);

  return status;
};

// TODO: keep this in sync with dynamic plugin SDK
const overrideVendorModules = (scope: string) => {
  (window as any)[scope]?.override(
    Object.assign({
      react: async () => () => require('react'),
    }),
  );
};

/**
 * Load a module exposed by a Console dynamic plugin.
 *
 * Semantically equivalent to `import(scope + '/' + moduleName)` except that it
 * works with modules loaded remotely, using webpack module federation concept.
 *
 * @param scope Scope under which the plugin's remote entry module is registered.
 * @param moduleName Name of the module exposed through the plugin's remote entry.
 */
export const getRemoteModule = async <Module>(scope: string, moduleName: string) => {
  try {
    overrideVendorModules(scope);
    const factory = await (window as any)[scope]?.get(moduleName);
    return factory() as Module;
  } catch (error) {
    console.error(error);
    throw new Error(`Failed to load remote module: ${scope}/${moduleName}`);
  }
};
