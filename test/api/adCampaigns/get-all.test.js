const test = require('ava')
const { beforeEach, afterEach } = require('../../helpers/_setup')

test.beforeEach(async (t) => {
  await beforeEach(t)
})

test.afterEach(async (t) => {
  await afterEach(t)
})

test.failing('GET `/ad-campaign/get-all` 401 unauthorized', async (t) => {
  const res = await t.context.app.inject({
    method: 'GET',
    url: '/ad/ad-campaign',
    query: { advertiserId: 'advertiser-id' },
    headers: { authorization: 'not a valid token' }
  })
  t.deepEqual(res.statusCode, 401)
})

test('GET `/ad-campaign/get-all` 400 bad request', async (t) => {
  const res = await t.context.app.inject({
    method: 'GET',
    url: '/ad-campaign/get-all',
    query: {},
    headers: { authorization: 'valid-session-token' }
  })
  t.deepEqual(res.statusCode, 400)
})

test('GET `/ad-campaign/get-all` 200 success', async (t) => {
  const res = await t.context.app.inject({
    method: 'GET',
    url: '/ad-campaign/get-all',
    query: { advertiserId: 'advertiser-id-0' },
    headers: { authorization: 'valid-session-token' }
  })
  t.deepEqual(res.statusCode, 200)
  t.deepEqual(JSON.parse(res.payload), {
    adCampaigns: await t.context.db.getAdCampaignsForAdvertiser()
  })
})

test('GET `/ad-campaign/get-all` 500 server error', async (t) => {
  t.context.db.getAdCampaignsForAdvertiser.throws()
  const res = await t.context.app.inject({
    method: 'GET',
    url: '/ad-campaign/get-all',
    query: { advertiserId: 'advertiser-id-0' },
    headers: { authorization: 'valid-session-token' }
  })
  t.deepEqual(res.statusCode, 500)
})
