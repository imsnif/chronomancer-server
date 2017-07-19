'use strict'

const r = require('rethinkdb')
const config = require('../config')

function getConnection () {
  return new Promise((resolve, reject) => {
    r.connect((err, connection) => {
      if (err) return reject(err)
      connection.use('chronomancer')
      resolve(connection)
    })
  })
}

function clearTable (tableName, gameId, connection) {
  return new Promise((resolve, reject) => {
    r.db('chronomancer').table(tableName).filter({gameId}).delete().run(connection, (err, result) => {
      if (err) return reject(err)
      resolve()
    })
  })
}

function addPlayersToGame (gameId, connection) {
  console.log(config.startingActions)
  return new Promise((resolve, reject) => {
    r.table('players').update({gameId, actions: config.startingActions, items: []}).run(connection, (err, result) => {
      if (err) return reject(err)
      resolve()
    })
  })
}

async function addTimelines (gameId, connection) {
  const playerCount = await new Promise((resolve, reject) => {
    r.table('players').filter({gameId}).count().run(connection, (err, result) => {
      if (err) return reject(err)
      resolve(result)
    })
  })
  const timelineSets = Math.ceil(playerCount / 4)
  const timelines = Array(timelineSets).fill().reduce((memo, item, index) => {
    memo.push({
      name: `Timeline ${index}-1`,
      type: 'assist',
      players: [],
      isLocked: false,
      gameId
    })
    memo.push({
      name: `Timeline ${index}-2`,
      type: 'prevent',
      players: [],
      isLocked: false,
      gameId
    })
    memo.push({
      name: `Timeline ${index}-3`,
      type: 'reset',
      players: [],
      isLocked: false,
      gameId
    })
    memo.push({
      name: `Timeline ${index}-4`,
      type: 'steal',
      players: [],
      isLocked: false,
      gameId
    })
    return memo
  }, [])
  await new Promise((resolve, reject) => {
    r.table('timelines').insert(timelines).run(connection, (err, result) => {
      if (err) return reject(err)
      resolve()
    })
  })
  return Promise.resolve()
}

function createTables (connection) {
  return Promise.all(
    config.tables.map(tableName => {
      return new Promise((resolve, reject) => {
        r.tableCreate(tableName).run(connection, () => {
          resolve() // fail silently if the table already exists
        })
      })
    })
  )
}

function createDb (connection) {
  return new Promise((resolve, reject) => {
    r.dbCreate('chronomancer').run(connection, () => {
      resolve() // fail silently if the db already exists
    })
  })
}

async function createGame (connection, gameId) {
  const gameExists = await new Promise((resolve, reject) => {
    r.table('games').filter({gameId}).count().run(connection, (err, result) => {
      if (err) return reject(err)
      resolve(result)
    })
  })
  if (gameExists) return Promise.resolve()
  await new Promise((resolve, reject) => {
    r.table('games').insert({id: gameId}).run(connection, (err, result) => {
      if (err) return reject(err)
      resolve()
    })
  })
  return Promise.resolve()
}

(async function fixtures () {
  try {
    const gameId = Number(process.argv[2])
    const connection = await getConnection()
    await createDb(connection)
    await createTables(connection)
    await createGame(connection, gameId)
    await clearTable('timelines', gameId, connection)
    await clearTable('powers', gameId, connection)
    await addPlayersToGame(gameId, connection)
    await addTimelines(gameId, connection)
    process.exit()
  } catch (e) {
    console.error(e)
  }
})()
