// webpack should be in the node_modules directory, install if not.
const webpack = require("webpack");
//const Visualizer = require('webpack-visualizer-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const {GenerateSW} = require('workbox-webpack-plugin');

module.exports = {
    mode: 'development', //'production',
    entry: [
        "./src/App.tsx"
    ],
    output: {
        filename: "mineswweeper.js",
        path: __dirname + "/dist",
        library: "MineSweeper",
        libraryTarget: "umd", //"var" "commonjs" "umd"
    },

    // Enable sourcemaps for debugging webpack's output.
    devtool: "source-map",

    devServer: {
        host: '0.0.0.0',
        disableHostCheck: true
    },

    resolve: {
        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: [".webpack.js", ".web.js", ".ts", ".tsx", ".js"]
    },

    module: {
        rules: [
            // All files with a '.ts' or '.tsx' extension will be handled by 'ts-loader'.
            {
                test: /\.tsx?$/,
                loader: "ts-loader"
            },
            // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
            {
                test: /\.tsx?$/,
                enforce: "pre",
                loader: "source-map-loader"
            }
        ]

    },
    plugins: [
        new webpack.LoaderOptionsPlugin({
            options: {
                context: __dirname
            },
            debug: true
        }),
        new CopyWebpackPlugin({
            patterns: [
                {from: 'static/*.css'},
                {from: 'static/*.svg'},
                {from: 'static/*.png'}
            ]
        }),
        new HtmlWebpackPlugin({
            template: 'static/index.html'
        }),
        new GenerateSW({
            // these options encourage the ServiceWorkers to get in there fast
            // and not allow any straggling "old" SWs to hang around
            clientsClaim: true,
            skipWaiting: true
        }),
//        new Visualizer()
    ]
};
