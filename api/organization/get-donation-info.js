const { MSGS: { INTERNAL_SERVER_ERROR } } = require('../../helpers/constants')

module.exports = async (req, res, ctx) => {
  try {
    /**
     * - Ensure org has a donation and a stripe customer id
     * - Fetch donation info from stripe
     */

    const { organizationId } = req.query
    ctx.log.info('fetching donation info for %s', organizationId)
    const org = await ctx.db.organization.get({ orgId: organizationId })

    if (!org || !org.billingInfo.customerId) {
      res.status(404)
      return res.send({ success: false })
    }

    const donationInfo = await ctx.stripe.getStripeCustomerDonationInfo({
      customerId: org.billingInfo.customerId
    })
    const charges = await ctx.stripe.getStripeCustomerAllTransactions({
      customerId: org.billingInfo.customerId
    })
    const totalDonated = charges.reduce((acc, charge) => {
      return acc + charge.amount_captured
    }, 0)
    donationInfo.totalDonated = totalDonated
    res.send({ success: true, donationInfo })
  } catch (e) {
    ctx.log.error(e)
    res.status(500)
    res.send({ success: false, message: INTERNAL_SERVER_ERROR })
  }
}
