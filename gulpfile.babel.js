import gulp from 'gulp'
import yargs from 'yargs'
import del from 'del'
import modRewrite from 'connect-modrewrite'
import lazyGulp from 'gulp-load-plugins'
import gulpConfig from './gulp.config'

const args = yargs.argv
const $ = lazyGulp({lazy: true})
const config = gulpConfig()

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

const clean = (path) => del(path)

// lint code
const lintCode = () => {
  log('Analyzing code for error and styles...')
  return gulp.src(config.allJS)
    .pipe($.if(args.showLog, $.print()))
    .pipe($.eslint({extends: 'standard'}))
    .pipe($.eslint.format())
    .pipe($.eslint.failAfterError())
}

// Styles
const cleanStyles = () => {
  log('Cleaning CSS files...')
  const allStyles = './build/css/**'
  clean(allStyles)
}

const cleanJS = () => {
  log('Cleaning JS files...')
  clean(config.allJS)
}

const prepareJS = () => {
  cleanJS()
  log('Prepareing JS files...')
  return gulp.src(config.allJS)
    .pipe($.concat('main.js'))
    .pipe($.if(args.production, $.uglify()))
    .pipe(gulp.dest('./build/js/'))
    .pipe($.connect.reload())
}
const convertSass = () => {
  cleanStyles()
  log('Compiling SaSS --> CSS')
  return gulp.src(config.sass)
    .pipe($.sourcemaps.init())
    .pipe($.plumber())
    .pipe($.sass())
    .pipe($.autoprefixer({browsers: ['last 2 versions', 'ie >= 9']}))
    .pipe($.sourcemaps.write('./maps'))
    .pipe($.if(args.production, $.cssmin()))
    .pipe(gulp.dest('./build/css/'))
    .pipe($.connect.reload())
}

const optimizeImages = () => {
  return gulp.src('src/img/**/*')
    .pipe($.imagemin({
      optimizationLevel: 3,
      progressive: true,
      interlaced: true
    }))
    .pipe(gulp.dest('./build/img'))
}
const crankUpTheServer = () => {
  $.connect.server({
    root: ['./build/'],
    livereload: true,
    middleware: () => {
      return [
        modRewrite([
          '^/$ /index.html',
          '^([^\\.]+)$ $1.html'
        ])
      ]
    }
  })
}

gulp.task('clean-styles', cleanStyles)
gulp.task('styles', convertSass)

gulp.task('lint', lintCode)
gulp.task('optimize-img', optimizeImages)
gulp.task('default', ['lint', 'styles'])
gulp.task('js', prepareJS)

gulp.task('watch', () => {
  gulp.watch([config.sass], ['styless'])
  gulp.watch([config.allJS], ['lint', 'js'])
  gulp.watch('src/img/**/*.{jpg,png,gif}', ['imagemin'])
})

gulp.task('connect', crankUpTheServer)
