const test = require('ava')

test('stub', (t) => {
  t.true(true)
})

// const { before, beforeEach, afterEach, after } = require('../../_helpers/_setup')
// const { MAINTAINER_WEB_SESSION_COOKIE } = require('../../../helpers/constants')

// test.before(async (t) => {
//   await before(t, async ({ db, auth }) => {
//     const maintainerId1 = await db.maintainer.create({
//       maintainer: {
//         firstName: 'Honesty',
//         lastName: 'Honor',
//         email: 'honey@etsy.com',
//         password: 'beekeeperbookkeeper',
//         payoutInfo: 'honey@booboo.com'
//       }
//     })
//     t.context.maintainerId1 = maintainerId1.toHexString()
//     const session = await auth.maintainer.createWebSession({ maintainerId: t.context.maintainerId1 })
//     t.context.sessionId = session.sessionId
//     await db.maintainer.verify({ email: 'honey@etsy.com' })

//     const unverifiedMaintainerId = await db.maintainer.create({
//       maintainer: {
//         firstName: 'Honesty2',
//         lastName: 'Honor',
//         email: 'honey2@etsy.com',
//         password: 'beekeeperbookkeeper',
//         payoutInfo: 'honey2@booboo.com'
//       }
//     })
//     t.context.unverifiedMaintainerId = unverifiedMaintainerId.toHexString()
//     const unverifiedSession = await auth.maintainer.createWebSession({ maintainerId: t.context.unverifiedMaintainerId })
//     t.context.unverifiedSession = unverifiedSession.sessionId
//   })
// })

// test.beforeEach(async (t) => {
//   await beforeEach(t)
// })

// test.afterEach(async (t) => {
//   await afterEach(t)
// })

// test.after(async (t) => {
//   await after(t)
// })

// test('GET `/maintainer/get` 401 unauthorized', async (t) => {
//   const res = await t.context.app.inject({
//     method: 'GET',
//     url: '/maintainer/get',
//     headers: {
//       cookie: `${MAINTAINER_WEB_SESSION_COOKIE}=not_a_gr8_cookie`
//     }
//   })
//   t.deepEqual(res.statusCode, 401)
// })

// test('GET `/maintainer/get` 400 | unverified', async (t) => {
//   const res = await t.context.app.inject({
//     method: 'GET',
//     url: '/maintainer/get',
//     headers: {
//       cookie: `${MAINTAINER_WEB_SESSION_COOKIE}=${t.context.unverifiedSession}`
//     }
//   })
//   t.deepEqual(res.statusCode, 400)
// })

// test('GET `/maintainer/get` 200 success', async (t) => {
//   const res = await t.context.app.inject({
//     method: 'GET',
//     url: '/maintainer/get',
//     headers: {
//       cookie: `${MAINTAINER_WEB_SESSION_COOKIE}=${t.context.sessionId}`
//     }
//   })
//   t.deepEqual(res.statusCode, 200)
//   t.deepEqual(JSON.parse(res.payload), {
//     success: true,
//     maintainer: {
//       id: t.context.maintainerId1,
//       firstName: 'Honesty',
//       lastName: 'Honor',
//       email: 'honey@etsy.com',
//       payoutInfo: 'honey@booboo.com',
//       active: true,
//       verified: true
//     }
//   })
// })

// test('GET `/maintainer/get` 500 server error', async (t) => {
//   t.context.db.maintainer.get = () => { throw new Error() }
//   const res = await t.context.app.inject({
//     method: 'GET',
//     url: '/maintainer/get',
//     headers: {
//       cookie: `${MAINTAINER_WEB_SESSION_COOKIE}=${t.context.sessionId}`
//     }
//   })
//   t.deepEqual(res.statusCode, 500)
// })
