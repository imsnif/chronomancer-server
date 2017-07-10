'use strict'
const express = require('express')
const bodyParser = require('body-parser')
const expressValidator = require('express-validator')

function errorHandler (err, req, res, next) {
  res.send(res.statusCode || 500).json({error: err.msg})
}

const app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(expressValidator())
app.use(errorHandler)

module.exports = function (connection) {
  connection.use('chronomancer')
  const timeline = require('./routes/timeline')(connection)
  const bidding = require('./routes/bidding')(connection)
  app.use('/timeline', timeline)
  app.use('/bidding', bidding)
  return app
}
