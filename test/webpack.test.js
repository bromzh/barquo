const path = require('path');
const webpack = require('webpack');

const TsConfigPathsPlugin = require('awesome-typescript-loader').TsConfigPathsPlugin;

module.exports = {
    devtool: 'inline-source-map',
    output: {
        // devtoolModuleFilenameTemplate: '[resource-path]',
    },
    resolve: {
        extensions: ['.ts', '.js', '.json'],
        modules: [
            path.resolve(__dirname),
            path.resolve(__dirname, '../lib'),
            path.resolve(__dirname, '../src'),
            'node_modules'
        ],
        alias: {
            'barquo': path.resolve(__dirname, '../lib/'),
        },
        plugins: [
            new TsConfigPathsPlugin({ tsconfig: path.resolve(__dirname, './tsconfig.json') }),
        ]
    },
    module: {
        rules: [
            {
                enforce: 'pre',
                test: /\.js$/,
                loader: 'source-map-loader',
                include: [
                    path.resolve(__dirname, '../src'),
                    path.resolve(__dirname, '../lib'),
                    path.resolve(__dirname)
                ],
                // exclude: [
                    // these packages have problems with their sourcemaps
                    // helpers.root('node_modules/rxjs'),
                    // helpers.root('node_modules/@angular')
                // ]
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

            {
                enforce: 'post',
                test: /\.js$/,
                loader: 'istanbul-instrumenter-loader',
                include: [
                    path.resolve(__dirname, '../src'),
                    path.resolve(__dirname, '../lib'),
                    path.resolve(__dirname)
                ],
                exclude: [
                    /node_modules/
                ],
                query: {
                    esModules: true
                },
            },
        ]
    },
    plugins: [
        new webpack.LoaderOptionsPlugin({
            debug: true,
        }),
        // new webpack.SourceMapDevToolPlugin({
            // filename: null, // if no value is provided the sourcemap is inlined
            // test: /\.(js)($|\?)/i // process .js and .ts files only
        // }),
    ]
}