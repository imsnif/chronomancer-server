'use strict'

module.exports = function (connection) {
  const { lockTimeline } = require('../service/timeline')(connection)
  const { getPlayer } = require('../service/player')(connection)
  return {
    locking: async job => {
      if (!job || !job.timelineName) return Promise.resolve()
      const player = await getPlayer(job.playerId)
      if (player.items.map(i => i.name).includes('lock')) {
        return lockTimeline(job.timelineName)
      } else {
        return Promise.resolve()
      }
    }
  }
}
