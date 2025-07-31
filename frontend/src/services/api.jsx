import axios from "axios"

// VITE_API_URL
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem("refreshToken")
        if (!refreshToken) {
          window.location.href = "/login"
          return Promise.reject(error)
        }

        const response = await axios.post("http://localhost:8000/api/token/refresh/", {
          refresh: refreshToken,
        })

        localStorage.setItem("accessToken", response.data.access)
        originalRequest.headers.Authorization = `Bearer ${response.data.access}`

        return api(originalRequest)
      } catch (refreshError) {
        localStorage.removeItem("accessToken")
        localStorage.removeItem("refreshToken")
        window.location.href = "/login"
        return Promise.reject(refreshError)
      }
    }
    return Promise.reject(error)
  },
)

export const userService = {
  getAll: () => api.get("/api/users/"),
  getById: (id) => api.get(`/api/users/${id}/`),
  getByDni: (dni) => api.get(`/api/users/by_dni/?dni=${dni}`),
  create: (data) => api.post("/api/users/", data),
  update: (id, data) => api.put(`/api/users/${id}/`, data),
  delete: (id) => api.delete(`/api/users/${id}/`),
}

export const attentionPointService = {
  getAll: () => api.get("/api/attention-points/"), 
  create: (data) => api.post("/api/attention-points/", data),
  delete: (id) => api.delete(`/api/attention-points/${id}/`),
}

export const ticketService = {
  getAll: () => api.get("/api/tickets/"),
  getById: (id) => api.get(`/api/tickets/${id}/`),
  getAllTickets: () => api.get("/api/tickets/all/"),
  create: (data) => api.post("/api/tickets/", data),
  assignToPoint: (ticketId, pointId) => api.post("/api/tickets/assign/", {
    ticket_id: ticketId,
    attention_point_id: pointId
  }),
  unassignTicket: (ticketId) => api.post("/api/tickets/unassign/", {
    ticket_id: ticketId
  })
}

export const publicityService = {
  getAll: () => api.get("/api/publicity/"),
  getById: (id) => api.get(`/api/publicity/${id}/`),
  create: (formData) => {
    return api.post("/api/publicity/", formData, {
      headers: {'Content-Type': 'multipart/form-data',}});
    },
  delete: (id) => api.delete(`/api/publicity/${id}/`),
}