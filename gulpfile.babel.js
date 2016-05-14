import gulp from 'gulp'
import yargs from 'yargs'
import del from 'del'
import modRewrite from 'connect-modrewrite'
import lazyGulp from 'gulp-load-plugins'
import gulpConfig from './gulp.config'

const args = yargs.argv
const $ = lazyGulp({lazy: true})
const config = gulpConfig()

// Helper functions
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

const clean = (path, done) => del(path, done)

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
const cleanStyles = (done) => {
  log('Cleaning CSS files...')
  const allStyles = config.buildPath + 'css/**'
  return clean(allStyles, done)
}

const cleanJS = (done) => {
  log('Cleaning JS files...')
  return clean(config.buildPath + 'js/**/*.js', done)
}

const cleanImages = (done) => {
  log('Cleaning Images files...')
  return clean(config.buildPath + 'images/**/*.{jpeg,jpg,png,gif}', done)
}

const prepareJS = () => {
  log('Prepareing JS files...')
  return gulp.src(config.allJS)
    .pipe($.concat('main.js'))
    .pipe($.if(args.production, $.uglify()))
    .pipe(gulp.dest(config.buildPath + 'js/'))
    .pipe($.connect.reload())
}

const convertSass = () => {
  log('Compiling SaSS --> CSS')
  return gulp.src(config.sass)
    .pipe($.sourcemaps.init())
    .pipe($.plumber())
    .pipe($.sass())
    .pipe($.autoprefixer({browsers: ['last 2 versions', 'ie >= 9']}))
    .pipe($.sourcemaps.write('./maps'))
    .pipe($.if(args.production, $.cssmin()))
    .pipe(gulp.dest(config.buildPath + 'css/'))
    .pipe($.connect.reload())
}

const optimizeImages = () => {
  return gulp.src(config.images)
    .pipe($.imagemin({
      optimizationLevel: 3,
      progressive: true,
      interlaced: true
    }))
    .pipe(gulp.dest(config.buildPath + 'images'))
}

const crankUpTheServer = () => {
  $.connect.server({
    root: [config.buildPath],
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
gulp.task('styles', ['clean-styles'], convertSass)

gulp.task('lint', lintCode)

gulp.task('clean-images', cleanImages)
gulp.task('optimize-img', ['clean-images'], optimizeImages)

gulp.task('clean-js', cleanJS)
gulp.task('js', ['clean-js'], prepareJS)

gulp.task('default', ['styles', 'js', 'optimize-img'])

gulp.task('watch', () => {
  gulp.watch([config.sass], ['styles'])
  gulp.watch([config.allJS], ['js'])
  gulp.watch([config.images], ['optimize-img'])
})

gulp.task('connect', crankUpTheServer)
