'use strict'

const test = require('tape')
const request = require('supertest')
const fixtures = require('./fixtures')
const {
  getPlayerActions,
  getPower,
  getAllUserPowers,
  validatePowerTimes
} = require('./test-utils')

test('POST /timeline/steal/:itemName/:targetPlayerId/:timelineName => creates relevant power', async t => {
  t.plan(2)
  try {
    const conn = await fixtures()
    const app = require('../app')(conn)
    const timelineName = 'Timeline 1'
    const itemName = 'lock'
    const targetPlayerId = 4
    const userId = 3
    await request(app)
      .post(`/timeline/steal/${itemName}/${targetPlayerId}/${timelineName}`)
      .set('userId', userId)
      .expect(200)
    const power = await getPower(userId, timelineName, conn)
    const actions = await getPlayerActions(userId, conn)
    const expectedPower = {
      playerId: userId,
      itemName,
      gameId: 1,
      timelineName,
      name: 'Stealing',
      startTime: true,
      endTime: true,
      target: {
        type: 'player',
        id: targetPlayerId
      },
      allies: [],
      enemies: []
    }
    t.deepEquals(validatePowerTimes(power), expectedPower, 'power created properly')
    t.equals(actions, 9, 'actions decremented by 1')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test('POST /timeline/steal/:itemName/:targetPlayerId/:timelineName => with no actions left', async t => {
  t.plan(2)
  try {
    const conn = await fixtures()
    const app = require('../app')(conn)
    const timelineName = 'Timeline 1'
    const itemName = 'lock'
    const targetPlayerId = 4
    const userId = 5
    await request(app)
      .post(`/timeline/steal/${itemName}/${targetPlayerId}/${timelineName}`)
      .set('userId', userId)
      .expect(403)
    const power = await getPower(userId, timelineName, conn)
    const actions = await getPlayerActions(userId, conn)
    t.equals(actions, 0, 'actions remain at 0')
    t.notOk(power, 'power not created')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test('POST /timeline/steal/:itemName/:targetPlayerId/:timelineName => with no steal item', async t => {
  t.plan(2)
  try {
    const conn = await fixtures()
    const app = require('../app')(conn)
    const timelineName = 'Timeline 1'
    const itemName = 'lock'
    const userId = 1
    const targetPlayerId = 4
    await request(app)
      .post(`/timeline/steal/${itemName}/${targetPlayerId}/${timelineName}`)
      .set('userId', userId)
      .expect(403)
    const power = await getPower(userId, timelineName, conn)
    const actions = await getPlayerActions(userId, conn)
    t.equals(actions, 10, 'actions not decremented')
    t.notOk(power, 'power not created')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
    t.end()
  }
})

test('POST /timeline/steal/:itemName/:targetPlayerId/:timelineName => bad parameters - no userId', async t => {
  t.plan(1)
  try {
    const conn = await fixtures()
    const app = require('../app')(conn)
    const timelineName = 'Timeline 1'
    const itemName = 'lock'
    const targetPlayerId = 4
    await request(app)
      .post(`/timeline/steal/${itemName}/${targetPlayerId}/${timelineName}`)
      .expect(400)
    t.pass('request failed without a user id')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test('POST /timeline/steal/:itemName/:targetPlayerId/:timelineName => bad parameters - no itemName', async t => {
  t.plan(2)
  try {
    const conn = await fixtures()
    const app = require('../app')(conn)
    const timelineName = 'Timeline 1'
    const userId = 3
    await request(app)
      .post(`/timeline/steal`)
      .set('userId', userId)
      .expect(404)
    const power = await getPower(userId, timelineName, conn)
    const actions = await getPlayerActions(userId, conn)
    t.equals(actions, 10, 'actions remain at 0')
    t.notOk(power, 'power not created')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test('POST /timeline/steal/:itemName/:targetPlayerId/:timelineName => bad parameters - no targetPlayerId', async t => {
  t.plan(2)
  try {
    const conn = await fixtures()
    const app = require('../app')(conn)
    const timelineName = 'Timeline 1'
    const itemName = 'steal'
    const userId = 3
    await request(app)
      .post(`/timeline/steal/${itemName}`)
      .set('userId', userId)
      .expect(404)
    const power = await getPower(userId, timelineName, conn)
    const actions = await getPlayerActions(userId, conn)
    t.equals(actions, 10, 'actions remain at 0')
    t.notOk(power, 'power not created')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test('POST /timeline/steal/:itemName/:targetPlayerId/:timelineName => bad parameters - no timelineName', async t => {
  t.plan(2)
  try {
    const conn = await fixtures()
    const app = require('../app')(conn)
    const timelineName = 'Timeline 1'
    const itemName = 'steal'
    const userId = 3
    const targetPlayerId = 4
    await request(app)
      .post(`/timeline/steal/${itemName}/${targetPlayerId}`)
      .set('userId', userId)
      .expect(404)
    const power = await getPower(userId, timelineName, conn)
    const actions = await getPlayerActions(userId, conn)
    t.equals(actions, 10, 'actions remain at 0')
    t.notOk(power, 'power not created')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test('POST /timeline/steal/:itemName/:targetPlayerId/:timelineName => bad parameters - non-existent user', async t => {
  t.plan(1)
  try {
    const conn = await fixtures()
    const app = require('../app')(conn)
    const userId = 99999
    const timelineName = 'Timeline 1'
    const itemName = 'lock'
    const targetPlayerId = 4
    await request(app)
      .post(`/timeline/steal/${itemName}/${targetPlayerId}/${timelineName}`)
      .set('userId', userId)
      .expect(403)
    t.pass('request failed without a user id')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test('POST /timeline/steal/:itemName/:targetPlayerId/:timelineName => bad parameters - non-existent targetPlayerId', async t => {
  t.plan(2)
  try {
    const conn = await fixtures()
    const app = require('../app')(conn)
    const timelineName = 'Timeline 1'
    const itemName = 'lock'
    const targetPlayerId = 99999
    const userId = 3
    await request(app)
      .post(`/timeline/steal/${itemName}/${targetPlayerId}/${timelineName}`)
      .set('userId', userId)
      .expect(403)
    const power = await getPower(userId, timelineName, conn)
    const actions = await getPlayerActions(userId, conn)
    t.equals(actions, 10, 'actions not decremented')
    t.notOk(power, 'power not created')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test('POST /timeline/steal/:itemName/:targetPlayerId/:timelineName => bad parameters - non-existent timeline', async t => {
  t.plan(2)
  try {
    const conn = await fixtures()
    const app = require('../app')(conn)
    const timelineName = 'foo'
    const itemName = 'lock'
    const targetPlayerId = 4
    const userId = 3
    await request(app)
      .post(`/timeline/steal/${itemName}/${targetPlayerId}/${timelineName}`)
      .set('userId', userId)
      .expect(403)
    const power = await getPower(userId, timelineName, conn)
    const actions = await getPlayerActions(userId, conn)
    t.equals(actions, 10, 'actions not decremented')
    t.notOk(power, 'power not created')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test('POST /timeline/steal/:itemName/:targetPlayerId/:timelineName => targetPlayerId not in timeline', async t => {
  t.plan(2)
  try {
    const conn = await fixtures()
    const app = require('../app')(conn)
    const timelineName = 'Timeline 7'
    const itemName = 'lock'
    const targetPlayerId = 4
    const userId = 3
    await request(app)
      .post(`/timeline/steal/${itemName}/${targetPlayerId}/${timelineName}`)
      .set('userId', userId)
      .expect(403)
    const power = await getPower(userId, timelineName, conn)
    const actions = await getPlayerActions(userId, conn)
    t.equals(actions, 10, 'actions not decremented')
    t.notOk(power, 'power not created')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test('POST /timeline/steal/:itemName/:targetPlayerId/:timelineName => targetPlayerId does not have item', async t => {
  t.plan(2)
  try {
    const conn = await fixtures()
    const app = require('../app')(conn)
    const timelineName = 'Timeline 7'
    const itemName = 'lock'
    const targetPlayerId = 1
    const userId = 3
    await request(app)
      .post(`/timeline/steal/${itemName}/${targetPlayerId}/${timelineName}`)
      .set('userId', userId)
      .expect(403)
    const power = await getPower(userId, timelineName, conn)
    const actions = await getPlayerActions(userId, conn)
    t.equals(actions, 10, 'actions not decremented')
    t.notOk(power, 'power not created')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test('POST /timeline/steal/:itemName/:targetPlayerId/:timelineName => user not in timeline', async t => {
  t.plan(2)
  try {
    const conn = await fixtures()
    const app = require('../app')(conn)
    const timelineName = 'Timeline 5'
    const itemName = 'lock'
    const targetPlayerId = 3
    const userId = 4
    await request(app)
      .post(`/timeline/steal/${itemName}/${targetPlayerId}/${timelineName}`)
      .set('userId', userId)
      .expect(403)
    const power = await getPower(userId, timelineName, conn)
    const actions = await getPlayerActions(userId, conn)
    t.equals(actions, 10, 'actions not decremented')
    t.notOk(power, 'power not created')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test('POST /timeline/steal/:itemName/:targetPlayerId/:timelineName => user busy (has power) in timeline', async t => {
  t.plan(2)
  try {
    const conn = await fixtures()
    const app = require('../app')(conn)
    const timelineName = 'Timeline 6'
    const itemName = 'lock'
    const targetPlayerId = 4
    const userId = 3
    await request(app)
      .post(`/timeline/steal/${itemName}/${targetPlayerId}/${timelineName}`)
      .set('userId', userId)
      .expect(403)
    const power = await getAllUserPowers(userId, timelineName, conn)
    const actions = await getPlayerActions(userId, conn)
    t.equals(actions, 10, 'actions not decremented')
    t.equals(power.length, 1, 'power not created')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test('POST /timeline/steal/:itemName/:targetPlayerId/:timelineName => cannot steal item from self', async t => {
  t.plan(2)
  try {
    const conn = await fixtures()
    const app = require('../app')(conn)
    const timelineName = 'Timeline 1'
    const itemName = 'lock'
    const targetPlayerId = 3
    const userId = 3
    await request(app)
      .post(`/timeline/steal/${itemName}/${targetPlayerId}/${timelineName}`)
      .set('userId', userId)
      .expect(403)
    const power = await getPower(userId, timelineName, conn)
    const actions = await getPlayerActions(userId, conn)
    t.equals(actions, 10, 'actions not decremented')
    t.notOk(power, 'power not created')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})
