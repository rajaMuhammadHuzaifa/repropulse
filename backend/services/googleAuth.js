const { google } = require('googleapis')

const getOAuthClient = () => {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  )
}

const getAuthUrl = (clientId) => {
  const oauth2Client = getOAuthClient()
  
  const scopes = [
    'https://www.googleapis.com/auth/analytics.readonly',
    'https://www.googleapis.com/auth/webmasters.readonly',
  ]

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent',
    state: clientId
  })

  return url
}

const getTokensFromCode = async (code) => {
  const oauth2Client = getOAuthClient()
  const { tokens } = await oauth2Client.getToken(code)
  return tokens
}

const getAuthenticatedClient = (tokens) => {
  const oauth2Client = getOAuthClient()
  oauth2Client.setCredentials(tokens)
  return oauth2Client
}

module.exports = {
  getOAuthClient,
  getAuthUrl,
  getTokensFromCode,
  getAuthenticatedClient
}