'use strict'
const player = require('../service/player')
const timeline = require('../service/timeline')
const power = require('../service/power')

module.exports = {
  gameNotOver (connection) {
    const { getGame } = player(connection)
    return async function checkIfGameOver (req, res, next) {
      const userId = String(req.user.id)
      const game = await getGame(userId)
      if (game.winnerId) {
        res.statusCode = 403
        next(`Game ${game.id} is over!`)
      } else {
        next()
      }
    }
  },
  isNotOverIterationCap (connection) {
    const { getPlayerTimelines } = timeline(connection)
    const { maxIterations } = require('../config')
    return async function checkPlayerIterationsCap (req, res, next) {
      const userId = String(req.user.id)
      const playerTimelines = await getPlayerTimelines(userId, connection)
      if (playerTimelines.length >= maxIterations) {
        res.statusCode = 403
        next('You cannot join more timelines')
      } else {
        next()
      }
    }
  },
  hasEnoughActions (connection) {
    const { getPlayerActions } = player(connection)
    return async function checkIfUserHasEnoughActions (req, res, next) {
      const userId = String(req.user.id)
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
      const userId = String(req.user.id)
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
  powerExists (connection) {
    const { getPower } = power(connection)
    return async function checkIfUserExists (req, res, next) {
      const { targetPlayerId, timelineName } = req.params
      const power = await getPower(targetPlayerId, timelineName)
      if (!power) {
        res.statusCode = 403
        next('No such power')
      } else {
        next()
      }
    }
  },
  targetPlayerExists (connection) {
    const { getPlayer } = player(connection)
    return async function checkIfUserExists (req, res, next) {
      const targetPlayerId = req.params.targetPlayerId
      const player = await getPlayer(targetPlayerId, connection)
      if (!player) {
        res.statusCode = 403
        next('No such player')
      } else {
        next()
      }
    }
  },
  userInTimeline (connection) {
    const { getTimeline } = timeline(connection)
    return async function checkIfUserExists (req, res, next) {
      const userId = String(req.user.id)
      const timelineName = req.params.timelineName
      const timeline = await getTimeline(timelineName)
      if (timeline.players.includes(userId)) {
        next()
      } else {
        res.statusCode = 403
        next('You are not in this timeline')
      }
    }
  },
  targetPlayerInTimeline (connection) {
    const { getTimeline } = timeline(connection)
    return async function checkIfUserExists (req, res, next) {
      const targetPlayerId = req.params.targetPlayerId
      const timelineName = req.params.timelineName
      const timeline = await getTimeline(timelineName)
      if (timeline.players.includes(targetPlayerId)) {
        next()
      } else {
        res.statusCode = 403
        next('Player is not in timeline')
      }
    }
  },
  userHasNoPowerInTimeline (connection) {
    const { getPower } = power(connection)
    return async function checkIfUserIsNotBusy (req, res, next) {
      const userId = String(req.user.id)
      const timelineName = req.params.timelineName
      const power = await getPower(userId, timelineName)
      if (!power) {
        next()
      } else {
        res.statusCode = 403
        next('You are busy in this timeline')
      }
    }
  },
  userNotInTimeline (connection) {
    const { getTimeline } = timeline(connection)
    return async function checkIfUserExists (req, res, next) {
      const userId = String(req.user.id)
      const timelineName = req.params.timelineName
      const timeline = await getTimeline(timelineName)
      if (timeline.players.includes(userId)) {
        res.statusCode = 403
        next('You are already in this timeline')
      } else {
        next()
      }
    }
  },
  async validateAndSanitizeUserId (req, res, next) {
    req.sanitizeHeaders('userId').toString()
    req.checkHeaders('userId').notEmpty()
    const result = await req.getValidationResult()
    result.useFirstErrorOnly()
    if (!result.isEmpty()) {
      res.statusCode = 400
      next(result.array()[0])
    } else {
      next()
    }
  },
  async validateAndSanitizeUserName (req, res, next) {
    req.sanitizeHeaders('name').toString()
    req.checkHeaders('name').notEmpty()
    const result = await req.getValidationResult()
    result.useFirstErrorOnly()
    if (!result.isEmpty()) {
      res.statusCode = 400
      next(result.array()[0])
    } else {
      next()
    }
  },
  async validateAndSanitizeUserPic (req, res, next) {
    req.sanitizeHeaders('userpic').toString()
    req.checkHeaders('userpic').notEmpty()
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
      const userId = String(req.user.id)
      const player = await getPlayer(userId, connection)
      const hasItem = player.items.map(i => i.name).includes(itemName)
      if (!hasItem) {
        res.statusCode = 403
        next(`You do not have the ${itemName} item`)
      } else {
        next()
      }
    }
  },
  hasRoomForItem (connection) {
    const { getPlayer } = player(connection)
    return async function checkIfUserHasRoom (req, res, next) {
      const userId = String(req.user.id)
      const player = await getPlayer(userId, connection)
      if (player.items.length >= 8) {
        res.statusCode = 403
        next(`No more room for items!`)
      } else {
        next()
      }
    }
  },
  userHasItemsInArgs (connection) {
    const { getPlayer } = player(connection)
    return async function checkIfUserHasItems (req, res, next) {
      const userId = String(req.user.id)
      const { item1, item2 } = req.params
      const player = await getPlayer(userId, connection)
      const itemNames = player.items.map(i => i.name)
      if (itemNames.includes(item1) && itemNames.includes(item2)) {
        next()
      } else {
        res.statusCode = 403
        next(`You do not have both items`)
      }
    }
  },
  properItemsInArgs () {
    return async function checkIfUserHasItems (req, res, next) {
      const { item1, item2 } = req.params
      if (
        (item1 === 'assist' && item2 === 'prevent') ||
        (item1 === 'steal' && item2 === 'reset') ||
        (item1 === 'lock' && item2 === 'unlock')
      ) {
        next()
      } else {
        res.statusCode = 403
        next(`Cannot combine ${item1} and ${item2}`)
      }
    }
  },
  targetPlayerHasItem (connection) {
    const { getPlayer } = player(connection)
    return async function checkIfUserHasItem (req, res, next) {
      const { itemName, targetPlayerId } = req.params
      const player = await getPlayer(targetPlayerId, connection)
      const hasItem = player.items.map(i => i.name).includes(itemName)
      if (!hasItem) {
        res.statusCode = 403
        next(`Target player does not have the ${itemName} item`)
      } else {
        next()
      }
    }
  },
  timelineIsUnlocked (connection) {
    const { getTimeline } = timeline(connection)
    return async function checkIfTimelineIsUnlocked (req, res, next) {
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
    return async function checkIfTimelineIsLocked (req, res, next) {
      const timelineName = req.params.timelineName
      const timeline = await getTimeline(timelineName)
      if (timeline.isLocked) {
        next()
      } else {
        res.statusCode = 403
        next('Timeline is unlocked')
      }
    }
  },
  targetPlayerIsNotUser (connection) {
    return async function checkIfUserExists (req, res, next) {
      const targetPlayerId = req.params.targetPlayerId
      const userId = String(req.user.id)
      if (targetPlayerId === userId) {
        res.statusCode = 403
        next('Cannot use this power on self')
      } else {
        next()
      }
    }
  }
}
