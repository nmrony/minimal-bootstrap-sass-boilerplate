import gulp from 'gulp'
import yargs from 'yargs'
import del from 'del'
import browserSync from 'browser-sync'
import lazyGulp from 'gulp-load-plugins'
import gulpConfig from './gulp.config'

const args = yargs.argv
const $ = lazyGulp({lazy: true})
const config = gulpConfig()
var port = process.env.PORT || config.defaultPort

// Helper functions
const changeEvent = (event) => {
  const srcPattern = new RegExp('/.*(?=/' + config.srcPath + ')/')
  log('File ' + event.path.replace(srcPattern, '') + ' ' + event.type)
}
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

const startBrowserSync = () => {
  if (browserSync.active || args.noSync) {
    return
  }

  log('Starting browser-sync on port ' + port)

  gulp.watch([config.sass], ['styles'])
    .on('change', changeEvent)

  const options = {
    proxy: 'localhost:' + port,
    port: 3000,
    files: [
      config.srcPath + '**/*.*',
      '!' + config.sass,
      '!' + config.vendorFiles,
      config.temp + '**/*.css'
    ],
    ghostMode: {
      clicks: true,
      location: false,
      forms: true,
      scroll: true
    },
    injectChanges: true,
    logFileChanges: true,
    logLevel: 'debug',
    logPrefix: 'gulp-patterns',
    notify: true,
    reloadDelay: 1000
  }

  browserSync(options)
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

// clean
const cleanProject = () => {
  const delconfig = [].concat(config.buildPath, config.temp + '**/*.css')
  log('Cleaning ' + $.util.colors.blue(delconfig))
  clean(delconfig)
}

const cleanCode = () => {
  const files = [].concat(
    config.buildPath + 'js/**/*.js',
    config.temp + '**/*.js',
    config.temp + '**/*.html'
  )
  log('Cleaning ' + $.util.colors.blue(files))
  clean(files)
}
// fonts
const copyFonts = () => {
  log('Copying fonts...')
  return gulp
    .src(config.fonts)
    .pipe(gulp.dest(config.buildPath + 'fonts'))
}

const cleanFonts = () => {
  log('Cleaning Fonts files...')
  const allFonts = config.buildPath + 'fonts/**/*.*'
  clean(allFonts)
}

// images
const copyImages = () => {
  log('Copying images...')
  return gulp
    .src(config.images)
    .pipe($.imagemin({optimizationLevel: 5}))
    .pipe(gulp.dest(config.buildPath + 'images'))
}

const cleanImages = () => {
  log('Cleaning Images files...')
  const allImages = config.buildPath + 'images/**/*.*'
  clean(allImages)
}

const wireupFiles = () => {
  log('Wireup vendor files and js files into html files')

  const target = gulp.src(config.htmls)
  const vendors = gulp.src(config.vendorFiles, {read: false})
  const appJS = gulp.src(config.appJS, {read: false})

  return target
    .pipe($.inject(vendors, {name: 'vendor'}))
    .pipe($.inject(appJS))
    .pipe(gulp.dest(config.temp))
}

const inject = () => {
  log('Wireup css into html files')

  const target = gulp.src(config.temp + '*.html')
  const appCSS = gulp.src(config.appCSS, {read: false})

  return target
    .pipe($.inject(appCSS))
    .pipe(gulp.dest(config.temp))
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
    .on('start', () => {
      log('*** node server started ***')
      startBrowserSync()
    })
    .on('restart', ['lint'], (files) => {
      log('*** node server restarted ***\r\nfiles changes on restart \r\n' + files)
      setTimeout(() => {
        browserSync.notify('reloading on server change')
        browserSync.reload({stream: false})
      }, config.browserReloadDelay)
    })
    .on('crash', () => log('*** node server crashed ***'))
    .on('exit', () => log('*** node server exited gracefully ***'))
}

const optimize = () => {
  log('Optimizing the javascripts, css and htmls...')
  const assets = $.useref({searchPath: './'})
  return gulp
    .src(config.temp + '*.html')
    .pipe($.plumber())
    .pipe(assets)
    .pipe(gulp.dest(config.buildPath))
}
// tasks
gulp.task('help', $.taskListing)
gulp.task('default', ['help'])

gulp.task('clean-styles', cleanStyles)
gulp.task('styles', ['clean-styles'], compileStyles)
gulp.task('sass-watcher', watchSaasFiles)

gulp.task('lint', lintCode)

gulp.task('fonts', ['clean-fonts'], copyFonts)
gulp.task('clean-fonts', cleanFonts)

gulp.task('images', ['clean-images'], copyImages)
gulp.task('clean-images', cleanImages)

gulp.task('clean', cleanProject)
gulp.task('clean-code', cleanCode)

gulp.task('wireup', wireupFiles)
gulp.task('inject', ['wireup', 'styles'], inject)

gulp.task('serve-dev', ['inject'], serveDev)
gulp.task('optimize', ['inject'], optimize)
