const express = require('express')
const compression = require('compression')
const app = express()

app.use(compression())
app.use(express.static('./dist'))

app.listen(8282, () => {
  console.log('Server is running at http://127.0.0.1:8282/')
})