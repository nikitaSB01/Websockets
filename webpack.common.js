// webpack.common.js
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  entry: "./src/index.js", // Точка входа в приложение
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"), // Папка для сборки
    clean: true, // Очистка папки dist перед новой сборкой
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader", // Транспиляция JS-кода для совместимости
        },
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader, // Извлечение CSS в отдельный файл
          "css-loader", // Поддержка импорта CSS в JS
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/index.html", // Шаблон для HTML-файла
      favicon: "./src/assets/icons8-favicon-48.png", // Путь к фавиконке
      filename: "index.html",
    }),
    new MiniCssExtractPlugin({
      filename: "style.css", // Имя CSS-файла в сборке
    }),
  ],
};
