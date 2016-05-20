import gulp from 'gulp'
import yargs from 'yargs'
import del from 'del'
import modRewrite from 'connect-modrewrite'
import lazyGulp from 'gulp-load-plugins'
import gulpConfig from './gulp.config'

const args = yargs.argv
const $ = lazyGulp({lazy: true})
const config = gulpConfig()
var port = process.env.PORT || config.defaultPort

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
const cleanStyles = () => {
  log('Cleaning CSS files...')
  const allStyles = config.temp + '**/*.css'
  clean(allStyles)
}

const compileStyles = () => {
  log('Compiling SaSS --> CSS')
  return gulp.src(config.sass)
    // .pipe($.sourcemaps.init())
    .pipe($.plumber())
    .pipe($.sass())
    .pipe($.autoprefixer({browsers: ['last 2 versions', 'ie >= 9', '> 5%']}))
    // .pipe($.sourcemaps.write('./maps'))
    .pipe(gulp.dest(config.temp))
}

const watchSaasFiles = () => {
  gulp.watch([config.sass], ['styles'])
}

const wireupFiles = () => {
  log('Wireup vendor files and js files into html files')

  const target = gulp.src(config.htmls)
  const vendors = gulp.src(config.vendorFiles, {read: false})
  const appJS = gulp.src(config.appJS, {read: false})

  return target
    .pipe($.inject(vendors, {name: 'vendor'}))
    .pipe($.inject(appJS))
    .pipe(gulp.dest(config.devPath))
}

const inject = () => {
  log('Wireup css into html files')

  const target = gulp.src(config.devPath + '*.html')
  const appCSS = gulp.src(config.appCSS, {read: false})

  return target
    .pipe($.inject(appCSS))
    .pipe(gulp.dest(config.devPath))
}

const serveDev = () => {
  const isDev = true

  const nodeOptions = {
    script: config.nodeServer,
    delayTime: 1,
    env: {
      PORT: port,
      NODE_ENV: isDev ? 'dev' : 'production'
    },
    watch: [config.server]
  }
  return $.nodemon(nodeOptions)
}
// tasks
gulp.task('clean-styles', cleanStyles)
gulp.task('styles', ['clean-styles'], compileStyles)
gulp.task('sass-watcher', watchSaasFiles)
gulp.task('lint', lintCode)

gulp.task('wireup', wireupFiles)
gulp.task('inject', ['wireup', 'styles'], inject)

gulp.task('serve-dev', ['inject'], serveDev)
