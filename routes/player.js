'use strict'
const express = require('express')
const passport = require('passport')
const player = require('../service/player')

module.exports = function playerRoute (connection) {
  const route = express.Router()
  const {
    createOrUpdatePlayer
  } = player(connection)
  route.use(passport.authenticate('facebook-token', {session: false}))
  route.post(
    '/update',
    async (req, res, next) => {
      try {
        const userId = String(req.user.id)
        const userPic = req.user.photos[0].value
        const userName = req.user.displayName
        await createOrUpdatePlayer(userId, userPic, userName)
        res.sendStatus(200)
      } catch (e) {
        next(e)
      }
    }
  )
  return route
}
