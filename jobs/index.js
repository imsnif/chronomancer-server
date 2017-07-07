'use strict'

module.exports = function (connection) {
  connection.use('chronomancer')
  const handlePower = require('./handle')(connection)
  const { deletePower, powerHasSufficientScore, getPowersToResolve } = require('../service/power')(connection)
  const { checkPlayerInTimeline } = require('../service/timeline')(connection)
  return async function resolvePowers () {
    return new Promise(async (resolve, reject) => {
      const powers = await getPowersToResolve()
      await Promise.all(
        powers.map(async p => {
          if (!p.name || typeof p.name !== 'string') return
          const powerName = p.name.toLowerCase()
          if (!handlePower[powerName]) return
          const powerScorePositive = powerHasSufficientScore(p)
          const playerStillInTimeline = await checkPlayerInTimeline(p.timelineName, p.playerId)
          if (powerScorePositive && playerStillInTimeline) {
            await handlePower[powerName](p)
          }
          await deletePower(p)
        })
      )
      resolve()
    })
  }
}
