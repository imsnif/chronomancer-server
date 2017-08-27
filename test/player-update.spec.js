'use strict'

const test = require('tape')
const request = require('supertest')
const fixtures = require('./fixtures')
const { getPlayer, stubPassport } = require('./test-utils')

test('POST /player/update => creates new player', async t => {
  t.plan(1)
  try {
    const username = 'foo'
    const userpic = 'bar'
    const userId = '42'
    stubPassport(username, userpic, userId)
    const conn = await fixtures()
    const app = require('../app')(conn)
    await request(app)
      .post(`/player/update`)
      .set('userId', userId)
      .set('userpic', userpic)
      .set('name', username)
      .expect(200)
    const player = await getPlayer(userId, conn)
    t.deepEquals(player, {
      id: '42',
      name: 'foo',
      picture: 'bar'
    }, 'player created with name and picture')
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
      .set('userId', userId)
      .set('userpic', userpic)
      .set('name', username)
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
