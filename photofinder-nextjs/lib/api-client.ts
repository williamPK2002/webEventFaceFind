const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

export interface ApiResponse<T> {
  data?: T
  error?: string
  status: number
}

async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
  try {
    const url = `${API_BASE}${endpoint}`
    const token = localStorage.getItem("auth_token")

    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options?.headers,
      },
    })

    const data = await response.json()

    return {
      data: response.ok ? data : undefined,
      error: response.ok ? undefined : data.error,
      status: response.status,
    }
  } catch (error) {
    return {
      error: "Network error",
      status: 0,
    }
  }
}

export const apiClient = {
  // Auth
  exchangeOIDC: (code: string, state: string) =>
    apiCall("/auth/oidc/exchange", {
      method: "POST",
      body: JSON.stringify({ code, state }),
    }),

  // Events
  getEvents: () => apiCall("/events"),
  getEvent: (id: string) => apiCall(`/events/${id}`),
  createEvent: (data: any) => apiCall("/events", { method: "POST", body: JSON.stringify(data) }),
  updateEvent: (id: string, data: any) => apiCall(`/events/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteEvent: (id: string) => apiCall(`/events/${id}`, { method: "DELETE" }),
  uploadPhotos: (eventId: string, files: File[]) => {
    const formData = new FormData()
    files.forEach((file) => formData.append("files", file))
    return fetch(`${API_BASE}/events/${eventId}/upload`, {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
      },
    }).then((r) => r.json())
  },

  // Search
  searchByFace: async (imageData: string, eventId?: string) => {
    try {
      // Convert base64 to blob
      const response = await fetch(imageData)
      const blob = await response.blob()

      // Create FormData
      const formData = new FormData()
      formData.append('file', blob, 'search-image.jpg')
      if (eventId) {
        formData.append('eventId', eventId)
      }

      // Send as multipart/form-data
      const res = await fetch(`${API_BASE}/search/face`, {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      console.log('Backend response:', data)

      return { data, error: null }
    } catch (error) {
      console.error('searchByFace error:', error)
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  },

  // Photos
  getAllPhotos: () => apiCall("/photos"),
  getMyPhotos: () => apiCall("/me/my-photos"),
  deletePhoto: (photoId: string) =>
    apiCall(`/photos/${photoId}`, {
      method: "DELETE",
    }),
  requestPhotoRemoval: (photoId: string, requestType: string, userName: string, userEmail: string, reason?: string) =>
    apiCall("/removal-requests", {
      method: "POST",
      body: JSON.stringify({ photoId, requestType, userName, userEmail, reason }),
    }),
  getRemovalRequests: () => apiCall("/removal-requests"),
  deleteRemovalRequest: (requestId: string) =>
    apiCall(`/removal-requests/${requestId}`, {
      method: "DELETE",
    }),

  // Deliveries
  triggerDelivery: (userId: string, eventId: string, deliveryMethod: string) =>
    apiCall("/delivery/trigger", {
      method: "POST",
      body: JSON.stringify({ userId, eventId, deliveryMethod }),
    }),

  // Privacy
  optOut: (userId: string, optOutType: string, reason?: string) =>
    apiCall(`/persons/${userId}/opt-out`, {
      method: "POST",
      body: JSON.stringify({ optOutType, reason }),
    }),

  // Analytics
  getAnalytics: () => apiCall("/analytics"),
}
