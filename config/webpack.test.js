const helpers = require('./helpers');
const path = require('path');
const webpack = require('webpack');

const TsConfigPathsPlugin = require('awesome-typescript-loader').TsConfigPathsPlugin;

module.exports = {
    devtool: 'inline-source-map',
    resolve: {
        extensions: ['.js', '.ts', '.json'],
        modules: [
            // helpers.root('src'),
            helpers.root('lib'),
            helpers.root('test'),
            'node_modules'
        ],
        alias: {
            'barquo': helpers.root('lib'),
        },
        mainFiles: ['index'],
        plugins: [
            new TsConfigPathsPlugin({ configFileName: helpers.root('test', 'tsconfig.json') }),
        ],
    },
    module: {
        rules: [
            {
                enforce: 'pre',
                test: /\.js$/,
                use: 'source-map-loader',
            },

            {
                test: /\.ts$/,
                loader: 'awesome-typescript-loader',
                query: {
                    configFileName: helpers.root('test', 'tsconfig.json'),
                }
            },
            {
                test: /\.json$/,
                use: 'json-loader',
            },

            {
                enforce: 'post',
                test: /\.(js|ts)$/,
                loader: 'istanbul-instrumenter-loader',
                include: [ helpers.root('lib') ],
                // exclude: [ /node_modules/ ],
                query: { esModules: true, debug: true, compact: false },
            },
        ]
    },
    plugins: [
        new webpack.LoaderOptionsPlugin({
            debug: true,
        }),
    ]
}