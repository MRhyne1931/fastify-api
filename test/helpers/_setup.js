const { MongoMemoryServer } = require('mongodb-memory-server')
const App = require('../../app')
const { Db } = require('../../db')
const mocks = require('./_mocks')

exports.before = async function (t, insertData) {
  const mongo = new MongoMemoryServer()

  const db = new Db(await mongo.getConnectionString())
  await db.connect()

  await insertData(t, db)

  await db.client.close()

  t.context.mongo = mongo
}

exports.beforeEach = async function (t) {
  t.context.db = new Db(await t.context.mongo.getConnectionString())

  await t.context.db.connect()

  t.context.auth = new mocks.Auth()
  t.context.sqs = new mocks.Sqs()
  t.context.registry = new mocks.Registry()
  t.context.app = await App({
    db: t.context.db,
    auth: t.context.auth,
    sqs: t.context.sqs,
    registry: t.context.registry,
    logger: true
  })
}

exports.afterEach = async function (t) {
  t.context.db.client.close()
  t.context.app.close()
}

exports.after = async function (t) {
  t.context.mongo.stop()
}
