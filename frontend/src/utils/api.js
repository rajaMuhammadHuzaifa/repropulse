import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const getToken = async () => {
  return await window.Clerk.session.getToken()
}

const api = {
  get: async (endpoint) => {
    const token = await getToken()
    const response = await axios.get(`${API_URL}${endpoint}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    return response.data
  },

  post: async (endpoint, data) => {
    const token = await getToken()
    const response = await axios.post(`${API_URL}${endpoint}`, data, {
      headers: { Authorization: `Bearer ${token}` }
    })
    return response.data
  },

  put: async (endpoint, data) => {
    const token = await getToken()
    const response = await axios.put(`${API_URL}${endpoint}`, data, {
      headers: { Authorization: `Bearer ${token}` }
    })
    return response.data
  },

  delete: async (endpoint) => {
    const token = await getToken()
    const response = await axios.delete(`${API_URL}${endpoint}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    return response.data
  }
}

export default api