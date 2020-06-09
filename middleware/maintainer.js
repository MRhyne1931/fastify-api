const { MAINTAINER_WEB_SESSION_COOKIE } = require('../helpers/constants')

module.exports = async (req, res, ctx) => {
  try {
    const session = await ctx.auth.maintainer.getWebSession({
      sessionId: (req.cookies || {})[MAINTAINER_WEB_SESSION_COOKIE]
    })
    if (!session) {
      ctx.log.warn('attempt to access authenticated maintainer route without valid session')
      res.status(401)
      return res.send({ success: false, message: 'Invalid session' })
    }
    req.session = session
  } catch (e) {
    ctx.log.error(e)
    res.status(500)
    res.send({ success: false, message: 'Internal server error' })
  }
}
