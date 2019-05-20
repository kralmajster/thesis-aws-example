const path = require('path');
const webpack = require('webpack');
const slsw = require('serverless-webpack');
const nodeExternals = require('webpack-node-externals');
const FriendlyErrors = require('friendly-errors-webpack-plugin');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');

const { isLocal } = slsw.lib.webpack;

const stage = slsw.lib.options.stage;
const envVars = {}

if (isLocal) {
  throw new Error(
    `Stack is not deployed yet. Please deploy the stack with specified stage first before running dev mode.`
  );
}

const config = {
  entry: slsw.lib.entries,
  target: 'node',
  devtool: 'nosources-source-map',
  mode: isLocal ? 'development' : 'production',
  externals: [nodeExternals(), 'aws-sdk'],
  performance: {
    hints: false
  },
  optimization: {
    namedModules: true,
    noEmitOnErrors: true,
    concatenateModules: true
  },
  stats: 'errors-only',
  module: {
    rules: [
      {
        test: /\.(js|ts)$/,
        exclude: /node_modules/,
        use: [{ loader: 'imports-loader' }, { loader: 'babel-loader' }]
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js', '.json'],
    alias: {
      '@helpers': path.resolve(__dirname, './src/helpers.ts'),
      '@types': path.resolve(__dirname, './types.ts'),
      '@generated': path.resolve(__dirname, './__generated'),
    }
  },
  output: {
    libraryTarget: 'commonjs2',
    path: path.join(__dirname, './__generated/build/serverless'),
    filename: '[name].js',
    sourceMapFilename: '[file].map'
  }
};

if (isLocal) {
  config.plugins = [
    new webpack.EnvironmentPlugin(envVars),
    new FriendlyErrors({
      compilationSuccessInfo: { messages: ['Lambda functions are running on http://localhost:3000'] }
    }),
    new ProgressBarPlugin()
  ];
}

module.exports = config;
