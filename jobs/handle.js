'use strict'

module.exports = function (connection) {
  const { lockTimeline } = require('../service/timeline')(connection)
  const { getPlayer } = require('../service/player')(connection)
  return {
    locking: async power => {
      if (!power || !power.timelineName) return Promise.resolve()
      const player = await getPlayer(power.playerId)
      if (player.items.map(i => i.name).includes('lock')) {
        return lockTimeline(power.timelineName)
      } else {
        return Promise.resolve()
      }
    }
  }
}
