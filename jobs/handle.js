'use strict'

module.exports = function (connection) {
  const {
    lockTimeline,
    unlockTimeline,
    getTimeline,
    removeOtherPlayersFromTimeline,
    removePlayersItemsFromTimeline
  } = require('../service/timeline')(connection)
  const {
    getPlayer,
    appendItemToPlayer,
    removeItemFromPlayer
  } = require('../service/player')(connection)
  return {
    locking: async power => {
      if (!power || !power.timelineName) return Promise.resolve()
      const player = await getPlayer(power.playerId)
      if (player.items.map(i => i.name).includes('lock')) {
        return lockTimeline(power.timelineName)
      } else {
        return Promise.resolve()
      }
    },
    unlocking: async power => {
      if (!power || !power.timelineName) return Promise.resolve()
      const player = await getPlayer(power.playerId)
      if (player.items.map(i => i.name).includes('unlock')) {
        return unlockTimeline(power.timelineName)
      } else {
        return Promise.resolve()
      }
    },
    resetting: async power => {
      if (!power || !power.timelineName) return Promise.resolve()
      const player = await getPlayer(power.playerId)
      if (player.items.map(i => i.name).includes('reset')) {
        const timeline = await getTimeline(power.timelineName)
        const affectedPlayers = timeline.players.filter(pId => pId !== player.id)
        await removePlayersItemsFromTimeline(power.timelineName, affectedPlayers)
        await removeOtherPlayersFromTimeline(power.timelineName, player.id)
        return Promise.resolve()
      } else {
        return Promise.resolve()
      }
    },
    stealing: async power => {
      if (!power || !power.timelineName) return Promise.resolve()
      const player = await getPlayer(power.playerId)
      const targetPlayer = await getPlayer(power.target.name)
      const itemName = power.itemName
      const timeline = await getTimeline(power.timelineName)
      if (
        player.items.map(i => i.name).includes('steal') &&
        targetPlayer.items.map(i => i.name).includes(itemName) &&
        timeline.players.includes(power.target.name)
      ) {
        await removeItemFromPlayer(itemName, power.target.name)
        await appendItemToPlayer(power.playerId, {name: itemName, source: false})
        return Promise.resolve()
      } else {
        return Promise.resolve()
      }
    },
    combining: async power => {
      if (!power || !power.timelineName) return Promise.resolve()
      const player = await getPlayer(power.playerId)
      const targetItem = power.target.itemName
      const timeline = await getTimeline(power.timelineName)
      const requiredItems = targetItem === 'lock'
        ? ['assist', 'prevent']
        : ['reset', 'steal']
      if (
        requiredItems.every(
          requiredItem => player.items.map(i => i.name).includes(requiredItem)
        ) &&
        timeline.players.includes(player.id)
      ) {
        await appendItemToPlayer(
          power.playerId,
          {name: targetItem, source: power.timelineName}
        )
        return Promise.resolve()
      } else {
        return Promise.resolve()
      }
    }
  }
}
