import gulp from 'gulp'
import eslint from 'gulp-eslint'
import util from 'gulp-util'
import print from 'gulp-print'
import gulpif from 'gulp-if'
import yargs from 'yargs'

const args = yargs.argv
// Helper function
const log = (msg) => {
  if (typeof msg === 'object') {
    for (const item in msg) {
      if (msg.hasOwnProperty(item)) {
        util.log(util.colors.blue(item))
      }
    }
  } else {
    util.log(util.colors.blue(msg))
  }
}

// lint code
const lintCode = () => {
  log('Analyzing code...')
  return gulp.src(['src/**/*.js', '!node_modules/**'])
    .pipe(gulpif(args.showLog, print()))
    .pipe(eslint({extends: 'standard'}))
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
}

gulp.task('lint', lintCode)

gulp.task('default', ['lint'])
