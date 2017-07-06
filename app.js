'use strict'
const express = require('express')
const bodyParser = require('body-parser')

const app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

module.exports = function (connection) {
  connection.use('chronomancer')
  const timeline = require('./routes/timeline')(connection)
  app.use('/timeline', timeline)
  return app
}
