import gulp from 'gulp'
import gulpif from 'gulp-if'
import gutil from 'gulp-util'
import sourcemaps from 'gulp-sourcemaps'
import less from 'gulp-less'
import sass from 'gulp-sass'
import cleanCSS from 'gulp-clean-css'
import {log, colors} from 'gulp-util'
import named from 'vinyl-named'
import webpack from 'webpack'
import gulpWebpack from 'webpack-stream'
import plumber from 'gulp-plumber'
import livereload from 'gulp-livereload'
import args from './lib/args'

const ENV = args.production ? 'production' : 'development';

gulp.task('pages:html', () => {
  return gulp.src('app/pages/**/*.html')
    .pipe(gulp.dest(`dist/${args.vendor}/pages`))
    .pipe(gulpif(args.watch, livereload()));
});

gulp.task('pages:css', function () {
  return gulp.src('app/pages/**/*.css')
    .pipe(gulpif(args.sourcemaps, sourcemaps.init()))
    .pipe(gulpif(args.production, cleanCSS()))
    .pipe(gulpif(args.sourcemaps, sourcemaps.write()))
    .pipe(gulp.dest(`dist/${args.vendor}/styles`))
    .pipe(gulpif(args.watch, livereload()));
});

gulp.task('pages:less', function () {
  return gulp.src('app/pages/**/*.less')
    .pipe(gulpif(args.sourcemaps, sourcemaps.init()))
    .pipe(less({paths: ['./app']}).on('error', function (error) {
      gutil.log(gutil.colors.red('Error (' + error.plugin + '): ' + error.message));
      this.emit('end')
    }))
    .pipe(gulpif(args.production, cleanCSS()))
    .pipe(gulpif(args.sourcemaps, sourcemaps.write()))
    .pipe(gulp.dest(`dist/${args.vendor}/styles`))
    .pipe(gulpif(args.watch, livereload()));
});

gulp.task('pages:sass', function () {
  return gulp.src('app/pages/**/*.scss')
    .pipe(gulpif(args.sourcemaps, sourcemaps.init()))
    .pipe(sass({includePaths: ['./app']}).on('error', function (error) {
      gutil.log(gutil.colors.red('Error (' + error.plugin + '): ' + error.message));
      this.emit('end')
    }))
    .pipe(gulpif(args.production, cleanCSS()))
    .pipe(gulpif(args.sourcemaps, sourcemaps.write()))
    .pipe(gulp.dest(`dist/${args.vendor}/styles`))
    .pipe(gulpif(args.watch, livereload()));
});

gulp.task('pages:js', (cb) => {
  return gulp.src('app/pages/**/*.js')
    .pipe(plumber({
      // Webpack will log the errors
      errorHandler() {
      }
    }))
    .pipe(named())
    .pipe(gulpWebpack({
      devtool: args.sourcemaps ? 'inline-source-map' : false, watch: args.watch, plugins: [new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(ENV), 'process.env.VENDOR': JSON.stringify(args.vendor)
      })].concat(args.production ? [new webpack.optimize.UglifyJsPlugin()] : []), module: {
        rules: [{
          test: /\.js$/, loader: 'babel-loader'
        }]
      }
    }, webpack, (err, stats) => {
      if (err) return;
      log(`Finished '${colors.cyan('scripts')}'`, stats.toString({
        chunks: false, colors: true, cached: false, children: false
      }))
    }))
    .pipe(gulp.dest(`dist/${args.vendor}/scripts`))
    .pipe(gulpif(args.watch, livereload()));
});

gulp.task('pages', ['pages:html', 'pages:css', 'pages:less', 'pages:sass', 'pages:js']);