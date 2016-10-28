// Karma configuration
// Generated on Wed Oct 26 2016 18:07:51 GMT+0300 (MSK)

module.exports = function (config) {
    var testWebpackConfig = require('./test/webpack.test.js');

    config.set({

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '',


        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['jasmine', 'source-map-support'],


        // list of files / patterns to load in the browser
        files: [
            { pattern: 'test/test-context.js', watched: false },
            // { pattern: 'lib/**/*.js', watched: false, served: true, included: false, nocache: true },
            // { pattern: 'src/**/*.ts', watched: false, served: true, included: false, nocache: true },
        ],


        // list of files to exclude
        exclude: [],


        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
            'test/test-context.js': ['coverage', 'webpack', 'sourcemap'],
            // 'lib/**/*.js': ['sourcemap'],
            // 'src/**/*.ts': ['sourcemap'],
        },


        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: [
            'mocha',
            // 'coverage',
            // 'remap-coverage'
        ],


        // web server port
        port: 9876,


        // enable / disable colors in the output (reporters and logs)
        colors: true,


        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_ERROR,


        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: true,


        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: ['Chrome'],

        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: false,

        // Concurrency level
        // how many browser should be started simultaneous
        concurrency: Infinity,

        webpack: testWebpackConfig,

        webpackMiddleware: {
            stats: 'errors-only',
            noInfo: true,
            quiet: true,
            publicPath: '',
        },

        mochaReporter: {
            // output: 'noFailures',
            output: 'full',
        },

        coverageReporter: {
            type: 'in-memory',
        },

        remapCoverageReporter: {
            // 'text-summary': null,
            json: './coverage/coverage.json',
            html: './coverage/html'
        },
    })
};
