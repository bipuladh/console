import { Extension } from '@console/plugin-sdk/src/typings/base';
import { CodeRef, EncodedCodeRef, TypeUtils } from '../types';

export namespace ExtensionProperties {
  export type FeatureFlag = {
    /** Used to set/unset arbitrary Console feature flags. */
    handler: EncodedCodeRef;
  };

  export type FeatureFlag_Resolved = TypeUtils.Update<
    FeatureFlag,
    {
      handler: CodeRef<FeatureFlagHandler>;
    }
  >;

  export type ModelFeatureFlag = {
    /** The name of the flag to set once the CRD is detected. */
    flag: string;
    /** The model which refers to a `CustomResourceDefinition`. */
    model: {
      group: string;
      version: string;
      kind: string;
    };
  };
}

// Extension types

export type FeatureFlag = Extension<ExtensionProperties.FeatureFlag> & {
  type: 'console.flag';
};

export type FeatureFlag_Resolved = TypeUtils.Update<
  FeatureFlag,
  {
    properties: ExtensionProperties.FeatureFlag_Resolved;
  }
>;

export type ModelFeatureFlag = Extension<ExtensionProperties.ModelFeatureFlag> & {
  type: 'console.flag/model';
};

// Support types

export type FeatureFlagHandler = (callback: SetFeatureFlag) => void;
export type SetFeatureFlag = (flag: string, enabled: boolean) => void;

// Type guards

export const isFeatureFlag = (e: Extension): e is FeatureFlag_Resolved => e.type === 'console.flag';

export const isModelFeatureFlag = (e: Extension): e is ModelFeatureFlag =>
  e.type === 'console.flag/model';
