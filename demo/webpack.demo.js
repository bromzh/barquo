const path = require('path');
const webpack = require('webpack');

const TsConfigPathsPlugin = require('awesome-typescript-loader').TsConfigPathsPlugin;
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    devtool: 'source-map',
    entry: {
        main: path.resolve(__dirname, 'main.ts'),
    },
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, '../tmp'),
    },
    resolve: {
        extensions: ['.ts', '.js', '.json'],
        modules: [
            path.resolve(__dirname, '.'),
            path.resolve(__dirname, '../src'),
            'node_modules'
        ],
        alias: {
            'barquo': path.resolve(__dirname, '../lib/'),
        },
        plugins: [
            new TsConfigPathsPlugin({tsconfig: path.resolve(__dirname, './tsconfig.json')}),
        ],
    },
    module: {
        rules: [
            {
                enforce: 'pre',
                test: /\.js$/,
                loader: 'source-map-loader',
                exclude: [
                    // these packages have problems with their sourcemaps
                    // helpers.root('node_modules/rxjs'),
                    // helpers.root('node_modules/@angular')
                ]
            },

            {
                test: /\.ts$/,
                loader: 'awesome-typescript-loader',
                options: {
                    tsconfig: path.resolve(__dirname, './tsconfig.json'),
                }
            },
            {
                test: /\.json$/,
                loader: 'json-loader',
            },
        ]
    },
    plugins: [
        new webpack.LoaderOptionsPlugin({
            debug: true,
            options: {
                context: __dirname
            }
        }),
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, 'index.html'),
            chunksSortMode: 'dependency',
            inject: 'head'
        }),
    ],
    devServer: {
        historyApiFallback: true,
        watchOptions: {
            aggregateTimeout: 300,
            poll: 1000
        },
        host: '0.0.0.0',
        // outputPath: path.resolve(__dirname, '../tmp'),
    },
}