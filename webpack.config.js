
var webpack = require("webpack");

module.exports = {
    entry: "./src/index.js",
    output: {
        path: "lib",
        filename: "verisart-client.js"
    },
    plugins: [
      new webpack.optimize.UglifyJsPlugin({minimize: true, screw_ie8: false})
    ]
}