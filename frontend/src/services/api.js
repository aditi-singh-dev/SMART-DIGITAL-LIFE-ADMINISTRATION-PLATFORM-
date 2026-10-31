const API_BASE = '/api';

function getAuthHeaders(isFormData = false) {
  const token = localStorage.getItem('gharsahayak_token');
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
}

async function request(endpoint, options = {}) {
  const isFormData = options.body instanceof FormData;
  const headers = {
    ...getAuthHeaders(isFormData),
    ...options.headers
  };

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      if (res.status === 401 && !endpoint.includes('/auth/login')) {
        localStorage.removeItem('gharsahayak_token');
        localStorage.removeItem('gharsahayak_user');
        window.dispatchEvent(new Event('auth:unauthorized'));
      }
      throw new Error(data.message || `Request failed with status ${res.status}`);
    }

    return data;
  } catch (err) {
    throw err;
  }
}

export const api = {
  // Auth
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  getMe: () => request('/auth/me'),
  forgotPassword: (body) => request('/auth/forgot-password', { method: 'POST', body: JSON.stringify(body) }),
  resetPassword: (body) => request('/auth/reset-password', { method: 'POST', body: JSON.stringify(body) }),
  updateProfile: (body) => request('/auth/profile', { method: 'PUT', body: JSON.stringify(body) }),

  // Family
  createFamily: (body) => request('/families', { method: 'POST', body: JSON.stringify(body) }),
  joinFamily: (body) => request('/families/join', { method: 'POST', body: JSON.stringify(body) }),
  getFamily: () => request('/families/current'),
  updateFamily: (body) => request('/families/current', { method: 'PUT', body: JSON.stringify(body) }),
  getHealthScore: () => request('/families/health'),
  removeMember: (memberId) => request(`/families/members/${memberId}`, { method: 'DELETE' }),
  changeMemberRole: (memberId, role) => request(`/families/members/${memberId}/role`, { method: 'PATCH', body: JSON.stringify({ role }) }),

  // Documents
  getDocuments: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/documents${q ? `?${q}` : ''}`);
  },
  getDocumentById: (id) => request(`/documents/${id}`),
  uploadDocument: (formData) => request('/documents', { method: 'POST', body: formData }),
  updateDocument: (id, body) => request(`/documents/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteDocument: (id) => request(`/documents/${id}`, { method: 'DELETE' }),
  classifyDocument: (body) => request('/documents/classify', { method: 'POST', body: JSON.stringify(body) }),

  // Expiry
  getExpiryOverview: () => request('/expiry'),
  setCustomReminder: (body) => request('/expiry/reminders', { method: 'POST', body: JSON.stringify(body) }),

  // Tasks
  getTasks: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/tasks${q ? `?${q}` : ''}`);
  },
  createTask: (body) => request('/tasks', { method: 'POST', body: JSON.stringify(body) }),
  updateTask: (id, body) => request(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  toggleTask: (id) => request(`/tasks/${id}/toggle`, { method: 'PATCH' }),
  deleteTask: (id) => request(`/tasks/${id}`, { method: 'DELETE' }),

  // Workflows
  getWorkflows: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/workflows${q ? `?${q}` : ''}`);
  },
  getWorkflowById: (id) => request(`/workflows/${id}`),
  createWorkflow: (body) => request('/workflows', { method: 'POST', body: JSON.stringify(body) }),
  deleteWorkflow: (id) => request(`/workflows/${id}`, { method: 'DELETE' }),
  addChecklistItem: (wfId, body) => request(`/workflows/${wfId}/items`, { method: 'POST', body: JSON.stringify(body) }),
  updateChecklistItem: (itemId, body) => request(`/workflows/items/${itemId}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteChecklistItem: (itemId) => request(`/workflows/items/${itemId}`, { method: 'DELETE' }),

  // Calendar
  getCalendarEvents: () => request('/calendar'),

  // Notifications
  getNotifications: () => request('/notifications'),
  markNotificationRead: (id) => request(`/notifications/${id}/read`, { method: 'PATCH' }),
  markAllNotificationsRead: () => request('/notifications/read-all', { method: 'PATCH' }),

  // Search & Dashboard & Activity
  globalSearch: (query) => request(`/search?q=${encodeURIComponent(query)}`),
  getDashboardSummary: () => request('/dashboard/summary'),
  getActivityHistory: () => request('/activity')
};
