import * as React from 'react';
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore: FIXME missing exports due to out-of-sync @types/react-redux version
import { useSelector } from 'react-redux';
import { createSelectorCreator, defaultMemoize } from 'reselect';
import * as _ from 'lodash';
import { RootState } from '@console/internal/redux';
import { stateToFlagsObject, FlagsObject, FeatureState } from '@console/internal/reducers/features';
import { pluginStore } from '@console/internal/plugins';
import { getGatingFlagNames, isExtensionInUse } from './store';
import { Extension, ExtensionTypeGuard } from './typings';

/**
 * React hook for consuming Console extensions.
 *
 * This hook takes extension type guard(s) as its argument(s) and returns a list
 * of extension instances, narrowed by the given type guard(s), which are currently
 * in use.
 *
 * An extension is considered to be in use when
 *
 * - it is an always-on extension, i.e. not gated by any feature flags
 * - all feature flags referenced by its `flags` object are resolved to the right
 *   values
 *
 * Example usage:
 *
 * ```ts
 * import {
 *   useExtensions,
 *   NavItem,
 *   Perspective,
 *   isNavItem,
 *   isPerspective,
 * } from '@console/plugin-sdk';
 *
 * const Example = () => {
 *   const navItemExtensions = useExtensions<NavItem>(isNavItem);
 *   const perspectiveExtensions = useExtensions<Perspective>(isPerspective);
 *   // process extensions and render your component
 * };
 * ```
 *
 * @param typeGuards Type guard(s) used to narrow the extension instances.
 */
export const useExtensions = <E extends Extension>(...typeGuards: ExtensionTypeGuard<E>[]): E[] => {
  if (typeGuards.length === 0) {
    throw new Error('You must pass at least one type guard to useExtensions');
  }

  // Subscribe to extension list changes
  const forceRender = React.useReducer((s: boolean) => !s, false)[1] as () => void;
  const allExtensionsRef = React.useRef([] as Extension[]);

  React.useEffect(() => {
    return pluginStore.subscribe(() => {
      allExtensionsRef.current = pluginStore.getAllExtensions();
      forceRender();
    });
  }, []);

  // Narrow extensions according to type guards
  const matchedExtensions = React.useMemo(
    () => _.flatMap(typeGuards.map((tg) => allExtensionsRef.current.filter(tg))),
    [typeGuards],
  );

  // Compute flags relevant for gating matched extensions
  const gatingFlagNames = React.useMemo(() => getGatingFlagNames(matchedExtensions), [
    matchedExtensions,
  ]);

  const gatingFlagSelectorCreator = React.useMemo(
    () =>
      createSelectorCreator(
        defaultMemoize as any,
        (prevFeatureState: FeatureState, nextFeatureState: FeatureState) =>
          gatingFlagNames.every((f) => prevFeatureState.get(f) === nextFeatureState.get(f)),
      ),
    [gatingFlagNames],
  );

  const gatingFlagSelector = React.useMemo(
    () =>
      gatingFlagSelectorCreator(
        (state: RootState) => state.FLAGS,
        (featureState) => stateToFlagsObject(featureState, gatingFlagNames),
      ),
    [gatingFlagSelectorCreator, gatingFlagNames],
  );

  const gatingFlags = useSelector<RootState, FlagsObject>(gatingFlagSelector);

  // Gate matched extensions by relevant feature flags
  const extensionsInUse = React.useMemo(
    () => matchedExtensions.filter((e) => isExtensionInUse(e, gatingFlags)),
    [matchedExtensions, gatingFlags],
  );

  return extensionsInUse;
};
