const { BetaAnalyticsDataClient } = require('@google-analytics/data')
const { google } = require('googleapis')
const prisma = require('../config/prisma')
const { getOAuthClient } = require('./googleAuth')

const refreshAccessToken = async (integration) => {
  const oauth2Client = getOAuthClient()
  oauth2Client.setCredentials({
    access_token: integration.accessToken,
    refresh_token: integration.refreshToken,
  })

  const { credentials } = await oauth2Client.refreshAccessToken()

  await prisma.integration.update({
    where: { id: integration.id },
    data: {
      accessToken: credentials.access_token,
      tokenExpiry: credentials.expiry_date
        ? new Date(credentials.expiry_date)
        : null,
    }
  })

  return credentials.access_token
}

const getValidAccessToken = async (integration) => {
  const now = new Date()
  const expiry = integration.tokenExpiry
    ? new Date(integration.tokenExpiry)
    : null

  if (!expiry || expiry <= now) {
    return await refreshAccessToken(integration)
  }

  return integration.accessToken
}

const fetchGA4Data = async (integration, propertyId, startDate, endDate) => {
  const accessToken = await getValidAccessToken(integration)

  const analyticsDataClient = new BetaAnalyticsDataClient({
    authClient: (() => {
      const auth = getOAuthClient()
      auth.setCredentials({ access_token: accessToken })
      return auth
    })()
  })

  const [response] = await analyticsDataClient.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate, endDate }],
    metrics: [
      { name: 'sessions' },
      { name: 'totalUsers' },
      { name: 'newUsers' },
      { name: 'bounceRate' },
      { name: 'averageSessionDuration' },
      { name: 'screenPageViews' },
      { name: 'conversions' },
    ],
    dimensions: [
      { name: 'date' },
    ],
  })

  const dailyData = response.rows?.map(row => ({
    date: row.dimensionValues[0].value,
    sessions: parseInt(row.metricValues[0].value) || 0,
    totalUsers: parseInt(row.metricValues[1].value) || 0,
    newUsers: parseInt(row.metricValues[2].value) || 0,
    bounceRate: parseFloat(row.metricValues[3].value) || 0,
    avgSessionDuration: parseFloat(row.metricValues[4].value) || 0,
    pageViews: parseInt(row.metricValues[5].value) || 0,
    conversions: parseInt(row.metricValues[6].value) || 0,
  })) || []

  return dailyData
}

const fetchTopPages = async (integration, propertyId, startDate, endDate) => {
  const accessToken = await getValidAccessToken(integration)

  const analyticsDataClient = new BetaAnalyticsDataClient({
    authClient: (() => {
      const auth = getOAuthClient()
      auth.setCredentials({ access_token: accessToken })
      return auth
    })()
  })

  const [response] = await analyticsDataClient.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate, endDate }],
    metrics: [
      { name: 'sessions' },
      { name: 'screenPageViews' },
      { name: 'bounceRate' },
    ],
    dimensions: [
      { name: 'pagePath' },
      { name: 'pageTitle' },
    ],
    orderBys: [
      {
        metric: { metricName: 'sessions' },
        desc: true,
      }
    ],
    limit: 10,
  })

  const topPages = response.rows?.map(row => ({
    path: row.dimensionValues[0].value,
    title: row.dimensionValues[1].value,
    sessions: parseInt(row.metricValues[0].value) || 0,
    pageViews: parseInt(row.metricValues[1].value) || 0,
    bounceRate: parseFloat(row.metricValues[2].value) || 0,
  })) || []

  return topPages
}

const syncGA4ForClient = async (clientId, orgId, propertyId) => {
  try {
    console.log(`Syncing GA4 for client: ${clientId}`)

    const integration = await prisma.integration.findFirst({
      where: {
        clientId,
        type: 'GOOGLE_ANALYTICS',
        status: 'connected'
      }
    })

    if (!integration) {
      console.log(`No GA4 integration found for client: ${clientId}`)
      return null
    }

    const endDate = 'today'
    const startDate = '30daysAgo'

    const [dailyData, topPages] = await Promise.all([
      fetchGA4Data(integration, propertyId, startDate, endDate),
      fetchTopPages(integration, propertyId, startDate, endDate),
    ])

    const totals = dailyData.reduce((acc, day) => ({
      sessions: acc.sessions + day.sessions,
      totalUsers: acc.totalUsers + day.totalUsers,
      newUsers: acc.newUsers + day.newUsers,
      pageViews: acc.pageViews + day.pageViews,
      conversions: acc.conversions + day.conversions,
      avgBounceRate: acc.avgBounceRate + day.bounceRate,
    }), {
      sessions: 0,
      totalUsers: 0,
      newUsers: 0,
      pageViews: 0,
      conversions: 0,
      avgBounceRate: 0,
    })

    if (dailyData.length > 0) {
      totals.avgBounceRate = totals.avgBounceRate / dailyData.length
    }

    const snapshotData = {
      totals,
      dailyData,
      topPages,
      propertyId,
      syncedAt: new Date().toISOString(),
    }

    const existingSnapshot = await prisma.dataSnapshot.findFirst({
      where: {
        clientId,
        type: 'GOOGLE_ANALYTICS',
      }
    })

    if (existingSnapshot) {
      await prisma.dataSnapshot.update({
        where: { id: existingSnapshot.id },
        data: {
          data: snapshotData,
          date: new Date(),
        }
      })
    } else {
      await prisma.dataSnapshot.create({
        data: {
          type: 'GOOGLE_ANALYTICS',
          date: new Date(),
          data: snapshotData,
          clientId,
          orgId,
        }
      })
    }

    await prisma.integration.update({
      where: { id: integration.id },
      data: { updatedAt: new Date() }
    })

    console.log(`GA4 sync complete for client: ${clientId}`)
    return snapshotData

  } catch (error) {
    console.error(`GA4 sync error for client ${clientId}:`, error.message)
    throw error
  }
}

module.exports = {
  syncGA4ForClient,
  fetchGA4Data,
  fetchTopPages
}