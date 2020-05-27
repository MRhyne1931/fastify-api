const fastifyPlugin = require('fastify-plugin')

class Config {
  constructor ({ env }) {
    this.env = env
  }

  getAwsConfig () {
    return {
      accessKeyId: this.env.access_key,
      secretAccessKey: this.env.secret_key,
      region: this.env.region
    }
  }

  getAuthConfig () {
    return {
      Advertiser: {
        TableAttributes: [
          { TableName: 'AdvertiserWebSessions', KeyAttribute: { AttributeName: 'sessionId', AttributeType: 'S' } },
          { TableName: 'AdvertiserRegistrationTokens', KeyAttribute: { AttributeName: 'email', AttributeType: 'S' } }
        ],
        ADVERTISER_WEB_SESSION_TABLE: 'AdvertiserWebSessions',
        ADVERTISER_REGISTRATION_TABLE: 'AdvertiserRegistrationTokens',
        ADVERTISER_WEB_SESSION_TIMEOUT: 7 * 24 * 60 * 60, // 7 days in seconds
        ADVERTISER_REGISTRATION_TIMEOUT: 15 * 60 // 15 minutes in seconds
      },
      Maintainer: {
        TableAttributes: [
          { TableName: 'MaintainerWebSessions', KeyAttribute: { AttributeName: 'sessionId', AttributeType: 'S' } },
          { TableName: 'MaintainerRegistrationTokens', KeyAttribute: { AttributeName: 'email', AttributeType: 'S' } }
        ],
        MAINTAINER_WEB_SESSION_TABLE: 'MaintainerWebSessions',
        MAINTAINER_REGISTRATION_TABLE: 'MaintainerRegistrationTokens',
        MAINTAINER_WEB_SESSION_TIMEOUT: 7 * 24 * 60 * 60, // 7 days in seconds
        MAINTAINER_REGISTRATION_TIMEOUT: 15 * 60 // 15 minutes in seconds
      },
      User: {
        TableAttributes: [
          { TableName: 'UserApiKeys', KeyAttribute: { AttributeName: 'apiKey', AttributeType: 'S' } },
          { TableName: 'UserWebSessions', KeyAttribute: { AttributeName: 'sessionId', AttributeType: 'S' } },
          { TableName: 'UserRegistrationTokens', KeyAttribute: { AttributeName: 'email', AttributeType: 'S' } },
          { TableName: 'UserInstallTokens', KeyAttribute: { AttributeName: 'token', AttributeType: 'S' } },
          { TableName: 'UserLoginTokens', KeyAttribute: { AttributeName: 'token', AttributeType: 'S' } },
          { TableName: 'UserCliSessions', KeyAttribute: { AttributeName: 'sessionId', AttributeType: 'S' } }
        ],
        USER_API_KEY_TABLE: 'UserApiKeys',
        USER_CLI_SESSION_TABLE: 'UserCliSessions',
        USER_WEB_SESSION_TABLE: 'UserWebSessions',
        USER_REGISTRATION_TABLE: 'UserRegistrationTokens',
        USER_INSTALL_TABLE: 'UserInstallTokens',
        USER_LOGIN_TOKEN_TABLE: 'UserLoginTokens',
        USER_WEB_SESSION_TIMEOUT: 7 * 24 * 60 * 60, // 7 days in seconds
        USER_REGISTRATION_TIMEOUT: 15 * 60, // 15 minutes in seconds
        USER_INSTALL_TIMEOUT: 24 * 60 * 60, // 24 hrs in seconds
        USER_LOGIN_TIMEOUT: 15 * 60 // 15 minutes in seconds
      }
    }
  }

  getMongoUri () {
    return this.env.mongo_uri
  }

  getRecaptchaSecret () {
    return this.env.recaptcha_secret
  }

  getDistributeDonationQueueUrl () {
    return this.env.distribute_donation_queue_url
  }

  getSessionCompleteQueueUrl () {
    // The || is for backwards compatibility and should be removed
    return this.env.session_complete_queue_url || this.env.queue_url
  }

  getUrlConfig () {
    return {
      TableAttributes: [
        { TableName: 'ShortUrls', KeyAttribute: { AttributeName: 'urlId', AttributeType: 'S' } }
      ],
      URL_HOST: this.env.url_host || 'api.flossbank.io',
      URL_TABLE: 'ShortUrls'
    }
  }

  getStripeToken () {
    return this.env.stripe_token
  }

  getStripeWebhookSecret () {
    return this.env.stripe_webhook_secret
  }

  // Current no ad threshold is $10 bucks
  getNoAdThreshold () {
    return 1000
  }
}

const configPlugin = (config) => fastifyPlugin(async (fastify) => {
  fastify.decorate('config', config)
})

module.exports = { Config, configPlugin }
