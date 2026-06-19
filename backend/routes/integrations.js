const express = require('express')
const router = express.Router()
const { requireAuth } = require('../middleware/auth')
const { getOrgId } = require('../utils/getOrg')
const { syncGA4ForClient } = require('../services/ga4Fetcher')
const {
  connectGoogle,
  googleCallback,
  getIntegrations,
  disconnectIntegration
} = require('../controllers/integrationController')

router.get('/google/connect/:clientId', requireAuth, connectGoogle)
router.get('/google/callback', googleCallback)
router.get('/client/:clientId', requireAuth, getIntegrations)
router.delete('/:integrationId', requireAuth, disconnectIntegration)

router.post('/sync/ga4/:clientId', requireAuth, async (req, res) => {
  try {
    const { clientId } = req.params
    const { propertyId } = req.body
    const orgId = await getOrgId(req.userId)

    if (!propertyId) {
      return res.status(400).json({ 
        error: 'Google Analytics Property ID is required' 
      })
    }

    const data = await syncGA4ForClient(clientId, orgId, propertyId)
    res.json({ 
      message: 'GA4 data synced successfully',
      data 
    })

  } catch (error) {
    console.error('Sync error:', error)
    res.status(500).json({ 
      error: 'Failed to sync GA4 data',
      details: error.message 
    })
  }
})

module.exports = router