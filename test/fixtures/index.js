'use strict'

const r = require('rethinkdb')
const mockData = require('./mock-data')
let connection

function insertData (name, data, connection) {
  return new Promise((resolve, reject) => {
    r.db('chronomancer').table(name).insert(data).run(connection, (err, result) => {
      if (err) return reject(err)
      resolve()
    })
  })
}

function getConnection () {
  return new Promise((resolve, reject) => {
    if (!connection) {
      r.connect((err, conn) => {
        if (err) return reject(err)
        connection = conn
        resolve(connection)
      })
    } else {
      resolve(connection)
    }
  })
}

function dropDatabase (name, connection) {
  return new Promise((resolve, reject) => {
    r.dbDrop('chronomancer').run(connection, (err, result) => {
      if (err && err.msg !== 'Database `chronomancer` does not exist.') {
        return reject(err)
      }
      resolve(result)
    })
  })
}

function createDatabase (name, connection) {
  return new Promise((resolve, reject) => {
    r.dbCreate('chronomancer').run(connection, (err, result) => {
      if (err) return reject(err)
      resolve(result)
    })
  })
}

function createTable (name, connection) {
  return new Promise((resolve, reject) => {
    r.db('chronomancer').tableCreate(name).run(connection, (err, result) => {
      if (err) return reject(err)
      resolve(result)
    })
  })
}

module.exports = async function fixtures () {
  const tables = [ 'players', 'powers', 'timelines', 'games', 'messages' ]
  const connection = await getConnection()
  await dropDatabase('chronomancer', connection)
  await createDatabase('chronomancer', connection)
  await Promise.all(tables.map(tableName => createTable(tableName, connection)))
  await Promise.all(tables.map(tableName => insertData(tableName, mockData[tableName], connection)))
  return connection
}
