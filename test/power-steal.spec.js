'use strict'

const _ = require('lodash')

const test = require('tape')
const fixtures = require('./fixtures')
const jobsFactory = require('../jobs')
const {
  createPower,
  getPower,
  getPlayerItems,
  getMessages
} = require('./test-utils')

test('Steal power resolution => success', async t => {
  t.plan(4)
  try {
    const conn = await fixtures()
    const jobs = jobsFactory(conn)
    const timelineName = 'Timeline 1'
    const playerId = '3'
    const targetPlayerId = '4'
    const itemName = 'lock'
    const now = new Date()
    await createPower({
      playerId,
      itemName,
      gameId: 1,
      timelineName,
      name: 'Stealing',
      startTime: now.getTime(),
      endTime: now.getTime(),
      target: {
        type: 'player',
        id: targetPlayerId
      },
      allies: [],
      enemies: []
    }, conn)
    await jobs()
    const targetPlayerItems = await getPlayerItems(targetPlayerId, conn)
    const perpetratorItems = await getPlayerItems(playerId, conn)
    const power = await getPower(playerId, timelineName, conn)
    const messages = await getMessages(conn)
    const createdMessage = messages.find(m => m.timelineName === timelineName)
    t.ok(perpetratorItems.find(i => i.name === 'lock' && i.source === false), 'Item moved to stealers inventory')
    t.notOk(targetPlayerItems.find(i => i.name === 'lock' && i.source === 'Timeline 2'), 'Item not in target\'s inventory')
    t.notOk(power, 'power was deleted')
    t.deepEquals(_.omit(createdMessage, ['id', 'startTime']), {
      gameId: 1,
      playerId,
      timelineName,
      readBy: [],
      text: 'Has stolen an item'
    }, 'message created')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test('Steal power resolution => failure (negative score)', async t => {
  t.plan(4)
  try {
    const conn = await fixtures()
    const jobs = jobsFactory(conn)
    const timelineName = 'Timeline 1'
    const playerId = '3'
    const targetPlayerId = '4'
    const itemName = 'lock'
    const now = new Date()
    await createPower({
      playerId,
      itemName,
      gameId: 1,
      timelineName,
      name: 'Stealing',
      startTime: now.getTime(),
      endTime: now.getTime(),
      target: {
        type: 'player',
        id: targetPlayerId
      },
      allies: [],
      enemies: [{id: 1, score: 2}]
    }, conn)
    await jobs()
    const targetPlayerItems = await getPlayerItems(targetPlayerId, conn)
    const perpetratorItems = await getPlayerItems(playerId, conn)
    const power = await getPower(playerId, timelineName, conn)
    const messages = await getMessages(conn)
    const createdMessage = messages.find(m => m.timelineName === timelineName)
    t.notOk(perpetratorItems.find(i => i.name === 'lock' && i.source === false), 'Item not moved to stealers inventory')
    t.ok(targetPlayerItems.find(i => i.name === 'lock' && i.source === 'Timeline 2'), 'Item still in target\'s inventory')
    t.notOk(power, 'power was deleted')
    t.deepEquals(_.omit(createdMessage, ['id', 'startTime']), {
      gameId: 1,
      playerId,
      timelineName,
      readBy: [],
      text: 'Failed while stealing: too much resistance'
    }, 'message created')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test('Steal power resolution => failure (item no longer exists)', async t => {
  t.plan(4)
  try {
    const conn = await fixtures()
    const jobs = jobsFactory(conn)
    const timelineName = 'Timeline 1'
    const playerId = '1'
    const targetPlayerId = '4'
    const itemName = 'lock'
    const now = new Date()
    await createPower({
      playerId,
      itemName,
      gameId: 1,
      timelineName,
      name: 'Stealing',
      startTime: now.getTime(),
      endTime: now.getTime(),
      target: {
        type: 'player',
        id: targetPlayerId
      },
      allies: [],
      enemies: []
    }, conn)
    await jobs()
    const targetPlayerItems = await getPlayerItems(targetPlayerId, conn)
    const perpetratorItems = await getPlayerItems(playerId, conn)
    const power = await getPower(playerId, timelineName, conn)
    const messages = await getMessages(conn)
    const createdMessage = messages.find(m => m.timelineName === timelineName)
    t.notOk(perpetratorItems.find(i => i.name === 'lock' && i.source === false), 'Item not moved to stealers inventory')
    t.ok(targetPlayerItems.find(i => i.name === 'lock' && i.source === 'Timeline 2'), 'Item still in target\'s inventory')
    t.notOk(power, 'power was deleted')
    t.deepEquals(_.omit(createdMessage, ['id', 'startTime']), {
      gameId: 1,
      playerId,
      timelineName,
      readBy: [],
      text: 'Failed while Stealing: never had steal item!'
    }, 'message created')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test('Steal power resolution => failure (target item no longer exists)', async t => {
  t.plan(3)
  try {
    const conn = await fixtures()
    const jobs = jobsFactory(conn)
    const timelineName = 'Timeline 1'
    const playerId = '3'
    const targetPlayerId = '1'
    const itemName = 'lock'
    const now = new Date()
    await createPower({
      playerId,
      itemName,
      gameId: 1,
      timelineName,
      name: 'Stealing',
      startTime: now.getTime(),
      endTime: now.getTime(),
      target: {
        type: 'player',
        id: targetPlayerId
      },
      allies: [],
      enemies: []
    }, conn)
    await jobs()
    const perpetratorItems = await getPlayerItems(playerId, conn)
    const power = await getPower(playerId, timelineName, conn)
    const messages = await getMessages(conn)
    const createdMessage = messages.find(m => m.timelineName === timelineName)
    t.notOk(perpetratorItems.find(i => i.name === 'lock' && i.source === false), 'Item not moved to stealers inventory')
    t.notOk(power, 'power was deleted')
    t.deepEquals(_.omit(createdMessage, ['id', 'startTime']), {
      gameId: 1,
      playerId,
      timelineName,
      readBy: [],
      text: 'Failed while Stealing: target never had item!'
    }, 'message created')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test('Steal power resolution => failure (player no longer in timeline)', async t => {
  t.plan(4)
  try {
    const conn = await fixtures()
    const jobs = jobsFactory(conn)
    const timelineName = 'Timeline 1'
    const playerId = '5'
    const targetPlayerId = '3'
    const itemName = 'lock'
    const now = new Date()
    await createPower({
      playerId,
      itemName,
      gameId: 1,
      timelineName,
      name: 'Stealing',
      startTime: now.getTime(),
      endTime: now.getTime(),
      target: {
        type: 'player',
        id: targetPlayerId
      },
      allies: [],
      enemies: []
    }, conn)
    await jobs()
    const targetPlayerItems = await getPlayerItems(targetPlayerId, conn)
    const perpetratorItems = await getPlayerItems(playerId, conn)
    const power = await getPower(playerId, timelineName, conn)
    const messages = await getMessages(conn)
    const createdMessage = messages.find(m => m.timelineName === timelineName)
    t.notOk(perpetratorItems.find(i => i.name === 'lock' && i.source === false), 'Item not moved to stealers inventory')
    t.ok(targetPlayerItems.find(i => i.name === 'lock' && i.source === 'Timeline 3'), 'Item still in target\'s inventory')
    t.notOk(power, 'power was deleted')
    t.deepEquals(_.omit(createdMessage, ['id', 'startTime']), {
      gameId: 1,
      playerId,
      timelineName,
      readBy: [],
      text: 'Failed while stealing: was never in timeline!'
    }, 'message created')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test('Steal power resolution => failure (player no longer has room for item)', async t => {
  t.plan(4)
  try {
    const conn = await fixtures()
    const jobs = jobsFactory(conn)
    const timelineName = 'Timeline 9'
    const playerId = '10'
    const targetPlayerId = '9'
    const itemName = 'lock'
    const now = new Date()
    await createPower({
      playerId,
      itemName,
      gameId: 1,
      timelineName,
      name: 'Stealing',
      startTime: now.getTime(),
      endTime: now.getTime(),
      target: {
        type: 'player',
        id: targetPlayerId
      },
      allies: [],
      enemies: []
    }, conn)
    await jobs()
    const targetPlayerItems = await getPlayerItems(targetPlayerId, conn)
    const perpetratorItems = await getPlayerItems(playerId, conn)
    const power = await getPower(playerId, timelineName, conn)
    const messages = await getMessages(conn)
    const createdMessage = messages.find(m => m.timelineName === timelineName)
    t.notOk(perpetratorItems.find(i => i.name === 'lock' && i.source === false), 'Item not moved to stealers inventory')
    t.ok(targetPlayerItems.find(i => i.name === 'lock' && i.source === 'Timeline 2'), 'Item still in target\'s inventory')
    t.notOk(power, 'power was deleted')
    t.deepEquals(_.omit(createdMessage, ['id', 'startTime']), {
      gameId: 1,
      playerId,
      timelineName,
      readBy: [],
      text: 'Failed while Stealing: never had room for item!'
    }, 'message created')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test('Steal power resolution => failure (target player no longer in timeline)', async t => {
  t.plan(4)
  try {
    const conn = await fixtures()
    const jobs = jobsFactory(conn)
    const timelineName = 'Timeline 1'
    const playerId = '3'
    const targetPlayerId = '5'
    const itemName = 'lock'
    const now = new Date()
    await createPower({
      playerId,
      itemName,
      gameId: 1,
      timelineName,
      name: 'Stealing',
      startTime: now.getTime(),
      endTime: now.getTime(),
      target: {
        type: 'player',
        id: targetPlayerId
      },
      allies: [],
      enemies: []
    }, conn)
    await jobs()
    const targetPlayerItems = await getPlayerItems(targetPlayerId, conn)
    const perpetratorItems = await getPlayerItems(playerId, conn)
    const power = await getPower(playerId, timelineName, conn)
    const messages = await getMessages(conn)
    const createdMessage = messages.find(m => m.timelineName === timelineName)
    t.notOk(perpetratorItems.find(i => i.name === 'lock' && i.source === false), 'Item not moved to stealers inventory')
    t.ok(targetPlayerItems.find(i => i.name === 'lock' && i.source === 'Timeline 2'), 'Item still in target\'s inventory')
    t.notOk(power, 'power was deleted')
    t.deepEquals(_.omit(createdMessage, ['id', 'startTime']), {
      gameId: 1,
      playerId,
      timelineName,
      readBy: [],
      text: 'Failed while Stealing: target was never in timeline!'
    }, 'message created')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})
