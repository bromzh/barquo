// var helpers = require('./config/helpers');
// Karma configuration
// Generated on Wed Oct 26 2016 18:07:51 GMT+0300 (MSK)

module.exports = function (config) {
    var testWebpackConfig = require('./config/webpack.test.js');

    config.set({

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '',


        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: [
            'jasmine',
            // 'source-map-support',
        ],


        // list of files / patterns to load in the browser
        files: [
            { pattern: './test/test-context.js', watched: false },
            // { pattern: './lib/**/*.js', watched: false, served: false, included: false },
            // { pattern: './test/**/*.ts', watched: false, served: false, included: false },
            // { pattern: './src/**/*.ts', watched: false, served: false, included: false },
            // { pattern: 'test/**/*.ts' },
        ],

        // list of files to exclude
        exclude: [],

        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
            // '**/*.ts': ['karma-typescript'],
            './test/test-context.js': [
                'coverage',
                'webpack',
                'sourcemap',
                // 'sourcemap-writer', // important!
            ],
            // 'lib/**/*.js': ['sourcemap'],
            // 'src/**/*.ts': ['coverage', 'sourcemap'],
        },


        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: [
            // 'dots',
            'mocha',
            'coverage',
            'karma-remap-istanbul',
            // 'karma-typescript',
        ],


        // web server port
        port: 9876,


        // enable / disable colors in the output (reporters and logs)
        colors: true,


        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,


        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: false,
        autoWatchBatchDelay: 1000,

        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: ['Chrome'],

        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: true,

        // Concurrency level
        // how many browser should be started simultaneous
        concurrency: Infinity,

        webpack: testWebpackConfig,

        webpackMiddleware: {
            stats: 'errors-only',
            noInfo: true,
            quiet: true,
            publicPath: '',
            watchOptions: {
                aggregateTimeout: 1000,
            },
        },

        mochaReporter: {
            // output: 'noFailures',
            output: 'full',
        },

        // coverageReporter: {
        //     type: 'in-memory',
        //     // type: 'text-summary',
        //
        // },
        coverageReporter: { // important!
            instrumenterOptions: {
                istanbul: { noCompact: true }
            },
            reporters: [
                { type: 'in-memory' },
                { type: 'json', dir: 'coverage', subdir: '.', file: 'coverage-intermediate.json' },
            ],
        },

        remapIstanbulReporter: {
            src: './coverage/coverage-intermediate.json',
            reports: {
                'text-summary': null,
                html: './coverage',
                json: './coverage/coverage.json',
            },
        },
    })
};
