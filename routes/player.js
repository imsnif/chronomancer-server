'use strict'
const express = require('express')
const player = require('../service/player')
const {
  validateAndSanitizeUserId,
  validateAndSanitizeUserName,
  validateAndSanitizeUserPic
} = require('../middleware/custom-validation')

module.exports = function playerRoute (connection) {
  const route = express.Router()
  const {
    createOrUpdatePlayer
  } = player(connection)
  route.use(validateAndSanitizeUserId)
  route.use(validateAndSanitizeUserName)
  route.use(validateAndSanitizeUserPic)
  route.post(
    '/update',
    async (req, res, next) => {
      try {
        const userId = String(req.headers.userid)
        const userPic = req.headers.userpic
        const userName = req.headers.name
        await createOrUpdatePlayer(userId, userPic, userName)
        res.sendStatus(200)
      } catch (e) {
        next(e)
      }
    }
  )
  return route
}
