import * as React from 'react';
import { useDynamicScript, getRemoteModule, ScriptStatus } from './remote-module';

// TODO: this should be generated as {plugin-metadata-json-url-base}/{plugin-metadata-entry}
const remoteEntryURL = 'http://localhost:9001/plugin-entry.js';

const pluginName = '@openshift/console-example-plugin';

export const RemoteDemo1: React.FC = () => {
  type RemoteFunctionModule = {
    default: (label: string) => string;
  };

  const status = useDynamicScript(remoteEntryURL);

  if (status === ScriptStatus.Loading) {
    return <h2>Loading entry script</h2>;
  } else if (status === ScriptStatus.Failed) {
    return <h2>Failed to load entry script</h2>;
  }

  const Component = React.lazy(() =>
    getRemoteModule<RemoteFunctionModule>(pluginName, 'barUtils').then((m) => {
      return {
        default: () => <h2>{m.default('Test Demo 1')}</h2>,
      };
    }),
  );

  return (
    <React.Suspense fallback={<h2>Loading remote module</h2>}>
      <Component />
    </React.Suspense>
  );
};

export const RemoteDemo2: React.FC = () => {
  type RemoteComponentModule<P = {}> = {
    default: React.ComponentType<P>;
  };

  const status = useDynamicScript(remoteEntryURL);

  if (status === ScriptStatus.Loading) {
    return <h2>Loading entry script</h2>;
  } else if (status === ScriptStatus.Failed) {
    return <h2>Failed to load entry script</h2>;
  }

  const Component = React.lazy(() =>
    getRemoteModule<RemoteComponentModule<{ label: string }>>(pluginName, 'FooComponent'),
  );

  return (
    <React.Suspense fallback={<h2>Loading remote module</h2>}>
      <Component label="Test Demo 2" />
    </React.Suspense>
  );
};
