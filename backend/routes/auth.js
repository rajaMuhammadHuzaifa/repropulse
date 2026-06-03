const express = require('express')
const router = express.Router()
const { requireAuth } = require('../middleware/auth')
const authController = require('../controllers/authController')

router.post('/sync', requireAuth, authController.syncUser)

module.exports = router