const prisma = require('../config/prisma')
const { getOrgId } = require('../utils/getOrg')
const { getAuthUrl, getTokensFromCode } = require('../services/googleAuth')

const connectGoogle = async (req, res) => {
  try {
    const { clientId } = req.params
    const orgId = await getOrgId(req.userId)

    const client = await prisma.client.findFirst({
      where: { id: clientId, orgId }
    })

    if (!client) {
      return res.status(404).json({ error: 'Client not found' })
    }

    const authUrl = getAuthUrl(clientId)
    res.json({ authUrl })

  } catch (error) {
    console.error('Connect Google error:', error)
    res.status(500).json({ error: 'Failed to generate auth URL' })
  }
}

const googleCallback = async (req, res) => {
  try {
    const { code, state: clientId, error } = req.query

    if (error) {
      return res.redirect(
        `${process.env.FRONTEND_URL}/clients?error=google_auth_failed`
      )
    }

    if (!code || !clientId) {
      return res.redirect(
        `${process.env.FRONTEND_URL}/clients?error=missing_params`
      )
    }

    const tokens = await getTokensFromCode(code)

    const client = await prisma.client.findUnique({
      where: { id: clientId }
    })

    if (!client) {
      return res.redirect(
        `${process.env.FRONTEND_URL}/clients?error=client_not_found`
      )
    }

    const existingIntegration = await prisma.integration.findFirst({
      where: { clientId, type: 'GOOGLE_ANALYTICS' }
    })

    if (existingIntegration) {
      await prisma.integration.update({
  where: { id: existingIntegration.id },
  data: {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token || existingIntegration.refreshToken,
    tokenExpiry: tokens.expiry_date
      ? new Date(tokens.expiry_date)
      : null,
    status: 'connected'
  }
})
    } else {
      await prisma.integration.create({
  data: {
    clientId,
    orgId: client.orgId,
    type: 'GOOGLE_ANALYTICS',
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    tokenExpiry: tokens.expiry_date
      ? new Date(tokens.expiry_date)
      : null,
    status: 'connected'
  }
})
    }

    res.redirect(
      `${process.env.FRONTEND_URL}/clients?success=google_connected&clientId=${clientId}`
    )

  } catch (error) {
    console.error('Google callback error:', error)
    res.redirect(
      `${process.env.FRONTEND_URL}/clients?error=callback_failed`
    )
  }
}

const getIntegrations = async (req, res) => {
  try {
    const { clientId } = req.params
    const orgId = await getOrgId(req.userId)

    const client = await prisma.client.findFirst({
      where: { id: clientId, orgId }
    })

    if (!client) {
      return res.status(404).json({ error: 'Client not found' })
    }

    const integrations = await prisma.integration.findMany({
      where: { clientId },
      select: {
  id: true,
  type: true,
  status: true,
  accountName: true,
  createdAt: true
}
    })

    res.json({ integrations })

  } catch (error) {
    console.error('Get integrations error:', error)
    res.status(500).json({ error: 'Failed to fetch integrations' })
  }
}

const disconnectIntegration = async (req, res) => {
  try {
    const { integrationId } = req.params
    const orgId = await getOrgId(req.userId)

    const integration = await prisma.integration.findFirst({
      where: { id: integrationId, orgId }
    })

    if (!integration) {
      return res.status(404).json({ error: 'Integration not found' })
    }

    await prisma.integration.delete({
      where: { id: integrationId }
    })

    res.json({ message: 'Integration disconnected successfully' })

  } catch (error) {
    console.error('Disconnect error:', error)
    res.status(500).json({ error: 'Failed to disconnect integration' })
  }
}

module.exports = {
  connectGoogle,
  googleCallback,
  getIntegrations,
  disconnectIntegration
}