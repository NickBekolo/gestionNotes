import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Créer une instance axios avec configuration par défaut
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token JWT
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur pour gérer les erreurs de réponse
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Services API
export const authService = {
  login: (username, password) =>
    apiClient.post('/token/', { username, password }),
  
  getCurrentUser: () =>
    apiClient.get('/users/me/'),
  
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  },
};

export const departmentService = {
  getAll: () => apiClient.get('/departments/'),
  getById: (id) => apiClient.get(`/departments/${id}/`),
  create: (data) => apiClient.post('/departments/', data),
  update: (id, data) => apiClient.patch(`/departments/${id}/`, data),
  delete: (id) => apiClient.delete(`/departments/${id}/`),
};

export const userService = {
  getAll: (params = {}) => apiClient.get('/users/', { params }),
  getById: (id) => apiClient.get(`/users/${id}/`),
  create: (data) => apiClient.post('/users/', data),
  update: (id, data) => apiClient.patch(`/users/${id}/`, data),
  delete: (id) => apiClient.delete(`/users/${id}/`),
  activateUser: (userId) => apiClient.post('/users/activate_user/', { user_id: userId }),
  deactivateUser: (userId) => apiClient.post('/users/deactivate_user/', { user_id: userId }),
  delegatePrivileges: (adjointId, reason, durationDays) => 
    apiClient.post('/users/delegate_privileges/', { adjoint_id: adjointId, reason, duration_days: durationDays }),
  revokeDelegation: (adjointId) => 
    apiClient.post('/users/revoke_delegation/', { adjoint_id: adjointId }),
};

export const studentService = {
  getAll: (params = {}) => apiClient.get('/students/', { params }),
  getById: (id) => apiClient.get(`/students/${id}/`),
  create: (data) => apiClient.post('/students/', data),
  update: (id, data) => apiClient.patch(`/students/${id}/`, data),
  delete: (id) => apiClient.delete(`/students/${id}/`),
  setSolvability: (studentId, isSolvable) =>
    apiClient.post('/students/set_solvability/', { student_id: studentId, is_solvable: isSolvable }),
};

export const noteService = {
  getAll: (params = {}) => apiClient.get('/notes/', { params }),
  getById: (id) => apiClient.get(`/notes/${id}/`),
  create: (data) => apiClient.post('/notes/', data),
  update: (id, data) => apiClient.patch(`/notes/${id}/`, data),
  delete: (id) => apiClient.delete(`/notes/${id}/`),
  validateNote: (id) => apiClient.post(`/notes/${id}/validate_note/`),
  rejectNote: (id, reason) => apiClient.post(`/notes/${id}/reject_note/`, { reason }),
  getPendingNotes: () => apiClient.get('/notes/pending_notes/'),
};

export const pvService = {
  getAll: (params = {}) => apiClient.get('/pvs/', { params }),
  getById: (id) => apiClient.get(`/pvs/${id}/`),
  create: (data) => apiClient.post('/pvs/', data),
  update: (id, data) => apiClient.patch(`/pvs/${id}/`, data),
  delete: (id) => apiClient.delete(`/pvs/${id}/`),
  visaPV: (id) => apiClient.post(`/pvs/${id}/visa_pv/`),
  printPV: (id) => apiClient.post(`/pvs/${id}/print_pv/`),
  setPaymentStatus: (id, status) => apiClient.post(`/pvs/${id}/set_payment_status/`, { status }),
};

export const auditLogService = {
  getAll: (params = {}) => apiClient.get('/audit-logs/', { params }),
  getById: (id) => apiClient.get(`/audit-logs/${id}/`),
};

export default apiClient;
