const prisma = require('../config/prisma')

const syncUser = async (req, res) => {
  try {
    const { userId } = req

    const existingUser = await prisma.user.findUnique({
      where: { clerkUserId: userId },
      include: { org: true }
    })

    if (existingUser) {
      return res.json({
        message: 'User already exists',
        user: existingUser,
        organization: existingUser.org
      })
    }

    const org = await prisma.organization.create({
      data: {
        name: 'My Agency',
        clerkUserId: userId,
      }
    })

    const user = await prisma.user.create({
      data: {
        clerkUserId: userId,
        email: '',
        role: 'owner',
        orgId: org.id,
      }
    })

    return res.status(201).json({
      message: 'User and organization created successfully',
      user,
      organization: org
    })

  } catch (error) {
    console.error('Sync user error:', error)
    return res.status(500).json({ 
      error: 'Failed to sync user',
      details: error.message
    })
  }
}

module.exports = { syncUser }