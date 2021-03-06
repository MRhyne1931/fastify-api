const test = require('ava')
const sinon = require('sinon')
const { before, beforeEach, afterEach, after } = require('../../_helpers/_setup')
const { USER_WEB_SESSION_COOKIE, MSGS: { NO_DONATION } } = require('../../../helpers/constants')

test.before(async (t) => {
  await before(t, async ({ db, auth }) => {
    sinon.stub(Date, 'now').returns(1234)
    const { id: userId1 } = await db.user.create({ email: 'honey@etsy.com' })
    t.context.userId1 = userId1.toHexString()
    await db.user.updateCustomerId({ userId: t.context.userId1, customerId: 'honesty-cust-id' })
    await db.user.updateHasCardInfo({ userId: t.context.userId1, last4: '2222' })
    await db.user.setDonation({ userId: t.context.userId1, amount: 500 })

    const sessionWithDonation = await auth.user.createWebSession({ userId: t.context.userId1 })
    t.context.sessionWithDonation = sessionWithDonation.sessionId

    // no donation
    const { id: userId2 } = await db.user.create({ email: 'papa@papajohns.com' })
    t.context.userId2 = userId2.toHexString()
    await db.user.updateCustomerId({ userId: t.context.userId2, customerId: 'honesty-cust-id-2' })
    await db.user.updateHasCardInfo({ userId: t.context.userId2, last4: '2222' })

    const sessionWithoutDonation = await auth.user.createWebSession({ userId: t.context.userId2 })
    t.context.sessionWithoutDonation = sessionWithoutDonation.sessionId

    // User that receives an error
    const { id: userId3 } = await db.user.create({ email: 'black@pick.com' })
    t.context.userId3 = userId3.toHexString()
    await db.user.updateCustomerId({ userId: t.context.userId3, customerId: 'honesty-cust-id-3' })
    await db.user.updateHasCardInfo({ userId: t.context.userId3, last4: '2222' })
    await db.user.setDonation({ userId: t.context.userId3, amount: 1500 })

    const sessionWithError = await auth.user.createWebSession({ userId: t.context.userId3 })
    t.context.sessionWithError = sessionWithError.sessionId

    // User with no customer id
    const { id: userId4 } = await db.user.create({ email: 'white@pick.com' })
    t.context.userId4 = userId4.toHexString()
    await db.user.setDonation({ userId: t.context.userId4, amount: 1500 })

    const sessionWithoutCustomerId = await auth.user.createWebSession({ userId: t.context.userId4 })
    t.context.sessionWithoutCustomerId = sessionWithoutCustomerId.sessionId
  })
})

test.beforeEach(async (t) => {
  await beforeEach(t)
})

test.afterEach(async (t) => {
  await afterEach(t)
})

test.after.always(async (t) => {
  await after(t)
})

test('DELETE `/user/donation` 401 unauthorized', async (t) => {
  const res = await t.context.app.inject({
    method: 'DELETE',
    url: '/user/donation',
    headers: {
      cookie: `${USER_WEB_SESSION_COOKIE}=not_a_gr8_cookie`
    }
  })
  t.deepEqual(res.statusCode, 401)
})

test('DELETE `/user/donation` 200 success', async (t) => {
  const res = await t.context.app.inject({
    method: 'DELETE',
    url: '/user/donation',
    headers: {
      cookie: `${USER_WEB_SESSION_COOKIE}=${t.context.sessionWithDonation}`
    }
  })
  t.deepEqual(res.statusCode, 200)
  t.deepEqual(JSON.parse(res.payload), { success: true })

  const user = await t.context.db.user.get({ userId: t.context.userId1 })
  t.deepEqual(user.optOutOfAds, false)
  t.deepEqual(user.billingInfo.monthlyDonation, false)
  // Billing info should not have changed
  t.deepEqual(user.billingInfo.customerId, 'honesty-cust-id')
  t.deepEqual(user.billingInfo.last4, '2222')

  const userApiKey = await t.context.auth.user.getApiKey({ apiKey: user.apiKey })
  t.deepEqual(userApiKey.noAds, false)

  const donationLedgerAddition = user.billingInfo.donationChanges.find(el => el.donationAmount === 0)
  t.true(donationLedgerAddition.timestamp === 1234)
  t.true(t.context.stripe.deleteDonation.calledWith({ customerId: user.billingInfo.customerId }))
})

test('DELETE `/user/donation` 404 error | donation not found', async (t) => {
  const res = await t.context.app.inject({
    method: 'DELETE',
    url: '/user/donation',
    payload: { amount: 900 },
    headers: {
      cookie: `${USER_WEB_SESSION_COOKIE}=${t.context.sessionWithoutDonation}`
    }
  })
  t.deepEqual(res.statusCode, 404)
  t.deepEqual(JSON.parse(res.payload), { success: false, message: NO_DONATION })

  const user = await t.context.db.user.get({ userId: t.context.userId2 })
  const userApiKey = await t.context.auth.user.getApiKey({ apiKey: user.apiKey })
  t.deepEqual(userApiKey, undefined)
  t.true(t.context.stripe.deleteDonation.notCalled)
})

test('DELETE `/user/donation` Error thrown when no customer id', async (t) => {
  const res = await t.context.app.inject({
    method: 'DELETE',
    url: '/user/donation',
    headers: {
      cookie: `${USER_WEB_SESSION_COOKIE}=${t.context.sessionWithoutCustomerId}`
    }
  })
  t.deepEqual(res.statusCode, 500)
})

test('DELETE `/user/donation` 500 server error', async (t) => {
  t.context.db.user.setDonation = () => { throw new Error() }
  const res = await t.context.app.inject({
    method: 'DELETE',
    url: '/user/donation',
    headers: {
      cookie: `${USER_WEB_SESSION_COOKIE}=${t.context.sessionWithError}`
    }
  })
  t.deepEqual(res.statusCode, 500)
})
