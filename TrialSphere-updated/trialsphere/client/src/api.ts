import axios from 'axios'
export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api', withCredentials: true })
export const getStats = async () => (await api.get('/dashboard/stats')).data
export const getStudies = async (q = '', status = 'All') => (await api.get('/studies', { params: { q, status } })).data
export const getSites = async () => (await api.get('/sites')).data
export const getParticipants = async () => (await api.get('/participants')).data.data
