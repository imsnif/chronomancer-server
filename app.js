'use strict'
const express = require('express')
const bodyParser = require('body-parser')

const app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(errorHandler)

function errorHandler (err, req, res, next) {
  res.send(res.statusCode || 500).json({error: err.msg})
}

module.exports = function (connection) {
  connection.use('chronomancer')
  const timeline = require('./routes/timeline')(connection)
  app.use('/timeline', timeline)
  return app
}
