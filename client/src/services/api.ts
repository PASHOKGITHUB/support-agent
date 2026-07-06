const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Get the auth headers.
 */
const getHeaders = (isMultipart = false) => {
  const token = localStorage.getItem('token');
  const headers: HeadersInit = {};
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  
  return headers;
};

/**
 * Handle API response errors.
 */
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    let errorMessage = 'Something went wrong';
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch (e) {
      // JSON parsing failed, use fallback
    }
    throw new Error(errorMessage);
  }
  return response.json();
};

export const api = {
  get: async (endpoint: string) => {
    const separator = endpoint.includes('?') ? '&' : '?';
    const res = await fetch(`${API_URL}${endpoint}${separator}_t=${Date.now()}`, {
      method: 'GET',
      headers: {
        ...getHeaders(),
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache'
      }
    });
    return handleResponse(res);
  },

  post: async (endpoint: string, body: any) => {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body)
    });
    return handleResponse(res);
  },

  put: async (endpoint: string, body: any) => {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(body)
    });
    return handleResponse(res);
  },

  delete: async (endpoint: string) => {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  upload: async (endpoint: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: getHeaders(true),
      body: formData
    });
    return handleResponse(res);
  },

  getStreamUrl: (endpoint: string) => {
    return `${API_URL}${endpoint}`;
  }
};
