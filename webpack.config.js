"use strict"

var webpack = require("webpack");
var path = require("path");

module.exports = {
  target: "web",
  entry: {
    app: path.join(__dirname, "src", "site.js")
  },
  output: {
    path: path.resolve(__dirname, "js"),
    filename: "site.js"
  },
  module: {
    rules: [
      {
        test: /\.js?$/,
        exclude: /node_modules/,
        loader: "babel-loader",
        query: {
          presets: ["es2015"]
        }
      },
    ]
  }
};
