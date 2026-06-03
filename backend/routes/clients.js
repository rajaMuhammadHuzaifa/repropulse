const express = require('express')
const router = express.Router()
const { requireAuth } = require('../middleware/auth')
const clientController = require('../controllers/clientController')

router.get('/', requireAuth, clientController.getClients)
router.post('/', requireAuth, clientController.createClient)
router.get('/:id', requireAuth, clientController.getClient)
router.put('/:id', requireAuth, clientController.updateClient)
router.delete('/:id', requireAuth, clientController.deleteClient)

module.exports = router