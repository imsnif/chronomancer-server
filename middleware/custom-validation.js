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
  }
}
