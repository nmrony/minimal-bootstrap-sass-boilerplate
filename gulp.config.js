export default function configurations () {
  const srcPath = './src/'
  const buildPath = './build/'
  const port = 8080
  return {
    buildPath,
    port,
    htmls: srcPath + '/*.html',
    images: srcPath + 'images/**/*',
    sass: srcPath + 'sass/main.scss',
    allJS: [
      './src/**/*.js',
      '!node_modules/**'
    ]
  }
}
