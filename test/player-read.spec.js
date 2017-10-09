'use strict'

const test = require('tape')
const request = require('supertest')
const fixtures = require('./fixtures')
const { getPlayer, stubPassport, getMessages } = require('./test-utils')

test('POST /player/read => marks messages as read by player', async t => {
  t.plan(1)
  try {
    const username = 'foo'
    const userpic = 'bar'
    const userId = '42'
    stubPassport(username, userpic, userId)
    const conn = await fixtures()
    const app = require('../app')(conn)
    const now = new Date()
    const startTime = now.getTime()
    await request(app)
      .post(`/player/read/${startTime}`)
      .expect(200)
    const messages = await getMessages(conn)
    t.ok(messages.every(m => {
      return m.startTime < Number(startTime) + 1
        ? m.readBy.includes(userId)
        : true
    }), 'all messages marked as read')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test('POST /player/update => updates existing player', async t => {
  t.plan(1)
  try {
    const username = 'foo'
    const userpic = 'bar'
    const userId = '1'
    stubPassport(username, userpic, userId)
    const conn = await fixtures()
    const app = require('../app')(conn)
    await request(app)
      .post(`/player/update`)
      .expect(200)
    const player = await getPlayer(userId, conn)
    t.deepEquals(player, {
      id: '1',
      gameId: 1,
      name: 'foo',
      picture: 'bar',
      items: [],
      actions: 10
    }, 'player updated with name and pic')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})
