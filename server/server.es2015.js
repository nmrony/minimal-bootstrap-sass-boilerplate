import connect from 'connect'
import serveStatic from 'serve-static'
import path from 'path'
import configObj from '../gulp.config'

const config = configObj()
const port = process.env.PORT || config.defaultPort

// declaring app
const app = connect()

// define static file path
app.use(serveStatic(path.join(__dirname, '../.tmp')))
app.use(serveStatic(path.join(__dirname, '../')))

app.listen(port, function () {
  console.log('Server is running on http://localhost:' + port)
})
