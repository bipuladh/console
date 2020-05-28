/**
 * Remote (i.e. webpack container) entry module interface.
 */
export type RemoteEntryModule = {
  /**
   * Get a module exposed through the container.
   *
   * Fails if the requested module doesn't exist in container.
   */
  get: <T extends {}>(moduleName: string) => Promise<() => T>;

  /**
   * Override module(s) that were flagged by the container as "overridable".
   *
   * All modules exposed through the container will use the given replacement modules
   * instead of the container-local modules. If an override doesn't exist, all modules
   * of the container will use the container-local module implementation.
   */
  override: (modules: { [moduleName: string]: () => Promise<() => any> }) => void;
};

/**
 * Code reference, encoded as an object literal.
 *
 * The value of the `$codeRef` property should be formatted as `moduleName.exportName`
 * (referring to a named export) or `moduleName` (referring to the `default` export).
 */
export type EncodedCodeRef = { $codeRef: string };

/**
 * Code reference, resolved to a function that returns the object `T`.
 */
export type CodeRef<T> = () => Promise<T>;

// TODO: move to public/declarations.d.ts
export namespace TypeUtils {
  /**
   * Update existing properties of `O` with ones declared in `U`.
   */
  export type Update<O extends {}, U extends {}> = {
    [K in keyof O]: K extends keyof U ? U[K] : O[K];
  } & {};
}
