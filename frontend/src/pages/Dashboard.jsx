import { UserButton, useUser } from '@clerk/clerk-react'
import { useEffect, useState } from 'react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

function Dashboard() {
  const { user, isLoaded } = useUser()
  const [orgName, setOrgName] = useState('My Agency')
  const [synced, setSynced] = useState(false)

  useEffect(() => {
    const syncUser = async () => {
      if (!isLoaded || !user || synced) return

      try {
        const token = await window.Clerk.session.getToken()

        const response = await axios.post(
          `${API_URL}/api/auth/sync`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )

        if (response.data.organization) {
          setOrgName(response.data.organization.name)
        }

        setSynced(true)
        console.log('User synced:', response.data.message)

      } catch (error) {
        console.error('Sync error:', error)
        setSynced(true)
      }
    }

    syncUser()
  }, [isLoaded, user, synced])

  if (!isLoaded) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-gray-500'>Loading...</div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gray-50'>

      {/* Top navbar */}
      <nav className='bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <div className='w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center'>
            <span className='text-white font-bold text-sm'>R</span>
          </div>
          <div>
            <span className='font-semibold text-gray-900 text-lg'>ReproPulse</span>
            <span className='text-xs text-gray-400 ml-2'>{orgName}</span>
          </div>
        </div>
        <UserButton afterSignOutUrl='/login' />
      </nav>

      {/* Main content */}
      <div className='max-w-6xl mx-auto px-6 py-10'>

        {/* Welcome message */}
        <div className='mb-8'>
          <h1 className='text-2xl font-bold text-gray-900'>
            Welcome back, {user?.firstName || 'there'} 👋
          </h1>
          <p className='text-gray-500 mt-1'>
            Here's what's happening with your clients today.
          </p>
        </div>

        {/* Stats cards */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
          {[
            { label: 'Total Clients', value: '0', icon: '👥' },
            { label: 'Reports Generated', value: '0', icon: '📄' },
            { label: 'Active Integrations', value: '0', icon: '🔌' },
            { label: 'Alerts This Week', value: '0', icon: '🔔' },
          ].map((stat) => (
            <div
              key={stat.label}
              className='bg-white rounded-xl border border-gray-200 p-6'
            >
              <div className='text-2xl mb-2'>{stat.icon}</div>
              <div className='text-3xl font-bold text-gray-900'>{stat.value}</div>
              <div className='text-sm text-gray-500 mt-1'>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Empty state */}
        <div className='bg-white rounded-xl border border-gray-200 p-12 text-center'>
          <div className='text-5xl mb-4'>🚀</div>
          <h2 className='text-xl font-semibold text-gray-900 mb-2'>
            Let's get started!
          </h2>
          <p className='text-gray-500 mb-6'>
            Add your first client to start generating beautiful AI-powered reports.
          </p>
          <button className='bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors'>
            Add your first client
          </button>
        </div>

      </div>
    </div>
  )
}

export default Dashboard