// webpack.prod.js
const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = merge(common, {
  mode: "production",
  devtool: "source-map", // Создание source maps для отладки в продакшн
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        // Минификация JavaScript
        parallel: true,
      }),
      new CssMinimizerPlugin(), // Минификация CSS
    ],
  },
});
