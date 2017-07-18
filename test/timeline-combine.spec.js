'use strict'

const test = require('tape')
const request = require('supertest')
const fixtures = require('./fixtures')
const {
  getPlayerActions,
  getPower,
  createPower,
  getAllUserPowers,
  validatePowerTimes
} = require('./test-utils')

test('POST /timeline/combine/:item1/:item2/:timelineName (assist, prevent) => creates relevant power', async t => {
  t.plan(2)
  try {
    const conn = await fixtures()
    const app = require('../app')(conn)
    const timelineName = 'Timeline 8'
    const userId = '6'
    const item1 = 'assist'
    const item2 = 'prevent'
    await request(app)
      .post(`/timeline/combine/${item1}/${item2}/${timelineName}`)
      .set('userId', userId)
      .expect(200)
    const power = await getPower(userId, timelineName, conn)
    const actions = await getPlayerActions(userId, conn)
    const expectedPower = {
      playerId: userId,
      gameId: 1,
      timelineName,
      name: 'Combining',
      startTime: true,
      endTime: true,
      target: {
        type: 'timeline',
        name: timelineName,
        itemName: 'lock'
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

test('POST /timeline/combine/:item1/:item2/:timelineName (reset, steal) => creates relevant power', async t => {
  t.plan(2)
  try {
    const conn = await fixtures()
    const app = require('../app')(conn)
    const timelineName = 'Timeline 8'
    const userId = '7'
    const item1 = 'steal'
    const item2 = 'reset'
    await request(app)
      .post(`/timeline/combine/${item1}/${item2}/${timelineName}`)
      .set('userId', userId)
      .expect(200)
    const power = await getPower(userId, timelineName, conn)
    const actions = await getPlayerActions(userId, conn)
    const expectedPower = {
      playerId: userId,
      gameId: 1,
      timelineName,
      name: 'Combining',
      startTime: true,
      endTime: true,
      target: {
        type: 'timeline',
        name: timelineName,
        itemName: 'unlock'
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

test('POST /timeline/combine/:item1/:item2/:timelineName (lock, unlock) => creates relevant power (Winning)', async t => {
  t.plan(2)
  try {
    const conn = await fixtures()
    const app = require('../app')(conn)
    const timelineName = 'Timeline 8'
    const userId = '9'
    const item1 = 'lock'
    const item2 = 'unlock'
    await request(app)
      .post(`/timeline/combine/${item1}/${item2}/${timelineName}`)
      .set('userId', userId)
      .expect(200)
    const power = await getPower(userId, timelineName, conn)
    const actions = await getPlayerActions(userId, conn)
    const expectedPower = {
      playerId: userId,
      gameId: 1,
      timelineName,
      name: 'Winning',
      startTime: true,
      endTime: true,
      target: {
        type: 'timeline',
        name: timelineName,
        itemName: 'win'
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

test('POST /timeline/combine/:item1/:item2/:timelineName => with no actions left', async t => {
  t.plan(2)
  try {
    const conn = await fixtures()
    const app = require('../app')(conn)
    const timelineName = 'Timeline 1'
    const userId = '5'
    const item1 = 'lock'
    const item2 = 'unlock'
    await request(app)
      .post(`/timeline/combine/${item1}/${item2}/${timelineName}`)
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

test('POST /timeline/combin/:item1/:item2/:timelineName => with wrong combinations', async t => {
  t.plan(2)
  try {
    const conn = await fixtures()
    const app = require('../app')(conn)
    const timelineName = 'Timeline 8'
    const userId = '9'
    const badCombinations = [
      ['assist', 'lock'],
      ['lock', 'assist'],
      ['prevent', 'unlock'],
      ['unlock', 'prevent'],
      ['prevent', 'lock'],
      ['lock', 'prevent'],
      ['assist', 'unlock'],
      ['unlock', 'assist']
    ]
    await Promise.all(
      badCombinations.map(([item1, item2]) => {
        return request(app)
          .post(`/timeline/combine/${item1}/${item2}/${timelineName}`)
          .set('userId', userId)
          .expect(403)
      })
    )
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

test('POST /timeline/lock/:timelineName => bad parameters - no userId', async t => {
  t.plan(1)
  try {
    const conn = await fixtures()
    const app = require('../app')(conn)
    const timelineName = 'Timeline 8'
    await request(app)
      .post(`/timeline/combine/assist/prevent/${timelineName}`)
      .expect(400)
    t.pass('request failed without a user id')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test('POST /timeline/combine/:item1/:item2/:timelineName => bad parameters - no timelineName', async t => {
  t.plan(1)
  try {
    const conn = await fixtures()
    const app = require('../app')(conn)
    const userId = '3'
    await request(app)
      .post(`/timeline/combine/assist/prevent`)
      .set('userId', userId)
      .expect(404)
    t.pass('request failed without a timeline name')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test('POST /timeline/combine/:item1/:item2/:timelineName => bad parameters - non existent user', async t => {
  t.plan(1)
  try {
    const conn = await fixtures()
    const app = require('../app')(conn)
    const timelineName = 'Timeline 8'
    const userId = '99999'
    await request(app)
      .post(`/timeline/combine/assist/prevent/${timelineName}`)
      .set('userId', userId)
      .expect(403)
    t.pass('request failed with a non-existent user')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test('POST /timeline/lock/:timelineName => bad parameters - non-existent timeline', async t => {
  t.plan(1)
  try {
    const conn = await fixtures()
    const app = require('../app')(conn)
    const userId = '99999'
    await request(app)
      .post(`/timeline/combine/assist/prevent/foo`)
      .set('userId', userId)
      .expect(403)
    t.pass('request failed with a non-existent timeline')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test('POST /timeline/lock/:timelineName => user not in timeline', async t => {
  t.plan(2)
  try {
    const conn = await fixtures()
    const app = require('../app')(conn)
    const userId = '9'
    const timelineName = 'Timeline 1'
    const item1 = 'assist'
    const item2 = 'prevent'
    await request(app)
      .post(`/timeline/combine/${item1}/${item2}/${timelineName}`)
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

test('POST /timeline/lock/:timelineName => user busy (has power) in timeline', async t => {
  t.plan(2)
  try {
    const conn = await fixtures()
    const app = require('../app')(conn)
    const timelineName = 'Timeline 8'
    const userId = '9'
    const item1 = 'assist'
    const item2 = 'prevent'
    const now = new Date()
    await createPower({
      playerId: userId,
      gameId: 1,
      timelineName,
      name: 'Locking',
      startTime: now.getTime(),
      endTime: now.getTime() + 10000,
      target: {
        type: 'timeline',
        name: timelineName
      },
      allies: [],
      enemies: []
    }, conn)
    await request(app)
      .post(`/timeline/combine/${item1}/${item2}/${timelineName}`)
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

test('POST /timeline/lock/:timelineName => user does not have the right items (assist, prevent)', async t => {
  t.plan(2)
  try {
    const conn = await fixtures()
    const app = require('../app')(conn)
    const timelineName = 'Timeline 1'
    const userId = '1'
    const item1 = 'assist'
    const item2 = 'prevent'
    await request(app)
      .post(`/timeline/combine/${item1}/${item2}/${timelineName}`)
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

test('POST /timeline/lock/:timelineName => user does not have the right items (reset, steal)', async t => {
  t.plan(2)
  try {
    const conn = await fixtures()
    const app = require('../app')(conn)
    const timelineName = 'Timeline 8'
    const userId = '6'
    const item1 = 'reset'
    const item2 = 'steal'
    await request(app)
      .post(`/timeline/combine/${item1}/${item2}/${timelineName}`)
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

test('POST /timeline/lock/:timelineName => user does not have the right items (lock, unlock)', async t => {
  t.plan(2)
  try {
    const conn = await fixtures()
    const app = require('../app')(conn)
    const timelineName = 'Timeline 8'
    const userId = '8'
    const item1 = 'lock'
    const item2 = 'unlock'
    await request(app)
      .post(`/timeline/combine/${item1}/${item2}/${timelineName}`)
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
