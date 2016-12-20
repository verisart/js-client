'use strict'

var webpack = require("webpack");

module.exports = {
    entry: "./src/index.js",
    output: {
        library: 'VerisartClient',
        libraryTarget: 'var'/*'umd'*/,
        path: "dist",
        filename: "verisart-client.js"
    },
    plugins: [
      new webpack.optimize.UglifyJsPlugin({minimize: true, screw_ie8: false})
    ],
    module: {
        loaders: [
            { test: /\.json$/, loader: 'json-loader'}
        ]
    }
}