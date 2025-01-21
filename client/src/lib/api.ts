const API_BASE_URL = '/api';

interface ApiOptions {
  method?: string;
  body?: any;
}

async function api(endpoint: string, options: ApiOptions = {}) {
  const apiKey = localStorage.getItem('gemini_api_key');
  
  if (!apiKey) {
    throw new Error('API key is required. Please set it in the settings.');
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-Gemini-API-Key': apiKey,
    },
    ...(options.body ? { body: JSON.stringify(options.body) } : {}),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'An error occurred' }));
    throw new Error(error.error || 'An error occurred');
  }

  return response.json();
}

export const searchQuery = async (query: string) => {
  return api(`/search?q=${encodeURIComponent(query)}`);
};

export const followUpQuery = async (sessionId: string, query: string) => {
  return api('/follow-up', {
    method: 'POST',
    body: { sessionId, query },
  });
};
