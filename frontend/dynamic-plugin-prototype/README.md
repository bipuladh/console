# Console dynamic plugin prototype

This directory contains packages used to prototype dynamic plugins:

- `dynamic-plugin-sdk` - equivalent of `packages/console-plugin-sdk` that provides the tools and
  APIs necessary to build dynamic plugins
- `example-plugin` - uses `dynamic-plugin-sdk` to expose plugin-specific modules to Console host
  application

The implementation is based on [webpack 5 module federation](https://github.com/webpack/changelog-v5/blob/master/guides/module-federation.md).


## Setting up development environment

```sh
# Install dependencies for Console monorepo
cd frontend
yarn
# Install dependencies for prototype monorepo
cd dynamic-plugin-prototype
yarn
# Build & start serving example plugin assets
cd example-plugin
yarn build && yarn test-server
# Run `oc login` and start Console Bridge server
```

## Dynamic plugin SDK notes

Dynamic plugins are expected to live in their own git repositories. Therefore, the SDK package
should be published to [npm public registry](https://www.npmjs.com/).

This package should contain everything necessary to build dynamic plugins, including common code
such as React components and utilities.

## TODOs and things to consider

- [ ] When loading plugin, check if `window[scope]` already exists before injecting the script.
  Alternatively, post-process the generated entry JS via webpack `compilation.updateAsset` and
  `eval` the JS content into a variable.
- [ ] Use `peerDependencies` in SDK package to ensure plugins use the right versions of shared
  dependencies such as React.
- [ ] Ensure the published SDK package has proper `README` and `LICENSE` files.
- [ ] Add unit tests, including ones for webpack plugins.
- [ ] Deal with the unnecessary webpack `config.entry` option in dynamic plugins.
