const { MAINTAINER_WEB_SESSION_COOKIE, MSGS: { INTERNAL_SERVER_ERROR } } = require('../../helpers/constants')

module.exports = async (req, res, ctx) => {
  const sessionId = req.cookies[MAINTAINER_WEB_SESSION_COOKIE]
  try {
    ctx.log.info('logging out for session id %s', sessionId)
    await ctx.auth.maintainer.deleteWebSession({ sessionId })
    res.clearCookie(
      MAINTAINER_WEB_SESSION_COOKIE,
      { path: '/' }
    )
    res.send({ success: true })
  } catch (e) {
    ctx.log.error(e)
    res.status(500)
    res.send({ success: false, message: INTERNAL_SERVER_ERROR })
  }
}
