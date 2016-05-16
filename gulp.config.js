export default function configurations () {
  const srcPath = './src/'
  const buildPath = './build/'
  const fontsPath = srcPath + 'fonts/**/*'
  const port = 8080
  return {
    buildPath,
    port,
    fontsPath,
    htmls: srcPath + '/**/*.html',
    images: srcPath + 'images/**/*',
    sass: [
      srcPath + 'sass/**/*.scss'
    ],
    allJS: [
      './src/**/*.js',
      './*.js',
      '!node_modules/**'
    ]
  }
}
