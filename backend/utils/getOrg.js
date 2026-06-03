const prisma = require('../config/prisma')

const getOrgId = async (clerkUserId) => {
  const user = await prisma.user.findUnique({
    where: { clerkUserId },
    select: { orgId: true }
  })

  if (!user) throw new Error('User not found')
  return user.orgId
}

module.exports = { getOrgId }