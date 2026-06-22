export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
    me: '/auth/me',
    refresh: '/auth/refresh',
  },
  requests: {
    base: '/requests',
    byId: (id: number) => `/requests/${id}`,
    signature: (id: number) => `/requests/${id}/signature`,
    approve: (id: number) => `/requests/${id}/approve`,
    reject: (id: number) => `/requests/${id}/reject`,
  },
} as const;
