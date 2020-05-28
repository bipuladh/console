import * as _ from 'lodash';
import { pluginStore } from '@console/internal/plugins';
import reduxStore from '@console/internal/redux';
import { getFlagsObject } from '@console/internal/reducers/features';
import { isExtensionInUse } from './store';
import { Extension, ExtensionTypeGuard } from './typings';

const subscriptions: ExtensionSubscription<Extension>[] = [];

const invokeListeners = () => {
  const allExtensions = pluginStore.getAllExtensions();
  const allFlags = getFlagsObject(reduxStore.getState());

  subscriptions.forEach((sub) => {
    // Narrow extensions according to type guards
    const matchedExtensions = _.flatMap(sub.typeGuards.map((tg) => allExtensions.filter(tg)));

    // Gate matched extensions by relevant feature flags
    const extensionsInUse = matchedExtensions.filter((e) => isExtensionInUse(e, allFlags));

    // Invoke listener only if the extension list has changed
    if (!_.isEqual(extensionsInUse, sub.listenerLastArgs || [])) {
      sub.listenerLastArgs = extensionsInUse;
      sub.listener(extensionsInUse);
    }
  });
};

pluginStore.subscribe(invokeListeners);
reduxStore.subscribe(invokeListeners);

// Trigger initial listener invocation in order to support static plugins
setTimeout(invokeListeners);

/**
 * Subscription based mechanism for consuming Console extensions.
 *
 * _Tip: need to access extensions in a React component?_
 * - **Yes**
 *   - Functional components: use `useExtensions` hook.
 *   - Class components: use `withExtensions` higher-order component.
 * - **No**
 *   - Use `subscribeToExtensions` function.
 *
 * @param listener Listener invoked when the list of extension instances which are
 * currently in use, narrowed by the given type guard(s), changes.
 *
 * @param typeGuards Type guard(s) used to narrow the extension instances.
 *
 * @returns Function that unsubscribes the listener.
 */
export const subscribeToExtensions = <E extends Extension>(
  listener: ExtensionListener<E>,
  ...typeGuards: ExtensionTypeGuard<E>[]
): (() => void) => {
  if (typeGuards.length === 0) {
    throw new Error('You must pass at least one type guard to subscribeToExtensions');
  }

  const sub: ExtensionSubscription<E> = { listener, typeGuards };

  let isSubscribed = true;
  subscriptions.push(sub);

  return () => {
    if (isSubscribed) {
      isSubscribed = false;
      subscriptions.splice(subscriptions.indexOf(sub), 1);
    }
  };
};

type ExtensionListener<E extends Extension> = (extensionsInUse: E[]) => void;

type ExtensionSubscription<E extends Extension> = {
  listener: ExtensionListener<E>;
  typeGuards: ExtensionTypeGuard<E>[];
  listenerLastArgs?: E[];
};
