export default function configurations () {
  const srcPath = './src/'
  const devPath = './serve-dev/'
  const buildPath = './build/'
  const vendorPath = srcPath + 'vendors/'
  const fontsPath = srcPath + 'fonts/**/*'
  const temp = './.tmp/'

  return {
    srcPath,
    buildPath,
    devPath,
    fontsPath,
    vendorPath,
    temp,
    htmls: srcPath + '*.html',
    images: srcPath + 'images/**/*',
    sass: srcPath + 'sass/main.scss',
    appJS: srcPath + 'js/**/*.js',
    appCSS: temp + 'main.css',
    vendorFiles: [
      vendorPath + '**/*.js',
      vendorPath + '**/*.css'
    ],
    // all js that we want to check
    allJS: [
      './src/**/*.js',
      './*.js',
      '!./src/vendors/**',
      '!node_modules/**'
    ],

    /**
    Node Settings
    */
    defaultPort: 8000,
    server: './server',
    nodeServer: './server/server.js'
  }
}
