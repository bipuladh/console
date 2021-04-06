import * as readPkg from 'read-pkg';
import chalk from 'chalk';
import * as fs from 'fs-extra';

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
  };
  packageJson.readme = 'README.md';
  packageJson.peerDependencies = packageJson.dependencies;
  delete packageJson.dependencies;
  delete packageJson.devDependencies;
  delete packageJson.scripts;
  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
};

const preparePkgAssets = () => {
  !fs.existsSync('dist') && fs.mkdirSync(resolvePath('dist'));
  const pkgOutPath = resolvePath('dist/package.json');
  console.log('Generating Console plugin package.json');
  createPackageJson(pkgOutPath);
  console.log(chalk.green(relativePath(pkgOutPath)));
  console.log('Copying schema, license, and readme files');
  fs.copySync(resolvePath('../../../LICENSE'), resolvePath('dist/LICENSE'));
  fs.copySync(resolvePath('README.md'), resolvePath('dist/README.md'));
  fs.copySync(resolvePath('schema'), resolvePath('dist/schema'), { recursive: true });
};

preparePkgAssets();
