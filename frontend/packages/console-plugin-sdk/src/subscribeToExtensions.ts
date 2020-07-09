import { Store } from 'redux';
import * as _ from 'lodash';
import { RootState } from '@console/internal/redux';
import { isExtensionInUse, PluginStore } from './store';
import { Extension, ExtensionTypeGuard } from './typings';

let subscriptionServiceInitialized = false;

const subscriptions: ExtensionSubscription<Extension>[] = [];

export const initSubscriptionService = (pluginStore: PluginStore, reduxStore: Store<RootState>) => {
  if (subscriptionServiceInitialized) {
    throw new Error('Subscription service is already initialized');
  }

  subscriptionServiceInitialized = true;

  const invokeListeners = () => {
    debugger; // TODO TEST

    const allExtensions = pluginStore.getAllExtensions();
    const allFlags = reduxStore.getState().FLAGS.toObject();

    subscriptions.forEach((sub) => {
      // Narrow extensions according to type guards
      const matchedExtensions = _.flatMap(sub.typeGuards.map((tg) => allExtensions.filter(tg)));

      // Gate matched extensions by relevant feature flags
      const extensionsInUse = matchedExtensions.filter((e) => isExtensionInUse(e, allFlags));

      // Invoke listener only if the extension list has changed
      if (!_.isEqual(extensionsInUse, sub.listenerLastArgs)) {
        sub.listenerLastArgs = extensionsInUse;
        sub.listener(extensionsInUse);
      }
    });
  };

  pluginStore.subscribe(invokeListeners);
  reduxStore.subscribe(invokeListeners);

  // Trigger initial listener invocation in order to support static plugins
  invokeListeners();
};

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

/**
 * `ExtensionListener` adapter that computes the difference between the calls.
 */
export const extensionDiffListener = <E extends Extension>(
  listener: (added: E[], removed: E[]) => void,
): ExtensionListener<E> => {
  let prevExtensions: E[] = [];

  return (nextExtensions: E[]) => {
    listener(
      _.difference(nextExtensions, prevExtensions),
      _.difference(prevExtensions, nextExtensions),
    );

    prevExtensions = nextExtensions;
  };
};

type ExtensionListener<E extends Extension> = (extensions: E[]) => void;

type ExtensionSubscription<E extends Extension> = {
  listener: ExtensionListener<E>;
  typeGuards: ExtensionTypeGuard<E>[];
  listenerLastArgs?: E[];
};
