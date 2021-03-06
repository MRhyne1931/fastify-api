class UserAuthController {
  constructor ({ docs, config, common }) {
    this.constants = config.getAuthConfig().User
    this.docs = docs
    this.common = common
    this.config = config
  }

  /* <cli session> */
  async cacheApiKey ({ apiKey, userId }) {
    return this.docs.put({
      TableName: this.constants.USER_API_KEY_TABLE,
      Item: { apiKey, created: Date.now(), id: userId }
    }).promise()
  }

  async cacheApiKeyNoAdsSetting ({ apiKey, noAds }) {
    return this.docs.update({
      TableName: this.constants.USER_API_KEY_TABLE,
      Key: { apiKey },
      UpdateExpression: 'SET noAds = :noAds',
      ExpressionAttributeValues: { ':noAds': noAds }
    }).promise()
  }

  async getApiKey ({ apiKey }) {
    if (!apiKey) { return null }
    try {
      const { Item } = await this.docs.get({
        TableName: this.constants.USER_API_KEY_TABLE,
        Key: { apiKey }
      }).promise()
      return Item
    } catch (e) {
      console.error(e)
      return null
    }
  }

  async createCliSession ({ apiKey }) {
    const sessionId = this.common.generateRandomToken()
    const expiration = this.common.getUnixTimestampPlus(this.constants.USER_CLI_SESSION_TIMEOUT)
    const sessionItem = { sessionId, apiKey, created: Date.now(), expiration }
    await this.docs.put({
      TableName: this.constants.USER_CLI_SESSION_TABLE,
      Item: sessionItem
    }).promise()
    return sessionId
  }
  /* </cli session> */

  /* <web session> */
  async createWebSession ({ userId }) {
    const sessionId = this.common.generateRandomToken()
    const sessionItem = {
      sessionId,
      userId,
      expiration: this.common.getUnixTimestampPlus(this.constants.USER_WEB_SESSION_TIMEOUT)
    }
    await this.docs.put({
      TableName: this.constants.USER_WEB_SESSION_TABLE,
      Item: sessionItem
    }).promise()
    return sessionItem
  }

  async getWebSession ({ sessionId }) {
    return this.common.getAndUpdateWebSession({
      tableName: this.constants.USER_WEB_SESSION_TABLE,
      sessionId,
      expirationIncrementSeconds: this.constants.USER_WEB_SESSION_TIMEOUT
    })
  }

  async deleteWebSession ({ sessionId }) {
    return sessionId && this.docs.delete({
      TableName: this.constants.USER_WEB_SESSION_TABLE,
      Key: { sessionId }
    }).promise()
  }
  /* /web session> */

  /* <registration> */
  async beginRegistration ({ email, referralCode }) {
    const registrationToken = this.common.generateRandomToken()
    const expiration = this.common.getUnixTimestampPlus(this.constants.USER_REGISTRATION_TIMEOUT)

    await this.docs.put({
      TableName: this.constants.USER_REGISTRATION_TABLE,
      Item: { email, registrationToken, referralCode: referralCode || undefined, expiration }
    }).promise()

    return { registrationToken }
  }

  async validateRegistration ({ email, registrationToken, recaptchaResponse }) {
    let row
    try {
      const { Attributes } = await this.docs.delete({
        TableName: this.constants.USER_REGISTRATION_TABLE,
        Key: { email },
        ConditionExpression: 'registrationToken = :registrationToken',
        ExpressionAttributeValues: { ':registrationToken': registrationToken },
        ReturnValues: 'ALL_OLD'
      }).promise()
      row = Attributes
    } catch (e) {
      if (e.code === 'ConditionalCheckFailedException') {
        // this means the reg token didn't match
        return { valid: false }
      }
      throw e
    }

    if (!await this.common.isRecaptchaResponseValid({ recaptchaResponse })) {
      return { valid: false }
    }

    const { referralCode } = row || {}
    return { valid: true, referralCode }
  }
  /* </registration> */

  /* <install tokens> */
  async setInstallApiKey ({ apiKey }) {
    const token = this.common.generateEasyTokenString()
    const expiration = this.common.getUnixTimestampPlus(this.constants.USER_INSTALL_TIMEOUT)
    await this.docs.put({
      TableName: this.constants.USER_INSTALL_TABLE,
      Item: { token, apiKey, expiration }
    }).promise()

    return token
  }

  async getInstallApiKey ({ token }) {
    try {
      const { Attributes } = await this.docs.delete({
        TableName: this.constants.USER_INSTALL_TABLE,
        Key: { token },
        ConditionExpression: 'expiration >= :now',
        ExpressionAttributeValues: { ':now': Date.now() / 1000 },
        ReturnValues: 'ALL_OLD'
      }).promise()
      return Attributes && Attributes.apiKey
    } catch (e) {
      if (e.code === 'ConditionalCheckFailedException') {
        return null
      }
      throw e
    }
  }
  /* </install tokens> */

  /* <authentication> */
  async beginAuthentication ({ userId }) {
    const magicLinkParams = await this.common.generateMagicLinkParams()

    const loginItem = {
      token: magicLinkParams.token,
      userId: userId.toString(),
      expiration: this.common.getUnixTimestampPlus(this.constants.USER_LOGIN_TIMEOUT)
    }
    await this.docs.put({
      TableName: this.constants.USER_LOGIN_TOKEN_TABLE,
      Item: loginItem
    }).promise()

    return magicLinkParams
  }

  async completeAuthentication ({ userId, token }) {
    try {
      await this.docs.delete({
        TableName: this.constants.USER_LOGIN_TOKEN_TABLE,
        Key: { token },
        ConditionExpression: 'userId = :userId AND expiration >= :now',
        ExpressionAttributeValues: {
          ':userId': userId.toString(),
          ':now': Date.now() / 1000
        }
      }).promise()
      return { success: true }
    } catch (e) {
      if (e.code === 'ConditionalCheckFailedException') {
        return { success: false }
      }
      throw e
    }
  }
  /* </authentication> */
}

module.exports = UserAuthController
