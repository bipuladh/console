import * as React from 'react';
import * as _ from 'lodash';
import { useForceRender } from '@console/shared/src/utils/useForceRender';
import { subscribeToExtensions } from './subscribeToExtensions';
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
 *
 * @returns List of extension instances which are currently in use, narrowed by the
 * given type guard(s).
 */
export const useExtensions = <E extends Extension>(...typeGuards: ExtensionTypeGuard<E>[]): E[] => {
  if (typeGuards.length === 0) {
    throw new Error('You must pass at least one type guard to useExtensions');
  }

  const extensionsRef = React.useRef([] as E[]);
  const forceRender = useForceRender();

  React.useEffect(() => {
    return subscribeToExtensions<E>((extensions) => {
      extensionsRef.current = extensions;
      forceRender();
    }, ...typeGuards);
  }, [forceRender, typeGuards]);

  return extensionsRef.current;
};

/**
 * `useExtensions` result adapter that computes the difference between the calls.
 *
 * @param nextExtensions Result of `useExtensions` hook.
 *
 * @returns `[added: E[], removed: E[]]` tuple.
 */
export const useExtensionDiff = <E extends Extension>(nextExtensions: E[]): [E[], E[]] => {
  const prevExtensionsRef = React.useRef([] as E[]);

  const added = React.useMemo(() => _.difference(nextExtensions, prevExtensionsRef.current), [
    nextExtensions,
  ]);

  const removed = React.useMemo(() => _.difference(prevExtensionsRef.current, nextExtensions), [
    nextExtensions,
  ]);

  prevExtensionsRef.current = nextExtensions;

  return React.useMemo(() => [added, removed], [added, removed]);
};
