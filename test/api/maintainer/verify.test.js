const test = require('ava')
const { before, beforeEach, afterEach, after } = require('../../_helpers/_setup')

test.before(async (t) => {
  await before(t)
})

test.beforeEach(async (t) => {
  await beforeEach(t)
})

test.afterEach(async (t) => {
  await afterEach(t)
})

test.after(async (t) => {
  await after(t)
})

test('POST `/maintainer/verify` 401 unauthorized', async (t) => {
  await t.context.db.createMaintainer({
    maintainer: {
      name: 'Honesty',
      email: 'honey1@etsy.com',
      password: 'beekeeperbookkeeper'
    }
  })
  await t.context.auth.maintainer.beginRegistration({ email: 'honey1@etsy.com' })
  const res = await t.context.app.inject({
    method: 'POST',
    url: '/maintainer/verify',
    body: { email: 'honey1@etsy.com', token: 'the-wrong-token' }
  })
  t.deepEqual(res.statusCode, 401)
})

test('POST `/maintainer/verify` 200 success', async (t) => {
  const maintainerId = (await t.context.db.createMaintainer({
    maintainer: {
      firstName: 'Honesty',
      lastName: 'Jones',
      email: 'honey2@etsy.com',
      password: 'beekeeperbookkeeper'
    }
  })).toHexString()
  const { registrationToken } = await t.context.auth.maintainer.beginRegistration({ email: 'honey2@etsy.com' })
  const res = await t.context.app.inject({
    method: 'POST',
    url: '/maintainer/verify',
    body: { email: 'honey2@etsy.com', token: registrationToken }
  })
  t.deepEqual(res.statusCode, 200)
  t.deepEqual(JSON.parse(res.payload), { success: true })

  const maintainer = await t.context.db.getMaintainer({ maintainerId })
  t.true(maintainer.verified)
})

test('POST `/maintainer/verify` 200 success | email case does not matter', async (t) => {
  const maintainerId = (await t.context.db.createMaintainer({
    maintainer: {
      firstName: 'Papa',
      lastName: 'John',
      email: 'papa@papajohns.com',
      password: 'pizza4life'
    }
  })).toHexString()
  const { registrationToken } = await t.context.auth.maintainer.beginRegistration({ email: 'papa@papajohns.com' })
  const res = await t.context.app.inject({
    method: 'POST',
    url: '/maintainer/verify',
    body: { email: 'Papa@PapaJohns.COM', token: registrationToken }
  })
  t.deepEqual(res.statusCode, 200)
  t.deepEqual(JSON.parse(res.payload), { success: true })

  const maintainer = await t.context.db.getMaintainer({ maintainerId })
  t.true(maintainer.verified)
})

test('POST `/maintainer/verify` 400 bad request', async (t) => {
  let res = await t.context.app.inject({
    method: 'POST',
    url: '/maintainer/verify',
    body: {}
  })
  t.deepEqual(res.statusCode, 400)

  res = await t.context.app.inject({
    method: 'POST',
    url: '/maintainer/verify',
    body: { email: 'email' }
  })
  t.deepEqual(res.statusCode, 400)

  res = await t.context.app.inject({
    method: 'POST',
    url: '/maintainer/verify',
    body: { token: 'token' }
  })
  t.deepEqual(res.statusCode, 400)
})

test('POST `/maintainer/verify` 500 server error', async (t) => {
  const { db, auth } = t.context
  await db.createMaintainer({
    maintainer: {
      firstName: 'Papa',
      lastName: 'John',
      email: 'papa_113355@papajohns.com',
      password: 'pizza4life'
    }
  })
  const { registrationToken } = await auth.maintainer.beginRegistration({ email: 'papa_113355@papajohns.com' })
  t.context.db.verifyMaintainer = () => { throw new Error() }
  const res = await t.context.app.inject({
    method: 'POST',
    url: '/maintainer/verify',
    body: { email: 'papa_113355@papajohns.com', token: registrationToken }
  })
  t.deepEqual(res.statusCode, 500)
})
