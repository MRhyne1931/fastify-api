const { USER_WEB_SESSION_COOKIE, MSGS: { INTERNAL_SERVER_ERROR } } = require('../../helpers/constants')

module.exports = async (req, res, ctx) => {
  try {
    const { code, state } = req.body
    ctx.log.info('github auth requested with code %s and state %s', code, state)

    let created = false

    /**
     * - Request an access token from gh using the code and state given to us
     * - request user data from gh using the access token
     * - find or create the user given the email
     * - if created, set created flag to return to UI
     * - store the access token on the user
     * - create a web session and return the cookie
     */
    const accessToken = await ctx.github.requestAccessToken({ code, state })
    const { email } = await ctx.github.requestUserData({ accessToken })
    let user = await ctx.db.user.getByEmail({ email })
    if (!user) {
      created = true
      user = await ctx.db.user.create({ email })
    }
    await ctx.db.user.attachAccessToken({ userId: user.id, accessToken })

    const { sessionId, expiration } = await ctx.auth.user.createWebSession({ userId: user.id.toString() })
    res.setCookie(
      USER_WEB_SESSION_COOKIE,
      sessionId,
      { path: '/', expires: new Date(expiration * 1000) }
    )
    res.send({ success: true, user, created })
  } catch (e) {
    ctx.log.error(e)
    res.status(500)
    res.send({ success: false, message: INTERNAL_SERVER_ERROR })
  }
}