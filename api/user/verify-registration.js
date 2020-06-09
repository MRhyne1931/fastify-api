const { USER_WEB_SESSION_COOKIE } = require('../../helpers/constants')

module.exports = async (req, res, ctx) => {
  try {
    const { email: rawEmail, token: registrationToken, recaptchaResponse } = req.body
    const email = rawEmail.toLowerCase()
    ctx.log.info('verifying user with email %s', email)

    if (!await ctx.auth.user.validateRegistration({ email, registrationToken, recaptchaResponse })) {
      ctx.log.warn('attempt to verify user with invalid email or token from %s', email)
      res.status(401)
      return res.send({ success: false, message: 'Invalid email or token' })
    }

    const user = await ctx.db.user.create({ email })
    await ctx.auth.user.cacheApiKey({ apiKey: user.apiKey, userId: user.id.toString() })

    res.setCookie(
      USER_WEB_SESSION_COOKIE,
      await ctx.auth.user.createWebSession({ userId: user.id.toString() }),
      { path: '/' }
    )

    res.send({ success: true })
  } catch (e) {
    ctx.log.error(e)
    res.status(500)
    res.send({ success: false, message: 'Internal server error' })
  }
}
