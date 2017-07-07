'use strict'
const player = require('../service/player')
const timeline = require('../service/timeline')

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
  timelineExists (connection) {
    const { getTimeline } = timeline(connection)
    return async function checkIfUserExists (req, res, next) {
      const timelineName = req.params.timelineName
      const timeline = await getTimeline(timelineName)
      if (!timeline) {
        res.statusCode = 403
        next('No such timeline')
      } else {
        next()
      }
    }
  },
  userInTimeline (connection) {
    const { getTimeline } = timeline(connection)
    return async function checkIfUserExists (req, res, next) {
      const userId = req.headers.userid
      const timelineName = req.params.timelineName
      const timeline = await getTimeline(timelineName)
      if (timeline.players.includes(userId)) {
        next()
      } else {
        res.statusCode = 403
        next('User not in timeline')
      }
    }
  },
  userNotInTimeline (connection) {
    const { getTimeline } = timeline(connection)
    return async function checkIfUserExists (req, res, next) {
      const userId = req.headers.userid
      const timelineName = req.params.timelineName
      const timeline = await getTimeline(timelineName)
      if (timeline.players.includes(userId)) {
        res.statusCode = 403
        next('User already in timeline')
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
  },
  userHasItem (itemName, connection) {
    const { getPlayer } = player(connection)
    return async function checkIfUserHasItem (req, res, next) {
      const userId = req.headers.userid
      const player = await getPlayer(userId, connection)
      const hasItem = player.items.map(i => i.name).includes(itemName)
      if (!hasItem) {
        res.statusCode = 403
        next(`User does not have the ${itemName} item`)
      } else {
        next()
      }
    }
  },
  timelineIsUnlocked (connection) {
    const { getTimeline } = timeline(connection)
    return async function checkIfUserExists (req, res, next) {
      const timelineName = req.params.timelineName
      const timeline = await getTimeline(timelineName)
      if (timeline.isLocked) {
        res.statusCode = 403
        next('Timeline is locked')
      } else {
        next()
      }
    }
  },
  timelineIsLocked (connection) {
    const { getTimeline } = timeline(connection)
    return async function checkIfUserExists (req, res, next) {
      const timelineName = req.params.timelineName
      const timeline = await getTimeline(timelineName)
      if (timeline.isLocked) {
        next()
      } else {
        res.statusCode = 403
        next('Timeline is unlocked')
      }
    }
  }
}
