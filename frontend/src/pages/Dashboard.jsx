import { UserButton, useUser } from '@clerk/clerk-react'

function Dashboard() {
  const { user } = useUser()

  return (
    <div className='min-h-screen bg-gray-50'>
      <nav className='bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <div className='w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center'>
            <span className='text-white font-bold text-sm'>R</span>
          </div>
          <span className='font-semibold text-gray-900 text-lg'>ReproPulse</span>
        </div>
        <UserButton afterSignOutUrl='/login' />
      </nav>

      <div className='max-w-6xl mx-auto px-6 py-10'>
        <div className='mb-8'>
          <h1 className='text-2xl font-bold text-gray-900'>
            Welcome back, {user?.firstName || 'there'} 👋
          </h1>
          <p className='text-gray-500 mt-1'>
            Here's what's happening with your clients today.
          </p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
          {[
            { label: 'Total Clients', value: '0', icon: '👥' },
            { label: 'Reports Generated', value: '0', icon: '📄' },
            { label: 'Active Integrations', value: '0', icon: '🔌' },
            { label: 'Alerts This Week', value: '0', icon: '🔔' },
          ].map((stat) => (
            <div key={stat.label} className='bg-white rounded-xl border border-gray-200 p-6'>
              <div className='text-2xl mb-2'>{stat.icon}</div>
              <div className='text-3xl font-bold text-gray-900'>{stat.value}</div>
              <div className='text-sm text-gray-500 mt-1'>{stat.label}</div>
            </div>
          ))}
        </div>

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