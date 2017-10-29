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
    removeItemFromPlayer,
    declareWinner
  } = require('../service/player')(connection)
  const { createMessage } = require('../service/message')(connection)
  return {
    locking: async power => {
      if (!power || !power.timelineName) return Promise.resolve()
      const player = await getPlayer(power.playerId)
      if (player.items.map(i => i.name).includes('lock')) {
        await lockTimeline(power.timelineName)
        await createMessage({
          text: `Has locked the timeline`,
          timelineName: power.timelineName,
          playerId: power.playerId
        })
      } else {
        await createMessage({
          text: `Failed while ${power.name}: never had lock item!`,
          timelineName: power.timelineName,
          playerId: power.playerId
        })
        return Promise.resolve()
      }
    },
    unlocking: async power => {
      if (!power || !power.timelineName) return Promise.resolve()
      const player = await getPlayer(power.playerId)
      if (player.items.map(i => i.name).includes('unlock')) {
        await unlockTimeline(power.timelineName)
        await createMessage({
          text: `Has unlocked the timeline`,
          timelineName: power.timelineName,
          playerId: power.playerId
        })
      } else {
        await createMessage({
          text: `Failed while ${power.name}: never had unlock item!`,
          timelineName: power.timelineName,
          playerId: power.playerId
        })
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
        await createMessage({
          text: `Has reset the timeline`,
          timelineName: power.timelineName,
          playerId: power.playerId
        })
      } else {
        await createMessage({
          text: `Failed while ${power.name}: never had reset item!`,
          timelineName: power.timelineName,
          playerId: power.playerId
        })
        return Promise.resolve()
      }
    },
    stealing: async power => {
      if (!power || !power.timelineName) return Promise.resolve()
      const player = await getPlayer(power.playerId)
      const targetPlayer = await getPlayer(power.target.id)
      const itemName = power.itemName
      const timeline = await getTimeline(power.timelineName)
      if (!player.items.map(i => i.name).includes('steal')) {
        await createMessage({
          text: `Failed while ${power.name}: never had steal item!`,
          timelineName: power.timelineName,
          playerId: power.playerId
        })
      } else if (!targetPlayer.items.map(i => i.name).includes(itemName)) {
        await createMessage({
          text: `Failed while ${power.name}: target never had item!`,
          timelineName: power.timelineName,
          playerId: power.playerId
        })
      } else if (!timeline.players.includes(power.target.id)) {
        await createMessage({
          text: `Failed while ${power.name}: target was never in timeline!`,
          timelineName: power.timelineName,
          playerId: power.playerId
        })
      } else if (player.items.length >= 8) {
        await createMessage({
          text: `Failed while ${power.name}: never had room for item!`,
          timelineName: power.timelineName,
          playerId: power.playerId
        })
      } else {
        await removeItemFromPlayer(itemName, power.target.id)
        await appendItemToPlayer(power.playerId, {name: itemName, source: false})
        await createMessage({
          text: `Has stolen an item`,
          timelineName: power.timelineName,
          playerId: power.playerId
        })
      }
    },
    combining: async power => {
      if (!power || !power.timelineName) return Promise.resolve()
      const player = await getPlayer(power.playerId)
      const targetItem = power.target.itemName
      const requiredItems = targetItem === 'lock'
        ? ['assist', 'prevent']
        : ['reset', 'steal']
      if (
        requiredItems.every(
          requiredItem => player.items.map(i => i.name).includes(requiredItem)
        )
      ) {
        await appendItemToPlayer(
          power.playerId,
          {name: targetItem, source: power.timelineName}
        )
        await createMessage({
          text: `Has combined items and got the ${targetItem} item`,
          timelineName: power.timelineName,
          playerId: power.playerId
        })
      } else {
        await createMessage({
          text: `Failed while ${power.name}: never had required items!`,
          timelineName: power.timelineName,
          playerId: power.playerId
        })
      }
    },
    winning: async power => {
      if (!power || !power.timelineName) return Promise.resolve()
      const player = await getPlayer(power.playerId)
      const requiredItems = ['lock', 'unlock']
      if (
        requiredItems.every(
          requiredItem => player.items.map(i => i.name).includes(requiredItem)
        )
      ) {
        await declareWinner(power.playerId, power.gameId)
        await createMessage({
          text: `Has won the game!`,
          timelineName: power.timelineName,
          playerId: power.playerId
        })
      } else {
        await createMessage({
          text: `Failed while ${power.name}: never had required items!`,
          timelineName: power.timelineName,
          playerId: power.playerId
        })
      }
    }
  }
}
