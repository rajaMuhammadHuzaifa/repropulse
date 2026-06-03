const prisma = require('../config/prisma')
const { getOrgId } = require('../utils/getOrg')

const getClients = async (req, res) => {
  try {
    const orgId = await getOrgId(req.userId)

    const clients = await prisma.client.findMany({
      where: { orgId },
      orderBy: { createdAt: 'desc' }
    })

    res.json({ clients })

  } catch (error) {
    console.error('Get clients error:', error)
    res.status(500).json({ error: 'Failed to fetch clients' })
  }
}

const createClient = async (req, res) => {
  try {
    const orgId = await getOrgId(req.userId)
    const { name, email, website, industry } = req.body

    if (!name) {
      return res.status(400).json({ error: 'Client name is required' })
    }

    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      include: { subscription: true, clients: true }
    })

    const clientCount = org.clients.length
    const plan = org.subscription?.plan || 'FREE'

    const limits = { FREE: 3, STARTER: 10, GROWTH: 30, AGENCY: 999 }
    const limit = limits[plan] || 3

    if (clientCount >= limit) {
      return res.status(403).json({
        error: `You have reached the ${plan} plan limit of ${limit} clients. Please upgrade to add more.`
      })
    }

    const client = await prisma.client.create({
      data: {
        name,
        email: email || null,
        website: website || null,
        industry: industry || null,
        orgId,
        }
    })

    res.status(201).json({
      message: 'Client created successfully',
      client
    })

  } catch (error) {
    console.error('Create client error:', error)
    res.status(500).json({ error: 'Failed to create client' })
  }
}

const getClient = async (req, res) => {
  try {
    const orgId = await getOrgId(req.userId)
    const { id } = req.params

    const client = await prisma.client.findFirst({
      where: { id, orgId }
    })

    if (!client) {
      return res.status(404).json({ error: 'Client not found' })
    }

    res.json({ client })

  } catch (error) {
    console.error('Get client error:', error)
    res.status(500).json({ error: 'Failed to fetch client' })
  }
}

const updateClient = async (req, res) => {
  try {
    const orgId = await getOrgId(req.userId)
    const { id } = req.params
    const { name, email, website, industry } = req.body

    const existing = await prisma.client.findFirst({
      where: { id, orgId }
    })

    if (!existing) {
      return res.status(404).json({ error: 'Client not found' })
    }

    const client = await prisma.client.update({
      where: { id },
      data: {
        name: name || existing.name,
        email: email !== undefined ? email : existing.email,
        website: website !== undefined ? website : existing.website,
        industry: industry !== undefined ? industry : existing.industry,
      }
    })

    res.json({
      message: 'Client updated successfully',
      client
    })

  } catch (error) {
    console.error('Update client error:', error)
    res.status(500).json({ error: 'Failed to update client' })
  }
}

const deleteClient = async (req, res) => {
  try {
    const orgId = await getOrgId(req.userId)
    const { id } = req.params

    const existing = await prisma.client.findFirst({
      where: { id, orgId }
    })

    if (!existing) {
      return res.status(404).json({ error: 'Client not found' })
    }

    await prisma.client.delete({
      where: { id }
    })

    res.json({ message: 'Client deleted successfully' })

  } catch (error) {
    console.error('Delete client error:', error)
    res.status(500).json({ error: 'Failed to delete client' })
  }
}

module.exports = {
  getClients,
  createClient,
  getClient,
  updateClient,
  deleteClient
}