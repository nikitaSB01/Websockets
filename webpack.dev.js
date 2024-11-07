// webpack.dev.js
const path = require('path');
const webpack = require('webpack');
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map', // Поддержка source maps для отладки
  devServer: {
    static: './dist', // Папка с результатом сборки
    port: 8080, // Порт для локального сервера
    open: true, // Автоматически открывать браузер
    hot: true, // Горячая перезагрузка для CSS и JS
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
  ],
});
