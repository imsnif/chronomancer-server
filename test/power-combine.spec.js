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

test('Combine power resolution => success (assist, prevent)', async t => {
  t.plan(3)
  try {
    const conn = await fixtures()
    const jobs = jobsFactory(conn)
    const timelineName = 'Timeline 8'
    const playerId = '6'
    const now = new Date()
    await createPower({
      playerId,
      gameId: 1,
      timelineName,
      name: 'Combining',
      startTime: now.getTime(),
      endTime: now.getTime(),
      target: {
        type: 'timeline',
        name: timelineName,
        itemName: 'lock'
      },
      allies: [],
      enemies: []
    }, conn)
    await jobs()
    const items = await getPlayerItems(playerId, conn)
    const power = await getPower(playerId, timelineName, conn)
    const messages = await getMessages(conn)
    const createdMessage = messages.find(m => m.timelineName === timelineName)
    t.deepEquals(items, [
      {name: 'assist', source: 'Timeline 2'},
      {name: 'prevent', source: 'Timeline 2'},
      {name: 'lock', source: 'Timeline 8'}
    ], 'lock item added to player')
    t.notOk(power, 'power was deleted')
    t.deepEquals(_.omit(createdMessage, ['id', 'startTime']), {
      gameId: 1,
      playerId,
      timelineName,
      readBy: [],
      text: 'Has combined items and got the lock item'
    }, 'message created')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test('Combine power resolution => success (reset, steal)', async t => {
  t.plan(3)
  try {
    const conn = await fixtures()
    const jobs = jobsFactory(conn)
    const timelineName = 'Timeline 8'
    const playerId = '7'
    const now = new Date()
    await createPower({
      playerId,
      gameId: 1,
      timelineName,
      name: 'Combining',
      startTime: now.getTime(),
      endTime: now.getTime(),
      target: {
        type: 'timeline',
        name: timelineName,
        itemName: 'unlock'
      },
      allies: [],
      enemies: []
    }, conn)
    await jobs()
    const items = await getPlayerItems(playerId, conn)
    const power = await getPower(playerId, timelineName, conn)
    const messages = await getMessages(conn)
    const createdMessage = messages.find(m => m.timelineName === timelineName)
    t.deepEquals(items, [
      {name: 'assist', source: 'Timeline 2'},
      {name: 'prevent', source: 'Timeline 2'},
      {name: 'reset', source: 'Timeline 2'},
      {name: 'steal', source: 'Timeline 2'},
      {name: 'unlock', source: 'Timeline 8'}
    ], 'lock item added to player')
    t.notOk(power, 'power was deleted')
    t.deepEquals(_.omit(createdMessage, ['id', 'startTime']), {
      gameId: 1,
      playerId,
      timelineName,
      readBy: [],
      text: 'Has combined items and got the unlock item'
    }, 'message created')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test('Combine power resolution => failure (negative score)', async t => {
  t.plan(3)
  try {
    const conn = await fixtures()
    const jobs = jobsFactory(conn)
    const timelineName = 'Timeline 8'
    const playerId = '6'
    const now = new Date()
    await createPower({
      playerId,
      gameId: 1,
      timelineName,
      name: 'Combining',
      startTime: now.getTime(),
      endTime: now.getTime(),
      target: {
        type: 'timeline',
        name: timelineName,
        itemName: 'lock'
      },
      allies: [],
      enemies: [{id: 1, score: 2}]
    }, conn)
    await jobs()
    const items = await getPlayerItems(playerId, conn)
    const power = await getPower(playerId, timelineName, conn)
    const messages = await getMessages(conn)
    const createdMessage = messages.find(m => m.timelineName === timelineName)
    t.deepEquals(items, [
      {name: 'assist', source: 'Timeline 2'},
      {name: 'prevent', source: 'Timeline 2'}
    ], 'player items unchanged')
    t.notOk(power, 'power was deleted')
    t.deepEquals(_.omit(createdMessage, ['id', 'startTime']), {
      gameId: 1,
      playerId,
      timelineName,
      readBy: [],
      text: 'Failed while combining: too much resistance'
    }, 'message created')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test('Combine power resolution => failure (items no longer exists) (assist, prevent)', async t => {
  t.plan(3)
  try {
    const conn = await fixtures()
    const jobs = jobsFactory(conn)
    const timelineName = 'Timeline 1'
    const playerId = '1'
    const now = new Date()
    await createPower({
      playerId,
      gameId: 1,
      timelineName,
      name: 'Combining',
      startTime: now.getTime(),
      endTime: now.getTime(),
      target: {
        type: 'timeline',
        name: timelineName,
        itemName: 'lock'
      },
      allies: [],
      enemies: []
    }, conn)
    await jobs()
    const items = await getPlayerItems(playerId, conn)
    const power = await getPower(playerId, timelineName, conn)
    const messages = await getMessages(conn)
    const createdMessage = messages.find(m => m.timelineName === timelineName)
    t.deepEquals(items, [], 'player items unchanged')
    t.notOk(power, 'power was deleted')
    t.deepEquals(_.omit(createdMessage, ['id', 'startTime']), {
      gameId: 1,
      playerId,
      timelineName,
      readBy: [],
      text: 'Failed while Combining: never had required items!'
    }, 'message created')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test('Combine power resolution => failure (one item no longer exists) (reset, steal)', async t => {
  t.plan(2)
  try {
    const conn = await fixtures()
    const jobs = jobsFactory(conn)
    const timelineName = 'Timeline 8'
    const playerId = '6'
    const now = new Date()
    await createPower({
      playerId,
      gameId: 1,
      timelineName,
      name: 'Combining',
      startTime: now.getTime(),
      endTime: now.getTime(),
      target: {
        type: 'timeline',
        name: timelineName,
        itemName: 'unlock'
      },
      allies: [],
      enemies: []
    }, conn)
    await jobs()
    const items = await getPlayerItems(playerId, conn)
    const power = await getPower(playerId, timelineName, conn)
    t.deepEquals(items, [
      {name: 'assist', source: 'Timeline 2'},
      {name: 'prevent', source: 'Timeline 2'}
    ], 'player items unchanged')
    t.notOk(power, 'power was deleted')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test('Combine power resolution => failure (player no longer in timeline)', async t => {
  t.plan(3)
  try {
    const conn = await fixtures()
    const jobs = jobsFactory(conn)
    const timelineName = 'Timeline 1'
    const playerId = '6'
    const now = new Date()
    await createPower({
      playerId,
      gameId: 1,
      timelineName,
      name: 'Combining',
      startTime: now.getTime(),
      endTime: now.getTime(),
      target: {
        type: 'timeline',
        name: timelineName,
        itemName: 'lock'
      },
      allies: [],
      enemies: []
    }, conn)
    await jobs()
    const items = await getPlayerItems(playerId, conn)
    const power = await getPower(playerId, timelineName, conn)
    const messages = await getMessages(conn)
    const createdMessage = messages.find(m => m.timelineName === timelineName)
    t.deepEquals(items, [
      {name: 'assist', source: 'Timeline 2'},
      {name: 'prevent', source: 'Timeline 2'}
    ], 'player items unchanged')
    t.notOk(power, 'power was deleted')
    t.deepEquals(_.omit(createdMessage, ['id', 'startTime']), {
      gameId: 1,
      playerId,
      timelineName,
      readBy: [],
      text: 'Failed while combining: was never in timeline!'
    }, 'message created')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test('Combine power resolution => failure (player no longer has room)', async t => {
  t.plan(3)
  try {
    const conn = await fixtures()
    const jobs = jobsFactory(conn)
    const timelineName = 'Timeline 9'
    const playerId = '10'
    const now = new Date()
    await createPower({
      playerId,
      gameId: 1,
      timelineName,
      name: 'Combining',
      startTime: now.getTime(),
      endTime: now.getTime(),
      target: {
        type: 'timeline',
        name: timelineName,
        itemName: 'lock'
      },
      allies: [],
      enemies: []
    }, conn)
    await jobs()
    const items = await getPlayerItems(playerId, conn)
    const power = await getPower(playerId, timelineName, conn)
    const messages = await getMessages(conn)
    const createdMessage = messages.find(m => m.timelineName === timelineName)
    t.deepEquals(items, [
      {name: 'assist', source: 'Timeline 2'},
      {name: 'assist', source: 'Timeline 2'},
      {name: 'prevent', source: 'Timeline 2'},
      {name: 'prevent', source: 'Timeline 2'},
      {name: 'reset', source: 'Timeline 2'},
      {name: 'steal', source: 'Timeline 2'},
      {name: 'lock', source: 'Timeline 2'},
      {name: 'unlock', source: 'Timeline 2'}
    ], 'player items unchanged')
    t.notOk(power, 'power was deleted')
    t.deepEquals(_.omit(createdMessage, ['id', 'startTime']), {
      gameId: 1,
      playerId,
      timelineName,
      readBy: [],
      text: 'Failed while Combining: never had room for item!'
    }, 'message created')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})
