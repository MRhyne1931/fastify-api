const { ADVERTISER_WEB_SESSION_COOKIE, MSGS: { INTERNAL_SERVER_ERROR, INVALID_SESSION } } = require('../helpers/constants')

module.exports = async (req, res, ctx) => {
  try {
    const session = await ctx.auth.advertiser.getWebSession({
      sessionId: req.cookies[ADVERTISER_WEB_SESSION_COOKIE]
    })
    if (!session) {
      ctx.log.warn('attempt to access authenticated advertiser route without valid session')
      res.status(401)
      return res.send({ success: false, message: INVALID_SESSION })
    }
    req.session = session
  } catch (e) {
    ctx.log.error(e)
    res.status(500)
    return res.send({ success: false, message: INTERNAL_SERVER_ERROR })
  }
}
