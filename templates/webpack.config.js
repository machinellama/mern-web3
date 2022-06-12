const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const ReactRefreshTypeScript = require('react-refresh-typescript');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const config = require('./config');

const devMode = process.env.NODE_ENV !== 'production';

function getPlugins() {
  const plugins = [
    new webpack.SourceMapDevToolPlugin({}),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: './public/index.html'
    }),
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer']
    }),
    new MiniCssExtractPlugin({
      filename: 'styles.css'
    }),
    new ForkTsCheckerWebpackPlugin()
  ];

  if (devMode) {
    plugins.push(new ReactRefreshWebpackPlugin());
  }

  return plugins;
}

module.exports = {
  entry: './src/index.tsx',
  mode: devMode ? 'development' : 'production',
  devServer: {
    hot: true
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/'
  },
  resolve: {
    alias: {
      colors: path.resolve(__dirname, 'src/styles/colors.scss'),
      config: path.resolve(__dirname, 'config.js')
    },
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    fallback: {
      assert: require.resolve('assert'),
      crypto: require.resolve('crypto-browserify'),
      http: require.resolve('stream-http'),
      https: require.resolve('https-browserify'),
      os: require.resolve('os-browserify'),
      stream: require.resolve('stream-browserify'),
      url: require.resolve('url')
    }
  },
  devServer: {
    client: {
      overlay: false
    },
    static: './dist',
    open: true,
    port: config.web.port,
    historyApiFallback: true
  },
  plugins: getPlugins(),
  module: {
    rules: [
      {
        test: /\.[jt]sx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: require.resolve('ts-loader'),
            options: {
              getCustomTransformers: () => ({
                before: [devMode && ReactRefreshTypeScript()].filter(Boolean)
              }),
              transpileOnly: devMode
            }
          }
        ]
      },
      {
        test: /\.(sa|sc|c)ss$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader', 'postcss-loader']
      },
      {
        test: /\.(png|jp(e*)g|svg|gif|pdf)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: 'resources/[name].[ext]'
            }
          }
        ],
        exclude: /node_modules/
      }
    ]
  }
};
