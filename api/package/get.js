module.exports = async (req, res, ctx) => {
  try {
    ctx.log.info('getting owned packages for maintainer %s', req.session.maintainerId)
    res.send({
      success: true,
      packages: await ctx.db.getOwnedPackages({ maintainerId: req.session.maintainerId })
    })
  } catch (e) {
    ctx.log.error(e)
    res.status(500)
    res.send()
  }
}
