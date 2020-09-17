const { ORG_ROLES, MSGS: { INTERNAL_SERVER_ERROR, DONATION_ALREADY_EXISTS, INSUFFICIENT_PERMISSIONS } } = require('../../helpers/constants')

module.exports = async (req, res, ctx) => {
  try {
    const { amount, billingToken, organizationId, globalDonation } = req.body
    ctx.log.info('creation donation for %s organization id for amount %s, token %s', organizationId, amount, billingToken)

    /**
     * - Verify the user has WRITE permissions on the org
     * - Verify a donation doesnt already exist
     * - Create or find the customer id in stripe
     * - Create the subscription in stripe
     * - Update org donation information
     */
    const org = await ctx.db.organization.get({ orgId: organizationId })
    if (!org) {
      res.status(404)
      return res.send({ success: false })
    }

    // If user doesn't have write permissions, return 401
    const userWithWritePerms = org.users.find((user) => {
      return user.userId === req.session.userId && user.role === ORG_ROLES.WRITE
    })
    if (!userWithWritePerms) {
      ctx.log.warn('attempt to create donation for org user doesnt have write perms to')
      res.status(401)
      return res.send({ success: false, message: INSUFFICIENT_PERMISSIONS })
    }
    // If the org already has a donation, return conflict
    if (org.monthlyDonation) {
      res.status(409)
      return res.send({ success: false, message: DONATION_ALREADY_EXISTS })
    }

    let customerId
    if (!org.billingInfo || !org.billingInfo.customerId) {
      // Create stripe customer, and add the stripe customer id to db
      const stripeCustomer = await ctx.stripe.createStripeCustomer({ email: org.email })
      await ctx.db.organization.updateCustomerId({
        orgId: org.id.toString(),
        customerId: stripeCustomer.id
      })

      customerId = stripeCustomer.id
    } else {
      customerId = org.billingInfo.customerId
    }

    // Update the stripe customer with the billing token (stripe CC card token)
    await ctx.stripe.updateStripeCustomer({
      customerId,
      sourceId: billingToken
    })

    // Create the subscription and donation in stripe as well as mongo
    await ctx.stripe.createDonation({ customerId, amount })
    await ctx.db.organization.setDonation({
      orgId: org.id.toString(),
      amount,
      globalDonation
    })

    res.send({ success: true })
  } catch (e) {
    ctx.log.error(e)
    res.status(500)
    res.send({ success: false, message: INTERNAL_SERVER_ERROR })
  }
}