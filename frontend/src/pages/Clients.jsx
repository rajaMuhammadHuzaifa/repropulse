import { useState, useEffect } from 'react'
import api from '../utils/api'

function Clients() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingClient, setEditingClient] = useState(null)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '',
    email: '',
    website: '',
    industry: ''
  })

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      setLoading(true)
      const data = await api.get('/api/clients')
      setClients(data.clients)
    } catch (err) {
      setError('Failed to load clients')
    } finally {
      setLoading(false)
    }
  }

  const openAddModal = () => {
    setEditingClient(null)
    setForm({ name: '', email: '', website: '', industry: '' })
    setError('')
    setShowModal(true)
  }

  const openEditModal = (client) => {
    setEditingClient(client)
    setForm({
      name: client.name || '',
      email: client.email || '',
      website: client.website || '',
      industry: client.industry || ''
    })
    setError('')
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingClient(null)
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!form.name.trim()) {
      setError('Client name is required')
      return
    }

    try {
      if (editingClient) {
        await api.put(`/api/clients/${editingClient.id}`, form)
      } else {
        await api.post('/api/clients', form)
      }
      await fetchClients()
      closeModal()
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong')
    }
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return
    try {
      await api.delete(`/api/clients/${id}`)
      await fetchClients()
    } catch (err) {
      alert('Failed to delete client')
    }
  }

  const industries = [
    'E-commerce', 'SaaS', 'Healthcare', 'Real Estate',
    'Finance', 'Education', 'Restaurant', 'Fashion',
    'Technology', 'Marketing Agency', 'Other'
  ]

  return (
    <div className='min-h-screen bg-gray-50'>

      {/* Navbar */}
      <nav className='bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <div className='w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center'>
            <span className='text-white font-bold text-sm'>R</span>
          </div>
          <span className='font-semibold text-gray-900 text-lg'>ReproPulse</span>
        </div>
        <div className='flex items-center gap-4'>
          <a href='/dashboard' className='text-gray-500 hover:text-gray-900 text-sm'>
            Dashboard
          </a>
          <a href='/clients' className='text-blue-600 font-medium text-sm'>
            Clients
          </a>
        </div>
      </nav>

      <div className='max-w-6xl mx-auto px-6 py-10'>

        {/* Header */}
        <div className='flex items-center justify-between mb-8'>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>Clients</h1>
            <p className='text-gray-500 mt-1'>
              Manage your clients and their reporting settings.
            </p>
          </div>
          <button
            onClick={openAddModal}
            className='bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2'
          >
            <span>+</span> Add Client
          </button>
        </div>

        {/* Loading state */}
        {loading && (
          <div className='bg-white rounded-xl border border-gray-200 p-12 text-center'>
            <div className='text-gray-400 text-lg'>Loading clients...</div>
          </div>
        )}

        {/* Empty state */}
        {!loading && clients.length === 0 && (
          <div className='bg-white rounded-xl border border-gray-200 p-12 text-center'>
            <div className='text-5xl mb-4'>👥</div>
            <h2 className='text-xl font-semibold text-gray-900 mb-2'>
              No clients yet
            </h2>
            <p className='text-gray-500 mb-6'>
              Add your first client to start generating reports.
            </p>
            <button
              onClick={openAddModal}
              className='bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors'
            >
              Add your first client
            </button>
          </div>
        )}

        {/* Clients table */}
        {!loading && clients.length > 0 && (
          <div className='bg-white rounded-xl border border-gray-200 overflow-hidden'>
            <table className='w-full'>
              <thead>
                <tr className='border-b border-gray-200 bg-gray-50'>
                  <th className='text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Client
                  </th>
                  <th className='text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Industry
                  </th>
                  <th className='text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Website
                  </th>
                  <th className='text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Added
                  </th>
                  <th className='text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-200'>
                {clients.map((client) => (
                  <tr key={client.id} className='hover:bg-gray-50 transition-colors'>
                    <td className='px-6 py-4'>
                      <div className='flex items-center gap-3'>
                        <div className='w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0'>
                          <span className='text-blue-600 font-semibold text-sm'>
                            {client.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className='font-medium text-gray-900'>
                            {client.name}
                          </div>
                          {client.email && (
                            <div className='text-sm text-gray-500'>
                              {client.email}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className='px-6 py-4'>
                      {client.industry ? (
                        <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>
                          {client.industry}
                        </span>
                      ) : (
                        <span className='text-gray-400 text-sm'>—</span>
                      )}
                    </td>
                    <td className='px-6 py-4'>
                      {client.website ? (
                        <a
                          href={client.website}
                          target='_blank'
                          rel='noreferrer'
                          className='text-blue-600 hover:underline text-sm'
                        >
                          {client.website.replace('https://', '').replace('http://', '')}
                        </a>
                      ) : (
                        <span className='text-gray-400 text-sm'>—</span>
                      )}
                    </td>
                    <td className='px-6 py-4 text-sm text-gray-500'>
                      {new Date(client.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </td>
                    <td className='px-6 py-4'>
                      <div className='flex items-center justify-end gap-2'>
                        <button
                          onClick={() => openEditModal(client)}
                          className='text-gray-400 hover:text-blue-600 transition-colors px-2 py-1 rounded text-sm'
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(client.id, client.name)}
                          className='text-gray-400 hover:text-red-600 transition-colors px-2 py-1 rounded text-sm'
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Table footer */}
            <div className='px-6 py-3 bg-gray-50 border-t border-gray-200'>
              <p className='text-sm text-gray-500'>
                {clients.length} client{clients.length !== 1 ? 's' : ''} total
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4'>
          <div className='bg-white rounded-xl shadow-xl w-full max-w-md'>

            {/* Modal header */}
            <div className='flex items-center justify-between p-6 border-b border-gray-200'>
              <h2 className='text-lg font-semibold text-gray-900'>
                {editingClient ? 'Edit Client' : 'Add New Client'}
              </h2>
              <button
                onClick={closeModal}
                className='text-gray-400 hover:text-gray-600 transition-colors text-xl'
              >
                ×
              </button>
            </div>

            {/* Modal form */}
            <form onSubmit={handleSubmit} className='p-6'>

              {error && (
                <div className='mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm'>
                  {error}
                </div>
              )}

              <div className='space-y-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Client Name <span className='text-red-500'>*</span>
                  </label>
                  <input
                    type='text'
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder='e.g. Acme Corporation'
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Email
                  </label>
                  <input
                    type='email'
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder='client@example.com'
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Website
                  </label>
                  <input
                    type='url'
                    value={form.website}
                    onChange={(e) => setForm({ ...form, website: e.target.value })}
                    placeholder='https://example.com'
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Industry
                  </label>
                  <select
                    value={form.industry}
                    onChange={(e) => setForm({ ...form, industry: e.target.value })}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  >
                    <option value=''>Select industry</option>
                    {industries.map((ind) => (
                      <option key={ind} value={ind}>{ind}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Modal footer */}
              <div className='flex items-center justify-end gap-3 mt-6'>
                <button
                  type='button'
                  onClick={closeModal}
                  className='px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  className='bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors'
                >
                  {editingClient ? 'Save Changes' : 'Add Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Clients