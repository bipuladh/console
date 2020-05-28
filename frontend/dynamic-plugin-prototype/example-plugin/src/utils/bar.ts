import { SetFeatureFlag } from '@openshift/console-dynamic-plugin-sdk/src/extensions/feature-flags';

export default (label: string) => `Hello ${label} Function!`;

export const testHandler: SetFeatureFlag = function() {
  console.error('testHandler called', arguments);
};
