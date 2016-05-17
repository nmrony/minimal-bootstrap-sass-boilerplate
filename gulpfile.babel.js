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
    .pipe($.newer(config.buildPath + 'js/'))
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
    port: config.port,
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

const copyHTMLs = () => {
  return gulp.src(config.htmls)
    .pipe($.newer(config.buildPath))
    .pipe(gulp.dest(config.buildPath))
    .pipe($.connect.reload())
}

const copyFonts = () => {
  return gulp.src(config.fontsPath)
    .pipe($.newer(config.buildPath + 'fonts'))
    .pipe(gulp.dest(config.buildPath + 'fonts'))
    .pipe($.connect.reload())
}

gulp.task('clean-styles', cleanStyles)
gulp.task('styles', ['fonts', 'clean-styles'], convertSass)

gulp.task('lint', lintCode)

gulp.task('clean-images', cleanImages)
gulp.task('images', ['clean-images'], optimizeImages)

gulp.task('clean-js', cleanJS)
gulp.task('js', ['clean-js', 'lint'], prepareJS)

gulp.task('html', copyHTMLs)
gulp.task('fonts', copyFonts)

gulp.task('help', $.taskListing)
gulp.task('default', ['help'])
gulp.task('serve-dev', ['connect'], () => {
  log('Watching JS, SCSS, Images, HTML and fonts files...')
  gulp.watch([config.sass], ['styles'])
  gulp.watch([config.allJS], ['js'])
  gulp.watch([config.images], ['images'])
  gulp.watch([config.htmls], ['html'])
  gulp.watch([config.fontsPath], ['fonts'])
})

gulp.task('connect', ['styles', 'fonts', 'js', 'images', 'html'], crankUpTheServer)
