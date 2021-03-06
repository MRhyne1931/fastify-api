const test = require('ava')

test('stub', (t) => {
  t.true(true)
})

// const { before, beforeEach, afterEach, after } = require('../../_helpers/_setup')
// const { MSGS, ADVERTISER_WEB_SESSION_COOKIE } = require('../../../helpers/constants')

// test.before(async (t) => {
//   await before(t, async ({ db, auth }) => {
//     const advertiserId1 = await db.advertiser.create({
//       advertiser: {
//         name: 'Honesty',
//         email: 'honey@etsy.com',
//         password: 'beekeeperbookkeeper'
//       }
//     })
//     t.context.advertiserId1 = advertiserId1.toHexString()
//     const session = await auth.advertiser.createWebSession({ advertiserId: t.context.advertiserId1 })
//     t.context.sessionId = session.sessionId
//   })
// })

// test.beforeEach(async (t) => {
//   await beforeEach(t)
// })

// test.afterEach(async (t) => {
//   await afterEach(t)
// })

// test.after.always(async (t) => {
//   await after(t)
// })

// test('POST `/ad/create` 401 unauthorized | no session', async (t) => {
//   const res = await t.context.app.inject({
//     method: 'POST',
//     url: '/ad/create',
//     payload: {
//       name: 'add 1',
//       title: 'halp',
//       body: 'dov with',
//       url: 'the puzzle'
//     },
//     headers: {
//       cookie: `${ADVERTISER_WEB_SESSION_COOKIE}=not_a_gr8_cookie`
//     }
//   })
//   t.deepEqual(res.statusCode, 401)
// })

// test('POST `/ad/create` 200 success', async (t) => {
//   const adToCreate = {
//     name: 'add 1',
//     title: 'halp',
//     body: 'dov with',
//     url: 'the puzzle'
//   }
//   const res = await t.context.app.inject({
//     method: 'POST',
//     url: '/ad/create',
//     payload: adToCreate,
//     headers: {
//       cookie: `${ADVERTISER_WEB_SESSION_COOKIE}=${t.context.sessionId}`
//     }
//   })
//   t.deepEqual(res.statusCode, 200)
//   const payload = JSON.parse(res.payload)

//   t.deepEqual(payload.success, true)
//   const { id } = payload
//   const createdAd = Object.assign({}, adToCreate, { id })
//   const advertiser = await t.context.db.advertiser.get({ advertiserId: t.context.advertiserId1 })
//   t.deepEqual(advertiser.adDrafts.length, 1)
//   t.deepEqual(advertiser.adDrafts[0], createdAd)
// })

// test('POST `/ad/create` 400 bad request | trash ads', async (t) => {
//   const res = await t.context.app.inject({
//     method: 'POST',
//     url: '/ad/create',
//     payload: {
//       name: 'hello',
//       body: 'a\n\nbc',
//       title: 'ABC',
//       url: 'https://abc.com'
//     },
//     headers: {
//       cookie: `${ADVERTISER_WEB_SESSION_COOKIE}=${t.context.sessionId}`
//     }
//   })
//   t.deepEqual(res.statusCode, 400)
//   t.deepEqual(JSON.parse(res.payload), { success: false, message: MSGS.AD_NOT_CLEAN })
// })

// test('POST `/ad/create` 400 bad request', async (t) => {
//   let res
//   res = await t.context.app.inject({
//     method: 'POST',
//     url: '/ad/create',
//     payload: {
//       name: 'camp ad'
//     },
//     headers: {
//       cookie: `${ADVERTISER_WEB_SESSION_COOKIE}=${t.context.sessionId}`
//     }
//   })
//   t.deepEqual(res.statusCode, 400)

//   res = await t.context.app.inject({
//     method: 'POST',
//     url: '/ad/create',
//     payload: {
//       name: 'ad poop',
//       title: 'poop'
//     },
//     headers: { authorization: 'valid-session-token' }
//   })
//   t.deepEqual(res.statusCode, 400)

//   res = await t.context.app.inject({
//     method: 'POST',
//     url: '/ad/create',
//     payload: {
//       name: 'ad dump',
//       title: 'shoes',
//       body: 'argh'
//     },
//     headers: { authorization: 'valid-session-token' }
//   })
//   t.deepEqual(res.statusCode, 400)

//   res = await t.context.app.inject({
//     method: 'POST',
//     url: '/ad/create',
//     payload: {
//       name: 'ad dump',
//       title: 'shoes',
//       url: 'argh url'
//     },
//     headers: { authorization: 'valid-session-token' }
//   })
//   t.deepEqual(res.statusCode, 400)

//   res = await t.context.app.inject({
//     method: 'POST',
//     url: '/ad/create',
//     payload: {},
//     headers: { authorization: 'valid-session-token' }
//   })
//   t.deepEqual(res.statusCode, 400)
// })

// test('POST `/ad/create` 500 server error', async (t) => {
//   t.context.db.advertiser.createAdDraft = () => { throw new Error() }
//   const res = await t.context.app.inject({
//     method: 'POST',
//     url: '/ad/create',
//     payload: {
//       name: 'ad dump',
//       title: 'shoes',
//       body: 'valid',
//       url: 'argh url'
//     },
//     headers: {
//       cookie: `${ADVERTISER_WEB_SESSION_COOKIE}=${t.context.sessionId}`
//     }
//   })
//   t.deepEqual(res.statusCode, 500)
// })
