'use strict'
const player = require('../service/player')

module.exports = {
  hasEnoughActions (connection) {
    const { getPlayerActions } = player(connection)
    return async function checkIfUserHasEnoughActions (req, res, next) {
      const userId = req.headers.userid
      const actionsLeft = await getPlayerActions(userId, connection)
      if (actionsLeft < 1) {
        res.statusCode = 403
        next('Not enough actions left')
      } else {
        next()
      }
    }
  },
  userExists (connection) {
    const { getPlayer } = player(connection)
    return async function checkIfUserExists (req, res, next) {
      const userId = req.headers.userid
      const player = await getPlayer(userId, connection)
      if (!player) {
        res.statusCode = 403
        next('No such user')
      } else {
        next()
      }
    }
  },
  async validateAndSanitizeUserId (req, res, next) {
    req.sanitizeHeaders('userId').toInt()
    req.checkHeaders('userId').notEmpty().isInt()
    const result = await req.getValidationResult()
    result.useFirstErrorOnly()
    if (!result.isEmpty()) {
      res.statusCode = 400
      next(result.array()[0])
    } else {
      next()
    }
  }
}
