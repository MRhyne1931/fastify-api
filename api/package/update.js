const { MSGS: { INTERNAL_SERVER_ERROR } } = require('../../helpers/constants')

module.exports = async (req, res, ctx) => {
  const { packageId, maintainers, owner } = req.body
  try {
    ctx.log.info('updating package information for package %s', packageId)
    // Only the owner can make a change to a package
    // Fetch package to check if maintainer making request is the owner
    const pkg = await ctx.db.package.get({ packageId })

    if (!pkg || !pkg.id) {
      ctx.log.warn('attempt to update package information for non-existent package id %s', packageId)
      res.status(400)
      return res.send({ success: false })
    }
    if (pkg.owner !== req.session.maintainerId) {
      ctx.log.warn('attempt to update package information from non-owner: %s', req.session.maintainerId)
      res.status(401)
      return res.send({ success: false })
    }

    await ctx.db.package.update({ packageId, maintainers, owner })
    res.send({ success: true })
  } catch (e) {
    ctx.log.error(e)
    res.status(500)
    res.send({ success: false, message: INTERNAL_SERVER_ERROR })
  }
}
