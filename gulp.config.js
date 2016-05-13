export default function configurations () {
  var srcDirectory = './src/'

  var config = {
    sass: srcDirectory + 'sass/main.scss',
    allJS: [
      './src/**/*.js',
      '!node_modules/**'
    ]
  }

  return config
}
