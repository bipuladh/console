import * as webpack from 'webpack';
import * as path from 'path';
import { ConsoleRemotePlugin } from '@openshift/console-dynamic-plugin-sdk/src/main';

const pkg = require('./package.json');

const config: webpack.Configuration = {
  context: path.resolve(__dirname, 'src'),
  entry: './plugin.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    publicPath: 'http://localhost:9001/',
    filename: '[name]-bundle.js',
    chunkFilename: '[name]-chunk.js',
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
  module: {
    rules: [
      {
        test: /(\.jsx?)|(\.tsx?)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              configFile: path.resolve(__dirname, 'tsconfig.json'),
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new ConsoleRemotePlugin({
      metadata: {
        name: pkg.name,
        version: pkg.version,
        entry: 'plugin-entry.js',
      },
      exposes: {
        FooComponent: './components/Foo',
        barUtils: './utils/bar.ts',
      },
    }),
  ],
  mode: 'development',
  devtool: 'source-map',
  optimization: {
    chunkIds: 'named',
    minimize: false,
  },
};

if (process.env.NODE_ENV === 'production') {
  config.output.filename = '[name]-bundle-[hash].min.js';
  config.output.chunkFilename = '[name]-chunk-[chunkhash].min.js';
  config.mode = 'production';
  config.optimization.chunkIds = 'deterministic';
  config.optimization.minimize = true;
}

export default config;
