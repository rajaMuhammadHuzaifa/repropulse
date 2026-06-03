const express = require('express')
const router = express.Router()
const { requireAuth } = require('../middleware/auth')
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

module.exports = router