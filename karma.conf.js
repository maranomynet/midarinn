// Karma configuration
// Generated on Fri Apr 29 2016 16:22:11 GMT+0000 (GMT)


var rollupCfg = require('./rollup.cfg.js');

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: [
      'jasmine',
    ],


    // list of files / patterns to load in the browser
    files: [
      // Globals/Preloads

      // Specs
      'src/**/*.spec.js',
      // Watched
      { pattern: 'pub/**/*.js', watched: true, served: false, included: false },
    ],


    // list of files to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
        'src/**/*.spec.js': ['rollup'],
    },

    // preprocessor Config:
    rollupPreprocessor: {
      rollup: rollupCfg,
      bundle: rollupCfg,
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],


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

    // // Enable or disable failure on running empty test-suites.
    // // If disabled the program will return exit-code 0 and display a warning
    // failOnEmptyTestSuite: false, // Default: true

    // client: {
    //   useIframe: true,
    // },

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: [
      'PhantomJS',
    ],

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity,
  })
}
