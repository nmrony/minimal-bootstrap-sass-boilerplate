import gulp from 'gulp'
import yargs from 'yargs'
import lazyGulp from 'gulp-load-plugins'
import gulpConfig from './gulp.config'

const args = yargs.argv
const $ = lazyGulp({lazy: true})
const config = gulpConfig();

// Helper function
const log = (msg) => {
  if (typeof msg === 'object') {
    for (const item in msg) {
      if (msg.hasOwnProperty(item)) {
        $.util.log($.util.colors.blue(item))
      }
    }
  } else {
    $.util.log($.util.colors.blue(msg))
  }
}

// lint code
const lintCode = () => {
  log('Analyzing code for error and styles...')
  return gulp.src(config.allJS)
    .pipe($.if(args.showLog, $.print()))
    .pipe($.eslint({extends: 'standard'}))
    .pipe($.eslint.format())
    .pipe($.eslint.failAfterError())
}

const convertSass = () => {
  log('Compiling SaSS --> CSS')
  return gulp.src(config.sass)
  .pipe($.sourcemaps.init())
  .pipe($.sass().on('error', $.sass.logError))
  .pipe($.autoprefixer({browsers: ['last 2 versions', 'ie >= 9']}))
  .pipe($.sourcemaps.write('./maps'))
  .pipe(gulp.dest('./build/css/'))
}

gulp.task('lint', lintCode)
gulp.task('styles', convertSass)

gulp.task('default', ['lint', 'styles'])
