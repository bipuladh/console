import { FeatureFlagHandler } from '@openshift/console-dynamic-plugin-sdk/src/extensions/feature-flags';

export default (label: string) => `Hello ${label} Function!`;

export const testHandler: FeatureFlagHandler = function() {
  console.error('testHandler called', arguments);
};
