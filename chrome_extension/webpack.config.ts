import * as path from "path";
import * as webpack from "webpack";
import { CleanWebpackPlugin } from "clean-webpack-plugin";
import * as CopyWebpackPlugin from "copy-webpack-plugin";

const config: webpack.Configuration = {
  mode: "development",
  devtool: "inline-source-map",
  entry: {
    background: "./src/background/background.ts",
    background_to_content_listener:
      "./src/content/all_urls/background_to_content_listener.ts",
    en_dict_naver_com: "./src/content/en_dict_naver_com/en_dict_naver_com.ts",
    www_youtube_com_watch: "./src/content/www_youtube_com/pages/watch.ts",
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        use: ["file-loader"],
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
    alias: {
      src: path.resolve(__dirname, "src"),
    },
  },
  output: {
    filename: "[name].js",
  },
  plugins: [
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin({
      patterns: [{ from: "./src/manifest.json" }],
    }),
  ],
};

export default config;
