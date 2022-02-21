const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const devMode = process.env.NODE_ENV !== 'production';
const config = require('./config');

const plugins = [
  new webpack.SourceMapDevToolPlugin({}),
  new HtmlWebpackPlugin({
    filename: '{{webpack.htmlFilename}}',
    template: '{{webpack.htmlTemplate}}'
  }),
  new webpack.ProvidePlugin({
    process: 'process/browser',
    Buffer: ['buffer', 'Buffer']
  }),
  new MiniCssExtractPlugin({
    filename: 'styles.css'
  })
];

module.exports = {
  entry: '{{webpack.entryFile}}',
  mode: devMode ? 'development' : 'production',
  output: {
    path: path.resolve(__dirname, '{{webpack.outputPath}}'),
    filename: '{{webpack.outputFile}}',
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
    static: './{{webpack.outputPath}}',
    open: {{webpack.openOnStart}},
    port: config.web.port,
    historyApiFallback: true
  },
  plugins,
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        use: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.(ts|tsx)$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader',
          'postcss-loader'
        ],
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
}
