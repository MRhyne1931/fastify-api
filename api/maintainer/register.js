const { MSGS: { ALREADY_EXISTS, INTERNAL_SERVER_ERROR } } = require('../../helpers/constants')

module.exports = async (req, res, ctx) => {
  const { maintainer: { firstName, lastName, email: rawEmail, password, payoutInfo } } = req.body
  const email = rawEmail.toLowerCase()
  try {
    ctx.log.info('registering new maintainer with email %s', email)
    let id
    try {
      id = await ctx.db.maintainer.create({ maintainer: { firstName, lastName, email, password, payoutInfo } })
    } catch (e) {
      if (e.code === 11000) { // Dupe key mongo error code is 11000
        ctx.log.warn('attempt to create maintainer with existing email, rejecting %s', email)
        res.status(409)
        return res.send({
          success: false,
          message: ALREADY_EXISTS
        })
      }
      throw e
    }
    ctx.log.info('sending registration email for newly registered maintainer %s', id)
    const { registrationToken } = await ctx.auth.maintainer.beginRegistration({ email })
    await ctx.email.sendMaintainerActivationEmail(email, registrationToken)
    res.send({ success: true, id })
  } catch (e) {
    ctx.log.error(e)
    res.status(500)
    res.send({ success: false, message: INTERNAL_SERVER_ERROR })
  }
}
