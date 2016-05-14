export default function configurations () {
  const srcPath = './src/'
  const buildPath = './build/'

  return {
    buildPath,
    images: srcPath + 'images/**/*',
    sass: srcPath + 'sass/main.scss',
    allJS: [
      './src/**/*.js',
      '!node_modules/**'
    ]
  }
}
