const { clerkMiddleware, getAuth } = require('@clerk/express')

const requireAuth = (req, res, next) => {
  const { userId } = getAuth(req)
  
  if (!userId) {
    return res.status(401).json({ 
      error: 'Unauthorized. Please log in to continue.' 
    })
  }
  
  req.userId = userId
  next()
}

module.exports = { clerkMiddleware, requireAuth }