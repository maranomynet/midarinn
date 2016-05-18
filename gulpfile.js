var gulp = require('gulp');

var plumber = require('gulp-plumber');
// var notifier = require('node-notifier');
// Wrap gulp.src to add plumber and notifier to all tasks.
var _gulpSrc = gulp.src;
gulp.src = function () {
    return _gulpSrc.apply(gulp, arguments).pipe( plumber(function (err) {
        var errmsg = err.message || err;
        // notifier.notify({
        //     title: 'Error',
        //     message: errmsg
        //   });
        console.log(errmsg);
      }) );
  };



gulp.task('css', function() {
  var stylus = require('gulp-stylus');
  var cssnano = require('gulp-cssnano');
  var sourcemaps = require('gulp-sourcemaps');

  return gulp.src( 'src/*.styl' )
      .pipe( sourcemaps.init() )
      .pipe( stylus() )
      .pipe( cssnano({
          autoprefixer: {
              add: true,
              browsers: ['> 0.5%', 'last 2 versions', 'Firefox ESR'],
            },
          // Toggle unsafe optimizations
          // which are unsafe when combining multiple stylesheets
          // ...or when monitoring named animations via JavaScript
          safe: true,
        }) )
      .pipe( sourcemaps.write( '_maps/' ) )
      .pipe( gulp.dest( 'pub/' ) );
});


gulp.task('js', function () {
  var gulpRollup = require('gulp-rollup');
  var rollup = require('rollup');
  var uglify = require('gulp-uglify');
  var sourcemaps = require('gulp-sourcemaps');

  var rollupCfg = require('./rollup.cfg.js');
  rollupCfg.rollup = rollup;

  // return gulp.src([ 'src/*.js', '!src/*.spec.js' ])
  var s = gulp.src([ 'src/*.js', '!src/*.spec.js' ], {read: false})
    .pipe( sourcemaps.init() )
    .pipe( gulpRollup( rollupCfg ) )
    .pipe( uglify({
        preserveComments: 'some',
        compress: {
          drop_console: true,
        },
      }) )
    .pipe( sourcemaps.write( '_maps/' ) )
    .pipe( gulp.dest( 'pub/' ) );

  return s;
});


gulp.task('html', function () {
  return gulp.src( 'src/index.html' )
    .pipe( gulp.dest( 'pub/' ) );
});


gulp.task('test', ['js'], function (done) {
  var karma = require('karma');
  var KarmaServer = karma.Server;
  new KarmaServer({
      configFile:  __dirname + '/karma.conf.js',
      autoWatch: true,
      singleRun: false,
    }, done).start();
});

gulp.task('test-once', ['js'], function (done) {
  var karma = require('karma');
  var KarmaServer = karma.Server;
  new KarmaServer({
      configFile: __dirname + '/karma.conf.js',
      autoWatch: false,
      singleRun: true,
    }, done).start();
});


gulp.task('watch', function () {
  gulp.watch(['src/**/*.js', '!src/**/*.spec.js'], [ 'js' ]);
  gulp.watch('src/**/*.styl', [ 'css' ]);
});



gulp.task('default', ['html', 'css', 'js', 'watch', 'test']);
