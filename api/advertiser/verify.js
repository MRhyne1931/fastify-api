module.exports = async (req, res, ctx) => {
  const { email: rawEmail, token } = req.body
  const email = rawEmail.toLowerCase()
  try {
    ctx.log.info('verifying advertiser with email %s', email)
    if (!await ctx.auth.advertiser.completeRegistration({ email, token })) {
      ctx.log.warn('attempt to verify advertiser with invalid email or token from %s', email)
      res.status(401)
      return res.send()
    }
    await ctx.db.verifyAdvertiser(email)
    res.send({ success: true })
  } catch (e) {
    ctx.log.error(e)
    res.status(500)
    res.send()
  }
}
