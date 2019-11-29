// Ads
const createAd = require('../api/ad/create')
const getAllAds = require('../api/ad/get-all')
const getAd = require('../api/ad/get')
const updateAd = require('../api/ad/update')

// Ad Campaigns
const createAdCampaign = require('../api/adCampaign/create')
const updateAdCampaign = require('../api/adCampaign/update')

// Advertiser
const createAdvertiser = require('../api/advertiser/create')
const getAdvertiser = require('../api/advertiser/get')
const loginAdvertiser = require('../api/advertiser/login')
const logoutAdvertiser = require('../api/advertiser/logout')
const updateAdvertiser = require('../api/advertiser/update')

// Auth
const sendAuth = require('../api/auth/send')
const validateCaptcha = require('../api/auth/validate-captcha')
const validateEmail = require('../api/auth/validate-email')

// Maintainer
const createMaintainer = require('../api/maintainer/create')
const loginMaintainer = require('../api/maintainer/login')
const logoutMaintainer = require('../api/maintainer/logout')
const registerMaintainer = require('../api/maintainer/register')
const maintainerRevenue = require('../api/maintainer/revenue')
const updateMaintainer = require('../api/maintainer/update')
const verifyMaintainer = require('../api/maintainer/verify')

// Npm
const getNpmPackages = require('../api/maintainer/npm/get')

// Packages
const getMaintainerPackages = require('../api/maintainer/packages/get')
const refreshMaintainerPackages = require('../api/maintainer/packages/refresh')
const updateMaintainerPackages = require('../api/maintainer/packages/update')

// Session
const completeSession = require('../api/session/complete')

async function routes (fastify, opts, next) {
  // Ads
  fastify.post('/ad/create', (req, res) => createAd(req, res, fastify))
  fastify.get('/ad/get-all', (req, res) => getAllAds(req, res, fastify))
  fastify.get('/ad/get', (req, res) => getAd(req, res, fastify))
  fastify.post('/ad/update', (req, res) => updateAd(req, res, fastify))

  // Ad Campaigns
  fastify.post('/adCampaign/create', (req, res) => createAdCampaign(req, res, fastify))
  fastify.post('/adCampaign/update', (req, res) => updateAdCampaign(req, res, fastify))

  // Advertiser
  fastify.post('/advertiser/create', (req, res) => createAdvertiser(req, res, fastify))
  fastify.get('/advertiser/get', (req, res) => getAdvertiser(req, res, fastify))
  fastify.post('/advertiser/login', (req, res) => loginAdvertiser(req, res, fastify))
  fastify.get('/advertiser/logout', (req, res) => logoutAdvertiser(req, res, fastify))
  fastify.post('/advertiser/update', (req, res) => updateAdvertiser(req, res, fastify))

  // Auth
  fastify.post('/auth/send', (req, res) => sendAuth(req, res, fastify))
  fastify.post('/auth/validateCaptcha', (req, res) => validateCaptcha(req, res, fastify))
  fastify.post('/auth/validateEmail', (req, res) => validateEmail(req, res, fastify))

  // Maintainer
  fastify.post('/maintainer/create', (req, res) => createMaintainer(req, res, fastify))
  fastify.post('/maintainer/login', (req, res) => loginMaintainer(req, res, fastify))
  fastify.get('/maintainer/logout', (req, res) => logoutMaintainer(req, res, fastify))
  fastify.post('/maintainer/register', (req, res) => registerMaintainer(req, res, fastify))
  fastify.get('/maintainer/revenue', (req, res) => maintainerRevenue(req, res, fastify))
  fastify.post('/maintainer/update', (req, res) => updateMaintainer(req, res, fastify))
  fastify.get('/maintainer/verify', (req, res) => verifyMaintainer(req, res, fastify))

  // Npm
  fastify.get('/maintainer/npm/get', (req, res) => getNpmPackages(req, res, fastify))

  // Packages
  fastify.get('/maintainer/packages/get', (req, res) => getMaintainerPackages(req, res, fastify))
  fastify.post('/maintainer/packages/refresh', (req, res) => refreshMaintainerPackages(req, res, fastify))
  fastify.post('/maintainer/packages/update', (req, res) => updateMaintainerPackages(req, res, fastify))

  // Session
  fastify.post('/session/complete', (req, res) => completeSession(req, res, fastify))

  next()
}

module.exports = routes
