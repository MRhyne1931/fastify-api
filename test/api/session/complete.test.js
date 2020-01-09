const test = require('ava')
const { before, beforeEach, afterEach, after } = require('../../helpers/_setup')

test.before(async (t) => {
  await before(t, () => {})
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

test('POST `/session/complete` 401 unauthorized', async (t) => {
  t.context.auth.isAdSessionAllowed.resolves(false)
  const res = await t.context.app.inject({
    method: 'POST',
    url: '/session/complete',
    payload: { seen: [], sessionId: 'session-id' },
    headers: { authorization: 'not a valid token' }
  })
  t.deepEqual(res.statusCode, 401)
})

test('POST `/session/complete` 400 bad request', async (t) => {
  let res
  res = await t.context.app.inject({
    method: 'POST',
    url: '/session/complete',
    payload: { sessionId: 'session-id' },
    headers: { authorization: 'valid-api-key' }
  })
  t.deepEqual(res.statusCode, 400)

  res = await t.context.app.inject({
    method: 'POST',
    url: '/session/complete',
    payload: { seen: [] },
    headers: { authorization: 'valid-api-key' }
  })
  t.deepEqual(res.statusCode, 400)
})

test('POST `/session/complete` 200 success', async (t) => {
  const res = await t.context.app.inject({
    method: 'POST',
    url: '/session/complete',
    payload: { seen: [], sessionId: 'session-id' },
    headers: { authorization: 'valid-api-key' }
  })
  t.deepEqual(res.statusCode, 200)
})

test('POST `/session/complete` 500 server error', async (t) => {
  t.context.sqs.sendMessage.throws()
  const res = await t.context.app.inject({
    method: 'POST',
    url: '/session/complete',
    payload: { seen: [], sessionId: 'session-id' },
    headers: { authorization: 'valid-api-key' }
  })
  t.deepEqual(res.statusCode, 500)
})
