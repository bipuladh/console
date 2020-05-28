import * as path from 'path';
import * as fs from 'fs';
import { execSync } from 'child_process';
import * as tsj from 'ts-json-schema-generator';

execSync('rm -rf ./dist && mkdir -p ./dist/schema'); // TODO: remove once the 'build' script is fixed

const configFor = (sourcePath: string): tsj.Config => ({
  path: path.resolve(__dirname, sourcePath),
  tsconfig: path.resolve(__dirname, 'tsconfig.json'),
  topRef: false,
});

const writeSchema = (sourcePath: string, typeName: string, outPath: string) => {
  const schema = tsj.createGenerator(configFor(sourcePath)).createSchema(typeName);
  fs.writeFileSync(path.resolve(__dirname, outPath), JSON.stringify(schema, null, 2));
};

// TODO: optimize, i.e. reuse a single 'tsj' schema generator

writeSchema(
  'src/schema/plugin-package.ts',
  'ConsolePluginMetadata',
  'dist/schema/plugin-metadata.json',
);

writeSchema(
  'src/schema/console-extensions.ts',
  'ConsoleExtensionsJSON',
  'dist/schema/console-extensions.json',
);

writeSchema(
  'src/schema/plugin-manifest.ts',
  'ConsolePluginManifestJSON',
  'dist/schema/plugin-manifest.json',
);
