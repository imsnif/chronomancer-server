'use strict'
const express = require('express')
const bodyParser = require('body-parser')
const expressValidator = require('express-validator')
const path = require('path')

const passport = require('passport')
const FacebookTokenStrategy = require('passport-facebook-token')

function errorHandler (err, req, res, next) {
  res.send(res.statusCode || 500).json({error: err.msg})
}

passport.use(new FacebookTokenStrategy({
  clientID: process.env.FBID,
  clientSecret: process.env.FBSECRET
}, function (accessToken, refreshToken, profile, done) {
  profile.accessToken = accessToken
  done(null, profile)
}))

const app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(passport.initialize())
app.use(expressValidator())
app.use(errorHandler)

module.exports = function (connection) {
  connection.use('chronomancer')
  const timeline = require('./routes/timeline')(connection)
  const bidding = require('./routes/bidding')(connection)
  const player = require('./routes/player')(connection)
  app.use('/timeline', timeline)
  app.use('/bidding', bidding)
  app.use('/player', player)
  app.use(express.static(path.join(__dirname, 'public')))
  return app
}
