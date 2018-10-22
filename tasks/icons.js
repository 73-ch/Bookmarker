import gulp from 'gulp'
import gulpif from 'gulp-if'
import imagemin from 'gulp-imagemin'
import livereload from 'gulp-livereload'
import args from './lib/args'

gulp.task('icons', () => {
  return gulp.src('app/icons/**/*')
    .pipe(gulpif(args.production, imagemin()))
    .pipe(gulp.dest(`dist/${args.vendor}/icons`))
    .pipe(gulpif(args.watch, livereload()))
});
