/* eslint-disable global-require */
/* eslint-disable @typescript-eslint/no-require-imports */
import { RemoteEntryModule } from './types';

/**
 * Vendor modules shared between Console application and its dynamic plugins.
 */
export const sharedVendorModules = [
  'react',
  'react-router',
  'react-router-dom',
  'react-helmet',
  '@patternfly/patternfly',
  '@patternfly/react-charts',
  '@patternfly/react-core',
  '@patternfly/react-icons',
  '@patternfly/react-table',
];

/**
 * At runtime, Console will override (i.e. enforce Console-bundled implementation of) shared
 * modules for each dynamic plugin, before loading any of the modules exposed by that plugin.
 *
 * This way, a single version of React etc. is used by the Console application.
 */
export const overrideSharedModules = (entryModule: RemoteEntryModule) => {
  entryModule.override({
    react: async () => () => require('react'),
    'react-router': async () => () => require('react-router'),
    'react-router-dom': async () => () => require('react-router-dom'),
    'react-helmet': async () => () => require('react-helmet'),
    // eslint-disable-next-line import/no-unresolved
    '@patternfly/patternfly': async () => () => require('@patternfly/patternfly'),
    '@patternfly/react-charts': async () => () => require('@patternfly/react-charts'),
    '@patternfly/react-core': async () => () => require('@patternfly/react-core'),
    '@patternfly/react-icons': async () => () => require('@patternfly/react-icons'),
    '@patternfly/react-table': async () => () => require('@patternfly/react-table'),
  });
};
