import gulp from 'gulp'
import yargs from 'yargs'
import lazyGulp from 'gulp-load-plugins'

const args = yargs.argv
const $ = lazyGulp({lazy: true})

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
  return gulp.src(['src/**/*.js', '!node_modules/**'])
    .pipe($.if(args.showLog, $.print()))
    .pipe($.eslint({extends: 'standard'}))
    .pipe($.eslint.format())
    .pipe($.eslint.failAfterError())
}

gulp.task('lint', lintCode)

gulp.task('default', ['lint'])
