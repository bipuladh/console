import chalk from 'chalk';
import * as fs from 'fs-extra';
import * as _ from 'lodash';
import * as readPkg from 'read-pkg';
import { resolvePath, relativePath } from './utils/path';

const createPackageJson = (packagePath: string) => {
  const packageJson = readPkg.sync({ normalize: false });
  packageJson.name = '@openshift-console/dynamic-plugin-sdk';
  delete packageJson.private;
  packageJson.license = 'Apache-2.0';
  packageJson.main = 'lib/extensions/index.js';
  packageJson.exports = {
    '.': './lib/extensions/index.js',
    './webpack': './lib/webpack/ConsoleRemotePlugin.js',
    './api': './lib/api/api.js',
    './provisional': './lib/api/provisional.js',
  };
  packageJson.readme = 'README.md';
  packageJson.peerDependencies = _.pick(packageJson.devDependencies, 'webpack');
  packageJson.dependencies = {
    '@dynamic-sdk/provisional-api': 'file:./dynamic-sdk-provisional-api-v0.0.0-fixed.tgz',
  };
  delete packageJson.devDependencies;
  delete packageJson.scripts;
  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
};

const preparePkgAssets = () => {
  fs.mkdirSync(resolvePath('dist'), { recursive: true });
  const pkgOutPath = resolvePath('dist/package.json');
  console.log('Generating Console plugin package.json');
  createPackageJson(pkgOutPath);
  console.log(chalk.green(relativePath(pkgOutPath)));
  console.log('Copying schema, license, and readme files');
  fs.copySync(resolvePath('../../../LICENSE'), resolvePath('dist/LICENSE'));
  fs.copySync(resolvePath('README.md'), resolvePath('dist/README.md'));
  fs.copySync(resolvePath('schema'), resolvePath('dist/schema'), { recursive: true });
  fs.copySync(
    resolvePath('../console-provisional-api/dist/dynamic-sdk-provisional-api-v0.0.0-fixed.tgz'),
    resolvePath('dist/dynamic-sdk-provisional-api-v0.0.0-fixed.tgz'),
  );
};
preparePkgAssets();
