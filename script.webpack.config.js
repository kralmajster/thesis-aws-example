const path = require('path');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');
const { parse } = require('dotenv');
const { readFileSync } = require('fs');
const deploymentOutput = require('./__generated/deployment-output.json');
const changeCase = require('change-case');

const script = process.env.SCRIPT;
const stage = process.env.STAGE;

let envVars = {
  ...parse(readFileSync('.env.common'))
};
try {
  envVars = {
    ...envVars,
    ...parse(readFileSync(`.env.${stage}`))
  };
} catch (e) {
  envVars = {
    ...envVars,
    ...parse(readFileSync(`.env.dev`))
  };
}
if (stage && deploymentOutput[stage]) {
  envVars = {
    ...envVars,
    ...deploymentOutput[stage]
  };
}

module.exports = {
  entry: path.resolve(__dirname, `./_scripts/${script}.ts`),
  target: 'node',
  devtool: 'eval-source-map',
  externals: [nodeExternals()],
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
        use: [{ loader: 'imports-loader', options: {} }, { loader: 'babel-loader' }]
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js', '.json'],
    alias: {
      '@helpers': path.resolve(__dirname, './src/helpers.ts'),
      '@services': path.resolve(__dirname, './src/_services'),
      '@types': path.resolve(__dirname, './types.ts'),
      '@generated': path.resolve(__dirname, './__generated'),
    }
  },
  output: {
    libraryTarget: 'commonjs2',
    path: path.join(__dirname, './__generated/build/_scripts'),
    filename: 'script-output.js'
  },
  plugins: [new webpack.EnvironmentPlugin(envVars)]
};
